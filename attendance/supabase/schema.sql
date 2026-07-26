-- Run in Supabase SQL editor for attendance.teqnowebs.com

create table if not exists public.attendance_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('check_in', 'check_out')),
  note text,
  created_at timestamptz not null default now()
);

create index if not exists attendance_events_user_created_idx
  on public.attendance_events (user_id, created_at desc);

alter table public.attendance_events enable row level security;

create policy "Staff can read own attendance"
  on public.attendance_events
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Staff can insert own attendance"
  on public.attendance_events
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Create staff users in Authentication → Users (email + password).
-- Optional: set user_metadata.full_name for display on the dashboard.
