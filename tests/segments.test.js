// this_file: tests/segments.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  stopPoints,
  segmentAtTime,
  nextStop,
  prevStop,
  currentStop,
} from "../src/segments.js";

// Minimal card models (only start/end matter to these helpers).
const cards = [
  { start: 2, end: 4 },
  { start: 6, end: 8 },
  { start: 10, end: 12 },
];

test("stopPoints returns sorted start times", () => {
  const sp = stopPoints([{ start: 6, end: 8 }, { start: 2, end: 4 }]);
  assert.deepEqual(sp.map((s) => s.time), [2, 6]);
});

test("segmentAtTime finds the active segment", () => {
  assert.equal(segmentAtTime(cards, 0), -1);
  assert.equal(segmentAtTime(cards, 2), 0);
  assert.equal(segmentAtTime(cards, 3.9), 0);
  assert.equal(segmentAtTime(cards, 5), -1);
  assert.equal(segmentAtTime(cards, 7), 1);
  assert.equal(segmentAtTime(cards, 11), 2);
});

test("nextStop returns the next stop strictly after t", () => {
  assert.equal(nextStop(cards, 0), 0);
  assert.equal(nextStop(cards, 2), 1, "at a stop -> the following one");
  assert.equal(nextStop(cards, 5), 1);
  assert.equal(nextStop(cards, 6), 2);
  assert.equal(nextStop(cards, 10), -1, "past last stop -> none");
  assert.equal(nextStop(cards, 99), -1);
});

test("prevStop returns the previous stop strictly before t", () => {
  assert.equal(prevStop(cards, 0), -1);
  assert.equal(prevStop(cards, 2), -1, "exactly at first stop -> none before");
  assert.equal(prevStop(cards, 7), 1);
  assert.equal(prevStop(cards, 6.5), 1);
  assert.equal(prevStop(cards, 11), 2);
});

test("currentStop returns the stop the playhead rests on", () => {
  assert.equal(currentStop(cards, 0), -1);
  assert.equal(currentStop(cards, 2), 0);
  assert.equal(currentStop(cards, 5), 0);
  assert.equal(currentStop(cards, 6), 1);
  assert.equal(currentStop(cards, 100), 2);
});

test("stepped walk-through: advancing visits every stop then ends", () => {
  // Simulate the IDEA §6 click-to-advance sequence.
  let t = 0;
  const visited = [];
  for (let guard = 0; guard < 10; guard++) {
    const ni = nextStop(cards, t);
    if (ni === -1) break;
    t = cards[ni].start; // "play to" the next stop
    visited.push(ni);
  }
  assert.deepEqual(visited, [0, 1, 2]);
  assert.equal(nextStop(cards, t), -1, "after last card, next advance plays to end");
});
