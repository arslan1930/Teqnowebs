# Teqnowebs — plain PHP (Hostinger)

No Laravel. No Composer. No Node.

## Local

```bash
cd site
php -S 127.0.0.1:8080 router.php
```

## Hostinger (avoid 403)

Unzip **directly into `public_html/`** so `public_html/index.php` exists.

Do **not** upload a nested `public/` folder. That is what causes Hostinger **403**.

1. Unzip zip contents into `public_html/`
2. Confirm File Manager shows `public_html/index.php`
3. Copy `config.local.example.php` → `config.local.php` (MySQL + app_url)
4. `storage/` writable (755/775)

### Seed logins (password `teqnowebs123`)

| Email | Access |
|-------|--------|
| `admin@teqnowebs.com` | `/admin` + `/staff` |
| `staff@teqnowebs.com` | `/staff` |

## Staff tools

- Attendance → `https://attendance.teqnowebs.com`
- Ops → `https://ops.teqnowebs.com`
