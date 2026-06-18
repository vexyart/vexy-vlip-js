#!/usr/bin/env bash
# this_file: publish.sh
# Build then publish vexy-vlip-js to npm. PUBLISHES BY DEFAULT.
# Pass --dryrun (or --dry-run) to pack/validate without publishing.
# If you are not logged in to npm, it launches `npm login` (npm 11's browser
# flow, which also handles 2FA) and then publishes.
set -euo pipefail
cd "$(dirname "$0")"

DRYRUN=0
for arg in "$@"; do
  case "$arg" in
    --dryrun|--dry-run) DRYRUN=1 ;;
    *) echo "Unknown argument: $arg (only --dryrun is supported)" >&2; exit 2 ;;
  esac
done

# On this machine `npm` on PATH is a pnpm shim, and `pnpm publish` reports a
# missing/expired token as a misleading "404 Not Found" with no chance to log in.
# Find a REAL npm binary so auth detection and the login prompt work properly.
find_npm() {
  local c
  for c in /opt/homebrew/bin/npm "$(dirname "$(command -v node)")/npm" /usr/local/bin/npm "$(command -v npm || true)"; do
    [ -n "$c" ] && [ -x "$c" ] || continue
    grep -q pnpm "$c" 2>/dev/null && continue   # skip pnpm shims
    echo "$c"; return 0
  done
  echo "npm"
}
NPM="$(find_npm)"

# Issue 338: bump this repo's version tag with `uvx gitnextver`, then SYNC package.json to it
# (npm has no hatch-vcs equivalent, so the version must be written into package.json before
# publish — otherwise npm rejects the re-publish of the already-published version). Never bump
# on a dry run — dry runs pack the CURRENT package.json version.
if [ "$DRYRUN" -eq 0 ]; then
  uvx gitnextver
  RELEASE_VERSION="$(git describe --tags --abbrev=0 | sed 's/^v//')"
  echo "==> Setting package.json version to ${RELEASE_VERSION}..."
  node -e "const fs=require('fs');const p=require('./package.json');p.version=process.argv[1];fs.writeFileSync('package.json',JSON.stringify(p,null,2)+'\n');" "$RELEASE_VERSION"
fi

VERSION="$(node -p "require('./package.json').version")"

echo "==> Building dist bundles..."
"$NPM" run build

if [ "$DRYRUN" -eq 1 ]; then
  echo "==> DRY RUN (--dryrun): packing only, nothing will be published."
  "$NPM" publish --dry-run
  echo "==> Dry run complete. No package was published."
  exit 0
fi

# Real publish. Make sure we're authenticated; prompt login if not.
if ! "$NPM" whoami >/dev/null 2>&1; then
  echo "==> npm: not authenticated (your token is missing or expired)."
  echo "==> Launching 'npm login' — a browser window may open; complete sign-in (incl. 2FA)."
  "$NPM" login
  "$NPM" whoami >/dev/null 2>&1 || { echo "x Still not authenticated after login. Aborting." >&2; exit 1; }
fi
echo "==> Publishing vexy-vlip-js@${VERSION} to npm (as $("$NPM" whoami))..."
if ! "$NPM" publish --access public; then
  echo "" >&2
  echo "x Publish failed. If the name 'vexy-vlip-js' is taken by another owner," >&2
  echo "  publish it scoped instead: set package.json \"name\" to" >&2
  echo "  \"@vexyart/vexy-vlip-js\" (create the npm org first) and re-run." >&2
  exit 1
fi
echo "==> Published vexy-vlip-js@${VERSION}"
