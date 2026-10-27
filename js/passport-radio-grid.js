/* Home presentation only. All selection goes through the unchanged universal engine. */
(() => {
  'use strict';
  const sections = ['DANCE, FLASH HOUSE & DISCOTECAS','ROCK, METAL & ALTERNATIVAS','POP, DÉCADAS & NOSTALGIA','SOUL, BLACK MUSIC & REGGAE','BRASIL: MPB, SAMBA & SERTANEJO','JAZZ, CLÁSSICA & AMBIENTES','AO VIVO, PROGRAMAS & ESPECIAIS','WORLD DIAL™','CONTINUOUS SIGNALS™ E PROJETOS PRÓPRIOS','DEMAIS RÁDIOS EXISTENTES','K-POP & MÚSICA COREANA'];
  let inventory, catalog;
  const home = () => /^\/(?:index\.html)?$/.test(location.pathname);
  function sync() {
    if (!catalog) return;
    catalog.hidden = !home();
    if (home()) document.body.classList.add('passport-complete-catalog');
    const runtime = window.PassportAudioRuntime;
    const state = window.PassportContinuity?.getState();
    catalog.querySelectorAll('[data-radio-id]').forEach(button => {
      button.disabled = !runtime?.ready;
      const active = state && state.family === button.dataset.family && String(state.index) === button.dataset.index;
      button.setAttribute('aria-pressed', String(!!active));
      if (button.classList.contains('living-radio-card')) button.dataset.playing = String(!!active && !!runtime?.state().playing);
    });
  }
  function mount() {
    const player = document.getElementById('passport-player');
    if (!player || !inventory || catalog) return;
    catalog = document.createElement('section');
    catalog.id = 'passport-radio-catalog';
    catalog.setAttribute('aria-label', 'Todos os canais da Passport Radio');
    const title = document.createElement('h2'); title.textContent = 'NOSSAS RÁDIOS';
    const count = document.createElement('p'); count.className = 'passport-radio-count';
    count.textContent = `${inventory.radioCount} rádios. Todos os estilos. Escolha sua frequência.`;
    catalog.append(title, count);
    const tools = document.createElement('div'); tools.className = 'passport-radio-tools';
    const search = document.createElement('form'); search.className = 'passport-radio-search'; search.setAttribute('role', 'search');
    const input = document.createElement('input'); input.type = 'search'; input.placeholder = 'Localizar rádio'; input.setAttribute('aria-label', 'Localizar rádio sem ocultar canais');
    const found = document.createElement('span'); found.className = 'passport-radio-search-status'; found.setAttribute('role', 'status');
    search.append(input, found);
    const shortcuts = document.createElement('nav'); shortcuts.className = 'passport-radio-shortcuts'; shortcuts.setAttribute('aria-label', 'Ir para uma família musical');
    tools.append(search, shortcuts); catalog.append(tools);
    const shortcutLabels = {1:'Dance',2:'Rock',3:'Pop',11:'K-pop',4:'Soul',5:'Brasil',6:'Jazz',7:'Ao vivo',8:'World Dial',9:'Projetos',10:'Outras'};
    const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
    const locate = () => {
      const query = normalize(input.value.trim());
      const matches = [];
      catalog.querySelectorAll('[data-radio-id]').forEach(button => {
        const match = !!query && normalize(button.textContent).includes(query);
        button.classList.toggle('passport-radio-match', match);
        if (match) matches.push(button);
      });
      found.textContent = query ? `${matches.length} ${matches.length === 1 ? 'rádio localizada' : 'rádios localizadas'}` : '';
      return matches;
    };
    input.addEventListener('input', locate);
    search.addEventListener('submit', event => {
      event.preventDefault(); const first = locate()[0];
      if (first) { first.scrollIntoView({block:'center'}); first.focus({preventScroll:true}); }
    });
    [1,2,3,11,4,5,6,7,8,9,10].forEach(number => {
      const label = sections[number - 1];
      const rows = inventory.records.filter(row => row.section === number);
      if (!rows.length) return;
      const section = document.createElement('section'); section.className = 'passport-radio-family'; section.id = `passport-radio-family-${number}`;
      const shortcut = document.createElement('a'); shortcut.href = `#${section.id}`; shortcut.textContent = shortcutLabels[number]; shortcut.setAttribute('aria-label', label); shortcuts.append(shortcut);
      const heading = document.createElement('h3'); heading.textContent = label;
      const grid = document.createElement('div'); grid.className = 'passport-radio-grid';
      if (number === 8) {
        section.classList.add('living-collection');
        const header = document.createElement('header'); header.className = 'living-category-header';
        const copy = document.createElement('div'); copy.className = 'living-category-copy';
        const lead = document.createElement('p'); lead.className = 'living-category-title'; lead.textContent = 'O mundo está no ar.';
        const deck = document.createElement('p'); deck.className = 'living-category-deck'; deck.textContent = 'Sons de todos os continentes.';
        const globe = document.createElement('canvas'); globe.className = 'living-earth'; globe.setAttribute('role','img'); globe.setAttribute('aria-label','Globo terrestre tridimensional em rotação');
        globe.dataset.texture = '/images/radio/living-collection/earth-blue-marble.jpg';
        copy.append(heading, lead, deck); header.append(copy, globe); section.append(header);
      }
      if (number === 1) {
        section.classList.add('living-collection', 'living-dance');
        const header = document.createElement('header'); header.className = 'living-category-header';
        const copy = document.createElement('div'); copy.className = 'living-category-copy';
        const lead = document.createElement('p'); lead.className = 'living-category-title'; lead.textContent = 'A pista nunca para.';
        const deck = document.createElement('p'); deck.className = 'living-category-deck'; deck.textContent = 'Dance, disco, house, eurodance e os clássicos das pistas.';
        const sphere = document.createElement('canvas'); sphere.className = 'living-disco-ball'; sphere.setAttribute('role','img'); sphere.setAttribute('aria-label','Bola espelhada tridimensional em rotação');
        copy.append(heading, lead, deck); header.append(copy, sphere); section.append(header);
      }
      if (number === 2 || number === 3) {
        section.classList.add('living-collection', 'living-performance', number === 2 ? 'living-rock' : 'living-pop');
        const header = document.createElement('header'); header.className = 'living-category-header living-performance-header';
        const copy = document.createElement('div'); copy.className = 'living-category-copy';
        const kicker = document.createElement('p'); kicker.className = 'living-performance-kicker'; kicker.textContent = 'LIVING COLLECTION™';
        copy.append(kicker, heading);
        const art = document.createElement('figure'); art.className = 'living-performance-art'; art.setAttribute('aria-hidden','true');
        const photo = document.createElement('img'); photo.className = 'living-equipment-photo'; photo.alt = ''; photo.width = 1446; photo.height = 1087;
        photo.src = number === 2 ? '/images/radio/living-collection/rock-monumental-kit.webp' : '/images/radio/living-collection/pop-sharp-gf777.webp';
        art.append(photo);
        if (number === 2) {
          for (const side of ['left','right']) { const hit = document.createElement('span'); hit.className = `living-kick living-kick-${side}`; art.append(hit); }
        } else {
          for (let i=0;i<4;i++) { const reel = document.createElement('span'); reel.className = `living-tape-reel living-tape-reel-${i+1}`; art.append(reel); }
          const rec = document.createElement('span'); rec.className = 'living-rec'; rec.textContent = 'REC';
          const light = document.createElement('span'); light.className = 'living-fm-light'; art.append(rec, light);
        }
        header.append(copy, art); section.append(header);
      }
      rows.forEach(row => {
        const button = document.createElement('button'); button.type = 'button'; button.id = row.new ? row.id : `passport-card-${row.id.replace(/[^a-z0-9-]/gi, '-')}`;
        button.className = 'passport-radio-card'; button.dataset.radioId = row.id;
        button.dataset.family = row.family; button.dataset.index = String(row.index);
        button.lang = row.lang || 'pt-BR'; button.dir = row.dir || 'ltr'; button.setAttribute('aria-pressed', 'false');
        const icon = document.createElement('span'); icon.className = 'passport-radio-icon'; icon.textContent = row.kind === 'program' ? '▶' : '◉'; icon.setAttribute('aria-hidden', 'true');
        const name = document.createElement('span'); name.textContent = row.name;
        if (number === 8 || number === 1 || number === 2 || number === 3) {
          button.classList.add('living-radio-card'); button.setAttribute('aria-label',row.name);
          name.className = 'living-radio-name';
          // Presentation-only mapping: each stable ID owns its individual local artwork.
          const image = document.createElement('img'); image.className = 'living-radio-cover'; image.alt = ''; image.width = 68; image.height = 68; image.loading = 'lazy'; image.decoding = 'async';
          image.src = row.artwork || `/images/radio/living-collection/${encodeURIComponent(row.id)}.webp`;
          const description = document.createElement('span'); description.className = 'living-radio-description'; description.textContent = row.category;
          const copy = document.createElement('span'); copy.className = 'living-radio-copy'; copy.dir = row.dir || 'ltr'; copy.append(name,description);
          const waves = document.createElement('span'); waves.className = 'living-radio-waves'; waves.setAttribute('aria-hidden','true');
          for (let i=0;i<4;i++) waves.append(document.createElement('i'));
          button.append(image,copy,waves);
        } else button.append(icon, name);
        button.addEventListener('click', () => {
          const runtime = window.PassportAudioRuntime;
          if (!runtime?.ready) return;
          runtime.engine.select(row.family, row.name, row.index === null ? undefined : row.index);
          sync();
        });
        grid.append(button);
      });
      if (number !== 8 && number !== 1 && number !== 2 && number !== 3) section.append(heading);
      section.append(grid); catalog.append(section);
    });
    const tv = document.createElement('a'); tv.href = '/clips-tv.html'; tv.className = 'passport-tv-door';
    const tvName = document.createElement('strong'); tvName.textContent = 'Passport Clips TV™';
    const tvAction = document.createElement('span'); tvAction.textContent = 'CLIPES, HISTÓRIAS E MÚSICA · ASSISTIR →';
    tv.append(tvName, tvAction); catalog.append(tv);
    player.after(catalog);
    if (!document.querySelector('script[data-living-earth]')) {
      const script = document.createElement('script'); script.src = '/js/passport-living-earth.js'; script.dataset.livingEarth = '1'; document.head.append(script);
    }
    if (!document.querySelector('script[data-living-disco]')) {
      const script = document.createElement('script'); script.src = '/js/passport-living-disco.js'; script.dataset.livingDisco = '1'; document.head.append(script);
    }
    if (!document.querySelector('script[data-living-performance]')) {
      const script = document.createElement('script'); script.src = '/js/passport-living-performance.js'; script.dataset.livingPerformance = '1'; document.head.append(script);
    }
    document.body.classList.add('passport-complete-catalog');
    sync();
  }
  for (const event of ['passport:audio-ready','passport:audio-state','passport:institutional-ready','passport:editorial-route']) window.addEventListener(event, () => { mount(); sync(); queueMicrotask(sync); });
  window.addEventListener('popstate', sync);
  fetch('/data/passport-radio-inventory.json').then(response => {
    if (!response.ok) throw Error('catalog'); return response.json();
  }).then(data => { inventory = data; mount(); }).catch(() => {
    // Preserve the original directory if the complete catalogue cannot be loaded.
    document.body.classList.remove('passport-complete-catalog');
  });
})();
