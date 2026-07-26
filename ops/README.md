# Teqnowebs Ops / Link Desk (`ops.teqnowebs.com`)

Replaces `Teqnowebs_Link_Inventory.xlsx` with a team dashboard:

- Clients
- Link inventory (queued → live)
- Monthly P&amp;L (PKR, Asia/Karachi)
- CSV import from Excel
- SQLite database on the server

**Not** the public marketing site. **Not** attendance.  
**Access:** login from anywhere (no office IP lock).

## Run (publicly reachable host)

```bash
cd ops
npm install
npm run build
npm start
# listens on port 3002
```

Point DNS / Cloudflare Tunnel:

`ops.teqnowebs.com` → this host:3002

Do **not** upload this folder as static HTML to Hostinger `public_html/ops/` — it needs Node + SQLite.

### Optional tunnel example

```bash
cloudflared tunnel --url http://127.0.0.1:3002
# or configure a named tunnel hostname ops.teqnowebs.com
```

## Seed logins (password `ops123`)

| Email | Role |
|-------|------|
| `admin@teqnowebs.com` | Admin (P&L, import, team) |
| `linker@teqnowebs.com` | Staff |
| `outreach@teqnowebs.com` | Staff |

Database file: `ops/data/ops.db` (created on first start).

## Excel cutover

1. Export inventory workbook → CSV  
2. Admin → **Import** → paste/upload CSV  
3. Freeze the Excel file; team uses only Ops  

## Screens

`/login` · `/home` · `/clients` · `/tasks` · `/pnl` · `/team` · `/import`
