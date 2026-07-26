# Teqnowebs Attendance (`attendance.teqnowebs.com`)

Staff login + check-in / check-out for company attendance.

**Access:** office network only (IP allowlist). See [`OFFICE_IP.md`](OFFICE_IP.md).  
The main marketing site `teqnowebs.com` stays available worldwide.

## Local

```bash
cd attendance
npm install
cp .env.example .env.local   # optional: add Supabase for production auth
npm run dev
```

Open http://127.0.0.1:3001/

Local dev is not IP-locked (only the Hostinger `.htaccess` enforce that).

### Demo login (no Supabase)

- Email: `staff@teqnowebs.com`
- Password: `attendance123`

## Production (Supabase)

1. Create a Supabase project.
2. Run [`supabase/schema.sql`](supabase/schema.sql) in the SQL editor.
3. Authentication → Users → add each staff member (email + password). Optionally set `full_name` in user metadata.
4. Copy project URL + anon key into `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Set your office public IP in [`public/.htaccess`](public/.htaccess) (replace `REPLACE_WITH_OFFICE_PUBLIC_IP`).
6. `npm run build`

## Hostinger subdomain (office-only)

| | Main site | Attendance |
| --- | --- | --- |
| URL | `https://teqnowebs.com/` | `https://attendance.teqnowebs.com/` |
| Folder | `public_html/` | `public_html/attendance/` |
| IP lock | none | office public IP in attendance `.htaccess` |

1. hPanel → **Domains** → **Subdomains** → create `attendance` for `teqnowebs.com`.
2. Document root / folder: `public_html/attendance`.
3. On office Wi‑Fi, get your public IP ([whatismyip.com](https://whatismyip.com)) and set it in `public/.htaccess` (see [`OFFICE_IP.md`](OFFICE_IP.md)).
4. `npm run build` → upload everything inside `attendance/out/` into `public_html/attendance/`.
5. Confirm the deployed `.htaccess` still has your real office IP (not the placeholder).
6. From office Wi‑Fi: open `https://attendance.teqnowebs.com/`. From elsewhere you should see the office-only 403 page.

Do **not** put IP allowlist rules on the main site `public_html/.htaccess`.  
Do **not** mix this app into the main marketing site root — keep it in the subdomain folder only.
