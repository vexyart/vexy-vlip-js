<!-- this_file: CLAUDE.md -->

# vexy-vlip-js — agent notes

Interactive explainer-video player: a `<video>` + a WebVTT cue file become
click-to-advance, styled, positioned on-screen cards. Zero runtime
dependencies. Ships as ESM, a `<vexy-vlip>` Web Component, and a classic-script
global. Part of the `vexy-stax-dev/` wrapper — work only inside
`vexy-vlip-js/`; the sibling packages are handled separately.

## Source map

- `src/index.js` — public ESM entry. Side-effect free; importing it does NOT
  register the custom element.
- `src/element.js` — the `<vexy-vlip>` custom element. Importing registers it as
  a side effect; maps kebab-case attributes → options and is reactive.
- `src/global.js` — classic-script IIFE entry; exposes `window.VexyVlip` and
  auto-registers the element.
- `src/player.js` — `VexyVlip`, the core player. Wraps the `<video>`, drives
  continuous vs stepped playback, the eased `requestAnimationFrame` travel loop,
  the Start/Replay screen, and event dispatch. Largest file.
- `src/vtt.js` — pure WebVTT parsing + cue → card-model helpers. No DOM, so it
  is unit-testable under `node --test`.
- `src/segments.js` — pure segment / stop-point navigation (next/prev/current).
- `src/cards.js` — DOM rendering + placement maths for a card model.
- `src/styles.js` — the stylesheet as a string (adopted into the shadow root or
  injected once into `<head>`); all knobs are CSS custom properties.

## Build & test

- `npm run build` — two Vite passes (`VEXY_BUILD=element`, then `global`) →
  `dist/vexy-vlip.element.js` + `dist/vexy-vlip.global.js`. `dist/` is gitignored.
- `npm run test:unit` — `node --test` over `tests/` (29 pure-logic checks).
- `npm run test:e2e` — `tests/e2e/run-e2e.mjs`, a Playwright-library harness
  (19 checks; needs Chromium via `npx playwright install chromium`).
- `npm run build:docs` — copies bundles + testdata media into `src_docs/md/` and
  content-hash-stamps the functional demo pages for cache-busting.
- `src_docs/build.sh` — ProperDocs strict build of `src_docs/md/` into `docs/`
  (wipes `docs/`). `./build.sh docs` runs bundles + build:docs + this.

## Docs & release

- README ≤200 lines (quick start). Full docs live in `src_docs/md/*.md`
  (config `src_docs/mkdocs.yml`), published at `vexy.dev/vexy-vlip-js/`.
- Demo pages (`demo.html`, `demo-*.html`), media and bundles live in
  `src_docs/md/` and are copied verbatim into `docs/`. Never edit `docs/` by hand.
- `.github/workflows/docs.yml` rebuilds bundles + site on push to main and
  commits `docs/`.
- Release: `uvx gitnextver@latest <this folder>` commits, bumps the patch tag,
  and pushes. Publishing a GitHub Release from that tag triggers
  `.github/workflows/publish.yml` → `npm publish` (needs npm trusted publishing
  or an `NPM_TOKEN` secret).

## Gotchas

- Nested under `vexy-stax-dev/` — never touch sibling directories.
- `gitnextver` stages everything; if a now-ignored file is still tracked,
  untrack it in a separate commit AFTER the release, not before.
- Card `text` is always HTML-escaped; `html` cards are trusted input —
  `sanitize: true` is a convenience filter, not a hardened sanitizer.
