(() => {
  'use strict';
  if (window.__PASSPORT_COMMERCIAL_LAYER__) return;
  window.__PASSPORT_COMMERCIAL_LAYER__ = true;
  window.__PASSPORT_AMAZON_AFFILIATE__ = true;
  const AMAZON={href:'https://www.amazon.com.br/b?node=104007590011&linkCode=ll2&tag=passportradio-20&linkId=edae5781198a3cecf47411d190e375a1&ref_=as_li_ss_tl',label:'AMAZON · SELEÇÃO PASSPORT',short:'AMAZON',network:'AMAZON'};
  const SHOPEE={href:'https://s.shopee.com.br/3qMaqyNivG',label:'SHOPEE · ACHADOS PASSPORT',short:'SHOPEE',network:'SHOPEE'};
  const PASSPORT_LEFT={href:'/radio-mundo-player.html',label:'WORLD DIAL · ABRIR SINAL'};
  const PASSPORT_RIGHT={href:'/radio.html#passportTunnels',label:'TUNNELS™ · ENTRAR'};
  const installStyle=()=>{if(document.getElementById('passport-commercial-style'))return;const style=document.createElement('style');style.id='passport-commercial-style';style.textContent=`
    /* Commercial rails live only in the outer desktop margins. */
    .passport-commercial-rail,.passport-corner-ribbon,.passport-affiliate-legal{box-sizing:border-box;font-family:Inter,Arial,Helvetica,sans-serif}
    .passport-commercial-rail{display:none;position:fixed;z-index:42;top:50%;transform:translateY(-50%);width:38px;min-height:258px;border:1px solid rgba(0,0,0,.16);box-shadow:0 6px 17px rgba(0,0,0,.12);text-decoration:none!important;overflow:hidden;isolation:isolate}
    .passport-commercial-rail--left{left:3px}.passport-commercial-rail--right{right:3px}
    .passport-commercial-rail[data-network="AMAZON"]{background:#131921;color:#fff!important}.passport-commercial-rail[data-network="SHOPEE"]{background:#ee4d2d;color:#fff!important}
    .passport-commercial-rail__inner{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:11px 3px}
    .passport-commercial-rail__brand,.passport-commercial-rail__copy{writing-mode:vertical-rl;transform:rotate(180deg);text-transform:uppercase}.passport-commercial-rail__brand{font-size:13px;line-height:1;font-weight:1000;letter-spacing:.06em}.passport-commercial-rail__copy{font-size:5.5px;line-height:1.1;font-weight:900;letter-spacing:.09em;opacity:.9}
    .passport-commercial-rail__go{width:22px;height:22px;display:grid;place-items:center;border-radius:50%;background:#fff;color:#111;font-size:12px;font-weight:1000}
    .passport-commercial-rail:hover,.passport-commercial-rail:focus-visible{outline:2px solid #fff;outline-offset:-4px;filter:brightness(1.08)}

    /* Passport navigation ribbons — THESE are the attention signal. */
    .passport-corner-ribbon{display:none;position:fixed;z-index:94;bottom:38px;width:238px;background:#111;color:#f5f1e8!important;border:1px solid rgba(255,255,255,.24);box-shadow:0 2px 10px rgba(0,0,0,.18);padding:7px 18px;text-align:center;text-decoration:none!important;font-size:9px;line-height:1.2;font-weight:900;letter-spacing:.12em;text-transform:uppercase;animation:passportRibbonBlink 3.8s ease-in-out infinite}.passport-corner-ribbon--left{left:-64px;transform:rotate(45deg)}.passport-corner-ribbon--right{right:-64px;transform:rotate(-45deg);animation-delay:1.9s}.passport-corner-ribbon:hover,.passport-corner-ribbon:focus-visible{background:#d71920;color:#fff!important;outline:none;animation-play-state:paused}
    @keyframes passportRibbonBlink{0%,58%,100%{background:#111;color:#f5f1e8;box-shadow:0 2px 10px rgba(0,0,0,.18)}66%{background:#d71920;color:#fff;box-shadow:0 0 0 3px rgba(215,25,32,.22),0 0 22px rgba(215,25,32,.68)}74%{background:#111;color:#f5f1e8;box-shadow:0 2px 10px rgba(0,0,0,.18)}82%{background:#d71920;color:#fff;box-shadow:0 0 0 2px rgba(215,25,32,.18),0 0 18px rgba(215,25,32,.58)}90%{background:#111;color:#f5f1e8;box-shadow:0 2px 10px rgba(0,0,0,.18)}}

    .passport-affiliate-legal{width:min(calc(100% - 32px),1180px);margin:0 auto;padding:8px 0 10px;color:#777;font-size:9px;line-height:1.45}

    /* Home hero stays readable. */
    .hero .hero-copy,.hero .hero-copy h1,.hero .hero-copy h2,.hero .hero-copy h3,.hero .hero-copy a{color:#fff!important}.hero .hero-copy p{color:#d0d0d0!important}.hero .hero-copy{z-index:3}.hero-main>img{position:relative;z-index:0}.hero-main::after{pointer-events:none}

    /* Radar/Noticias feature: copy is inside the dark photographic panel, so force light ink there. */
    #noticias .feature>a{position:relative;color:#fff!important}
    #noticias .feature>a>div{position:relative;z-index:3;color:#fff!important}
    #noticias .feature h1,#noticias .feature h2,#noticias .feature h3,#noticias .feature strong{color:#fff!important;text-shadow:0 2px 12px rgba(0,0,0,.72)}
    #noticias .feature p{color:#e8e8e8!important;text-shadow:0 1px 8px rgba(0,0,0,.72)}
    #noticias .feature small,#noticias .feature .eyebrow{color:#ff5056!important;text-shadow:0 1px 8px rgba(0,0,0,.75)}
    #noticias .feature img{position:relative;z-index:0}

    @media(min-width:1280px){.passport-commercial-rail,.passport-corner-ribbon{display:block}}
    @media(min-width:1440px){.passport-commercial-rail{width:52px;min-height:296px}.passport-commercial-rail--left{left:8px}.passport-commercial-rail--right{right:8px}.passport-commercial-rail__brand{font-size:16px}.passport-commercial-rail__copy{font-size:6.5px}}
    @media(max-width:760px){.passport-affiliate-legal{width:calc(100% - 20px);font-size:8px}}@media(prefers-reduced-motion:reduce){.passport-corner-ribbon{animation:none}}@media print{.passport-commercial-rail,.passport-corner-ribbon,.passport-affiliate-legal{display:none!important}}
  `;document.head.appendChild(style);};
  const makeRail=(item,side)=>{const a=document.createElement('a');a.href=item.href;a.target='_blank';a.rel='nofollow sponsored noopener noreferrer';a.className=`passport-commercial-rail passport-commercial-rail--${side}`;a.dataset.network=item.network;a.setAttribute('aria-label',item.label);a.innerHTML=`<span class="passport-commercial-rail__inner"><strong class="passport-commercial-rail__brand">${item.short}</strong><span class="passport-commercial-rail__copy">PARCEIRO · PASSPORT RADIO</span><span class="passport-commercial-rail__go" aria-hidden="true">↗</span></span>`;return a;};
  const installRails=()=>{if(document.getElementById('passport-commercial-rail-left'))return;const l=makeRail(AMAZON,'left');l.id='passport-commercial-rail-left';const r=makeRail(SHOPEE,'right');r.id='passport-commercial-rail-right';document.body.append(l,r);};
  const makeRibbon=(item,side)=>{const a=document.createElement('a');a.href=item.href;a.className=`passport-corner-ribbon passport-corner-ribbon--${side}`;a.textContent=item.label;a.setAttribute('aria-label',item.label);return a;};
  const installRibbons=()=>{if(document.getElementById('passport-corner-ribbon-left'))return;const l=makeRibbon(PASSPORT_LEFT,'left');l.id='passport-corner-ribbon-left';const r=makeRibbon(PASSPORT_RIGHT,'right');r.id='passport-corner-ribbon-right';document.body.append(l,r);};
  const installDisclosure=()=>{if(document.getElementById('passport-affiliate-legal'))return;const n=document.createElement('div');n.id='passport-affiliate-legal';n.className='passport-affiliate-legal';n.textContent='Como associado da Amazon, eu ganho com compras qualificadas.';const f=document.querySelector('footer');if(f)f.appendChild(n);else document.body.appendChild(n);};
  const install=()=>{if(!document.body)return;installStyle();installRails();installRibbons();installDisclosure();};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();