# Teqnowebs monorepo

| App | Path | Live URL | Deploy |
|-----|------|----------|--------|
| **Marketing site** | [`site/`](site/) | `https://teqnowebs.com` | Plain PHP → `public_html/` |
| **Attendance** | [`attendance/`](attendance/) | `https://attendance.teqnowebs.com` | Next.js (office Node/SQLite or static zip) |
| **Ops / Link Desk** | [`ops/`](ops/) | `https://ops.teqnowebs.com` | Next.js + SQLite (Node host) |

## Zips in `deploy/`

| File | Use |
|------|-----|
| [`teqnowebs-php.zip`](deploy/teqnowebs-php.zip) | Main site → unzip into `public_html/` |
| [`teqnowebs-attendance.zip`](deploy/teqnowebs-attendance.zip) | Attendance static Hostinger demo |
| [`teqnowebs-attendance-office.zip`](deploy/teqnowebs-attendance-office.zip) | Attendance Node+SQLite office package |
| [`teqnowebs-ops.zip`](deploy/teqnowebs-ops.zip) | Ops browser demo (static) |
| [`teqnowebs-ops-office.zip`](deploy/teqnowebs-ops-office.zip) | Ops Node+SQLite package |
| [`teqnowebs-full.zip`](deploy/teqnowebs-full.zip) | **All apps together** (site + attendance + ops source + zips) |

## Marketing (`site/`)

```bash
cd site && php -S 127.0.0.1:8080 router.php
```

Copy `.env.example` → `.env`. Unzip zip **directly** into Hostinger `public_html/` (must see `index.php` there).

## Attendance

```bash
cd attendance && npm install && npm run build && npm start
# port 3001 — see attendance/README.md
```

Seed password: `attendance123` (`admin@` / `staff@` / …)

## Ops

```bash
cd ops && npm install && npm run build && npm start
# port 3002 — see ops/README.md
```

After marketing login → **`/staff`** opens Attendance + Ops links.
