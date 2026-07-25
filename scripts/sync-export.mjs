import { cpSync, existsSync, rmSync } from "fs";
import { join } from "path";

const root = process.cwd();
const outDir = join(root, "out");

if (!existsSync(outDir)) {
  console.error("Missing out/ — run next build first.");
  process.exit(1);
}

const targets = [
  "index.html",
  "index.txt",
  "404.html",
  "404",
  "about",
  "blog",
  "contact",
  "services",
  "software",
  "_next",
  ".htaccess",
];

for (const name of targets) {
  const dest = join(root, name);
  rmSync(dest, { recursive: true, force: true });
  const src = join(outDir, name);
  if (existsSync(src)) {
    cpSync(src, dest, { recursive: true });
  }
}

console.log("Synced static export to repo root (upload into public_html/Teqnowebs).");

