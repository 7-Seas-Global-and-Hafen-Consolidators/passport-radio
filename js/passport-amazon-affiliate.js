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
    .passport-commercial-rail{display:none;position:fixed;z-index:42;top:50%;transform:translateY(-50%);width:42px;min-height:282px;border:1px solid rgba(0,0,0,.16);box-shadow:0 7px 20px rgba(0,0,0,.13);text-decoration:none!important;overflow:hidden;isolation:isolate;animation:passportCommercialPulse 4.6s ease-in-out infinite}
    .passport-commercial-rail--left{left:3px}.passport-commercial-rail--right{right:3px;animation-delay:2.3s}
    .passport-commercial-rail[data-network="AMAZON"]{background:#131921;color:#fff!important}.passport-commercial-rail[data-network="SHOPEE"]{background:#ee4d2d;color:#fff!important}
    .passport-commercial-rail__inner{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:12px 4px}
    .passport-commercial-rail__brand,.passport-commercial-rail__copy{writing-mode:vertical-rl;transform:rotate(180deg);text-transform:uppercase}.passport-commercial-rail__brand{font-size:14px;line-height:1;font-weight:1000;letter-spacing:.065em}.passport-commercial-rail__copy{font-size:6px;line-height:1.1;font-weight:900;letter-spacing:.10em;opacity:.9}
    .passport-commercial-rail__go{width:24px;height:24px;display:grid;place-items:center;border-radius:50%;background:#fff;color:#111;font-size:13px;font-weight:1000}
    .passport-commercial-rail::after{content:'';position:absolute;inset:-45% -140%;z-index:-1;background:linear-gradient(105deg,transparent 41%,rgba(255,255,255,.48) 50%,transparent 59%);transform:translateX(-55%);animation:passportCommercialSweep 4.6s ease-in-out infinite}.passport-commercial-rail--right::after{animation-delay:2.3s}
    @keyframes passportCommercialPulse{0%,62%,100%{filter:brightness(1);box-shadow:0 7px 20px rgba(0,0,0,.13)}68%{filter:brightness(1.32);box-shadow:0 0 0 3px rgba(255,255,255,.78),0 8px 25px rgba(0,0,0,.24)}74%{filter:brightness(1);box-shadow:0 7px 20px rgba(0,0,0,.13)}80%{filter:brightness(1.24);box-shadow:0 0 0 2px rgba(255,255,255,.58),0 8px 24px rgba(0,0,0,.22)}86%{filter:brightness(1);box-shadow:0 7px 20px rgba(0,0,0,.13)}}
    @keyframes passportCommercialSweep{0%,61%,100%{transform:translateX(-55%);opacity:0}67%{opacity:1}82%{transform:translateX(55%);opacity:1}88%{opacity:0}}
    .passport-commercial-rail:hover,.passport-commercial-rail:focus-visible{outline:2px solid #fff;outline-offset:-4px;filter:brightness(1.12);animation-play-state:paused}
    .passport-corner-ribbon{display:none;position:fixed;z-index:94;bottom:38px;width:250px;background:#111;color:#f5f1e8!important;border:1px solid rgba(255,255,255,.24);box-shadow:0 2px 10px rgba(0,0,0,.18);padding:7px 18px;text-align:center;text-decoration:none!important;font-size:9px;line-height:1.2;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.passport-corner-ribbon--left{left:-66px;transform:rotate(45deg)}.passport-corner-ribbon--right{right:-66px;transform:rotate(-45deg)}.passport-corner-ribbon:hover,.passport-corner-ribbon:focus-visible{background:#d71920;color:#fff!important;outline:none}
    .passport-affiliate-legal{width:min(calc(100% - 32px),1180px);margin:0 auto;padding:8px 0 10px;color:#777;font-size:9px;line-height:1.45}
    /* Home hero hardening remains isolated from audio/player code. */
    .hero .hero-copy,.hero .hero-copy h1,.hero .hero-copy h2,.hero .hero-copy h3,.hero .hero-copy a{color:#fff!important}.hero .hero-copy p{color:#d0d0d0!important}.hero .hero-copy{z-index:3}.hero-main>img{position:relative;z-index:0}.hero-main::after{pointer-events:none}
    @media(min-width:1280px){.passport-commercial-rail,.passport-corner-ribbon{display:block}}
    @media(min-width:1440px){.passport-commercial-rail{width:58px;min-height:320px}.passport-commercial-rail--left{left:8px}.passport-commercial-rail--right{right:8px}.passport-commercial-rail__brand{font-size:18px}.passport-commercial-rail__copy{font-size:7px}}
    @media(max-width:760px){.passport-affiliate-legal{width:calc(100% - 20px);font-size:8px}}@media(prefers-reduced-motion:reduce){.passport-commercial-rail,.passport-commercial-rail::after{animation:none}}@media print{.passport-commercial-rail,.passport-corner-ribbon,.passport-affiliate-legal{display:none!important}}
  `;document.head.appendChild(style);};
  const makeRail=(item,side)=>{const a=document.createElement('a');a.href=item.href;a.target='_blank';a.rel='nofollow sponsored noopener noreferrer';a.className=`passport-commercial-rail passport-commercial-rail--${side}`;a.dataset.network=item.network;a.setAttribute('aria-label',item.label);a.innerHTML=`<span class="passport-commercial-rail__inner"><strong class="passport-commercial-rail__brand">${item.short}</strong><span class="passport-commercial-rail__copy">PARCEIRO · PASSPORT RADIO</span><span class="passport-commercial-rail__go" aria-hidden="true">↗</span></span>`;return a;};
  const installRails=()=>{if(document.getElementById('passport-commercial-rail-left'))return;const l=makeRail(AMAZON,'left');l.id='passport-commercial-rail-left';const r=makeRail(SHOPEE,'right');r.id='passport-commercial-rail-right';document.body.append(l,r);};
  const makeRibbon=(item,side)=>{const a=document.createElement('a');a.href=item.href;a.className=`passport-corner-ribbon passport-corner-ribbon--${side}`;a.textContent=item.label;a.setAttribute('aria-label',item.label);return a;};
  const installRibbons=()=>{if(document.getElementById('passport-corner-ribbon-left'))return;const l=makeRibbon(PASSPORT_LEFT,'left');l.id='passport-corner-ribbon-left';const r=makeRibbon(PASSPORT_RIGHT,'right');r.id='passport-corner-ribbon-right';document.body.append(l,r);};
  const installDisclosure=()=>{if(document.getElementById('passport-affiliate-legal'))return;const n=document.createElement('div');n.id='passport-affiliate-legal';n.className='passport-affiliate-legal';n.textContent='Como associado da Amazon, eu ganho com compras qualificadas.';const f=document.querySelector('footer');if(f)f.appendChild(n);else document.body.appendChild(n);};
  const install=()=>{if(!document.body)return;installStyle();installRails();installRibbons();installDisclosure();};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();