# Teqnowebs Attendance (`attendance.teqnowebs.com`)

Staff login + check-in / check-out for company attendance.

## Local

```bash
cd attendance
npm install
cp .env.example .env.local   # optional: add Supabase for production auth
npm run dev
```

Open http://127.0.0.1:3001/

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
5. `npm run build`

## Hostinger subdomain

1. hPanel → **Domains** → **Subdomains** → create `attendance` for `teqnowebs.com`.
2. Document root / folder: `public_html/attendance` (Hostinger often creates this automatically).
3. From this folder: `npm run build` → upload everything inside `attendance/out/` into `public_html/attendance/`.
4. DNS: ensure `attendance.teqnowebs.com` points to your Hostinger hosting (usually automatic with Hostinger DNS).
5. Visit `https://attendance.teqnowebs.com/`

Do **not** put this app inside the main marketing site’s `public_html` root mix of routes — keep it in the subdomain folder only.
