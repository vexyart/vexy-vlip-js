# API reference

## `new VexyVlip(target, options)`

```js
import { VexyVlip } from "vexy-vlip-js";
const vlip = new VexyVlip(document.querySelector("#stage"), { src, track });
```

- `target` is a container element. The player adds the class `vexy-vlip`, a
  `<video>` element, the card layer and the controls inside it.
- If `target` is a `<video>` element, the player wraps it in a new `<div>`,
  uses that `<div>` as the container, and keeps the existing video.
- If `target` is missing or not a DOM element, the constructor throws
  `TypeError("VexyVlip: a target element is required")`.
- `options` is described in [Options and attributes](options.md).

The constructor returns at once. The track loads asynchronously, and the player
is ready when both the video metadata and the cards are loaded. Wait for the
`vexyvlip:ready` event, or check the `ready` getter, before relying on
`segments`.

## Methods

| Method | Description |
| --- | --- |
| `play()` | Continuous: play. Stepped: advance to the next stop. On the Start/Replay screen it acts like the button. |
| `pause()` | Pause and cancel any eased travel. |
| `toggle()` | Continuous: play or pause. Stepped: advance when paused, pause while travelling. |
| `next()` | Stepped: advance to the next card. Continuous: seek to the next cue start. |
| `prev()` | Go to the previous card and show it. |
| `close()` | Dismiss the cards: switch to continuous mode and resume playback. No effect in continuous mode. |
| `replay()` | Restart from the beginning, like the Replay button. |
| `seekTo(time)` | Seek to an absolute time in seconds (negative values become `0`). |
| `goToSegment(i)` | Pause at the start of card `i`, show it, and dismiss the Start/Replay screen. Ignored if `i` does not exist. |
| `setMode(mode)` | Switch between `"continuous"` and `"stepped"` while running. Stepping resumes from the card the playhead rests on. |
| `setEasing(easing)` | Change the easing. Unknown names are ignored. |
| `showCard(i)` / `hideCard()` | Show or hide a card manually. |
| `getSegments()` | A copy of the parsed card models. |
| `destroy()` | Remove the player's DOM, listeners and frame callbacks. |

## Getters

| Getter | Value |
| --- | --- |
| `segments` | Deep copy of the parsed card models. |
| `currentSegment` | Index of the visible card; if none is visible, the last cue start at or before the playhead, or `-1`. |
| `currentTime` | The video's current time in seconds. |
| `duration` | The video's duration in seconds. |
| `mode` | `"continuous"` or `"stepped"`. |
| `playing` | `true` while the video plays or eased travel is running. |
| `ready` | `true` once metadata and cards are loaded. |

## Events

Every event is a `CustomEvent` named `vexyvlip:<name>`, dispatched on the
player container. Events bubble and are `composed`, so events from
`<vexy-vlip>` cross its shadow root and reach the host element.

| Event | `detail` | When |
| --- | --- | --- |
| `vexyvlip:ready` | `{ segments }` (card count) | Metadata and cards are loaded. |
| `vexyvlip:play` | `{}` | Playback or a stepped advance starts. |
| `vexyvlip:pause` | `{}` | `pause()` ran. |
| `vexyvlip:ended` | `{}` | The video reached its end. |
| `vexyvlip:segmententer` | `{ index, segment }` | A card's segment became active. |
| `vexyvlip:segmentexit` | `{ index }` | Stepped mode left a card. |
| `vexyvlip:cardshow` | `{ index, segment }` | A card appeared. |
| `vexyvlip:cardhide` | `{}` or `{ index }` | A card disappeared. |
| `vexyvlip:stop` | `{ index }` | Stepped mode reached a stop point. |
| `vexyvlip:modechange` | `{ mode }` | `setMode()` changed the mode. |
| `vexyvlip:close` | `{}` | The × dropped the player into plain video mode. |
| `vexyvlip:replay` | `{}` | Replay restarted playback. |
| `vexyvlip:destroy` | `{}` | `destroy()` ran. |
| `vexyvlip:error` | `{ error, phase }` | `phase` is `"track"` when the track download failed, `"play"` when `video.play()` was rejected. |

```js
stage.addEventListener("vexyvlip:cardshow", (e) => {
  console.log("card", e.detail.index, e.detail.segment.text);
});
```

You can also pass a callback option instead of a listener: `onReady`,
`onCardshow`, `onStop` and so on. The player calls it with `(detail, player)`.

## Keyboard shortcuts

With `keyboard: true` (the default), the player root handles these keys:

| Key | Action |
| --- | --- |
| ++space++ / ++enter++ | `toggle()`: advance or play/pause |
| ++arrow-right++ | `next()` |
| ++arrow-left++ | `prev()` |
| ++f++ | Toggle full screen |
| ++m++ | Toggle mute |

## The `<vexy-vlip>` element

Importing `vexy-vlip-js/element`, `dist/vexy-vlip.element.js` or the global
build registers `<vexy-vlip>` once (it is skipped if the name is already
defined). The element:

- renders the player inside an open shadow root with its own stylesheet;
- adopts a child `<video>` element if you provide one;
- exposes the same methods (`play`, `pause`, `toggle`, `next`, `prev`,
  `close`, `replay`, `seekTo`, `goToSegment`, `showCard`, `hideCard`,
  `getSegments`, `setMode`, `setEasing`, `destroy`) and getters;
- adds a `player` getter that returns the internal `VexyVlip` instance;
- implements `setMode()` and `setEasing()` by setting the `mode` and `easing`
  attributes;
- destroys the player when removed from the document.

## The global build

`vexy-vlip.global.js` is an IIFE. It sets `window.VexyVlip` to the class, adds
`VexyVlip.Element` (the custom element class) and `VexyVlip.version`, and
registers `<vexy-vlip>`.

## Pure helpers

`src/index.js` also exports the side-effect-free functions the player uses.
They need no DOM, so they run under Node.js.

| Export | Purpose |
| --- | --- |
| `parseVtt(text)` | Parse WebVTT into raw cues: `{ index, id, start, end, settings, payload }`. |
| `parseTime(stamp)` | Convert `"MM:SS.mmm"` or `"HH:MM:SS.mmm"` to seconds; `NaN` if malformed. |
| `parseCueSettings(str)` | Read `position`, `line`, `size`, `align`, `vertical`, `region` into an object. |
| `cueToCard(cue, defaults)` | Convert a raw cue into a card model. |
| `parseCards(text, defaults)` | `parseVtt` followed by `cueToCard` for every cue. |
| `renderMarkdown(text)` | Render the escaped markdown subset to HTML. |
| `stopPoints(cards)` | Stop table `{ index, time, end }`, sorted by time. |
| `segmentAtTime(cards, t)` | Index of the card active at `t`, or `-1`. |
| `nextStop(cards, t)` / `prevStop(cards, t)` | Next or previous cue start strictly after or before `t`, or `-1`. |
| `currentStop(cards, t)` | Last cue start at or before `t`, or `-1`. |
| `CSS`, `shadowCss()`, `injectStyles(doc)` | The stylesheet string, its shadow-DOM variant, and a one-time `<head>` injector. |
| `DEFAULTS` | The default option values. |
| `version` | The package version string. |

A card model returned by `cueToCard()` has these fields: `index`, `id`,
`start`, `end`, `text`, `html`, `isHtml`, `placement` (`{ x, y, w, anchor,
align }`), `style` (`{ bg, fg, font, padding, radius, border, shadow,
opacity }`), `className`, `enter` and `exit`.

The navigation helpers compare times with a tolerance of `0.02` s (exported
from `src/segments.js` as `EPS`).
