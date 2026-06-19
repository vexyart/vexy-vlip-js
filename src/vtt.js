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
 * Render inline markdown (`code`, **bold**, *italic*, ~~strike~~, [links], and
 * single newlines → <br>) into safe HTML. Input is escaped first, so no raw
 * HTML survives. `javascript:`/`data:` link targets are neutralised.
 * @param {string} text
 * @returns {string}
 */
function renderInline(text) {
  let html = escapeHtml(text);
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, "<em>$1</em>");
  html = html.replace(/~~([^~]+)~~/g, "<del>$1</del>");
  html = html.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label, url) => {
    const safe = /^\s*(javascript|data|vbscript):/i.test(url) ? "#" : url;
    return `<a href="${safe}">${label}</a>`;
  });
  html = html.replace(/\n/g, "<br>");
  return html;
}

/** True if a line uses block-level markdown (heading / list / rule). */
function isBlock(line) {
  return (
    /^#{1,6}\s/.test(line) ||
    /^\s*[-*+]\s+/.test(line) ||
    /^\s*\d+\.\s+/.test(line) ||
    /^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line.trim())
  );
}

/**
 * Render a markdown subset into safe HTML. Grouping is line-based (no blank
 * line required), because a WebVTT cue's payload can't contain blank lines: a
 * run of `- ` lines becomes a list, `#` lines become headings, and other
 * consecutive lines fold into a paragraph (joined with <br>). A lone plain line
 * is rendered inline with no <p> wrapper, so short captions stay markup-light.
 * Supported inline set: see renderInline.
 * @param {string} text
 * @returns {string}
 */
export function renderMarkdown(text) {
  const src = String(text).replace(/\r\n?/g, "\n");
  const lines = src.split("\n");
  if (lines.length === 1 && !isBlock(lines[0])) return renderInline(lines[0]);

  const out = [];
  let para = [];
  let list = null; // { tag: "ul"|"ol", items: string[] }
  const flushPara = () => {
    if (para.length) out.push(`<p>${renderInline(para.join("\n"))}</p>`);
    para = [];
  };
  const flushList = () => {
    if (list) {
      const items = list.items.map((it) => `<li>${renderInline(it)}</li>`).join("");
      out.push(`<${list.tag}>${items}</${list.tag}>`);
    }
    list = null;
  };

  for (const line of lines) {
    if (/^\s*$/.test(line)) { flushPara(); flushList(); continue; }
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      flushPara();
      flushList();
      out.push(`<h${heading[1].length}>${renderInline(heading[2])}</h${heading[1].length}>`);
      continue;
    }
    if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) { flushPara(); flushList(); out.push("<hr>"); continue; }
    const ul = /^\s*[-*+]\s+(.*)$/.exec(line);
    if (ul) {
      flushPara();
      if (!list || list.tag !== "ul") { flushList(); list = { tag: "ul", items: [] }; }
      list.items.push(ul[1]);
      continue;
    }
    const ol = /^\s*\d+\.\s+(.*)$/.exec(line);
    if (ol) {
      flushPara();
      if (!list || list.tag !== "ol") { flushList(); list = { tag: "ol", items: [] }; }
      list.items.push(ol[1]);
      continue;
    }
    flushList();
    para.push(line);
  }
  flushPara();
  flushList();
  return out.join("");
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
 * Resolve `position-align` (auto → derived from text align). Maps to the
 * horizontal edge/centre the position % pins.
 */
function posAlignToH(positionAlign, align) {
  const pa = positionAlign || (align === "end" ? "line-right" : align === "center" ? "center" : "line-left");
  if (pa === "line-left") return "left";
  if (pa === "line-right") return "right";
  return "center";
}

/** Resolve `line-align` to the vertical edge/centre the line % pins. */
function lineAlignToV(lineAlign) {
  if (lineAlign === "end") return "bottom";
  if (lineAlign === "center") return "center";
  return "top"; // "start" / default
}

/**
 * Combine the horizontal + vertical pins into one of the nine anchor names.
 * @param {"left"|"center"|"right"} h
 * @param {"top"|"center"|"bottom"} v
 */
function combineAnchor(h, v) {
  if (h === "center" && v === "center") return "center";
  if (h === "center") return v; // "top" | "bottom"
  if (v === "center") return h; // "left" | "right"
  return `${v}-${h}`; // top-left, top-right, bottom-left, bottom-right
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
  // Native `position`/`line` may carry a comma sub-value (the WebVTT
  // position-align / line-align), e.g. "82%,line-right" or "22%,end".
  const [posVal, posAlign] = String(s.position ?? "").split(",");
  const [lineVal, lineAlign] = String(s.line ?? "").split(",");
  let x = json && json.x != null ? json.x : pct(posVal);
  let y = json && json.y != null ? json.y : pct(lineVal);
  let w = json && json.w != null ? json.w : pct(s.size);
  let anchor = json && json.anchor;
  let align = (json && json.align) || s.align || "start";
  if (align === "left") align = "start";
  if (align === "right") align = "end";

  const hasX = x != null && x !== "" && !(typeof x === "number" && Number.isNaN(x));
  const hasY = y != null && y !== "" && !(typeof y === "number" && Number.isNaN(y));
  const hasW = w != null && w !== "" && !(typeof w === "number" && Number.isNaN(w));

  if (!anchor || !ANCHORS.has(anchor)) {
    if (!json && (s.position != null || s.line != null)) {
      // Native cue settings: map position-align × line-align → an anchor.
      // A missing line (line auto) means the box sits at the bottom.
      const h = posAlignToH(posAlign, align);
      const v = s.line != null ? lineAlignToV(lineAlign) : "bottom";
      anchor = combineAnchor(h, v);
    } else {
      // Default: cards rest near the bottom, centred, growing upward.
      anchor = "bottom";
    }
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
