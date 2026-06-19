// this_file: src/element.js
//
// <vexy-vlip> custom element. Importing this file registers the element as a
// side effect (mirrors vexy-stax-js). It wraps a VexyVlip instance inside a
// shadow root, maps attributes → options, and delegates methods/getters.

import { VexyVlip } from "./player.js";
import { shadowCss } from "./styles.js";

// Re-export the core class so the ESM bundle (which also auto-registers the
// custom element) can serve `import { VexyVlip } from ".../vexy-vlip.element.js"`.
export { VexyVlip } from "./player.js";

/** Parse a boolean-ish attribute (presence = true unless value is "false"). */
function boolAttr(el, name, dflt) {
  if (!el.hasAttribute(name)) return dflt;
  const v = el.getAttribute(name);
  return v !== "false" && v !== "0";
}

function readOptions(el) {
  const o = {
    src: el.getAttribute("src") || "",
    track: el.getAttribute("track") || "",
    vtt: el.getAttribute("vtt") || "",
    mode: el.getAttribute("mode") || "continuous",
    easing: el.getAttribute("easing") || "linear",
    poster: el.getAttribute("poster") || "",
    startAt: el.hasAttribute("start-at") ? Number(el.getAttribute("start-at")) : 0,
    startSegment: el.hasAttribute("start-segment") ? Number(el.getAttribute("start-segment")) : null,
    autoplay: boolAttr(el, "autoplay", false),
    loop: boolAttr(el, "loop", false),
    muted: boolAttr(el, "muted", false),
    controls: boolAttr(el, "controls", true),
    keyboard: boolAttr(el, "keyboard", true),
    overlay: boolAttr(el, "overlay", true),
    nav: boolAttr(el, "nav", true),
    dots: boolAttr(el, "dots", true),
    counter: boolAttr(el, "counter", false),
    closable: boolAttr(el, "closable", true),
    autoFit: boolAttr(el, "auto-fit", true),
    minScale: el.hasAttribute("min-scale") ? Number(el.getAttribute("min-scale")) : undefined,
    maxWidth: el.hasAttribute("max-width") ? Number(el.getAttribute("max-width")) : undefined,
    nextLabel: el.getAttribute("next-label") ?? undefined,
    prevLabel: el.getAttribute("prev-label") ?? undefined,
    startLabel: el.getAttribute("start-label") ?? undefined,
    cardBg: el.getAttribute("card-bg") || "",
    cardFg: el.getAttribute("card-fg") || "",
    nextBg: el.getAttribute("next-bg") || "",
    nextFg: el.getAttribute("next-fg") || "",
    nextBorder: el.getAttribute("next-border") || "",
    font: el.getAttribute("font") || "",
    dim: el.getAttribute("dim") || "",
    sanitize: boolAttr(el, "sanitize", false),
    injectStyles: false,
  };
  return o;
}

export class VexyVlipElement extends HTMLElement {
  static get observedAttributes() {
    return ["src", "track", "vtt", "mode", "easing", "poster", "muted", "loop", "controls"];
  }

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = shadowCss();
    this._shadow.appendChild(style);
    this._mount = document.createElement("div");
    this._shadow.appendChild(this._mount);
  }

  connectedCallback() {
    if (this._vlip) return;
    // Adopt a slotted <video> if the author provided one.
    const slotted = this.querySelector("video");
    if (slotted) this._mount.appendChild(slotted);
    this._vlip = new VexyVlip(slotted || this._mount, readOptions(this));
  }

  disconnectedCallback() {
    this._vlip?.destroy();
    this._vlip = null;
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (!this._vlip || oldVal === newVal) return;
    switch (name) {
      case "mode":
        this._vlip.setMode(newVal);
        break;
      case "easing":
        this._vlip.setEasing(newVal);
        break;
      case "muted":
        this._vlip.video.muted = boolAttr(this, "muted", false);
        break;
      case "loop":
        this._vlip.video.loop = boolAttr(this, "loop", false) && this._vlip.mode !== "stepped";
        break;
      case "poster":
        // Cosmetic — apply live, no need to tear down playback.
        this._vlip.video.poster = newVal || "";
        break;
      case "controls":
      case "src":
      case "track":
      case "vtt":
        // Structural change: rebuild the player.
        this._rebuild();
        break;
      default:
        break;
    }
  }

  _rebuild() {
    this._vlip?.destroy();
    this._mount.replaceChildren();
    this._vlip = new VexyVlip(this._mount, readOptions(this));
  }

  // ---- delegated API ----
  play() { return this._vlip?.play(); }
  pause() { return this._vlip?.pause(); }
  toggle() { return this._vlip?.toggle(); }
  next() { return this._vlip?.next(); }
  prev() { return this._vlip?.prev(); }
  close() { return this._vlip?.close(); }
  seekTo(t) { return this._vlip?.seekTo(t); }
  goToSegment(i) { return this._vlip?.goToSegment(i); }
  showCard(i) { return this._vlip?.showCard(i); }
  hideCard() { return this._vlip?.hideCard(); }
  getSegments() { return this._vlip?.getSegments() ?? []; }
  setMode(m) { this.setAttribute("mode", m); }
  setEasing(e) { this.setAttribute("easing", e); }
  destroy() { this._vlip?.destroy(); }

  get player() { return this._vlip; }
  get segments() { return this._vlip?.segments ?? []; }
  get currentSegment() { return this._vlip?.currentSegment ?? -1; }
  get currentTime() { return this._vlip?.currentTime ?? 0; }
  get duration() { return this._vlip?.duration ?? 0; }
  get mode() { return this._vlip?.mode ?? "continuous"; }
  get playing() { return this._vlip?.playing ?? false; }
  get ready() { return this._vlip?.ready ?? false; }
}

if (typeof customElements !== "undefined" && !customElements.get("vexy-vlip")) {
  customElements.define("vexy-vlip", VexyVlipElement);
}

export default VexyVlipElement;
