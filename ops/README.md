# Teqnowebs Ops / Link Desk (`ops.teqnowebs.com`)

Replaces `Teqnowebs_Link_Inventory.xlsx` with a team dashboard:

- Clients
- Link inventory (queued → live)
- Monthly P&amp;L (PKR, Asia/Karachi)
- CSV import from Excel
- SQLite database on the server (Node mode)

**Not** the public marketing site. **Not** attendance.  
**Access:** login from anywhere (no office IP lock).

---

## Why “Ops not working” on Hostinger?

Uploading the **Node/SQLite** package into `public_html/ops/` will not run. Hostinger static hosting only serves HTML/JS/CSS.

You have two options:

| Mode | Zip / command | Data | Use when |
|------|---------------|------|----------|
| **Hostinger demo** (static) | [`../deploy/teqnowebs-ops.zip`](../deploy/teqnowebs-ops.zip) | Browser `localStorage` (per device) | Quick UI on `ops.teqnowebs.com` |
| **Office / VPS Node** | `npm run build && npm start` (port **3002**) | Shared SQLite `ops/data/ops.db` | Real team inventory + P&amp;L |

---

## Hostinger (demo / static)

1. Download [`deploy/teqnowebs-ops.zip`](../deploy/teqnowebs-ops.zip)
2. Unzip into `public_html/ops/` (all files: `index.html`, `.htaccess`, folders…)
3. Point subdomain `ops.teqnowebs.com` → that folder
4. Open the site and sign in (seed password `ops123`)

Rebuild static zip locally:

```bash
cd ops
npm install
npm run build:demo
```

---

## Node + SQLite (shared team DB)

```bash
cd ops
npm install
npm run build
npm start
# listens on port 3002
```

Point DNS / Cloudflare Tunnel:

`ops.teqnowebs.com` → this host:3002

```bash
cloudflared tunnel --url http://127.0.0.1:3002
# or a named tunnel hostname ops.teqnowebs.com
```

Database file: `ops/data/ops.db` (created on first start).

---

## Seed logins (password `ops123`)

| Email | Role |
|-------|------|
| `admin@teqnowebs.com` | Admin (P&L, import, team) |
| `linker@teqnowebs.com` | Staff |
| `outreach@teqnowebs.com` | Staff |

## Excel cutover

1. Export inventory workbook → CSV  
2. Admin → **Import** → paste/upload CSV  
3. Freeze the Excel file; team uses only Ops  

## Screens

`/login` · `/home` · `/clients` · `/clients/view?id=` · `/tasks` · `/pnl` · `/team` · `/import`
