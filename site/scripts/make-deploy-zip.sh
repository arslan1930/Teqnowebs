#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$(cd "$ROOT/.." && pwd)/deploy"
ZIP="$OUT/teqnowebs-laravel.zip"
mkdir -p "$OUT"
rm -f "$ZIP"
cd "$ROOT"
zip -r "$ZIP" . \
  -x "node_modules/*" \
  -x ".git/*" \
  -x "storage/logs/*" \
  -x "storage/framework/cache/*" \
  -x "storage/framework/sessions/*" \
  -x "storage/framework/views/*" \
  -x "database/*.sqlite" \
  -x "database/*.sqlite-*" \
  -x ".env" \
  -x "tests/*" \
  -x "*.md" \
  -x "README.md"
# include README for Hostinger
zip -u "$ZIP" README.md
# DEPLOY note
cat > /tmp/TEQNOWEBS_DEPLOY.txt <<'EOF'
Teqnowebs Laravel — Hostinger upload
====================================
1. Unzip on the server (or upload this archive).
2. Set domain document root to the /public folder.
3. Copy .env.example to .env — set APP_URL + MySQL.
4. php artisan key:generate
5. php artisan migrate --seed --force
6. php artisan storage:link && php artisan config:cache
7. Login: admin@teqnowebs.com / teqnowebs123

Staff hub: /staff
Admin: /admin
Attendance: https://attendance.teqnowebs.com
Ops: https://ops.teqnowebs.com
EOF
(cd /tmp && zip -u "$ZIP" TEQNOWEBS_DEPLOY.txt)
echo "Wrote $ZIP"
ls -lh "$ZIP"
