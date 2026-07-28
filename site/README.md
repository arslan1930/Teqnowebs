# Teqnowebs — plain PHP (Hostinger / XAMPP)

No Laravel. No Composer. No Node.

## Setup

1. Copy `.env.example` → `.env`
2. Set `APP_URL`, DB, and admin/staff credentials in `.env`
3. Create MySQL database matching `DB_DATABASE`
4. Open the site (tables + seed users create on first visit)

### Local (XAMPP)

```env
APP_URL=http://localhost/teqnowebs
APP_DEBUG=true
DB_USERNAME=root
DB_PASSWORD=
```

Open: `http://localhost/teqnowebs/`

### Production (Hostinger)

```env
APP_URL=https://teqnowebs.com
APP_DEBUG=false
DB_HOST=localhost
DB_DATABASE=...
DB_USERNAME=...
DB_PASSWORD=...
```

Unzip **directly into `public_html/`** so `public_html/index.php` exists.  
Do **not** upload a nested `public/` folder (causes 403).

`storage/` should be writable (755/775). Never upload `.env` publicly without blocking — `.htaccess` already forbids it.

### Logins (from `.env`)

| Variable | Default | Access |
|----------|---------|--------|
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | `admin@teqnowebs.com` / `teqnowebs123` | `/admin` + `/staff` |
| `STAFF_EMAIL` / `STAFF_PASSWORD` | `staff@teqnowebs.com` / `teqnowebs123` | `/staff` |

All menu/admin links use `url()` + `APP_URL` (subdirectory-safe). Do not hardcode `/teqnowebs/...` in views.

## Staff tools

Set in `.env` (linked from `/staff`):

| Env | Local | Production |
|-----|-------|------------|
| `ATTENDANCE_URL` | `http://localhost/attendance` | `https://attendance.teqnowebs.com` |
| `OPS_URL` | `http://localhost/ops` | `https://ops.teqnowebs.com` |
