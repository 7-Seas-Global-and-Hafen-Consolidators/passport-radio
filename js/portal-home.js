const side = document.getElementById('portal-side');
const menu = document.getElementById('menu');

if (menu && side) {
  const closeSide = () => {
    side.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
  };

  menu.onclick = () => {
    const open = side.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
  };

  side.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', closeSide)
  );

  document.addEventListener('click', (event) => {
    if (!side.classList.contains('open')) return;
    if (side.contains(event.target) || menu.contains(event.target)) return;
    closeSide();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeSide();
  });
}

/* Home editorial callout: the old fixed Dee Snider/Wacken feature is now
   a neutral Passport 24H gateway. No source/provider information is exposed. */
(() => {
  const feature = document.querySelector('#programas .program-feature');
  if (!feature) return;

  feature.classList.add('program-feature--passport24');
  feature.innerHTML = `
    <span class="eyebrow">PASSPORT 24H™</span>
    <h3>A música não para quando a página muda.</h3>
    <p>Metal · Unplugged · Live Jam · 80s · Soul · MPB · Live & Rare.</p>
    <a class="btn" href="radio.html">ENTRAR NO AR →</a>
  `;
})();

/* =========================================================
   PASSPORT NOW™
   A first-party listening signal is emitted whenever a media element is
   actually playing. CounterAPI is used only as the anonymous aggregate.
   No stream/provider URLs are sent.
   ========================================================= */
(() => {
  const namespace = 'passportradio.online';
  const action = 'listen';
  const key = 'signal';
  const endpoint = `https://counterapi.com/api/${namespace}/${action}/${key}`;
  const readEndpoint = `${endpoint}?readOnly=true&timeline=15m&unique=true`;
  const HEARTBEAT_MS = 4 * 60 * 1000;
  let lastHeartbeat = 0;

  const anyMediaPlaying = () =>
    Array.from(document.querySelectorAll('audio,video')).some((media) =>
      !media.paused && !media.ended && media.readyState > 1
    );

  const sendHeartbeat = () => {
    const now = Date.now();
    if (now - lastHeartbeat < 30000) return;
    lastHeartbeat = now;

    fetch(`${endpoint}?trackOnly=true`, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-store',
      credentials: 'omit'
    }).catch(() => {});
  };

  const readListeners = async () => {
    try {
      const response = await fetch(readEndpoint, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-store',
        credentials: 'omit'
      });
      if (!response.ok) return;
      const data = await response.json();
      const value = Number(data && data.value);
      if (!Number.isFinite(value)) return;
      document.querySelectorAll('[data-passport-listeners]').forEach((node) => {
        node.textContent = value.toLocaleString('pt-BR');
      });
    } catch (_) {}
  };

  document.addEventListener('play', (event) => {
    if (!(event.target instanceof HTMLMediaElement)) return;
    sendHeartbeat();
    window.setTimeout(readListeners, 700);
  }, true);

  window.setInterval(() => {
    if (!document.hidden && anyMediaPlaying()) {
      sendHeartbeat();
      window.setTimeout(readListeners, 700);
    }
  }, HEARTBEAT_MS);

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && anyMediaPlaying()) {
      sendHeartbeat();
      window.setTimeout(readListeners, 700);
    }
  });

  const news = document.getElementById('noticias');
  if (news && !document.getElementById('passport-now-home')) {
    const section = document.createElement('section');
    section.id = 'passport-now-home';
    section.className = 'passport-now-home';
    section.setAttribute('aria-label', 'Passport Now');
    section.innerHTML = `
      <div class="shell passport-now-home__grid">
        <div class="passport-now-home__intro">
          <span class="eyebrow">PASSPORT NOW™</span>
          <h2>Agora na Passport.</h2>
        </div>
        <div class="passport-now-home__metrics">
          <div class="passport-now-home__metric">
            <strong data-passport-listeners>—</strong>
            <span>OUVINDO AGORA</span>
          </div>
          <div class="passport-now-home__metric">
            <strong>38</strong>
            <span>CANAIS</span>
          </div>
          <div class="passport-now-home__metric">
            <strong>24H</strong>
            <span>NO AR</span>
          </div>
        </div>
        <a class="passport-now-home__cta" href="radio.html">ENTRAR NO AR →</a>
      </div>
    `;
    news.parentNode.insertBefore(section, news);
  }

  readListeners();
})();

/* =========================================================
   HOME COMMERCIAL GATEWAY
   Gives Anuncie its own sellable presence without turning editorial modules
   into banners. The detailed inventory stays on anuncie.html.
   ========================================================= */
(() => {
  const support = document.getElementById('apoie');
  if (!support || document.getElementById('passport-commercial-home')) return;

  const section = document.createElement('section');
  section.id = 'passport-commercial-home';
  section.className = 'module passport-commercial-home';
  section.innerHTML = `
    <div class="shell passport-commercial-home__grid">
      <div>
        <span class="eyebrow">PUBLICIDADE · PASSPORT RADIO</span>
        <h2>Sua marca também pode fazer parte dessa história.</h2>
        <p>Bandas, shows, festivais, instrumentos, áudio, lojas, lançamentos e marcas dentro de um ambiente feito para quem vive música.</p>
      </div>
      <div class="passport-commercial-home__side">
        <strong>HOME · AGENDA · CONTEÚDO · LOJA · SEÇÕES</strong>
        <a class="btn" href="anuncie.html">VER FORMATOS →</a>
      </div>
    </div>
  `;

  support.parentNode.insertBefore(section, support);
})();

(() => {
  const files = [
    "Camisa de Venus - Silvia (Piranha)..mp3",
    "How Soon Is Now - Johnny Marr Live At The Crazy Face Factory.mp3",
    "Crowded House - Don't Dream It's Over _ Glastonbury 2022.mp3",
    "The Cult - She Sells Sanctuary.mp3",
    "Foreigner - I Want To Know What Love Is (Live at Farm Aid 1985).mp3",
    "R.E.M. - Drive (Live in Germany 2003).mp3",
    "Epica - Cry for the Moon - Live at Wacken Open Air 2022.mp3",
    "Tarja - Demons In You (Ft. Alissa White-Gluz) Live At Wacken 2016.mp3",
    "George Michael - Jesus to a Child (1994 Berlin MTV Awards).mp3",
    "Marillion - Lavender - Live at Loreley.mp3",
    "Pink Floyd - Comfortably Numb (Pulse).mp3",
    "Dire Straits - Sultans Of Swing (Alchemy Live).mp3"
  ];

  const player = document.querySelector('[data-passport-player]');
  if (!player) return;

  const audio = player.querySelector('audio');
  const title = player.querySelector('[data-track-title]');
  const next = player.querySelector('[data-track-next]');
  if (!audio || !next) return;

  let index = Math.floor(Math.random() * files.length);
  const loadTrack = () => {
    const file = files[index];
    audio.src = `/audio/${encodeURIComponent(file)}`;
    if (title) title.textContent = file.replace(/\.mp3$/i, '');
  };

  next.addEventListener('click', () => {
    index = (index + 1) % files.length;
    loadTrack();
    audio.play().catch(() => {});
  });

  audio.addEventListener('ended', () => {
    index = (index + 1) % files.length;
    loadTrack();
    audio.play().catch(() => {});
  });

  loadTrack();
})();