(() => {
  'use strict';
  const root = document.getElementById('originals');
  const tabs = root.querySelector('[role="tablist"]');
  const panel = document.getElementById('originals-band');
  const status = document.getElementById('originals-status');
  const bands = [
    ['sugar-oni', '🌸 SUGAR ONI', 'Uma fusão explosiva de Kawaii Metal, J-Rock e Speed-Thrash.', 'rin yuki kira hana aiko', 37],
    ['kowai-goth', '🦇 KOWAI GOTH', 'Gothic Rock sombrio, Post-Punk industrial e atmosferas de catedral.', 'rin megumi kira yuki hana aiko', 32],
    ['nox-lacrimae', '❄️ NOX LACRIMAE', 'Symphonic Gothic Metal operístico, violinos noturnos e orquestrações monumentais.', 'freya maja viktor lukas klara helena astrid', 12]
  ];

  function element(tag, parent, attrs = {}, copy = '') {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
    node.textContent = copy;
    parent?.append(node);
    return node;
  }

  const audio = element('audio', root, {controlsList:'nodownload noplaybackrate', oncontextmenu:'return false;', preload:'metadata', hidden:''});
  function notice() {
    audio.dispatchEvent(new MouseEvent('contextmenu', {bubbles:true, cancelable:true}));
  }
  function protectedTarget(target) {
    return target instanceof Element && target.closest('[data-originals-protected]');
  }
  for (const type of ['copy', 'cut', 'dragstart', 'contextmenu']) {
    root.addEventListener(type, event => {
      const selection = document.getSelection();
      const selected = selection && !selection.isCollapsed && protectedTarget(selection.anchorNode?.parentElement);
      if (!protectedTarget(event.target) && !(['copy', 'cut'].includes(type) && selected)) return;
      if (type === 'contextmenu' && event.target.closest('audio, video, .member-photo, .band-banner')) return;
      event.preventDefault();
      notice();
    });
  }
  root.addEventListener('pointerdown', event => {
    if (protectedTarget(event.target) && !event.target.closest('video, audio, button, a, input')) {
      root.focus({preventScroll:true});
    }
  });
  root.tabIndex = -1;
  document.addEventListener('keydown', event => {
    if (!(event.ctrlKey || event.metaKey) || event.altKey || event.shiftKey) return;
    if (!root.contains(document.activeElement) || !['c', 'x'].includes(event.key.toLowerCase())) return;
    event.preventDefault();
    notice();
  });

  let video, tracks, index, rows, current, clock, seek, toggle, player, audioRequested = false;
  const time = seconds => Number.isFinite(seconds) ? Math.floor(seconds / 60) + ':' + String(Math.floor(seconds % 60)).padStart(2, '0') : '–:––';
  function refresh() {
    if (!player) return;
    seek.max = Number.isFinite(audio.duration) ? audio.duration : 0;
    seek.disabled = !Number.isFinite(audio.duration);
    seek.value = audio.currentTime;
    clock.textContent = time(audio.currentTime) + ' / ' + time(audio.duration);
    toggle.textContent = audio.paused ? 'Reproduzir' : 'Pausar';
    player.toggleAttribute('data-playing', !audio.paused);
  }
  for (const event of ['loadedmetadata', 'durationchange', 'timeupdate', 'play', 'pause', 'emptied']) audio.addEventListener(event, refresh);
  function pauseRadio() {
    window.PassportContinuity?.pause();
  }
  audio.addEventListener('play', () => {
    if (audio.paused) return;
    video?.pause();
    pauseRadio();
  });
  window.addEventListener('passport:audio-state', event => {
    if (event.detail?.playing) {
      audioRequested = false;
      audio.pause();
      video?.pause();
    }
  });
  function play() {
    audioRequested = true;
    video?.pause();
    pauseRadio();
    const requestedSource = audio.src;
    audio.play().catch(error => {
      if (audioRequested && error.name !== 'AbortError' && audio.src === requestedSource) {
        status.textContent = 'Não foi possível reproduzir esta faixa.';
      }
    });
  }
  function choose(next, autoplay) {
    index = (next + tracks.length) % tracks.length;
    const track = tracks[index];
    status.textContent = '';
    audio.src = '/' + track.src;
    current.textContent = track.title;
    rows.forEach((row, i) => i === index ? row.setAttribute('aria-current', 'true') : row.removeAttribute('aria-current'));
    refresh();
    if (autoplay) play();
  }
  audio.addEventListener('ended', () => { if (index + 1 < tracks.length) choose(index + 1, true); else refresh(); });

  const media = element("div", panel);
  let list;

  function render(band, profiles, catalog) {
    const [id, label, intro, order] = band;
    audioRequested = false;
    audio.pause();
    video?.pause();
    media.replaceChildren();
    panel.hidden = false;
    panel.setAttribute('aria-labelledby', 'tab-' + id);
    for (const tab of tabs.children) {
      const active = tab.id === 'tab-' + id;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    }
    element('img', media, {class:'band-banner', src:'/assets/bands/' + id + '.png', alt:label, draggable:'false', 'data-originals-protected':''});
    element('p', media, {'data-originals-protected':''}, intro);
    video = element('video', media, {src:'/assets/videos/' + id.toUpperCase() + '-OFFICIAL-PRESENTATION.mp4', controls:'', playsinline:'', controlsList:'nodownload', preload:'metadata', draggable:'false', 'aria-label':'Vídeo oficial · ' + label, 'data-originals-protected':''});
    video.addEventListener('play', event => {
      if (event.currentTarget !== video || video.paused) return;
      audioRequested = false;
      audio.pause();
      pauseRadio();
    });
    element('h2', media, {'data-originals-protected':''}, 'Integrantes');
    const gallery = element('div', media, {class:'originals-gallery', 'data-originals-protected':''});
    for (const memberId of order.split(' ')) {
      const member = profiles[id].find(person => person.id === memberId);
      const card = element('article', gallery);
      element('img', card, {class:'member-photo', src:'/' + member.photo, alt:member.name, draggable:'false', loading:'lazy'});
      element('h3', card, {}, member.name);
      element('p', card, {}, member.role);
      element('p', card, {'data-originals-protected':''}, member.bio);
    }

    tracks = catalog[id];
    if (!player) mountPlayer();
    player.dataset.band = id;
    player.setAttribute('aria-label', 'Player · ' + label);
    list.replaceChildren();
    rows = tracks.map((track, i) => {
      const row = element('button', element('li', list), {type:'button', 'data-originals-protected':''}, track.title);
      row.onclick = () => choose(i, true);
      return row;
    });
    choose(0, false);
  }

  function mountPlayer() {
    player = element('section', panel, {class:'originals-player'});
    element('h2', player, {'data-originals-protected':''}, 'Músicas');
    current = element('p', player, {'data-originals-protected':'', 'aria-live':'polite'});
    const actions = element('div', player, {class:'originals-actions'});
    element('button', actions, {type:'button'}, 'Anterior').onclick = () => choose(index - 1, true);
    toggle = element('button', actions, {type:'button'}, 'Reproduzir');
    toggle.onclick = () => { if (audio.paused) play(); else { audioRequested = false; audio.pause(); } };
    element('button', actions, {type:'button'}, 'Próxima').onclick = () => choose(index + 1, true);
    seek = element('input', player, {type:'range', min:0, max:0, step:'any', value:0, 'aria-label':'Progresso da faixa'});
    seek.oninput = () => { audio.currentTime = Number(seek.value); };
    clock = element('p', player, {class:'originals-time'});
    list = element('ol', player, {class:'originals-list'});
  }

  async function read(path) {
    const response = await fetch(path);
    if (!response.ok) throw new Error(path);
    return response.json();
  }
  Promise.all([read('/assets/bands-profiles.json'), read('/assets/tracks.json')]).then(([profiles, catalog]) => {
    for (const [id, , , order, count] of bands) {
      if (catalog[id]?.length !== count || !order.split(' ').every(key => profiles[id]?.some(member => member.id === key))) throw new Error(id);
    }
    const buttons = bands.map((band, i) => {
      const tab = element('button', tabs, {id:'tab-' + band[0], type:'button', role:'tab', 'aria-controls':panel.id}, band[1]);
      tab.onclick = () => { if (tab.getAttribute('aria-selected') !== 'true') render(band, profiles, catalog); };
      tab.onkeydown = event => {
        const next = {ArrowRight:(i + 1) % bands.length, ArrowLeft:(i + bands.length - 1) % bands.length, Home:0, End:bands.length - 1}[event.key];
        if (next === undefined) return;
        event.preventDefault();
        buttons[next].click();
        buttons[next].focus();
      };
      return tab;
    });
    buttons[0].click();
  }).catch(error => {
    status.textContent = 'Não foi possível carregar o catálogo Originals.';
    console.error(error);
  });
})();
