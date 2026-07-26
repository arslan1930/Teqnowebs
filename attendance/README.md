# Teqnowebs Attendance (`attendance.teqnowebs.com`)

Staff login + check-in / check-out, with an **admin panel** for:

- Female / Male office timings (separate)
- Company holiday announcements
- Personal leave approvals (**1 approved leave per month**)

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
6. Set office public IP in [`public/.htaccess`](public/.htaccess).
7. `npm run build` → upload `out/` into Hostinger `public_html/attendance/`.

## Hostinger

| | Main site | Attendance |
| --- | --- | --- |
| URL | `https://teqnowebs.com/` | `https://attendance.teqnowebs.com/` |
| Folder | `public_html/` | `public_html/attendance/` |
| IP lock | none | office IP in attendance `.htaccess` |

Zip for upload: [`../deploy/teqnowebs-attendance.zip`](../deploy/teqnowebs-attendance.zip)
