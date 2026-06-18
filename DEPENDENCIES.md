<!-- this_file: DEPENDENCIES.md -->

# Dependencies

## Runtime

**Zero.** The player uses native browser APIs only:

- `HTMLVideoElement` — playback, `src`, `currentTime`, `playbackRate`, `muted`, `loop`, `poster`
- `TextTrack` / `VTTCue` concepts — the VTT file is fetched and parsed by the library's own parser (`src/vtt.js`); the browser's caption renderer is never engaged
- `requestVideoFrameCallback` (with `requestAnimationFrame` fallback) — frame-precise pause engine for stepped mode and eased segment travel
- Custom Elements v1 / Shadow DOM — `<vexy-vlip>` web component (`src/element.js`)
- `fetch` — loading the `.vtt` track URL
- `CustomEvent`, Fullscreen API — standard DOM plumbing

No npm packages are shipped to end users.

## Development

| Package | Version | Why |
| --- | --- | --- |
| `vite` | `^7.1.12` | Dev server and two-pass library build (`VEXY_BUILD=element` → ESM bundle that auto-registers the custom element; `VEXY_BUILD=global` → IIFE that sets `window.VexyVlip`) |
| `playwright` | `^1.56.1` | Browser automation library used directly in `tests/e2e/run-e2e.mjs`; the `@playwright/test` runner is intentionally not used because its ESM loader is broken under Node 26 |
