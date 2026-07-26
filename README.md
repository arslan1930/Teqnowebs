# Teqnowebs

Agency website for Teqnowebs — web development, graphic design, SEO, link building, and custom business software (sales, invoicing, warehouse, order tracking).

## Run locally

```bash
export PATH="$(pwd)/.tools/node/bin:$PATH"
npm install
cp .env.example .env.local   # then set your Sanity project ID
npm run build
npx serve@latest out -l 3000
```

Open http://127.0.0.1:3000/ (domain-root routes — no `/Teqnowebs` prefix).

Examples: `/contact/`, `/about/`, `/services/`, `/software/`, `/blog/`.

## Pages

| Route | Content |
| --- | --- |
| `/` | Brand-first home + service pillars + software spotlight |
| `/services` | Websites, UI/UX, graphic design, SEO & link building |
| `/software` | Sales manager/CRM, finance, invoicing, warehouse, order tracking |
| `/blog` | Blog index (Sanity posts at build time) |
| `/blog/[slug]` | Blog post |
| `/about` | Agency story + team |
| `/contact` | Quote form |

## Scripts

- `npm run dev` — development server
- `npm run build` — production static export + sync to repo root
- `npx serve out` — preview the static export (`npm start` is not used with `output: "export"`)
- `npm run sanity` — local Sanity Studio
- `npm run sanity:deploy` — host Studio on `*.sanity.studio`
- `npm run attendance:dev` — staff attendance app (subdomain)
- `npm run attendance:build` — build attendance static export (`attendance/out/`)

## Attendance subdomain (`attendance.teqnowebs.com`)

Separate staff login + check-in/out app in [`attendance/`](attendance/). See [`attendance/README.md`](attendance/README.md) for Supabase setup and Hostinger subdomain deploy into `public_html/attendance/`.

## Blog & team (Sanity)

Managed in **Sanity Studio**. After publish/edit, run `npm run build` and re-upload to Hostinger.

Env vars: see `.env.example`.

## Hostinger deploy (domain-root URLs)

Goal: `https://mydomain.com/contact/`, `https://mydomain.com/about/`, etc.

1. Run `npm run build`.
2. Hostinger → Domains → your domain → **Document root** = `public_html`.
3. Upload build files **directly into** `public_html/`:
   - `index.html`, `contact/`, `about/`, `services/`, `software/`, `blog/`, `_next/`, `.htaccess`, favicons, `logo.svg`, `team/`
4. **Delete** any old `public_html/Teqnowebs/` folder (that caused `/Teqnowebs/...` and client errors).
5. `.htaccess` redirects `/Teqnowebs/...` → `/...` and `/Contact` → `/contact/`.

Canonical routes are lowercase (`/contact/`). Capitalized URLs like `/Contact` redirect automatically.
