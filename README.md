# Teqnowebs monorepo

| App | Path | URL | Stack |
|-----|------|-----|--------|
| **Marketing site** | [`site/`](site/) | `https://teqnowebs.com` | **Laravel + MySQL** (Hostinger) |
| Attendance | [`attendance/`](attendance/) | `https://attendance.teqnowebs.com` | Next.js |
| Ops / Link Desk | [`ops/`](ops/) | `https://ops.teqnowebs.com` | Next.js + SQLite |

## Marketing site (Laravel)

```bash
cd site
composer install
cp .env.example .env && php artisan key:generate
# SQLite local: set DB_CONNECTION=sqlite and touch database/database.sqlite
php artisan migrate --seed
npm install && npm run build
php artisan serve
```

**Hostinger zip:** [`deploy/teqnowebs-laravel.zip`](deploy/teqnowebs-laravel.zip)  
Document root must point at Laravel `public/`. See [`site/README.md`](site/README.md).

Seed admin: `admin@teqnowebs.com` / `teqnowebs123`

## Attendance

See [`attendance/README.md`](attendance/). Deploy under `public_html/attendance/` or subdomain root. Office IP allowlist for staff punches.

## Ops / Link Desk

See [`ops/README.md`](ops/). Shared team DB needs Node on port 3002 (not static Hostinger). Demo zip: `deploy/teqnowebs-ops.zip`.

## Staff integration

After Laravel login → **`/staff`** links to Attendance and Ops subdomains. Site content admin at **`/admin`**.

## Legacy Next.js marketing export

The previous static Next.js marketing files at the repo root are superseded by [`site/`](site/). Prefer Laravel for new deploys.
