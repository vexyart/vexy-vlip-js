# How playback works

This page explains what the player does between loading a track and showing a
card. It follows the five-cue `sample.vtt` used by the demos: cards start at
2, 4, 6, 8 and 10 seconds.

## Source layout

| File | Role |
| --- | --- |
| `src/index.js` | Public ESM entry. Re-exports the class and helpers; registers nothing. |
| `src/player.js` | The `VexyVlip` class: DOM, loading, both playback modes, eased travel, Start/Replay screen, events. |
| `src/vtt.js` | Pure WebVTT parsing and cue-to-card conversion. No DOM. |
| `src/segments.js` | Pure stop-point navigation: `nextStop`, `prevStop`, `currentStop`, `segmentAtTime`. |
| `src/cards.js` | Builds card elements and applies placement and inline styles. |
| `src/styles.js` | The stylesheet as a string, for the shadow root or one `<head>` injection. |
| `src/element.js` | The `<vexy-vlip>` custom element. |
| `src/global.js` | Entry for the classic-script IIFE build. |

## Loading

1. The constructor merges your options over `DEFAULTS`, creates the `<video>`,
   the card layer, the controls and the Start/Replay screen, and attaches
   listeners.
2. If `vtt` is empty and `track` is set, the player downloads the track with
   `fetch()`. A failed request emits `vexyvlip:error` with `phase: "track"`.
3. The text goes through `parseCards()`, which produces one card model per cue.
4. When both the video metadata and the cards are in, the player is ready. It
   applies `startSegment` or `startAt`, emits `vexyvlip:ready`, and either
   starts playback (continuous mode with `autoplay`), opens on the start
   segment, or shows the Start screen over the dimmed first frame.

## The frame loop

While the video plays, the player checks the playhead once per frame. It uses
`video.requestVideoFrameCallback()` where the browser supports it, and
`requestAnimationFrame()` otherwise. Only one callback is queued at a time.

## Continuous mode

On each frame the player calls `segmentAtTime(cards, currentTime)`. When the
result changes, it shows the new card (`segmententer`, `cardshow`) or hides
the old one (`cardhide`). Playback is never paused for a card.

With `sample.vtt`, the card for cue 1 is visible from 2.0 s to 3.5 s, then no
card is visible until 4.0 s.

## Stepped mode

Stepped mode advances by card index, not by time, so a cue at `00:00.000` and
back-to-back cues each get their own stop.

1. The viewer advances (click, ++space++, **Next**, or `next()`). The current
   card hides and the player emits `segmentexit` and `cardhide`.
2. The target is the start of the next card. With `sample.vtt`, resting on
   card 0 (2 s) gives a target of 4 s.
3. With `easing: "linear"` the video plays natively. On each frame the player
   checks `currentTime + 0.02 >= target`, stopping slightly early to avoid
   overshoot.
4. At the stop the player pauses, snaps `currentTime` to exactly the cue start,
   shows the card, and emits `segmententer`, `cardshow` and `stop`.
5. After the last card, the next advance plays to the end of the video. The
   player emits `ended` and shows the Replay screen.

`prev()` goes back by one index and shows that card immediately, with no
playback.

## Eased travel

When `easing` is `ease-in`, `ease-out` or `ease-in-out`, stepped advances do
not use native playback:

1. The video pauses and is muted, because scrubbed audio is unusable.
2. A `requestAnimationFrame` loop sets `currentTime` from the current stop to
   the target. The trip takes `(target − start) / playbackRate` seconds of wall
   time, and progress is mapped through the curve:

    | Easing | Curve `f(p)` |
    | --- | --- |
    | `linear` | `p` |
    | `ease-in` | `p²` |
    | `ease-out` | `1 − (1 − p)²` |
    | `ease-in-out` | `p² (3 − 2p)` (smoothstep) |

3. At the target the original mute state is restored and the stop is handled
   as in step 4 above.

Eased travel depends on fast seeking. Encode the video with fast-start and a
short GOP; see [Installation](installation.md#prepare-your-media).

## Card placement

A card model's `placement` holds `x`, `y`, an optional `w`, an `anchor` and an
`align`. The card element is positioned at (`x`, `y`) inside the video box and
shifted with a CSS transform so the chosen anchor point of the card lands on
that position. Numbers are percentages; strings are used as CSS lengths.

## Why not the native caption renderer

The browser's `::cue` pseudo-element cannot set arbitrary backgrounds,
padding, radius, shadows or exact placement, and its cues are not regular DOM.
Vexy Vlip renders each cue as an ordinary element instead: the card layer is an
`aria-live="polite"` region and each card has `role="note"`, so screen readers
announce new cards.

## Scope

The project's specification limits it to one sentence: play one video, drive
styled HTML cards from its WebVTT track, and let the viewer step through the
video card by card or watch it continuously, using native browser APIs only.
Transcoding, adaptive streaming, analytics and editing are out of scope.
