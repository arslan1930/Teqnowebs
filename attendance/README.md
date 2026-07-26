# Teqnowebs Attendance (`attendance.teqnowebs.com`)

Staff login + check-in / check-out for ~15 people, with an **admin panel** for:

- Female / Male office timings (separate start/end + late-after)
- Company holiday announcements
- Personal leave approvals (**1 approved leave per calendar month**)
- Today roster (present / late / absent)
- Attendance report + **CSV export**
- Manual punch corrections with admin note
- Settings: timezone (default `Asia/Karachi`) + allowed office IP list (documented + `.htaccess` snippet)
- Demo mode: add staff / reset password locally

**Access:** office network only (IP allowlist). See [`OFFICE_IP.md`](OFFICE_IP.md).  
Main site `teqnowebs.com` stays worldwide.

## Local

```bash
cd attendance
npm install
cp .env.example .env.local   # optional Supabase
npm run dev
```

Open http://127.0.0.1:3001/

### Demo logins (no Supabase) — password `attendance123`

| Email | Role | Group |
| --- | --- | --- |
| `admin@teqnowebs.com` | Admin | Male |
| `staff@teqnowebs.com` | Staff | Female |
| `hr@teqnowebs.com` | Staff | Male |

Admin UI: `/admin/` after signing in as admin.

## Production (Supabase)

1. Create a Supabase project.
2. Run the full [`supabase/schema.sql`](supabase/schema.sql) in the SQL editor.
3. Authentication → Users → create staff + at least one admin (email/password).
4. Insert matching `staff_profiles` rows (set `role = 'admin'` for managers, `staff_group` = `female` or `male`).
5. Copy URL + anon key into `.env.local`.
6. Set office public IP in [`public/.htaccess`](public/.htaccess) (and optionally save IPs in Admin → Settings).
7. `npm run build` → upload `out/` into Hostinger `public_html/attendance/`.

### Hostinger limits (important)

Static Hostinger cannot safely hold a Supabase **service role** key, so:

- **Create Auth users / reset live passwords** in the Supabase dashboard (demo mode can add/reset locally).
- **IP allowlist** is enforced by Apache `.htaccess` on every request (including login). Admin Settings stores the IP list and shows the snippet to paste into Hostinger.

## Hostinger

| | Main site | Attendance |
| --- | --- | --- |
| URL | `https://teqnowebs.com/` | `https://attendance.teqnowebs.com/` |
| Folder | `public_html/` | `public_html/attendance/` |
| IP lock | none | office IP in attendance `.htaccess` |

Zip for upload: [`../deploy/teqnowebs-attendance.zip`](../deploy/teqnowebs-attendance.zip)
