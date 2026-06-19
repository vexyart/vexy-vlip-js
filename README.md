<!-- this_file: README.md -->

# vexy-vlip-js

Turn a single video + WebVTT file into a click-to-advance explainer with styled, positioned on-screen cards — zero runtime dependencies.

## What it is

Vexy Vlip reads a WebVTT track alongside a `<video>` and renders each cue as a real HTML card: arbitrary background, padding, radius, shadow, and pixel-perfect placement — things the browser's `::cue` pseudo-element cannot provide. Two playback modes:

- **Continuous** — normal playback; cards appear and disappear with their cue timings.
- **Stepped** — plays to each cue's start time, pauses, shows the card; the viewer clicks (or presses Space) to advance. Like a narrated slideshow that still looks like a video.

Optional eased segment travel (`ease-in-out`, etc.) drives `currentTime` on a `requestAnimationFrame` loop for cinematic scrubbing between stop points. All cards are real DOM — focusable, localizable, responsive.

## Install

```bash
npm i vexy-vlip-js
```

## Usage

Three ways to drop a player on a page, easiest first.

### Web Component

```html
<!-- auto-registers <vexy-vlip> as a side effect -->
<script type="module" src="./dist/vexy-vlip.element.js"></script>

<vexy-vlip
  src="demo.mp4"
  track="demo.vtt"
  mode="stepped"
  controls>
</vexy-vlip>
```

Boolean attributes follow HTML semantics — presence means `true`. Attributes are reactive: changing `mode` or `easing` on the element updates the live player. Import `vexy-vlip-js/element` in a module context to auto-register without a bundled file.

### ES Module

```js
import { VexyVlip } from "vexy-vlip-js";

const vlip = new VexyVlip(document.querySelector("#stage"), {
  src: "demo.mp4",
  track: "demo.vtt",
  mode: "stepped",   // "continuous" | "stepped"  (default: "continuous")
  controls: true,
});

// Methods are available immediately; track loading is async internally.
document.querySelector("#next").addEventListener("click", () => vlip.next());

// Events bubble on the container element.
document.querySelector("#stage").addEventListener("vexyvlip:stop", (e) => {
  console.log("paused at segment", e.detail.index);
});
```

### Classic script global

```html
<script src="./dist/vexy-vlip.global.js"></script>
<script>
  // window.VexyVlip is the class; <vexy-vlip> is also auto-registered.
  const vlip = new VexyVlip(document.querySelector("#stage"), {
    src: "demo.mp4",
    track: "demo.vtt",
    mode: "continuous",
  });
</script>
```

## Use from a CDN (no install, no build)

You can load the player straight from a `<script>`/`import` with no npm install. Two sources:

### JSDelivr (recommended) — versioned & immutable, from npm

Pin a version so your page never breaks when a new release ships (`@1.0.0` = exact, `@1` = latest 1.x, omit = latest):

```html
<!-- Web Component: auto-registers <vexy-vlip> -->
<script type="module"
  src="https://cdn.jsdelivr.net/npm/vexy-vlip-js@1/dist/vexy-vlip.element.js"></script>
<vexy-vlip src="demo.mp4" track="demo.vtt" mode="stepped" controls></vexy-vlip>
```

```html
<!-- Classic global: window.VexyVlip + <vexy-vlip>. The bare URL resolves to the
     global build via the package's "jsdelivr" field. -->
<script src="https://cdn.jsdelivr.net/npm/vexy-vlip-js@1"></script>
<script>
  const vlip = new VexyVlip(document.querySelector("#stage"),
    { src: "demo.mp4", track: "demo.vtt", mode: "continuous" });
</script>
```

```js
// ESM API (no auto-register), straight from the CDN:
import { VexyVlip } from "https://cdn.jsdelivr.net/npm/vexy-vlip-js@1/src/index.js";
// or the auto-bundled form: https://cdn.jsdelivr.net/npm/vexy-vlip-js@1/+esm
```

unpkg works with the same paths (`https://unpkg.com/vexy-vlip-js@1/dist/…`).

### vexy.dev — the project's own demo site

The bundles that power <https://vexy.dev/vexy-vlip-js/> are served alongside it:

```html
<script type="module" src="https://vexy.dev/vexy-vlip-js/vexy-vlip.element.js"></script>
<!-- or the global build -->
<script src="https://vexy.dev/vexy-vlip-js/vexy-vlip.global.js"></script>
```

**Which to use?** Use **JSDelivr** for anything real — it's version-pinnable, immutable, and globally cached from the published npm release. The **vexy.dev** URLs are unversioned and always track the latest deployed site (they can change without notice), so they're best for quick demos and prototyping, not production embeds.

## Cue / card authoring

The `.vtt` file is both the timing script and the layout spec for each card. Two formats:

### Plain text + WebVTT cue settings

```webvtt
WEBVTT

00:02.000 --> 00:05.000 position:70%,line-right line:24%,start size:38%
Click the **Export** button in the toolbar.
```

Supported cue settings (all percentages):

| Setting | Effect |
| --- | --- |
| `position:N%[,line-left\|center\|line-right]` | Horizontal pin (% of width); the optional **position-align** picks the box edge/centre pinned there |
| `line:N%[,start\|center\|end]` | Vertical pin (% of height); the optional **line-align** picks the edge (`start`=top, `end`=bottom) |
| `size:N%` | Card width as % of video width |
| `align:start\|center\|end` | Text alignment (also the default position-align when that's omitted) |

`position-align` × `line-align` resolve to the nine-point anchor — e.g. `line-right` + `end` = `bottom-right`, `center` + `start` = `top`. With no `line`, the card sits at the bottom. So everything the JSON `anchor` does is expressible in pure WebVTT (this is how `testdata/playlines.vtt` is authored — no JSON).

Inline markdown subset: `**bold**`, `*italic*`, `` `code` ``, line breaks. No raw HTML (XSS-safe).

### JSON payload

A cue whose trimmed payload starts with `{` is parsed as a JSON card. All fields are optional except one of `text` or `html`. If JSON parsing fails the payload is treated as plain text — no silent blank cards. JSON is only needed for things plain WebVTT can't express — **per-cue styling** (`bg`, `fg`, `shadow`, …) and trusted `html` — since positioning is fully covered by the native cue settings above.

```webvtt
00:05.000 --> 00:08.000
{ "text": "Drag the slider to fan the cards out.",
  "x": 8, "y": 62, "w": 36, "anchor": "top-left",
  "bg": "#10243a", "fg": "#eaf2ff", "radius": 14, "padding": "14px 18px",
  "shadow": "0 8px 30px rgba(0,0,0,.45)", "class": "tip" }
```

| Field | Type | Default | Notes |
| --- | --- | --- | --- |
| `text` | string | — | Plain text + markdown subset |
| `html` | string | — | Trusted HTML (sanitized only when `sanitize: true`) |
| `x` | number/string | derived | Horizontal anchor; number = % of width, string = CSS length |
| `y` | number/string | derived | Vertical anchor; number = % of height |
| `w` | number/string | `auto` | Card width |
| `anchor` | enum | `center` | `top-left` … `bottom-right`, `center`, `top`, `bottom`, `left`, `right` |
| `align` | enum | `start` | Text alignment inside the card |
| `bg` | string | option | Card background (CSS color or gradient) |
| `fg` | string | option | Foreground (text) color |
| `font` | string | option | CSS `font` shorthand or family |
| `padding` | string | option | CSS padding |
| `radius` | number/string | option | Border radius |
| `border` | string | option | CSS border |
| `shadow` | string | option | CSS box-shadow |
| `opacity` | number | `1` | Applied to solid `bg` color only |
| `class` | string | — | Extra class names for app CSS |
| `enter` / `exit` | enum | `fade` | Per-card transition: `fade`, `slide-up`, `slide-down`, `none` |

When `x`/`y`/`w` are absent, placement falls back to the cue's native `position`/`line`/`size` settings, then to the player default (bottom-center, `y: 86%`).

> **Security note.** Plain-text and JSON `text` cards are always HTML-escaped. A JSON `html` card is inserted as-is; `sanitize: true` strips `<script>`/`<style>`/`<iframe>`/`<object>`/`<embed>`, `on*` handlers and `javascript:` URLs, but it is a convenience filter, **not** a hardened sanitizer (it does not cover `data:` URLs, `srcdoc`, SVG `<use>`, `formaction`, CSS `url()`, etc.). Treat the WebVTT file as trusted, author-controlled content. For untrusted input, sanitize upstream with a vetted library (e.g. DOMPurify).

## Options

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `src` | string | `""` | Video URL |
| `track` | string | `""` | WebVTT URL |
| `vtt` | string | `""` | Inline VTT text (alternative to `track`) |
| `mode` | `"continuous"\|"stepped"` | `"continuous"` | Playback mode |
| `easing` | `"linear"\|"ease-in-out"\|"ease-in"\|"ease-out"` | `"linear"` | Segment travel easing (linear = native playback with audio) |
| `controls` | boolean | `true` | Show the control bar |
| `autoplay` | boolean | `false` | |
| `loop` | boolean | `false` | |
| `muted` | boolean | `false` | |
| `poster` | string | `""` | Poster image URL |
| `startAt` | number | `0` | Initial time in seconds |
| `startSegment` | number | `null` | Start at a segment index |
| `keyboard` | boolean | `true` | Space/Enter/Arrows/F/M shortcuts |
| `sanitize` | boolean | `false` | Strip unsafe tags/attrs from `html` cards |
| `title` | string | `""` | Video title — shown in the Start/Replay card and a small top-left bar during playback |
| `titleBar` | boolean | `true` | When a title is set, show the small top-left title during playback |
| `overlay` | boolean | `true` | Dim the video behind a resting card in stepped mode |
| `nav` | boolean | `true` | Show the in-card **Next** button (and **Back** when `back` is on) in stepped mode |
| `back` | boolean | `false` | Show the in-card **←** Back button (hidden by default; opt-in) |
| `closable` | boolean | `true` | Show the in-card **×** that dismisses the cards to plain video mode |
| `counter` | boolean | `false` | Show the `n/total` step counter in the in-card nav |
| `dots` | boolean | `true` | Show the step-dots bar |
| `autoFit` | boolean | `true` | Grow cards to fit their text, then scale the whole card down if it still overflows |
| `minScale` | number | `0.4` | Lower bound for the auto-fit scale (readability floor) |
| `maxWidth` | number | `72` | Card grow cap, as a % of the player width (also sets `--vv-card-max-width`) |
| `nextLabel` | string | `"Next →"` | Label for the in-card Next button |
| `prevLabel` | string | `"←"` | Label for the in-card Back button |
| `startLabel` | string | `"Start →"` | Label for the Start CTA |
| `replayLabel` | string | `"Replay ↻"` | Label for the Replay CTA (shown after the video ends) |
| `cardBg` | string | `""` | Card background — sets `--vv-card-bg` |
| `cardFg` | string | `""` | Card text color — sets `--vv-card-fg` |
| `nextBg` | string | `""` | Next button background — sets `--vv-next-bg` |
| `nextFg` | string | `""` | Next button text color — sets `--vv-next-fg` |
| `nextBorder` | string | `""` | Next button border — sets `--vv-next-border` |
| `startBg` | string | `""` | Start button background (the prominent CTA in the title card) — sets `--vv-start-bg` |
| `startFg` | string | `""` | Start button text color — sets `--vv-start-fg` |
| `titleColor` | string | `""` | Top-left title color — sets `--vv-title-fg` |
| `titleBg` | string | `""` | Top-left title background — sets `--vv-title-bg` |
| `titleSize` | string | `""` | Top-left title font size — sets `--vv-title-size` |
| `font` | string | `""` | Card font — sets `--vv-card-font` |
| `dim` | string\|number | `""` | Overlay dim — a `0..1` number = black at that opacity; or any CSS color. Sets `--vv-overlay-bg` |

Card text is rendered as a **markdown subset**: headings, ordered/unordered lists, horizontal rules, paragraphs, plus inline `**bold**`, `*italic*`, `` `code` ``, `~~strike~~` and `[links](url)`. Input is HTML-escaped first, so raw HTML never survives (and `javascript:` links are neutralised). The whole card is clickable to advance; the **Next** / **Back** buttons and dots navigate explicitly, and the **×** drops to a plain video player (continuous mode — cards then show only for their cue duration, with no dimming).

**Start / Replay screen:** before playback (and again after the video ends), both modes show the dimmed first frame with a centered CTA — **Start →** to begin, **Replay ↻** to restart. Clicking it (or the frame, or pressing Space) begins/restarts; stepped mode advances to the first card, continuous mode plays through. The Start screen is skipped when `autoplay` (continuous) or `startSegment` is set; Replay is skipped when `loop` is on. The first frame is force-painted under the CTA so Safari/iOS show the real frame, not a blank slate.

**Title:** set `title` to give the video a name. It appears two ways: (1) on the Start/Replay screen the CTA sits in a **card** with the title above the button — there the **Start** button is a prominent filled "primary" (dark ground, light text, settable via `startBg`/`startFg`) while **Replay** stays a low-key outlined pill; (2) during playback / while cards rest, a small **top-left title bar** (themeable via `titleColor`/`titleBg`/`titleSize` or the `--vv-title-*` properties; set `titleBar: false` to hide it).

**Auto-fit:** cards grow up to `maxWidth` to fit the subtitle (the **Next** button never wraps), then — if the content still overflows the space the card's anchor leaves toward the edges — the whole card (text and buttons together) scales down to fit, no smaller than `minScale`. Re-runs on container resize / fullscreen.

Web-component attributes mirror these option names in kebab-case: `nav`, `back`, `closable`, `dots`, `counter`, `auto-fit`, `min-scale`, `max-width`, `next-label`, `prev-label`, `start-label`, `replay-label`, `video-title` (or `title`), `title-bar`, `card-bg`, `card-fg`, `next-bg`, `next-fg`, `next-border`, `start-bg`, `start-fg`, `title-color`, `title-bg`, `title-size`, `font`, `dim`.

## Methods

| Method | Description |
| --- | --- |
| `play()` | Play. In stepped mode, advances to the next stop point. |
| `pause()` | Pause and cancel any eased travel. |
| `toggle()` | Play/pause toggle (stepped: advance or pause mid-travel). |
| `next()` | Jump to the next segment. |
| `prev()` | Jump to the previous segment. |
| `close()` | Dismiss the cards: switch to continuous mode and resume playback (no-op in continuous). |
| `replay()` | Restart playback from the beginning (same as the Replay CTA). |
| `seekTo(time)` | Seek to an absolute time in seconds. |
| `goToSegment(i)` | Seek to segment `i` and show its card. |
| `setMode(mode)` | Switch `"continuous"` / `"stepped"` live. |
| `setEasing(easing)` | Change easing live. |
| `showCard(i)` / `hideCard()` | Manual card control. |
| `getSegments()` | Parsed segment array (read-only copy). |
| `destroy()` | Remove DOM, listeners, and frame-callback handles. |

**Getters:** `segments`, `currentSegment`, `currentTime`, `duration`, `mode`, `playing`, `ready`.

## Events

All events dispatch on the container element with the `vexyvlip:` prefix and bubble:

| Event | Detail |
| --- | --- |
| `vexyvlip:ready` | `{ segments: number }` |
| `vexyvlip:play` | `{}` |
| `vexyvlip:pause` | `{}` |
| `vexyvlip:ended` | `{}` |
| `vexyvlip:segmententer` | `{ index, segment }` |
| `vexyvlip:segmentexit` | `{ index }` |
| `vexyvlip:cardshow` | `{ index, segment }` |
| `vexyvlip:cardhide` | `{}` |
| `vexyvlip:stop` | `{ index }` — stepped mode: reached a stop point |
| `vexyvlip:close` | `{}` — the × was used to drop to plain video mode |
| `vexyvlip:replay` | `{}` — the Replay CTA restarted playback from the top |
| `vexyvlip:error` | `{ error, phase }` |

## Theming

All visual knobs are CSS custom properties on `.vexy-vlip` (or `:host` in the web component's Shadow DOM):

| Property | Default | Controls |
| --- | --- | --- |
| `--vv-card-bg` | `#ffffff` | Card background |
| `--vv-card-fg` | `#1d2430` | Card text color |
| `--vv-card-font` | `inherit` | Card font |
| `--vv-card-padding` | `20px 24px` | Card padding |
| `--vv-card-radius` | `16px` | Card border radius |
| `--vv-card-border` | `0` | Card border |
| `--vv-card-shadow` | `0 12px 38px rgba(0,0,0,.34)` | Card box-shadow |
| `--vv-card-max-width` | `72%` | Maximum card width (also set by the `maxWidth` option) |
| `--vv-card-bg-stepped` | `var(--vv-card-bg)` | Card background in stepped mode |
| `--vv-accent` | `#2f6fed` | Link color (and default dot-active color) |
| `--vv-next-bg` | `#ffffff` | In-card Next button background (outlined pill by default) |
| `--vv-next-fg` | `#1d2430` | In-card Next button text color |
| `--vv-next-border` | `rgba(0,0,0,.82)` | In-card Next button border |
| `--vv-start-bg` | `#1d2430` | Start button background (prominent CTA in the title card) |
| `--vv-start-fg` | `#ffffff` | Start button text color |
| `--vv-close-fg` | `var(--vv-card-fg)` | Close (×) button color |
| `--vv-dot` | `rgba(255,255,255,.45)` | Step-dot color |
| `--vv-dot-active` | `var(--vv-accent)` | Active step-dot color |
| `--vv-overlay-bg` | `rgba(0,0,0,.7)` | Dimming overlay behind a resting card / CTA |
| `--vv-title-fg` | `rgba(255,255,255,.92)` | Top-left title color |
| `--vv-title-bg` | `rgba(0,0,0,.45)` | Top-left title background |
| `--vv-title-size` | `13px` | Top-left title font size |
| `--vv-title-padding` | `4px 10px` | Top-left title padding |
| `--vv-title-radius` | `7px` | Top-left title corner radius |
| `--vv-title-margin` | `10px 12px` | Top-left title offset from the corner |
| `--vv-controls-bg` | `rgba(0,0,0,.55)` | Control bar background |

Per-cue JSON fields (`bg`, `fg`, `shadow`, etc.) override these via inline styles on individual cards.

## Keyboard shortcuts

When `keyboard: true` (default): `Space` / `Enter` — advance or toggle, `→` / `←` — next/previous segment, `F` — fullscreen, `M` — mute. Respects `prefers-reduced-motion` (disables card transitions and forces linear easing).

## Development

```bash
npm run dev          # Vite dev server
npm run build        # -> dist/vexy-vlip.element.js + dist/vexy-vlip.global.js
npm run test:unit    # node --test  (24 unit tests, no DOM)
npm run test:e2e     # node tests/e2e/run-e2e.mjs  (8 Playwright-library checks)
npm test             # unit + e2e
npm run build:docs   # copy bundles into docs/
./build.sh           # full production build
```

Live demo: **[vexy.dev/vexy-vlip-js/](https://vexy.dev/vexy-vlip-js/)**

## License

Apache-2.0 — Copyright 2026 Fontlab Ltd.
