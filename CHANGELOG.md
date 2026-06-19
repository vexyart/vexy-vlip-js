<!-- this_file: CHANGELOG.md -->

# Changelog

All notable changes to this project are documented here.

## [Unreleased]

### Added

- **Replay CTA** — after the video ends (and `loop` is off), a **Replay ↻** button appears over the dimmed first frame, mirroring the Start screen. Clicking it (or the frame / Space) restarts from the top. New `replayLabel` option / `replay-label` attribute, `replay()` method, and `vexyvlip:replay` event.
- **Video title** (`title` option / `video-title` attribute — `title` also works): shown two ways — (1) on the Start/Replay screen the CTA sits in a **card** with the title above the button; (2) during playback / while cards rest, a small, themeable **top-left title bar** (`titleBar` option to toggle; `titleColor`/`titleBg`/`titleSize` or `--vv-title-*` to style).
- **Prominent Start button in the title card** — when a title is set, **Start** is a filled "primary" (dark ground, light text) to stand out on the white card, configurable via `startBg`/`startFg` (`--vv-start-bg`/`--vv-start-fg`). **Replay** stays a low-key outlined pill (same as the in-card Next button).

### Changed

- **The in-card ← Back button is now hidden by default** and opt-in via the `back` option / `back` attribute (`nav` still controls the footer + Next). Programmatic `prev()` and the keyboard `←` are unaffected.
- Start/Replay buttons no longer carry a drop shadow, and the title card has more breathing room above the button.

## [1.0.0] — 2026-06-19

First stable release. A stop-motion redesign so stepped mode reads like a guided, card-based tutorial: white cards, rendered markdown, and in-card navigation over a dimmed video — plus a Start screen, auto-fitting cards, native WebVTT positioning, and a published npm package usable straight from a CDN.

### Packaging

- **Published to npm** as `vexy-vlip-js`, usable directly from JSDelivr / unpkg. The package ships both the ESM source (`src/`, zero-dependency, tree-shakeable) and prebuilt bundles (`dist/vexy-vlip.element.js` ESM web component, `dist/vexy-vlip.global.js` classic-script global). `unpkg`/`jsdelivr` fields point at the global build so a bare CDN URL serves the `<script>` bundle. See the README "Use from a CDN" section for versioned URLs and the JSDelivr-vs-`vexy.dev` guidance.
- **Cache-busted demo deploy**: `build:docs` stamps a short content hash (`?v=…`) onto the bundle `<script>`/`import` references in `docs/*.html`, so the GitHub-Pages / `vexy.dev` demo always serves the freshly built bundle after `./build.sh` instead of a cached copy. The hash only changes when a bundle changes, so unchanged builds don't churn the HTML.

### Added

- **Stepped-mode dimming overlay** (`overlay` option / attribute, default on): while resting on a card the video is dimmed behind a `--vv-overlay-bg` layer and paused. The dim is customizable via the `dim` option (a `0..1` opacity, or any CSS color) and `--vv-overlay-bg` (default `rgba(0,0,0,0.7)`).
- **In-card step navigation** (`nav` option, default on): each card carries a footer with a **Back** (`←`) button that jumps to the previous subtitle and an outlined-pill **Next →** button. The whole card is also clickable to advance. Labels are customizable via `nextLabel` / `prevLabel`. The footer never wraps — the **Next** button stays on one line.
- **Start screen** (`startLabel` option / `start-label` attribute): before playback begins, both modes show the dimmed first frame with a prominent, centered **Start →** button placed directly on the frame (no card), styled like **Next** but 20% larger. Clicking it — or the frame, or pressing Space — begins (stepped advances to the first card; continuous clears the dim and plays). Skipped when `autoplay` (continuous) or `startSegment` is set. The first frame is force-painted under the button (a tiny seek + `requestVideoFrameCallback`) so Safari/iOS show the real frame instead of a blank slate.
- **Reactive labels** — `start-label` / `next-label` / `prev-label` are observed attributes on `<vexy-vlip>`, so changing them live updates the button text.
- **In-card close button** (`closable` option, default on): a **×** in the card's top-right dismisses the cards and drops to a plain video player — switches to continuous mode and resumes playback, so cards then appear only for their cue duration with no dimming. Emits `vexyvlip:close`; exposed as a `close()` method.
- **Auto-fit / auto-scale** (`autoFit`, default on): cards grow up to `maxWidth` (default 72% of the player) to fit the subtitle, then — if the content still overflows the space the anchor leaves toward the edges — the whole card (text and buttons together) scales down to fit, no smaller than `minScale` (default 0.4). Pivots on the card's anchor so placement is preserved, and re-runs on container resize / fullscreen via a `ResizeObserver`.
- **Optional step counter** (`counter` option): the `n/total` counter is now **off by default** and opt-in.
- **Native WebVTT positioning** — `position`/`line` now accept the standard `position-align` / `line-align` sub-values (e.g. `position:82%,line-right line:22%,end`), resolved to the nine-point anchor. The whole anchor vocabulary is now expressible in pure WebVTT, so `testdata/playlines.vtt` (and `scripts/capture-playlines.mjs`) no longer emit JSON — JSON is reserved for per-cue styling. (Side effect: native cue-setting cards now honour their alignment instead of always anchoring bottom — e.g. `sample.vtt`'s "top-left" card now actually sits top-left.)
- **Fuller markdown rendering** in cards: headings, ordered/unordered lists, horizontal rules, and paragraphs, on top of the existing inline `**bold**`, `*italic*`, `` `code` ``, plus new `~~strike~~` and `[links](url)`. Still HTML-escaped first (XSS-safe), and `javascript:`/`data:` link targets are neutralised.
- **Theme options** mapped to CSS custom properties so colors and font are configurable without a stylesheet: `cardBg`, `cardFg`, `nextBg`, `nextFg`, `nextBorder`, `font`, `dim` (and matching kebab-case web-component attributes). New properties: `--vv-next-bg`, `--vv-next-fg`, `--vv-next-border`, `--vv-close-fg`, `--vv-dot`, `--vv-dot-active`.
- **`dots` option** (default on) to show/hide the step-dots bar.

### Changed

- **Cards are white by default** (`--vv-card-bg: #ffffff`, `--vv-card-fg: #1d2430`), in both continuous and stepped modes, with a softer shadow, roomier padding (`20px 24px`), a 16px radius, and a wider default max-width (72%).
- **The Next button is an outlined pill by default** (white ground, dark hairline border, dark bold text) per the reference design — set `--vv-next-bg` / `--vv-next-border` (or the `nextBg` / `nextBorder` options) for a filled look. The Start CTA reuses the same `--vv-next-*` theme.
- **The close (×) button is smaller** and more subtle.
- **Stepped-mode control bar reduced to the step dots only** — play, prev/next, time, mute, and fullscreen are hidden (keyboard shortcuts still work); the dots stay visible for jumping between steps.

### Removed

- **The floating "Click to continue" hint** (and the `hint` option / `--vv-hint-bg` / `--vv-hint-fg`) — superseded by the in-card **Next →** button.

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
