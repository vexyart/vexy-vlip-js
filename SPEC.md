<!-- this_file: SPEC.md -->

# Vexy Vlip — Specification

Vexy Vlip is a small, dependency-free browser library that turns a single
**video + WebVTT file** into an interactive, click-to-advance explainer. The
WebVTT cues are not treated as optional subtitles; they are **on-screen cards**
— styled, positioned typographic panels that explain what is happening on
screen. The library ships in three flavours, like its sibling `vexy-stax-js`:

- **ESM module** — `import { VexyVlip } from "vexy-vlip-js"`.
- **Web Component** — `<vexy-vlip src="..." track="...">` (auto-registers on import of the element build).
- **Classic-script global** — `window.VexyVlip` from a single `<script>` tag.

The single design sentence that bounds scope:

> *Play one video, drive styled HTML cards from its WebVTT track, and let the
> viewer step through the video card-by-card or watch it continuously — with
> nothing but native browser APIs.*

Everything outside that sentence (transcoding, streaming, analytics, editing)
is out of scope.

---

## 1. Background & architecture decision

The two research notes (`research/webvideotrack.md`,
`research/webvideoscrubbing.md`) converge on one recommendation, which this
spec adopts:

- Use a native `<video>` element for playback (0 KB, hardware-accelerated).
- Attach the WebVTT as a **hidden metadata/subtitle track** and read it with the
  `TextTrack` / `VTTCue` API — *do not* let the browser render captions.
- Render each active cue as a **custom absolutely-positioned HTML card** in an
  overlay layer, so we get arbitrary background, padding, radius, border,
  shadow, fonts and placement that `::cue` styling cannot provide.
- Implement the stop / play / stop sequencing ("stepped" mode) ourselves with a
  precise pause engine built on `requestVideoFrameCallback` (rVFC), falling back
  to `timeupdate` + `requestAnimationFrame`.

Consequences:

- **Zero runtime dependencies.** Native APIs only. Vite bundles the source into
  the element and global builds; the ESM build is the unbundled source.
- Cards are real DOM → crisp, accessible, responsive, localisable.
- The `.vtt` file is simultaneously the **script** (text/timing) and the
  **layout metadata** (per-card placement and style).

MediaBunny / WebCodecs are explicitly **not** a dependency. Optional eased
segment playback (§6) is achieved natively by driving `currentTime` on a
`requestAnimationFrame` loop. MediaBunny is noted as a possible future
enhancement only.

---

## 2. Cue payload format

A cue's payload may be **either** plain text **or** a JSON object. Detection:
the trimmed payload starting with `{` is parsed as JSON; if parsing fails it is
treated as plain text (so authors never get a silent blank card).

### 2.1 Plain text cues

```
WEBVTT

00:00.000 --> 00:03.000 position:20% line:80% size:40% align:start
Click the **Export** button in the toolbar.
```

Plain text honours **native WebVTT cue settings** for placement:

| Cue setting | Meaning in Vexy Vlip |
| --- | --- |
| `position:N%` | Horizontal anchor of the card (relative to video width). |
| `line:N%` | Vertical anchor of the card (relative to video height). `line` integers are interpreted as percentage-ish lines from the top. |
| `size:N%` | Card width as a percentage of video width. |
| `align:start\|center\|end` | Text alignment inside the card **and** the anchor edge. |
| `vertical:rl\|lr` | Reserved; cards remain horizontal (setting is ignored for layout but preserved). |

Plain-text cards inherit the player's default card style (set via options / CSS
custom properties). A tiny inline markdown subset is supported in text:
`**bold**`, `*italic*`, `` `code` `` and line breaks. No raw HTML from plain
text (XSS-safe).

### 2.2 JSON cues

```
WEBVTT

00:05.000 --> 00:08.000
{ "text": "Now drag the slider to fan the cards out.",
  "x": 8, "y": 62, "w": 36, "anchor": "top-left",
  "bg": "#10243a", "fg": "#eaf2ff", "radius": 14, "padding": "14px 18px",
  "shadow": "0 8px 30px rgba(0,0,0,.45)", "class": "tip" }
```

JSON card fields (all optional except one of `text`/`html`):

| Field | Type | Default | Notes |
| --- | --- | --- | --- |
| `text` | string | — | Plain text + markdown subset. Mutually exclusive-ish with `html`. |
| `html` | string | — | Trusted HTML (author-controlled VTT). Sanitised only if `sanitize` option on. |
| `x` | number/string | derived | Horizontal anchor; number = % of width, string = CSS length. |
| `y` | number/string | derived | Vertical anchor; number = % of height, string = CSS length. |
| `w` | number/string | `auto` (≤`cardMaxWidth`) | Card width. |
| `anchor` | enum | `center` | `top-left`…`bottom-right`, `center`, `top`, `bottom`, `left`, `right`. Which point of the card sits at (x,y). |
| `align` | enum | `start` | Text alignment inside the card. |
| `bg` | string | option | Card background (any CSS color / gradient). |
| `fg` | string | option | Foreground (text) color. |
| `font` | string | option | CSS `font` shorthand or family. |
| `padding` | string | option | CSS padding. |
| `radius` | number/string | option | Border radius. |
| `border` | string | option | CSS border. |
| `shadow` | string | option | CSS box-shadow. |
| `opacity` | number | `1` | Backdrop opacity helper (applied to bg only when bg is a solid color). |
| `class` | string | — | Extra class name(s) added to the card for app CSS. |
| `enter` / `exit` | enum | `fade` | Per-card transition override (`fade`, `slide-up`, `slide-down`, `none`). |

When `x`/`y`/`w` are omitted, placement falls back to the cue's native
`position`/`line`/`size`/`align` settings, then to the player default
(`anchor: bottom`, centered, `y: 86%`).

---

## 3. Public API

### 3.1 `VexyVlip` (core class — `src/index.js`)

```js
import { VexyVlip } from "vexy-vlip-js";

const vlip = new VexyVlip(targetEl, {
  src: "demo.mp4",
  track: "demo.vtt",          // URL, or { src } / inline string via `vtt`
  mode: "stepped",            // "continuous" | "stepped"  (default "continuous")
  easing: "ease-in-out",      // "linear" | "ease-in-out" | "ease-in" | "ease-out"
  controls: true,             // show the minimal control bar
  autoplay: false, loop: false, muted: false, poster: "poster.jpg",
  startAt: 0,                 // initial time (s) or segment index via startSegment
  // card defaults (also settable via CSS custom properties):
  cardBackground: "rgba(12,18,28,.9)", cardColor: "#fff",
  cardFont: "", cardPadding: "14px 18px", cardRadius: "12px",
  cardBorder: "", cardShadow: "0 6px 24px rgba(0,0,0,.4)", cardMaxWidth: "44%",
  sanitize: false,            // sanitize JSON `html` cards
  keyboard: true,             // space/enter/arrows
});
```

`targetEl` is a container element. The constructor builds the DOM (§4) inside
it. Passing an existing `<video>` element adopts it instead of creating one.

**Methods**

| Method | Description |
| --- | --- |
| `play()` / `pause()` / `toggle()` | Playback. In stepped mode `play()` advances toward the next stop point. |
| `next()` / `prev()` | Jump to next/previous segment (stepped: play-to/seek). |
| `seekTo(time)` / `goToSegment(i)` | Programmatic navigation. |
| `setMode(mode)` | Switch between `continuous`/`stepped` live. |
| `setEasing(easing)` | Change segment easing. |
| `showCard(i)` / `hideCard()` | Manual card control. |
| `getSegments()` | Parsed segment array (read-only copy). |
| `destroy()` | Remove DOM, listeners, rVFC handles. |

**Properties (getters):** `segments`, `currentSegment`, `currentTime`,
`duration`, `mode`, `playing`, `ready`.

**Events** (dispatched on the container element, `vexyvlip:` prefix; the web
component re-dispatches them):

`ready`, `play`, `pause`, `ended`, `segmententer` (`{index, segment}`),
`segmentexit`, `cardshow`, `cardhide`, `stop` (reached a stop point in stepped
mode), `error`.

### 3.2 Web Component — `src/element.js`

`<vexy-vlip>` registers automatically when `src/element.js` (or the global
build) loads. Attributes mirror options (kebab-case): `src`, `track`, `mode`,
`easing`, `controls`, `autoplay`, `loop`, `muted`, `poster`, `start-at`,
`card-background`, `card-color`, `card-padding`, `card-radius`, `card-border`,
`card-shadow`, `card-max-width`, `keyboard`, `sanitize`.

Boolean attributes follow HTML semantics (presence = true). Attributes are
reactive via `observedAttributes`. The element exposes the same methods/getters
by delegating to its internal `VexyVlip`. Theming via CSS custom properties on
the host (see §4.3). Slotted `<video>`/`<track>` are adopted if present.

### 3.3 Global build — `src/global.js`

Exposes `window.VexyVlip` (the class, with `.Element` and `.version`
properties) and auto-registers `<vexy-vlip>`. Single `<script src="vexy-vlip.global.js">`.

---

## 4. DOM & rendering

### 4.1 Structure

```
<div class="vexy-vlip" data-mode="stepped">
  <video class="vexy-vlip__video" playsinline></video>
  <div class="vexy-vlip__cards" aria-live="polite"></div>      <!-- overlay -->
  <button class="vexy-vlip__tap" aria-label="Advance"></button> <!-- stepped only -->
  <div class="vexy-vlip__controls">…play / prev / next / progress dots…</div>
</div>
```

The cards layer is `position:absolute; inset:0; pointer-events:none`; individual
cards re-enable pointer events. The video keeps its intrinsic aspect ratio; the
container is `position:relative` and sizes to the video.

### 4.2 Card placement math

Given anchor point `(x%, y%)` of the video box and an `anchor` keyword, the card
is positioned with `left/top` + a `translate()` so the chosen anchor corner of
the card lands on `(x,y)`. Cards are clamped to stay within the video box
(configurable via `clamp` option, default true).

### 4.3 Styling / theming

CSS custom properties (defaults in `:host` / `.vexy-vlip`):

`--vv-card-bg`, `--vv-card-fg`, `--vv-card-font`, `--vv-card-padding`,
`--vv-card-radius`, `--vv-card-border`, `--vv-card-shadow`,
`--vv-card-max-width`, `--vv-accent`, `--vv-controls-bg`.

Per-cue JSON fields override these via inline styles. The web component scopes
styles in Shadow DOM; the class build injects a single `<style>` once into the
document head (idempotent).

---

## 5. Playback engine

### 5.1 Segments & stop points

On `loadedmetadata` + track load, parse all cues into:

```
segment = { index, start, end, data /* parsed payload */, raw }
```

Stop points (stepped mode) = each `segment.start`. The card for segment *i*
appears when playback reaches `segment.start` and (stepped) the video pauses
there; the card persists until the viewer advances. In continuous mode the card
is visible during `[start, end]`.

### 5.2 Precise pause (stepped mode)

Sequence per IDEA §6:

1. Start paused (or at `startAt`). No card, or the card for the current segment
   if `startAt` lands inside one.
2. **Advance** (click / Space / `play()`): hide current card, `video.play()`.
3. A per-frame watcher (rVFC, fallback rAF) compares `currentTime` to the next
   stop point. On crossing: `video.pause()`, snap `currentTime` to the stop
   point, show that segment's card, emit `stop` + `cardshow`.
4. After the **last** card, the next advance plays to the end and emits `ended`.

Drift handling: stop slightly defensively (`currentTime + frameSlack >= target`)
then snap, to avoid overshoot on coarse `timeupdate`.

### 5.3 Continuous mode

Native `play()`; the frame watcher only swaps cards on cue enter/exit. Clicking
toggles play/pause. Cards do not block playback.

---

## 6. Eased segment playback (optional)

When `easing !== "linear"`, segment playback (the travel between two stop points,
both modes) is driven manually:

- `video.pause()`, then a rAF loop advances `video.currentTime` from `t0` to `t1`
  over a wall-clock duration `= (t1 - t0) / playbackRate`, mapping progress
  through a cubic ease curve (`ease-in-out` = smoothstep, etc.).
- Audio is muted during eased travel (scrubbing audio is unusable) and restored
  at the stop point.
- Requires a seek-friendly file (faststart + short GOP); the spec's encoding
  checklist (§9) covers this. If `requestVideoFrameCallback` is unavailable the
  loop still runs on rAF with `seeked` coalescing.

Easing is **off by default** (`linear` → native playback with audio).

---

## 7. Accessibility & input

- Cards are focusable regions with `role="note"`; the cards layer is an
  `aria-live="polite"` region so advancing announces the new card.
- Keyboard (when `keyboard:true`): `Space`/`Enter` = advance/toggle, `→`/`←` =
  next/prev segment, `f` = fullscreen, `m` = mute.
- The tap layer has an accessible label; pointer, touch and keyboard all map to
  "advance" in stepped mode.
- Respects `prefers-reduced-motion` (disables card transitions and forces
  `linear` easing).

---

## 8. Build, packaging, deployment

- **Tooling:** Vite lib mode, two passes via `VEXY_BUILD` env (mirrors
  `vexy-stax-js`): `element` → `dist/vexy-vlip.element.js` (ESM, auto-registers),
  `global` → `dist/vexy-vlip.global.js` (IIFE, `window.VexyVlip`).
- **package.json:** `type: module`, `exports` → `./src/index.js`, `files`
  includes `src`, `README`, `LICENSE`, `CHANGELOG`. Zero runtime deps; devDeps
  `vite`, `@playwright/test`. Scripts: `dev`, `build`, `test:unit`
  (`node --test`), `test`, `build:docs`.
- **Tests:** `node --test` unit tests for the VTT parser and segment/stop-point
  logic (pure functions, no DOM). Playwright e2e drives a demo page asserting
  stepped pausing, card show/hide, continuous playback.
- **Docs site** (`docs/`, GitHub Pages at `https://vexy.dev/vexy-vlip-js/`):
  `index.html` landing + live demo, `demo-module.html` (ESM), `demo-component.html`
  (web component), `demo-library.html` (global script). `scripts/build-docs.mjs`
  copies the built bundles into `docs/`.
- **Reference media** (`testdata/`): a ≤30 s screen recording of
  `https://playlines.vexy.art/` captured via Playwright video recording,
  transcoded to faststart MP4, plus an authored `playlines.vtt` with ~10 cards
  pinned to the meaningful click/drag moments.
- **CI/CD:** GitHub Actions builds `docs/` and deploys to Pages on push to main.
  `publish.sh` bumps the version (`gitnextver`), builds, and `npm publish`es
  (mirrors `vexy-stax-js`).

## 9. Encoding checklist for source videos

1. **Faststart**: `ffmpeg -i in -movflags +faststart out.mp4` (instant metadata).
2. **Short GOP / all-intra for scrub-heavy clips** so eased seeking is smooth.
3. H.264/AAC MP4 for the broadest playback; provide `poster` for first paint.
4. Keep tutorial clips short (≤60 s) — Vexy Vlip is for explainers, not feature films.

## 10. Non-goals

Transcoding, adaptive streaming (HLS/DASH), server components, analytics,
multi-track audio, editing/export, and any WebCodecs/Wasm dependency. A future
optional adapter could add MediaBunny-based frame-exact scrubbing, but the core
stays native and dependency-free.
