# Teqnowebs

Agency website for Teqnowebs — web development, graphic design, SEO, link building, and custom business software (sales, invoicing, warehouse, order tracking).

## Run locally

If system Node is missing, use the bundled binary (symlink at `.tools` → `/tmp/teqnowebs-tools` if present):

```bash
export PATH="$(pwd)/.tools/node/bin:$PATH"
npm install
npm run build
npm run start -- -H 127.0.0.1 -p 3000
```

Or for development: `npm run dev` (keep large toolchains outside the repo to avoid file-watcher limits).

Open http://127.0.0.1:3000.

## Pages

| Route | Content |
| --- | --- |
| `/` | Brand-first home + service pillars + software spotlight |
| `/services` | Web, graphic design, SEO & link building |
| `/software` | Sales, invoicing, warehouse, order tracking |
| `/about` | Agency story |
| `/contact` | Quote form |

## Scripts

- `npm run dev` — development server
- `npm run build` — production static export + sync to repo root
- `npm start` — serve production build

## Hostinger deploy

Serve the static HTML at the domain root (`public_html`), not under a `/Teqnowebs` folder.

1. Run `npm run build` (writes `index.html`, route folders, `_next/`, and `.htaccess` to the repo root / `out/`).
2. In Hostinger → Domains → your domain → **Document root** = `public_html` (not `public_html/Teqnowebs`).
3. Upload the built site files (`index.html`, `about/`, `contact/`, `services/`, `software/`, `_next/`, `404.html`, `.htaccess`) directly into `public_html`.
4. `.htaccess` forces `DirectoryIndex index.html`, redirects `/Teqnowebs` (and similar) to `/`, and maps clean URLs to the exported pages.

Visitors should open `https://your-domain/` and get the home HTML immediately.
