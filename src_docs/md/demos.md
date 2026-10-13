# Live demos

The demo pages are plain HTML files published next to this documentation. Each
loads the bundles built from the current source.

| Page | Build used | What it shows |
| --- | --- | --- |
| [Demo landing page](demo.html) | `vexy-vlip.global.js` | A nine-card stepped tour of the [Vexy Playlines](https://playlines.vexy.art/) editor, with buttons to switch mode and easing and to restart. |
| [ESM module](demo-module.html) | `vexy-vlip.element.js`, imported as a module | The class driven from JavaScript with Prev, Play/advance, Next and mode buttons, plus an event log. |
| [Web Component](demo-component.html) | `vexy-vlip.global.js` | A `<vexy-vlip>` element in stepped mode with `ease-in-out` travel. |
| [Classic global](demo-library.html) | `vexy-vlip.global.js` | `window.VexyVlip` used from a classic `<script>`. |

## Media used by the demos

| File | Content |
| --- | --- |
| [`media/sample.mp4`](media/sample.mp4) | Short test clip. |
| [`media/sample.vtt`](media/sample.vtt) | Five cues mixing plain-text and JSON cards. |
| [`media/playlines.mp4`](media/playlines.mp4) | Screen recording of the Vexy Playlines editor. |
| [`media/playlines.vtt`](media/playlines.vtt) | Nine cues placed with WebVTT cue settings only, no JSON. |

These are copies of the files in the repository's `testdata/` folder.

## Using the hosted bundles

The bundles on this site are unversioned:

- `https://vexy.dev/vexy-vlip-js/vexy-vlip.element.js`
- `https://vexy.dev/vexy-vlip-js/vexy-vlip.global.js`

They change whenever the site is rebuilt, so use them for experiments only.
For production pages load a pinned version from jsDelivr or unpkg, as shown
in [Installation](installation.md#load-from-a-cdn).

## Running the demos locally

Prerequisites: Node.js and a clone of the repository.

1. Install the development dependencies:

    ```bash
    npm install
    ```

2. Build the bundles and copy them, with the media, into `src_docs/md/`:

    ```bash
    npm run build
    npm run build:docs
    ```

3. Start the Vite development server:

    ```bash
    npm run dev
    ```

4. Open `/src_docs/md/demo.html` on the address Vite prints.

`npm run build:docs` also stamps a short content hash (`?v=…`) onto the
bundle references in the demo pages, so browsers fetch a fresh bundle after
each change.
