# Teqnowebs monorepo

| App | Path | URL | Stack |
|-----|------|-----|--------|
| **Marketing site** | [`site/`](site/) | `https://teqnowebs.com` | **Plain PHP** + MySQL/SQLite (Hostinger) |
| Attendance | [`attendance/`](attendance/) | `https://attendance.teqnowebs.com` | Next.js |
| Ops / Link Desk | [`ops/`](ops/) | `https://ops.teqnowebs.com` | Next.js + SQLite |

## Marketing site (plain PHP)

```bash
cd site/public && php -S 127.0.0.1:8080
```

**Hostinger zip:** [`deploy/teqnowebs-php.zip`](deploy/teqnowebs-php.zip)  
Document root → `public/`. See [`site/README.md`](site/README.md) and `DEPLOY.txt` inside the zip.

Seed: `admin@teqnowebs.com` / `teqnowebs123`

## Attendance & Ops

Keep deploying on their subdomains. After PHP site login, **`/staff`** links to both tools.

## Note

Laravel was removed from this project in favor of plain PHP for simpler Hostinger hosting (no Composer required on the server).
