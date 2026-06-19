<!-- this_file: TODO.md -->

# TODO

## Active — issue 101 (deploy freshness, Safari first frame, custom labels, NPM)

Findings: the deploy chain works (`origin/main` docs already carry the new UX;
`gitnextver` does `add -A` → commit → push). "vexy.dev shows old" is **caching
of the unversioned bundle URL**. Safari shows a blank slate because a
`<video preload=metadata>` at `currentTime=0` paints nothing until a frame
decodes.

- [x] 1. Cache-busting in `scripts/build-docs.mjs`: stamps `?v=<8-char content
      hash>` onto the functional bundle refs in `docs/*.html` (examples left
      clean); idempotent — only re-stamps when a bundle changes.
- [x] 2. `_primeFirstFrame()` in `src/player.js`: nudges `currentTime` to ~0.042
      + `requestVideoFrameCallback` on the Start screen. Chrome-verified
      (`currentTime` 0.042, frame paints) in both modes.
- [x] 3. `start-label`/`next-label`/`prev-label` observed + reactive; verified
      live in Chrome; documented in README.
- [x] 4. Build + unit (29) + e2e (14) green.
- [x] 5. Visual verify: Chrome ✓ (both modes, first frame `currentTime` 0.042,
      labels reactive, Start→card flow) and Safari ✓ (window screenshot shows the
      first frame under Start — the blank-canvas bug is gone). NOTE: Safari's MCP
      eval/screenshot is blocked until Safari ▸ Develop ▸ "Allow JavaScript from
      Apple Events" is enabled; used a system screencapture of the window instead.
- [x] 6. NPM prep (`npm pack --dry-run` clean); CHANGELOG; commit; re-tag v1.0.0.

## Backlog

- [ ] Optional MediaBunny / WebCodecs adapter for frame-exact scrubbing (replaces the rAF `currentTime` loop when the browser supports it and the source is a fragmented MP4)
- [ ] Chapter / region grouping: treat a subset of segments as a named chapter; expose chapter navigation in the control bar
- [ ] Allow loading a custom external image instead of using the 1st frame
- [ ] Multiple simultaneous cards: show more than one active cue at a time (overlapping cue ranges), each positioned independently
- [ ] RTL and vertical text: honour `dir="rtl"` on the host and the WebVTT `vertical:rl`/`lr` cue setting for cards
- [ ] Authoring / editor tool: a browser-based UI for previewing and placing cards on a video timeline, exporting a `.vtt` file
- [ ] Framework wrappers: React (`useVexyVlip` hook + `<VexyVlip>` component) and Vue 3 (`v-vexy-vlip` or a composable)
- [ ] i18n / multi-track support: load an alternate `.vtt` when `<track>` `srclang` matches a user preference; expose a `setTrack(url)` method
- [ ] Automated visual regression: screenshot each segment card in headless Chromium and compare against reference PNGs (similar to the `vexy-stax-js` render gate)
- [x] CDN release and jsDelivr usage examples in docs
- [ ] `poster` frame auto-extraction from the video at `startAt` when no `poster` URL is supplied
