var VexyVlip=(function(){"use strict";function w(i){if(typeof i!="string")return NaN;const t=i.trim().match(/^(?:(\d+):)?(\d{1,2}):(\d{2})(?:[.,](\d{1,3}))?$/);if(!t)return NaN;const[,e,s,n,r]=t;return(e?Number(e):0)*3600+Number(s)*60+Number(n)+(r?Number(r.padEnd(3,"0"))/1e3:0)}function I(i){const t={};if(!i)return t;for(const e of i.trim().split(/\s+/)){const s=e.indexOf(":");if(s<=0)continue;const n=e.slice(0,s),r=e.slice(s+1);["position","line","size","align","vertical","region"].includes(n)&&(t[n]=r)}return t}const M=/^(\d{1,2}:)?\d{1,2}:\d{2}[.,]\d{1,3}\s*-->\s*(\d{1,2}:)?\d{1,2}:\d{2}[.,]\d{1,3}/;function $(i){const t=[];if(typeof i!="string")return t;const s=i.replace(/^﻿/,"").replace(/\r\n?/g,`
`).split(/\n\n+/);let n=0;for(const r of s){const a=r.split(`
`).filter(st=>st.length>0);if(a.length===0)continue;let o=0;if(/^WEBVTT/.test(a[0])&&n===0&&!M.test(a[0])){if(a.length===1)continue;o=1}if(/^(NOTE|STYLE|REGION)\b/.test(a[o]))continue;let d="";a[o]&&!a[o].includes("-->")&&(d=a[o],o+=1);const l=a[o];if(!l||!l.includes("-->"))continue;const h=l.indexOf("-->"),f=w(l.slice(0,h)),u=l.slice(h+3).trim(),m=u.indexOf(" "),tt=m===-1?u:u.slice(0,m),et=m===-1?"":u.slice(m+1),L=w(tt);if(Number.isNaN(f)||Number.isNaN(L))continue;const it=a.slice(o+1).join(`
`);t.push({index:n++,id:d,start:f,end:L,settings:I(et),payload:it})}return t}const B={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};function F(i){return String(i).replace(/[&<>"']/g,t=>B[t])}function E(i){let t=F(i);return t=t.replace(/`([^`]+)`/g,"<code>$1</code>"),t=t.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>"),t=t.replace(new RegExp("(?<!\\*)\\*([^*\\n]+)\\*(?!\\*)","g"),"<em>$1</em>"),t=t.replace(/\n/g,"<br>"),t}const R=new Set(["center","top","bottom","left","right","top-left","top-right","bottom-left","bottom-right"]);function x(i){return typeof i=="number"?i:typeof i=="string"?parseFloat(i.replace("%","")):NaN}function z(i){const t=(i||"").trim();if(!t.startsWith("{"))return null;try{const e=JSON.parse(t);return e&&typeof e=="object"?e:null}catch{return null}}function D(i,t={}){const e=z(i.payload),s=i.settings||{};let n,r;e&&typeof e.html=="string"?(n=e.html,r=e.text||""):e&&typeof e.text=="string"?(r=e.text,n=E(e.text)):(r=i.payload,n=E(i.payload));let a=e&&e.x!=null?e.x:x(s.position),o=e&&e.y!=null?e.y:x(s.line),d=e&&e.w!=null?e.w:x(s.size),l=e&&e.anchor,h=e&&e.align||s.align||"start";h==="left"&&(h="start"),h==="right"&&(h="end");const f=a!=null&&a!==""&&!(typeof a=="number"&&Number.isNaN(a)),u=o!=null&&o!==""&&!(typeof o=="number"&&Number.isNaN(o)),m=d!=null&&d!==""&&!(typeof d=="number"&&Number.isNaN(d));return(!l||!R.has(l))&&(l="bottom"),f||(a=50),u||(o=88),{index:i.index,id:i.id,start:i.start,end:i.end,text:r,html:n,isHtml:!!(e&&typeof e.html=="string"),placement:{x:a,y:o,w:m?d:null,anchor:l,align:h},style:{bg:e?e.bg:void 0,fg:e&&e.fg,font:e&&e.font,padding:e&&e.padding,radius:e&&e.radius,border:e&&e.border,shadow:e&&e.shadow,opacity:e&&e.opacity},className:e&&e.class||"",enter:e&&e.enter||t.enter||"fade",exit:e&&e.exit||t.exit||"fade"}}function H(i,t={}){return $(i).map(e=>D(e,t))}const _=.02;function O(i){return i.map((t,e)=>({index:e,time:t.start,end:t.end})).sort((t,e)=>t.time-e.time)}function j(i,t){for(let e=0;e<i.length;e++)if(t>=i[e].start-_&&t<i[e].end-_)return e;return-1}function V(i,t,e=_){let s=-1,n=1/0;for(let r=0;r<i.length;r++){const a=i[r].start;a>t+e&&a<n&&(n=a,s=r)}return s}function q(i,t,e=_){let s=-1,n=-1/0;for(let r=0;r<i.length;r++){const a=i[r].start;a<t-e&&a>n&&(n=a,s=r)}return s}function g(i,t,e=_){let s=-1,n=-1/0;for(let r=0;r<i.length;r++){const a=i[r].start;a<=t+e&&a>n&&(n=a,s=r)}return s}const k={center:"translate(-50%, -50%)",top:"translate(-50%, 0)",bottom:"translate(-50%, -100%)",left:"translate(0, -50%)",right:"translate(-100%, -50%)","top-left":"translate(0, 0)","top-right":"translate(-100%, 0)","bottom-left":"translate(0, -100%)","bottom-right":"translate(-100%, -100%)"};function y(i,t="%"){return i==null?null:typeof i=="number"?`${i}${t}`:String(i)}function U(i,t){i.style.left=y(t.x),i.style.top=y(t.y),i.style.transform=k[t.anchor]||k.bottom,t.w!=null?i.style.width=y(t.w):i.style.width=""}function P(i,t){if(i==null)return;if(t==null||t>=1)return i;const e=Math.max(0,Math.min(1,Number(t))),s=/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(i.trim());if(s){let r=s[1];r.length===3&&(r=r.split("").map(l=>l+l).join(""));const a=parseInt(r.slice(0,2),16),o=parseInt(r.slice(2,4),16),d=parseInt(r.slice(4,6),16);return`rgba(${a}, ${o}, ${d}, ${e})`}const n=/^rgba?\(([^)]+)\)$/i.exec(i.trim());if(n){const r=n[1].split(",").map(a=>a.trim()).slice(0,3);if(r.length===3)return`rgba(${r.join(", ")}, ${e})`}return i}function Y(i,t,e){if(!t)return;t.fg&&(i.style.color=t.fg),t.font&&(i.style.font=t.font),t.padding&&(i.style.padding=t.padding),t.radius!=null&&(i.style.borderRadius=y(t.radius,"px")),t.border&&(i.style.border=t.border),t.shadow&&(i.style.boxShadow=t.shadow);const s=P(t.bg,t.opacity);s&&(i.style.background=s),e&&(i.style.textAlign=e)}function K(i,t,e={}){const s=i.createElement("div");s.className="vexy-vlip__card",s.dataset.index=String(t.index),s.dataset.enter=t.enter||"fade",s.setAttribute("role","note"),t.className&&(s.className+=" "+t.className);const n=i.createElement("div");n.className="vexy-vlip__body";let r=t.html;return t.isHtml&&typeof e.sanitize=="function"&&(r=e.sanitize(r)),n.innerHTML=r,U(s,t.placement),Y(n,t.style,t.placement.align),s.appendChild(n),s}class W{constructor(t,e={}){this.layer=t,this.doc=t.ownerDocument,this.opts=e,this.cards=[],this.els=new Map,this.activeIndex=-1}setCards(t){this.clear(),this.cards=t}clear(){this.layer.replaceChildren(),this.els.clear(),this.activeIndex=-1}_ensure(t){let e=this.els.get(t);return e||(e=K(this.doc,this.cards[t],this.opts),this.els.set(t,e),this.layer.appendChild(e)),e}show(t){if(t===this.activeIndex||(this.hide(),t<0||t>=this.cards.length))return!1;const e=this._ensure(t);return e.offsetWidth,e.classList.add("vexy-vlip__card--in"),this.activeIndex=t,!0}hide(){if(this.activeIndex<0)return!1;const t=this.els.get(this.activeIndex);return t&&t.classList.remove("vexy-vlip__card--in"),this.activeIndex=-1,!0}}const S="vexy-vlip-styles",N=`
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
`;function J(){return`:host{display:inline-block;position:relative;max-width:100%}:host([hidden]){display:none}${N}`}function G(i){if(!i||i.getElementById(S))return;const t=i.createElement("style");t.id=S,t.textContent=N,i.head.appendChild(t)}const b={linear:i=>i,"ease-in":i=>i*i,"ease-out":i=>1-(1-i)*(1-i),"ease-in-out":i=>i*i*(3-2*i)},X={src:"",track:"",vtt:"",mode:"continuous",easing:"linear",controls:!0,autoplay:!1,loop:!1,muted:!1,poster:"",startAt:0,startSegment:null,keyboard:!0,sanitize:!1,hint:!0,injectStyles:!0},c={play:"▶",pause:"❚❚",prev:"⏮",next:"⏭",mute:"🔊",muted:"🔇",fs:"⤢"};class v{constructor(t,e={}){if(!t||!t.ownerDocument)throw new TypeError("VexyVlip: a target element is required");this.opts={...X,...e},this.doc=t.ownerDocument,this.cards=[],this.stops=[],this._destroyed=!1,this._ready=!1,this._target=null,this._pendingSeg=-1,this._stepIndex=-1,this._playingToEnd=!1,this._ease=null,this._looping=!1,this._frame=null,this._mode=this.opts.mode==="stepped"?"stepped":"continuous",this._ac=new AbortController,this._buildDom(t),this.opts.injectStyles&&!this._inShadow&&G(this.doc),this._wireEvents(),this._loadMedia()}_buildDom(t){const e=this.doc;if(t.tagName==="VIDEO"){this.video=t;const n=e.createElement("div");t.replaceWith(n),n.appendChild(t),this.root=n}else this.root=t,this.video=e.createElement("video"),this.root.appendChild(this.video);this._inShadow=this.root.getRootNode()instanceof ShadowRoot,this.root.classList.add("vexy-vlip"),this.root.dataset.mode=this._mode,this.root.tabIndex=this.root.tabIndex>=0?this.root.tabIndex:0;const s=this.video;s.classList.add("vexy-vlip__video"),s.playsInline=!0,s.preload="metadata",this.opts.src&&(s.src=this.opts.src),this.opts.poster&&(s.poster=this.opts.poster),s.loop=!!this.opts.loop&&this._mode!=="stepped",s.muted=!!this.opts.muted,s.controls=!1,this.tap=e.createElement("button"),this.tap.className="vexy-vlip__tap",this.tap.type="button",this.tap.setAttribute("aria-label","Advance to the next step"),this.root.appendChild(this.tap),this.cardsLayer=e.createElement("div"),this.cardsLayer.className="vexy-vlip__cards",this.cardsLayer.setAttribute("aria-live","polite"),this.root.appendChild(this.cardsLayer),this.layer=new W(this.cardsLayer,{sanitize:this.opts.sanitize?Q:void 0}),this.opts.hint&&(this.hint=e.createElement("div"),this.hint.className="vexy-vlip__hint",this.hint.textContent="Click to continue",this.root.appendChild(this.hint)),this.opts.controls&&this._buildControls()}_buildControls(){const t=this.doc,e=t.createElement("div");e.className="vexy-vlip__controls";const s=(r,a)=>{const o=t.createElement("button");return o.className="vexy-vlip__btn",o.type="button",o.textContent=r,o.setAttribute("aria-label",a),o};this._playBtn=s(c.play,"Play"),this._prevBtn=s(c.prev,"Previous step"),this._nextBtn=s(c.next,"Next step"),this._dots=t.createElement("div"),this._dots.className="vexy-vlip__dots",this._time=t.createElement("span"),this._time.className="vexy-vlip__time",this._muteBtn=s(this.opts.muted?c.muted:c.mute,"Mute"),this._fsBtn=s(c.fs,"Fullscreen"),e.append(this._prevBtn,this._playBtn,this._nextBtn,this._dots,this._time,this._muteBtn,this._fsBtn),this._controlsBar=e,this.root.appendChild(e);const n={signal:this._ac.signal};this._playBtn.addEventListener("click",()=>this.toggle(),n),this._prevBtn.addEventListener("click",()=>this.prev(),n),this._nextBtn.addEventListener("click",()=>this.next(),n),this._muteBtn.addEventListener("click",()=>this._toggleMute(),n),this._fsBtn.addEventListener("click",()=>this._toggleFullscreen(),n)}_buildDots(){this._dots&&(this._dots.replaceChildren(),this.cards.forEach((t,e)=>{const s=this.doc.createElement("button");s.className="vexy-vlip__dot",s.type="button",s.setAttribute("aria-label",`Step ${e+1}`),s.addEventListener("click",()=>this.goToSegment(e),{signal:this._ac.signal}),this._dots.appendChild(s)}))}_wireEvents(){const t=this.video,e={signal:this._ac.signal};t.addEventListener("loadedmetadata",()=>this._onMeta(),e),t.addEventListener("ended",()=>this._handleEnded(),e),t.addEventListener("play",()=>this._reflect(),e),t.addEventListener("pause",()=>this._reflect(),e),t.addEventListener("seeked",()=>this._updateUi(),e),this.tap.addEventListener("click",s=>{this.toggle(),s.preventDefault()},e),this.cardsLayer.addEventListener("click",s=>{const n=s.target;n&&(n.closest("a")||n.closest("button:not(.vexy-vlip__tap)"))||this._mode==="stepped"&&this.toggle()},e),this.opts.keyboard&&this.root.addEventListener("keydown",s=>this._handleKey(s),e)}_handleKey(t){switch(t.key){case" ":case"Enter":this.toggle(),t.preventDefault();break;case"ArrowRight":this.next(),t.preventDefault();break;case"ArrowLeft":this.prev(),t.preventDefault();break;case"f":this._toggleFullscreen();break;case"m":this._toggleMute();break}}async _loadMedia(){let t=this.opts.vtt;if(!t&&this.opts.track)try{const e=await fetch(this.opts.track);if(!e.ok)throw new Error(`HTTP ${e.status}`);t=await e.text()}catch(e){this._emit("error",{error:e,phase:"track"});return}this._destroyed||(t&&(this.cards=H(t,{enter:"fade"}),this.stops=O(this.cards),this.layer.setCards(this.cards),this._buildDots()),this._cardsReady=!0,this._maybeReady())}_onMeta(){this._metaReady=!0,this._maybeReady()}_maybeReady(){if(this._ready||this._destroyed||!this._metaReady||!this._cardsReady)return;this._ready=!0;const t=this.opts.startSegment;t!=null&&this.cards[t]?(this._stepIndex=t,this.video.currentTime=this.cards[t].start,this._mode==="stepped"&&this.layer.show(t)):this.opts.startAt&&(this.video.currentTime=this.opts.startAt,this._stepIndex=g(this.cards,this.opts.startAt)),this._updateUi(),this._emit("ready",{segments:this.cards.length}),this._mode==="continuous"&&this.opts.autoplay?this.play():this._showHint(this._mode==="stepped")}_startLoop(){this._looping||(this._looping=!0,this._scheduleTick())}_scheduleTick(){if(this._destroyed||this._frame!=null)return;const t=this.video,e=()=>this._tick();typeof t.requestVideoFrameCallback=="function"?(this._frame=t.requestVideoFrameCallback(e),this._frameKind="rvfc"):(this._frame=requestAnimationFrame(e),this._frameKind="raf")}_stopLoop(){if(this._looping=!1,this._frame==null)return;const t=this.video;this._frameKind==="rvfc"&&typeof t.cancelVideoFrameCallback=="function"?t.cancelVideoFrameCallback(this._frame):this._frameKind==="raf"&&cancelAnimationFrame(this._frame),this._frame=null}_tick(){if(this._frame=null,this._destroyed)return;const t=this.video,e=t.currentTime;if(this._mode==="stepped"&&this._target!=null)e+_>=this._target&&this._reachStop(this._pendingSeg);else if(this._mode==="continuous"){const s=j(this.cards,e);s!==this.layer.activeIndex&&(s===-1?(this.layer.hide(),this._emit("cardhide",{})):(this.layer.show(s),this._emit("segmententer",{index:s,segment:this.cards[s]}),this._emit("cardshow",{index:s,segment:this.cards[s]})))}this._updateUi(),!t.paused&&!this._destroyed?this._scheduleTick():this._looping=!1}_advance(){if(!this._ready)return;const t=this.video.currentTime;if(this.layer.activeIndex>=0){const s=this.layer.activeIndex;this.layer.hide(),this._emit("segmentexit",{index:s}),this._emit("cardhide",{index:s})}this._showHint(!1);const e=this._stepIndex+1<this.cards.length?this._stepIndex+1:-1;if(e===-1)this._target=null,this._pendingSeg=-1,this._playingToEnd=!0,this._playNative();else{const s=this.cards[e].start;this._playingToEnd=!1,this.opts.easing!=="linear"&&b[this.opts.easing]?this._travelEased(t,s,e):(this._target=s,this._pendingSeg=e,this._playNative())}this._emit("play",{})}_playNative(){this._cancelEase();const t=this.video.play();this._startLoop(),t&&typeof t.catch=="function"&&t.catch(e=>this._emit("error",{error:e,phase:"play"}))}_travelEased(t,e,s){this._cancelEase(),this.video.pause();const n=b[this.opts.easing]||b.linear,r=this.video.playbackRate||1,a=Math.max(0,e-t)/r*1e3,o=this.video.muted;this.video.muted=!0;const d=typeof performance<"u"?performance.now():Date.now(),l={segIndex:s,wasMuted:o,raf:0};this._ease=l;const h=()=>{if(this._destroyed||this._ease!==l)return;const f=typeof performance<"u"?performance.now():Date.now(),u=a<=0?1:Math.min(1,(f-d)/a);this.video.currentTime=t+(e-t)*n(u),this._updateUi(),u>=1?(this.video.muted=o,this._ease=null,this._reachStop(s)):l.raf=requestAnimationFrame(h)};l.raf=requestAnimationFrame(h)}_cancelEase(){this._ease&&(cancelAnimationFrame(this._ease.raf),this._ease.wasMuted!=null&&(this.video.muted=this._ease.wasMuted),this._ease=null)}_reachStop(t){this.video.pause(),t>=0&&this.cards[t]&&(this._stepIndex=t,this.video.currentTime=this.cards[t].start,this.layer.show(t),this._emit("segmententer",{index:t,segment:this.cards[t]}),this._emit("cardshow",{index:t,segment:this.cards[t]})),this._target=null,this._pendingSeg=-1,this._showHint(!0),this._emit("stop",{index:t}),this._updateUi()}play(){this._mode==="stepped"?this._advance():this._playNative()}pause(){this._cancelEase(),this._target=null,this._pendingSeg=-1,this.video.pause(),this._emit("pause",{})}toggle(){this._mode==="stepped"?!this.video.paused||this._ease?this.pause():this._advance():this.video.paused?this._playNative():this.pause()}next(){if(this._mode==="stepped")this._advance();else{const t=V(this.cards,this.video.currentTime);t>=0&&this.seekTo(this.cards[t].start)}}prev(){if(this._mode==="stepped"){const e=(this._stepIndex>=0?this._stepIndex:this.cards.length)-1;this.goToSegment(Math.max(0,e));return}const t=q(this.cards,this.video.currentTime);this.goToSegment(t>=0?t:0)}seekTo(t){this._cancelEase(),this._target=null,this.video.currentTime=Math.max(0,t),this._updateUi()}goToSegment(t){this.cards[t]&&(this._cancelEase(),this._target=null,this._pendingSeg=-1,this._stepIndex=t,this.video.pause(),this.video.currentTime=this.cards[t].start,this.layer.show(t),this._showHint(this._mode==="stepped"),this._emit("segmententer",{index:t,segment:this.cards[t]}),this._emit("cardshow",{index:t,segment:this.cards[t]}),this._updateUi())}showCard(t){this.cards[t]&&(this.layer.show(t),this._emit("cardshow",{index:t,segment:this.cards[t]}))}hideCard(){this.layer.hide(),this._emit("cardhide",{})}getSegments(){return this.segments}setMode(t){const e=t==="stepped"?"stepped":"continuous";e!==this._mode&&(this._mode=e,this.root.dataset.mode=e,this._cancelEase(),this._target=null,this._stepIndex=this.layer.activeIndex>=0?this.layer.activeIndex:g(this.cards,this.video.currentTime),this.video.loop=!!this.opts.loop&&e!=="stepped",this.video.pause(),this.layer.hide(),this._showHint(e==="stepped"),this._emit("modechange",{mode:e}))}setEasing(t){b[t]&&(this.opts.easing=t)}destroy(){this._destroyed=!0,this._stopLoop(),this._cancelEase(),this._ac.abort();try{this.video.pause()}catch{}this.layer.clear();for(const t of[this.tap,this.cardsLayer,this.hint,this._controlsBar])t?.remove();this._emit("destroy",{})}_handleEnded(){this._playingToEnd=!1,this._stopLoop(),this.layer.hide(),this._emit("ended",{}),this._reflect()}_toggleMute(){this.video.muted=!this.video.muted,this._muteBtn&&(this._muteBtn.textContent=this.video.muted?c.muted:c.mute)}_toggleFullscreen(){const t=this.root;this.doc.fullscreenElement?this.doc.exitFullscreen?.():t.requestFullscreen?.()}_showHint(t){this.hint&&this.hint.classList.toggle("vexy-vlip__hint--show",!!t)}_reflect(){const t=this.video.paused;this.root.dataset.paused=String(t),this._playBtn&&(this._playBtn.textContent=t?c.play:c.pause),t||this._startLoop()}_updateUi(){if(this._reflect(),this._time&&(this._time.textContent=`${C(this.video.currentTime)} / ${C(this.video.duration)}`),this._dots){const t=this.layer.activeIndex>=0?this.layer.activeIndex:g(this.cards,this.video.currentTime),e=this._dots.children;for(let s=0;s<e.length;s++)e[s].classList.toggle("vexy-vlip__dot--active",s===t)}}_emit(t,e){const s=new CustomEvent(`vexyvlip:${t}`,{detail:e,bubbles:!0,composed:!0});this.root.dispatchEvent(s);const n=this.opts[`on${t[0].toUpperCase()}${t.slice(1)}`];typeof n=="function"&&n(e,this)}get segments(){return this.cards.map(t=>typeof structuredClone=="function"?structuredClone(t):JSON.parse(JSON.stringify(t)))}get currentSegment(){return this.layer.activeIndex>=0?this.layer.activeIndex:g(this.cards,this.video.currentTime)}get currentTime(){return this.video.currentTime}get duration(){return this.video.duration}get mode(){return this._mode}get playing(){return!this.video.paused||!!this._ease}get ready(){return this._ready}}function C(i){if(!Number.isFinite(i))return"0:00";const t=Math.floor(i/60),e=Math.floor(i%60);return`${t}:${String(e).padStart(2,"0")}`}function Q(i){const t=document.createElement("div");return t.innerHTML=i,t.querySelectorAll("script, style, iframe, object, embed").forEach(e=>e.remove()),t.querySelectorAll("*").forEach(e=>{[...e.attributes].forEach(s=>{(/^on/i.test(s.name)||/^(href|src)$/i.test(s.name)&&/^\s*javascript:/i.test(s.value))&&e.removeAttribute(s.name)})}),t.innerHTML}const Z="0.0.0";function p(i,t,e){if(!i.hasAttribute(t))return e;const s=i.getAttribute(t);return s!=="false"&&s!=="0"}function T(i){return{src:i.getAttribute("src")||"",track:i.getAttribute("track")||"",vtt:i.getAttribute("vtt")||"",mode:i.getAttribute("mode")||"continuous",easing:i.getAttribute("easing")||"linear",poster:i.getAttribute("poster")||"",startAt:i.hasAttribute("start-at")?Number(i.getAttribute("start-at")):0,startSegment:i.hasAttribute("start-segment")?Number(i.getAttribute("start-segment")):null,autoplay:p(i,"autoplay",!1),loop:p(i,"loop",!1),muted:p(i,"muted",!1),controls:p(i,"controls",!0),keyboard:p(i,"keyboard",!0),hint:p(i,"hint",!0),sanitize:p(i,"sanitize",!1),injectStyles:!1}}class A extends HTMLElement{static get observedAttributes(){return["src","track","vtt","mode","easing","poster","muted","loop","controls"]}constructor(){super(),this._shadow=this.attachShadow({mode:"open"});const t=document.createElement("style");t.textContent=J(),this._shadow.appendChild(t),this._mount=document.createElement("div"),this._shadow.appendChild(this._mount)}connectedCallback(){if(this._vlip)return;const t=this.querySelector("video");t&&this._mount.appendChild(t),this._vlip=new v(t||this._mount,T(this))}disconnectedCallback(){this._vlip?.destroy(),this._vlip=null}attributeChangedCallback(t,e,s){if(!(!this._vlip||e===s))switch(t){case"mode":this._vlip.setMode(s);break;case"easing":this._vlip.setEasing(s);break;case"muted":this._vlip.video.muted=p(this,"muted",!1);break;case"loop":this._vlip.video.loop=p(this,"loop",!1)&&this._vlip.mode!=="stepped";break;case"poster":this._vlip.video.poster=s||"";break;case"controls":case"src":case"track":case"vtt":this._rebuild();break}}_rebuild(){this._vlip?.destroy(),this._mount.replaceChildren(),this._vlip=new v(this._mount,T(this))}play(){return this._vlip?.play()}pause(){return this._vlip?.pause()}toggle(){return this._vlip?.toggle()}next(){return this._vlip?.next()}prev(){return this._vlip?.prev()}seekTo(t){return this._vlip?.seekTo(t)}goToSegment(t){return this._vlip?.goToSegment(t)}showCard(t){return this._vlip?.showCard(t)}hideCard(){return this._vlip?.hideCard()}getSegments(){return this._vlip?.getSegments()??[]}setMode(t){this.setAttribute("mode",t)}setEasing(t){this.setAttribute("easing",t)}destroy(){this._vlip?.destroy()}get player(){return this._vlip}get segments(){return this._vlip?.segments??[]}get currentSegment(){return this._vlip?.currentSegment??-1}get currentTime(){return this._vlip?.currentTime??0}get duration(){return this._vlip?.duration??0}get mode(){return this._vlip?.mode??"continuous"}get playing(){return this._vlip?.playing??!1}get ready(){return this._vlip?.ready??!1}}return typeof customElements<"u"&&!customElements.get("vexy-vlip")&&customElements.define("vexy-vlip",A),v.Element=A,v.version=Z,v})();
//# sourceMappingURL=vexy-vlip.global.js.map
