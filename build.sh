#!/usr/bin/env bash
# this_file: build.sh
# Test + build vexy-vlip-js: dist bundles, demo assets in src_docs/md/, and the
# documentation site in docs/.
# Usage: ./build.sh [all|docs|package]   (default: all)
#   package: unit tests + dist bundles
#   docs:    dist bundles + demo assets (npm run build:docs) + src_docs/build.sh
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")"
target="${1:-all}"
case "$target" in
  all|docs|package) ;;
  *) echo "usage: $0 [all|docs|package]" >&2; exit 2 ;;
esac

if [[ "$target" == all || "$target" == package ]]; then
  echo "==> Running unit tests..."
  npm run test:unit
fi

echo "==> Building dist bundles..."
npm run build
ls -lh dist/vexy-vlip.element.js dist/vexy-vlip.global.js

if [[ "$target" == all || "$target" == docs ]]; then
  echo "==> Copying bundles + media into src_docs/md/..."
  npm run build:docs
  echo "==> Building documentation site into docs/..."
  src_docs/build.sh
fi
