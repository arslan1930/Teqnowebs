# Attendance architecture (locked)

One product (`attendance/`), one database (Supabase), two roles.

```text
Employees (office LAN / Wi‑Fi only)
    → http://192.168.x.x/…  or  attendance.teqnowebs.com
    → /login → /dashboard
    → Same Supabase backend

Admin (you) — from anywhere
    → /login → /admin
    → Same app, same database
```

## Why LAN (solves router new public IP)

Many office routers get a **new public IP** after reboot. If you lock on public IP, attendance breaks until you update the allowlist.

**Chosen fix:** host the attendance app on a PC/server **inside the office** and allow private LAN ranges:

- `192.168.0.0/16`
- `10.0.0.0/8`
- `172.16.0.0/12`

Staff open e.g. `http://192.168.1.10:3001/` on office Wi‑Fi. The server sees `192.168.x.x`, not the ISP public IP — **reboot-safe**.

Downside: staff must be on the office network (what you want).

## Admin from anywhere

Apache (`.htaccess`) rules:

| Path | Who |
|------|-----|
| `/admin/`, `/login/`, `/_next/`, assets | **Anywhere** (internet OK) |
| `/dashboard/`, `/` (staff app) | **Office LAN only** |

Admin signs in from home → `/admin/`. Employees off LAN → 403 on dashboard.

Optional later: Tailscale/VPN into the office PC if you prefer not to expose `/login` publicly.

## App rules (business)

| Rule | Value |
|------|--------|
| Timezone | `Asia/Karachi` |
| Time display | `12:30pm` style |
| Earliest checkout | **3:00pm** (blocked before) |
| Checkout 3:00–3:59pm | **Half leave** |
| Checkout 4:00pm+ | Full day |
| Late | After group start + late-after minutes |
| Personal leave | 1 approved / calendar month |

## Admin “one click” per employee

Click a name → see for the selected month/range:

- Days present (checked in)
- Late days
- Half leaves (early checkout window)
- Personal leaves (approved)

## Deploy (recommended)

1. Office PC always on, Node or Apache serving `attendance/out` (or `npm run start` if server mode).
2. Paste LAN `.htaccess` (already in `public/.htaccess`).
3. Supabase project for Auth + DB.
4. Staff bookmark the office LAN URL; you bookmark `/admin/` (works from anywhere).

Hostinger public subdomain is optional; if used without LAN, you must maintain public IP(s) again.
