// this_file: src/styles.js
//
// The single stylesheet for the player. Exposed as a string so the web
// component can adopt it into its shadow root and the plain class build can
// inject it once into <head>. All visual knobs are CSS custom properties so
// apps theme without touching internals.

export const STYLE_ID = "vexy-vlip-styles";

export const CSS = `
.vexy-vlip {
  --vv-card-bg: #ffffff;
  --vv-card-fg: #1d2430;
  --vv-card-font: inherit;
  --vv-card-padding: 20px 24px;
  --vv-card-radius: 16px;
  --vv-card-border: 0;
  --vv-card-shadow: 0 12px 38px rgba(0, 0, 0, 0.34);
  --vv-card-max-width: 72%;
  --vv-accent: #2f6fed;
  --vv-controls-bg: rgba(0, 0, 0, 0.55);
  --vv-overlay-bg: rgba(0, 0, 0, 0.7);
  --vv-card-bg-stepped: var(--vv-card-bg);
  --vv-next-bg: #ffffff;
  --vv-next-fg: #1d2430;
  --vv-next-border: rgba(0, 0, 0, 0.82);
  --vv-start-bg: #1d2430;
  --vv-start-fg: #ffffff;
  --vv-close-fg: var(--vv-card-fg);
  --vv-dot: rgba(255, 255, 255, 0.45);
  --vv-dot-active: var(--vv-accent);
  position: relative;
  display: inline-block;
  max-width: 100%;
  line-height: 1.45;
  background: #000;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}
/* The root is focusable (it owns the keyboard handler). Don't show a ring when
   focus arrives from a pointer (e.g. clicking Start) — only for keyboard nav. */
.vexy-vlip:focus:not(:focus-visible) { outline: none; }
.vexy-vlip__video {
  display: block;
  width: 100%;
  height: auto;
  max-width: 100%;
}
.vexy-vlip__overlay {
  position: absolute;
  inset: 0;
  background: var(--vv-overlay-bg);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.28s ease;
}
.vexy-vlip[data-overlay="true"] .vexy-vlip__overlay { opacity: 1; }
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
  position: relative;
  box-sizing: border-box;
  padding: var(--vv-card-padding);
  border-radius: var(--vv-card-radius);
  border: var(--vv-card-border);
  background: var(--vv-card-bg);
  color: var(--vv-card-fg);
  font: var(--vv-card-font);
  box-shadow: var(--vv-card-shadow);
  text-align: start;
  overflow-wrap: break-word;
  opacity: 0;
  transform: translateY(0);
  transition: opacity 0.28s ease, transform 0.28s ease;
  will-change: opacity, transform;
}
.vexy-vlip__body code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  background: rgba(0, 0, 0, 0.08);
  padding: 0.1em 0.35em;
  border-radius: 5px;
  font-size: 0.92em;
}
.vexy-vlip__body a { color: var(--vv-accent); }
/* Rendered markdown blocks: collapse the outer margins so the panel padding
   stays even, and keep headings / lists readable. */
.vexy-vlip__body > :first-child { margin-top: 0; }
.vexy-vlip__body h1,
.vexy-vlip__body h2,
.vexy-vlip__body h3,
.vexy-vlip__body h4,
.vexy-vlip__body h5,
.vexy-vlip__body h6 { margin: 0.5em 0 0.3em; line-height: 1.25; }
.vexy-vlip__body p { margin: 0.5em 0; }
.vexy-vlip__body ul,
.vexy-vlip__body ol { margin: 0.5em 0; padding-inline-start: 1.4em; }
.vexy-vlip__body hr { border: 0; border-top: 1px solid rgba(0, 0, 0, 0.12); margin: 0.7em 0; }
/* In-card step navigation (stepped mode): optional counter on the left, Back +
   Next on the right. The row never wraps, so the Next label keeps its arrow on
   one line; auto-fit scales the whole card down if the row can't fit. Hidden in
   continuous mode by the data-mode selector below. */
.vexy-vlip__cardnav {
  display: none;
  align-items: center;
  gap: 12px;
  margin-top: 18px;
  flex-wrap: nowrap;
}
.vexy-vlip[data-mode="stepped"] .vexy-vlip__cardnav { display: flex; }
.vexy-vlip__counter {
  font-size: 0.82em;
  opacity: 0.5;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.vexy-vlip__navspacer { flex: 1 1 auto; min-width: 0; }
.vexy-vlip__prev,
.vexy-vlip__next {
  appearance: none;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  flex: 0 0 auto;
}
.vexy-vlip__prev {
  border: 0;
  background: transparent;
  color: var(--vv-card-fg);
  opacity: 0.7;
  padding: 6px 8px;
  font-size: 1.25em;
  border-radius: 8px;
}
.vexy-vlip__prev:hover { opacity: 1; }
/* Next: an outlined pill by default (white ground, dark hairline border), per
   the reference design. Set --vv-next-bg / --vv-next-border for a filled look. */
.vexy-vlip__next {
  background: var(--vv-next-bg);
  color: var(--vv-next-fg);
  border: 1.5px solid var(--vv-next-border);
  border-radius: 999px;
  padding: 10px 22px;
  font-size: 0.95em;
  transition: transform 0.12s ease, box-shadow 0.12s ease, filter 0.12s ease;
}
.vexy-vlip__next:hover {
  filter: brightness(0.97);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.28);
}
/* Close (×): top-right of the card; dismisses the cards to plain video mode. */
.vexy-vlip__close {
  position: absolute;
  top: 10px;
  right: 11px;
  display: none;
  appearance: none;
  border: 0;
  background: transparent;
  color: var(--vv-close-fg);
  opacity: 0.5;
  cursor: pointer;
  font-size: 0.95em;
  line-height: 1;
  padding: 2px 4px;
  border-radius: 6px;
}
.vexy-vlip__close:hover { opacity: 1; }
.vexy-vlip[data-mode="stepped"] .vexy-vlip__card--closable .vexy-vlip__close { display: block; }
/* Reserve top-right room so the title / first line never slides under the ×. */
.vexy-vlip[data-mode="stepped"] .vexy-vlip__card--closable .vexy-vlip__body { padding-right: 32px; }
/* CTA: the Start (pre-play) / Replay (after end) screen, centered over the
   dimmed frame (both modes), shown via data-cta. With a title (data-titled) the
   button sits in a card under the title; otherwise it's a bare pill. */
.vexy-vlip__cta {
  position: absolute;
  inset: 0;
  display: none;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 2;
}
.vexy-vlip[data-cta="start"] .vexy-vlip__cta,
.vexy-vlip[data-cta="replay"] .vexy-vlip__cta { display: flex; }
.vexy-vlip__cta-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  max-width: 80%;
  max-height: 86%;
  overflow-y: auto;
  box-sizing: border-box;
  pointer-events: auto;
}
.vexy-vlip[data-titled="true"] .vexy-vlip__cta-panel {
  background: var(--vv-card-bg);
  color: var(--vv-card-fg);
  font: var(--vv-card-font);
  padding: 24px 28px;
  border-radius: var(--vv-card-radius);
  box-shadow: var(--vv-card-shadow);
  text-align: center;
  gap: 24px;
}
.vexy-vlip__cta-title {
  font-size: 1.45em;
  font-weight: 700;
  line-height: 1.2;
  overflow-wrap: break-word;
}
/* The CTA button. Default (Start): a prominent pill, 20% larger than Next. */
.vexy-vlip__start {
  appearance: none;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
  white-space: nowrap;
  background: var(--vv-next-bg);
  color: var(--vv-next-fg);
  border: 1.8px solid var(--vv-next-border);
  border-radius: 999px;
  padding: 12px 26px;
  font-size: 1.14em;
  transition: transform 0.12s ease, filter 0.12s ease;
}
/* In a title card the Start button is a filled "primary" — dark ground, light
   text — to stand out on the white card. Set --vv-start-bg / --vv-start-fg. */
.vexy-vlip[data-titled="true"][data-cta="start"] .vexy-vlip__start {
  background: var(--vv-start-bg);
  color: var(--vv-start-fg);
  border-color: var(--vv-start-bg);
}
/* Replay is less prominent: the same outlined pill as the in-card Next button. */
.vexy-vlip[data-cta="replay"] .vexy-vlip__start {
  background: var(--vv-next-bg);
  color: var(--vv-next-fg);
  border: 1.5px solid var(--vv-next-border);
  padding: 10px 22px;
  font-size: 0.95em;
}
.vexy-vlip__start:hover {
  filter: brightness(0.96);
  transform: scale(1.04);
}
/* Small top-left title during playback / while cards rest (hidden on the CTA
   screen, where the title lives in the card). All knobs are themeable. */
.vexy-vlip__titlebar {
  position: absolute;
  top: 0;
  inset-inline-start: 0; /* top-left in LTR, top-right in RTL */
  margin: var(--vv-title-margin, 10px 12px);
  max-width: 72%;
  padding: var(--vv-title-padding, 4px 10px);
  font-size: var(--vv-title-size, 13px);
  font-weight: 600;
  line-height: 1.3;
  color: var(--vv-title-fg, rgba(255, 255, 255, 0.92));
  background: var(--vv-title-bg, rgba(0, 0, 0, 0.45));
  border-radius: var(--vv-title-radius, 7px);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.25s ease;
  z-index: 1;
}
.vexy-vlip[data-titled="true"][data-started="true"]:not([data-cta="start"]):not([data-cta="replay"]) .vexy-vlip__titlebar { opacity: 1; }
.vexy-vlip__card--in .vexy-vlip__body { opacity: 1; transform: translateY(0); }
.vexy-vlip__card[data-enter="slide-up"] .vexy-vlip__body { transform: translateY(14px); }
.vexy-vlip__card[data-enter="slide-down"] .vexy-vlip__body { transform: translateY(-14px); }
.vexy-vlip__card--in[data-enter="slide-up"] .vexy-vlip__body,
.vexy-vlip__card--in[data-enter="slide-down"] .vexy-vlip__body { transform: translateY(0); }
/* Stepped mode: cards read like full subtitle slides — more opaque panel and
   larger type — paired with the dimming overlay behind them. */
.vexy-vlip[data-mode="stepped"] .vexy-vlip__body {
  background: var(--vv-card-bg-stepped);
  font-size: 1.15em;
}
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
  background: var(--vv-dot);
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
}
.vexy-vlip__dot--active { background: var(--vv-dot-active); transform: scale(1.25); }
.vexy-vlip__time { font-variant-numeric: tabular-nums; font-size: 12px; opacity: 0.85; }
/* Stepped mode: the bottom bar is reduced to just the step dots — no play,
   prev/next, time, mute or fullscreen buttons. The dots stay visible at all
   times so the viewer can jump between steps; the Back / Next affordances live
   inside the card itself. */
.vexy-vlip[data-mode="stepped"] .vexy-vlip__controls {
  opacity: 1;
  pointer-events: auto;
  background: transparent;
  justify-content: center;
}
.vexy-vlip[data-mode="stepped"] .vexy-vlip__btn,
.vexy-vlip[data-mode="stepped"] .vexy-vlip__time { display: none; }
.vexy-vlip[data-mode="stepped"] .vexy-vlip__dots {
  flex: 0 0 auto;
  justify-content: center;
}
@media (prefers-reduced-motion: reduce) {
  .vexy-vlip__body { transition: opacity 0.001s; transform: none !important; }
  .vexy-vlip__start,
  .vexy-vlip__prev,
  .vexy-vlip__next,
  .vexy-vlip__dot { transition: none; }
  .vexy-vlip__start:hover,
  .vexy-vlip__prev:hover,
  .vexy-vlip__next:hover { transform: none; }
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
