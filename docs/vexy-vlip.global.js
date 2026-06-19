var VexyVlip=(function(){"use strict";function L(i){if(typeof i!="string")return NaN;const t=i.trim().match(/^(?:(\d+):)?(\d{1,2}):(\d{2})(?:[.,](\d{1,3}))?$/);if(!t)return NaN;const[,e,s,r,n]=t;return(e?Number(e):0)*3600+Number(s)*60+Number(r)+(n?Number(n.padEnd(3,"0"))/1e3:0)}function z(i){const t={};if(!i)return t;for(const e of i.trim().split(/\s+/)){const s=e.indexOf(":");if(s<=0)continue;const r=e.slice(0,s),n=e.slice(s+1);["position","line","size","align","vertical","region"].includes(r)&&(t[r]=n)}return t}const j=/^(\d{1,2}:)?\d{1,2}:\d{2}[.,]\d{1,3}\s*-->\s*(\d{1,2}:)?\d{1,2}:\d{2}[.,]\d{1,3}/;function D(i){const t=[];if(typeof i!="string")return t;const s=i.replace(/^﻿/,"").replace(/\r\n?/g,`
`).split(/\n\n+/);let r=0;for(const n of s){const a=n.split(`
`).filter(b=>b.length>0);if(a.length===0)continue;let o=0;if(/^WEBVTT/.test(a[0])&&r===0&&!j.test(a[0])){if(a.length===1)continue;o=1}if(/^(NOTE|STYLE|REGION)\b/.test(a[o]))continue;let d="";a[o]&&!a[o].includes("-->")&&(d=a[o],o+=1);const l=a[o];if(!l||!l.includes("-->"))continue;const h=l.indexOf("-->"),c=L(l.slice(0,h)),p=l.slice(h+3).trim(),v=p.indexOf(" "),m=v===-1?p:p.slice(0,v),w=v===-1?"":p.slice(v+1),y=L(m);if(Number.isNaN(c)||Number.isNaN(y))continue;const _=a.slice(o+1).join(`
`);t.push({index:r++,id:d,start:c,end:y,settings:z(w),payload:_})}return t}const P={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};function V(i){return String(i).replace(/[&<>"']/g,t=>P[t])}function k(i){let t=V(i);return t=t.replace(/`([^`]+)`/g,"<code>$1</code>"),t=t.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>"),t=t.replace(new RegExp("(?<!\\*)\\*([^*\\n]+)\\*(?!\\*)","g"),"<em>$1</em>"),t=t.replace(/~~([^~]+)~~/g,"<del>$1</del>"),t=t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,(e,s,r)=>`<a href="${/^\s*(javascript|data|vbscript):/i.test(r)?"#":r}">${s}</a>`),t=t.replace(/\n/g,"<br>"),t}function q(i){return/^#{1,6}\s/.test(i)||/^\s*[-*+]\s+/.test(i)||/^\s*\d+\.\s+/.test(i)||/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(i.trim())}function $(i){const e=String(i).replace(/\r\n?/g,`
`).split(`
`);if(e.length===1&&!q(e[0]))return k(e[0]);const s=[];let r=[],n=null;const a=()=>{r.length&&s.push(`<p>${k(r.join(`
`))}</p>`),r=[]},o=()=>{if(n){const d=n.items.map(l=>`<li>${k(l)}</li>`).join("");s.push(`<${n.tag}>${d}</${n.tag}>`)}n=null};for(const d of e){if(/^\s*$/.test(d)){a(),o();continue}const l=/^(#{1,6})\s+(.*)$/.exec(d);if(l){a(),o(),s.push(`<h${l[1].length}>${k(l[2])}</h${l[1].length}>`);continue}if(/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(d)){a(),o(),s.push("<hr>");continue}const h=/^\s*[-*+]\s+(.*)$/.exec(d);if(h){a(),(!n||n.tag!=="ul")&&(o(),n={tag:"ul",items:[]}),n.items.push(h[1]);continue}const c=/^\s*\d+\.\s+(.*)$/.exec(d);if(c){a(),(!n||n.tag!=="ol")&&(o(),n={tag:"ol",items:[]}),n.items.push(c[1]);continue}o(),r.push(d)}return a(),o(),s.join("")}const U=new Set(["center","top","bottom","left","right","top-left","top-right","bottom-left","bottom-right"]);function A(i){return typeof i=="number"?i:typeof i=="string"?parseFloat(i.replace("%","")):NaN}function Y(i,t){const e=i||(t==="end"?"line-right":t==="center"?"center":"line-left");return e==="line-left"?"left":e==="line-right"?"right":"center"}function K(i){return i==="end"?"bottom":i==="center"?"center":"top"}function J(i,t){return i==="center"&&t==="center"?"center":i==="center"?t:t==="center"?i:`${t}-${i}`}function G(i){const t=(i||"").trim();if(!t.startsWith("{"))return null;try{const e=JSON.parse(t);return e&&typeof e=="object"?e:null}catch{return null}}function X(i,t={}){const e=G(i.payload),s=i.settings||{};let r,n;e&&typeof e.html=="string"?(r=e.html,n=e.text||""):e&&typeof e.text=="string"?(n=e.text,r=$(e.text)):(n=i.payload,r=$(i.payload));const[a,o]=String(s.position??"").split(","),[d,l]=String(s.line??"").split(",");let h=e&&e.x!=null?e.x:A(a),c=e&&e.y!=null?e.y:A(d),p=e&&e.w!=null?e.w:A(s.size),v=e&&e.anchor,m=e&&e.align||s.align||"start";m==="left"&&(m="start"),m==="right"&&(m="end");const w=h!=null&&h!==""&&!(typeof h=="number"&&Number.isNaN(h)),y=c!=null&&c!==""&&!(typeof c=="number"&&Number.isNaN(c)),_=p!=null&&p!==""&&!(typeof p=="number"&&Number.isNaN(p));if(!v||!U.has(v))if(!e&&(s.position!=null||s.line!=null)){const b=Y(o,m),T=s.line!=null?K(l):"bottom";v=J(b,T)}else v="bottom";return w||(h=50),y||(c=88),{index:i.index,id:i.id,start:i.start,end:i.end,text:n,html:r,isHtml:!!(e&&typeof e.html=="string"),placement:{x:h,y:c,w:_?p:null,anchor:v,align:m},style:{bg:e?e.bg:void 0,fg:e&&e.fg,font:e&&e.font,padding:e&&e.padding,radius:e&&e.radius,border:e&&e.border,shadow:e&&e.shadow,opacity:e&&e.opacity},className:e&&e.class||"",enter:e&&e.enter||t.enter||"fade",exit:e&&e.exit||t.exit||"fade"}}function Q(i,t={}){return D(i).map(e=>X(e,t))}const g=.02;function Z(i){return i.map((t,e)=>({index:e,time:t.start,end:t.end})).sort((t,e)=>t.time-e.time)}function tt(i,t){for(let e=0;e<i.length;e++)if(t>=i[e].start-g&&t<i[e].end-g)return e;return-1}function et(i,t,e=g){let s=-1,r=1/0;for(let n=0;n<i.length;n++){const a=i[n].start;a>t+e&&a<r&&(r=a,s=n)}return s}function it(i,t,e=g){let s=-1,r=-1/0;for(let n=0;n<i.length;n++){const a=i[n].start;a<t-e&&a>r&&(r=a,s=n)}return s}function E(i,t,e=g){let s=-1,r=-1/0;for(let n=0;n<i.length;n++){const a=i[n].start;a<=t+e&&a>r&&(r=a,s=n)}return s}const N={center:"translate(-50%, -50%)",top:"translate(-50%, 0)",bottom:"translate(-50%, -100%)",left:"translate(0, -50%)",right:"translate(-100%, -50%)","top-left":"translate(0, 0)","top-right":"translate(-100%, 0)","bottom-left":"translate(0, -100%)","bottom-right":"translate(-100%, -100%)"},M={center:"50% 50%",top:"50% 0",bottom:"50% 100%",left:"0 50%",right:"100% 50%","top-left":"0 0","top-right":"100% 0","bottom-left":"0 100%","bottom-right":"100% 100%"};function S(i,t="%"){return i==null?null:typeof i=="number"?`${i}${t}`:String(i)}function B(i){const t=typeof i=="number"?i:parseFloat(i);return Number.isFinite(t)?Math.max(0,Math.min(100,t)):50}function st(i,t){i.style.left=S(t.x),i.style.top=S(t.y),i.style.transformOrigin=M[t.anchor]||M.bottom,i.style.transform=N[t.anchor]||N.bottom,t.w!=null?i.style.width=S(t.w):i.style.width=""}function rt(i,t){if(i==null)return;if(t==null||t>=1)return i;const e=Math.max(0,Math.min(1,Number(t))),s=/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(i.trim());if(s){let n=s[1];n.length===3&&(n=n.split("").map(l=>l+l).join(""));const a=parseInt(n.slice(0,2),16),o=parseInt(n.slice(2,4),16),d=parseInt(n.slice(4,6),16);return`rgba(${a}, ${o}, ${d}, ${e})`}const r=/^rgba?\(([^)]+)\)$/i.exec(i.trim());if(r){const n=r[1].split(",").map(a=>a.trim()).slice(0,3);if(n.length===3)return`rgba(${n.join(", ")}, ${e})`}return i}function nt(i,t,e){if(!t)return;t.fg&&(i.style.color=t.fg),t.font&&(i.style.font=t.font),t.padding&&(i.style.padding=t.padding),t.radius!=null&&(i.style.borderRadius=S(t.radius,"px")),t.border&&(i.style.border=t.border),t.shadow&&(i.style.boxShadow=t.shadow);const s=rt(t.bg,t.opacity);s&&(i.style.background=s),e&&(i.style.textAlign=e)}function at(i,t,e){const s=i.createElement("div");if(s.className="vexy-vlip__cardnav",e.counter!==!1){const o=i.createElement("span");o.className="vexy-vlip__counter",o.textContent=`${t.index+1}/${e.total}`,s.appendChild(o)}const r=i.createElement("span");r.className="vexy-vlip__navspacer",s.appendChild(r);const n=i.createElement("button");n.type="button",n.className="vexy-vlip__prev",n.textContent=e.prevLabel??"←",n.setAttribute("aria-label","Previous step");const a=i.createElement("button");return a.type="button",a.className="vexy-vlip__next",a.textContent=e.nextLabel??"Next →",s.append(n,a),s}function ot(i,t,e={}){const s=i.createElement("div");s.className="vexy-vlip__card",s.dataset.index=String(t.index),s.dataset.enter=t.enter||"fade",s.setAttribute("role","note"),t.className&&(s.className+=" "+t.className);const r=i.createElement("div");r.className="vexy-vlip__body";let n=t.html;if(t.isHtml&&typeof e.sanitize=="function"&&(n=e.sanitize(n)),r.innerHTML=n,e.close){s.classList.add("vexy-vlip__card--closable");const a=i.createElement("button");a.type="button",a.className="vexy-vlip__close",a.setAttribute("aria-label","Close cards"),a.textContent="✕",r.appendChild(a)}return e.nav&&e.nav.enabled&&r.appendChild(at(i,t,e.nav)),st(s,t.placement),nt(r,t.style,t.placement.align),s.appendChild(r),s}class lt{constructor(t,e={}){this.layer=t,this.doc=t.ownerDocument,this.opts=e,this.fit=e.fit||{enabled:!1},this.cards=[],this.els=new Map,this.activeIndex=-1;const s=this.doc.defaultView&&this.doc.defaultView.ResizeObserver;this.fit.enabled&&s&&(this._ro=new s(()=>this.refit()),this._ro.observe(this.layer))}setCards(t){this.clear(),this.cards=t}clear(){this.layer.replaceChildren(),this.els.clear(),this.activeIndex=-1}_ensure(t){let e=this.els.get(t);if(!e){const s=this.opts.nav?{...this.opts.nav,total:this.cards.length}:void 0;e=ot(this.doc,this.cards[t],{...this.opts,nav:s}),this.els.set(t,e),this.layer.appendChild(e)}return e}_fit(t,e){if(!this.fit.enabled)return;const s=this.layer.clientWidth,r=this.layer.clientHeight;if(!s||!r)return;const n=e.placement,a=n.anchor,o=N[a]||N.bottom,d=this.fit.margin??14,l=B(n.x)/100*s,h=B(n.y)/100*r,c=a==="left"||a.endsWith("-left")?"left":a==="right"||a.endsWith("-right")?"right":"center",p=a==="top"||a.startsWith("top")?"top":a==="bottom"||a.startsWith("bottom")?"bottom":"middle",v=Math.max(80,c==="left"?s-l-d:c==="right"?l-d:2*Math.min(l,s-l)-2*d),m=Math.max(48,p==="top"?r-h-d:p==="bottom"?h-d:2*Math.min(h,r-h)-2*d);if(t.style.transform=o,n.w==null){const T=this.fit.maxWidthPct?this.fit.maxWidthPct/100*s:v,ut=Math.round(Math.min(v,T));t.style.width="max-content",t.style.maxWidth=`${ut}px`}const w=Math.max(t.offsetWidth,t.scrollWidth),y=Math.max(t.offsetHeight,t.scrollHeight);let _=Math.min(1,v/w,m/y);const b=this.fit.minScale??.4;_<b&&(_=b),t.style.transform=_<1?`${o} scale(${Math.round(_*1e3)/1e3})`:o}refit(){if(this.activeIndex<0)return;const t=this.els.get(this.activeIndex);t&&this._fit(t,this.cards[this.activeIndex])}show(t){if(t===this.activeIndex||(this.hide(),t<0||t>=this.cards.length))return!1;const e=this._ensure(t);return this._fit(e,this.cards[t]),e.offsetWidth,e.classList.add("vexy-vlip__card--in"),this.activeIndex=t,!0}hide(){if(this.activeIndex<0)return!1;const t=this.els.get(this.activeIndex);return t&&t.classList.remove("vexy-vlip__card--in"),this.activeIndex=-1,!0}}const I="vexy-vlip-styles",F=`
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
/* Start CTA: a prominent button centered over the dimmed first frame (both
   modes), styled like the Next pill but 20% larger. Shown via data-start. */
.vexy-vlip__start {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: none;
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
  box-shadow: 0 6px 22px rgba(0, 0, 0, 0.4);
  transition: transform 0.12s ease, box-shadow 0.12s ease, filter 0.12s ease;
}
.vexy-vlip__start:hover {
  filter: brightness(0.97);
  transform: translate(-50%, -50%) scale(1.05);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}
.vexy-vlip[data-start="true"] .vexy-vlip__start { display: block; }
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
}
`;function dt(){return`:host{display:inline-block;position:relative;max-width:100%}:host([hidden]){display:none}${F}`}function ht(i){if(!i||i.getElementById(I))return;const t=i.createElement("style");t.id=I,t.textContent=F,i.head.appendChild(t)}const C={linear:i=>i,"ease-in":i=>i*i,"ease-out":i=>1-(1-i)*(1-i),"ease-in-out":i=>i*i*(3-2*i)},R={src:"",track:"",vtt:"",mode:"continuous",easing:"linear",controls:!0,autoplay:!1,loop:!1,muted:!1,poster:"",startAt:0,startSegment:null,keyboard:!0,sanitize:!1,overlay:!0,nav:!0,counter:!1,dots:!0,closable:!0,nextLabel:"Next →",prevLabel:"←",startLabel:"Start →",autoFit:!0,minScale:.4,maxWidth:72,cardBg:"",cardFg:"",nextBg:"",nextFg:"",nextBorder:"",font:"",dim:"",injectStyles:!0},f={play:"▶",pause:"❚❚",prev:"⏮",next:"⏭",mute:"🔊",muted:"🔇",fs:"⤢"};class x{constructor(t,e={}){if(!t||!t.ownerDocument)throw new TypeError("VexyVlip: a target element is required");this.opts={...R,...e},this.doc=t.ownerDocument,this.cards=[],this.stops=[],this._destroyed=!1,this._ready=!1,this._started=!1,this._target=null,this._pendingSeg=-1,this._stepIndex=-1,this._playingToEnd=!1,this._ease=null,this._looping=!1,this._frame=null,this._mode=this.opts.mode==="stepped"?"stepped":"continuous",this._ac=new AbortController,this._buildDom(t),this.opts.injectStyles&&!this._inShadow&&ht(this.doc),this._wireEvents(),this._loadMedia()}_buildDom(t){const e=this.doc;if(t.tagName==="VIDEO"){this.video=t;const r=e.createElement("div");t.replaceWith(r),r.appendChild(t),this.root=r}else this.root=t,this.video=e.createElement("video"),this.root.appendChild(this.video);this._inShadow=this.root.getRootNode()instanceof ShadowRoot,this.root.classList.add("vexy-vlip"),this.root.dataset.mode=this._mode,this.root.tabIndex=this.root.tabIndex>=0?this.root.tabIndex:0,this._applyTheme();const s=this.video;s.classList.add("vexy-vlip__video"),s.playsInline=!0,s.preload="metadata",this.opts.src&&(s.src=this.opts.src),this.opts.poster&&(s.poster=this.opts.poster),s.loop=!!this.opts.loop&&this._mode!=="stepped",s.muted=!!this.opts.muted,s.controls=!1,this.tap=e.createElement("button"),this.tap.className="vexy-vlip__tap",this.tap.type="button",this.tap.setAttribute("aria-label","Advance to the next step"),this.root.appendChild(this.tap),this.opts.overlay&&(this.overlay=e.createElement("div"),this.overlay.className="vexy-vlip__overlay",this.overlay.setAttribute("aria-hidden","true"),this.root.appendChild(this.overlay)),this.root.dataset.overlay="false",this.cardsLayer=e.createElement("div"),this.cardsLayer.className="vexy-vlip__cards",this.cardsLayer.setAttribute("aria-live","polite"),this.root.appendChild(this.cardsLayer),this.layer=new lt(this.cardsLayer,{sanitize:this.opts.sanitize?ct:void 0,close:!!this.opts.closable,nav:{enabled:!!this.opts.nav,counter:this.opts.counter!==!1,nextLabel:this.opts.nextLabel,prevLabel:this.opts.prevLabel},fit:{enabled:this.opts.autoFit!==!1,minScale:Number(this.opts.minScale)||.4,maxWidthPct:Number(this.opts.maxWidth)||72}}),this.opts.controls&&this._buildControls(),this.startBtn=e.createElement("button"),this.startBtn.className="vexy-vlip__start",this.startBtn.type="button",this.startBtn.textContent=this.opts.startLabel??R.startLabel,this.root.appendChild(this.startBtn),this.root.dataset.start="false"}_applyTheme(){const t=(s,r)=>{r!=null&&r!==""&&this.root.style.setProperty(s,String(r))};t("--vv-card-bg",this.opts.cardBg),t("--vv-card-bg-stepped",this.opts.cardBg),t("--vv-card-fg",this.opts.cardFg),t("--vv-next-bg",this.opts.nextBg),t("--vv-next-fg",this.opts.nextFg),t("--vv-next-border",this.opts.nextBorder),t("--vv-card-font",this.opts.font),this.opts.maxWidth&&t("--vv-card-max-width",`${Number(this.opts.maxWidth)}%`);const e=this.opts.dim;if(e!=null&&e!==""){const s=Number(e);t("--vv-overlay-bg",Number.isFinite(s)&&s>=0&&s<=1?`rgba(0, 0, 0, ${s})`:e)}}_buildControls(){const t=this.doc,e=t.createElement("div");e.className="vexy-vlip__controls";const s=(n,a)=>{const o=t.createElement("button");return o.className="vexy-vlip__btn",o.type="button",o.textContent=n,o.setAttribute("aria-label",a),o};this._playBtn=s(f.play,"Play"),this._prevBtn=s(f.prev,"Previous step"),this._nextBtn=s(f.next,"Next step"),this._dots=t.createElement("div"),this._dots.className="vexy-vlip__dots",this._time=t.createElement("span"),this._time.className="vexy-vlip__time",this._muteBtn=s(this.opts.muted?f.muted:f.mute,"Mute"),this._fsBtn=s(f.fs,"Fullscreen"),e.append(this._prevBtn,this._playBtn,this._nextBtn,this._dots,this._time,this._muteBtn,this._fsBtn),this._controlsBar=e,this.root.appendChild(e);const r={signal:this._ac.signal};this._playBtn.addEventListener("click",()=>this.toggle(),r),this._prevBtn.addEventListener("click",()=>this.prev(),r),this._nextBtn.addEventListener("click",()=>this.next(),r),this._muteBtn.addEventListener("click",()=>this._toggleMute(),r),this._fsBtn.addEventListener("click",()=>this._toggleFullscreen(),r)}_buildDots(){!this._dots||!this.opts.dots||(this._dots.replaceChildren(),this.cards.forEach((t,e)=>{const s=this.doc.createElement("button");s.className="vexy-vlip__dot",s.type="button",s.setAttribute("aria-label",`Step ${e+1}`),s.addEventListener("click",()=>this.goToSegment(e),{signal:this._ac.signal}),this._dots.appendChild(s)}))}_wireEvents(){const t=this.video,e={signal:this._ac.signal};t.addEventListener("loadedmetadata",()=>this._onMeta(),e),t.addEventListener("ended",()=>this._handleEnded(),e),t.addEventListener("play",()=>this._reflect(),e),t.addEventListener("pause",()=>this._reflect(),e),t.addEventListener("seeked",()=>this._updateUi(),e),this.startBtn.addEventListener("click",s=>{s.preventDefault(),this._begin()},e),this.tap.addEventListener("click",s=>{this.toggle(),s.preventDefault()},e),this.cardsLayer.addEventListener("click",s=>{const r=s.target;if(r&&r.closest(".vexy-vlip__close")){s.preventDefault(),this.close();return}if(r&&r.closest(".vexy-vlip__next")){s.preventDefault(),this.next();return}if(r&&r.closest(".vexy-vlip__prev")){s.preventDefault(),this.prev();return}r&&(r.closest("a")||r.closest("button:not(.vexy-vlip__tap)"))||this._mode==="stepped"&&this.toggle()},e),this.opts.keyboard&&this.root.addEventListener("keydown",s=>this._handleKey(s),e)}_handleKey(t){switch(t.key){case" ":case"Enter":this.toggle(),t.preventDefault();break;case"ArrowRight":this.next(),t.preventDefault();break;case"ArrowLeft":this.prev(),t.preventDefault();break;case"f":this._toggleFullscreen();break;case"m":this._toggleMute();break}}async _loadMedia(){let t=this.opts.vtt;if(!t&&this.opts.track)try{const e=await fetch(this.opts.track);if(!e.ok)throw new Error(`HTTP ${e.status}`);t=await e.text()}catch(e){this._emit("error",{error:e,phase:"track"});return}this._destroyed||(t&&(this.cards=Q(t,{enter:"fade"}),this.stops=Z(this.cards),this.layer.setCards(this.cards),this._buildDots()),this._cardsReady=!0,this._maybeReady())}_onMeta(){this._metaReady=!0,this._maybeReady()}_maybeReady(){if(this._ready||this._destroyed||!this._metaReady||!this._cardsReady)return;this._ready=!0;const t=this.opts.startSegment;t!=null&&this.cards[t]?(this._stepIndex=t,this.video.currentTime=this.cards[t].start,this._mode==="stepped"&&this.layer.show(t)):this.opts.startAt&&(this.video.currentTime=this.opts.startAt,this._stepIndex=E(this.cards,this.opts.startAt)),this._updateUi(),this._emit("ready",{segments:this.cards.length}),this._mode==="continuous"&&this.opts.autoplay?(this._started=!0,this.play()):t!=null&&this.cards[t]?(this._started=!0,this._showHint(this._mode==="stepped")):this._showStart(!0)}_startLoop(){this._looping||(this._looping=!0,this._scheduleTick())}_scheduleTick(){if(this._destroyed||this._frame!=null)return;const t=this.video,e=()=>this._tick();typeof t.requestVideoFrameCallback=="function"?(this._frame=t.requestVideoFrameCallback(e),this._frameKind="rvfc"):(this._frame=requestAnimationFrame(e),this._frameKind="raf")}_stopLoop(){if(this._looping=!1,this._frame==null)return;const t=this.video;this._frameKind==="rvfc"&&typeof t.cancelVideoFrameCallback=="function"?t.cancelVideoFrameCallback(this._frame):this._frameKind==="raf"&&cancelAnimationFrame(this._frame),this._frame=null}_tick(){if(this._frame=null,this._destroyed)return;const t=this.video,e=t.currentTime;if(this._mode==="stepped"&&this._target!=null)e+g>=this._target&&this._reachStop(this._pendingSeg);else if(this._mode==="continuous"){const s=tt(this.cards,e);s!==this.layer.activeIndex&&(s===-1?(this.layer.hide(),this._emit("cardhide",{})):(this.layer.show(s),this._emit("segmententer",{index:s,segment:this.cards[s]}),this._emit("cardshow",{index:s,segment:this.cards[s]})))}this._updateUi(),!t.paused&&!this._destroyed?this._scheduleTick():this._looping=!1}_advance(){if(!this._ready)return;const t=this.video.currentTime;if(this.layer.activeIndex>=0){const s=this.layer.activeIndex;this.layer.hide(),this._emit("segmentexit",{index:s}),this._emit("cardhide",{index:s})}this._showHint(!1);const e=this._stepIndex+1<this.cards.length?this._stepIndex+1:-1;if(e===-1)this._target=null,this._pendingSeg=-1,this._playingToEnd=!0,this._playNative();else{const s=this.cards[e].start;this._playingToEnd=!1,this.opts.easing!=="linear"&&C[this.opts.easing]?this._travelEased(t,s,e):(this._target=s,this._pendingSeg=e,this._playNative())}this._emit("play",{})}_playNative(){this._cancelEase();const t=this.video.play();this._startLoop(),t&&typeof t.catch=="function"&&t.catch(e=>this._emit("error",{error:e,phase:"play"}))}_travelEased(t,e,s){this._cancelEase(),this.video.pause();const r=C[this.opts.easing]||C.linear,n=this.video.playbackRate||1,a=Math.max(0,e-t)/n*1e3,o=this.video.muted;this.video.muted=!0;const d=typeof performance<"u"?performance.now():Date.now(),l={segIndex:s,wasMuted:o,raf:0};this._ease=l;const h=()=>{if(this._destroyed||this._ease!==l)return;const c=typeof performance<"u"?performance.now():Date.now(),p=a<=0?1:Math.min(1,(c-d)/a);this.video.currentTime=t+(e-t)*r(p),this._updateUi(),p>=1?(this.video.muted=o,this._ease=null,this._reachStop(s)):l.raf=requestAnimationFrame(h)};l.raf=requestAnimationFrame(h)}_cancelEase(){this._ease&&(cancelAnimationFrame(this._ease.raf),this._ease.wasMuted!=null&&(this.video.muted=this._ease.wasMuted),this._ease=null)}_reachStop(t){this.video.pause(),t>=0&&this.cards[t]&&(this._stepIndex=t,this.video.currentTime=this.cards[t].start,this.layer.show(t),this._emit("segmententer",{index:t,segment:this.cards[t]}),this._emit("cardshow",{index:t,segment:this.cards[t]})),this._target=null,this._pendingSeg=-1,this._showHint(!0),this._emit("stop",{index:t}),this._updateUi()}play(){if(!this._started&&this._ready){this._begin();return}this._mode==="stepped"?this._advance():this._playNative()}pause(){this._cancelEase(),this._target=null,this._pendingSeg=-1,this.video.pause(),this._emit("pause",{})}toggle(){if(!this._started&&this._ready){this._begin();return}this._mode==="stepped"?!this.video.paused||this._ease?this.pause():this._advance():this.video.paused?this._playNative():this.pause()}next(){if(!this._started&&this._ready){this._begin();return}if(this._mode==="stepped")this._advance();else{const t=et(this.cards,this.video.currentTime);t>=0&&this.seekTo(this.cards[t].start)}}prev(){if(this._mode==="stepped"){const e=(this._stepIndex>=0?this._stepIndex:this.cards.length)-1;this.goToSegment(Math.max(0,e));return}const t=it(this.cards,this.video.currentTime);this.goToSegment(t>=0?t:0)}seekTo(t){this._cancelEase(),this._target=null,this.video.currentTime=Math.max(0,t),this._updateUi()}goToSegment(t){this.cards[t]&&(this._started=!0,this.root.dataset.start="false",this._cancelEase(),this._target=null,this._pendingSeg=-1,this._stepIndex=t,this.video.pause(),this.video.currentTime=this.cards[t].start,this.layer.show(t),this._showHint(this._mode==="stepped"),this._emit("segmententer",{index:t,segment:this.cards[t]}),this._emit("cardshow",{index:t,segment:this.cards[t]}),this._updateUi())}showCard(t){this.cards[t]&&(this.layer.show(t),this._emit("cardshow",{index:t,segment:this.cards[t]}))}hideCard(){this.layer.hide(),this._emit("cardhide",{})}getSegments(){return this.segments}setMode(t){const e=t==="stepped"?"stepped":"continuous";e!==this._mode&&(this._mode=e,this.root.dataset.mode=e,this._cancelEase(),this._target=null,this._stepIndex=this.layer.activeIndex>=0?this.layer.activeIndex:E(this.cards,this.video.currentTime),this.video.loop=!!this.opts.loop&&e!=="stepped",this.video.pause(),this.layer.hide(),this._showHint(e==="stepped"),this._emit("modechange",{mode:e}))}setEasing(t){C[t]&&(this.opts.easing=t)}_showStart(t){this.root.dataset.start=t?"true":"false",t&&this._setOverlay(!0)}_begin(){this._started||!this._ready||(this._started=!0,this.root.dataset.start="false",this._mode==="stepped"?this._advance():(this._setOverlay(!1),this._playNative()))}close(){this._mode==="stepped"&&(this.setMode("continuous"),this._setOverlay(!1),this._playNative(),this._emit("close",{}))}destroy(){this._destroyed=!0,this._stopLoop(),this._cancelEase(),this._ac.abort();try{this.video.pause()}catch{}this.layer.clear();for(const t of[this.tap,this.overlay,this.cardsLayer,this._controlsBar,this.startBtn])t?.remove();this._emit("destroy",{})}_handleEnded(){this._playingToEnd=!1,this._stopLoop(),this.layer.hide(),this._emit("ended",{}),this._reflect()}_toggleMute(){this.video.muted=!this.video.muted,this._muteBtn&&(this._muteBtn.textContent=this.video.muted?f.muted:f.mute)}_toggleFullscreen(){const t=this.root;this.doc.fullscreenElement?this.doc.exitFullscreen?.():t.requestFullscreen?.()}_showHint(t){this._setOverlay(this._mode==="stepped"&&!!t)}_setOverlay(t){this.root.dataset.overlay=t?"true":"false",t&&!this.video.paused&&this.video.pause()}_reflect(){const t=this.video.paused;this.root.dataset.paused=String(t),this._playBtn&&(this._playBtn.textContent=t?f.play:f.pause),t||this._startLoop()}_updateUi(){if(this._reflect(),this._time&&(this._time.textContent=`${H(this.video.currentTime)} / ${H(this.video.duration)}`),this._dots){const t=this.layer.activeIndex>=0?this.layer.activeIndex:E(this.cards,this.video.currentTime),e=this._dots.children;for(let s=0;s<e.length;s++)e[s].classList.toggle("vexy-vlip__dot--active",s===t)}}_emit(t,e){const s=new CustomEvent(`vexyvlip:${t}`,{detail:e,bubbles:!0,composed:!0});this.root.dispatchEvent(s);const r=this.opts[`on${t[0].toUpperCase()}${t.slice(1)}`];typeof r=="function"&&r(e,this)}get segments(){return this.cards.map(t=>typeof structuredClone=="function"?structuredClone(t):JSON.parse(JSON.stringify(t)))}get currentSegment(){return this.layer.activeIndex>=0?this.layer.activeIndex:E(this.cards,this.video.currentTime)}get currentTime(){return this.video.currentTime}get duration(){return this.video.duration}get mode(){return this._mode}get playing(){return!this.video.paused||!!this._ease}get ready(){return this._ready}}function H(i){if(!Number.isFinite(i))return"0:00";const t=Math.floor(i/60),e=Math.floor(i%60);return`${t}:${String(e).padStart(2,"0")}`}function ct(i){const t=document.createElement("div");return t.innerHTML=i,t.querySelectorAll("script, style, iframe, object, embed").forEach(e=>e.remove()),t.querySelectorAll("*").forEach(e=>{[...e.attributes].forEach(s=>{(/^on/i.test(s.name)||/^(href|src)$/i.test(s.name)&&/^\s*javascript:/i.test(s.value))&&e.removeAttribute(s.name)})}),t.innerHTML}const pt="1.0.0";function u(i,t,e){if(!i.hasAttribute(t))return e;const s=i.getAttribute(t);return s!=="false"&&s!=="0"}function O(i){return{src:i.getAttribute("src")||"",track:i.getAttribute("track")||"",vtt:i.getAttribute("vtt")||"",mode:i.getAttribute("mode")||"continuous",easing:i.getAttribute("easing")||"linear",poster:i.getAttribute("poster")||"",startAt:i.hasAttribute("start-at")?Number(i.getAttribute("start-at")):0,startSegment:i.hasAttribute("start-segment")?Number(i.getAttribute("start-segment")):null,autoplay:u(i,"autoplay",!1),loop:u(i,"loop",!1),muted:u(i,"muted",!1),controls:u(i,"controls",!0),keyboard:u(i,"keyboard",!0),overlay:u(i,"overlay",!0),nav:u(i,"nav",!0),dots:u(i,"dots",!0),counter:u(i,"counter",!1),closable:u(i,"closable",!0),autoFit:u(i,"auto-fit",!0),minScale:i.hasAttribute("min-scale")?Number(i.getAttribute("min-scale")):void 0,maxWidth:i.hasAttribute("max-width")?Number(i.getAttribute("max-width")):void 0,nextLabel:i.getAttribute("next-label")??void 0,prevLabel:i.getAttribute("prev-label")??void 0,startLabel:i.getAttribute("start-label")??void 0,cardBg:i.getAttribute("card-bg")||"",cardFg:i.getAttribute("card-fg")||"",nextBg:i.getAttribute("next-bg")||"",nextFg:i.getAttribute("next-fg")||"",nextBorder:i.getAttribute("next-border")||"",font:i.getAttribute("font")||"",dim:i.getAttribute("dim")||"",sanitize:u(i,"sanitize",!1),injectStyles:!1}}class W extends HTMLElement{static get observedAttributes(){return["src","track","vtt","mode","easing","poster","muted","loop","controls"]}constructor(){super(),this._shadow=this.attachShadow({mode:"open"});const t=document.createElement("style");t.textContent=dt(),this._shadow.appendChild(t),this._mount=document.createElement("div"),this._shadow.appendChild(this._mount)}connectedCallback(){if(this._vlip)return;const t=this.querySelector("video");t&&this._mount.appendChild(t),this._vlip=new x(t||this._mount,O(this))}disconnectedCallback(){this._vlip?.destroy(),this._vlip=null}attributeChangedCallback(t,e,s){if(!(!this._vlip||e===s))switch(t){case"mode":this._vlip.setMode(s);break;case"easing":this._vlip.setEasing(s);break;case"muted":this._vlip.video.muted=u(this,"muted",!1);break;case"loop":this._vlip.video.loop=u(this,"loop",!1)&&this._vlip.mode!=="stepped";break;case"poster":this._vlip.video.poster=s||"";break;case"controls":case"src":case"track":case"vtt":this._rebuild();break}}_rebuild(){this._vlip?.destroy(),this._mount.replaceChildren(),this._vlip=new x(this._mount,O(this))}play(){return this._vlip?.play()}pause(){return this._vlip?.pause()}toggle(){return this._vlip?.toggle()}next(){return this._vlip?.next()}prev(){return this._vlip?.prev()}close(){return this._vlip?.close()}seekTo(t){return this._vlip?.seekTo(t)}goToSegment(t){return this._vlip?.goToSegment(t)}showCard(t){return this._vlip?.showCard(t)}hideCard(){return this._vlip?.hideCard()}getSegments(){return this._vlip?.getSegments()??[]}setMode(t){this.setAttribute("mode",t)}setEasing(t){this.setAttribute("easing",t)}destroy(){this._vlip?.destroy()}get player(){return this._vlip}get segments(){return this._vlip?.segments??[]}get currentSegment(){return this._vlip?.currentSegment??-1}get currentTime(){return this._vlip?.currentTime??0}get duration(){return this._vlip?.duration??0}get mode(){return this._vlip?.mode??"continuous"}get playing(){return this._vlip?.playing??!1}get ready(){return this._vlip?.ready??!1}}return typeof customElements<"u"&&!customElements.get("vexy-vlip")&&customElements.define("vexy-vlip",W),x.Element=W,x.version=pt,x})();
//# sourceMappingURL=vexy-vlip.global.js.map
