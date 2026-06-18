// this_file: src/styles.js
//
// The single stylesheet for the player. Exposed as a string so the web
// component can adopt it into its shadow root and the plain class build can
// inject it once into <head>. All visual knobs are CSS custom properties so
// apps theme without touching internals.

export const STYLE_ID = "vexy-vlip-styles";

export const CSS = `
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

/** CSS scoped for shadow DOM use (adds :host sizing). */
export function shadowCss() {
  return `:host{display:inline-block;position:relative;max-width:100%}:host([hidden]){display:none}${CSS}`;
}

/**
 * Inject the stylesheet into a document once (idempotent). Used by the plain
 * class build when not in a shadow root.
 * @param {Document} doc
 */
export function injectStyles(doc) {
  if (!doc || doc.getElementById(STYLE_ID)) return;
  const style = doc.createElement("style");
  style.id = STYLE_ID;
  style.textContent = CSS;
  doc.head.appendChild(style);
}
