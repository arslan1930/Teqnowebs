import { execSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const api = path.join(root, "src/app/api");
const apiBak = path.join(root, "src/app/_api_bak");
const outDir = path.join(root, "out");
const deployZip = path.resolve(root, "../deploy/teqnowebs-ops.zip");

try {
  if (existsSync(apiBak)) {
    if (existsSync(api)) rmSync(api, { recursive: true, force: true });
    renameSync(apiBak, api);
  }
  if (existsSync(api)) renameSync(api, apiBak);

  rmSync(outDir, { recursive: true, force: true });
  execSync("npx next build", {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, NEXT_PUBLIC_OPS_MODE: "demo" },
  });

  if (!existsSync(path.join(outDir, "index.html"))) {
    throw new Error("Demo build missing out/index.html");
  }

  const ht = path.join(root, "public/.htaccess");
  if (existsSync(ht)) cpSync(ht, path.join(outDir, ".htaccess"));

  writeFileSync(
    path.join(outDir, "DEPLOY.txt"),
    [
      "Upload ALL contents of this zip into Hostinger:",
      "  public_html/ops/",
      "",
      "Point ops.teqnowebs.com document root at that folder.",
      "",
      "This is DEMO / browser mode (localStorage). Data is per-browser, not a shared office DB.",
      "For shared SQLite + Node (recommended for the team), run on a VPS or office PC:",
      "  cd ops && npm install && npm run build && npm start",
      "  then point ops.teqnowebs.com → that host:3002 (Cloudflare Tunnel works).",
      "",
      "Seed logins — password ops123",
      "  admin@teqnowebs.com",
      "  linker@teqnowebs.com",
      "  outreach@teqnowebs.com",
      "",
    ].join("\n"),
  );

  mkdirSync(path.dirname(deployZip), { recursive: true });
  rmSync(deployZip, { force: true });
  execSync(`zip -r "${deployZip}" . -x "*.DS_Store"`, {
    cwd: outDir,
    stdio: "inherit",
  });

  console.log(`\nDemo zip ready: ${deployZip}\n`);
} finally {
  if (existsSync(apiBak)) {
    if (existsSync(api)) rmSync(api, { recursive: true, force: true });
    renameSync(apiBak, api);
  }
}
