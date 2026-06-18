// this_file: scripts/build-docs.mjs
//
// Assembles the GitHub-Pages site in docs/: copies the freshly built dist
// bundles and the testdata media next to the hand-written demo HTML pages.
// Run after `npm run build`. The demo .html files are committed; this script
// only refreshes the generated assets (bundles + media), so it is safe to run
// repeatedly.

import { mkdirSync, copyFileSync, existsSync, readdirSync } from "node:fs";

const root = new URL("..", import.meta.url).pathname;
const docs = root + "docs";
const media = docs + "/media";
mkdirSync(media, { recursive: true });

function copy(from, to) {
  if (!existsSync(from)) {
    console.warn("  ! missing (skipped):", from);
    return false;
  }
  copyFileSync(from, to);
  console.log("  +", to.replace(root, ""));
  return true;
}

console.log("==> Copying dist bundles into docs/");
const bundles = readdirSync(root + "dist").filter((f) => f.endsWith(".js") || f.endsWith(".map"));
if (bundles.length === 0) console.warn("  ! dist is empty — run `npm run build` first.");
for (const f of bundles) copy(`${root}dist/${f}`, `${docs}/${f}`);

console.log("==> Copying testdata media into docs/media/");
for (const f of ["playlines.mp4", "playlines.vtt", "sample.mp4", "sample.vtt"]) {
  copy(`${root}testdata/${f}`, `${media}/${f}`);
}

console.log("==> docs/ ready for GitHub Pages.");
