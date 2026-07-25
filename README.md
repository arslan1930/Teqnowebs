# Teqnowebs

Agency website for Teqnowebs — web development, graphic design, SEO, link building, and custom business software (sales, invoicing, warehouse, order tracking).

## Run locally

If system Node is missing, use the bundled binary (symlink at `.tools` → `/tmp/teqnowebs-tools` if present):

```bash
export PATH="$(pwd)/.tools/node/bin:$PATH"
npm install
cp .env.example .env.local   # then set your Sanity project ID
npm run build
npx serve@latest out -l 3000
```

Or for development: `npm run dev` (keep large toolchains outside the repo to avoid file-watcher limits).

Open http://127.0.0.1:3000/Teqnowebs/ (production `basePath` is `/Teqnowebs`).

Without Sanity env vars, the site still builds and shows a sample blog post.

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
- `npm start` — not used with static export; use `npx serve out` instead
- `npm run sanity` — local Sanity Studio (blog posts + team member photos)
- `npm run sanity:deploy` — host Studio on `*.sanity.studio`

## Blog & team (Sanity)

Blog posts and **team member photos** are managed in **Sanity Studio** (not on Hostinger). HTML is generated at **build time** from the Sanity Content API.

### One-time setup

1. Create a project at [sanity.io/manage](https://www.sanity.io/manage) (or run `npx sanity init` and reuse this repo’s schema).
2. Copy `.env.example` → `.env.local` and set:
   - `NEXT_PUBLIC_SANITY_PROJECT_ID`
   - `NEXT_PUBLIC_SANITY_DATASET` (`production`)
   - `NEXT_PUBLIC_SANITY_API_VERSION` (e.g. `2025-01-01`)
3. Run `npm run sanity` and sign in.
4. Optionally deploy Studio: `npm run sanity:deploy` → manage content at your `*.sanity.studio` URL.

### Publish workflow

1. Add, edit, or delete posts / team photos in Sanity Studio.
2. Run `npm run build` so Next.js fetches content and regenerates static HTML.
3. Upload the fresh build into Hostinger (see below).

## Hostinger deploy

Serve the site at **`/Teqnowebs`** (`public_html/Teqnowebs`).

1. Run `npm run build`.
2. Document root stays `public_html`.
3. Upload build files **directly into** `public_html/Teqnowebs/` so you see:
   - `public_html/Teqnowebs/index.html`
   - `public_html/Teqnowebs/contact/`
   - `public_html/Teqnowebs/_next/`
   - `public_html/Teqnowebs/.htaccess`
4. **Do not** nest another folder: `public_html/Teqnowebs/Teqnowebs/` causes `/Teqnowebs/Teqnowebs/` URLs and breaks the contact page.
5. Remove any outdated copy of the site sitting in `public_html/` root that still points assets at `/Teqnowebs/_next` while pages load from `/contact/` (that mismatch causes a client-side error).

Visitors open `https://your-domain/Teqnowebs/` and `https://your-domain/Teqnowebs/contact/`.
