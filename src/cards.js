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

/** Turn a number into a percentage string; pass CSS-length strings through. */
function len(v, unit = "%") {
  if (v == null) return null;
  if (typeof v === "number") return `${v}${unit}`;
  return String(v);
}

/**
 * Apply a resolved placement to the positioning wrapper element.
 * @param {HTMLElement} el .vexy-vlip__card wrapper
 * @param {{x:number|string,y:number|string,w:?(number|string),anchor:string,align:string}} p
 */
export function applyPlacement(el, p) {
  el.style.left = len(p.x);
  el.style.top = len(p.y);
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
 * Build a card element (wrapper + body) for a card model. Returns the wrapper.
 * @param {Document} doc
 * @param {object} card card model
 * @param {{sanitize?:(html:string)=>string}} [opts]
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
    this.cards = [];
    this.els = new Map(); // index -> wrapper element
    this.activeIndex = -1;
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
      el = createCard(this.doc, this.cards[index], this.opts);
      this.els.set(index, el);
      this.layer.appendChild(el);
    }
    return el;
  }

  /** Show a single card by index; hides any other. @returns {boolean} changed */
  show(index) {
    if (index === this.activeIndex) return false;
    this.hide();
    if (index < 0 || index >= this.cards.length) return false;
    const el = this._ensure(index);
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
