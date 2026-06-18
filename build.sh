#!/usr/bin/env bash
# this_file: build.sh
# Test + build vexy-vlip-js (emits the dist bundles + docs/).
set -euo pipefail
cd "$(dirname "$0")"

echo "==> Running unit tests..."
npm run test:unit

echo "==> Building dist bundles..."
npm run build

echo "==> Build complete:"
ls -lh dist/vexy-vlip.element.js dist/vexy-vlip.global.js

echo "==> Building docs/ for GitHub Pages..."
npm run build:docs

echo "==> docs/ bundle copies:"
ls -lh docs/vexy-vlip.*.js
