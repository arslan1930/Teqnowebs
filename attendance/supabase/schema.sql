-- Teqnowebs Attendance — run in Supabase SQL editor
-- attendance.teqnowebs.com

-- Core punch events
create table if not exists public.attendance_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('check_in', 'check_out')),
  note text,
  client_ip text,
  is_manual boolean not null default false,
  edited_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

-- Backfill columns if table already existed
alter table public.attendance_events add column if not exists client_ip text;
alter table public.attendance_events add column if not exists is_manual boolean not null default false;
alter table public.attendance_events add column if not exists edited_by uuid references auth.users (id) on delete set null;

create index if not exists attendance_events_user_created_idx
  on public.attendance_events (user_id, created_at desc);

-- Staff profiles (link Auth users → role + female/male group)
create table if not exists public.staff_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null,
  role text not null default 'staff' check (role in ('admin', 'staff')),
  staff_group text not null default 'male' check (staff_group in ('female', 'male')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Office hours per group
create table if not exists public.office_timings (
  staff_group text primary key check (staff_group in ('female', 'male')),
  start_time time not null,
  end_time time not null,
  late_after_minutes int not null default 15 check (late_after_minutes >= 0)
);

insert into public.office_timings (staff_group, start_time, end_time, late_after_minutes)
values
  ('female', '09:00', '17:00', 15),
  ('male', '09:00', '18:00', 15)
on conflict (staff_group) do nothing;

-- Company holidays (announcements)
create table if not exists public.company_holidays (
  id uuid primary key default gen_random_uuid(),
  holiday_date date not null unique,
  title text not null,
  note text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

-- Personal leave (max 1 approved per user per calendar month — enforced in app + partial unique index)
create table if not exists public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  leave_date date not null,
  reason text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users (id) on delete set null,
  unique (user_id, leave_date)
);

create unique index if not exists leave_one_approved_per_month
  on public.leave_requests (user_id, date_trunc('month', leave_date::timestamp))
  where status = 'approved';

-- App settings (timezone + documented office IPs)
create table if not exists public.app_settings (
  id int primary key default 1 check (id = 1),
  timezone text not null default 'Asia/Karachi',
  allowed_ips text[] not null default '{}',
  updated_at timestamptz not null default now()
);

insert into public.app_settings (id, timezone, allowed_ips)
values (1, 'Asia/Karachi', '{}')
on conflict (id) do nothing;

-- Helpers for RLS
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.staff_profiles p
    where p.user_id = auth.uid() and p.role = 'admin' and p.active = true
  );
$$;

alter table public.attendance_events enable row level security;
alter table public.staff_profiles enable row level security;
alter table public.office_timings enable row level security;
alter table public.company_holidays enable row level security;
alter table public.leave_requests enable row level security;
alter table public.app_settings enable row level security;

-- attendance_events
drop policy if exists "Staff can read own attendance" on public.attendance_events;
drop policy if exists "Staff can insert own attendance" on public.attendance_events;
drop policy if exists "Admin can read all attendance" on public.attendance_events;
drop policy if exists "Admin manage attendance" on public.attendance_events;

create policy "Staff can read own attendance"
  on public.attendance_events for select to authenticated
  using (auth.uid() = user_id or public.is_admin());

create policy "Staff can insert own attendance"
  on public.attendance_events for insert to authenticated
  with check (
    (auth.uid() = user_id and coalesce(is_manual, false) = false)
    or public.is_admin()
  );

create policy "Admin manage attendance"
  on public.attendance_events for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- staff_profiles
drop policy if exists "Users read own profile or admin reads all" on public.staff_profiles;
drop policy if exists "Admin updates profiles" on public.staff_profiles;
drop policy if exists "Admin inserts profiles" on public.staff_profiles;

create policy "Users read own profile or admin reads all"
  on public.staff_profiles for select to authenticated
  using (auth.uid() = user_id or public.is_admin());

create policy "Admin updates profiles"
  on public.staff_profiles for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admin inserts profiles"
  on public.staff_profiles for insert to authenticated
  with check (public.is_admin() or auth.uid() = user_id);

-- office_timings
drop policy if exists "Authenticated read timings" on public.office_timings;
drop policy if exists "Admin update timings" on public.office_timings;

create policy "Authenticated read timings"
  on public.office_timings for select to authenticated
  using (true);

create policy "Admin update timings"
  on public.office_timings for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- company_holidays
drop policy if exists "Authenticated read holidays" on public.company_holidays;
drop policy if exists "Admin manage holidays" on public.company_holidays;

create policy "Authenticated read holidays"
  on public.company_holidays for select to authenticated
  using (true);

create policy "Admin manage holidays"
  on public.company_holidays for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- leave_requests
drop policy if exists "Staff read own leaves or admin all" on public.leave_requests;
drop policy if exists "Staff insert own leave" on public.leave_requests;
drop policy if exists "Admin update leave status" on public.leave_requests;

create policy "Staff read own leaves or admin all"
  on public.leave_requests for select to authenticated
  using (auth.uid() = user_id or public.is_admin());

create policy "Staff insert own leave"
  on public.leave_requests for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Admin update leave status"
  on public.leave_requests for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- app_settings
drop policy if exists "Authenticated read settings" on public.app_settings;
drop policy if exists "Admin update settings" on public.app_settings;

create policy "Authenticated read settings"
  on public.app_settings for select to authenticated
  using (true);

create policy "Admin update settings"
  on public.app_settings for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- After creating Auth users, insert staff_profiles rows, e.g.:
-- insert into staff_profiles (user_id, full_name, email, role, staff_group)
-- values ('USER_UUID', 'Admin Name', 'admin@teqnowebs.com', 'admin', 'male');
