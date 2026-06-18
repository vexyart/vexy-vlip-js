<!-- this_file: CHANGELOG.md -->

# Changelog

All notable changes to this project are documented here.

## [0.1.0] — 2026-06

### Added

- **Zero-dependency core player** (`src/player.js`): wraps a native `<video>`, fetches and parses a WebVTT track, and drives two playback modes with no runtime npm dependencies.
- **WebVTT parser** (`src/vtt.js`): plain-text cues with a markdown subset (`**bold**`, `*italic*`, `` `code` ``, line breaks) and JSON cue payloads detected by a leading `{`; JSON parse failure falls back to plain text so no cue is ever silently blank.
- **Native cue-setting placement**: `position`, `line`, `size`, and `align` WebVTT cue settings map to card horizontal/vertical anchors and width; JSON cards additionally accept `x`, `y`, `w`, and `anchor` fields with a full nine-point anchor vocabulary (`top-left` … `bottom-right`, `center`, etc.).
- **Continuous mode**: normal `video.play()` with a frame watcher (rVFC → rAF fallback) that swaps the active card as cues enter and exit.
- **Stepped (stop-motion) mode**: plays to each cue's `start` time, snaps `currentTime`, shows the card, and waits for a click / Space / `next()` call to advance; a drift-guard (`currentTime + EPS >= target`) prevents overshoot on coarse `timeupdate`.
- **Optional eased segment playback**: when `easing` is not `"linear"`, a `requestAnimationFrame` loop advances `currentTime` through a cubic ease curve (smoothstep for `ease-in-out`); audio is muted during travel and restored at the stop point.
- **Custom-styled positioned cards** (`src/cards.js`): absolutely positioned HTML panels rendered in an overlay layer (`pointer-events: none` on the layer; individual cards re-enable pointer events); placement math translates a nine-point anchor to `left`/`top` + `translate()`, decoupled from the enter/exit animation via a wrapper + inner body element.
- **CSS custom-property theming** (`src/styles.js`): ten `--vv-*` properties cover card background, foreground, font, padding, radius, border, shadow, max-width, accent color, and controls background; the web component scopes them in Shadow DOM; the class build injects a single `<style>` into `<head>` (idempotent).
- **Card transitions**: `fade` (default), `slide-up`, `slide-down`, `none`; per-card override via JSON `enter`/`exit` fields; all transitions suppressed under `prefers-reduced-motion`.
- **ESM build** (`src/index.js`): side-effect-free; exports `VexyVlip`, `DEFAULTS`, VTT parser helpers, segment helpers, and style utilities.
- **Web Component** (`src/element.js`): `<vexy-vlip>` auto-registers on import; maps kebab-case attributes to options; `src`, `track`, `vtt`, and `controls` changes rebuild the player while `mode`, `easing`, `muted`, `loop`, and `poster` apply live; Shadow DOM scoped styles; delegated methods and getters on the host element.
- **IIFE global build** (`src/global.js`): sets `window.VexyVlip` (class, with `.Element` and `.version`) and auto-registers `<vexy-vlip>`; single `<script>` tag usage.
- **Two-pass Vite library build** (`vite.config.js`, `build.sh`): `VEXY_BUILD=element` → `dist/vexy-vlip.element.js`; `VEXY_BUILD=global` → `dist/vexy-vlip.global.js`.
- **Minimal control bar**: prev / play-pause / next buttons, segment dot indicators (clickable), time readout (`m:ss / m:ss`), mute toggle, fullscreen button; auto-hides on hover-out in playing state.
- **Keyboard and accessibility**: Space/Enter advances or toggles, `→`/`←` navigate segments, `F` toggles fullscreen, `M` toggles mute; cards layer is `aria-live="polite"`; cards have `role="note"`; tap target has an accessible label; `prefers-reduced-motion` disables transitions.
- **24 `node --test` unit tests** covering the VTT parser (plain text, JSON, fallback, markdown, cue settings) and segment/stop-point logic (pure functions, no DOM).
- **8 Playwright-library e2e checks** (`tests/e2e/run-e2e.mjs`): ready/segment count, stepped pause-at-first-cue with card shown, advancing twice, continuous card-on-play, control-bar dot count, `prev()` navigation, a cue at `00:00` not being skipped, and `destroy()` removing all chrome; the runner uses the Playwright library API directly (not `@playwright/test`) to avoid ESM loader issues under Node 26.
- **GitHub Pages demo site** (`docs/`): landing page with live demo, plus `demo-module.html`, `demo-component.html`, and `demo-library.html`; deployed to GitHub Pages from `main`/`docs` on push, with a CI workflow running unit + e2e checks.
- **Reference testdata** (`testdata/`): Vexy Playlines screen recording captured via Playwright video, transcoded to faststart MP4, with an authored `playlines.vtt` tracking the meaningful interaction moments; `sample.vtt` mixing plain-text and JSON cues for unit tests and manual demos.
