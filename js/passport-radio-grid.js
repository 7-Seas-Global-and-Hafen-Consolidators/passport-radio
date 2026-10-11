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
    });
  }
  function mount() {
    const player = document.getElementById('passport-player');
    if (!player || !inventory || catalog) return;
    catalog = document.createElement('section');
    catalog.id = 'passport-radio-catalog';
    catalog.setAttribute('aria-label', 'Todos os canais da Passport Radio');
    const title = document.createElement('h2'); title.textContent = 'TODOS OS BEBÊS. TODAS AS FREQUÊNCIAS.';
    const count = document.createElement('p'); count.className = 'passport-radio-count';
    count.textContent = `${inventory.radioCount} rádios · projetos próprios preservados · escolha seu som`;
    catalog.append(title, count);
    [1,2,3,11,4,5,6,7,8,9,10].forEach(number => {
      const label = sections[number - 1];
      const rows = inventory.records.filter(row => row.section === number);
      if (!rows.length) return;
      const section = document.createElement('section'); section.className = 'passport-radio-family';
      const heading = document.createElement('h3'); heading.textContent = label;
      const grid = document.createElement('div'); grid.className = 'passport-radio-grid';
      rows.forEach(row => {
        const button = document.createElement('button'); button.type = 'button'; button.id = row.new ? row.id : `passport-card-${row.id.replace(/[^a-z0-9-]/gi, '-')}`;
        button.className = 'passport-radio-card'; button.dataset.radioId = row.id;
        button.dataset.family = row.family; button.dataset.index = String(row.index);
        button.lang = row.lang || 'pt-BR'; button.dir = row.dir || 'ltr'; button.setAttribute('aria-pressed', 'false');
        const icon = document.createElement('span'); icon.className = 'passport-radio-icon'; icon.textContent = row.kind === 'program' ? '▶' : '◉'; icon.setAttribute('aria-hidden', 'true');
        const name = document.createElement('span'); name.textContent = row.name;
        button.append(icon, name);
        button.addEventListener('click', () => {
          const runtime = window.PassportAudioRuntime;
          if (!runtime?.ready) return;
          runtime.engine.select(row.family, row.name, row.index === null ? undefined : row.index);
          sync();
        });
        grid.append(button);
      });
      section.append(heading, grid); catalog.append(section);
    });
    const tv = document.createElement('a'); tv.href = '/clips-tv.html'; tv.className = 'passport-tv-door';
    const tvName = document.createElement('strong'); tvName.textContent = 'Passport Clips TV™';
    const tvAction = document.createElement('span'); tvAction.textContent = 'CLIPES, HISTÓRIAS E MÚSICA · ASSISTIR →';
    tv.append(tvName, tvAction); catalog.append(tv);
    player.after(catalog);
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
