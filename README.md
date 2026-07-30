# Teqnowebs monorepo

| App | Path | Hostinger deploy |
|-----|------|------------------|
| **Marketing site** | [`site/`](site/) | Plain PHP + MySQL → `public_html/` |
| **Attendance** | [`attendance-php/`](attendance-php/) | Plain PHP + MySQL → `public_html/attendance/` |
| **Ops / Link Desk** | [`ops-php/`](ops-php/) | Plain PHP + MySQL → `public_html/ops/` |

Legacy Next.js sources remain in [`attendance/`](attendance/) and [`ops/`](ops/) for reference. Prefer the PHP apps on Hostinger (no Node).

## Zips in `deploy/`

| File | Use |
|------|-----|
| [`teqnowebs-php.zip`](deploy/teqnowebs-php.zip) | Main site → unzip into `public_html/` |
| [`teqnowebs-attendance-php.zip`](deploy/teqnowebs-attendance-php.zip) | Attendance PHP → `public_html/attendance/` or subdomain |
| [`teqnowebs-ops-php.zip`](deploy/teqnowebs-ops-php.zip) | Ops PHP → `public_html/ops/` or subdomain |
| [`teqnowebs-full.zip`](deploy/teqnowebs-full.zip) | Site + both PHP apps + deploy zips |

Older Next/static zips may still be present; use the `*-php.zip` packages for Hostinger.

## Quick start (local)

```bash
# Site
cd site && cp .env.example .env   # or use config.local.php
php -S 127.0.0.1:8080 router.php

# Attendance
cd attendance-php && cp config.local.example.php config.local.php
php -S 127.0.0.1:8081 router.php

# Ops
cd ops-php && cp config.local.example.php config.local.php
php -S 127.0.0.1:8082 router.php
```

## Seed passwords

| App | Password | Accounts |
|-----|----------|----------|
| Site | `teqnowebs123` | `admin@teqnowebs.com`, `staff@teqnowebs.com` |
| Attendance | `attendance123` | `admin@…`, `staff@…`, `hr@…`, … |
| Ops | `ops123` | `admin@…`, `linker@…`, `outreach@…` |

Staff hub on the marketing site (`/staff`) links to `ATTENDANCE_URL` / `OPS_URL` from `.env`.
