// this_file: scripts/verify-docs.mjs
// Smoke-tests the built docs/ site in a real browser: boots vite, loads each
// page from /docs/, and asserts the player initialises and behaves. Also
// screenshots the landing page. Run: node scripts/verify-docs.mjs
import { spawn } from "node:child_process";
import assert from "node:assert/strict";
import { chromium } from "playwright";

const PORT = 5181;
const BASE = `http://localhost:${PORT}/docs`;

async function waitServer(url, n = 40) {
  for (let i = 0; i < n; i++) { try { if ((await fetch(url)).ok) return true; } catch {} await new Promise((r) => setTimeout(r, 300)); }
  return false;
}

const vite = spawn("node_modules/.bin/vite", ["--port", String(PORT), "--strictPort"], { stdio: ["ignore", "pipe", "pipe"] });
let failures = 0;
let browser;
const ok = (name) => console.log(`  ✔ ${name}`);
const bad = (name, e) => { failures++; console.error(`  ✘ ${name}\n      ${e.message}`); };

try {
  if (!(await waitServer(`${BASE}/index.html`))) throw new Error("vite did not start");
  browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });

  // index.html — global build, hero <vexy-vlip>, stepped
  try {
    const page = await browser.newContext({ viewport: { width: 1100, height: 820 } }).then((c) => c.newPage());
    await page.goto(`${BASE}/index.html`);
    await page.waitForFunction(() => { const el = document.getElementById("hero"); return el && el.ready; }, null, { timeout: 15000 });
    assert.equal(await page.evaluate(() => document.getElementById("hero").segments.length), 10, "hero has 10 cards");
    await page.locator("#hero .vexy-vlip__tap").click();
    await page.locator("#hero .vexy-vlip__card--in").waitFor({ state: "visible", timeout: 15000 });
    ok("index.html: global build, hero advances and shows a card");
    await page.screenshot({ path: "scripts/docs-index.png" });
    await page.close();
  } catch (e) { bad("index.html", e); }

  // demo-module.html — ESM import { VexyVlip }
  try {
    const page = await browser.newContext().then((c) => c.newPage());
    await page.goto(`${BASE}/demo-module.html`);
    await page.waitForFunction(() => document.querySelector("#host .vexy-vlip__dot"), null, { timeout: 15000 });
    const dots = await page.locator("#host .vexy-vlip__dot").count();
    assert.equal(dots, 5, "module demo sample.vtt -> 5 dots");
    ok("demo-module.html: ESM class instantiates (5 cards)");
    await page.close();
  } catch (e) { bad("demo-module.html", e); }

  // demo-component.html — custom element upgrades
  try {
    const page = await browser.newContext().then((c) => c.newPage());
    await page.goto(`${BASE}/demo-component.html`);
    await page.waitForFunction(() => { const el = document.querySelector("vexy-vlip"); return el && el.shadowRoot && el.shadowRoot.querySelector("video"); }, null, { timeout: 15000 });
    ok("demo-component.html: <vexy-vlip> upgrades with a shadow video");
    await page.close();
  } catch (e) { bad("demo-component.html", e); }

  // demo-library.html — window.VexyVlip
  try {
    const page = await browser.newContext().then((c) => c.newPage());
    await page.goto(`${BASE}/demo-library.html`);
    await page.waitForFunction(() => typeof window.VexyVlip === "function", null, { timeout: 15000 });
    await page.waitForFunction(() => document.querySelector("#host .vexy-vlip__dot"), null, { timeout: 15000 });
    const dots = await page.locator("#host .vexy-vlip__dot").count();
    assert.equal(dots, 10, "library demo playlines.vtt -> 10 dots");
    ok("demo-library.html: window.VexyVlip works (10 cards)");
    await page.close();
  } catch (e) { bad("demo-library.html", e); }
} catch (e) {
  bad("harness", e);
} finally {
  if (browser) await browser.close();
  vite.kill("SIGTERM");
}
console.log(`\n${failures ? "FAILED " + failures : "All docs pages OK"}`);
process.exit(failures ? 1 : 0);
