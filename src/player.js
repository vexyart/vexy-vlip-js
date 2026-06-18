// this_file: src/player.js
//
// VexyVlip — the core player. Wraps a native <video>, fetches + parses a WebVTT
// file into card models (vtt.js), and drives two playback modes:
//   - continuous: normal playback; cards appear/disappear with their cues.
//   - stepped:    play to the next cue start, pause, show the card; the viewer
//                 clicks to advance to the next one (IDEA §6).
// Optional eased travel between stop points drives currentTime on a rAF loop.
// No runtime dependencies — native browser APIs only.

import { parseCards } from "./vtt.js";
import { stopPoints, segmentAtTime, nextStop, prevStop, currentStop, EPS } from "./segments.js";
import { CardLayer } from "./cards.js";
import { injectStyles } from "./styles.js";

const EASE = {
  linear: (p) => p,
  "ease-in": (p) => p * p,
  "ease-out": (p) => 1 - (1 - p) * (1 - p),
  "ease-in-out": (p) => p * p * (3 - 2 * p),
};

const DEFAULTS = {
  src: "",
  track: "",
  vtt: "", // inline VTT text (alternative to `track`)
  mode: "continuous",
  easing: "linear",
  controls: true,
  autoplay: false,
  loop: false,
  muted: false,
  poster: "",
  startAt: 0,
  startSegment: null,
  keyboard: true,
  sanitize: false,
  hint: true,
  injectStyles: true,
};

const ICONS = {
  play: "▶", pause: "❚❚", prev: "⏮", next: "⏭", mute: "🔊", muted: "🔇", fs: "⤢",
};

export class VexyVlip {
  /**
   * @param {HTMLElement} target container element (or an existing <video>).
   * @param {Partial<typeof DEFAULTS>} [options]
   */
  constructor(target, options = {}) {
    if (!target || !target.ownerDocument) {
      throw new TypeError("VexyVlip: a target element is required");
    }
    this.opts = { ...DEFAULTS, ...options };
    this.doc = target.ownerDocument;
    this.cards = [];
    this.stops = [];
    this._destroyed = false;
    this._ready = false;
    this._target = null; // stepped: time we are travelling toward
    this._pendingSeg = -1; // stepped: segment to reveal at _target
    this._stepIndex = -1; // stepped: index of the card we are resting on (-1 = before the first)
    this._playingToEnd = false;
    this._ease = null; // active eased-travel state
    this._looping = false;
    this._frame = null;
    this._mode = this.opts.mode === "stepped" ? "stepped" : "continuous";
    // One controller for every listener we add, so destroy() is a single abort().
    this._ac = new AbortController();

    this._buildDom(target);
    if (this.opts.injectStyles && !this._inShadow) injectStyles(this.doc);
    this._wireEvents();
    this._loadMedia();
  }

  // ---- DOM ---------------------------------------------------------------

  _buildDom(target) {
    const doc = this.doc;
    // Adopt an existing video, or create the container fresh.
    if (target.tagName === "VIDEO") {
      this.video = target;
      const wrap = doc.createElement("div");
      target.replaceWith(wrap);
      wrap.appendChild(target);
      this.root = wrap;
    } else {
      this.root = target;
      this.video = doc.createElement("video");
      this.root.appendChild(this.video);
    }
    this._inShadow = this.root.getRootNode() instanceof ShadowRoot;
    this.root.classList.add("vexy-vlip");
    this.root.dataset.mode = this._mode;
    this.root.tabIndex = this.root.tabIndex >= 0 ? this.root.tabIndex : 0;

    const v = this.video;
    v.classList.add("vexy-vlip__video");
    v.playsInline = true;
    v.preload = "metadata";
    if (this.opts.src) v.src = this.opts.src;
    if (this.opts.poster) v.poster = this.opts.poster;
    // Native loop would wedge the stepped engine (no `ended` to reset state),
    // so it only applies in continuous mode.
    v.loop = !!this.opts.loop && this._mode !== "stepped";
    v.muted = !!this.opts.muted;
    // We render our own controls; never the native ones.
    v.controls = false;

    this.tap = doc.createElement("button");
    this.tap.className = "vexy-vlip__tap";
    this.tap.type = "button";
    this.tap.setAttribute("aria-label", "Advance to the next step");
    this.root.appendChild(this.tap);

    this.cardsLayer = doc.createElement("div");
    this.cardsLayer.className = "vexy-vlip__cards";
    this.cardsLayer.setAttribute("aria-live", "polite");
    this.root.appendChild(this.cardsLayer);
    this.layer = new CardLayer(this.cardsLayer, {
      sanitize: this.opts.sanitize ? defaultSanitize : undefined,
    });

    if (this.opts.hint) {
      this.hint = doc.createElement("div");
      this.hint.className = "vexy-vlip__hint";
      this.hint.textContent = "Click to continue";
      this.root.appendChild(this.hint);
    }

    if (this.opts.controls) this._buildControls();
  }

  _buildControls() {
    const doc = this.doc;
    const bar = doc.createElement("div");
    bar.className = "vexy-vlip__controls";
    const btn = (label, aria) => {
      const b = doc.createElement("button");
      b.className = "vexy-vlip__btn";
      b.type = "button";
      b.textContent = label;
      b.setAttribute("aria-label", aria);
      return b;
    };
    this._playBtn = btn(ICONS.play, "Play");
    this._prevBtn = btn(ICONS.prev, "Previous step");
    this._nextBtn = btn(ICONS.next, "Next step");
    this._dots = doc.createElement("div");
    this._dots.className = "vexy-vlip__dots";
    this._time = doc.createElement("span");
    this._time.className = "vexy-vlip__time";
    this._muteBtn = btn(this.opts.muted ? ICONS.muted : ICONS.mute, "Mute");
    this._fsBtn = btn(ICONS.fs, "Fullscreen");

    bar.append(this._prevBtn, this._playBtn, this._nextBtn, this._dots, this._time, this._muteBtn, this._fsBtn);
    this._controlsBar = bar;
    this.root.appendChild(bar);

    const sig = { signal: this._ac.signal };
    this._playBtn.addEventListener("click", () => this.toggle(), sig);
    this._prevBtn.addEventListener("click", () => this.prev(), sig);
    this._nextBtn.addEventListener("click", () => this.next(), sig);
    this._muteBtn.addEventListener("click", () => this._toggleMute(), sig);
    this._fsBtn.addEventListener("click", () => this._toggleFullscreen(), sig);
  }

  _buildDots() {
    if (!this._dots) return;
    this._dots.replaceChildren();
    this.cards.forEach((c, i) => {
      const d = this.doc.createElement("button");
      d.className = "vexy-vlip__dot";
      d.type = "button";
      d.setAttribute("aria-label", `Step ${i + 1}`);
      d.addEventListener("click", () => this.goToSegment(i), { signal: this._ac.signal });
      this._dots.appendChild(d);
    });
  }

  // ---- events ------------------------------------------------------------

  _wireEvents() {
    const v = this.video;
    const sig = { signal: this._ac.signal };
    v.addEventListener("loadedmetadata", () => this._onMeta(), sig);
    v.addEventListener("ended", () => this._handleEnded(), sig);
    v.addEventListener("play", () => this._reflect(), sig);
    v.addEventListener("pause", () => this._reflect(), sig);
    v.addEventListener("seeked", () => this._updateUi(), sig);

    // Tap layer (stepped) and clicking the video both advance/toggle.
    this.tap.addEventListener("click", (e) => { this.toggle(); e.preventDefault(); }, sig);

    // Clicking a card advances (unless the click landed on a link/button).
    this.cardsLayer.addEventListener("click", (e) => {
      const t = e.target;
      if (t && (t.closest("a") || t.closest("button:not(.vexy-vlip__tap)"))) return;
      if (this._mode === "stepped") this.toggle();
    }, sig);

    if (this.opts.keyboard) {
      this.root.addEventListener("keydown", (e) => this._handleKey(e), sig);
    }
  }

  _handleKey(e) {
    switch (e.key) {
      case " ":
      case "Enter":
        this.toggle();
        e.preventDefault();
        break;
      case "ArrowRight":
        this.next();
        e.preventDefault();
        break;
      case "ArrowLeft":
        this.prev();
        e.preventDefault();
        break;
      case "f":
        this._toggleFullscreen();
        break;
      case "m":
        this._toggleMute();
        break;
      default:
        break;
    }
  }

  // ---- loading -----------------------------------------------------------

  async _loadMedia() {
    let text = this.opts.vtt;
    if (!text && this.opts.track) {
      try {
        const res = await fetch(this.opts.track);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        text = await res.text();
      } catch (err) {
        this._emit("error", { error: err, phase: "track" });
        return;
      }
    }
    if (this._destroyed) return;
    if (text) {
      this.cards = parseCards(text, { enter: "fade" });
      this.stops = stopPoints(this.cards);
      this.layer.setCards(this.cards);
      this._buildDots();
    }
    this._cardsReady = true;
    this._maybeReady();
  }

  _onMeta() {
    this._metaReady = true;
    this._maybeReady();
  }

  _maybeReady() {
    if (this._ready || this._destroyed) return;
    // Ready once metadata is in and (if a track was requested) cards parsed.
    if (!this._metaReady || !this._cardsReady) return;
    this._ready = true;
    // Initial placement.
    const startSeg = this.opts.startSegment;
    if (startSeg != null && this.cards[startSeg]) {
      this._stepIndex = startSeg;
      this.video.currentTime = this.cards[startSeg].start;
      if (this._mode === "stepped") this.layer.show(startSeg);
    } else if (this.opts.startAt) {
      this.video.currentTime = this.opts.startAt;
      this._stepIndex = currentStop(this.cards, this.opts.startAt);
    }
    this._updateUi();
    this._emit("ready", { segments: this.cards.length });
    if (this._mode === "continuous" && this.opts.autoplay) this.play();
    else this._showHint(this._mode === "stepped");
  }

  // ---- frame watcher -----------------------------------------------------

  _startLoop() {
    if (this._looping) return;
    this._looping = true;
    this._scheduleTick();
  }

  _scheduleTick() {
    // Idempotent: never queue a second handle while one is pending, so rapid
    // pause/play can't orphan a frame callback that runs forever.
    if (this._destroyed || this._frame != null) return;
    const v = this.video;
    const cb = () => this._tick();
    if (typeof v.requestVideoFrameCallback === "function") {
      this._frame = v.requestVideoFrameCallback(cb);
      this._frameKind = "rvfc";
    } else {
      this._frame = requestAnimationFrame(cb);
      this._frameKind = "raf";
    }
  }

  _stopLoop() {
    this._looping = false;
    if (this._frame == null) return;
    const v = this.video;
    if (this._frameKind === "rvfc" && typeof v.cancelVideoFrameCallback === "function") {
      v.cancelVideoFrameCallback(this._frame);
    } else if (this._frameKind === "raf") {
      cancelAnimationFrame(this._frame);
    }
    this._frame = null;
  }

  _tick() {
    this._frame = null; // the handle that fired is now consumed
    if (this._destroyed) return;
    const v = this.video;
    const t = v.currentTime;

    if (this._mode === "stepped" && this._target != null) {
      // Defensive: stop a touch early then snap, to avoid overshoot.
      if (t + EPS >= this._target) {
        this._reachStop(this._pendingSeg);
      }
    } else if (this._mode === "continuous") {
      const seg = segmentAtTime(this.cards, t);
      if (seg !== this.layer.activeIndex) {
        if (seg === -1) {
          this.layer.hide();
          this._emit("cardhide", {});
        } else {
          this.layer.show(seg);
          this._emit("segmententer", { index: seg, segment: this.cards[seg] });
          this._emit("cardshow", { index: seg, segment: this.cards[seg] });
        }
      }
    }

    this._updateUi();

    if (!v.paused && !this._destroyed) {
      this._scheduleTick();
    } else {
      this._looping = false;
    }
  }

  // ---- stepped engine ----------------------------------------------------

  _advance() {
    if (!this._ready) return;
    const t = this.video.currentTime;
    // Leaving the current stop: hide its card.
    if (this.layer.activeIndex >= 0) {
      const left = this.layer.activeIndex;
      this.layer.hide();
      this._emit("segmentexit", { index: left });
      this._emit("cardhide", { index: left });
    }
    this._showHint(false);
    // Advance by explicit step index (not by time) so a cue at 00:00 is not
    // skipped on the first click and so back-to-back cues each get a stop.
    const ni = this._stepIndex + 1 < this.cards.length ? this._stepIndex + 1 : -1;
    if (ni === -1) {
      // Past the last card: play to the end.
      this._target = null;
      this._pendingSeg = -1;
      this._playingToEnd = true;
      this._playNative();
    } else {
      const target = this.cards[ni].start;
      this._playingToEnd = false;
      if (this.opts.easing !== "linear" && EASE[this.opts.easing]) {
        this._travelEased(t, target, ni);
      } else {
        this._target = target;
        this._pendingSeg = ni;
        this._playNative();
      }
    }
    this._emit("play", {});
  }

  _playNative() {
    this._cancelEase();
    const p = this.video.play();
    this._startLoop();
    if (p && typeof p.catch === "function") {
      p.catch((err) => this._emit("error", { error: err, phase: "play" }));
    }
  }

  _travelEased(from, to, segIndex) {
    this._cancelEase();
    this.video.pause();
    const fn = EASE[this.opts.easing] || EASE.linear;
    const rate = this.video.playbackRate || 1;
    const durMs = (Math.max(0, to - from) / rate) * 1000;
    const wasMuted = this.video.muted;
    this.video.muted = true; // scrubbing audio is unusable
    const start = (typeof performance !== "undefined" ? performance.now() : Date.now());
    const state = { segIndex, wasMuted, raf: 0 };
    this._ease = state;
    const step = () => {
      if (this._destroyed || this._ease !== state) return;
      const now = (typeof performance !== "undefined" ? performance.now() : Date.now());
      const p = durMs <= 0 ? 1 : Math.min(1, (now - start) / durMs);
      this.video.currentTime = from + (to - from) * fn(p);
      this._updateUi();
      if (p >= 1) {
        this.video.muted = wasMuted;
        this._ease = null;
        this._reachStop(segIndex);
      } else {
        state.raf = requestAnimationFrame(step);
      }
    };
    state.raf = requestAnimationFrame(step);
  }

  _cancelEase() {
    if (this._ease) {
      cancelAnimationFrame(this._ease.raf);
      if (this._ease.wasMuted != null) this.video.muted = this._ease.wasMuted;
      this._ease = null;
    }
  }

  _reachStop(segIndex) {
    this.video.pause();
    if (segIndex >= 0 && this.cards[segIndex]) {
      this._stepIndex = segIndex;
      this.video.currentTime = this.cards[segIndex].start;
      this.layer.show(segIndex);
      this._emit("segmententer", { index: segIndex, segment: this.cards[segIndex] });
      this._emit("cardshow", { index: segIndex, segment: this.cards[segIndex] });
    }
    this._target = null;
    this._pendingSeg = -1;
    this._showHint(true);
    this._emit("stop", { index: segIndex });
    this._updateUi();
  }

  // ---- public API --------------------------------------------------------

  play() {
    if (this._mode === "stepped") this._advance();
    else this._playNative();
  }

  pause() {
    this._cancelEase();
    this._target = null;
    this._pendingSeg = -1;
    this.video.pause();
    this._emit("pause", {});
  }

  toggle() {
    if (this._mode === "stepped") {
      if (!this.video.paused || this._ease) this.pause();
      else this._advance();
    } else {
      if (this.video.paused) this._playNative();
      else this.pause();
    }
  }

  next() {
    if (this._mode === "stepped") {
      this._advance();
    } else {
      const ni = nextStop(this.cards, this.video.currentTime);
      if (ni >= 0) this.seekTo(this.cards[ni].start);
    }
  }

  prev() {
    if (this._mode === "stepped") {
      // Step back by index (mirrors the index-based forward advance).
      const pi = (this._stepIndex >= 0 ? this._stepIndex : this.cards.length) - 1;
      this.goToSegment(Math.max(0, pi));
      return;
    }
    const pi = prevStop(this.cards, this.video.currentTime);
    this.goToSegment(pi >= 0 ? pi : 0);
  }

  seekTo(time) {
    this._cancelEase();
    this._target = null;
    this.video.currentTime = Math.max(0, time);
    this._updateUi();
  }

  goToSegment(i) {
    if (!this.cards[i]) return;
    this._cancelEase();
    this._target = null;
    this._pendingSeg = -1;
    this._stepIndex = i;
    this.video.pause();
    this.video.currentTime = this.cards[i].start;
    this.layer.show(i);
    this._showHint(this._mode === "stepped");
    this._emit("segmententer", { index: i, segment: this.cards[i] });
    this._emit("cardshow", { index: i, segment: this.cards[i] });
    this._updateUi();
  }

  showCard(i) {
    if (this.cards[i]) {
      this.layer.show(i);
      this._emit("cardshow", { index: i, segment: this.cards[i] });
    }
  }

  hideCard() {
    this.layer.hide();
    this._emit("cardhide", {});
  }

  /** Read-only copy of the parsed segment (card) models. */
  getSegments() {
    return this.segments;
  }

  setMode(mode) {
    const next = mode === "stepped" ? "stepped" : "continuous";
    if (next === this._mode) return;
    this._mode = next;
    this.root.dataset.mode = next;
    this._cancelEase();
    this._target = null;
    // Resume stepping from wherever the playhead currently rests.
    this._stepIndex = this.layer.activeIndex >= 0
      ? this.layer.activeIndex
      : currentStop(this.cards, this.video.currentTime);
    this.video.loop = !!this.opts.loop && next !== "stepped";
    this.video.pause();
    this.layer.hide();
    this._showHint(next === "stepped");
    this._emit("modechange", { mode: next });
  }

  setEasing(easing) {
    if (EASE[easing]) this.opts.easing = easing;
  }

  destroy() {
    this._destroyed = true;
    this._stopLoop();
    this._cancelEase();
    // Removes every listener we added (video, tap, cards, keyboard, controls, dots).
    this._ac.abort();
    try {
      this.video.pause();
    } catch {
      /* ignore */
    }
    this.layer.clear();
    // Remove the chrome we created (leave the video element in place; it may
    // have been supplied by the caller).
    for (const el of [this.tap, this.cardsLayer, this.hint, this._controlsBar]) {
      el?.remove();
    }
    this._emit("destroy", {});
  }

  // ---- helpers -----------------------------------------------------------

  _handleEnded() {
    this._playingToEnd = false;
    this._stopLoop();
    this.layer.hide();
    this._emit("ended", {});
    this._reflect();
  }

  _toggleMute() {
    this.video.muted = !this.video.muted;
    if (this._muteBtn) this._muteBtn.textContent = this.video.muted ? ICONS.muted : ICONS.mute;
  }

  _toggleFullscreen() {
    const el = this.root;
    if (this.doc.fullscreenElement) this.doc.exitFullscreen?.();
    else el.requestFullscreen?.();
  }

  _showHint(show) {
    if (!this.hint) return;
    this.hint.classList.toggle("vexy-vlip__hint--show", !!show);
  }

  _reflect() {
    const paused = this.video.paused;
    this.root.dataset.paused = String(paused);
    if (this._playBtn) this._playBtn.textContent = paused ? ICONS.play : ICONS.pause;
    if (!paused) this._startLoop();
  }

  _updateUi() {
    this._reflect();
    if (this._time) {
      this._time.textContent = `${fmt(this.video.currentTime)} / ${fmt(this.video.duration)}`;
    }
    if (this._dots) {
      const active = this.layer.activeIndex >= 0
        ? this.layer.activeIndex
        : currentStop(this.cards, this.video.currentTime);
      const dots = this._dots.children;
      for (let i = 0; i < dots.length; i++) {
        dots[i].classList.toggle("vexy-vlip__dot--active", i === active);
      }
    }
  }

  _emit(name, detail) {
    const evt = new CustomEvent(`vexyvlip:${name}`, { detail, bubbles: true, composed: true });
    this.root.dispatchEvent(evt);
    const handler = this.opts[`on${name[0].toUpperCase()}${name.slice(1)}`];
    if (typeof handler === "function") handler(detail, this);
  }

  // ---- getters -----------------------------------------------------------

  get segments() {
    // Deep copy so callers can't mutate internal placement/style objects.
    return this.cards.map((c) =>
      typeof structuredClone === "function" ? structuredClone(c) : JSON.parse(JSON.stringify(c)),
    );
  }
  get currentSegment() {
    return this.layer.activeIndex >= 0
      ? this.layer.activeIndex
      : currentStop(this.cards, this.video.currentTime);
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

function fmt(s) {
  if (!Number.isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

/** Minimal HTML sanitiser for `html` cards when `sanitize: true`. */
function defaultSanitize(html) {
  const div = document.createElement("div");
  div.innerHTML = html;
  div.querySelectorAll("script, style, iframe, object, embed").forEach((n) => n.remove());
  div.querySelectorAll("*").forEach((el) => {
    [...el.attributes].forEach((a) => {
      if (/^on/i.test(a.name) || (/^(href|src)$/i.test(a.name) && /^\s*javascript:/i.test(a.value))) {
        el.removeAttribute(a.name);
      }
    });
  });
  return div.innerHTML;
}

export { DEFAULTS };
