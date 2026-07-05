<!-- this_file: docs/reference.md -->

# vexy-vlip-js — full reference

The complete option, JSON-field, and theming tables. For the quick start and
the concepts, see the [README](../README.md).

## JSON card fields

A cue whose trimmed payload starts with `{` is parsed as a JSON card. Every
field is optional except one of `text` or `html`. If JSON parsing fails, the
payload falls back to plain text — no silent blank cards.

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

When `x`/`y`/`w` are absent, placement falls back to the cue's native
`position`/`line`/`size` settings, then to the player default (bottom-center,
`y: 86%`).

> **Security note.** Plain-text and JSON `text` cards are always HTML-escaped. A
> JSON `html` card is inserted as-is; `sanitize: true` strips
> `<script>`/`<style>`/`<iframe>`/`<object>`/`<embed>`, `on*` handlers and
> `javascript:` URLs, but it is a convenience filter, **not** a hardened
> sanitizer (it does not cover `data:` URLs, `srcdoc`, SVG `<use>`,
> `formaction`, CSS `url()`, etc.). Treat the WebVTT file as trusted,
> author-controlled content. For untrusted input, sanitize upstream with a
> vetted library such as DOMPurify.

## Options

Passed to the `VexyVlip` constructor; web-component attributes mirror these
names in kebab-case (e.g. `autoFit` → `auto-fit`, `title` → `video-title`).

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

Card text is rendered as a **markdown subset**: headings, ordered/unordered
lists, horizontal rules, paragraphs, plus inline `**bold**`, `*italic*`,
`` `code` ``, `~~strike~~` and `[links](url)`. Input is HTML-escaped first, so
raw HTML never survives (and `javascript:` links are neutralised).

**Start / Replay screen:** before playback (and again after the video ends),
both modes show the dimmed first frame with a centered CTA — **Start →** to
begin, **Replay ↻** to restart. The Start screen is skipped when `autoplay`
(continuous) or `startSegment` is set; Replay is skipped when `loop` is on. The
first frame is force-painted under the CTA so Safari/iOS show the real frame,
not a blank slate.

**Auto-fit:** cards grow up to `maxWidth` to fit the subtitle (the **Next**
button never wraps), then — if the content still overflows — the whole card
scales down to fit, no smaller than `minScale`. Re-runs on container resize /
fullscreen.

## Theming

All visual knobs are CSS custom properties on `.vexy-vlip` (or `:host` in the
web component's Shadow DOM). Per-cue JSON fields (`bg`, `fg`, `shadow`, …)
override these via inline styles on individual cards.

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
