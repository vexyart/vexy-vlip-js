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

## Cue / card authoring

The `.vtt` file is both the timing script and the layout spec for each card. Two formats:

### Plain text + WebVTT cue settings

```webvtt
WEBVTT

00:02.000 --> 00:05.000 position:20% line:30% size:38% align:start
Click the **Export** button in the toolbar.
```

Supported cue settings:

| Setting | Effect |
| --- | --- |
| `position:N%` | Horizontal anchor (% of video width) |
| `line:N%` | Vertical anchor (% of video height) |
| `size:N%` | Card width as % of video width |
| `align:start\|center\|end` | Text alignment and anchor edge |

Inline markdown subset: `**bold**`, `*italic*`, `` `code` ``, line breaks. No raw HTML (XSS-safe).

### JSON payload

A cue whose trimmed payload starts with `{` is parsed as a JSON card. All fields are optional except one of `text` or `html`. If JSON parsing fails the payload is treated as plain text — no silent blank cards.

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
| `hint` | boolean | `true` | Show "Click to continue" hint in stepped mode |

## Methods

| Method | Description |
| --- | --- |
| `play()` | Play. In stepped mode, advances to the next stop point. |
| `pause()` | Pause and cancel any eased travel. |
| `toggle()` | Play/pause toggle (stepped: advance or pause mid-travel). |
| `next()` | Jump to the next segment. |
| `prev()` | Jump to the previous segment. |
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
| `vexyvlip:error` | `{ error, phase }` |

## Theming

All visual knobs are CSS custom properties on `.vexy-vlip` (or `:host` in the web component's Shadow DOM):

| Property | Default | Controls |
| --- | --- | --- |
| `--vv-card-bg` | `rgba(12,18,28,.9)` | Card background |
| `--vv-card-fg` | `#ffffff` | Card text color |
| `--vv-card-font` | `inherit` | Card font |
| `--vv-card-padding` | `14px 18px` | Card padding |
| `--vv-card-radius` | `12px` | Card border radius |
| `--vv-card-border` | `0` | Card border |
| `--vv-card-shadow` | `0 6px 24px rgba(0,0,0,.4)` | Card box-shadow |
| `--vv-card-max-width` | `44%` | Maximum card width |
| `--vv-accent` | `#4ea1ff` | Dot indicator and link color |
| `--vv-controls-bg` | `rgba(0,0,0,.55)` | Control bar background |

Per-cue JSON fields (`bg`, `fg`, `shadow`, etc.) override these via inline styles on individual cards.

## Keyboard shortcuts

When `keyboard: true` (default): `Space` / `Enter` — advance or toggle, `→` / `←` — next/previous segment, `F` — fullscreen, `M` — mute. Respects `prefers-reduced-motion` (disables card transitions and forces linear easing).

## Development

```bash
npm run dev          # Vite dev server
npm run build        # -> dist/vexy-vlip.element.js + dist/vexy-vlip.global.js
npm run test:unit    # node --test  (18 unit tests, no DOM)
npm run test:e2e     # node tests/e2e/run-e2e.mjs  (6 Playwright-library checks)
npm test             # unit + e2e
npm run build:docs   # copy bundles into docs/
./build.sh           # full production build
```

Live demo: **[vexy.dev/vexy-vlip-js/](https://vexy.dev/vexy-vlip-js/)**

## License

Apache-2.0 — Copyright 2026 Fontlab Ltd.
