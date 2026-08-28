(() => {
  'use strict';

  const addRedditTop = () => {
    const actions = document.querySelector('.portal-top .top-actions');
    if (!actions || actions.querySelector('a[data-passport-reddit]')) return;

    const reddit = document.createElement('a');
    reddit.className = 'top-social';
    reddit.href = 'https://www.reddit.com/user/Passportradio_26/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button';
    reddit.target = '_blank';
    reddit.rel = 'noopener noreferrer';
    reddit.setAttribute('aria-label', 'Passport Radio no Reddit');
    reddit.setAttribute('data-passport-reddit', 'true');
    reddit.textContent = 'REDDIT';

    const youtube = [...actions.querySelectorAll('a')].find(a => a.textContent.trim() === 'YOUTUBE');
    if (youtube) youtube.insertAdjacentElement('afterend', reddit);
    else actions.appendChild(reddit);
  };

  const installAuditRepairs = () => {
    if (document.documentElement.dataset.passportUxAudit === '1') return;
    document.documentElement.dataset.passportUxAudit = '1';

    const style = document.createElement('style');
    style.id = 'passport-ux-audit-fix';
    style.textContent = `
      /* Restore real Passport Now values. The previous visual layer hid the live
         values and replaced them with hard-coded audience numbers. */
      .passport-now-home__metric strong{font-size:clamp(1.55rem,3vw,2.65rem)!important}
      .passport-now-home__metric span{font-size:.5rem!important}
      .passport-now-home__metric strong::after,.passport-now-home__metric span::after{display:none!important;content:none!important}

      /* Anchor buttons must land below the fixed navigation. */
      #agora,#promocoes,#noticias,#programas,#dicas,#agenda,#musicas,#loja,#apoie,#contato{scroll-margin-top:92px}

      /* Cards that behave as links receive an explicit interaction affordance. */
      .product[data-passport-destination],.program-item[data-passport-destination]{cursor:pointer}
      .product[data-passport-destination]:focus-visible,.program-item[data-passport-destination]:focus-visible{outline:2px solid #d71920;outline-offset:4px}

      /* Reliable tap targets on phones/tablets. */
      @media(max-width:700px){
        .menu,.badge-nav,.top-actions a,.btn,.ticket,.contact-card a,.module-head>a,.passport-now-home__cta,.footer-col a{min-height:44px;display:inline-flex;align-items:center}
        .badge-nav{justify-content:center}
        .product[data-passport-destination],.program-item[data-passport-destination]{min-height:44px}
      }
    `;
    document.head.appendChild(style);

    /* Home and campaign page must describe the same prize. */
    const promo = document.querySelector('.passport-promo-card--featured');
    if (promo) {
      const title = promo.querySelector('h3');
      const media = promo.querySelector('.passport-promo-card__media');
      if (title && /Bluetooth 5\.3/i.test(title.textContent)) title.textContent = 'Ganhe um Fone Bluetooth 5.4';
      if (media && /Bluetooth 5\.3/i.test(media.getAttribute('aria-label') || '')) media.setAttribute('aria-label', 'Fone Bluetooth 5.4');
    }

    const makeCardLink = (node, href, label) => {
      if (!node || node.dataset.passportDestination) return;
      node.dataset.passportDestination = href;
      node.setAttribute('role', 'link');
      node.setAttribute('tabindex', '0');
      node.setAttribute('aria-label', label);
      const go = () => { window.location.href = href; };
      node.addEventListener('click', event => {
        if (event.target.closest('a,button,input,select,textarea')) return;
        go();
      });
      node.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          go();
        }
      });
    };

    document.querySelectorAll('#loja .product').forEach(product => {
      const name = product.querySelector('h3')?.textContent?.trim() || 'produto';
      makeCardLink(product, 'loja.html', `Abrir ${name} na Passport Store`);
    });

    const programDestinations = [
      ['radio.html#player', 'Abrir Live & Rare na Passport Radio'],
      ['destinos.html', 'Abrir Stories Behind The Music nos arquivos'],
      ['destinos.html', 'Abrir entrevistas e especiais nos arquivos']
    ];
    document.querySelectorAll('#programas .program-item').forEach((item, index) => {
      const destination = programDestinations[index];
      if (destination) makeCardLink(item, destination[0], destination[1]);
    });
  };

  const boot = () => {
    addRedditTop();
    installAuditRepairs();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  const load = src => new Promise((ok,fail)=>{const s=document.createElement('script');s.src=src;s.async=false;s.onload=ok;s.onerror=fail;document.head.appendChild(s)});
  (async()=>{try{
    await load('/js/global-signals-lib.js?v=5');
    await Promise.all([
      load('/js/global-signals-home.js?v=5'),
      load('/js/home-support.js?v=5'),
      load('/js/passport-now-dynamic.js?v=1')
    ]);
  }catch(e){console.error('Passport Home Wire',e)}})();
})();
