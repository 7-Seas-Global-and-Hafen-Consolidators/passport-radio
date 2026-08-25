(() => {
  'use strict';

  if (window.__PASSPORT_AMAZON_AFFILIATE__) return;
  window.__PASSPORT_AMAZON_AFFILIATE__ = true;

  const AMAZON_LINKS = [
    { href: 'https://www.amazon.com.br/b?node=104007590011&linkCode=ll2&tag=passportradio-20&linkId=edae5781198a3cecf47411d190e375a1&ref_=as_li_ss_tl', label: 'VER SELEÇÃO AMAZON', network: 'AMAZON' },
    { href: 'https://amzn.to/4xnpFWZ', label: 'ACHADO AMAZON 01', network: 'AMAZON' },
    { href: 'https://amzn.to/4gi1vah', label: 'ACHADO AMAZON 02', network: 'AMAZON' }
  ];

  const SHOPEE_LINK = {
    href: 'https://s.shopee.com.br/3qMaqyNivG',
    label: 'VER OFERTAS SHOPEE',
    network: 'SHOPEE'
  };

  const DISCLOSURE = 'Publicidade e links de afiliado. A Passport Radio pode receber comissão por compras qualificadas.';

  const installStyle = () => {
    if (document.getElementById('passport-amazon-affiliate-style')) return;
    const style = document.createElement('style');
    style.id = 'passport-amazon-affiliate-style';
    style.textContent = `
      .passport-amazon-toprail,.passport-amazon-mid,.passport-amazon-footer{box-sizing:border-box;font-family:Inter,Arial,sans-serif}
      .passport-amazon-toprail *,.passport-amazon-mid *,.passport-amazon-footer *{box-sizing:border-box}
      .passport-amazon-toprail{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(320px,.75fr);width:100%;border-top:3px solid #ff9900;border-bottom:3px solid #111;background:#ff9900;color:#111;position:relative;z-index:80}
      .passport-amazon-toprail a,.passport-amazon-mid a,.passport-amazon-footer a{color:inherit!important;text-decoration:none!important}
      .passport-amazon-toprail__main{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:18px;min-height:70px;padding:12px max(18px,calc((100vw - 1180px)/2));padding-right:22px;background:#ff9900;color:#111!important}
      .passport-amazon-toprail__main small,.passport-amazon-mini small,.passport-amazon-card small,.passport-amazon-footer__link small{font-size:8px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;opacity:.72}
      .passport-amazon-toprail__main strong{font-size:clamp(1rem,2vw,1.55rem);font-weight:1000;letter-spacing:-.035em}
      .passport-amazon-toprail__main span,.passport-amazon-mini span,.passport-amazon-card span,.passport-amazon-footer__link span{font-size:9px;font-weight:1000;letter-spacing:.08em;text-transform:uppercase}
      .passport-amazon-toprail__mini{display:grid;grid-template-columns:1fr 1fr;background:#111}
      .passport-amazon-mini{display:grid;align-content:center;gap:4px;min-height:70px;padding:12px 16px;border-left:1px solid #333;background:#111;color:#fff!important}
      .passport-amazon-mini:hover,.passport-amazon-mini:focus-visible{background:#d71920;color:#fff!important;outline:none}
      .passport-amazon-mini[data-network="SHOPEE"]{background:#ee4d2d;color:#fff!important}
      .passport-amazon-mini[data-network="SHOPEE"]:hover,.passport-amazon-mini[data-network="SHOPEE"]:focus-visible{background:#ff5a36}
      .passport-amazon-mid{width:min(calc(100% - 32px),1180px);margin:32px auto;border:4px solid #111;background:#fff;box-shadow:8px 8px 0 #ff9900}
      .passport-amazon-mid__head{display:flex;justify-content:space-between;align-items:center;gap:18px;padding:11px 14px;background:#111;color:#fff}
      .passport-amazon-mid__head span{font-size:8px;font-weight:900;letter-spacing:.15em}.passport-amazon-mid__head strong{font-size:13px;letter-spacing:.04em}
      .passport-amazon-mid__grid{display:grid;grid-template-columns:repeat(3,1fr)}
      .passport-amazon-card{display:grid;align-content:space-between;gap:14px;min-height:150px;padding:18px;border-right:1px solid #111;background:#ff9900;color:#111!important}
      .passport-amazon-card:nth-child(2){background:#fff}.passport-amazon-card:nth-child(3){border-right:0;background:#ee4d2d;color:#fff!important}
      .passport-amazon-card strong{font-size:clamp(1.15rem,2.3vw,2rem);line-height:.92;letter-spacing:-.055em}.passport-amazon-card:hover,.passport-amazon-card:focus-visible{filter:contrast(1.12);outline:4px solid #111;outline-offset:-4px}
      .passport-amazon-disclosure{margin:0;padding:9px 14px;border-top:1px solid #111;background:#f4f1eb;color:#333;font-size:9px!important;font-weight:700;line-height:1.4}
      .passport-amazon-footer{width:100%;padding:18px max(18px,calc((100vw - 1180px)/2));border-top:5px solid #ee4d2d;border-bottom:1px solid #2f2f2f;background:#111;color:#fff}
      .passport-amazon-footer__link{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:16px;min-height:58px;padding:12px 14px;border:2px solid #ee4d2d;background:#111;color:#fff!important}
      .passport-amazon-footer__link strong{font-size:clamp(1rem,2vw,1.5rem)}.passport-amazon-footer .passport-amazon-disclosure{margin-top:8px;padding:0;border:0;background:transparent;color:#bbb}
      @media(max-width:760px){
        .passport-amazon-toprail{grid-template-columns:1fr}.passport-amazon-toprail__main{grid-template-columns:1fr auto;min-height:62px;padding:11px 14px}.passport-amazon-toprail__main small{grid-column:1/-1}.passport-amazon-toprail__mini{grid-template-columns:1fr 1fr}.passport-amazon-mini{min-height:58px;padding:10px}.passport-amazon-mini strong{font-size:11px}.passport-amazon-mid{width:calc(100% - 20px);margin:20px auto;box-shadow:4px 4px 0 #ff9900}.passport-amazon-mid__grid{grid-template-columns:1fr}.passport-amazon-card{min-height:92px;border-right:0;border-bottom:1px solid #111}.passport-amazon-card:last-child{border-bottom:0}.passport-amazon-footer{padding:14px 10px 96px}.passport-amazon-footer__link{grid-template-columns:1fr auto}.passport-amazon-footer__link small{grid-column:1/-1}
      }
      @media print{.passport-amazon-toprail,.passport-amazon-mid,.passport-amazon-footer{display:none!important}}
    `;
    document.head.appendChild(style);
  };

  const makeLink = (item, className) => {
    const a = document.createElement('a');
    a.href = item.href;
    a.target = '_blank';
    a.rel = 'nofollow sponsored noopener noreferrer';
    a.className = className;
    a.dataset.passportAffiliate = '1';
    a.dataset.network = item.network;
    a.innerHTML = `<small>PUBLICIDADE · LINK DE AFILIADO · ${item.network}</small><strong>${item.label}</strong><span>COMPRAR ↗</span>`;
    return a;
  };

  const installTopRail = () => {
    if (document.getElementById('passport-amazon-toprail')) return;
    const rail = document.createElement('aside');
    rail.id = 'passport-amazon-toprail';
    rail.className = 'passport-amazon-toprail';
    rail.setAttribute('aria-label', 'Publicidade e links de afiliado');
    rail.appendChild(makeLink(AMAZON_LINKS[0], 'passport-amazon-toprail__main'));
    const mini = document.createElement('div');
    mini.className = 'passport-amazon-toprail__mini';
    mini.appendChild(makeLink(AMAZON_LINKS[1], 'passport-amazon-mini'));
    mini.appendChild(makeLink(SHOPEE_LINK, 'passport-amazon-mini'));
    rail.appendChild(mini);

    const header = document.querySelector('header');
    if (header && header.parentNode) header.insertAdjacentElement('afterend', rail);
    else document.body.prepend(rail);
  };

  const installMid = () => {
    if (document.getElementById('passport-amazon-mid')) return;
    const main = document.querySelector('main');
    if (!main) return;
    const sections = [...main.querySelectorAll(':scope > section')];
    const anchor = sections[Math.min(2, Math.max(0, sections.length - 1))] || main.firstElementChild;
    if (!anchor) return;

    const wrap = document.createElement('aside');
    wrap.id = 'passport-amazon-mid';
    wrap.className = 'passport-amazon-mid';
    wrap.setAttribute('aria-label', 'Links patrocinados e de afiliado');
    wrap.innerHTML = `<div class="passport-amazon-mid__head"><span>PUBLICIDADE</span><strong>OFERTAS & ACHADOS</strong></div>`;
    const grid = document.createElement('div');
    grid.className = 'passport-amazon-mid__grid';
    [AMAZON_LINKS[0], AMAZON_LINKS[2], SHOPEE_LINK].forEach((item) => grid.appendChild(makeLink(item, 'passport-amazon-card')));
    wrap.appendChild(grid);
    const note = document.createElement('p');
    note.className = 'passport-amazon-disclosure';
    note.textContent = DISCLOSURE;
    wrap.appendChild(note);
    anchor.insertAdjacentElement('afterend', wrap);
  };

  const installFooter = () => {
    if (document.getElementById('passport-amazon-footer')) return;
    const footer = document.querySelector('footer');
    const wrap = document.createElement('aside');
    wrap.id = 'passport-amazon-footer';
    wrap.className = 'passport-amazon-footer';
    wrap.setAttribute('aria-label', 'Publicidade e links de afiliado');
    wrap.appendChild(makeLink(SHOPEE_LINK, 'passport-amazon-footer__link'));
    const note = document.createElement('p');
    note.className = 'passport-amazon-disclosure';
    note.textContent = DISCLOSURE;
    wrap.appendChild(note);
    if (footer) footer.insertAdjacentElement('beforebegin', wrap);
    else document.body.appendChild(wrap);
  };

  const install = () => {
    if (!document.body) return;
    installStyle();
    installTopRail();
    installMid();
    installFooter();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
})();
