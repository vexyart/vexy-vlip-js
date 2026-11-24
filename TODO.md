<!-- this_file: TODO.md -->

# TODO

- [ ] Add an optional MediaBunny / WebCodecs adapter for frame-exact scrubbing of fragmented MP4.
- [ ] Group segments into named chapters and let viewers jump between them from the control bar.
- [ ] Verify that a supplied `poster` image stays visible under Start until playback begins (issue 102).
- [ ] Show independently positioned cards for overlapping cues.
- [ ] Honour host `dir="rtl"` and WebVTT `vertical:rl` / `vertical:lr` on cards.
- [ ] Build a standalone browser editor for placing cards on a timeline and exporting WebVTT.
- [ ] Provide React and Vue 3 wrappers for the player.
- [ ] Select a WebVTT track by `srclang` and expose `setTrack(url)`.
- [ ] Compare screenshots of each segment card against reference PNGs.
- [ ] Extract a poster frame at `startAt` when no poster URL is supplied.
