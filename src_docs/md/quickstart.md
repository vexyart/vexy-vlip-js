# Quick start

This page builds a stepped explainer from one video and a three-cue WebVTT
file. It uses the `<vexy-vlip>` Web Component, which needs no JavaScript of
your own.

## Prerequisites

- A video file, here `demo.mp4`.
- A web server for the page. The player downloads the track with `fetch()`, so
  opening the HTML file directly from disk (`file://`) may fail.

## Steps

1. Create `demo.vtt` next to the video:

    ```webvtt
    WEBVTT

    step-1
    00:02.000 --> 00:03.500
    This is a **plain-text** card near the bottom.

    step-2
    00:04.000 --> 00:05.500 position:18% line:30% size:34% align:start
    A card placed top-left via native WebVTT cue settings.

    step-3
    00:06.000 --> 00:07.500
    { "text": "A JSON card with a custom backdrop.", "x": 50, "y": 50, "anchor": "center", "bg": "#10243a", "fg": "#eaf2ff", "radius": 16 }
    ```

    Each cue is one card. `step-1` uses the default placement, `step-2` uses
    WebVTT cue settings, and `step-3` is a JSON card with its own colours.

2. Create `index.html` that loads the element build and places the player:

    ```html
    <!doctype html>
    <meta charset="utf-8">
    <script type="module"
      src="https://cdn.jsdelivr.net/npm/vexy-vlip-js@1/dist/vexy-vlip.element.js"></script>

    <vexy-vlip src="demo.mp4" track="demo.vtt" mode="stepped" muted
               video-title="My first explainer"></vexy-vlip>
    ```

3. Serve the folder, for example with `npx vite` or `python3 -m http.server`,
   and open the page.

4. Click **Start →**. The video plays to 2 s, pauses, dims, and shows the first
   card. Click the card, the video, or **Next →**, or press ++space++, to play
   to the next card. After the last card the next advance plays to the end of
   the video, and a **Replay ↻** button appears.

## The same player from JavaScript

=== "ES module"

    ```js
    import { VexyVlip } from "vexy-vlip-js";

    const stage = document.querySelector("#stage");
    const vlip = new VexyVlip(stage, {
      src: "demo.mp4",
      track: "demo.vtt",
      mode: "stepped",   // "continuous" | "stepped"
      controls: true,
    });

    // Methods can be called at once; the track loads asynchronously.
    document.querySelector("#next").addEventListener("click", () => vlip.next());

    // Events bubble from the container element.
    stage.addEventListener("vexyvlip:stop", (e) => {
      console.log("paused at segment", e.detail.index);
    });
    ```

=== "Classic global"

    ```html
    <script src="vexy-vlip.global.js"></script>
    <script>
      // window.VexyVlip is the class; <vexy-vlip> is also registered.
      const vlip = new VexyVlip(document.querySelector("#stage"), {
        src: "demo.mp4",
        track: "demo.vtt",
        mode: "continuous",
      });
    </script>
    ```

The container you pass to the constructor receives the class `vexy-vlip`, a
`<video>` element, and the card layer. If you pass an existing `<video>`
element instead, the player wraps it in a new `<div>` and uses that as the
container.

## Inline tracks

Instead of a URL, pass the WebVTT text directly with the `vtt` option (or the
`vtt` attribute). The player then skips the network request:

```js
new VexyVlip(stage, {
  src: "demo.mp4",
  vtt: "WEBVTT\n\n00:01.000 --> 00:03.000\nHello",
});
```

## Next steps

- Learn the full cue syntax in [Authoring cards](cue-format.md).
- Change colours and labels with [Options and attributes](options.md) or
  [Theming](theming.md).
