# Teqnowebs Ops / Link Desk (Hostinger PHP)

Plain **PHP + MySQL** ops desk for shared hosting. No Node, Composer, or Laravel.

## Features

- Clients (packages, fees, notes)
- Link tasks: queued → in progress → published → live / lost
- Monthly P&L (task revenue/cost + expenses)
- CSV import (Client column required)
- Team users (admin / staff)

## Deploy

See `DEPLOY.txt`. Unzip into `public_html/ops/` or a subdomain docroot, copy `.env.example` → `.env`, create MySQL DB.

Seed password: **`ops123`**

## Local

```bash
cp config.local.example.php config.local.php
php -S 127.0.0.1:8082 router.php
```
