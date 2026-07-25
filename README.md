# Teqnowebs

Agency website for Teqnowebs — web development, graphic design, SEO, link building, and custom business software (sales, invoicing, warehouse, order tracking).

## Run locally

If system Node is missing, use the bundled binary (symlink at `.tools` → `/tmp/teqnowebs-tools` if present):

```bash
export PATH="$(pwd)/.tools/node/bin:$PATH"
npm install
cp .env.example .env.local   # then set your Sanity project ID
npm run build
npm run start -- -H 127.0.0.1 -p 3000
```

Or for development: `npm run dev` (keep large toolchains outside the repo to avoid file-watcher limits).

Open http://127.0.0.1:3000/Teqnowebs/ (production `basePath` is `/Teqnowebs`).

Without Sanity env vars, the site still builds and shows a sample blog post.

## Pages

| Route | Content |
| --- | --- |
| `/` | Brand-first home + service pillars + software spotlight |
| `/services` | Web, graphic design, SEO & link building |
| `/software` | Sales, invoicing, warehouse, order tracking |
| `/blog` | Blog index (Sanity posts at build time) |
| `/blog/[slug]` | Blog post |
| `/about` | Agency story + team |
| `/contact` | Quote form |

## Scripts

- `npm run dev` — development server
- `npm run build` — production static export + sync to repo root
- `npm start` — serve production build
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

### Blog posts

Create a **Blog Post** with title, slug, excerpt, featured image + alt, body, `publishedAt`, and `published: true`.

### Team photos (avatars)

1. In Sanity Studio, open **Team Member**.
2. Create one document per person: **Name**, **Role**, **Photo** (upload/replace headshot), **Team group**, **Order**.
3. Toggle **Show on site** off to hide someone without deleting them.
4. Until a photo is uploaded, the About page shows initials in the avatar.

Without Sanity team documents yet, the site uses the roster in `src/data/team.ts` and optional files in `public/team/` (see that folder’s README).

### Publish workflow

1. Add, edit, or delete posts / team photos in Sanity Studio.
2. Run `npm run build` so Next.js fetches content and regenerates static HTML.
3. Upload the fresh build into Hostinger `public_html/Teqnowebs/` (see below).

Live updates without a rebuild are out of scope for this static Hostinger setup.

## Hostinger deploy

Serve the site under **`/Teqnowebs`** (`public_html/Teqnowebs`).

1. Run `npm run build` (writes `index.html`, route folders including `blog/`, `_next/`, and `.htaccess` to the repo root / `out/`).
2. In Hostinger → Domains → your domain → **Document root** = `public_html`.
3. Upload the built site files into `public_html/Teqnowebs/` (`index.html`, `about/`, `blog/`, `contact/`, `services/`, `software/`, `_next/`, `404.html`, `.htaccess`, favicons, `logo.svg`).
4. `.htaccess` uses `RewriteBase /Teqnowebs/` and maps clean URLs to the exported pages.

Visitors open `https://your-domain/Teqnowebs/`.
