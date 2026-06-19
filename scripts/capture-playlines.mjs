// this_file: scripts/capture-playlines.mjs
//
// Screen-records a short, narrated walk-through of https://playlines.vexy.art/
// using the Playwright library, then writes the matching WebVTT card track.
// A synthetic cursor halo is injected so clicks/drags are visible in the video.
// Output: testdata/_rec/<hash>.webm  +  testdata/playlines.vtt (+ cues.json with
// head-trim/duration so transcode-playlines.sh can cut the lead-in).
//
// Run:  node scripts/capture-playlines.mjs   then   bash scripts/transcode-playlines.sh

import { chromium } from "playwright";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";

const URL = process.env.PL_URL || "https://playlines.vexy.art/";
const VP = { width: 1200, height: 720 };
const REC_DIR = "testdata/_rec";

rmSync(REC_DIR, { recursive: true, force: true });
mkdirSync(REC_DIR, { recursive: true });

function vtime(sec) {
  const m = Math.floor(sec / 60);
  const s = (sec % 60).toFixed(3).padStart(6, "0");
  return `${String(m).padStart(2, "0")}:${s}`;
}

const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const context = await browser.newContext({
  viewport: VP,
  recordVideo: { dir: REC_DIR, size: VP },
  reducedMotion: "no-preference",
});
const page = await context.newPage();
const creationWall = Date.now(); // video recording starts ~here; our trim reference

// --- load + consent -------------------------------------------------------
await page.goto(URL, { waitUntil: "networkidle", timeout: 45000 });
await page.waitForTimeout(1000);
for (const l of ["Accept All", "Reject All", "Accept", "Got it"]) {
  const b = page.getByRole("button", { name: l });
  if (await b.count()) { try { await b.first().click({ timeout: 1500 }); break; } catch {} }
}
await page.locator("raster-to-svg").waitFor({ timeout: 20000 });
await page.waitForTimeout(1500);

// --- inject a visible cursor halo ----------------------------------------
await page.evaluate(() => {
  const halo = document.createElement("div");
  halo.id = "__vv_halo";
  Object.assign(halo.style, {
    position: "fixed", left: "0", top: "0", width: "34px", height: "34px",
    marginLeft: "-17px", marginTop: "-17px", borderRadius: "50%",
    border: "3px solid #4ea1ff", boxShadow: "0 0 0 3px rgba(78,161,255,.35), 0 0 18px rgba(78,161,255,.6)",
    background: "rgba(78,161,255,.15)", zIndex: "2147483647", pointerEvents: "none",
    transition: "left .35s ease, top .35s ease, transform .15s ease", transform: "scale(1)",
  });
  document.body.appendChild(halo);
  window.__vvHalo = halo;
  window.__vvMove = (x, y) => { halo.style.left = x + "px"; halo.style.top = y + "px"; };
  window.__vvPulse = () => { halo.style.transform = "scale(0.6)"; setTimeout(() => (halo.style.transform = "scale(1)"), 160); };
});

const moveHalo = (x, y) => page.evaluate(([x, y]) => window.__vvMove(x, y), [x, y]);
const pulse = () => page.evaluate(() => window.__vvPulse());

// --- timing ---------------------------------------------------------------
let seqStart = 0;
const cues = [];
const now = () => (Date.now() - seqStart) / 1000;

async function card(text, place) {
  cues.push({ t: now(), text, place });
}

async function pointAt(loc) {
  const box = await loc.boundingBox();
  if (!box) return null;
  const x = Math.round(box.x + box.width / 2);
  const y = Math.round(box.y + box.height / 2);
  await moveHalo(x, y);
  await page.waitForTimeout(380);
  return { box, x, y };
}

async function clickEl(loc) {
  const p = await pointAt(loc);
  if (!p) return;
  await pulse();
  try { await loc.click({ timeout: 4000, force: true }); } catch {}
}

async function dragRange(loc, toFrac) {
  const box = await loc.boundingBox();
  if (!box) return;
  const y = Math.round(box.y + box.height / 2);
  const x0 = Math.round(box.x + box.width * 0.18);
  const x1 = Math.round(box.x + box.width * toFrac);
  await moveHalo(x0, y);
  await page.waitForTimeout(250);
  await page.mouse.move(x0, y);
  await page.mouse.down();
  const steps = 12;
  for (let i = 1; i <= steps; i++) {
    const x = Math.round(x0 + ((x1 - x0) * i) / steps);
    await page.mouse.move(x, y);
    await moveHalo(x, y);
    await page.waitForTimeout(28);
  }
  await page.mouse.up();
}

// =========================================================================
// The walk-through. Each step shows a card (in stepped playback, the video
// pauses here) then performs one visible action.
// =========================================================================
seqStart = Date.now();
const samples = page.locator("button.sample");
const fills = page.locator("button.fillBtn");
const ranges = page.locator('input[type=range]');
const toggle = page.locator("button.toggle").first();
const download = page.locator("button.primary", { hasText: "Download" });

// 0 — intro
await card("Vexy Playlines turns any photo into editable vector line-art.", { x: 50, y: 16, anchor: "top", w: 56 });
await page.waitForTimeout(1600);

// 1 — pick a source image
await card("Pick a source image from the gallery.", { x: 16, y: 30, anchor: "left", w: 34 });
await clickEl(samples.nth(3));
await page.waitForTimeout(2000);

// 2 — choose a fill pattern
await card("Choose a line-fill pattern…", { x: 70, y: 24, anchor: "top-right", w: 38 });
await clickEl(fills.nth(7));
await page.waitForTimeout(1900);

// 3 — another pattern
await card("…every shape restyles live.", { x: 70, y: 24, anchor: "top-right", w: 38 });
await clickEl(fills.nth(12));
await page.waitForTimeout(1900);

// 4 — line frequency slider
await card("Drag to change the line frequency.", { x: 64, y: 52, anchor: "right", w: 36 });
await dragRange(ranges.nth(0), 0.8);
await page.waitForTimeout(1500);

// 5 — stroke weight slider
await card("Tune the stroke weight.", { x: 64, y: 58, anchor: "right", w: 34 });
await dragRange(ranges.nth(1), 0.7);
await page.waitForTimeout(1500);

// 6 — third linear property
await card("Adjust line spacing.", { x: 64, y: 64, anchor: "right", w: 34 });
await dragRange(ranges.nth(2), 0.35);
await page.waitForTimeout(1500);

// 7 — invert / colour toggle
await card("Flip the colours with one click.", { x: 60, y: 60, anchor: "right", w: 36 });
await clickEl(toggle);
await page.waitForTimeout(1700);

// 8 — image detail slider
await card("Refine how much image detail is traced.", { x: 60, y: 72, anchor: "right", w: 38 });
await dragRange(ranges.nth(3), 0.75);
await page.waitForTimeout(1600);

// 9 — export
await card("Export your artwork as a clean SVG.", { x: 88, y: 86, anchor: "bottom-right", w: 34 });
if (await download.count()) await pointAt(download.first());
await page.waitForTimeout(1700);

const endWall = Date.now();
const headTrim = (seqStart - creationWall) / 1000; // lead-in to cut (approx; refined in transcode)
const duration = (endWall - seqStart) / 1000;

await page.waitForTimeout(300);
const videoPath = await page.video().path();
await context.close(); // flushes the video file
await browser.close();

// --- write VTT + sidecar --------------------------------------------------
// Emit standard WebVTT cue settings (percentages), not JSON: the nine-point
// anchor maps to position-align (horizontal) × line-align (vertical).
const H = { left: "line-left", center: "center", right: "line-right" };
const V = { top: "start", center: "center", bottom: "end" };
function cueSettings({ x, y, anchor = "bottom", w }) {
  const h = anchor === "left" || anchor.endsWith("-left") ? "left"
    : anchor === "right" || anchor.endsWith("-right") ? "right" : "center";
  const v = anchor === "top" || anchor.startsWith("top") ? "top"
    : anchor === "bottom" || anchor.startsWith("bottom") ? "bottom" : "center";
  let out = `position:${x}%,${H[h]} line:${y}%,${V[v]}`;
  if (w != null) out += ` size:${w}%`;
  return out;
}
let vtt = "WEBVTT\n\nNOTE Auto-generated by scripts/capture-playlines.mjs — Vexy Playlines walk-through.\n";
cues.forEach((c, i) => {
  const start = c.t;
  const end = (cues[i + 1] ? cues[i + 1].t : duration) - 0.05;
  vtt += `\nstep-${i + 1}\n${vtime(start)} --> ${vtime(Math.max(end, start + 0.4))} ${cueSettings(c.place)}\n${c.text}\n`;
});
writeFileSync("testdata/playlines.vtt", vtt);
writeFileSync(`${REC_DIR}/cues.json`, JSON.stringify({ videoPath, headTrim, duration, cues }, null, 2));
console.log("VIDEO:", videoPath);
console.log("headTrim(s):", headTrim.toFixed(2), "duration(s):", duration.toFixed(2), "cues:", cues.length);
