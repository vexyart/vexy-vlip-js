# Options and attributes

You configure a player with an options object passed to the `VexyVlip`
constructor, or with attributes on `<vexy-vlip>`. Both routes set the same
values; the defaults come from the exported `DEFAULTS` object in
`src/player.js`.

```js
import { VexyVlip, DEFAULTS } from "vexy-vlip-js";

console.log(DEFAULTS.mode);       // "continuous"
new VexyVlip(stage, { src: "demo.mp4", track: "demo.vtt", mode: "stepped" });
```

```html
<vexy-vlip src="demo.mp4" track="demo.vtt" mode="stepped"></vexy-vlip>
```

## Attribute rules

- Attribute names are the kebab-case form of the option: `autoFit` becomes
  `auto-fit`, `startSegment` becomes `start-segment`.
- The video title uses the attribute `video-title`. The plain `title`
  attribute also works, but it also sets the browser's native tooltip.
- Boolean attributes follow HTML semantics: presence means `true`. The values
  `"false"` and `"0"` mean `false`. An absent attribute uses the default.
- Every attribute is observed. Changes to `mode`, `easing`, `muted`, `loop`
  and `poster` apply to the running player. Any other change rebuilds the
  player so the new value takes effect.

## Media and playback

| Option | Attribute | Type | Default | Notes |
| --- | --- | --- | --- | --- |
| `src` | `src` | string | `""` | Video URL. |
| `track` | `track` | string | `""` | WebVTT URL, downloaded with `fetch()`. |
| `vtt` | `vtt` | string | `""` | Inline WebVTT text, used instead of `track`. |
| `mode` | `mode` | `"continuous"` \| `"stepped"` | `"continuous"` | Playback mode. Any other value means `continuous`. |
| `easing` | `easing` | `"linear"` \| `"ease-in"` \| `"ease-out"` \| `"ease-in-out"` | `"linear"` | Travel between stops in stepped mode. `linear` uses native playback with audio. |
| `controls` | `controls` | boolean | `true` | Show the control bar. In stepped mode the bar shows the step dots only. |
| `autoplay` | `autoplay` | boolean | `false` | In continuous mode, start playing when ready and skip the Start screen. |
| `loop` | `loop` | boolean | `false` | Loop the video. Applies in continuous mode only. |
| `muted` | `muted` | boolean | `false` | Start muted. Browsers usually allow autoplay only when muted. |
| `poster` | `poster` | string | `""` | Poster image URL. |
| `startAt` | `start-at` | number | `0` | Initial time in seconds. |
| `startSegment` | `start-segment` | number | `null` | Open on this card index, already positioned, with no Start screen. |
| `keyboard` | `keyboard` | boolean | `true` | Enable keyboard shortcuts on the player. |
| `sanitize` | `sanitize` | boolean | `false` | Filter JSON `html` cards. See [Authoring cards](cue-format.md#security). |

## Stepped-mode interface

| Option | Attribute | Type | Default | Notes |
| --- | --- | --- | --- | --- |
| `overlay` | `overlay` | boolean | `true` | Dim the video behind a resting card. |
| `nav` | `nav` | boolean | `true` | Show the in-card **Next** button (and **Back** when `back` is on). |
| `back` | `back` | boolean | `false` | Show the in-card **←** Back button. `prev()` and the ++arrow-left++ key work either way. |
| `closable` | `closable` | boolean | `true` | Show the in-card **×**, which switches to continuous mode and resumes playback. |
| `counter` | `counter` | boolean | `false` | Show an `n/total` step counter in the card footer. |
| `dots` | `dots` | boolean | `true` | Show the step-dots bar. |

## Labels and title

| Option | Attribute | Default | Notes |
| --- | --- | --- | --- |
| `nextLabel` | `next-label` | `"Next →"` | In-card Next button. |
| `prevLabel` | `prev-label` | `"←"` | In-card Back button. |
| `startLabel` | `start-label` | `"Start →"` | Start button over the dimmed first frame. |
| `replayLabel` | `replay-label` | `"Replay ↻"` | Replay button shown after the video ends. |
| `title` | `video-title` (or `title`) | `""` | Video title. Shown above the Start/Replay button and in a small top-left bar during playback. |
| `titleBar` | `title-bar` | `true` | When a title is set, show the top-left title bar during playback. |

## Card sizing

| Option | Attribute | Type | Default | Notes |
| --- | --- | --- | --- | --- |
| `autoFit` | `auto-fit` | boolean | `true` | Grow cards to fit their text, then scale the whole card down if it still overflows. |
| `minScale` | `min-scale` | number | `0.4` | Smallest scale factor auto-fit may apply. |
| `maxWidth` | `max-width` | number | `72` | Grow limit as a percentage of the player width. Also sets `--vv-card-max-width`. |

Auto-fit keeps the **Next** button on one line, scales around the card's
anchor so the placement is preserved, and runs again when the player is
resized or enters full screen.

## Theme shortcuts

Each of these options writes a CSS custom property on the player root. See
[Theming](theming.md) for the full list of properties.

| Option | Attribute | Sets |
| --- | --- | --- |
| `cardBg` | `card-bg` | `--vv-card-bg` and `--vv-card-bg-stepped` |
| `cardFg` | `card-fg` | `--vv-card-fg` |
| `nextBg` | `next-bg` | `--vv-next-bg` |
| `nextFg` | `next-fg` | `--vv-next-fg` |
| `nextBorder` | `next-border` | `--vv-next-border` |
| `startBg` | `start-bg` | `--vv-start-bg` |
| `startFg` | `start-fg` | `--vv-start-fg` |
| `titleColor` | `title-color` | `--vv-title-fg` |
| `titleBg` | `title-bg` | `--vv-title-bg` |
| `titleSize` | `title-size` | `--vv-title-size` |
| `font` | `font` | `--vv-card-font` |
| `dim` | `dim` | `--vv-overlay-bg`. A number from `0` to `1` means black at that opacity; any other value is used as a CSS colour. |

## Class-only options

| Option | Default | Notes |
| --- | --- | --- |
| `injectStyles` | `true` | Insert the player stylesheet once into the document `<head>`. The Web Component sets this to `false` and puts the styles in its shadow root instead. |
| `onReady`, `onStop`, … | — | Callback for each event: `on` plus the event name with a capital first letter. It receives `(detail, player)`. See [Events](api.md#events). |

## Start and Replay screens

Before playback, both modes show the dimmed first frame with a **Start →**
button. Clicking it, clicking the frame, or pressing ++space++ begins
playback: stepped mode advances to the first card, continuous mode removes the
dim and plays. The Start screen is skipped when `autoplay` is on in continuous
mode, or when `startSegment` is set.

After the video ends, the same screen returns with **Replay ↻**, unless the
video is looping.
