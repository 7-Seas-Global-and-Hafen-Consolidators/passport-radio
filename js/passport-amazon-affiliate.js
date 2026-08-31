(() => {
  'use strict';

  if (window.__PASSPORT_COMMERCIAL_LAYER__) return;
  window.__PASSPORT_COMMERCIAL_LAYER__ = true;
  window.__PASSPORT_AMAZON_AFFILIATE__ = true;

  const AMAZON = {
    href: 'https://www.amazon.com.br/b?node=104007590011&linkCode=ll2&tag=passportradio-20&linkId=edae5781198a3cecf47411d190e375a1&ref_=as_li_ss_tl',
    label: 'AMAZON · SELEÇÃO PASSPORT',
    network: 'AMAZON'
  };

  const SHOPEE = {
    href: 'https://s.shopee.com.br/3qMaqyNivG',
    label: 'SHOPEE · ACHADOS PASSPORT',
    network: 'SHOPEE'
  };

  const PASSPORT_LEFT = {
    href: '/radio-mundo-player.html',
    label: 'WORLD DIAL · ABRIR SINAL',
    network: 'PASSPORT'
  };

  const PASSPORT_RIGHT = {
    href: '/radio.html#passportTunnels',
    label: 'TUNNELS™ · ENTRAR',
    network: 'PASSPORT'
  };

  const installStyle = () => {
    if (document.getElementById('passport-commercial-style')) return;
    const style = document.createElement('style');
    style.id = 'passport-commercial-style';
    style.textContent = `
      .passport-sponsor-strip,
      .passport-corner-ribbon,
      .passport-affiliate-legal{box-sizing:border-box;font-family:Inter,Arial,Helvetica,sans-serif}
      .passport-sponsor-strip *{box-sizing:border-box}
      .passport-sponsor-strip{
        width:min(calc(100% - 32px),1180px);
        margin:22px auto 28px;
        display:grid;
        grid-template-columns:1fr 1fr;
        border:1px solid rgba(17,17,17,.18);
        background:#f5f1e8;
        color:#111;
      }
      .passport-sponsor-strip__link{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:18px;
        min-height:58px;
        padding:12px 16px;
        color:inherit!important;
        text-decoration:none!important;
      }
      .passport-sponsor-strip__link + .passport-sponsor-strip__link{border-left:1px solid rgba(17,17,17,.18)}
      .passport-sponsor-strip__copy{display:grid;gap:3px}
      .passport-sponsor-strip small{
        font-size:8px;
        font-weight:800;
        letter-spacing:.16em;
        text-transform:uppercase;
        color:#6d685f;
      }
      .passport-sponsor-strip strong{
        font-size:12px;
        font-weight:900;
        letter-spacing:.035em;
        text-transform:uppercase;
      }
      .passport-sponsor-strip__go{font-size:15px;font-weight:900}
      .passport-sponsor-strip__link:hover,
      .passport-sponsor-strip__link:focus-visible{background:#fff;outline:2px solid #111;outline-offset:-2px}

      .passport-corner-ribbon{
        display:none;
        position:fixed;
        z-index:94;
        bottom:38px;
        width:250px;
        background:#111;
        color:#f5f1e8!important;
        border:1px solid rgba(255,255,255,.24);
        box-shadow:0 2px 10px rgba(0,0,0,.18);
        padding:7px 18px;
        text-align:center;
        text-decoration:none!important;
        font-size:9px;
        line-height:1.2;
        font-weight:900;
        letter-spacing:.12em;
        text-transform:uppercase;
      }
      .passport-corner-ribbon--left{left:-66px;transform:rotate(45deg)}
      .passport-corner-ribbon--right{right:-66px;transform:rotate(-45deg)}
      .passport-corner-ribbon:hover,
      .passport-corner-ribbon:focus-visible{background:#d71920;color:#fff!important;outline:none}

      .passport-affiliate-legal{
        width:min(calc(100% - 32px),1180px);
        margin:0 auto;
        padding:8px 0 10px;
        color:#777;
        font-size:9px;
        line-height:1.45;
      }

      @media(min-width:1280px){.passport-corner-ribbon{display:block}}
      @media(max-width:760px){
        .passport-sponsor-strip{width:calc(100% - 20px);grid-template-columns:1fr;margin:16px auto 20px}
        .passport-sponsor-strip__link + .passport-sponsor-strip__link{border-left:0;border-top:1px solid rgba(17,17,17,.18)}
        .passport-affiliate-legal{width:calc(100% - 20px);font-size:8px}
      }
      @media print{
        .passport-sponsor-strip,.passport-corner-ribbon,.passport-affiliate-legal{display:none!important}
      }
    `;
    document.head.appendChild(style);
  };

  const makeSponsor = (item) => {
    const a = document.createElement('a');
    a.href = item.href;
    a.target = '_blank';
    a.rel = 'nofollow sponsored noopener noreferrer';
    a.className = 'passport-sponsor-strip__link';
    a.dataset.network = item.network;
    a.innerHTML = `<span class="passport-sponsor-strip__copy"><small>PARCEIRO · PASSPORT RADIO</small><strong>${item.label}</strong></span><span class="passport-sponsor-strip__go" aria-hidden="true">↗</span>`;
    return a;
  };

  const installSponsorStrip = () => {
    if (document.getElementById('passport-sponsor-strip')) return;
    const strip = document.createElement('aside');
    strip.id = 'passport-sponsor-strip';
    strip.className = 'passport-sponsor-strip';
    strip.setAttribute('aria-label', 'Parceiros Passport Radio');
    strip.appendChild(makeSponsor(AMAZON));
    strip.appendChild(makeSponsor(SHOPEE));

    const header = document.querySelector('header');
    const main = document.querySelector('main');
    if (header && header.parentNode) header.insertAdjacentElement('afterend', strip);
    else if (main) main.insertAdjacentElement('beforebegin', strip);
    else document.body.prepend(strip);
  };

  const makeRibbon = (item, side) => {
    const a = document.createElement('a');
    a.href = item.href;
    a.className = `passport-corner-ribbon passport-corner-ribbon--${side}`;
    a.textContent = item.label;
    a.setAttribute('aria-label', item.label);
    return a;
  };

  const installPassportRibbons = () => {
    if (document.getElementById('passport-corner-ribbon-left')) return;
    const left = makeRibbon(PASSPORT_LEFT, 'left');
    left.id = 'passport-corner-ribbon-left';
    const right = makeRibbon(PASSPORT_RIGHT, 'right');
    right.id = 'passport-corner-ribbon-right';
    document.body.append(left, right);
  };

  const installAmazonDisclosure = () => {
    if (document.getElementById('passport-affiliate-legal')) return;
    const note = document.createElement('div');
    note.id = 'passport-affiliate-legal';
    note.className = 'passport-affiliate-legal';
    note.textContent = 'Como associado da Amazon, eu ganho com compras qualificadas.';
    const footer = document.querySelector('footer');
    if (footer) footer.appendChild(note);
    else document.body.appendChild(note);
  };

  const install = () => {
    if (!document.body) return;
    installStyle();
    installSponsorStrip();
    installPassportRibbons();
    installAmazonDisclosure();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once:true });
  else install();
})();