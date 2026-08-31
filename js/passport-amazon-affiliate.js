(() => {
  'use strict';

  if (window.__PASSPORT_COMMERCIAL_LAYER__) return;
  window.__PASSPORT_COMMERCIAL_LAYER__ = true;
  window.__PASSPORT_AMAZON_AFFILIATE__ = true;

  const AMAZON = {
    href: 'https://www.amazon.com.br/b?node=104007590011&linkCode=ll2&tag=passportradio-20&linkId=edae5781198a3cecf47411d190e375a1&ref_=as_li_ss_tl',
    label: 'AMAZON · SELEÇÃO PASSPORT', short: 'AMAZON', network: 'AMAZON'
  };
  const SHOPEE = {
    href: 'https://s.shopee.com.br/3qMaqyNivG', label: 'SHOPEE · ACHADOS PASSPORT', short: 'SHOPEE', network: 'SHOPEE'
  };
  const PASSPORT_LEFT = { href: '/radio-mundo-player.html', label: 'WORLD DIAL · ABRIR SINAL', network: 'PASSPORT' };
  const PASSPORT_RIGHT = { href: '/radio.html#passportTunnels', label: 'TUNNELS™ · ENTRAR', network: 'PASSPORT' };

  const installStyle = () => {
    if (document.getElementById('passport-commercial-style')) return;
    const style = document.createElement('style');
    style.id = 'passport-commercial-style';
    style.textContent = `
      .passport-commercial-rail,.passport-corner-ribbon,.passport-affiliate-legal{box-sizing:border-box;font-family:Inter,Arial,Helvetica,sans-serif}
      .passport-commercial-rail{display:none;position:fixed;z-index:42;top:50%;transform:translateY(-50%);width:46px;min-height:300px;border:1px solid rgba(0,0,0,.16);box-shadow:0 8px 24px rgba(0,0,0,.12);text-decoration:none!important;overflow:hidden;isolation:isolate}
      .passport-commercial-rail--left{left:3px}.passport-commercial-rail--right{right:3px}
      .passport-commercial-rail[data-network="AMAZON"]{background:#131921;color:#fff!important}
      .passport-commercial-rail[data-network="SHOPEE"]{background:#ee4d2d;color:#fff!important}
      .passport-commercial-rail__inner{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:13px 5px}
      .passport-commercial-rail__brand,.passport-commercial-rail__copy{writing-mode:vertical-rl;transform:rotate(180deg);text-transform:uppercase}
      .passport-commercial-rail__brand{font-size:15px;line-height:1;font-weight:1000;letter-spacing:.07em}
      .passport-commercial-rail__copy{font-size:6px;line-height:1.1;font-weight:900;letter-spacing:.11em;opacity:.9}
      .passport-commercial-rail__go{width:26px;height:26px;display:grid;place-items:center;border-radius:50%;background:#fff;color:#111;font-size:14px;font-weight:1000}
      .passport-commercial-rail::after{content:'';position:absolute;inset:-45% -140%;z-index:-1;background:linear-gradient(105deg,transparent 42%,rgba(255,255,255,.32) 50%,transparent 58%);transform:translateX(-55%);animation:passportCommercialSweep 5.2s ease-in-out infinite}
      .passport-commercial-rail:hover,.passport-commercial-rail:focus-visible{outline:2px solid #fff;outline-offset:-4px;filter:brightness(1.08)}
      @keyframes passportCommercialSweep{0%,70%,100%{transform:translateX(-55%);opacity:0}76%{opacity:1}90%{transform:translateX(55%);opacity:1}94%{opacity:0}}
      .passport-corner-ribbon{display:none;position:fixed;z-index:94;bottom:38px;width:250px;background:#111;color:#f5f1e8!important;border:1px solid rgba(255,255,255,.24);box-shadow:0 2px 10px rgba(0,0,0,.18);padding:7px 18px;text-align:center;text-decoration:none!important;font-size:9px;line-height:1.2;font-weight:900;letter-spacing:.12em;text-transform:uppercase}
      .passport-corner-ribbon--left{left:-66px;transform:rotate(45deg)}.passport-corner-ribbon--right{right:-66px;transform:rotate(-45deg)}
      .passport-corner-ribbon:hover,.passport-corner-ribbon:focus-visible{background:#d71920;color:#fff!important;outline:none}
      .passport-affiliate-legal{width:min(calc(100% - 32px),1180px);margin:0 auto;padding:8px 0 10px;color:#777;font-size:9px;line-height:1.45}
      @media(min-width:1280px){.passport-commercial-rail,.passport-corner-ribbon{display:block}}
      @media(min-width:1440px){.passport-commercial-rail{width:64px;min-height:340px}.passport-commercial-rail--left{left:8px}.passport-commercial-rail--right{right:8px}.passport-commercial-rail__brand{font-size:19px}.passport-commercial-rail__copy{font-size:7px}}
      @media(max-width:760px){.passport-affiliate-legal{width:calc(100% - 20px);font-size:8px}}
      @media(prefers-reduced-motion:reduce){.passport-commercial-rail::after{animation:none}}
      @media print{.passport-commercial-rail,.passport-corner-ribbon,.passport-affiliate-legal{display:none!important}}
    `;
    document.head.appendChild(style);
  };

  const makeCommercialRail = (item, side) => {
    const a = document.createElement('a'); a.href=item.href; a.target='_blank'; a.rel='nofollow sponsored noopener noreferrer';
    a.className=`passport-commercial-rail passport-commercial-rail--${side}`; a.dataset.network=item.network; a.setAttribute('aria-label',item.label);
    a.innerHTML=`<span class="passport-commercial-rail__inner"><strong class="passport-commercial-rail__brand">${item.short}</strong><span class="passport-commercial-rail__copy">PARCEIRO · PASSPORT RADIO</span><span class="passport-commercial-rail__go" aria-hidden="true">↗</span></span>`; return a;
  };
  const installCommercialRails = () => { if(document.getElementById('passport-commercial-rail-left'))return; const amazon=makeCommercialRail(AMAZON,'left');amazon.id='passport-commercial-rail-left';const shopee=makeCommercialRail(SHOPEE,'right');shopee.id='passport-commercial-rail-right';document.body.append(amazon,shopee); };
  const makeRibbon=(item,side)=>{const a=document.createElement('a');a.href=item.href;a.className=`passport-corner-ribbon passport-corner-ribbon--${side}`;a.textContent=item.label;a.setAttribute('aria-label',item.label);return a;};
  const installPassportRibbons=()=>{if(document.getElementById('passport-corner-ribbon-left'))return;const left=makeRibbon(PASSPORT_LEFT,'left');left.id='passport-corner-ribbon-left';const right=makeRibbon(PASSPORT_RIGHT,'right');right.id='passport-corner-ribbon-right';document.body.append(left,right);};
  const installAmazonDisclosure=()=>{if(document.getElementById('passport-affiliate-legal'))return;const note=document.createElement('div');note.id='passport-affiliate-legal';note.className='passport-affiliate-legal';note.textContent='Como associado da Amazon, eu ganho com compras qualificadas.';const footer=document.querySelector('footer');if(footer)footer.appendChild(note);else document.body.appendChild(note);};
  const install=()=>{if(!document.body)return;installStyle();installCommercialRails();installPassportRibbons();installAmazonDisclosure();};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();