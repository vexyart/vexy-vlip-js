# vexy-vlip-js

`vexy-vlip-js` turns one video and one WebVTT file into an interactive explainer.
Each WebVTT cue becomes an on-screen **card**: a real HTML panel with its own
background, padding, corner radius, shadow and position. The library has no
runtime dependencies and uses only native browser APIs.

[Open the live demo](demo.html){ .md-button .md-button--primary }
[Install](installation.md){ .md-button }

## What goes in, what comes out

You supply:

- a video file, for example `demo.mp4`;
- a WebVTT file, for example `demo.vtt`, whose cues hold the card text,
  timing and placement.

Vexy Vlip creates a `<video>` element, fetches and parses the WebVTT file
itself, and draws each cue as an absolutely positioned card in an overlay
layer above the video. The browser's own caption renderer is not used, so
`::cue` styling limits do not apply.

A single cue shows the idea:

```webvtt
WEBVTT

00:02.000 --> 00:05.000 position:70%,line-right line:24%,start size:38%
Click the **Export** button in the toolbar.
```

From 2 s to 5 s, a card appears whose top-right corner sits at 70 % of the
video width and 24 % of its height. The card is 38 % of the video width and
shows "Export" in bold.

## Two playback modes

| Mode | Behaviour |
| --- | --- |
| `continuous` (default) | The video plays normally. Each card appears at its cue start and disappears at its cue end. |
| `stepped` | The video plays to the start of the next cue, pauses, and shows that card. The viewer clicks, presses ++space++, or uses the in-card **Next** button to continue. |

In stepped mode you can also set an `easing` such as `ease-in-out`. The player
then moves `currentTime` between stops on a `requestAnimationFrame` loop
instead of playing natively. See [How playback works](architecture.md).

## Three ways to load it

| Build | How you use it | Typical use |
| --- | --- | --- |
| ESM module | `import { VexyVlip } from "vexy-vlip-js"` | Bundled apps |
| Web Component | `<vexy-vlip src="…" track="…">` | Plain HTML pages |
| Classic global | `<script src="vexy-vlip.global.js">` exposes `window.VexyVlip` | Pages with no build step |

All three share the same engine in `src/player.js`.

## Where to go next

- [Installation](installation.md): npm and CDN setup.
- [Quick start](quickstart.md): a working player in four steps.
- [Authoring cards](cue-format.md): plain-text cues, cue settings and JSON cards.
- [Options and attributes](options.md): every constructor option and its
  matching HTML attribute.
- [API reference](api.md): methods, getters, events and exported helpers.
- [Theming](theming.md): CSS custom properties.
- [Live demos](demos.md): the hosted example pages.

`vexy-vlip-js` is licensed under Apache-2.0. Source:
[github.com/vexyart/vexy-vlip-js](https://github.com/vexyart/vexy-vlip-js).
