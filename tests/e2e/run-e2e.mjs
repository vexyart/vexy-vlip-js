// this_file: tests/e2e/run-e2e.mjs
//
// End-to-end smoke tests driven by the Playwright *library* API (chromium),
// NOT the @playwright/test runner — the runner's ESM loader hook is broken
// under Node 26, but the automation library works fine. This script boots a
// vite dev server, runs real-browser assertions against the fixture page, and
// exits non-zero on any failure. Run with: npm run test:e2e

import { spawn } from "node:child_process";
import assert from "node:assert/strict";
import { chromium } from "playwright";

const PORT = process.env.VV_PORT || 5179;
const BASE = `http://localhost:${PORT}`;
const FIXTURE = `${BASE}/tests/fixtures/player.html`;

const cases = [];
const testCase = (name, fn) => cases.push({ name, fn });

async function waitReady(page) {
  await page.waitForFunction(() => window.vlip && window.vlip.ready, null, { timeout: 15000 });
}

// ---- scenarios ----------------------------------------------------------

testCase("ready event fires and parses 5 segments", async (ctx) => {
  const page = await ctx.newPage();
  await page.goto(FIXTURE);
  await waitReady(page);
  assert.equal(await page.evaluate(() => window.vlip.segments.length), 5);
});

testCase("start: dimmed first frame + centered Start CTA, both modes", async (ctx) => {
  for (const mode of ["stepped", "continuous"]) {
    const page = await ctx.newPage();
    await page.goto(FIXTURE + "?mode=" + mode);
    await waitReady(page);
    assert.equal(await page.getAttribute(".vexy-vlip", "data-start"), "true", `${mode}: Start shown`);
    assert.equal(await page.getAttribute(".vexy-vlip", "data-overlay"), "true", `${mode}: first frame dimmed`);
    assert.ok(await page.locator(".vexy-vlip__start").isVisible(), `${mode}: Start button visible`);
    assert.equal(await page.evaluate(() => window.vlip.video.paused), true, `${mode}: paused before start`);
    await page.locator(".vexy-vlip__start").click();
    await page.waitForFunction(() => document.querySelector(".vexy-vlip").dataset.start === "false", null, { timeout: 5000 });
    if (mode === "continuous") {
      assert.equal(await page.getAttribute(".vexy-vlip", "data-overlay"), "false", "continuous: dim cleared after start");
      assert.equal(await page.evaluate(() => window.vlip.video.paused), false, "continuous: plays after start");
    }
    await page.close();
  }
});

testCase("stepped: pauses at first cue and shows card 0 on advance", async (ctx) => {
  const page = await ctx.newPage();
  await page.goto(FIXTURE + "?mode=stepped");
  await waitReady(page);
  assert.equal(await page.evaluate(() => window.vlip.video.paused), true);
  assert.equal(await page.locator(".vexy-vlip__card--in").count(), 0);

  await page.locator(".vexy-vlip__start").click(); // begin: dismiss the Start CTA → first card
  await page.waitForFunction(() => window.__events.some((e) => e.type === "stop"), null, { timeout: 15000 });

  assert.equal(await page.evaluate(() => window.vlip.video.paused), true);
  const t = await page.evaluate(() => window.vlip.video.currentTime);
  assert.ok(t >= 1.9 && t < 2.6, `currentTime ${t} should be ~2.0`);
  assert.equal(await page.locator(".vexy-vlip__card--in").count(), 1);
  assert.match(await page.locator(".vexy-vlip__card--in .vexy-vlip__body").innerText(), /plain-text/);
});

testCase("stepped: advancing twice reaches the second card", async (ctx) => {
  const page = await ctx.newPage();
  await page.goto(FIXTURE + "?mode=stepped");
  await waitReady(page);
  const tap = page.locator(".vexy-vlip__tap");
  // Click a top corner of the tap layer — once a card is shown it covers the
  // centre (which also advances, but Playwright refuses an intercepted click).
  const corner = { position: { x: 6, y: 6 } };
  await tap.click(corner);
  await page.waitForFunction(() => window.__events.filter((e) => e.type === "stop").length === 1);
  await tap.click(corner);
  await page.waitForFunction(() => window.__events.filter((e) => e.type === "stop").length === 2, null, { timeout: 15000 });
  assert.equal(await page.evaluate(() => window.vlip.currentSegment), 1);
});

testCase("continuous: a card appears while playing across a cue", async (ctx) => {
  const page = await ctx.newPage();
  await page.goto(FIXTURE + "?mode=continuous");
  await waitReady(page);
  await page.evaluate(() => { window.vlip.seekTo(1.8); window.vlip.play(); });
  await page.locator(".vexy-vlip__card--in").waitFor({ state: "visible", timeout: 8000 });
  assert.match(await page.locator(".vexy-vlip__card--in .vexy-vlip__body").innerText(), /plain-text/);
});

testCase("controls: one dot per segment", async (ctx) => {
  const page = await ctx.newPage();
  await page.goto(FIXTURE);
  await waitReady(page);
  assert.equal(await page.locator(".vexy-vlip__dot").count(), 5);
});

testCase("stepped: a cue at 00:00 is shown on the first advance (not skipped)", async (ctx) => {
  const page = await ctx.newPage();
  await page.goto(FIXTURE + "?mode=stepped&track=/testdata/zero.vtt");
  await waitReady(page);
  await page.locator(".vexy-vlip__start").click(); // begin: dismiss the Start CTA → first card
  await page.waitForFunction(() => window.__events.some((e) => e.type === "stop"), null, { timeout: 15000 });
  assert.equal(await page.evaluate(() => window.vlip.currentSegment), 0, "first advance must land on card 0");
  assert.match(await page.locator(".vexy-vlip__card--in .vexy-vlip__body").innerText(), /first card starts at time zero/i);
});

testCase("stepped: prev() returns to the earlier card", async (ctx) => {
  const page = await ctx.newPage();
  await page.goto(FIXTURE + "?mode=stepped");
  await waitReady(page);
  await page.evaluate(() => window.vlip.goToSegment(2));
  assert.equal(await page.evaluate(() => window.vlip.currentSegment), 2);
  await page.evaluate(() => window.vlip.prev());
  assert.equal(await page.evaluate(() => window.vlip.currentSegment), 1);
});

testCase("stepped: rest stop dims the video (overlay on, paused) and shows the in-card nav", async (ctx) => {
  const page = await ctx.newPage();
  await page.goto(FIXTURE + "?mode=stepped");
  await waitReady(page);
  await page.locator(".vexy-vlip__start").click(); // begin: dismiss the Start CTA → first card
  await page.waitForFunction(() => window.__events.some((e) => e.type === "stop"), null, { timeout: 15000 });

  assert.equal(await page.getAttribute(".vexy-vlip", "data-overlay"), "true", "overlay on at rest");
  assert.equal(await page.evaluate(() => window.vlip.video.paused), true, "video paused under overlay");
  // Wait out the 0.28s opacity transition before reading the settled value.
  await page.waitForFunction(
    () => getComputedStyle(document.querySelector(".vexy-vlip__overlay")).opacity === "1",
    null, { timeout: 5000 });

  // The active card carries the in-card nav: a visible Next button, no counter
  // (off by default), and a close (×) button (on by default).
  const next = page.locator(".vexy-vlip__card--in .vexy-vlip__next");
  assert.equal(await next.count(), 1, "in-card Next button present");
  assert.ok(await next.isVisible(), "Next button visible at rest");
  assert.equal(await page.locator(".vexy-vlip__card--in .vexy-vlip__counter").count(), 0, "no counter by default");
  assert.ok(await page.locator(".vexy-vlip__card--in .vexy-vlip__close").isVisible(), "close × visible");
});

testCase("stepped: the × button drops to plain video mode (continuous, no overlay, playing)", async (ctx) => {
  const page = await ctx.newPage();
  await page.goto(FIXTURE + "?mode=stepped");
  await waitReady(page);
  await page.locator(".vexy-vlip__start").click(); // begin: dismiss the Start CTA → first card
  await page.waitForFunction(() => window.__events.some((e) => e.type === "stop"), null, { timeout: 15000 });

  await page.locator(".vexy-vlip__card--in .vexy-vlip__close").click();
  await page.waitForFunction(() => window.vlip.mode === "continuous", null, { timeout: 5000 });
  assert.equal(await page.getAttribute(".vexy-vlip", "data-overlay"), "false", "overlay cleared after close");
  assert.equal(await page.evaluate(() => window.vlip.video.paused), false, "video plays after close");
});

testCase("auto-fit: a card never overflows the player box", async (ctx) => {
  const page = await ctx.newPage();
  await page.goto(FIXTURE + "?mode=stepped");
  await waitReady(page);
  await page.locator(".vexy-vlip__start").click(); // begin: dismiss the Start CTA → first card
  await page.waitForFunction(() => window.__events.some((e) => e.type === "stop"), null, { timeout: 15000 });
  const fits = await page.evaluate(() => {
    const root = document.querySelector(".vexy-vlip").getBoundingClientRect();
    const card = document.querySelector(".vexy-vlip__card--in").getBoundingClientRect();
    return card.left >= root.left - 1 && card.right <= root.right + 1
      && card.top >= root.top - 1 && card.bottom <= root.bottom + 1;
  });
  assert.ok(fits, "active card stays within the player bounds");
});

testCase("stepped: bottom bar shows only the step dots; clicking the in-card Next advances", async (ctx) => {
  const page = await ctx.newPage();
  await page.goto(FIXTURE + "?mode=stepped");
  await waitReady(page);
  await page.locator(".vexy-vlip__start").click(); // begin: dismiss the Start CTA → first card
  await page.waitForFunction(() => window.__events.some((e) => e.type === "stop"), null, { timeout: 15000 });

  const anyBtnVisible = await page.evaluate(() =>
    [...document.querySelectorAll(".vexy-vlip__btn")].some((b) => getComputedStyle(b).display !== "none"));
  assert.equal(anyBtnVisible, false, "play/prev/next/mute/fs hidden in stepped mode");
  assert.equal(await page.locator(".vexy-vlip__dot").count(), 5, "dots remain");

  await page.locator(".vexy-vlip__card--in .vexy-vlip__next").click();
  await page.waitForFunction(() => window.__events.filter((e) => e.type === "stop").length === 2, null, { timeout: 15000 });
  assert.equal(await page.evaluate(() => window.vlip.currentSegment), 1, "Next click advanced to card 1");
});

testCase("stepped: the in-card Back button returns to the previous card", async (ctx) => {
  const page = await ctx.newPage();
  await page.goto(FIXTURE + "?mode=stepped");
  await waitReady(page);
  await page.evaluate(() => window.vlip.goToSegment(2));
  assert.equal(await page.evaluate(() => window.vlip.currentSegment), 2);
  await page.locator(".vexy-vlip__card--in .vexy-vlip__prev").click();
  assert.equal(await page.evaluate(() => window.vlip.currentSegment), 1, "Back click went to card 1");
});

testCase("destroy() removes the chrome and leaves no card/control DOM", async (ctx) => {
  const page = await ctx.newPage();
  await page.goto(FIXTURE);
  await waitReady(page);
  await page.evaluate(() => window.vlip.destroy());
  assert.equal(await page.locator("#host .vexy-vlip__controls").count(), 0, "control bar removed");
  assert.equal(await page.locator("#host .vexy-vlip__tap").count(), 0, "tap layer removed");
  assert.equal(await page.locator("#host .vexy-vlip__cards").count(), 0, "cards layer removed");
  assert.equal(await page.locator("#host .vexy-vlip__overlay").count(), 0, "overlay removed");
});

// ---- harness ------------------------------------------------------------

async function waitForServer(url, tries = 40) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  return false;
}

async function main() {
  const vite = spawn("node_modules/.bin/vite", ["--port", String(PORT), "--strictPort"], {
    stdio: ["ignore", "pipe", "pipe"],
  });
  let viteLog = "";
  vite.stdout.on("data", (d) => (viteLog += d));
  vite.stderr.on("data", (d) => (viteLog += d));

  let browser;
  let failures = 0;
  try {
    if (!(await waitForServer(FIXTURE))) {
      console.error("vite did not start:\n" + viteLog);
      process.exitCode = 1;
      return;
    }
    browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
    for (const c of cases) {
      const ctx = await browser.newContext({ viewport: { width: 800, height: 480 } });
      try {
        await c.fn(ctx);
        console.log(`  ✔ ${c.name}`);
      } catch (err) {
        failures++;
        console.error(`  ✘ ${c.name}\n      ${err.message}`);
      } finally {
        await ctx.close();
      }
    }
  } finally {
    if (browser) await browser.close();
    vite.kill("SIGTERM");
  }
  console.log(`\n${cases.length - failures}/${cases.length} e2e checks passed`);
  process.exitCode = failures ? 1 : 0;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
