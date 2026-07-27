#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$(cd "$ROOT/.." && pwd)/deploy"
ZIP="$OUT/teqnowebs-php.zip"
mkdir -p "$OUT"
rm -f "$ZIP"
cd "$ROOT"
rm -f storage/*.sqlite storage/*.sqlite-*
zip -r "$ZIP" . \
  -x "storage/*.sqlite" \
  -x "storage/*.sqlite-*" \
  -x ".DS_Store" \
  -x "config.local.php" \
  -x "scripts/*"
# ensure deploy note is first thing people see
echo "Wrote $ZIP ($(du -h "$ZIP" | cut -f1))"
# verify index at root of zip
unzip -l "$ZIP" | head -5
unzip -l "$ZIP" | rg 'index\.php|\.htaccess|DEPLOY' | head
