// this_file: tests/cards.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import { composeBg } from "../src/cards.js";

test("composeBg leaves bg untouched without opacity", () => {
  assert.equal(composeBg("#10243a", null), "#10243a");
  assert.equal(composeBg("#10243a", 1), "#10243a");
  assert.equal(composeBg(undefined, 0.5), undefined, "no bg -> keep theme (undefined)");
});

test("composeBg composes alpha onto hex colours", () => {
  assert.equal(composeBg("#000000", 0.5), "rgba(0, 0, 0, 0.5)");
  assert.equal(composeBg("#fff", 0.25), "rgba(255, 255, 255, 0.25)");
});

test("composeBg composes alpha onto rgb()/rgba()", () => {
  assert.equal(composeBg("rgb(16, 36, 58)", 0.8), "rgba(16, 36, 58, 0.8)");
  assert.equal(composeBg("rgba(1,2,3,1)", 0.4), "rgba(1, 2, 3, 0.4)");
});

test("composeBg leaves gradients / named colours unchanged", () => {
  assert.equal(composeBg("linear-gradient(#000,#fff)", 0.5), "linear-gradient(#000,#fff)");
  assert.equal(composeBg("rebeccapurple", 0.5), "rebeccapurple");
});

test("composeBg clamps opacity", () => {
  assert.equal(composeBg("#000", 2), "#000", "opacity>=1 returns bg as-is");
  assert.equal(composeBg("#000", -1), "rgba(0, 0, 0, 0)");
});
