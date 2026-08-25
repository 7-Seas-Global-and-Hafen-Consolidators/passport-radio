(() => {
  'use strict';

  if (window.__PASSPORT_AMAZON_AFFILIATE__) return;
  window.__PASSPORT_AMAZON_AFFILIATE__ = true;

  const LINKS = [
    { href: 'https://www.amazon.com.br/b?node=104007590011&linkCode=ll2&tag=passportradio-20&linkId=edae5781198a3cecf47411d190e375a1&ref_=as_li_ss_tl', label: 'VER SELEÇÃO AMAZON' },
    { href: 'https://amzn.to/4xnpFWZ', label: 'ACHADO AMAZON 01' },
    { href: 'https://amzn.to/4gi1vah', label: 'ACHADO AMAZON 02' }
  ];

  const DISCLOSURE = 'Como associado da Amazon, eu ganho com compras qualificadas.';

  const makeLink = (item, className) => {
    const a = document.createElement('a');
    a.href = item.href;
    a.target = '_blank';
    a.rel = 'nofollow sponsored noopener noreferrer';
    a.className = className;
    a.dataset.passportAmazonAffiliate = '1';
    a.innerHTML = `<small>PUBLICIDADE · LINK DE ASSOCIADO</small><strong>${item.label}</strong><span>COMPRAR ↗</span>`;
    return a;
  };

  const installTopRail = () => {
    if (document.getElementById('passport-amazon-toprail')) return;
    const rail = document.createElement('aside');
    rail.id = 'passport-amazon-toprail';
    rail.className = 'passport-amazon-toprail';
    rail.setAttribute('aria-label', 'Publicidade Amazon');
    rail.appendChild(makeLink(LINKS[0], 'passport-amazon-toprail__main'));
    const mini = document.createElement('div');
    mini.className = 'passport-amazon-toprail__mini';
    mini.appendChild(makeLink(LINKS[1], 'passport-amazon-mini'));
    mini.appendChild(makeLink(LINKS[2], 'passport-amazon-mini'));
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
    wrap.setAttribute('aria-label', 'Links patrocinados Amazon');
    wrap.innerHTML = `<div class="passport-amazon-mid__head"><span>PUBLICIDADE</span><strong>ACHADOS NA AMAZON</strong></div>`;
    const grid = document.createElement('div');
    grid.className = 'passport-amazon-mid__grid';
    LINKS.forEach((item) => grid.appendChild(makeLink(item, 'passport-amazon-card')));
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
    wrap.setAttribute('aria-label', 'Publicidade Amazon');
    wrap.appendChild(makeLink(LINKS[0], 'passport-amazon-footer__link'));
    const note = document.createElement('p');
    note.className = 'passport-amazon-disclosure';
    note.textContent = DISCLOSURE;
    wrap.appendChild(note);
    if (footer) footer.insertAdjacentElement('beforebegin', wrap);
    else document.body.appendChild(wrap);
  };

  const install = () => {
    if (!document.body) return;
    installTopRail();
    installMid();
    installFooter();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
})();
