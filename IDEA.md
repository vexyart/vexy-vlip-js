./vexy-vlip-js/ should be a browser JS package that can be used by users as a web component, ESM and global library, similar to how it’s done in ./vexy-stax-js/ and ./i.vexy.art/dev/lines-nano/ 

Vexy Vlip is a specialized 'video player'. Rather than playing video clips continuously, it has several special functionalities: 

1. It uses a video and WebVTT. 

2. It treats the WebVTT not as "subtitles" that are optional, but as "on-screen cards" that are used to explain stuff. 

3. It uses the WebVTT positioning hints for subtitles intelligently. 

4. It allows styling of the typographic cards that goes beyond typical subtitle rendering capabilities. It allows semitransparent or opaque backdrops for the cards, different fonts and colors (for foreground and the backdrop), and some extra features like rounded corners, borders or shadows. 

5. The player has a continuous play mode that kind of works like a normal video player. 

6. It has an 'stop-motion' mode wher the user clicks the video and then the video plays up to the 1st subtitle. Then the video stops and the 1st subtitle is displayed permanently. When the user clicks the video again, that 1st subtitle disappears and video plays all the way to the 2nd subtitle, and stops, and the 2nd subtitle appears until the user clicks again. This is useful for tutorials and explainer videos. 

7. Optionally, the video playback functionalities can be fine-tuned. For example the sections between the subtitles could be played straight, or could be played with a speed that’s ease-in-out. For this, something like MediaBunny could be used. 

8. Analyze ./vexy-vlip-js/research/webvideoscrubbing.md and ./vexy-vlip-js/research/webvideotrack.md — these contain very useful tips and considerations. 

9. Into ./vexy-vlip-js/SPEC.md write a detailed specification for the library. 

10. Into ./vexy-vlip-js/docs/ you’ll be writing a demo site that showcases Vexy Vlip and the different things you can do with it. It’ll be deployed at http://vexy.dev/vexy-vlip-js/ (via Github Pages). Use ./vexy-stax-js/docs/ and ./i.vexy.art/dev/lines-nano/ for inspiration. 

11. In ./vexy-vlip-js/testdata/ you need some reference video. Produce such video by automating browser and screen-recording some work https://playlines.vexy.art/ and add a few "subtitles" at the points where you click or drag to perform meaningful actions. The total video should not be longer than 30 seconds, and should have about 10 subtitles (segments). 

12. Into ./TODO.md write a detailed actionable tasklist of `- [ ]`-prefixed items. 

13. Then ultrathink and ultrawork on all the TODO tasks. As you proceed, verify the tasks and move the verified-solved into ./vexy-vlip-js/CHANGELOG.md 

14. Proceed and iterate until we have a fully-functional, Github-deployed and NPM-deployed package, and a good Vexy Playlines explainer demo. 

