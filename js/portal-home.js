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
            <strong>7</strong>
            <span>SINAIS</span>
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
    "Tarja Turunen - Wuthering Heighs (Angra).mp3",
    "Duran Duran - _Planet Earth_ Global Citizen Performance.mp3",
    "Duran Duran - A View To A kill (Live).mp3",
    "Tears for Fears - Shout (live).mp3",
    "Journey - Don't Stop Believin' (Live In Japan 2017.mp3",
    "Bad Company Performes _Bad Company_ at the Hard Rock Live.mp3",
    "The Beatles - Twist & Shout (Live At The Royal Variety Performance).mp3",
    "14 Bis - Linda Juventude (Ao Vivo).mp3",
    "Scorpions - Still Loving You (Live at Hellfest 2022).mp3",
    "Depeche Mode-Just Can´t Get Enough. SOPRON-HUNGARY 2018..mp3",
    "MORRISSEY - There Is A Light That Never Goes Out (Live Manchester 2005).mp3",
    "HD - Alice Cooper - Hey Stoopid.mp3",
    "VAN HALEN - JUMP (LIVE) - 04_02_2015.mp3",
    "The Cranberries _Linger_ Live at Java Rockin'land 2011.mp3",
    "INXS – The Stairs (Official Live Video) Live From Wembley Stadium 1991 _ Live Baby Live.mp3",
    "Depeche Mode - Policy Of Truth (Live).mp3",
    "Depeche Mode - Everything Counts (Global Spirit Tour).mp3",
    "Coldplay - Stayin' Alive (ft. Barry Gibb) (Glastonbury 2016).mp3",
    "Bryan Adams - Heaven (Live At Wembley 1996).mp3",
    "Out of Touch (1991) - Hall & Oates.mp3"
  ];

  const playlist = files.map((file, id) => ({
    id,
    file,
    src: '/audio/' + encodeURIComponent(file),
    title: file
      .replace(/\.(mp3|mpeg|webm)$/i, '')
      .replace(/[_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }));

  const audio = document.getElementById('audio');
  const play = document.getElementById('play');
  const prev = document.getElementById('prev');
  const next = document.getElementById('next');
  const track = document.getElementById('track');
  const meta = document.getElementById('meta');
  const state = document.getElementById('state');

  if (!audio || !playlist.length) return;

  let i =
    Number(sessionStorage.getItem('passport_portal_track') || 0) %
    playlist.length;

  const load = () => {
    const t = playlist[i];

    audio.src = t.src;
    track.textContent = t.title;
    meta.textContent = 'Passport Radio · Live & Rare';

    sessionStorage.setItem('passport_portal_track', String(i));
  };

  const go = (n) => {
    i = (n + playlist.length) % playlist.length;
    load();
    audio.play().catch(() => {});
  };

  play.onclick = () =>
    audio.paused
      ? audio.play().catch(() => {})
      : audio.pause();

  prev.onclick = () => go(i - 1);
  next.onclick = () => go(i + 1);

  audio.onplay = () => {
    play.textContent = 'Ⅱ';
    state.textContent = 'TOCANDO';
  };

  audio.onpause = () => {
    play.textContent = '▶';
    state.textContent = 'PLAYLIST';
  };

  audio.onended = () => go(i + 1);
  audio.onerror = () => go(i + 1);

  load();
})();

/* Agenda Passport — curadoria Brasil, atualizada em 28/08/2026.
   Mantém a URL e o layout da Home; substitui apenas os cards antigos da agenda.
   Eventos vencidos são removidos automaticamente pela data final de cada item. */
(() => {
  const agenda = document.querySelector('#agenda .agenda');
  if (!agenda) return;

  const events = [
    {
      date: '04 SET', year: '2026', expires: '2026-09-04', artist: 'Thunderbird · História Ilustrada do Rock Nacional — Anos 80', city: 'São Paulo · SP',
      place: 'Blue Note São Paulo · 20h',
      url: 'https://www.eventim.com.br/artist/thunderbird/'
    },
    {
      date: '06 SET', year: '2026', expires: '2026-09-06', artist: 'mgk', city: 'São Paulo · SP',
      place: 'Audio · 21h',
      url: 'https://www.ticketmaster.com.br/event/mgk'
    },
    {
      date: '19 SET', year: '2026', expires: '2026-09-19', artist: 'Helloween · 40 anos', city: 'São Paulo · SP',
      place: 'Suhai Music Hall · 21h',
      url: 'https://www.eventim.com.br/event/helloween-suhai-music-hall-21068671/'
    },
    {
      date: '02–03 OUT', year: '2026', expires: '2026-10-03', artist: 'Angra · Holy Land / Rebirth', city: 'São Paulo · SP',
      place: 'Tokio Marine Hall · 22h',
      url: 'https://www.ticketmaster.com.br/event/angra-tokio-marine-hall'
    },
    {
      date: '16 OUT', year: '2026', expires: '2026-10-16', artist: 'Barão Vermelho · Encontro', city: 'São Paulo · SP',
      place: 'São Paulo · 22h',
      url: 'https://www.eventim.com.br/artist/barao-vermelho/'
    },
    {
      date: '16 OUT', year: '2026', expires: '2026-10-16', artist: 'After Forever', city: 'São Paulo · SP',
      place: 'Tokio Marine Hall',
      url: 'https://www.ticketmaster.com.br/event/after-forever-tokio-marine-hall'
    },
    {
      date: '24 OUT', year: '2026', expires: '2026-10-24', artist: 'Black Pantera', city: 'Rio de Janeiro · RJ',
      place: 'Circo Voador · 20h',
      url: 'https://www.eventim.com.br/artist/black-pantera/'
    },
    {
      date: '25–28 OUT', year: '2026', expires: '2026-10-28', artist: 'Iron Maiden · Run For Your Lives World Tour', city: 'São Paulo · SP + Curitiba · PR',
      place: 'Nubank Parque · Arena da Baixada',
      url: 'https://www.livepass.com.br/artist/iron-maiden/'
    },
    {
      date: '30 OUT', year: '2026', expires: '2026-10-30', artist: 'Plebe Rude', city: 'Rio de Janeiro · RJ',
      place: 'Circo Voador · 20h',
      url: 'https://www.eventim.com.br/artist/plebe-rude/'
    },
    {
      date: '06 NOV', year: '2026', expires: '2026-11-06', artist: 'Opeth', city: 'São Paulo · SP',
      place: 'São Paulo · 21h30',
      url: 'https://www.eventim.com.br/artist/opeth/'
    },
    {
      date: '07 NOV', year: '2026', expires: '2026-11-07', artist: 'Sepultura · Celebrating Life Through Death', city: 'São Paulo · SP',
      place: 'Mercado Livre Arena Pacaembu · 20h30',
      url: 'https://www.ticketmaster.com.br/event/sepultura'
    },
    {
      date: '27 NOV', year: '2026', expires: '2026-11-27', artist: 'POP3 · George Israel + Henrique Portugal + Charles Gavin', city: 'São Paulo · SP',
      place: 'Blue Note São Paulo · 20h e 22h30',
      url: 'https://www.eventim.com.br/'
    },
    {
      date: '05 DEZ', year: '2026', expires: '2026-12-05', artist: 'Deep Purple', city: 'São Paulo · SP',
      place: 'Suhai Music Hall · 21h',
      url: 'https://www.eventim.com.br/event/deep-purple-suhai-music-hall-21626291/'
    },
    {
      date: '17 DEZ', year: '2026', expires: '2026-12-17', artist: 'Slayer · Reign In Blood 40th Anniversary', city: 'São Paulo · SP',
      place: 'Nubank Parque · Kreator + Korzus',
      url: 'https://www.livepass.com.br/event/slayer-reign-in-blood-40th-anniversary-2026-nubank-parque-21728606/'
    },
    {
      date: '19 DEZ', year: '2026', expires: '2026-12-19', artist: 'Barão Vermelho', city: 'Rio de Janeiro · RJ',
      place: 'Circo Voador · 20h',
      url: 'https://www.eventim.com.br/artist/barao-vermelho/'
    },
    {
      date: '15 JAN', year: '2027', expires: '2027-01-15', artist: 'System Of A Down + Faith No More', city: 'Rio de Janeiro · RJ',
      place: 'Estádio Maracanã · 16h',
      url: 'https://www.eventim.com.br/event/system-of-a-down-e-faith-no-more-estadio-maracana-22023211/'
    },
    {
      date: '22 JAN–04 FEV', year: '2027', expires: '2027-02-04', artist: 'Rush · Fifty Something Tour', city: 'Curitiba · São Paulo · Rio · Belo Horizonte · Brasília',
      place: '5 cidades · 6 apresentações',
      url: 'https://www.eventim.com.br/campaign/rush'
    },
    {
      date: '20 FEV', year: '2027', expires: '2027-02-20', artist: 'Foo Fighters', city: 'São Paulo · SP',
      place: 'Estádio do MorumBIS · 20h',
      url: 'https://www.ticketmaster.com.br/event/venda-geral-foo-fighters-sao-paulo'
    }
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const activeEvents = events.filter((event) => new Date(`${event.expires}T23:59:59`) >= today);

  agenda.innerHTML = activeEvents.map((event) => `
    <article class="event">
      <div class="date">
        <strong>${event.date}</strong>
        <span>${event.year}</span>
      </div>
      <div class="event-main">
        <strong>${event.artist}</strong>
        <small>${event.city}</small>
      </div>
      <div class="place">${event.place}</div>
      <div>
        <a class="ticket" href="${event.url}" target="_blank" rel="noopener">INGRESSOS ↗</a>
      </div>
    </article>
  `).join('');
})();

/* Featured Mr. Nomad story — keeps the static Home architecture intact and
   swaps only editorial content after the DOM is available. */
(() => {
  const storyUrl = '/editorial/2026/08/27/dolly-parton-1946-2026-vida-cancoes-legado.html';
  const imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Dolly_Parton_in_2022.jpg';

  const hero = document.querySelector('.hero-main > a');
  if (hero) {
    hero.href = storyUrl;
    hero.innerHTML = `
      <img src="${imageUrl}" alt="Dolly Parton em 2022" referrerpolicy="no-referrer">
      <div class="hero-copy">
        <span class="eyebrow">DESTAQUE · Mr. Nomad · Dolly Parton · 1946–2026</span>
        <h1>Dolly Parton: a menina das montanhas que ensinou o mundo a contar histórias.</h1>
        <p>Da infância no Tennessee a Jolene, I Will Always Love You, 9 to 5, Dollywood e milhões de livros entregues a crianças: a viagem completa de Dolly Parton.</p>
      </div>
    `;
  }

  const breaking = document.querySelector('.breaking-track');
  if (breaking) {
    breaking.innerHTML = `
      DESTAQUE · Dolly Parton · 1946–2026
      &nbsp; · &nbsp;
      Portishead → Evanescence · The Darkness Came From Bristol
      &nbsp; · &nbsp;
      Chris Slade · The Man Behind The Thunder
      &nbsp; · &nbsp;
      Frank Beard · 1949–2026
    `;
  }

  const feature = document.querySelector('#noticias .feature > a');
  if (feature) {
    feature.href = storyUrl;
    feature.innerHTML = `
      <img src="${imageUrl}" alt="Dolly Parton em 2022" referrerpolicy="no-referrer">
      <div>
        <small>DESTAQUE · Mr. Nomad · Dolly Parton · 27/08/2026</small>
        <h3>Dolly Parton: a menina das montanhas que ensinou o mundo a contar histórias.</h3>
        <p>Uma vida de canções, decisões, negócios, livros, cinema e uma capacidade rara de transformar memória em música.</p>
      </div>
    `;
  }
})();
