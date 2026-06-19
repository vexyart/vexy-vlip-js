var VexyVlip=(function(){"use strict";function B(i){if(typeof i!="string")return NaN;const t=i.trim().match(/^(?:(\d+):)?(\d{1,2}):(\d{2})(?:[.,](\d{1,3}))?$/);if(!t)return NaN;const[,e,s,r,a]=t;return(e?Number(e):0)*3600+Number(s)*60+Number(r)+(a?Number(a.padEnd(3,"0"))/1e3:0)}function W(i){const t={};if(!i)return t;for(const e of i.trim().split(/\s+/)){const s=e.indexOf(":");if(s<=0)continue;const r=e.slice(0,s),a=e.slice(s+1);["position","line","size","align","vertical","region"].includes(r)&&(t[r]=a)}return t}const P=/^(\d{1,2}:)?\d{1,2}:\d{2}[.,]\d{1,3}\s*-->\s*(\d{1,2}:)?\d{1,2}:\d{2}[.,]\d{1,3}/;function j(i){const t=[];if(typeof i!="string")return t;const s=i.replace(/^﻿/,"").replace(/\r\n?/g,`
`).split(/\n\n+/);let r=0;for(const a of s){const n=a.split(`
`).filter(b=>b.length>0);if(n.length===0)continue;let o=0;if(/^WEBVTT/.test(n[0])&&r===0&&!P.test(n[0])){if(n.length===1)continue;o=1}if(/^(NOTE|STYLE|REGION)\b/.test(n[o]))continue;let d="";n[o]&&!n[o].includes("-->")&&(d=n[o],o+=1);const l=n[o];if(!l||!l.includes("-->"))continue;const h=l.indexOf("-->"),c=B(l.slice(0,h)),v=l.slice(h+3).trim(),u=v.indexOf(" "),_=u===-1?v:v.slice(0,u),w=u===-1?"":v.slice(u+1),y=B(_);if(Number.isNaN(c)||Number.isNaN(y))continue;const m=n.slice(o+1).join(`
`);t.push({index:r++,id:d,start:c,end:y,settings:W(w),payload:m})}return t}const D={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};function V(i){return String(i).replace(/[&<>"']/g,t=>D[t])}function k(i){let t=V(i);return t=t.replace(/`([^`]+)`/g,"<code>$1</code>"),t=t.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>"),t=t.replace(new RegExp("(?<!\\*)\\*([^*\\n]+)\\*(?!\\*)","g"),"<em>$1</em>"),t=t.replace(/~~([^~]+)~~/g,"<del>$1</del>"),t=t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,(e,s,r)=>`<a href="${/^\s*(javascript|data|vbscript):/i.test(r)?"#":r}">${s}</a>`),t=t.replace(/\n/g,"<br>"),t}function q(i){return/^#{1,6}\s/.test(i)||/^\s*[-*+]\s+/.test(i)||/^\s*\d+\.\s+/.test(i)||/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(i.trim())}function $(i){const e=String(i).replace(/\r\n?/g,`
`).split(`
`);if(e.length===1&&!q(e[0]))return k(e[0]);const s=[];let r=[],a=null;const n=()=>{r.length&&s.push(`<p>${k(r.join(`
`))}</p>`),r=[]},o=()=>{if(a){const d=a.items.map(l=>`<li>${k(l)}</li>`).join("");s.push(`<${a.tag}>${d}</${a.tag}>`)}a=null};for(const d of e){if(/^\s*$/.test(d)){n(),o();continue}const l=/^(#{1,6})\s+(.*)$/.exec(d);if(l){n(),o(),s.push(`<h${l[1].length}>${k(l[2])}</h${l[1].length}>`);continue}if(/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(d)){n(),o(),s.push("<hr>");continue}const h=/^\s*[-*+]\s+(.*)$/.exec(d);if(h){n(),(!a||a.tag!=="ul")&&(o(),a={tag:"ul",items:[]}),a.items.push(h[1]);continue}const c=/^\s*\d+\.\s+(.*)$/.exec(d);if(c){n(),(!a||a.tag!=="ol")&&(o(),a={tag:"ol",items:[]}),a.items.push(c[1]);continue}o(),r.push(d)}return n(),o(),s.join("")}const U=new Set(["center","top","bottom","left","right","top-left","top-right","bottom-left","bottom-right"]);function T(i){return typeof i=="number"?i:typeof i=="string"?parseFloat(i.replace("%","")):NaN}function Y(i,t){const e=i||(t==="end"?"line-right":t==="center"?"center":"line-left");return e==="line-left"?"left":e==="line-right"?"right":"center"}function K(i){return i==="end"?"bottom":i==="center"?"center":"top"}function J(i,t){return i==="center"&&t==="center"?"center":i==="center"?t:t==="center"?i:`${t}-${i}`}function G(i){const t=(i||"").trim();if(!t.startsWith("{"))return null;try{const e=JSON.parse(t);return e&&typeof e=="object"?e:null}catch{return null}}function X(i,t={}){const e=G(i.payload),s=i.settings||{};let r,a;e&&typeof e.html=="string"?(r=e.html,a=e.text||""):e&&typeof e.text=="string"?(a=e.text,r=$(e.text)):(a=i.payload,r=$(i.payload));const[n,o]=String(s.position??"").split(","),[d,l]=String(s.line??"").split(",");let h=e&&e.x!=null?e.x:T(n),c=e&&e.y!=null?e.y:T(d),v=e&&e.w!=null?e.w:T(s.size),u=e&&e.anchor,_=e&&e.align||s.align||"start";_==="left"&&(_="start"),_==="right"&&(_="end");const w=h!=null&&h!==""&&!(typeof h=="number"&&Number.isNaN(h)),y=c!=null&&c!==""&&!(typeof c=="number"&&Number.isNaN(c)),m=v!=null&&v!==""&&!(typeof v=="number"&&Number.isNaN(v));if(!u||!U.has(u))if(!e&&(s.position!=null||s.line!=null)){const b=Y(o,_),L=s.line!=null?K(l):"bottom";u=J(b,L)}else u="bottom";return w||(h=50),y||(c=88),{index:i.index,id:i.id,start:i.start,end:i.end,text:a,html:r,isHtml:!!(e&&typeof e.html=="string"),placement:{x:h,y:c,w:m?v:null,anchor:u,align:_},style:{bg:e?e.bg:void 0,fg:e&&e.fg,font:e&&e.font,padding:e&&e.padding,radius:e&&e.radius,border:e&&e.border,shadow:e&&e.shadow,opacity:e&&e.opacity},className:e&&e.class||"",enter:e&&e.enter||t.enter||"fade",exit:e&&e.exit||t.exit||"fade"}}function Q(i,t={}){return j(i).map(e=>X(e,t))}const g=.02;function Z(i){return i.map((t,e)=>({index:e,time:t.start,end:t.end})).sort((t,e)=>t.time-e.time)}function tt(i,t){for(let e=0;e<i.length;e++)if(t>=i[e].start-g&&t<i[e].end-g)return e;return-1}function et(i,t,e=g){let s=-1,r=1/0;for(let a=0;a<i.length;a++){const n=i[a].start;n>t+e&&n<r&&(r=n,s=a)}return s}function it(i,t,e=g){let s=-1,r=-1/0;for(let a=0;a<i.length;a++){const n=i[a].start;n<t-e&&n>r&&(r=n,s=a)}return s}function C(i,t,e=g){let s=-1,r=-1/0;for(let a=0;a<i.length;a++){const n=i[a].start;n<=t+e&&n>r&&(r=n,s=a)}return s}const E={center:"translate(-50%, -50%)",top:"translate(-50%, 0)",bottom:"translate(-50%, -100%)",left:"translate(0, -50%)",right:"translate(-100%, -50%)","top-left":"translate(0, 0)","top-right":"translate(-100%, 0)","bottom-left":"translate(0, -100%)","bottom-right":"translate(-100%, -100%)"},M={center:"50% 50%",top:"50% 0",bottom:"50% 100%",left:"0 50%",right:"100% 50%","top-left":"0 0","top-right":"100% 0","bottom-left":"0 100%","bottom-right":"100% 100%"};function S(i,t="%"){return i==null?null:typeof i=="number"?`${i}${t}`:String(i)}function I(i){const t=typeof i=="number"?i:parseFloat(i);return Number.isFinite(t)?Math.max(0,Math.min(100,t)):50}function st(i,t){i.style.left=S(t.x),i.style.top=S(t.y),i.style.transformOrigin=M[t.anchor]||M.bottom,i.style.transform=E[t.anchor]||E.bottom,t.w!=null?i.style.width=S(t.w):i.style.width=""}function rt(i,t){if(i==null)return;if(t==null||t>=1)return i;const e=Math.max(0,Math.min(1,Number(t))),s=/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(i.trim());if(s){let a=s[1];a.length===3&&(a=a.split("").map(l=>l+l).join(""));const n=parseInt(a.slice(0,2),16),o=parseInt(a.slice(2,4),16),d=parseInt(a.slice(4,6),16);return`rgba(${n}, ${o}, ${d}, ${e})`}const r=/^rgba?\(([^)]+)\)$/i.exec(i.trim());if(r){const a=r[1].split(",").map(n=>n.trim()).slice(0,3);if(a.length===3)return`rgba(${a.join(", ")}, ${e})`}return i}function at(i,t,e){if(!t)return;t.fg&&(i.style.color=t.fg),t.font&&(i.style.font=t.font),t.padding&&(i.style.padding=t.padding),t.radius!=null&&(i.style.borderRadius=S(t.radius,"px")),t.border&&(i.style.border=t.border),t.shadow&&(i.style.boxShadow=t.shadow);const s=rt(t.bg,t.opacity);s&&(i.style.background=s),e&&(i.style.textAlign=e)}function nt(i,t,e){const s=i.createElement("div");if(s.className="vexy-vlip__cardnav",e.counter!==!1){const n=i.createElement("span");n.className="vexy-vlip__counter",n.textContent=`${t.index+1}/${e.total}`,s.appendChild(n)}const r=i.createElement("span");if(r.className="vexy-vlip__navspacer",s.appendChild(r),e.back){const n=i.createElement("button");n.type="button",n.className="vexy-vlip__prev",n.textContent=e.prevLabel??"←",n.setAttribute("aria-label","Previous step"),s.appendChild(n)}const a=i.createElement("button");return a.type="button",a.className="vexy-vlip__next",a.textContent=e.nextLabel??"Next →",s.appendChild(a),s}function ot(i,t,e={}){const s=i.createElement("div");s.className="vexy-vlip__card",s.dataset.index=String(t.index),s.dataset.enter=t.enter||"fade",s.setAttribute("role","note"),t.className&&(s.className+=" "+t.className);const r=i.createElement("div");r.className="vexy-vlip__body";let a=t.html;if(t.isHtml&&typeof e.sanitize=="function"&&(a=e.sanitize(a)),r.innerHTML=a,e.close){s.classList.add("vexy-vlip__card--closable");const n=i.createElement("button");n.type="button",n.className="vexy-vlip__close",n.setAttribute("aria-label","Close cards"),n.textContent="✕",r.appendChild(n)}return e.nav&&e.nav.enabled&&r.appendChild(nt(i,t,e.nav)),st(s,t.placement),at(r,t.style,t.placement.align),s.appendChild(r),s}class lt{constructor(t,e={}){this.layer=t,this.doc=t.ownerDocument,this.opts=e,this.fit=e.fit||{enabled:!1},this.cards=[],this.els=new Map,this.activeIndex=-1;const s=this.doc.defaultView&&this.doc.defaultView.ResizeObserver;this.fit.enabled&&s&&(this._ro=new s(()=>this.refit()),this._ro.observe(this.layer))}setCards(t){this.clear(),this.cards=t}clear(){this.layer.replaceChildren(),this.els.clear(),this.activeIndex=-1}_ensure(t){let e=this.els.get(t);if(!e){const s=this.opts.nav?{...this.opts.nav,total:this.cards.length}:void 0;e=ot(this.doc,this.cards[t],{...this.opts,nav:s}),this.els.set(t,e),this.layer.appendChild(e)}return e}_fit(t,e){if(!this.fit.enabled)return;const s=this.layer.clientWidth,r=this.layer.clientHeight;if(!s||!r)return;const a=e.placement,n=a.anchor,o=E[n]||E.bottom,d=this.fit.margin??14,l=I(a.x)/100*s,h=I(a.y)/100*r,c=n==="left"||n.endsWith("-left")?"left":n==="right"||n.endsWith("-right")?"right":"center",v=n==="top"||n.startsWith("top")?"top":n==="bottom"||n.startsWith("bottom")?"bottom":"middle",u=Math.max(80,c==="left"?s-l-d:c==="right"?l-d:2*Math.min(l,s-l)-2*d),_=Math.max(48,v==="top"?r-h-d:v==="bottom"?h-d:2*Math.min(h,r-h)-2*d);if(t.style.transform=o,a.w==null){const L=this.fit.maxWidthPct?this.fit.maxWidthPct/100*s:u,vt=Math.round(Math.min(u,L));t.style.width="max-content",t.style.maxWidth=`${vt}px`}const w=Math.max(t.offsetWidth,t.scrollWidth),y=Math.max(t.offsetHeight,t.scrollHeight);let m=Math.min(1,u/w,_/y);const b=this.fit.minScale??.4;m<b&&(m=b),t.style.transform=m<1?`${o} scale(${Math.round(m*1e3)/1e3})`:o}refit(){if(this.activeIndex<0)return;const t=this.els.get(this.activeIndex);t&&this._fit(t,this.cards[this.activeIndex])}show(t){if(t===this.activeIndex||(this.hide(),t<0||t>=this.cards.length))return!1;const e=this._ensure(t);return this._fit(e,this.cards[t]),e.offsetWidth,e.classList.add("vexy-vlip__card--in"),this.activeIndex=t,!0}hide(){if(this.activeIndex<0)return!1;const t=this.els.get(this.activeIndex);return t&&t.classList.remove("vexy-vlip__card--in"),this.activeIndex=-1,!0}}const F="vexy-vlip-styles",z=`
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
`;function dt(){return`:host{display:inline-block;position:relative;max-width:100%}:host([hidden]){display:none}${z}`}function ht(i){if(!i||i.getElementById(F))return;const t=i.createElement("style");t.id=F,t.textContent=z,i.head.appendChild(t)}const N={linear:i=>i,"ease-in":i=>i*i,"ease-out":i=>1-(1-i)*(1-i),"ease-in-out":i=>i*i*(3-2*i)},A={src:"",track:"",vtt:"",mode:"continuous",easing:"linear",controls:!0,autoplay:!1,loop:!1,muted:!1,poster:"",startAt:0,startSegment:null,keyboard:!0,sanitize:!1,overlay:!0,nav:!0,back:!1,counter:!1,dots:!0,closable:!0,nextLabel:"Next →",prevLabel:"←",startLabel:"Start →",replayLabel:"Replay ↻",title:"",titleBar:!0,autoFit:!0,minScale:.4,maxWidth:72,cardBg:"",cardFg:"",nextBg:"",nextFg:"",nextBorder:"",startBg:"",startFg:"",font:"",dim:"",titleColor:"",titleBg:"",titleSize:"",injectStyles:!0},f={play:"▶",pause:"❚❚",prev:"⏮",next:"⏭",mute:"🔊",muted:"🔇",fs:"⤢"};class x{constructor(t,e={}){if(!t||!t.ownerDocument)throw new TypeError("VexyVlip: a target element is required");this.opts={...A,...e},this.doc=t.ownerDocument,this.cards=[],this.stops=[],this._destroyed=!1,this._ready=!1,this._started=!1,this._target=null,this._pendingSeg=-1,this._stepIndex=-1,this._playingToEnd=!1,this._ease=null,this._looping=!1,this._frame=null,this._mode=this.opts.mode==="stepped"?"stepped":"continuous",this._ac=new AbortController,this._buildDom(t),this.opts.injectStyles&&!this._inShadow&&ht(this.doc),this._wireEvents(),this._loadMedia()}_buildDom(t){const e=this.doc;if(t.tagName==="VIDEO"){this.video=t;const a=e.createElement("div");t.replaceWith(a),a.appendChild(t),this.root=a}else this.root=t,this.video=e.createElement("video"),this.root.appendChild(this.video);this._inShadow=this.root.getRootNode()instanceof ShadowRoot,this.root.classList.add("vexy-vlip"),this.root.dataset.mode=this._mode,this.root.tabIndex=this.root.tabIndex>=0?this.root.tabIndex:0,this._applyTheme();const s=this.video;s.classList.add("vexy-vlip__video"),s.playsInline=!0,s.preload="metadata",this.opts.src&&(s.src=this.opts.src),this.opts.poster&&(s.poster=this.opts.poster),s.loop=!!this.opts.loop&&this._mode!=="stepped",s.muted=!!this.opts.muted,s.controls=!1,this.tap=e.createElement("button"),this.tap.className="vexy-vlip__tap",this.tap.type="button",this.tap.setAttribute("aria-label","Advance to the next step"),this.root.appendChild(this.tap),this.opts.overlay&&(this.overlay=e.createElement("div"),this.overlay.className="vexy-vlip__overlay",this.overlay.setAttribute("aria-hidden","true"),this.root.appendChild(this.overlay)),this.root.dataset.overlay="false",this.cardsLayer=e.createElement("div"),this.cardsLayer.className="vexy-vlip__cards",this.cardsLayer.setAttribute("aria-live","polite"),this.root.appendChild(this.cardsLayer),this.layer=new lt(this.cardsLayer,{sanitize:this.opts.sanitize?ct:void 0,close:!!this.opts.closable,nav:{enabled:!!this.opts.nav,counter:this.opts.counter!==!1,back:!!this.opts.back,nextLabel:this.opts.nextLabel,prevLabel:this.opts.prevLabel},fit:{enabled:this.opts.autoFit!==!1,minScale:Number(this.opts.minScale)||.4,maxWidthPct:Number(this.opts.maxWidth)||72}}),this.opts.controls&&this._buildControls(),this.root.dataset.titled=this.opts.title?"true":"false",this.cta=e.createElement("div"),this.cta.className="vexy-vlip__cta";const r=e.createElement("div");if(r.className="vexy-vlip__cta-panel",this.opts.title){const a=e.createElement("div");a.className="vexy-vlip__cta-title",a.textContent=this.opts.title,a.setAttribute("role","heading"),a.setAttribute("aria-level","2"),r.appendChild(a)}this.startBtn=e.createElement("button"),this.startBtn.className="vexy-vlip__start",this.startBtn.type="button",this.startBtn.textContent=this.opts.startLabel??A.startLabel,r.appendChild(this.startBtn),this.cta.appendChild(r),this.root.appendChild(this.cta),this.root.dataset.cta="",this.root.dataset.started="false",this.opts.title&&this.opts.titleBar&&(this.titleBar=e.createElement("div"),this.titleBar.className="vexy-vlip__titlebar",this.titleBar.textContent=this.opts.title,this.titleBar.setAttribute("aria-hidden","true"),this.root.appendChild(this.titleBar))}_applyTheme(){const t=(s,r)=>{r!=null&&r!==""&&this.root.style.setProperty(s,String(r))};t("--vv-card-bg",this.opts.cardBg),t("--vv-card-bg-stepped",this.opts.cardBg),t("--vv-card-fg",this.opts.cardFg),t("--vv-next-bg",this.opts.nextBg),t("--vv-next-fg",this.opts.nextFg),t("--vv-next-border",this.opts.nextBorder),t("--vv-start-bg",this.opts.startBg),t("--vv-start-fg",this.opts.startFg),t("--vv-card-font",this.opts.font),t("--vv-title-fg",this.opts.titleColor),t("--vv-title-bg",this.opts.titleBg),t("--vv-title-size",this.opts.titleSize),this.opts.maxWidth&&t("--vv-card-max-width",`${Number(this.opts.maxWidth)}%`);const e=this.opts.dim;if(e!=null&&e!==""){const s=Number(e);t("--vv-overlay-bg",Number.isFinite(s)&&s>=0&&s<=1?`rgba(0, 0, 0, ${s})`:e)}}_buildControls(){const t=this.doc,e=t.createElement("div");e.className="vexy-vlip__controls";const s=(a,n)=>{const o=t.createElement("button");return o.className="vexy-vlip__btn",o.type="button",o.textContent=a,o.setAttribute("aria-label",n),o};this._playBtn=s(f.play,"Play"),this._prevBtn=s(f.prev,"Previous step"),this._nextBtn=s(f.next,"Next step"),this._dots=t.createElement("div"),this._dots.className="vexy-vlip__dots",this._time=t.createElement("span"),this._time.className="vexy-vlip__time",this._muteBtn=s(this.opts.muted?f.muted:f.mute,"Mute"),this._fsBtn=s(f.fs,"Fullscreen"),e.append(this._prevBtn,this._playBtn,this._nextBtn,this._dots,this._time,this._muteBtn,this._fsBtn),this._controlsBar=e,this.root.appendChild(e);const r={signal:this._ac.signal};this._playBtn.addEventListener("click",()=>this.toggle(),r),this._prevBtn.addEventListener("click",()=>this.prev(),r),this._nextBtn.addEventListener("click",()=>this.next(),r),this._muteBtn.addEventListener("click",()=>this._toggleMute(),r),this._fsBtn.addEventListener("click",()=>this._toggleFullscreen(),r)}_buildDots(){!this._dots||!this.opts.dots||(this._dots.replaceChildren(),this.cards.forEach((t,e)=>{const s=this.doc.createElement("button");s.className="vexy-vlip__dot",s.type="button",s.setAttribute("aria-label",`Step ${e+1}`),s.addEventListener("click",()=>this.goToSegment(e),{signal:this._ac.signal}),this._dots.appendChild(s)}))}_wireEvents(){const t=this.video,e={signal:this._ac.signal};t.addEventListener("loadedmetadata",()=>this._onMeta(),e),t.addEventListener("ended",()=>this._handleEnded(),e),t.addEventListener("play",()=>this._reflect(),e),t.addEventListener("pause",()=>this._reflect(),e),t.addEventListener("seeked",()=>this._updateUi(),e),this.startBtn.addEventListener("click",s=>{s.preventDefault(),this._onCta()},e),this.tap.addEventListener("click",s=>{this.toggle(),s.preventDefault()},e),this.cardsLayer.addEventListener("click",s=>{const r=s.target;if(r&&r.closest(".vexy-vlip__close")){s.preventDefault(),this.close();return}if(r&&r.closest(".vexy-vlip__next")){s.preventDefault(),this.next();return}if(r&&r.closest(".vexy-vlip__prev")){s.preventDefault(),this.prev();return}r&&(r.closest("a")||r.closest("button:not(.vexy-vlip__tap)"))||this._mode==="stepped"&&this.toggle()},e),this.opts.keyboard&&this.root.addEventListener("keydown",s=>this._handleKey(s),e)}_handleKey(t){switch(t.key){case" ":case"Enter":this.toggle(),t.preventDefault();break;case"ArrowRight":this.next(),t.preventDefault();break;case"ArrowLeft":this.prev(),t.preventDefault();break;case"f":this._toggleFullscreen();break;case"m":this._toggleMute();break}}async _loadMedia(){let t=this.opts.vtt;if(!t&&this.opts.track)try{const e=await fetch(this.opts.track);if(!e.ok)throw new Error(`HTTP ${e.status}`);t=await e.text()}catch(e){this._emit("error",{error:e,phase:"track"});return}this._destroyed||(t&&(this.cards=Q(t,{enter:"fade"}),this.stops=Z(this.cards),this.layer.setCards(this.cards),this._buildDots()),this._cardsReady=!0,this._maybeReady())}_onMeta(){this._metaReady=!0,this._maybeReady()}_maybeReady(){if(this._ready||this._destroyed||!this._metaReady||!this._cardsReady)return;this._ready=!0;const t=this.opts.startSegment;t!=null&&this.cards[t]?(this._stepIndex=t,this.video.currentTime=this.cards[t].start,this._mode==="stepped"&&this.layer.show(t)):this.opts.startAt&&(this.video.currentTime=this.opts.startAt,this._stepIndex=C(this.cards,this.opts.startAt)),this._updateUi(),this._emit("ready",{segments:this.cards.length}),this._mode==="continuous"&&this.opts.autoplay?(this._started=!0,this.root.dataset.started="true",this.play()):t!=null&&this.cards[t]?(this._started=!0,this.root.dataset.started="true",this._showHint(this._mode==="stepped")):(this._primeFirstFrame(),this._showCta("start"))}_primeFirstFrame(){const t=this.video;this._started||this.opts.autoplay||this.opts.startAt||this.opts.startSegment!=null||t.currentTime>.01||(this._seekToPaint(.042),t.addEventListener("loadeddata",()=>{!this._started&&t.currentTime<.05&&this._seekToPaint(.042)},{once:!0,signal:this._ac.signal}))}_seekToPaint(t){const e=this.video;if(this._destroyed)return;const s=Number.isFinite(e.duration)?e.duration:0,r=s>0?Math.min(t,Math.max(0,s-.01)):t;try{e.currentTime=r}catch{}if(typeof e.requestVideoFrameCallback=="function")try{e.requestVideoFrameCallback(()=>{})}catch{}}_startLoop(){this._looping||(this._looping=!0,this._scheduleTick())}_scheduleTick(){if(this._destroyed||this._frame!=null)return;const t=this.video,e=()=>this._tick();typeof t.requestVideoFrameCallback=="function"?(this._frame=t.requestVideoFrameCallback(e),this._frameKind="rvfc"):(this._frame=requestAnimationFrame(e),this._frameKind="raf")}_stopLoop(){if(this._looping=!1,this._frame==null)return;const t=this.video;this._frameKind==="rvfc"&&typeof t.cancelVideoFrameCallback=="function"?t.cancelVideoFrameCallback(this._frame):this._frameKind==="raf"&&cancelAnimationFrame(this._frame),this._frame=null}_tick(){if(this._frame=null,this._destroyed)return;const t=this.video,e=t.currentTime;if(this._mode==="stepped"&&this._target!=null)e+g>=this._target&&this._reachStop(this._pendingSeg);else if(this._mode==="continuous"){const s=tt(this.cards,e);s!==this.layer.activeIndex&&(s===-1?(this.layer.hide(),this._emit("cardhide",{})):(this.layer.show(s),this._emit("segmententer",{index:s,segment:this.cards[s]}),this._emit("cardshow",{index:s,segment:this.cards[s]})))}this._updateUi(),!t.paused&&!this._destroyed?this._scheduleTick():this._looping=!1}_advance(){if(!this._ready)return;const t=this.video.currentTime;if(this.layer.activeIndex>=0){const s=this.layer.activeIndex;this.layer.hide(),this._emit("segmentexit",{index:s}),this._emit("cardhide",{index:s})}this._showHint(!1);const e=this._stepIndex+1<this.cards.length?this._stepIndex+1:-1;if(e===-1)this._target=null,this._pendingSeg=-1,this._playingToEnd=!0,this._playNative();else{const s=this.cards[e].start;this._playingToEnd=!1,this.opts.easing!=="linear"&&N[this.opts.easing]?this._travelEased(t,s,e):(this._target=s,this._pendingSeg=e,this._playNative())}this._emit("play",{})}_playNative(){this._cancelEase();const t=this.video.play();this._startLoop(),t&&typeof t.catch=="function"&&t.catch(e=>this._emit("error",{error:e,phase:"play"}))}_travelEased(t,e,s){this._cancelEase(),this.video.pause();const r=N[this.opts.easing]||N.linear,a=this.video.playbackRate||1,n=Math.max(0,e-t)/a*1e3,o=this.video.muted;this.video.muted=!0;const d=typeof performance<"u"?performance.now():Date.now(),l={segIndex:s,wasMuted:o,raf:0};this._ease=l;const h=()=>{if(this._destroyed||this._ease!==l)return;const c=typeof performance<"u"?performance.now():Date.now(),v=n<=0?1:Math.min(1,(c-d)/n);this.video.currentTime=t+(e-t)*r(v),this._updateUi(),v>=1?(this.video.muted=o,this._ease=null,this._reachStop(s)):l.raf=requestAnimationFrame(h)};l.raf=requestAnimationFrame(h)}_cancelEase(){this._ease&&(cancelAnimationFrame(this._ease.raf),this._ease.wasMuted!=null&&(this.video.muted=this._ease.wasMuted),this._ease=null)}_reachStop(t){this.video.pause(),t>=0&&this.cards[t]&&(this._stepIndex=t,this.video.currentTime=this.cards[t].start,this.layer.show(t),this._emit("segmententer",{index:t,segment:this.cards[t]}),this._emit("cardshow",{index:t,segment:this.cards[t]})),this._target=null,this._pendingSeg=-1,this._showHint(!0),this._emit("stop",{index:t}),this._updateUi()}play(){if(this.root.dataset.cta&&this._ready){this._onCta();return}this._mode==="stepped"?this._advance():this._playNative()}pause(){this._cancelEase(),this._target=null,this._pendingSeg=-1,this.video.pause(),this._emit("pause",{})}toggle(){if(this.root.dataset.cta&&this._ready){this._onCta();return}this._mode==="stepped"?!this.video.paused||this._ease?this.pause():this._advance():this.video.paused?this._playNative():this.pause()}next(){if(this.root.dataset.cta&&this._ready){this._onCta();return}if(this._mode==="stepped")this._advance();else{const t=et(this.cards,this.video.currentTime);t>=0&&this.seekTo(this.cards[t].start)}}prev(){if(this._mode==="stepped"){const e=(this._stepIndex>=0?this._stepIndex:this.cards.length)-1;this.goToSegment(Math.max(0,e));return}const t=it(this.cards,this.video.currentTime);this.goToSegment(t>=0?t:0)}seekTo(t){this._cancelEase(),this._target=null,this.video.currentTime=Math.max(0,t),this._updateUi()}goToSegment(t){this.cards[t]&&(this._started=!0,this.root.dataset.started="true",this.root.dataset.cta="",this._cancelEase(),this._target=null,this._pendingSeg=-1,this._stepIndex=t,this.video.pause(),this.video.currentTime=this.cards[t].start,this.layer.show(t),this._showHint(this._mode==="stepped"),this._emit("segmententer",{index:t,segment:this.cards[t]}),this._emit("cardshow",{index:t,segment:this.cards[t]}),this._updateUi())}showCard(t){this.cards[t]&&(this.layer.show(t),this._emit("cardshow",{index:t,segment:this.cards[t]}))}hideCard(){this.layer.hide(),this._emit("cardhide",{})}getSegments(){return this.segments}setMode(t){const e=t==="stepped"?"stepped":"continuous";e!==this._mode&&(this._mode=e,this.root.dataset.mode=e,this._cancelEase(),this._target=null,this._stepIndex=this.layer.activeIndex>=0?this.layer.activeIndex:C(this.cards,this.video.currentTime),this.video.loop=!!this.opts.loop&&e!=="stepped",this.video.pause(),this.layer.hide(),e==="stepped"&&this._started&&this._stepIndex>=0&&this.cards[this._stepIndex]&&this.layer.show(this._stepIndex),this._showHint(e==="stepped"),this._emit("modechange",{mode:e}))}setEasing(t){N[t]&&(this.opts.easing=t)}_showCta(t){this.root.dataset.cta=t||"",this.startBtn&&(this.startBtn.textContent=t==="replay"?this.opts.replayLabel??A.replayLabel:this.opts.startLabel??A.startLabel,this.startBtn.setAttribute("aria-label",t==="replay"?"Replay":"Start")),t&&this._setOverlay(!0)}_onCta(){this.root.dataset.cta==="replay"?this._restart():this._begin()}_begin(){this._started||!this._ready||(this._started=!0,this.root.dataset.started="true",this._showCta(null),this._focusRoot(),this._mode==="stepped"?this._advance():(this._setOverlay(!1),this._playNative()))}_focusRoot(){if(this.opts.keyboard)try{this.root.focus({preventScroll:!0})}catch{try{this.root.focus()}catch{}}}_restart(){this._ready&&(this._cancelEase(),this._target=null,this._pendingSeg=-1,this._stepIndex=-1,this.layer.hide(),this.video.currentTime=0,this._started=!1,this._begin(),this._emit("replay",{}))}close(){this._mode==="stepped"&&(this.setMode("continuous"),this._setOverlay(!1),this._playNative(),this._emit("close",{}))}replay(){this._restart()}destroy(){this._destroyed=!0,this._stopLoop(),this._cancelEase(),this._ac.abort();try{this.video.pause()}catch{}this.layer.clear();for(const t of[this.tap,this.overlay,this.cardsLayer,this._controlsBar,this.cta,this.titleBar])t?.remove();this._emit("destroy",{})}_handleEnded(){this._playingToEnd=!1,this._stopLoop(),this.layer.hide(),this._emit("ended",{}),this._reflect(),this.video.loop||(this._seekToPaint(.042),this._showCta("replay"))}_toggleMute(){this.video.muted=!this.video.muted,this._muteBtn&&(this._muteBtn.textContent=this.video.muted?f.muted:f.mute)}_toggleFullscreen(){const t=this.root;this.doc.fullscreenElement?this.doc.exitFullscreen?.():t.requestFullscreen?.()}_showHint(t){this._setOverlay(this._mode==="stepped"&&!!t)}_setOverlay(t){this.root.dataset.overlay=t?"true":"false",t&&!this.video.paused&&this.video.pause()}_reflect(){const t=this.video.paused;this.root.dataset.paused=String(t),this._playBtn&&(this._playBtn.textContent=t?f.play:f.pause),t||this._startLoop()}_updateUi(){if(this._reflect(),this._time&&(this._time.textContent=`${R(this.video.currentTime)} / ${R(this.video.duration)}`),this._dots){const t=this.layer.activeIndex>=0?this.layer.activeIndex:C(this.cards,this.video.currentTime),e=this._dots.children;for(let s=0;s<e.length;s++)e[s].classList.toggle("vexy-vlip__dot--active",s===t)}}_emit(t,e){const s=new CustomEvent(`vexyvlip:${t}`,{detail:e,bubbles:!0,composed:!0});this.root.dispatchEvent(s);const r=this.opts[`on${t[0].toUpperCase()}${t.slice(1)}`];typeof r=="function"&&r(e,this)}get segments(){return this.cards.map(t=>typeof structuredClone=="function"?structuredClone(t):JSON.parse(JSON.stringify(t)))}get currentSegment(){return this.layer.activeIndex>=0?this.layer.activeIndex:C(this.cards,this.video.currentTime)}get currentTime(){return this.video.currentTime}get duration(){return this.video.duration}get mode(){return this._mode}get playing(){return!this.video.paused||!!this._ease}get ready(){return this._ready}}function R(i){if(!Number.isFinite(i))return"0:00";const t=Math.floor(i/60),e=Math.floor(i%60);return`${t}:${String(e).padStart(2,"0")}`}function ct(i){const t=document.createElement("div");return t.innerHTML=i,t.querySelectorAll("script, style, iframe, object, embed").forEach(e=>e.remove()),t.querySelectorAll("*").forEach(e=>{[...e.attributes].forEach(s=>{(/^on/i.test(s.name)||/^(href|src)$/i.test(s.name)&&/^\s*javascript:/i.test(s.value))&&e.removeAttribute(s.name)})}),t.innerHTML}const pt="1.0.2";function p(i,t,e){if(!i.hasAttribute(t))return e;const s=i.getAttribute(t);return s!=="false"&&s!=="0"}function H(i){return{src:i.getAttribute("src")||"",track:i.getAttribute("track")||"",vtt:i.getAttribute("vtt")||"",mode:i.getAttribute("mode")||"continuous",easing:i.getAttribute("easing")||"linear",poster:i.getAttribute("poster")||"",startAt:i.hasAttribute("start-at")?Number(i.getAttribute("start-at")):0,startSegment:i.hasAttribute("start-segment")?Number(i.getAttribute("start-segment")):null,autoplay:p(i,"autoplay",!1),loop:p(i,"loop",!1),muted:p(i,"muted",!1),controls:p(i,"controls",!0),keyboard:p(i,"keyboard",!0),overlay:p(i,"overlay",!0),nav:p(i,"nav",!0),dots:p(i,"dots",!0),back:p(i,"back",!1),counter:p(i,"counter",!1),closable:p(i,"closable",!0),autoFit:p(i,"auto-fit",!0),minScale:i.hasAttribute("min-scale")?Number(i.getAttribute("min-scale")):void 0,maxWidth:i.hasAttribute("max-width")?Number(i.getAttribute("max-width")):void 0,nextLabel:i.getAttribute("next-label")??void 0,prevLabel:i.getAttribute("prev-label")??void 0,startLabel:i.getAttribute("start-label")??void 0,replayLabel:i.getAttribute("replay-label")??void 0,title:i.getAttribute("video-title")??i.getAttribute("title")??"",titleBar:p(i,"title-bar",!0),cardBg:i.getAttribute("card-bg")||"",cardFg:i.getAttribute("card-fg")||"",nextBg:i.getAttribute("next-bg")||"",nextFg:i.getAttribute("next-fg")||"",nextBorder:i.getAttribute("next-border")||"",startBg:i.getAttribute("start-bg")||"",startFg:i.getAttribute("start-fg")||"",font:i.getAttribute("font")||"",dim:i.getAttribute("dim")||"",titleColor:i.getAttribute("title-color")||"",titleBg:i.getAttribute("title-bg")||"",titleSize:i.getAttribute("title-size")||"",sanitize:p(i,"sanitize",!1),injectStyles:!1}}class O extends HTMLElement{static get observedAttributes(){return["src","track","vtt","mode","easing","poster","start-at","start-segment","autoplay","loop","muted","controls","keyboard","sanitize","overlay","nav","back","closable","counter","dots","auto-fit","min-scale","max-width","next-label","prev-label","start-label","replay-label","video-title","title","title-bar","card-bg","card-fg","next-bg","next-fg","next-border","start-bg","start-fg","title-color","title-bg","title-size","font","dim"]}constructor(){super(),this._shadow=this.attachShadow({mode:"open"});const t=document.createElement("style");t.textContent=dt(),this._shadow.appendChild(t),this._mount=document.createElement("div"),this._shadow.appendChild(this._mount)}connectedCallback(){if(this._vlip)return;const t=this.querySelector("video");t&&this._mount.appendChild(t),this._vlip=new x(t||this._mount,H(this))}disconnectedCallback(){this._vlip?.destroy(),this._vlip=null}attributeChangedCallback(t,e,s){if(!(!this._vlip||e===s))switch(t){case"mode":this._vlip.setMode(s);break;case"easing":this._vlip.setEasing(s);break;case"muted":this._vlip.video.muted=p(this,"muted",!1);break;case"loop":this._vlip.video.loop=p(this,"loop",!1)&&this._vlip.mode!=="stepped";break;case"poster":this._vlip.video.poster=s||"";break;default:this._rebuild();break}}_rebuild(){this._vlip?.destroy(),this._mount.replaceChildren(),this._vlip=new x(this._mount,H(this))}play(){return this._vlip?.play()}pause(){return this._vlip?.pause()}toggle(){return this._vlip?.toggle()}next(){return this._vlip?.next()}prev(){return this._vlip?.prev()}close(){return this._vlip?.close()}replay(){return this._vlip?.replay()}seekTo(t){return this._vlip?.seekTo(t)}goToSegment(t){return this._vlip?.goToSegment(t)}showCard(t){return this._vlip?.showCard(t)}hideCard(){return this._vlip?.hideCard()}getSegments(){return this._vlip?.getSegments()??[]}setMode(t){this.setAttribute("mode",t)}setEasing(t){this.setAttribute("easing",t)}destroy(){this._vlip?.destroy()}get player(){return this._vlip}get segments(){return this._vlip?.segments??[]}get currentSegment(){return this._vlip?.currentSegment??-1}get currentTime(){return this._vlip?.currentTime??0}get duration(){return this._vlip?.duration??0}get mode(){return this._vlip?.mode??"continuous"}get playing(){return this._vlip?.playing??!1}get ready(){return this._vlip?.ready??!1}}return typeof customElements<"u"&&!customElements.get("vexy-vlip")&&customElements.define("vexy-vlip",O),x.Element=O,x.version=pt,x})();
//# sourceMappingURL=vexy-vlip.global.js.map
