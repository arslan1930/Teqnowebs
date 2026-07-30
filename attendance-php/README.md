# Teqnowebs Attendance (Hostinger PHP)

Plain **PHP + MySQL** attendance app for shared hosting. No Node, Composer, or Laravel.

## Features

- Staff check-in / check-out (admins do not punch)
- Checkout blocked before **3:00pm** (`Asia/Karachi`)
- Checkout **3:00–3:59pm** = half leave
- Female / male office timings + late grace
- Company holidays, 1 personal leave / month
- Admin roster, reports + CSV export, manual day edit, IP list reference

## Deploy

See `DEPLOY.txt`. Unzip into `public_html/attendance/` or a subdomain docroot, copy `.env.example` → `.env`, create MySQL DB.

Seed password: **`attendance123`**

## Local

```bash
cp config.local.example.php config.local.php
php -S 127.0.0.1:8081 router.php
```
