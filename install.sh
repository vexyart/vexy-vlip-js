#!/usr/bin/env bash
# this_file: install.sh
# Install dependencies for vexy-vlip-js (dev only — the package itself has zero
# runtime dependencies). Uses a real npm if available, otherwise whatever `npm`
# resolves to.
set -euo pipefail
cd "$(dirname "$0")"

find_npm() {
  local c
  for c in /opt/homebrew/bin/npm "$(dirname "$(command -v node)")/npm" /usr/local/bin/npm "$(command -v npm || true)"; do
    [ -n "$c" ] && [ -x "$c" ] || continue
    grep -q pnpm "$c" 2>/dev/null && continue
    echo "$c"; return 0
  done
  echo "npm"
}
NPM="$(find_npm)"

echo "==> Installing dev dependencies with $NPM ..."
"$NPM" install

echo "==> Installing Chromium for Playwright e2e ..."
npx playwright install chromium || echo "  (skip) install chromium manually for e2e: npx playwright install chromium"

echo "==> Done. Try:  npm run dev   |   npm test   |   ./build.sh"
