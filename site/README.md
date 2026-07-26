# Teqnowebs (Laravel)

Agency marketing site for Hostinger: pages, blog, contact inquiries, staff hub, and simple admin.

## Local

```bash
cd site
cp .env.example .env   # or use SQLite for local
composer install
php artisan key:generate
touch database/database.sqlite   # if using sqlite
php artisan migrate --seed
npm install && npm run build
php artisan serve
```

Open http://127.0.0.1:8000/

### Seed logins (password `teqnowebs123`)

| Email | Access |
|-------|--------|
| `admin@teqnowebs.com` | Staff hub + `/admin` |
| `staff@teqnowebs.com` | Staff hub only |

## Hostinger deploy

1. Create a MySQL database in hPanel.
2. Upload the contents of the deploy zip (full Laravel app) to the server.
3. Point the domain **document root** to the app’s `public/` folder.
4. Copy `.env.example` → `.env`, set `APP_URL`, MySQL credentials, run:

```bash
php artisan key:generate
php artisan migrate --seed --force
php artisan storage:link
php artisan config:cache
```

5. Ensure `storage/` and `bootstrap/cache/` are writable.

### Subdomain tools (unchanged)

| Tool | URL |
|------|-----|
| Attendance | `https://attendance.teqnowebs.com` |
| Ops / Link Desk | `https://ops.teqnowebs.com` |

Staff hub: `/staff` after login. Admin: `/admin`.

## Pages

`/` · `/services` · `/software` · `/about` · `/contact` · `/blog` · `/staff` · `/admin`
