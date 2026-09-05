(() => {
  'use strict';
  if (window.__PASSPORT_COMMERCIAL_LAYER__) return;
  window.__PASSPORT_COMMERCIAL_LAYER__ = true;
  window.__PASSPORT_AMAZON_AFFILIATE__ = true;

  /* Whiplash-style principle: scarce lateral real estate promotes Passport itself.
     Affiliate destinations stay out of fixed rails; circulation goes to owned routes. */
  const PASSPORT_LEFT={href:'/radio-mundo.html',label:'WORLD DIAL™ · RÁDIOS DO MUNDO',short:'WORLD DIAL™',copy:'RÁDIOS DO MUNDO'};
  const PASSPORT_RIGHT={href:'/loja.html',label:'PASSPORT STORE · ENTRAR',short:'PASSPORT STORE',copy:'ROCK · MÚSICA · CULTURA'};
  const PASSPORT_RIBBON_LEFT={href:'/editorial.html',label:'HISTÓRIAS · PASSPORT RADIO'};
  const PASSPORT_RIBBON_RIGHT={href:'/radio.html#passportTunnels',label:'TUNNELS™ · ENTRAR'};

  const installStyle=()=>{if(document.getElementById('passport-commercial-style'))return;const style=document.createElement('style');style.id='passport-commercial-style';style.textContent=`
    .passport-commercial-rail,.passport-corner-ribbon{box-sizing:border-box;font-family:Inter,Arial,Helvetica,sans-serif}
    .passport-commercial-rail{display:none;position:fixed;z-index:42;top:50%;transform:translateY(-50%);width:38px;min-height:258px;background:#111;color:#fff!important;border:1px solid rgba(0,0,0,.16);border-top:4px solid #d71920;box-shadow:0 6px 17px rgba(0,0,0,.12);text-decoration:none!important;overflow:hidden;isolation:isolate}
    .passport-commercial-rail--left{left:3px}.passport-commercial-rail--right{right:3px}
    .passport-commercial-rail__inner{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:11px 3px}
    .passport-commercial-rail__brand,.passport-commercial-rail__copy{writing-mode:vertical-rl;transform:rotate(180deg);text-transform:uppercase}.passport-commercial-rail__brand{font-size:11px;line-height:1;font-weight:1000;letter-spacing:.06em}.passport-commercial-rail__copy{font-size:5.5px;line-height:1.1;font-weight:900;letter-spacing:.09em;color:#ddd}
    .passport-commercial-rail__go{width:22px;height:22px;display:grid;place-items:center;border-radius:50%;background:#d71920;color:#fff;font-size:12px;font-weight:1000}
    .passport-commercial-rail:hover,.passport-commercial-rail:focus-visible{background:#d71920;outline:2px solid #fff;outline-offset:-4px}
    .passport-corner-ribbon{display:none;position:fixed;z-index:94;bottom:38px;width:238px;background:#111;color:#fff!important;border:1px solid rgba(255,255,255,.24);box-shadow:0 2px 10px rgba(0,0,0,.18);padding:7px 18px;text-align:center;text-decoration:none!important;font-size:9px;line-height:1.2;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.passport-corner-ribbon--left{left:-64px;transform:rotate(45deg)}.passport-corner-ribbon--right{right:-64px;transform:rotate(-45deg)}.passport-corner-ribbon:hover,.passport-corner-ribbon:focus-visible{background:#d71920;color:#fff!important;outline:none}
    .hero .hero-copy,.hero .hero-copy h1,.hero .hero-copy h2,.hero .hero-copy h3,.hero .hero-copy a{color:#fff!important}.hero .hero-copy p{color:#d0d0d0!important}.hero .hero-copy{z-index:3}.hero-main>img{position:relative;z-index:0}.hero-main::after{pointer-events:none}
    #noticias .feature>a{display:block!important;background:transparent!important;color:#111!important;padding:0 0 16px!important;border-bottom:1px solid var(--line,#d8d8d5)!important}#noticias .feature>a>img{display:none!important}#noticias .feature>a>div{display:block!important;position:relative!important;z-index:auto!important;background:transparent!important;color:#111!important;padding:0!important;opacity:1!important;transform:none!important}#noticias .feature h1,#noticias .feature h2,#noticias .feature h3,#noticias .feature strong{color:#111!important;text-shadow:none!important;opacity:1!important}#noticias .feature p{color:#666!important;text-shadow:none!important;opacity:1!important}#noticias .feature small,#noticias .feature .eyebrow{color:#d71920!important;text-shadow:none!important;opacity:1!important}
    @media(min-width:1280px){.passport-commercial-rail,.passport-corner-ribbon{display:block}}@media(min-width:1440px){.passport-commercial-rail{width:52px;min-height:296px}.passport-commercial-rail--left{left:8px}.passport-commercial-rail--right{right:8px}.passport-commercial-rail__brand{font-size:13px}.passport-commercial-rail__copy{font-size:6.5px}}@media print{.passport-commercial-rail,.passport-corner-ribbon{display:none!important}}
  `;document.head.appendChild(style);};
  const makeRail=(item,side)=>{const a=document.createElement('a');a.href=item.href;a.className=`passport-commercial-rail passport-commercial-rail--${side}`;a.setAttribute('aria-label',item.label);a.innerHTML=`<span class="passport-commercial-rail__inner"><strong class="passport-commercial-rail__brand">${item.short}</strong><span class="passport-commercial-rail__copy">${item.copy}</span><span class="passport-commercial-rail__go" aria-hidden="true">→</span></span>`;return a;};
  const installRails=()=>{if(document.getElementById('passport-commercial-rail-left'))return;const l=makeRail(PASSPORT_LEFT,'left');l.id='passport-commercial-rail-left';const r=makeRail(PASSPORT_RIGHT,'right');r.id='passport-commercial-rail-right';document.body.append(l,r);};
  const makeRibbon=(item,side)=>{const a=document.createElement('a');a.href=item.href;a.className=`passport-corner-ribbon passport-corner-ribbon--${side}`;a.textContent=item.label;a.setAttribute('aria-label',item.label);return a;};
  const installRibbons=()=>{if(document.getElementById('passport-corner-ribbon-left'))return;const l=makeRibbon(PASSPORT_RIBBON_LEFT,'left');l.id='passport-corner-ribbon-left';const r=makeRibbon(PASSPORT_RIBBON_RIGHT,'right');r.id='passport-corner-ribbon-right';document.body.append(l,r);};
  const install=()=>{if(!document.body)return;installStyle();installRails();installRibbons();};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();