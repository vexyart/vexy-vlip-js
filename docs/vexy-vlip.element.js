function w(i) {
  if (typeof i != "string") return NaN;
  const t = i.trim().match(/^(?:(\d+):)?(\d{1,2}):(\d{2})(?:[.,](\d{1,3}))?$/);
  if (!t) return NaN;
  const [, e, s, r, a] = t;
  return (e ? Number(e) : 0) * 3600 + Number(s) * 60 + Number(r) + (a ? Number(a.padEnd(3, "0")) / 1e3 : 0);
}
function F(i) {
  const t = {};
  if (!i) return t;
  for (const e of i.trim().split(/\s+/)) {
    const s = e.indexOf(":");
    if (s <= 0) continue;
    const r = e.slice(0, s), a = e.slice(s + 1);
    ["position", "line", "size", "align", "vertical", "region"].includes(r) && (t[r] = a);
  }
  return t;
}
const R = /^(\d{1,2}:)?\d{1,2}:\d{2}[.,]\d{1,3}\s*-->\s*(\d{1,2}:)?\d{1,2}:\d{2}[.,]\d{1,3}/;
function $(i) {
  const t = [];
  if (typeof i != "string") return t;
  const s = i.replace(/^﻿/, "").replace(/\r\n?/g, `
`).split(/\n\n+/);
  let r = 0;
  for (const a of s) {
    const n = a.split(`
`).filter((B) => B.length > 0);
    if (n.length === 0) continue;
    let o = 0;
    if (/^WEBVTT/.test(n[0]) && r === 0 && !R.test(n[0])) {
      if (n.length === 1) continue;
      o = 1;
    }
    if (/^(NOTE|STYLE|REGION)\b/.test(n[o])) continue;
    let l = "";
    n[o] && !n[o].includes("-->") && (l = n[o], o += 1);
    const d = n[o];
    if (!d || !d.includes("-->")) continue;
    const h = d.indexOf("-->"), _ = w(d.slice(0, h)), p = d.slice(h + 3).trim(), v = p.indexOf(" "), A = v === -1 ? p : p.slice(0, v), I = v === -1 ? "" : p.slice(v + 1), x = w(A);
    if (Number.isNaN(_) || Number.isNaN(x)) continue;
    const M = n.slice(o + 1).join(`
`);
    t.push({
      index: r++,
      id: l,
      start: _,
      end: x,
      settings: F(I),
      payload: M
    });
  }
  return t;
}
const z = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
function D(i) {
  return String(i).replace(/[&<>"']/g, (t) => z[t]);
}
function E(i) {
  let t = D(i);
  return t = t.replace(/`([^`]+)`/g, "<code>$1</code>"), t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>"), t = t.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>"), t = t.replace(/\n/g, "<br>"), t;
}
const H = /* @__PURE__ */ new Set([
  "center",
  "top",
  "bottom",
  "left",
  "right",
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right"
]);
function b(i) {
  return typeof i == "number" ? i : typeof i == "string" ? parseFloat(i.replace("%", "")) : NaN;
}
function P(i) {
  const t = (i || "").trim();
  if (!t.startsWith("{")) return null;
  try {
    const e = JSON.parse(t);
    return e && typeof e == "object" ? e : null;
  } catch {
    return null;
  }
}
function O(i, t = {}) {
  const e = P(i.payload), s = i.settings || {};
  let r, a;
  e && typeof e.html == "string" ? (r = e.html, a = e.text || "") : e && typeof e.text == "string" ? (a = e.text, r = E(e.text)) : (a = i.payload, r = E(i.payload));
  let n = e && e.x != null ? e.x : b(s.position), o = e && e.y != null ? e.y : b(s.line), l = e && e.w != null ? e.w : b(s.size), d = e && e.anchor, h = e && e.align || s.align || "start";
  h === "left" && (h = "start"), h === "right" && (h = "end");
  const _ = n != null && n !== "" && !(typeof n == "number" && Number.isNaN(n)), p = o != null && o !== "" && !(typeof o == "number" && Number.isNaN(o)), v = l != null && l !== "" && !(typeof l == "number" && Number.isNaN(l));
  return (!d || !H.has(d)) && (d = "bottom"), _ || (n = 50), p || (o = 88), {
    index: i.index,
    id: i.id,
    start: i.start,
    end: i.end,
    text: a,
    html: r,
    isHtml: !!(e && typeof e.html == "string"),
    placement: { x: n, y: o, w: v ? l : null, anchor: d, align: h },
    style: {
      bg: e && (e.bg ?? (e.opacity != null ? null : void 0)),
      fg: e && e.fg,
      font: e && e.font,
      padding: e && e.padding,
      radius: e && e.radius,
      border: e && e.border,
      shadow: e && e.shadow,
      opacity: e && e.opacity
    },
    className: e && e.class || "",
    enter: e && e.enter || t.enter || "fade",
    exit: e && e.exit || t.exit || "fade"
  };
}
function j(i, t = {}) {
  return $(i).map((e) => O(e, t));
}
const m = 0.02;
function q(i) {
  return i.map((t, e) => ({ index: e, time: t.start, end: t.end })).sort((t, e) => t.time - e.time);
}
function U(i, t) {
  for (let e = 0; e < i.length; e++)
    if (t >= i[e].start - m && t < i[e].end - m) return e;
  return -1;
}
function V(i, t, e = m) {
  let s = -1, r = 1 / 0;
  for (let a = 0; a < i.length; a++) {
    const n = i[a].start;
    n > t + e && n < r && (r = n, s = a);
  }
  return s;
}
function K(i, t, e = m) {
  let s = -1, r = -1 / 0;
  for (let a = 0; a < i.length; a++) {
    const n = i[a].start;
    n < t - e && n > r && (r = n, s = a);
  }
  return s;
}
function f(i, t, e = m) {
  let s = -1, r = -1 / 0;
  for (let a = 0; a < i.length; a++) {
    const n = i[a].start;
    n <= t + e && n > r && (r = n, s = a);
  }
  return s;
}
const k = {
  center: "translate(-50%, -50%)",
  top: "translate(-50%, 0)",
  bottom: "translate(-50%, -100%)",
  left: "translate(0, -50%)",
  right: "translate(-100%, -50%)",
  "top-left": "translate(0, 0)",
  "top-right": "translate(-100%, 0)",
  "bottom-left": "translate(0, -100%)",
  "bottom-right": "translate(-100%, -100%)"
};
function g(i, t = "%") {
  return i == null ? null : typeof i == "number" ? `${i}${t}` : String(i);
}
function Y(i, t) {
  i.style.left = g(t.x), i.style.top = g(t.y), i.style.transform = k[t.anchor] || k.bottom, t.w != null ? i.style.width = g(t.w) : i.style.width = "";
}
function W(i, t, e) {
  t && (t.fg && (i.style.color = t.fg), t.font && (i.style.font = t.font), t.padding && (i.style.padding = t.padding), t.radius != null && (i.style.borderRadius = g(t.radius, "px")), t.border && (i.style.border = t.border), t.shadow && (i.style.boxShadow = t.shadow), t.bg && (i.style.background = t.bg, t.opacity != null && (i.style.opacity = "")), t.opacity != null && !t.bg && (i.style.background = `rgba(12, 18, 28, ${t.opacity})`), e && (i.style.textAlign = e));
}
function G(i, t, e = {}) {
  const s = i.createElement("div");
  s.className = "vexy-vlip__card", s.dataset.index = String(t.index), s.dataset.enter = t.enter || "fade", s.setAttribute("role", "note"), t.className && (s.className += " " + t.className);
  const r = i.createElement("div");
  r.className = "vexy-vlip__body";
  let a = t.html;
  return t.isHtml && typeof e.sanitize == "function" && (a = e.sanitize(a)), r.innerHTML = a, Y(s, t.placement), W(r, t.style, t.placement.align), s.appendChild(r), s;
}
class J {
  /**
   * @param {HTMLElement} layerEl .vexy-vlip__cards container
   * @param {object} [opts] { sanitize }
   */
  constructor(t, e = {}) {
    this.layer = t, this.doc = t.ownerDocument, this.opts = e, this.cards = [], this.els = /* @__PURE__ */ new Map(), this.activeIndex = -1;
  }
  /** Replace the card model set; clears the DOM. @param {Array} cards */
  setCards(t) {
    this.clear(), this.cards = t;
  }
  clear() {
    this.layer.replaceChildren(), this.els.clear(), this.activeIndex = -1;
  }
  _ensure(t) {
    let e = this.els.get(t);
    return e || (e = G(this.doc, this.cards[t], this.opts), this.els.set(t, e), this.layer.appendChild(e)), e;
  }
  /** Show a single card by index; hides any other. @returns {boolean} changed */
  show(t) {
    if (t === this.activeIndex || (this.hide(), t < 0 || t >= this.cards.length)) return !1;
    const e = this._ensure(t);
    return e.offsetWidth, e.classList.add("vexy-vlip__card--in"), this.activeIndex = t, !0;
  }
  /** Hide the active card. @returns {boolean} changed */
  hide() {
    if (this.activeIndex < 0) return !1;
    const t = this.els.get(this.activeIndex);
    return t && t.classList.remove("vexy-vlip__card--in"), this.activeIndex = -1, !0;
  }
}
const S = "vexy-vlip-styles", L = `
.vexy-vlip {
  --vv-card-bg: rgba(12, 18, 28, 0.9);
  --vv-card-fg: #ffffff;
  --vv-card-font: inherit;
  --vv-card-padding: 14px 18px;
  --vv-card-radius: 12px;
  --vv-card-border: 0;
  --vv-card-shadow: 0 6px 24px rgba(0, 0, 0, 0.4);
  --vv-card-max-width: 44%;
  --vv-accent: #4ea1ff;
  --vv-controls-bg: rgba(0, 0, 0, 0.55);
  position: relative;
  display: inline-block;
  max-width: 100%;
  line-height: 1.45;
  background: #000;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}
.vexy-vlip__video {
  display: block;
  width: 100%;
  height: auto;
  max-width: 100%;
}
.vexy-vlip__cards {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}
.vexy-vlip__card {
  position: absolute;
  box-sizing: border-box;
  max-width: var(--vv-card-max-width);
  pointer-events: auto;
}
.vexy-vlip__body {
  box-sizing: border-box;
  padding: var(--vv-card-padding);
  border-radius: var(--vv-card-radius);
  border: var(--vv-card-border);
  background: var(--vv-card-bg);
  color: var(--vv-card-fg);
  font: var(--vv-card-font);
  box-shadow: var(--vv-card-shadow);
  text-align: start;
  opacity: 0;
  transform: translateY(0);
  transition: opacity 0.28s ease, transform 0.28s ease;
  will-change: opacity, transform;
}
.vexy-vlip__body code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  background: rgba(255, 255, 255, 0.14);
  padding: 0.1em 0.35em;
  border-radius: 5px;
  font-size: 0.92em;
}
.vexy-vlip__body a { color: var(--vv-accent); }
.vexy-vlip__card--in .vexy-vlip__body { opacity: 1; transform: translateY(0); }
.vexy-vlip__card[data-enter="slide-up"] .vexy-vlip__body { transform: translateY(14px); }
.vexy-vlip__card[data-enter="slide-down"] .vexy-vlip__body { transform: translateY(-14px); }
.vexy-vlip__card--in[data-enter="slide-up"] .vexy-vlip__body,
.vexy-vlip__card--in[data-enter="slide-down"] .vexy-vlip__body { transform: translateY(0); }
.vexy-vlip__tap {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  font: inherit;
  color: transparent;
}
.vexy-vlip:not([data-mode="stepped"]) .vexy-vlip__tap { display: none; }
.vexy-vlip__hint {
  position: absolute;
  left: 50%;
  bottom: 14px;
  transform: translateX(-50%);
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--vv-controls-bg);
  color: #fff;
  font-size: 13px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.25s ease;
}
.vexy-vlip__hint--show { opacity: 0.85; }
.vexy-vlip__controls {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: linear-gradient(transparent, var(--vv-controls-bg));
  color: #fff;
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
}
.vexy-vlip:hover .vexy-vlip__controls,
.vexy-vlip:focus-within .vexy-vlip__controls,
.vexy-vlip[data-paused="true"] .vexy-vlip__controls { opacity: 1; pointer-events: auto; }
.vexy-vlip__btn {
  appearance: none;
  border: 0;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.vexy-vlip__btn:hover { background: rgba(255, 255, 255, 0.24); }
.vexy-vlip__dots {
  display: flex;
  gap: 6px;
  flex: 1;
  align-items: center;
  flex-wrap: wrap;
}
.vexy-vlip__dot {
  appearance: none;
  border: 0;
  padding: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.35);
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
}
.vexy-vlip__dot--active { background: var(--vv-accent); transform: scale(1.25); }
.vexy-vlip__time { font-variant-numeric: tabular-nums; font-size: 12px; opacity: 0.85; }
@media (prefers-reduced-motion: reduce) {
  .vexy-vlip__body { transition: opacity 0.001s; transform: none !important; }
}
`;
function X() {
  return `:host{display:inline-block;position:relative;max-width:100%}:host([hidden]){display:none}${L}`;
}
function Q(i) {
  if (!i || i.getElementById(S)) return;
  const t = i.createElement("style");
  t.id = S, t.textContent = L, i.head.appendChild(t);
}
const y = {
  linear: (i) => i,
  "ease-in": (i) => i * i,
  "ease-out": (i) => 1 - (1 - i) * (1 - i),
  "ease-in-out": (i) => i * i * (3 - 2 * i)
}, Z = {
  src: "",
  track: "",
  vtt: "",
  // inline VTT text (alternative to `track`)
  mode: "continuous",
  easing: "linear",
  controls: !0,
  autoplay: !1,
  loop: !1,
  muted: !1,
  poster: "",
  startAt: 0,
  startSegment: null,
  keyboard: !0,
  sanitize: !1,
  hint: !0,
  injectStyles: !0
}, c = {
  play: "▶",
  pause: "❚❚",
  prev: "⏮",
  next: "⏭",
  mute: "🔊",
  muted: "🔇",
  fs: "⤢"
};
class C {
  /**
   * @param {HTMLElement} target container element (or an existing <video>).
   * @param {Partial<typeof DEFAULTS>} [options]
   */
  constructor(t, e = {}) {
    if (!t || !t.ownerDocument)
      throw new TypeError("VexyVlip: a target element is required");
    this.opts = { ...Z, ...e }, this.doc = t.ownerDocument, this.cards = [], this.stops = [], this._destroyed = !1, this._ready = !1, this._target = null, this._pendingSeg = -1, this._stepIndex = -1, this._playingToEnd = !1, this._ease = null, this._looping = !1, this._mode = this.opts.mode === "stepped" ? "stepped" : "continuous", this._buildDom(t), this.opts.injectStyles && !this._inShadow && Q(this.doc), this._wireEvents(), this._loadMedia();
  }
  // ---- DOM ---------------------------------------------------------------
  _buildDom(t) {
    const e = this.doc;
    if (t.tagName === "VIDEO") {
      this.video = t;
      const r = e.createElement("div");
      t.replaceWith(r), r.appendChild(t), this.root = r;
    } else
      this.root = t, this.video = e.createElement("video"), this.root.appendChild(this.video);
    this._inShadow = this.root.getRootNode() instanceof ShadowRoot, this.root.classList.add("vexy-vlip"), this.root.dataset.mode = this._mode, this.root.tabIndex = this.root.tabIndex >= 0 ? this.root.tabIndex : 0;
    const s = this.video;
    s.classList.add("vexy-vlip__video"), s.playsInline = !0, s.preload = "metadata", this.opts.src && (s.src = this.opts.src), this.opts.poster && (s.poster = this.opts.poster), s.loop = !!this.opts.loop, s.muted = !!this.opts.muted, s.controls = !1, this.tap = e.createElement("button"), this.tap.className = "vexy-vlip__tap", this.tap.type = "button", this.tap.setAttribute("aria-label", "Advance to the next step"), this.root.appendChild(this.tap), this.cardsLayer = e.createElement("div"), this.cardsLayer.className = "vexy-vlip__cards", this.cardsLayer.setAttribute("aria-live", "polite"), this.root.appendChild(this.cardsLayer), this.layer = new J(this.cardsLayer, {
      sanitize: this.opts.sanitize ? tt : void 0
    }), this.opts.hint && (this.hint = e.createElement("div"), this.hint.className = "vexy-vlip__hint", this.hint.textContent = "Click to continue", this.root.appendChild(this.hint)), this.opts.controls && this._buildControls();
  }
  _buildControls() {
    const t = this.doc, e = t.createElement("div");
    e.className = "vexy-vlip__controls";
    const s = (r, a) => {
      const n = t.createElement("button");
      return n.className = "vexy-vlip__btn", n.type = "button", n.textContent = r, n.setAttribute("aria-label", a), n;
    };
    this._playBtn = s(c.play, "Play"), this._prevBtn = s(c.prev, "Previous step"), this._nextBtn = s(c.next, "Next step"), this._dots = t.createElement("div"), this._dots.className = "vexy-vlip__dots", this._time = t.createElement("span"), this._time.className = "vexy-vlip__time", this._muteBtn = s(this.opts.muted ? c.muted : c.mute, "Mute"), this._fsBtn = s(c.fs, "Fullscreen"), e.append(this._prevBtn, this._playBtn, this._nextBtn, this._dots, this._time, this._muteBtn, this._fsBtn), this.root.appendChild(e), this._playBtn.addEventListener("click", () => this.toggle()), this._prevBtn.addEventListener("click", () => this.prev()), this._nextBtn.addEventListener("click", () => this.next()), this._muteBtn.addEventListener("click", () => this._toggleMute()), this._fsBtn.addEventListener("click", () => this._toggleFullscreen());
  }
  _buildDots() {
    this._dots && (this._dots.replaceChildren(), this.cards.forEach((t, e) => {
      const s = this.doc.createElement("button");
      s.className = "vexy-vlip__dot", s.type = "button", s.setAttribute("aria-label", `Step ${e + 1}`), s.addEventListener("click", () => this.goToSegment(e)), this._dots.appendChild(s);
    }));
  }
  // ---- events ------------------------------------------------------------
  _wireEvents() {
    const t = this.video;
    this._onLoaded = () => this._onMeta(), this._onEnded = () => this._handleEnded(), this._onPlay = () => this._reflect(), this._onPause = () => this._reflect(), this._onSeeked = () => this._updateUi(), t.addEventListener("loadedmetadata", this._onLoaded), t.addEventListener("ended", this._onEnded), t.addEventListener("play", this._onPlay), t.addEventListener("pause", this._onPause), t.addEventListener("seeked", this._onSeeked), this._onTap = (e) => {
      this._mode === "stepped" ? this.toggle() : this.toggle(), e.preventDefault();
    }, this.tap.addEventListener("click", this._onTap), this._onCardClick = (e) => {
      const s = e.target;
      s && (s.closest("a") || s.closest("button:not(.vexy-vlip__tap)")) || this._mode === "stepped" && this.toggle();
    }, this.cardsLayer.addEventListener("click", this._onCardClick), this.opts.keyboard && (this._onKey = (e) => this._handleKey(e), this.root.addEventListener("keydown", this._onKey));
  }
  _handleKey(t) {
    switch (t.key) {
      case " ":
      case "Enter":
        this.toggle(), t.preventDefault();
        break;
      case "ArrowRight":
        this.next(), t.preventDefault();
        break;
      case "ArrowLeft":
        this.prev(), t.preventDefault();
        break;
      case "f":
        this._toggleFullscreen();
        break;
      case "m":
        this._toggleMute();
        break;
    }
  }
  // ---- loading -----------------------------------------------------------
  async _loadMedia() {
    let t = this.opts.vtt;
    if (!t && this.opts.track)
      try {
        const e = await fetch(this.opts.track);
        if (!e.ok) throw new Error(`HTTP ${e.status}`);
        t = await e.text();
      } catch (e) {
        this._emit("error", { error: e, phase: "track" });
        return;
      }
    this._destroyed || (t && (this.cards = j(t, { enter: "fade" }), this.stops = q(this.cards), this.layer.setCards(this.cards), this._buildDots()), this._cardsReady = !0, this._maybeReady());
  }
  _onMeta() {
    this._metaReady = !0, this._maybeReady();
  }
  _maybeReady() {
    if (this._ready || this._destroyed || !this._metaReady || !this._cardsReady) return;
    this._ready = !0;
    const t = this.opts.startSegment;
    t != null && this.cards[t] ? (this._stepIndex = t, this.video.currentTime = this.cards[t].start, this._mode === "stepped" && this.layer.show(t)) : this.opts.startAt && (this.video.currentTime = this.opts.startAt, this._stepIndex = f(this.cards, this.opts.startAt)), this._updateUi(), this._emit("ready", { segments: this.cards.length }), this._mode === "continuous" && this.opts.autoplay ? this.play() : this._showHint(this._mode === "stepped");
  }
  // ---- frame watcher -----------------------------------------------------
  _startLoop() {
    this._looping || (this._looping = !0, this._scheduleTick());
  }
  _scheduleTick() {
    if (this._destroyed) return;
    const t = this.video, e = () => this._tick();
    typeof t.requestVideoFrameCallback == "function" ? (this._frame = t.requestVideoFrameCallback(e), this._frameKind = "rvfc") : (this._frame = requestAnimationFrame(e), this._frameKind = "raf");
  }
  _stopLoop() {
    if (this._looping = !1, this._frame == null) return;
    const t = this.video;
    this._frameKind === "rvfc" && typeof t.cancelVideoFrameCallback == "function" ? t.cancelVideoFrameCallback(this._frame) : this._frameKind === "raf" && cancelAnimationFrame(this._frame), this._frame = null;
  }
  _tick() {
    if (this._destroyed) return;
    const t = this.video, e = t.currentTime;
    if (this._mode === "stepped" && this._target != null)
      e + m >= this._target && this._reachStop(this._pendingSeg);
    else if (this._mode === "continuous") {
      const s = U(this.cards, e);
      s !== this.layer.activeIndex && (s === -1 ? (this.layer.hide(), this._emit("cardhide", {})) : (this.layer.show(s), this._emit("segmententer", { index: s, segment: this.cards[s] }), this._emit("cardshow", { index: s, segment: this.cards[s] })));
    }
    this._updateUi(), !t.paused && !this._destroyed ? this._scheduleTick() : this._looping = !1;
  }
  // ---- stepped engine ----------------------------------------------------
  _advance() {
    if (!this._ready) return;
    const t = this.video.currentTime;
    if (this.layer.activeIndex >= 0) {
      const s = this.layer.activeIndex;
      this.layer.hide(), this._emit("segmentexit", { index: s }), this._emit("cardhide", { index: s });
    }
    this._showHint(!1);
    const e = this._stepIndex + 1 < this.cards.length ? this._stepIndex + 1 : -1;
    if (e === -1)
      this._target = null, this._pendingSeg = -1, this._playingToEnd = !0, this._playNative();
    else {
      const s = this.cards[e].start;
      this._playingToEnd = !1, this.opts.easing !== "linear" && y[this.opts.easing] ? this._travelEased(t, s, e) : (this._target = s, this._pendingSeg = e, this._playNative());
    }
    this._emit("play", {});
  }
  _playNative() {
    this._cancelEase();
    const t = this.video.play();
    this._startLoop(), t && typeof t.catch == "function" && t.catch((e) => this._emit("error", { error: e, phase: "play" }));
  }
  _travelEased(t, e, s) {
    this._cancelEase(), this.video.pause();
    const r = y[this.opts.easing] || y.linear, a = this.video.playbackRate || 1, n = Math.max(0, e - t) / a * 1e3, o = this.video.muted;
    this.video.muted = !0;
    const l = typeof performance < "u" ? performance.now() : Date.now(), d = { segIndex: s, wasMuted: o, raf: 0 };
    this._ease = d;
    const h = () => {
      if (this._destroyed || this._ease !== d) return;
      const _ = typeof performance < "u" ? performance.now() : Date.now(), p = n <= 0 ? 1 : Math.min(1, (_ - l) / n);
      this.video.currentTime = t + (e - t) * r(p), this._updateUi(), p >= 1 ? (this.video.muted = o, this._ease = null, this._reachStop(s)) : d.raf = requestAnimationFrame(h);
    };
    d.raf = requestAnimationFrame(h);
  }
  _cancelEase() {
    this._ease && (cancelAnimationFrame(this._ease.raf), this._ease.wasMuted != null && (this.video.muted = this._ease.wasMuted), this._ease = null);
  }
  _reachStop(t) {
    this.video.pause(), t >= 0 && this.cards[t] && (this._stepIndex = t, this.video.currentTime = this.cards[t].start, this.layer.show(t), this._emit("segmententer", { index: t, segment: this.cards[t] }), this._emit("cardshow", { index: t, segment: this.cards[t] })), this._target = null, this._pendingSeg = -1, this._showHint(!0), this._emit("stop", { index: t }), this._updateUi();
  }
  // ---- public API --------------------------------------------------------
  play() {
    this._mode === "stepped" ? this._advance() : this._playNative();
  }
  pause() {
    this._cancelEase(), this._target = null, this._pendingSeg = -1, this.video.pause(), this._emit("pause", {});
  }
  toggle() {
    this._mode === "stepped" ? !this.video.paused || this._ease ? this.pause() : this._advance() : this.video.paused ? this._playNative() : this.pause();
  }
  next() {
    if (this._mode === "stepped")
      this._advance();
    else {
      const t = V(this.cards, this.video.currentTime);
      t >= 0 && this.seekTo(this.cards[t].start);
    }
  }
  prev() {
    if (this._mode === "stepped") {
      const e = (this._stepIndex >= 0 ? this._stepIndex : this.cards.length) - 1;
      this.goToSegment(Math.max(0, e));
      return;
    }
    const t = K(this.cards, this.video.currentTime);
    this.goToSegment(t >= 0 ? t : 0);
  }
  seekTo(t) {
    this._cancelEase(), this._target = null, this.video.currentTime = Math.max(0, t), this._updateUi();
  }
  goToSegment(t) {
    this.cards[t] && (this._cancelEase(), this._target = null, this._pendingSeg = -1, this._stepIndex = t, this.video.pause(), this.video.currentTime = this.cards[t].start, this.layer.show(t), this._showHint(this._mode === "stepped"), this._emit("segmententer", { index: t, segment: this.cards[t] }), this._emit("cardshow", { index: t, segment: this.cards[t] }), this._updateUi());
  }
  showCard(t) {
    this.cards[t] && (this.layer.show(t), this._emit("cardshow", { index: t, segment: this.cards[t] }));
  }
  hideCard() {
    this.layer.hide(), this._emit("cardhide", {});
  }
  /** Read-only copy of the parsed segment (card) models. */
  getSegments() {
    return this.segments;
  }
  setMode(t) {
    const e = t === "stepped" ? "stepped" : "continuous";
    e !== this._mode && (this._mode = e, this.root.dataset.mode = e, this._cancelEase(), this._target = null, this._stepIndex = this.layer.activeIndex >= 0 ? this.layer.activeIndex : f(this.cards, this.video.currentTime), this.video.pause(), this.layer.hide(), this._showHint(e === "stepped"), this._emit("modechange", { mode: e }));
  }
  setEasing(t) {
    y[t] && (this.opts.easing = t);
  }
  destroy() {
    this._destroyed = !0, this._stopLoop(), this._cancelEase();
    const t = this.video;
    t.removeEventListener("loadedmetadata", this._onLoaded), t.removeEventListener("ended", this._onEnded), t.removeEventListener("play", this._onPlay), t.removeEventListener("pause", this._onPause), t.removeEventListener("seeked", this._onSeeked), this.tap.removeEventListener("click", this._onTap), this.cardsLayer.removeEventListener("click", this._onCardClick), this._onKey && this.root.removeEventListener("keydown", this._onKey);
    try {
      t.pause();
    } catch {
    }
    this.layer.clear(), this._emit("destroy", {});
  }
  // ---- helpers -----------------------------------------------------------
  _handleEnded() {
    this._playingToEnd = !1, this._stopLoop(), this.layer.hide(), this._emit("ended", {}), this._reflect();
  }
  _toggleMute() {
    this.video.muted = !this.video.muted, this._muteBtn && (this._muteBtn.textContent = this.video.muted ? c.muted : c.mute);
  }
  _toggleFullscreen() {
    const t = this.root;
    this.doc.fullscreenElement ? this.doc.exitFullscreen?.() : t.requestFullscreen?.();
  }
  _showHint(t) {
    this.hint && this.hint.classList.toggle("vexy-vlip__hint--show", !!t);
  }
  _reflect() {
    const t = this.video.paused;
    this.root.dataset.paused = String(t), this._playBtn && (this._playBtn.textContent = t ? c.play : c.pause), t || this._startLoop();
  }
  _updateUi() {
    if (this._reflect(), this._time && (this._time.textContent = `${T(this.video.currentTime)} / ${T(this.video.duration)}`), this._dots) {
      const t = this.layer.activeIndex >= 0 ? this.layer.activeIndex : f(this.cards, this.video.currentTime), e = this._dots.children;
      for (let s = 0; s < e.length; s++)
        e[s].classList.toggle("vexy-vlip__dot--active", s === t);
    }
  }
  _emit(t, e) {
    const s = new CustomEvent(`vexyvlip:${t}`, { detail: e, bubbles: !0, composed: !0 });
    this.root.dispatchEvent(s);
    const r = this.opts[`on${t[0].toUpperCase()}${t.slice(1)}`];
    typeof r == "function" && r(e, this);
  }
  // ---- getters -----------------------------------------------------------
  get segments() {
    return this.cards.map((t) => ({ ...t }));
  }
  get currentSegment() {
    return this.layer.activeIndex >= 0 ? this.layer.activeIndex : f(this.cards, this.video.currentTime);
  }
  get currentTime() {
    return this.video.currentTime;
  }
  get duration() {
    return this.video.duration;
  }
  get mode() {
    return this._mode;
  }
  get playing() {
    return !this.video.paused || !!this._ease;
  }
  get ready() {
    return this._ready;
  }
}
function T(i) {
  if (!Number.isFinite(i)) return "0:00";
  const t = Math.floor(i / 60), e = Math.floor(i % 60);
  return `${t}:${String(e).padStart(2, "0")}`;
}
function tt(i) {
  const t = document.createElement("div");
  return t.innerHTML = i, t.querySelectorAll("script, style, iframe, object, embed").forEach((e) => e.remove()), t.querySelectorAll("*").forEach((e) => {
    [...e.attributes].forEach((s) => {
      (/^on/i.test(s.name) || /^(href|src)$/i.test(s.name) && /^\s*javascript:/i.test(s.value)) && e.removeAttribute(s.name);
    });
  }), t.innerHTML;
}
function u(i, t, e) {
  if (!i.hasAttribute(t)) return e;
  const s = i.getAttribute(t);
  return s !== "false" && s !== "0";
}
function N(i) {
  return {
    src: i.getAttribute("src") || "",
    track: i.getAttribute("track") || "",
    vtt: i.getAttribute("vtt") || "",
    mode: i.getAttribute("mode") || "continuous",
    easing: i.getAttribute("easing") || "linear",
    poster: i.getAttribute("poster") || "",
    startAt: i.hasAttribute("start-at") ? Number(i.getAttribute("start-at")) : 0,
    startSegment: i.hasAttribute("start-segment") ? Number(i.getAttribute("start-segment")) : null,
    autoplay: u(i, "autoplay", !1),
    loop: u(i, "loop", !1),
    muted: u(i, "muted", !1),
    controls: u(i, "controls", !0),
    keyboard: u(i, "keyboard", !0),
    hint: u(i, "hint", !0),
    sanitize: u(i, "sanitize", !1),
    injectStyles: !1
  };
}
class et extends HTMLElement {
  static get observedAttributes() {
    return ["src", "track", "vtt", "mode", "easing", "poster", "muted", "loop", "controls"];
  }
  constructor() {
    super(), this._shadow = this.attachShadow({ mode: "open" });
    const t = document.createElement("style");
    t.textContent = X(), this._shadow.appendChild(t), this._mount = document.createElement("div"), this._shadow.appendChild(this._mount);
  }
  connectedCallback() {
    if (this._vlip) return;
    const t = this.querySelector("video");
    t && this._mount.appendChild(t), this._vlip = new C(t || this._mount, N(this));
  }
  disconnectedCallback() {
    this._vlip?.destroy(), this._vlip = null;
  }
  attributeChangedCallback(t, e, s) {
    if (!(!this._vlip || e === s))
      switch (t) {
        case "mode":
          this._vlip.setMode(s);
          break;
        case "easing":
          this._vlip.setEasing(s);
          break;
        case "muted":
          this._vlip.video.muted = u(this, "muted", !1);
          break;
        case "loop":
          this._vlip.video.loop = u(this, "loop", !1);
          break;
        case "src":
        case "track":
        case "vtt":
        case "poster":
          this._rebuild();
          break;
      }
  }
  _rebuild() {
    this._vlip?.destroy(), this._mount.replaceChildren(), this._vlip = new C(this._mount, N(this));
  }
  // ---- delegated API ----
  play() {
    return this._vlip?.play();
  }
  pause() {
    return this._vlip?.pause();
  }
  toggle() {
    return this._vlip?.toggle();
  }
  next() {
    return this._vlip?.next();
  }
  prev() {
    return this._vlip?.prev();
  }
  seekTo(t) {
    return this._vlip?.seekTo(t);
  }
  goToSegment(t) {
    return this._vlip?.goToSegment(t);
  }
  showCard(t) {
    return this._vlip?.showCard(t);
  }
  hideCard() {
    return this._vlip?.hideCard();
  }
  getSegments() {
    return this._vlip?.getSegments() ?? [];
  }
  setMode(t) {
    this.setAttribute("mode", t);
  }
  setEasing(t) {
    this.setAttribute("easing", t);
  }
  destroy() {
    this._vlip?.destroy();
  }
  get player() {
    return this._vlip;
  }
  get segments() {
    return this._vlip?.segments ?? [];
  }
  get currentSegment() {
    return this._vlip?.currentSegment ?? -1;
  }
  get currentTime() {
    return this._vlip?.currentTime ?? 0;
  }
  get duration() {
    return this._vlip?.duration ?? 0;
  }
  get mode() {
    return this._vlip?.mode ?? "continuous";
  }
  get playing() {
    return this._vlip?.playing ?? !1;
  }
  get ready() {
    return this._vlip?.ready ?? !1;
  }
}
typeof customElements < "u" && !customElements.get("vexy-vlip") && customElements.define("vexy-vlip", et);
export {
  C as VexyVlip,
  et as VexyVlipElement,
  et as default
};
//# sourceMappingURL=vexy-vlip.element.js.map
