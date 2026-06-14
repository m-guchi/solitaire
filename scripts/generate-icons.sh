#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
for py in python3 python3.8 python3.9 python3.10 python3.11; do
  if command -v "$py" >/dev/null 2>&1 && "$py" -c 'import cairosvg' 2>/dev/null; then
    exec "$py" scripts/generate-icons.py
  fi
done
echo 'cairosvg not found. Install: pip install cairosvg' >&2
exit 1
