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
      .passport-now-home__metric strong{font-size:clamp(1.55rem,3vw,2.65rem)!important}
      .passport-now-home__metric span{font-size:.5rem!important}
      .passport-now-home__metric strong::after,.passport-now-home__metric span::after{display:none!important;content:none!important}
      #agora,#promocoes,#noticias,#programas,#dicas,#agenda,#musicas,#loja,#apoie,#contato{scroll-margin-top:92px}
      .product[data-passport-destination],.program-item[data-passport-destination]{cursor:pointer}
      .product[data-passport-destination]:focus-visible,.program-item[data-passport-destination]:focus-visible{outline:2px solid #d71920;outline-offset:4px}
      @media(max-width:700px){
        .menu,.badge-nav,.top-actions a,.btn,.ticket,.contact-card a,.module-head>a,.passport-now-home__cta,.footer-col a{min-height:44px;display:inline-flex;align-items:center}
        .badge-nav{justify-content:center}
        .product[data-passport-destination],.program-item[data-passport-destination]{min-height:44px}
      }
    `;
    document.head.appendChild(style);

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

  const installPassportNowRising = () => {
    const metrics = document.querySelector('.passport-now-home__metrics');
    if (!metrics || metrics.dataset.passportRising === '1') return;
    metrics.dataset.passportRising = '1';

    const cards = [...metrics.querySelectorAll('.passport-now-home__metric')];
    if (cards.length < 3) return;

    const strongs = cards.map(card => card.querySelector('strong'));
    const labels = cards.map(card => card.querySelector('span'));
    const START = [102, 1824, 14];
    const MIN_STEP = [2, 18, 1];
    const MAX_STEP = [11, 74, 4];
    const STORAGE_KEY = 'passport_now_visual_counters_v2';
    const format = value => Number(value).toLocaleString('pt-BR');
    const randomInt = (min,max) => Math.floor(Math.random()*(max-min+1))+min;

    const loadValues = () => {
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
        if (Array.isArray(saved) && saved.length === 3 && saved.every(Number.isFinite)) {
          return saved.map((value,i) => Math.max(START[i], value));
        }
      } catch (_) {}
      return [...START];
    };

    const animate = (node, nextValue) => {
      if (!node) return;
      const previous = Number(node.dataset.passportValue || String(node.textContent).replace(/\D/g,'') || 0);
      node.dataset.passportValue = String(nextValue);
      const started = performance.now();
      const duration = 720;
      const tick = now => {
        const progress = Math.min(1,(now-started)/duration);
        const eased = 1-Math.pow(1-progress,3);
        node.textContent = format(Math.round(previous + (nextValue-previous)*eased));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const values = loadValues();
    ['PASSPORT PULSE™','ROTAÇÕES DO SINAL','DESTINATIONS INDEX™'].forEach((text,i) => {
      if (labels[i]) labels[i].textContent = text;
      if (strongs[i]) {
        strongs[i].textContent = format(values[i]);
        strongs[i].dataset.passportValue = String(values[i]);
      }
    });

    const rise = () => {
      values.forEach((value,i) => {
        values[i] = value + randomInt(MIN_STEP[i],MAX_STEP[i]);
        animate(strongs[i], values[i]);
      });
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(values)); } catch (_) {}
      window.setTimeout(rise, randomInt(6500,14500));
    };

    window.setTimeout(rise, randomInt(1800,4200));
  };

  const boot = () => {
    addRedditTop();
    installAuditRepairs();
    installPassportNowRising();
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
      load('/js/home-support.js?v=5')
    ]);
  }catch(e){console.error('Passport Home Wire',e)}})();
})();
