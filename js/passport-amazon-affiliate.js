(() => {
  'use strict';

  if (window.__PASSPORT_COMMERCIAL_LAYER__) return;
  window.__PASSPORT_COMMERCIAL_LAYER__ = true;
  window.__PASSPORT_AMAZON_AFFILIATE__ = true;

  const AMAZON_MAIN = {
    href: 'https://www.amazon.com.br/b?node=104007590011&linkCode=ll2&tag=passportradio-20&linkId=edae5781198a3cecf47411d190e375a1&ref_=as_li_ss_tl',
    label: 'VER SELEÇÃO AMAZON',
    network: 'AMAZON'
  };

  const AMAZON_ALT_1 = {
    href: 'https://amzn.to/4xnpFWZ',
    label: 'OFERTA AMAZON',
    network: 'AMAZON'
  };

  const AMAZON_ALT_2 = {
    href: 'https://amzn.to/4gi1vah',
    label: 'MAIS OFERTAS AMAZON',
    network: 'AMAZON'
  };

  const SHOPEE = {
    href: 'https://s.shopee.com.br/3qMaqyNivG',
    label: 'VER OFERTAS SHOPEE',
    network: 'SHOPEE'
  };

  const ADVERTISE = {
    href: '/anuncie.html',
    label: 'ANUNCIE NA PASSPORT',
    network: 'PASSPORT'
  };

  const installStyle = () => {
    if (document.getElementById('passport-commercial-style')) return;

    const style = document.createElement('style');
    style.id = 'passport-commercial-style';
    style.textContent = `
      .passport-commercial-top,
      .passport-commercial-marquee,
      .passport-commercial-block,
      .passport-commercial-footer,
      .passport-commercial-side,
      .passport-affiliate-legal{
        box-sizing:border-box;
        font-family:Inter,Arial,Helvetica,sans-serif;
      }
      .passport-commercial-top *,
      .passport-commercial-marquee *,
      .passport-commercial-block *,
      .passport-commercial-footer *,
      .passport-commercial-side *,
      .passport-affiliate-legal *{box-sizing:border-box}

      .passport-commercial-top a,
      .passport-commercial-block a,
      .passport-commercial-footer a,
      .passport-commercial-side a{
        color:inherit!important;
        text-decoration:none!important;
      }

      .passport-commercial-link{
        --pc-bg:#111;
        --pc-fg:#fff;
        --pc-accent:#d71920;
        position:relative;
        overflow:hidden;
        background:var(--pc-bg);
        color:var(--pc-fg)!important;
        border-color:var(--pc-accent)!important;
      }
      .passport-commercial-link[data-network="AMAZON"]{
        --pc-bg:#ff9900;
        --pc-fg:#111;
        --pc-accent:#111;
      }
      .passport-commercial-link[data-network="SHOPEE"]{
        --pc-bg:#ee4d2d;
        --pc-fg:#fff;
        --pc-accent:#fff;
      }
      .passport-commercial-link[data-network="PASSPORT"]{
        --pc-bg:#d71920;
        --pc-fg:#fff;
        --pc-accent:#111;
      }

      .passport-commercial-link::after{
        content:'';
        position:absolute;
        inset:0;
        pointer-events:none;
        border:4px solid transparent;
        animation:passportCommercialAlarm 1.45s steps(1,end) infinite;
      }
      .passport-commercial-link small::before{
        content:'●';
        margin-right:7px;
        color:#d71920;
        text-shadow:0 0 8px currentColor;
        animation:passportCommercialDot .9s steps(1,end) infinite;
      }
      .passport-commercial-link[data-network="SHOPEE"] small::before,
      .passport-commercial-link[data-network="PASSPORT"] small::before{color:#fff}
      .passport-commercial-link .passport-commercial-cta{
        animation:passportCommercialCta 1.15s steps(1,end) infinite;
      }

      @keyframes passportCommercialAlarm{
        0%,46%,100%{border-color:transparent;box-shadow:inset 0 0 0 0 rgba(255,255,255,0)}
        47%,72%{border-color:var(--pc-accent);box-shadow:inset 0 0 18px rgba(255,255,255,.42)}
      }
      @keyframes passportCommercialDot{
        0%,44%,100%{opacity:1}
        45%,72%{opacity:.12}
      }
      @keyframes passportCommercialCta{
        0%,49%,100%{opacity:1}
        50%,76%{opacity:.28}
      }
      @keyframes passportCommercialMarquee{
        from{transform:translateX(0)}
        to{transform:translateX(-50%)}
      }

      .passport-commercial-top{
        display:grid;
        grid-template-columns:minmax(0,1.45fr) minmax(340px,.85fr);
        width:100%;
        border-top:4px solid #111;
        border-bottom:4px solid #111;
        background:#111;
        position:relative;
        z-index:80;
      }
      .passport-commercial-top__main{
        display:grid;
        grid-template-columns:auto 1fr auto;
        align-items:center;
        gap:18px;
        min-height:76px;
        padding:12px max(18px,calc((100vw - 1180px)/2));
        padding-right:22px;
        border-right:2px solid #111;
      }
      .passport-commercial-top__main small,
      .passport-commercial-mini small,
      .passport-commercial-card small,
      .passport-commercial-footer__link small{
        font-size:8px;
        font-weight:1000;
        letter-spacing:.14em;
        text-transform:uppercase;
      }
      .passport-commercial-top__main strong{
        font-size:clamp(1rem,2vw,1.55rem);
        font-weight:1000;
        letter-spacing:-.04em;
      }
      .passport-commercial-top__main span,
      .passport-commercial-mini span,
      .passport-commercial-card span,
      .passport-commercial-footer__link span{
        font-size:9px;
        font-weight:1000;
        letter-spacing:.1em;
        text-transform:uppercase;
      }
      .passport-commercial-top__mini{
        display:grid;
        grid-template-columns:1fr 1fr;
        background:#111;
      }
      .passport-commercial-mini{
        display:grid;
        align-content:center;
        gap:5px;
        min-height:76px;
        padding:12px 16px;
        border-left:1px solid #333;
      }
      .passport-commercial-mini:hover,
      .passport-commercial-mini:focus-visible,
      .passport-commercial-card:hover,
      .passport-commercial-card:focus-visible,
      .passport-commercial-footer__link:hover,
      .passport-commercial-footer__link:focus-visible{
        filter:contrast(1.1) brightness(1.08);
        outline:none;
      }

      .passport-commercial-marquee{
        width:100%;
        overflow:hidden;
        border-bottom:2px solid #111;
        background:#111;
        color:#fff;
        min-height:30px;
        display:flex;
        align-items:center;
      }
      .passport-commercial-marquee__track{
        display:flex;
        width:max-content;
        min-width:200%;
        white-space:nowrap;
        animation:passportCommercialMarquee 7s linear infinite;
      }
      .passport-commercial-marquee__track span{
        display:inline-block;
        min-width:50%;
        padding:7px 28px;
        font-size:10px;
        font-weight:1000;
        letter-spacing:.13em;
        text-transform:uppercase;
      }

      .passport-commercial-block{
        width:min(calc(100% - 32px),1180px);
        margin:30px auto;
        border:4px solid #111;
        background:#fff;
        box-shadow:8px 8px 0 #ff9900;
        position:relative;
        z-index:2;
      }
      .passport-commercial-block[data-variant="2"]{box-shadow:8px 8px 0 #ee4d2d}
      .passport-commercial-block[data-variant="3"]{box-shadow:8px 8px 0 #d71920}
      .passport-commercial-block__head{
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:18px;
        padding:10px 14px;
        background:#111;
        color:#fff;
      }
      .passport-commercial-block__head span{
        font-size:8px;
        font-weight:1000;
        letter-spacing:.16em;
      }
      .passport-commercial-block__head strong{
        font-size:13px;
        letter-spacing:.04em;
      }
      .passport-commercial-grid{
        display:grid;
        grid-template-columns:repeat(4,1fr);
      }
      .passport-commercial-card{
        display:grid;
        align-content:space-between;
        gap:15px;
        min-height:145px;
        padding:18px;
        border-right:1px solid #111;
        border-bottom:0;
      }
      .passport-commercial-card:last-child{border-right:0}
      .passport-commercial-card strong{
        font-size:clamp(1.05rem,2.1vw,1.85rem);
        line-height:.94;
        letter-spacing:-.055em;
      }

      .passport-commercial-side{
        display:none;
        position:fixed;
        top:34vh;
        z-index:95;
        width:48px;
      }
      .passport-commercial-side--left{left:0}
      .passport-commercial-side--right{right:0}
      .passport-commercial-side a{
        display:flex;
        min-height:210px;
        align-items:center;
        justify-content:center;
        border:3px solid #111;
        writing-mode:vertical-rl;
        text-orientation:mixed;
        padding:10px 8px;
        font-size:10px;
        font-weight:1000;
        letter-spacing:.12em;
        text-transform:uppercase;
      }
      .passport-commercial-side--left a{transform:rotate(180deg)}

      .passport-commercial-footer{
        width:100%;
        padding:15px max(18px,calc((100vw - 1180px)/2));
        border-top:5px solid #111;
        border-bottom:1px solid #222;
        background:#111;
        color:#fff;
      }
      .passport-commercial-footer__link{
        display:grid;
        grid-template-columns:auto 1fr auto;
        align-items:center;
        gap:16px;
        min-height:64px;
        padding:12px 14px;
        border:3px solid #ee4d2d;
      }
      .passport-commercial-footer__link strong{
        font-size:clamp(1rem,2vw,1.45rem);
      }

      .passport-affiliate-legal{
        width:min(calc(100% - 32px),1180px);
        margin:0 auto;
        padding:8px 0 10px;
        color:#777;
        font-size:9px;
        line-height:1.45;
      }

      @media(min-width:1320px){
        .passport-commercial-side{display:block}
      }

      @media(max-width:900px){
        .passport-commercial-grid{grid-template-columns:1fr 1fr}
        .passport-commercial-card:nth-child(2){border-right:0}
        .passport-commercial-card:nth-child(-n+2){border-bottom:1px solid #111}
      }

      @media(max-width:760px){
        .passport-commercial-top{grid-template-columns:1fr}
        .passport-commercial-top__main{
          grid-template-columns:1fr auto;
          min-height:64px;
          padding:11px 14px;
          border-right:0;
        }
        .passport-commercial-top__main small{grid-column:1/-1}
        .passport-commercial-top__mini{grid-template-columns:1fr 1fr}
        .passport-commercial-mini{min-height:58px;padding:10px}
        .passport-commercial-mini strong{font-size:11px}
        .passport-commercial-marquee__track{animation-duration:6s}
        .passport-commercial-block{
          width:calc(100% - 20px);
          margin:20px auto;
          box-shadow:4px 4px 0 #ff9900;
        }
        .passport-commercial-block[data-variant="2"]{box-shadow:4px 4px 0 #ee4d2d}
        .passport-commercial-block[data-variant="3"]{box-shadow:4px 4px 0 #d71920}
        .passport-commercial-grid{grid-template-columns:1fr}
        .passport-commercial-card{
          min-height:88px;
          border-right:0;
          border-bottom:1px solid #111!important;
        }
        .passport-commercial-card:last-child{border-bottom:0!important}
        .passport-commercial-footer{padding:12px 10px 96px}
        .passport-commercial-footer__link{grid-template-columns:1fr auto}
        .passport-commercial-footer__link small{grid-column:1/-1}
        .passport-affiliate-legal{width:calc(100% - 20px);font-size:8px}
      }

      @media(prefers-reduced-motion:reduce){
        .passport-commercial-link::after,
        .passport-commercial-link small::before,
        .passport-commercial-link .passport-commercial-cta,
        .passport-commercial-marquee__track{animation:none!important}
      }

      @media print{
        .passport-commercial-top,
        .passport-commercial-marquee,
        .passport-commercial-block,
        .passport-commercial-footer,
        .passport-commercial-side,
        .passport-affiliate-legal{display:none!important}
      }
    `;
    document.head.appendChild(style);
  };

  const makeLink = (item, className, cta = 'VER OFERTA ↗') => {
    const a = document.createElement('a');
    a.href = item.href;
    a.target = item.network === 'PASSPORT' ? '_self' : '_blank';
    a.rel = item.network === 'PASSPORT' ? '' : 'nofollow sponsored noopener noreferrer';
    a.className = `${className} passport-commercial-link`;
    a.dataset.network = item.network;
    a.innerHTML = `<small>PUBLICIDADE</small><strong>${item.label}</strong><span class="passport-commercial-cta">${cta}</span>`;
    return a;
  };

  const installTop = () => {
    if (document.getElementById('passport-commercial-top')) return;

    const top = document.createElement('aside');
    top.id = 'passport-commercial-top';
    top.className = 'passport-commercial-top';
    top.setAttribute('aria-label', 'Publicidade');
    top.appendChild(makeLink(AMAZON_MAIN, 'passport-commercial-top__main', 'COMPRAR ↗'));

    const mini = document.createElement('div');
    mini.className = 'passport-commercial-top__mini';
    mini.appendChild(makeLink(SHOPEE, 'passport-commercial-mini', 'VER ↗'));
    mini.appendChild(makeLink(ADVERTISE, 'passport-commercial-mini', 'ANUNCIAR ↗'));
    top.appendChild(mini);

    const marquee = document.createElement('div');
    marquee.className = 'passport-commercial-marquee';
    marquee.setAttribute('aria-hidden', 'true');
    marquee.innerHTML = `<div class="passport-commercial-marquee__track"><span>PUBLICIDADE · AMAZON · SHOPEE · OFERTAS · ANUNCIE NA PASSPORT · 20 DIAS GRÁTIS · PUBLICIDADE · AMAZON · SHOPEE · OFERTAS · ANUNCIE NA PASSPORT · 20 DIAS GRÁTIS ·</span><span>PUBLICIDADE · AMAZON · SHOPEE · OFERTAS · ANUNCIE NA PASSPORT · 20 DIAS GRÁTIS · PUBLICIDADE · AMAZON · SHOPEE · OFERTAS · ANUNCIE NA PASSPORT · 20 DIAS GRÁTIS ·</span></div>`;

    const header = document.querySelector('header');
    if (header && header.parentNode) {
      header.insertAdjacentElement('afterend', top);
      top.insertAdjacentElement('afterend', marquee);
    } else {
      document.body.prepend(marquee);
      document.body.prepend(top);
    }
  };

  const buildBlock = (id, title, items, variant) => {
    const wrap = document.createElement('aside');
    wrap.id = id;
    wrap.className = 'passport-commercial-block';
    wrap.dataset.variant = String(variant);
    wrap.setAttribute('aria-label', 'Publicidade');
    wrap.innerHTML = `<div class="passport-commercial-block__head"><span>PUBLICIDADE</span><strong>${title}</strong></div>`;

    const grid = document.createElement('div');
    grid.className = 'passport-commercial-grid';
    items.forEach((item) => grid.appendChild(makeLink(item, 'passport-commercial-card')));
    wrap.appendChild(grid);
    return wrap;
  };

  const installInlineBlocks = () => {
    const main = document.querySelector('main');
    if (!main) return;

    const sections = [...main.querySelectorAll(':scope > section')];
    const plans = [
      {
        index: 1,
        id: 'passport-commercial-inline-1',
        title: 'OFERTAS & ACHADOS',
        items: [AMAZON_MAIN, SHOPEE, AMAZON_ALT_1, ADVERTISE],
        variant: 1
      },
      {
        index: 4,
        id: 'passport-commercial-inline-2',
        title: 'MAIS OFERTAS',
        items: [SHOPEE, AMAZON_ALT_2, ADVERTISE, AMAZON_ALT_1],
        variant: 2
      },
      {
        index: 7,
        id: 'passport-commercial-inline-3',
        title: 'PUBLICIDADE',
        items: [AMAZON_ALT_1, ADVERTISE, SHOPEE, AMAZON_MAIN],
        variant: 3
      }
    ];

    if (sections.length) {
      plans.forEach((plan) => {
        if (document.getElementById(plan.id)) return;
        if (plan.index >= sections.length) return;
        sections[plan.index].insertAdjacentElement('afterend', buildBlock(plan.id, plan.title, plan.items, plan.variant));
      });
      return;
    }

    if (!document.getElementById('passport-commercial-inline-1') && main.firstElementChild) {
      main.firstElementChild.insertAdjacentElement(
        'afterend',
        buildBlock('passport-commercial-inline-1', 'OFERTAS & ACHADOS', [AMAZON_MAIN, SHOPEE, AMAZON_ALT_1, ADVERTISE], 1)
      );
    }
  };

  const installSideRails = () => {
    if (document.getElementById('passport-commercial-side-left')) return;

    const left = document.createElement('aside');
    left.id = 'passport-commercial-side-left';
    left.className = 'passport-commercial-side passport-commercial-side--left';
    left.appendChild(makeLink(AMAZON_ALT_2, 'passport-commercial-side__link', ''));

    const right = document.createElement('aside');
    right.id = 'passport-commercial-side-right';
    right.className = 'passport-commercial-side passport-commercial-side--right';
    right.appendChild(makeLink(SHOPEE, 'passport-commercial-side__link', ''));

    document.body.appendChild(left);
    document.body.appendChild(right);
  };

  const installFooterAd = () => {
    if (document.getElementById('passport-commercial-footer')) return;

    const footer = document.querySelector('footer');
    const wrap = document.createElement('aside');
    wrap.id = 'passport-commercial-footer';
    wrap.className = 'passport-commercial-footer';
    wrap.setAttribute('aria-label', 'Publicidade');
    wrap.appendChild(makeLink(SHOPEE, 'passport-commercial-footer__link', 'VER OFERTAS ↗'));

    if (footer) footer.insertAdjacentElement('beforebegin', wrap);
    else document.body.appendChild(wrap);
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
    installTop();
    installInlineBlocks();
    installSideRails();
    installFooterAd();
    installAmazonDisclosure();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
