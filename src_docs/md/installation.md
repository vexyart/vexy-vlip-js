# Installation

`vexy-vlip-js` is published to npm under the name `vexy-vlip-js`. It has no
runtime dependencies. You can install it from npm or load it from a CDN with no
build step.

## Install from npm

Prerequisites: Node.js and npm. The package declares `"engines": { "node": ">=18.0.0" }`.

1. Add the package to your project:

    ```bash
    npm i vexy-vlip-js
    ```

2. Import the entry point you need (see [Package entry points](#package-entry-points)):

    ```js
    import { VexyVlip } from "vexy-vlip-js";
    ```

The package ships both the unbundled ESM source (`src/`) and two prebuilt
bundles (`dist/vexy-vlip.element.js` and `dist/vexy-vlip.global.js`).

## Package entry points

The `exports` map in `package.json` defines these import paths:

| Import path | File | Effect |
| --- | --- | --- |
| `vexy-vlip-js` | `src/index.js` | Exports the `VexyVlip` class and helpers. Does **not** register `<vexy-vlip>`. |
| `vexy-vlip-js/element` | `src/element.js` | Registers the `<vexy-vlip>` custom element as a side effect. |
| `vexy-vlip-js/styles` | `src/styles.js` | The stylesheet as a string plus `injectStyles()`. |
| `vexy-vlip-js/dist/*` | `dist/*` | The prebuilt bundles. |

The `unpkg` and `jsdelivr` fields both point at `dist/vexy-vlip.global.js`, so
a bare CDN URL for the package serves the classic-script build.

## Load from a CDN

No install is needed. Pin a version so a new release cannot break your page:
`@1.0.0` is exact, `@1` is the latest 1.x, and no version means the latest
release.

=== "Web Component"

    ```html
    <!-- Registers <vexy-vlip> -->
    <script type="module"
      src="https://cdn.jsdelivr.net/npm/vexy-vlip-js@1/dist/vexy-vlip.element.js"></script>

    <vexy-vlip src="demo.mp4" track="demo.vtt" mode="stepped" controls></vexy-vlip>
    ```

=== "Classic global"

    ```html
    <!-- window.VexyVlip + <vexy-vlip>; the bare URL resolves to the global build -->
    <script src="https://cdn.jsdelivr.net/npm/vexy-vlip-js@1"></script>
    ```

=== "ES module"

    ```html
    <script type="module">
      import { VexyVlip } from "https://cdn.jsdelivr.net/npm/vexy-vlip-js@1/src/index.js";
    </script>
    ```

unpkg accepts the same paths. jsDelivr also serves an auto-bundled module at
`…/vexy-vlip-js@1/+esm`.

!!! note "Production embeds"
    Use a version-pinned jsDelivr or unpkg URL in production. The bundles on
    this documentation site, such as
    `https://vexy.dev/vexy-vlip-js/vexy-vlip.element.js`, are unversioned and
    always track the latest deployed site. They suit demos, not production
    pages.

## Prepare your media

Vexy Vlip plays any video the browser can play. For the best result:

1. Encode H.264/AAC MP4 for broad browser support.
2. Move the MP4 metadata to the start of the file so playback can begin
   immediately:

    ```bash
    ffmpeg -i in.mp4 -movflags +faststart out.mp4
    ```

3. If you use eased travel (`easing` other than `linear`), encode with a short
   GOP so seeking stays smooth.
4. Serve the `.vtt` file from a URL the page can `fetch()`. A cross-origin
   track needs CORS headers, because the player downloads it with `fetch`.

Next: [Quick start](quickstart.md).
