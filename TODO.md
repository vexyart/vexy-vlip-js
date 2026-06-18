<!-- this_file: TODO.md -->

# TODO

Future work — everything listed here is not yet built.

- [ ] Optional MediaBunny / WebCodecs adapter for frame-exact scrubbing (replaces the rAF `currentTime` loop when the browser supports it and the source is a fragmented MP4)
- [ ] Chapter / region grouping: treat a subset of segments as a named chapter; expose chapter navigation in the control bar
- [ ] Multiple simultaneous cards: show more than one active cue at a time (overlapping cue ranges), each positioned independently
- [ ] RTL and vertical text: honour `dir="rtl"` on the host and the WebVTT `vertical:rl`/`lr` cue setting for cards
- [ ] Authoring / editor tool: a browser-based UI for previewing and placing cards on a video timeline, exporting a `.vtt` file
- [ ] Framework wrappers: React (`useVexyVlip` hook + `<VexyVlip>` component) and Vue 3 (`v-vexy-vlip` or a composable)
- [ ] i18n / multi-track support: load an alternate `.vtt` when `<track>` `srclang` matches a user preference; expose a `setTrack(url)` method
- [ ] Automated visual regression: screenshot each segment card in headless Chromium and compare against reference PNGs (similar to the `vexy-stax-js` render gate)
- [ ] CDN release and jsDelivr usage examples in docs
- [ ] `poster` frame auto-extraction from the video at `startAt` when no `poster` URL is supplied
