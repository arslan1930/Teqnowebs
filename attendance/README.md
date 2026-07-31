# Teqnowebs Attendance (SQLite — final office web)

One app, **real SQLite database** on the office PC (`attendance/data/attendance.db`).

| Role | What |
|------|------|
| **Staff** | `/dashboard` — check-in / check-out (office LAN) |
| **Admin** | `/admin` only — **does not mark attendance** |

## Run on office PC

```bash
cd attendance
npm install
npm run build
npm start
```

Open `http://192.168.x.x:3001/` on office Wi‑Fi (replace with this PC’s LAN IP).

### Seeded logins (password `attendance123`)

| Email | Role |
|-------|------|
| `admin@teqnowebs.com` | Admin (no punches) |
| `staff@teqnowebs.com` | Staff — Ayesha Khan |
| `sara@teqnowebs.com` | Staff |
| `fatima@teqnowebs.com` | Staff |
| `hr@teqnowebs.com` | Staff — Hassan Ali |
| `bilal@teqnowebs.com` | Staff |
| `umar@teqnowebs.com` | Staff |
| `zain@teqnowebs.com` | Staff |

Add more staff from **Admin → Staff directory**.

## Rules

- Checkout blocked before **3:00pm**
- **3:00–3:59pm** = half leave
- Times shown as `12:30pm`
- Admin one-click employee stats (present / late / half leave / personal leave)
- Each employee has a distinct color highlight

## Files

- Database: `data/attendance.db` (created automatically)
- Architecture: [`ARCHITECTURE.md`](ARCHITECTURE.md)
- LAN / admin-anywhere: [`OFFICE_IP.md`](OFFICE_IP.md)

Main marketing site stays separate at `teqnowebs.com`.
