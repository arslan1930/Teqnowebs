#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$(cd "$ROOT/.." && pwd)/deploy"
ZIP="$OUT/teqnowebs-php.zip"
mkdir -p "$OUT"
rm -f "$ZIP" "$OUT/teqnowebs-laravel.zip"
cd "$ROOT"
# fresh sqlite not needed in zip
rm -f storage/*.sqlite storage/*.sqlite-*
zip -r "$ZIP" . \
  -x "storage/*.sqlite" \
  -x "storage/*.sqlite-*" \
  -x ".DS_Store" \
  -x "config.local.php"
echo "Wrote $ZIP ($(du -h "$ZIP" | cut -f1))"
