# Teqnowebs — plain PHP (Hostinger)

No Laravel. No Composer. No Node build for the marketing site.

## Local

```bash
cd site/public
php -S 127.0.0.1:8080
```

Open http://127.0.0.1:8080/

SQLite DB auto-creates at `site/storage/teqnowebs.sqlite` on first visit.

### Seed logins (password `teqnowebs123`)

| Email | Access |
|-------|--------|
| `admin@teqnowebs.com` | Staff hub + `/admin` |
| `staff@teqnowebs.com` | Staff hub |

## Hostinger (MySQL)

1. Upload the project so **document root** = `public/`
2. Copy `config.local.example.php` → `config.local.php` (one level above `public/`)
3. Set MySQL credentials + `app_url`
4. Visit the site — tables + seed users are created automatically

```php
// config.local.php
return [
  'app_url' => 'https://teqnowebs.com',
  'db_driver' => 'mysql',
  'mysql' => [
    'host' => 'localhost',
    'port' => '3306',
    'database' => 'YOUR_DB',
    'username' => 'YOUR_USER',
    'password' => 'YOUR_PASS',
    'charset' => 'utf8mb4',
  ],
];
```

Make `storage/` writable by PHP.

## Routes

`/` · `/services` · `/software` · `/about` · `/contact` · `/blog` · `/login` · `/staff` · `/admin`

## Staff tools (subdomains)

- Attendance → `https://attendance.teqnowebs.com`
- Ops → `https://ops.teqnowebs.com`
