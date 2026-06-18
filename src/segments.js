// this_file: src/segments.js
//
// Pure segment / stop-point navigation. A "segment" is one parsed card model
// (see vtt.js); a "stop point" is the start time of a segment, which is where
// the video pauses in stepped mode. Everything here is side-effect free and
// unit-tested.

const EPS = 0.02; // ~half a frame at 24fps; tolerance for float compares.

/**
 * Sort cards ascending by start time and return a stop-point table.
 * @param {Array} cards card models from parseCards()
 * @returns {Array<{index:number, time:number, end:number}>}
 */
export function stopPoints(cards) {
  return cards
    .map((c, i) => ({ index: i, time: c.start, end: c.end }))
    .sort((a, b) => a.time - b.time);
}

/**
 * Index of the segment active at time `t` ([start, end)). -1 if none.
 * @param {Array} cards
 * @param {number} t
 */
export function segmentAtTime(cards, t) {
  for (let i = 0; i < cards.length; i++) {
    if (t >= cards[i].start - EPS && t < cards[i].end - EPS) return i;
  }
  return -1;
}

/**
 * The next stop point strictly after `t`. Returns the segment index, or -1 if
 * the playhead is already past the last stop.
 * @param {Array} cards
 * @param {number} t
 * @param {number} [eps]
 */
export function nextStop(cards, t, eps = EPS) {
  let best = -1;
  let bestTime = Infinity;
  for (let i = 0; i < cards.length; i++) {
    const s = cards[i].start;
    if (s > t + eps && s < bestTime) {
      bestTime = s;
      best = i;
    }
  }
  return best;
}

/**
 * The previous stop point strictly before `t`. -1 if none.
 * @param {Array} cards
 * @param {number} t
 * @param {number} [eps]
 */
export function prevStop(cards, t, eps = EPS) {
  let best = -1;
  let bestTime = -Infinity;
  for (let i = 0; i < cards.length; i++) {
    const s = cards[i].start;
    if (s < t - eps && s > bestTime) {
      bestTime = s;
      best = i;
    }
  }
  return best;
}

/**
 * Which stop point the playhead is "resting on" — the last segment whose start
 * is at or before `t`. -1 if before the first stop.
 * @param {Array} cards
 * @param {number} t
 * @param {number} [eps]
 */
export function currentStop(cards, t, eps = EPS) {
  let best = -1;
  let bestTime = -Infinity;
  for (let i = 0; i < cards.length; i++) {
    const s = cards[i].start;
    if (s <= t + eps && s > bestTime) {
      bestTime = s;
      best = i;
    }
  }
  return best;
}

export { EPS };
