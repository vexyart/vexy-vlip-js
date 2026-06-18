// this_file: src/vtt.js
//
// Pure WebVTT parsing + cue → card-model helpers. No DOM, no browser APIs, so
// this module is unit-testable under `node --test`. The player fetches the VTT
// text and parses it here rather than relying on the native <track> renderer —
// that gives us full control over the payload (which may be JSON) and avoids
// cross-browser cuechange/load timing quirks.

/**
 * Parse a WebVTT timestamp ("MM:SS.mmm" or "HH:MM:SS.mmm") into seconds.
 * @param {string} stamp
 * @returns {number} seconds, or NaN if malformed.
 */
export function parseTime(stamp) {
  if (typeof stamp !== "string") return NaN;
  const m = stamp.trim().match(/^(?:(\d+):)?(\d{1,2}):(\d{2})(?:[.,](\d{1,3}))?$/);
  if (!m) return NaN;
  const [, h, mm, ss, ms] = m;
  const hours = h ? Number(h) : 0;
  const secs = hours * 3600 + Number(mm) * 60 + Number(ss);
  return secs + (ms ? Number(ms.padEnd(3, "0")) / 1000 : 0);
}

/**
 * Parse the cue-settings portion of a timing line into a plain object.
 * Recognises the standard WebVTT settings used for placement.
 * @param {string} str e.g. "position:20% line:80% size:40% align:start"
 * @returns {{position?:string, line?:string, size?:string, align?:string, vertical?:string}}
 */
export function parseCueSettings(str) {
  const out = {};
  if (!str) return out;
  for (const token of str.trim().split(/\s+/)) {
    const idx = token.indexOf(":");
    if (idx <= 0) continue;
    const key = token.slice(0, idx);
    const val = token.slice(idx + 1);
    if (["position", "line", "size", "align", "vertical", "region"].includes(key)) {
      out[key] = val;
    }
  }
  return out;
}

const TIMING_RE = /^(\d{1,2}:)?\d{1,2}:\d{2}[.,]\d{1,3}\s*-->\s*(\d{1,2}:)?\d{1,2}:\d{2}[.,]\d{1,3}/;

/**
 * Parse a full WebVTT document into an array of raw cues.
 * NOTE blocks, STYLE/REGION blocks and blank lines are skipped.
 * @param {string} text
 * @returns {Array<{index:number,id:string,start:number,end:number,settings:object,payload:string}>}
 */
export function parseVtt(text) {
  const cues = [];
  if (typeof text !== "string") return cues;
  // Normalise newlines, drop the BOM, split into blocks on blank lines.
  const normalised = text.replace(/^﻿/, "").replace(/\r\n?/g, "\n");
  const blocks = normalised.split(/\n\n+/);
  let index = 0;
  for (const block of blocks) {
    const lines = block.split("\n").filter((l) => l.length > 0);
    if (lines.length === 0) continue;
    let i = 0;
    // First line of the file is "WEBVTT" — skip its block.
    if (/^WEBVTT/.test(lines[0]) && index === 0 && !TIMING_RE.test(lines[0])) {
      if (lines.length === 1) continue;
      i = 1;
    }
    // Skip NOTE / STYLE / REGION blocks entirely.
    if (/^(NOTE|STYLE|REGION)\b/.test(lines[i])) continue;
    let id = "";
    // Optional cue identifier line precedes the timing line.
    if (lines[i] && !lines[i].includes("-->")) {
      id = lines[i];
      i += 1;
    }
    const timing = lines[i];
    if (!timing || !timing.includes("-->")) continue;
    const arrowIdx = timing.indexOf("-->");
    const start = parseTime(timing.slice(0, arrowIdx));
    const rest = timing.slice(arrowIdx + 3).trim();
    const spaceIdx = rest.indexOf(" ");
    const endStr = spaceIdx === -1 ? rest : rest.slice(0, spaceIdx);
    const settingsStr = spaceIdx === -1 ? "" : rest.slice(spaceIdx + 1);
    const end = parseTime(endStr);
    if (Number.isNaN(start) || Number.isNaN(end)) continue;
    const payload = lines.slice(i + 1).join("\n");
    cues.push({
      index: index++,
      id,
      start,
      end,
      settings: parseCueSettings(settingsStr),
      payload,
    });
  }
  return cues;
}

const ESCAPE_MAP = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

/** Escape HTML-special characters. @param {string} s */
export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ESCAPE_MAP[c]);
}

/**
 * Render the tiny inline markdown subset (**bold**, *italic*, `code`,
 * newlines) into safe HTML. Input is escaped first, so no raw HTML survives.
 * @param {string} text
 * @returns {string}
 */
export function renderMarkdown(text) {
  let html = escapeHtml(text);
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, "<em>$1</em>");
  html = html.replace(/\n/g, "<br>");
  return html;
}

const ANCHORS = new Set([
  "center", "top", "bottom", "left", "right",
  "top-left", "top-right", "bottom-left", "bottom-right",
]);

/** Strip a trailing % and return a Number, else NaN. */
function pct(v) {
  if (typeof v === "number") return v;
  if (typeof v === "string") return parseFloat(v.replace("%", ""));
  return NaN;
}

/**
 * Detect whether a payload is JSON (object). Returns the parsed object or null.
 * @param {string} payload
 */
export function tryParseJson(payload) {
  const trimmed = (payload || "").trim();
  if (!trimmed.startsWith("{")) return null;
  try {
    const obj = JSON.parse(trimmed);
    return obj && typeof obj === "object" ? obj : null;
  } catch {
    return null;
  }
}

/**
 * Convert a raw cue into a normalised card model: resolved placement + style +
 * rendered HTML. Pure: returns data only, the DOM layer applies it.
 * @param {{start:number,end:number,settings:object,payload:string,index:number,id:string}} cue
 * @param {object} [defaults] player-level card defaults (unused for geometry).
 * @returns {object} card model
 */
export function cueToCard(cue, defaults = {}) {
  const json = tryParseJson(cue.payload);
  const s = cue.settings || {};

  // --- text / html ---
  let html;
  let text;
  if (json && typeof json.html === "string") {
    html = json.html; // trusted unless the player chooses to sanitise
    text = json.text || "";
  } else if (json && typeof json.text === "string") {
    text = json.text;
    html = renderMarkdown(json.text);
  } else {
    text = cue.payload;
    html = renderMarkdown(cue.payload);
  }

  // --- placement ---
  // Priority: explicit JSON x/y/w/anchor → native cue settings → defaults.
  let x = json && json.x != null ? json.x : pct(s.position);
  let y = json && json.y != null ? json.y : pct(s.line);
  let w = json && json.w != null ? json.w : pct(s.size);
  let anchor = json && json.anchor;
  let align = (json && json.align) || s.align || "start";
  if (align === "left") align = "start";
  if (align === "right") align = "end";

  const hasX = x != null && x !== "" && !(typeof x === "number" && Number.isNaN(x));
  const hasY = y != null && y !== "" && !(typeof y === "number" && Number.isNaN(y));
  const hasW = w != null && w !== "" && !(typeof w === "number" && Number.isNaN(w));

  if (!anchor || !ANCHORS.has(anchor)) {
    // Default: cards rest near the bottom, centred, growing upward.
    anchor = "bottom";
  }
  if (!hasX) x = 50;
  if (!hasY) y = 88;

  return {
    index: cue.index,
    id: cue.id,
    start: cue.start,
    end: cue.end,
    text,
    html,
    isHtml: !!(json && typeof json.html === "string"),
    placement: { x, y, w: hasW ? w : null, anchor, align },
    style: {
      bg: json ? json.bg : undefined,
      fg: json && json.fg,
      font: json && json.font,
      padding: json && json.padding,
      radius: json && json.radius,
      border: json && json.border,
      shadow: json && json.shadow,
      opacity: json && json.opacity,
    },
    className: (json && json.class) || "",
    enter: (json && json.enter) || defaults.enter || "fade",
    exit: (json && json.exit) || defaults.exit || "fade",
  };
}

/**
 * Parse a VTT document straight into an array of card models.
 * @param {string} text
 * @param {object} [defaults]
 */
export function parseCards(text, defaults = {}) {
  return parseVtt(text).map((cue) => cueToCard(cue, defaults));
}
