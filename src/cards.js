// this_file: src/cards.js
//
// DOM rendering for card models. Takes the pure card model produced by
// vtt.js#cueToCard and paints an absolutely-positioned, styled panel into the
// overlay layer. Placement maths live here; the transition CSS lives in
// styles.js (a positioning wrapper + an animated inner body, so anchor
// translation never fights the enter/exit transform).

const ANCHOR_TRANSFORM = {
  "center": "translate(-50%, -50%)",
  "top": "translate(-50%, 0)",
  "bottom": "translate(-50%, -100%)",
  "left": "translate(0, -50%)",
  "right": "translate(-100%, -50%)",
  "top-left": "translate(0, 0)",
  "top-right": "translate(-100%, 0)",
  "bottom-left": "translate(0, -100%)",
  "bottom-right": "translate(-100%, -100%)",
};

// transform-origin per anchor: the anchor corner. Auto-fit appends a scale() to
// the wrapper transform; pivoting about the anchor keeps that point pinned to
// (x, y) at any scale, so a scaled card never drifts off its placement.
const ANCHOR_ORIGIN = {
  "center": "50% 50%",
  "top": "50% 0",
  "bottom": "50% 100%",
  "left": "0 50%",
  "right": "100% 50%",
  "top-left": "0 0",
  "top-right": "100% 0",
  "bottom-left": "0 100%",
  "bottom-right": "100% 100%",
};

/** Turn a number into a percentage string; pass CSS-length strings through. */
function len(v, unit = "%") {
  if (v == null) return null;
  if (typeof v === "number") return `${v}${unit}`;
  return String(v);
}

/** Read a placement coordinate as a 0..100 percentage (defaults to centre). */
function clampPct(v) {
  const n = typeof v === "number" ? v : parseFloat(v);
  if (!Number.isFinite(n)) return 50;
  return Math.max(0, Math.min(100, n));
}

/**
 * Apply a resolved placement to the positioning wrapper element.
 * @param {HTMLElement} el .vexy-vlip__card wrapper
 * @param {{x:number|string,y:number|string,w:?(number|string),anchor:string,align:string}} p
 */
export function applyPlacement(el, p) {
  el.style.left = len(p.x);
  el.style.top = len(p.y);
  el.style.transformOrigin = ANCHOR_ORIGIN[p.anchor] || ANCHOR_ORIGIN.bottom;
  el.style.transform = ANCHOR_TRANSFORM[p.anchor] || ANCHOR_TRANSFORM.bottom;
  if (p.w != null) el.style.width = len(p.w);
  else el.style.width = "";
}

/**
 * Compose an `opacity` (0..1) onto a solid `bg` colour, returning an rgba()
 * string. Hex (#rgb / #rrggbb) and rgb()/rgba() are supported; anything else
 * (gradients, named colours) is returned unchanged. With no `bg`, returns
 * undefined so the themed `--vv-card-bg` is left intact.
 */
export function composeBg(bg, opacity) {
  if (bg == null) return undefined;
  if (opacity == null || opacity >= 1) return bg;
  const a = Math.max(0, Math.min(1, Number(opacity)));
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(bg.trim());
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  const rgb = /^rgba?\(([^)]+)\)$/i.exec(bg.trim());
  if (rgb) {
    const parts = rgb[1].split(",").map((s) => s.trim()).slice(0, 3);
    if (parts.length === 3) return `rgba(${parts.join(", ")}, ${a})`;
  }
  return bg; // can't compose (gradient / named colour) — leave as-is
}

/** Apply per-cue inline style overrides onto the inner body element. */
function applyStyle(body, style, align) {
  if (!style) return;
  if (style.fg) body.style.color = style.fg;
  if (style.font) body.style.font = style.font;
  if (style.padding) body.style.padding = style.padding;
  if (style.radius != null) body.style.borderRadius = len(style.radius, "px");
  if (style.border) body.style.border = style.border;
  if (style.shadow) body.style.boxShadow = style.shadow;
  const bg = composeBg(style.bg, style.opacity);
  if (bg) body.style.background = bg;
  if (align) body.style.textAlign = align;
}

/**
 * Build the in-card step navigation (counter + Back + Next), shown in stepped
 * mode. The buttons carry stable class hooks; the player handles their clicks
 * via delegation on the cards layer.
 * @param {Document} doc
 * @param {object} card card model (uses card.index)
 * @param {{total:number, counter?:boolean, nextLabel?:string, prevLabel?:string}} nav
 */
function createCardNav(doc, card, nav) {
  const foot = doc.createElement("div");
  foot.className = "vexy-vlip__cardnav";

  if (nav.counter !== false) {
    const c = doc.createElement("span");
    c.className = "vexy-vlip__counter";
    c.textContent = `${card.index + 1}/${nav.total}`;
    foot.appendChild(c);
  }
  const spacer = doc.createElement("span");
  spacer.className = "vexy-vlip__navspacer";
  foot.appendChild(spacer);

  const prev = doc.createElement("button");
  prev.type = "button";
  prev.className = "vexy-vlip__prev";
  prev.textContent = nav.prevLabel ?? "←";
  prev.setAttribute("aria-label", "Previous step");

  const next = doc.createElement("button");
  next.type = "button";
  next.className = "vexy-vlip__next";
  next.textContent = nav.nextLabel ?? "Next →";

  foot.append(prev, next);
  return foot;
}

/**
 * Build a card element (wrapper + body) for a card model. Returns the wrapper.
 * @param {Document} doc
 * @param {object} card card model
 * @param {{sanitize?:(html:string)=>string, nav?:object, close?:boolean}} [opts]
 */
export function createCard(doc, card, opts = {}) {
  const wrap = doc.createElement("div");
  wrap.className = "vexy-vlip__card";
  wrap.dataset.index = String(card.index);
  wrap.dataset.enter = card.enter || "fade";
  wrap.setAttribute("role", "note");
  if (card.className) wrap.className += " " + card.className;

  const body = doc.createElement("div");
  body.className = "vexy-vlip__body";

  let html = card.html;
  if (card.isHtml && typeof opts.sanitize === "function") html = opts.sanitize(html);
  body.innerHTML = html;

  // Close (×): dismiss the cards to plain video mode. CSS shows it in stepped
  // mode only (and only when the card carries the --closable modifier).
  if (opts.close) {
    wrap.classList.add("vexy-vlip__card--closable");
    const x = doc.createElement("button");
    x.type = "button";
    x.className = "vexy-vlip__close";
    x.setAttribute("aria-label", "Close cards");
    x.textContent = "✕";
    body.appendChild(x);
  }

  // The nav footer lives inside the body, after the rendered content, so it
  // shares the card's padding and background. CSS shows it in stepped mode only.
  if (opts.nav && opts.nav.enabled) body.appendChild(createCardNav(doc, card, opts.nav));

  applyPlacement(wrap, card.placement);
  applyStyle(body, card.style, card.placement.align);

  wrap.appendChild(body);
  return wrap;
}

/**
 * Manages the overlay layer: shows at most one card at a time (with a graceful
 * cross-fade), keyed by segment index. Cards are created lazily and cached.
 */
export class CardLayer {
  /**
   * @param {HTMLElement} layerEl .vexy-vlip__cards container
   * @param {object} [opts] { sanitize }
   */
  constructor(layerEl, opts = {}) {
    this.layer = layerEl;
    this.doc = layerEl.ownerDocument;
    this.opts = opts;
    this.fit = opts.fit || { enabled: false };
    this.cards = [];
    this.els = new Map(); // index -> wrapper element
    this.activeIndex = -1;
    // Re-fit the active card when the player (and thus the card area) resizes —
    // covers responsive layouts and entering/leaving fullscreen.
    const RO = this.doc.defaultView && this.doc.defaultView.ResizeObserver;
    if (this.fit.enabled && RO) {
      this._ro = new RO(() => this.refit());
      this._ro.observe(this.layer);
    }
  }

  /** Replace the card model set; clears the DOM. @param {Array} cards */
  setCards(cards) {
    this.clear();
    this.cards = cards;
  }

  clear() {
    this.layer.replaceChildren();
    this.els.clear();
    this.activeIndex = -1;
  }

  _ensure(index) {
    let el = this.els.get(index);
    if (!el) {
      // Fold in the live total so the per-card counter reads "n/total".
      const nav = this.opts.nav ? { ...this.opts.nav, total: this.cards.length } : undefined;
      el = createCard(this.doc, this.cards[index], { ...this.opts, nav });
      this.els.set(index, el);
      this.layer.appendChild(el);
    }
    return el;
  }

  /**
   * Size + scale a card to fit the available area. First grows the card's width
   * up to a cap (so the subtitle and the no-wrap Next button get room), then —
   * if the content still overflows the space that the anchor leaves toward the
   * edges — scales the whole card (text and buttons together) down to fit.
   * The scale pivots on the anchor (transform-origin set in applyPlacement), so
   * the card stays pinned to its placement.
   * @param {HTMLElement} el card wrapper
   * @param {object} card card model
   */
  _fit(el, card) {
    if (!this.fit.enabled) return;
    const cw = this.layer.clientWidth;
    const ch = this.layer.clientHeight;
    if (!cw || !ch) return;
    const p = card.placement;
    const anchor = p.anchor;
    const base = ANCHOR_TRANSFORM[anchor] || ANCHOR_TRANSFORM.bottom;
    const m = this.fit.margin ?? 14;

    // Anchor point in pixels, and the space it leaves toward each grow direction.
    const px = (clampPct(p.x) / 100) * cw;
    const py = (clampPct(p.y) / 100) * ch;
    const hPart = anchor === "left" || anchor.endsWith("-left") ? "left"
      : anchor === "right" || anchor.endsWith("-right") ? "right" : "center";
    const vPart = anchor === "top" || anchor.startsWith("top") ? "top"
      : anchor === "bottom" || anchor.startsWith("bottom") ? "bottom" : "middle";
    const availW = Math.max(
      80,
      hPart === "left" ? cw - px - m : hPart === "right" ? px - m : 2 * Math.min(px, cw - px) - 2 * m,
    );
    const availH = Math.max(
      48,
      vPart === "top" ? ch - py - m : vPart === "bottom" ? py - m : 2 * Math.min(py, ch - py) - 2 * m,
    );

    // Measure unscaled (offset/scroll sizes ignore transforms).
    el.style.transform = base;
    // Grow up to min(cap, available). An authored width (p.w) is left untouched.
    // `width: max-content` + `max-width` lets a long card grow to the cap before
    // wrapping (plain shrink-to-fit would stop at the distance to the container
    // edge, wrapping early), while a short caption still hugs its content.
    if (p.w == null) {
      const cap = this.fit.maxWidthPct ? (this.fit.maxWidthPct / 100) * cw : availW;
      const capPx = Math.round(Math.min(availW, cap));
      el.style.width = "max-content";
      el.style.maxWidth = `${capPx}px`;
    }
    // scrollWidth/Height catch content that overflows the box (e.g. the no-wrap
    // nav row when space is very tight), so the scale accounts for it too.
    const natW = Math.max(el.offsetWidth, el.scrollWidth);
    const natH = Math.max(el.offsetHeight, el.scrollHeight);
    let s = Math.min(1, availW / natW, availH / natH);
    const floor = this.fit.minScale ?? 0.4;
    if (s < floor) s = floor;
    el.style.transform = s < 1 ? `${base} scale(${Math.round(s * 1000) / 1000})` : base;
  }

  /** Re-fit the active card (e.g. after a container resize). */
  refit() {
    if (this.activeIndex < 0) return;
    const el = this.els.get(this.activeIndex);
    if (el) this._fit(el, this.cards[this.activeIndex]);
  }

  /** Show a single card by index; hides any other. @returns {boolean} changed */
  show(index) {
    if (index === this.activeIndex) return false;
    this.hide();
    if (index < 0 || index >= this.cards.length) return false;
    const el = this._ensure(index);
    // Size + scale to fit before revealing, so there's no visible resize.
    this._fit(el, this.cards[index]);
    // Force a reflow so the transition runs even when created this frame.
    void el.offsetWidth;
    el.classList.add("vexy-vlip__card--in");
    this.activeIndex = index;
    return true;
  }

  /** Hide the active card. @returns {boolean} changed */
  hide() {
    if (this.activeIndex < 0) return false;
    const el = this.els.get(this.activeIndex);
    if (el) el.classList.remove("vexy-vlip__card--in");
    this.activeIndex = -1;
    return true;
  }
}

export { ANCHOR_TRANSFORM };
