// this_file: src/index.js
//
// Public ESM entry. Side-effect free: importing this does NOT register the
// custom element (import "./element.js" or the global build for that).

export { VexyVlip, DEFAULTS } from "./player.js";
export { parseVtt, parseCards, cueToCard, parseTime, parseCueSettings, renderMarkdown } from "./vtt.js";
export { stopPoints, segmentAtTime, nextStop, prevStop, currentStop } from "./segments.js";
export { CSS, shadowCss, injectStyles } from "./styles.js";

export const version = "1.0.4"; // kept in sync with package.json by publish.sh
