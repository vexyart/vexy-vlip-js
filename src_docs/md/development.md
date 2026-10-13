# Development

This page covers building, testing and releasing `vexy-vlip-js` from a clone
of [github.com/vexyart/vexy-vlip-js](https://github.com/vexyart/vexy-vlip-js).

## Prerequisites

- Node.js (the repository's `.nvmrc` pins version 20) and npm.
- For the browser tests: Chromium for Playwright, installed with
  `npx playwright install chromium`.
- For the documentation site: [`uv`](https://docs.astral.sh/uv/), which runs
  ProperDocs through `uvx`.

## npm scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Two Vite passes: `VEXY_BUILD=element` writes `dist/vexy-vlip.element.js` (ES module that registers `<vexy-vlip>`), then `VEXY_BUILD=global` writes `dist/vexy-vlip.global.js` (IIFE that sets `window.VexyVlip`). Both with source maps. |
| `npm run preview` | `vite preview`. |
| `npm run test:unit` | `node --test`: pure-logic tests in `tests/*.test.js` for the parser, segments and cards. No browser. |
| `npm run test:e2e` | `node tests/e2e/run-e2e.mjs`: drives `tests/fixtures/player.html` in Chromium with the Playwright library. |
| `npm test` | Unit tests, then end-to-end tests. |
| `npm run build:docs` | Copy the `dist/` bundles and the `testdata/` media into `src_docs/md/`, and stamp cache-busting hashes into the demo pages. |

`dist/` is not committed. The `prepack` script runs `npm run build`, so
`npm pack` and `npm publish` always ship fresh bundles.

## The `build.sh` script

The root `build.sh` accepts one target:

| Command | Steps |
| --- | --- |
| `./build.sh` or `./build.sh all` | Unit tests, bundles, demo assets, documentation site. |
| `./build.sh package` | Unit tests and bundles. |
| `./build.sh docs` | Bundles, demo assets (`npm run build:docs`), then `src_docs/build.sh`. |

## Documentation site

The site you are reading is built with ProperDocs and the MaterialX theme.

- Markdown sources and the demo pages live in `src_docs/md/`.
- The configuration is `src_docs/mkdocs.yml`.
- `src_docs/build.sh` runs a strict build into `docs/`, which GitHub Pages
  serves at `https://vexy.dev/vexy-vlip-js/`. Do not edit `docs/` by hand:
  each build replaces it.
- `src_docs/build.sh serve` starts a live preview on `http://127.0.0.1:8000`.

To change a demo page, edit its file in `src_docs/md/` and rebuild.

The `.github/workflows/docs.yml` workflow rebuilds the bundles, the demo
assets and the site on every push to `main` that touches the sources, and
commits the updated `docs/` folder.

After a docs build, `node scripts/verify-docs.mjs` loads each demo page from
`docs/` in Chromium and checks that the player starts and shows cards.

## Continuous integration

`.github/workflows/ci.yml` runs on pushes to `main` and on pull requests: it
installs dependencies, runs the unit tests, builds the bundles, installs
Chromium and runs the end-to-end tests.

## Releasing

The git tag is the source of the version number.

- **From a GitHub Release.** Publishing a release for a `vX.Y.Z` tag runs
  `.github/workflows/publish.yml`. It writes the tag's version into
  `package.json`, runs the unit tests, builds the bundles and runs
  `npm publish --provenance --access public`. It needs npm trusted publishing
  or an `NPM_TOKEN` repository secret.
- **From a workstation.** `./publish.sh` runs `uvx gitnextver` to tag the next
  version, copies that version into `package.json` and the `version` export in
  `src/index.js`, builds, and publishes to npm. `./publish.sh --dryrun` packs
  the current version without publishing.

## Reference media

`testdata/` holds the media the tests and demos use. `testdata/playlines.mp4`
and `testdata/playlines.vtt` come from `scripts/capture-playlines.mjs`, which
records the Vexy Playlines editor with Playwright, and
`scripts/transcode-playlines.sh`, which transcodes the recording.
