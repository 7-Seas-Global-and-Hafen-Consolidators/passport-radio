/* Passport Radio · CONDEMONIO Phase 1 · Discovery only
   Makes the existing audio architecture impossible to miss without replacing,
   autoplaying, merging or touching any player/stream/interlock implementation.
*/
(() => {
  'use strict';

  if (!document.body || document.body.dataset.passportPhase1Discovery === '1') return;
  document.body.dataset.passportPhase1Discovery = '1';

  const routes = [
    {
      key: 'world',
      name: 'WORLD DIAL',
      eyebrow: 'REAL FM · AM · WORLDWIDE',
      description: 'Estações terrestres reais do mundo, dentro do dial da Passport.',
      href: '/radio-mundo-player.html',
      action: 'GIRAR O DIAL →'
    },
    {
      key: 'tunnels',
      name: 'TUNNELS™',
      eyebrow: 'CONTINUOUS MUSIC',
      description: 'Ambientes musicais contínuos por década, território e linguagem.',
      href: '/radio.html#passportTunnels',
      action: 'ENTRAR NOS TÚNEIS →'
    },
    {
      key: 'continuous',
      name: 'CONTINUOUS SIGNALS™',
      eyebrow: '24 HOURS',
      description: 'Metal, Unplugged e Live Jam em sinais contínuos independentes.',
      href: '/radio.html#continuous',
      action: 'ABRIR SINAIS →'
    },
    {
      key: 'live-rare',
      name: 'LIVE & RARE™',
      eyebrow: 'ARCHIVE SIGNAL',
      description: 'Performances, arquivos ao vivo e gravações que merecem sobreviver.',
      href: '/radio.html#player',
      action: 'OUVIR LIVE & RARE →'
    },
    {
      key: 'flash-house',
      name: 'FLASH HOUSE',
      eyebrow: 'FLASH HOUSE · EURODANCE · HOUSE',
      description: 'A porta de energia da Passport, isolada e contínua.',
      href: '/radio.html#passportFlashHouse',
      action: 'ENTRAR NO FLASH HOUSE →'
    }
  ];

  const programsRoute = {
    name: 'PROGRAMAS',
    description: 'Voz humana, programação, horários e episódios da Passport.',
    href: '/#programas'
  };

  const style = document.createElement('style');
  style.dataset.passportPhase1DiscoveryStyle = '1';
  style.textContent = `
    :root{--p1-ink:#111;--p1-paper:#f7f5f0;--p1-red:#c5161d;--p1-line:rgba(17,17,17,.16);--p1-muted:#68645d}
    .top-actions .onair.passport-listen-trigger{background:var(--p1-red);color:#fff;border-color:var(--p1-red);font-weight:900;letter-spacing:.08em}
    .top-actions .onair.passport-listen-trigger i{background:#fff;box-shadow:0 0 0 4px rgba(255,255,255,.16)}
    .passport-discovery{background:var(--p1-paper);border-bottom:1px solid var(--p1-line);padding:34px 0 30px}
    .passport-discovery__head{display:flex;justify-content:space-between;gap:28px;align-items:flex-end;margin-bottom:20px}
    .passport-discovery__head h2{font-size:clamp(2rem,4vw,4.8rem);line-height:.92;letter-spacing:-.055em;margin:4px 0 0;max-width:820px}
    .passport-discovery__head p{max-width:430px;margin:0;color:var(--p1-muted);font-size:.88rem;line-height:1.55}
    .passport-discovery__eyebrow{font-size:.62rem;font-weight:900;letter-spacing:.16em;color:var(--p1-red);text-transform:uppercase}
    .passport-discovery__doors{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));border:1px solid var(--p1-line);background:#fff}
    .passport-discovery__door{min-height:222px;padding:18px;display:flex;flex-direction:column;text-decoration:none;color:var(--p1-ink);border-right:1px solid var(--p1-line);transition:background .18s ease,color .18s ease,transform .18s ease}
    .passport-discovery__door:last-child{border-right:0}
    .passport-discovery__door:hover,.passport-discovery__door:focus-visible{background:#111;color:#fff;outline:0;transform:translateY(-2px)}
    .passport-discovery__door small{font-size:.52rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:var(--p1-red)}
    .passport-discovery__door strong{font-size:1.18rem;line-height:1.02;margin:15px 0 10px;letter-spacing:-.025em}
    .passport-discovery__door p{font-size:.7rem;line-height:1.45;color:inherit;opacity:.74;margin:0 0 18px}
    .passport-discovery__action{font-size:.57rem;font-weight:900;letter-spacing:.08em;margin-top:auto}
    .passport-discovery__world-sample{display:flex;flex-wrap:wrap;gap:5px;margin:1px 0 17px}
    .passport-discovery__world-sample span{border:1px solid currentColor;padding:4px 6px;font-size:.49rem;font-weight:800;line-height:1.1;opacity:.75}
    .passport-programs-strip{margin-top:14px;border-top:4px solid #111;border-bottom:1px solid var(--p1-line);display:grid;grid-template-columns:170px 1fr auto;align-items:center;gap:22px;padding:15px 2px}
    .passport-programs-strip small{font-size:.58rem;font-weight:900;letter-spacing:.13em;color:var(--p1-red)}
    .passport-programs-strip strong{display:block;font-size:.98rem}.passport-programs-strip p{margin:3px 0 0;font-size:.68rem;color:var(--p1-muted)}
    .passport-programs-strip a{font-size:.62rem;font-weight:900;color:#111;text-decoration:none;border-bottom:2px solid #111;padding-bottom:3px}
    .passport-listen-overlay[hidden]{display:none!important}
    .passport-listen-overlay{position:fixed;inset:0;z-index:99999;background:rgba(5,5,5,.78);display:grid;place-items:start center;padding:74px 18px 24px;backdrop-filter:blur(14px)}
    .passport-listen-overlay__panel{width:min(980px,100%);max-height:calc(100vh - 96px);overflow:auto;background:#f7f5f0;color:#111;border-top:8px solid var(--p1-red);box-shadow:0 30px 90px rgba(0,0,0,.38)}
    .passport-listen-overlay__top{display:flex;justify-content:space-between;align-items:center;padding:20px 22px;border-bottom:1px solid var(--p1-line)}
    .passport-listen-overlay__top strong{font-size:1.35rem;letter-spacing:-.03em}.passport-listen-overlay__top span{font-size:.55rem;font-weight:900;letter-spacing:.13em;color:var(--p1-red);display:block;margin-bottom:3px}
    .passport-listen-overlay__close{appearance:none;border:1px solid #111;background:transparent;font:900 .64rem Inter,Arial,sans-serif;padding:9px 11px;cursor:pointer}
    .passport-listen-overlay__grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}
    .passport-listen-overlay__link{padding:18px 22px;border-bottom:1px solid var(--p1-line);border-right:1px solid var(--p1-line);text-decoration:none;color:#111;display:block}
    .passport-listen-overlay__link:nth-child(even){border-right:0}.passport-listen-overlay__link:hover{background:#111;color:#fff}
    .passport-listen-overlay__link small{display:block;font-size:.5rem;font-weight:900;letter-spacing:.11em;color:var(--p1-red);margin-bottom:7px}.passport-listen-overlay__link strong{font-size:1rem}.passport-listen-overlay__link p{margin:5px 0 0;font-size:.67rem;line-height:1.45;opacity:.72}
    .passport-listen-overlay__programs{padding:17px 22px;background:#111;color:#fff;display:flex;justify-content:space-between;gap:20px;align-items:center}.passport-listen-overlay__programs a{color:#fff;font-weight:900;font-size:.62rem}
    @media(max-width:1050px){.passport-discovery__doors{grid-template-columns:repeat(2,minmax(0,1fr))}.passport-discovery__door{border-bottom:1px solid var(--p1-line)}.passport-discovery__door:nth-child(2n){border-right:0}.passport-discovery__door:last-child{grid-column:1/-1;min-height:170px}.passport-discovery__head{align-items:flex-start;flex-direction:column}.passport-programs-strip{grid-template-columns:120px 1fr auto}}
    @media(max-width:680px){.passport-discovery{padding:24px 0}.passport-discovery__head h2{font-size:2.45rem}.passport-discovery__head p{font-size:.78rem}.passport-discovery__doors{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;border-left:0;border-right:0}.passport-discovery__door{flex:0 0 78vw;max-width:330px;min-height:215px;border:1px solid var(--p1-line)!important;scroll-snap-align:start;margin-right:8px}.passport-programs-strip{grid-template-columns:1fr;gap:7px;padding:14px 0}.passport-programs-strip a{justify-self:start}.passport-listen-overlay{padding:54px 10px 16px}.passport-listen-overlay__grid{grid-template-columns:1fr}.passport-listen-overlay__link{border-right:0}.passport-listen-overlay__programs{align-items:flex-start;flex-direction:column}.portal-top .top-actions .passport-listen-trigger{display:inline-flex!important}}
  `;
  document.head.appendChild(style);

  const topListen = document.querySelector('.portal-top .top-actions .onair');
  if (topListen) {
    topListen.classList.add('passport-listen-trigger');
    topListen.href = '#passport-listen';
    topListen.setAttribute('aria-haspopup', 'dialog');
    topListen.setAttribute('aria-controls', 'passport-listen-overlay');
    topListen.innerHTML = '<i></i> OUVIR';
  }

  const sideListen = document.querySelector('.side-nav a[title="Ao Vivo"]');
  if (sideListen) {
    sideListen.title = 'OUVIR';
    sideListen.setAttribute('aria-label', 'OUVIR');
  }

  const makeDoor = (route) => `
    <a class="passport-discovery__door passport-discovery__door--${route.key}" href="${route.href}">
      <small>${route.eyebrow}</small>
      <strong>${route.name}</strong>
      <p>${route.description}</p>
      ${route.key === 'world' ? '<div class="passport-discovery__world-sample" data-passport-world-sample aria-label="Amostra do World Dial"></div>' : ''}
      <span class="passport-discovery__action">${route.action}</span>
    </a>`;

  const hero = document.querySelector('main .hero');
  if (hero && !document.getElementById('passport-discovery')) {
    const section = document.createElement('section');
    section.id = 'passport-discovery';
    section.className = 'passport-discovery';
    section.setAttribute('aria-labelledby', 'passport-discovery-title');
    section.innerHTML = `
      <div class="shell">
        <div class="passport-discovery__head">
          <div>
            <span class="passport-discovery__eyebrow">AGORA NA PASSPORT · OUVIR</span>
            <h2 id="passport-discovery-title">A história abre o caminho. O som está aqui.</h2>
          </div>
          <p>Cinco arquiteturas de áudio, cada uma com sua própria lógica. Escolha a porta; o player existente continua fazendo o trabalho sem nenhuma nova camada de autoplay.</p>
        </div>
        <div class="passport-discovery__doors">${routes.map(makeDoor).join('')}</div>
        <div class="passport-programs-strip">
          <small>PROGRAMAS</small>
          <div><strong>Voz humana dentro da Passport.</strong><p>${programsRoute.description}</p></div>
          <a href="${programsRoute.href}">VER PROGRAMAS →</a>
        </div>
      </div>`;
    hero.insertAdjacentElement('afterend', section);
  }

  const overlay = document.createElement('div');
  overlay.id = 'passport-listen-overlay';
  overlay.className = 'passport-listen-overlay';
  overlay.hidden = true;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'passport-listen-title');
  overlay.innerHTML = `
    <div class="passport-listen-overlay__panel">
      <div class="passport-listen-overlay__top">
        <div><span>OUVIR · PASSPORT RADIO</span><strong id="passport-listen-title">Escolha a arquitetura.</strong></div>
        <button class="passport-listen-overlay__close" type="button" data-passport-listen-close>FECHAR</button>
      </div>
      <div class="passport-listen-overlay__grid">
        ${routes.map(route => `<a class="passport-listen-overlay__link" href="${route.href}"><small>${route.eyebrow}</small><strong>${route.name}</strong><p>${route.description}</p></a>`).join('')}
      </div>
      <div class="passport-listen-overlay__programs"><div><strong>PROGRAMAS</strong><p>${programsRoute.description}</p></div><a href="${programsRoute.href}">ABRIR PROGRAMAS →</a></div>
    </div>`;
  document.body.appendChild(overlay);

  let lastFocus = null;
  const closeOverlay = () => {
    overlay.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  };
  const openOverlay = (trigger) => {
    lastFocus = trigger || document.activeElement;
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    const close = overlay.querySelector('[data-passport-listen-close]');
    if (close) close.focus();
  };

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('.passport-listen-trigger');
    if (trigger) {
      event.preventDefault();
      openOverlay(trigger);
      return;
    }
    if (event.target.matches('[data-passport-listen-close]') || event.target === overlay) closeOverlay();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !overlay.hidden) closeOverlay();
  });

  const worldSample = document.querySelector('[data-passport-world-sample]');
  if (worldSample) {
    fetch('/data/radio-territories.json', { cache: 'no-store' })
      .then(response => response.ok ? response.json() : Promise.reject(new Error('territories unavailable')))
      .then(payload => {
        const items = Array.isArray(payload && payload.territories) ? payload.territories : [];
        const visible = items.filter(item => item && item.id !== 'afghanistan').slice(-3);
        if (!visible.length) return;
        worldSample.innerHTML = visible.map(item => `<span>${String(item.local_name || item.name || item.id).replace(/[<>]/g, '')}</span>`).join('');
      })
      .catch(() => {});
  }
})();
