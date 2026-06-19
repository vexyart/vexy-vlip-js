// this_file: scripts/build-docs.mjs
//
// Assembles the GitHub-Pages site in docs/: copies the freshly built dist
// bundles and the testdata media next to the hand-written demo HTML pages.
// Run after `npm run build`. The demo .html files are committed; this script
// only refreshes the generated assets (bundles + media), so it is safe to run
// repeatedly.

import { mkdirSync, copyFileSync, existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

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

// --- cache-busting --------------------------------------------------------
// The deploy chain works, but GitHub Pages / the CDN cache the *unversioned*
// bundle filenames, so a fresh deploy can keep serving the old script. Stamp a
// short content hash onto the bundles' functional <script src>/import refs in
// the demo HTML so each new build forces a fresh fetch. The hash only changes
// when the bundle content changes, so unchanged builds don't churn the HTML.
// The `<pre><code>` copy-paste examples are left clean (their refs are escaped
// as &lt;script&gt; / use the bare "vexy-vlip-js" specifier, so they don't match).
console.log("==> Stamping cache-busting hashes into docs/*.html");
const hashOf = (file) =>
  existsSync(file) ? createHash("sha256").update(readFileSync(file)).digest("hex").slice(0, 8) : null;
const globalHash = hashOf(`${docs}/vexy-vlip.global.js`);
const elementHash = hashOf(`${docs}/vexy-vlip.element.js`);
const stamps = [
  // [ regex over the functional reference, replacement using $1/$3 ]
  globalHash && [/(<script src="vexy-vlip\.global\.js)(\?v=[a-f0-9]+)?(">)/g, `$1?v=${globalHash}$3`],
  elementHash && [/(<script type="module" src="vexy-vlip\.element\.js)(\?v=[a-f0-9]+)?(">)/g, `$1?v=${elementHash}$3`],
  elementHash && [/(from "\.\/vexy-vlip\.element\.js)(\?v=[a-f0-9]+)?(")/g, `$1?v=${elementHash}$3`],
].filter(Boolean);
for (const f of readdirSync(docs).filter((n) => n.endsWith(".html"))) {
  const path = `${docs}/${f}`;
  const before = readFileSync(path, "utf8");
  let after = before;
  for (const [re, repl] of stamps) after = after.replace(re, repl);
  if (after !== before) {
    writeFileSync(path, after);
    console.log("  ~", `docs/${f}`);
  }
}

console.log("==> docs/ ready for GitHub Pages.");
