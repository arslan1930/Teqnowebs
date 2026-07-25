Teqnowebs

Agency website for Teqnowebs — web development, graphic design, SEO, link building, and custom business software (sales, invoicing, warehouse, order tracking).

Run locally

If system Node is missing, use the bundled binary (symlink at .tools → /tmp/teqnowebs-tools if present):

export PATH="$(pwd)/.tools/node/bin:$PATH"
npm install
npm run build
npm run start -- -H 127.0.0.1 -p 3000

Or for development: npm run dev (keep large toolchains outside the repo to avoid file-watcher limits).

Open http://127.0.0.1:3000.

Pages







Route



Content





/



Brand-first home + service pillars + software spotlight





/services



Web, graphic design, SEO & link building





/software



Sales, invoicing, warehouse, order tracking





/about



Agency story





/contact



Quote form



Scripts





npm run dev — development server



npm run build — production build



npm start — serve production build
