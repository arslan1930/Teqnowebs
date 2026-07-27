# Team photos (local fallback)

Preferred: upload and edit photos in **Sanity Studio** (`Team Member` documents).

Optional local fallback (used when Sanity has no team members yet):

1. Add a square headshot named after the person slug, for example:
   - `m-arslan.jpg`
   - `shaharyar.jpg`
   - `rehan-haider.jpg`
2. Keep the matching `photo: "/team/<slug>.jpg"` entry in `src/data/team.ts`.
3. Run `npm run build` and re-upload to Hostinger.

Supported extensions: `.jpg`, `.jpeg`, `.png`, `.webp`. Until a file exists, the site shows initials.
