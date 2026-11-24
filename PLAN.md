<!-- this_file: PLAN.md -->

# Plan

| Remaining work | Next check |
| --- | --- |
| Optional MediaBunny / WebCodecs adapter | Scrub a fragmented MP4 to a known frame. Check the existing eased seek path on a browser without the adapter. |
| Chapter navigation | Group segments into two named chapters and jump to each from the control bar. |
| External poster (issue 102) | The player sets `video.poster`, then seeks to paint the first frame. Use a poster visibly different from frame one and check it stays under Start after loading in both playback modes. |
| Overlapping cues | Play two overlapping cues with different positions. Both cards should appear during the overlap and disappear at their own end times. |
| RTL and vertical text | Check a card on an RTL host and compare cues using `vertical:rl` and `vertical:lr`. |
| Standalone card editor | Place a card on the timeline, export the `.vtt` and play it back to check its timing and position. |
| Framework wrappers | Mount and unmount the React hook/component and the Vue 3 directive or composable. |
| Alternate WebVTT tracks | Load a track matching the viewer's preferred language, then switch tracks with `setTrack(url)` and check the displayed cues. |
| Visual regression | Capture each segment card and compare it with its reference PNG. |
| Poster extraction at `startAt` | Supply a nonzero start time and omit the poster URL. Check that the extracted poster shows the frame at that time. |
