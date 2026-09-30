/* Passport Podcast Player. Native audio, page-local state, no radio engines.
   Catalog contract: {podcast:{name,cover,coverAlt}, episodes:[{id,title,
   description,date,duration,src,cover,coverAlt}]}. No catalog means no audio.
   duration is optional, in seconds; real media metadata remains authoritative. */
(() => {
  'use strict';
  const root = document.getElementById('passport-podcast');
  if (!root) return;
  const byId = id => root.querySelector('#' + id);
  const audio = byId('passport-podcast-audio');
  const config = document.getElementById('passport-podcast-catalog');
  if (!audio || !config) return;
  const play = byId('podcast-play'), prev = byId('podcast-prev'), next = byId('podcast-next');
  const rewind = byId('podcast-rewind'), forward = byId('podcast-forward');
  const progress = byId('podcast-progress'), volume = byId('podcast-volume'), speed = byId('podcast-speed');
  const status = byId('podcast-status'), list = byId('podcast-episodes');
  const storageKey = 'passport_podcast_listened_v1';
  let catalog, index = -1, generation = 0;
  const listened = new Set();
  try { const saved = JSON.parse(localStorage.getItem(storageKey) || '[]'); if (Array.isArray(saved)) saved.filter(id => typeof id === 'string').forEach(id => listened.add(id)); } catch (_) { /* Storage can be unavailable. Playback remains independent. */ }
  try { catalog = JSON.parse(config.textContent); } catch (_) { status.textContent = 'Catálogo indisponível. Nenhum áudio foi carregado.'; return; }
  const safeURL = value => {
    if (typeof value !== 'string' || !value.trim()) return null;
    try { const url = new URL(value, document.baseURI); return url.protocol === 'https:' || (url.protocol === 'http:' && url.origin === location.origin) ? url.href : null; } catch (_) { return null; }
  };
  const seen = new Set();
  const episodes = (Array.isArray(catalog?.episodes) ? catalog.episodes : []).filter(episode => {
    if (!episode || typeof episode.id !== 'string' || !episode.id.trim() || seen.has(episode.id) || typeof episode.title !== 'string' || !episode.title.trim() || !safeURL(episode.src)) return false;
    seen.add(episode.id); return true;
  });
  const seconds = n => Number.isFinite(n) && n >= 0 ? n : 0;
  const clock = n => { const t = Math.floor(seconds(n)), h = Math.floor(t / 3600); return (h ? h + ':' : '') + String(Math.floor(t / 60) % 60).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0'); };
  const duration = () => Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0;
  const text = (id, value) => { byId(id).textContent = typeof value === 'string' ? value : ''; };
  const renderPlay = () => { const playing = !audio.paused; play.textContent = playing ? 'Pause' : 'Play'; play.setAttribute('aria-label', playing ? 'Pausar episódio' : 'Reproduzir episódio'); };
  function renderTimeline() {
    const total = duration(), elapsed = seconds(audio.currentTime);
    progress.disabled = !total; rewind.disabled = !total; forward.disabled = !total;
    progress.value = total ? Math.min(100, elapsed / total * 100) : 0;
    progress.setAttribute('aria-valuetext', clock(elapsed) + ' de ' + clock(total));
    text('podcast-elapsed', clock(elapsed)); text('podcast-total', clock(total));
    if (total) { text('podcast-episode-duration', clock(total)); byId('podcast-episode-duration').hidden = false; }
  }
  function renderList() {
    list.replaceChildren();
    episodes.forEach((episode, i) => {
      const item = document.createElement('li'), button = document.createElement('button');
      button.type = 'button'; button.textContent = episode.title;
      if (i === index) button.setAttribute('aria-current', 'true');
      if (listened.has(episode.id)) { const marker = document.createElement('span'); marker.textContent = 'Ouvido'; button.appendChild(marker); }
      button.addEventListener('click', () => select(i)); item.appendChild(button); list.appendChild(item);
    });
    byId('podcast-listened').hidden = index < 0 || !listened.has(episodes[index].id);
  }
  function renderCover(episode = {}) {
    const image = byId('podcast-cover'), empty = byId('podcast-cover-empty');
    const cover = safeURL(episode.cover) || safeURL(catalog.podcast?.cover);
    image.hidden = true; empty.hidden = false;
    image.onload = () => { image.hidden = false; empty.hidden = true; };
    image.onerror = () => { image.hidden = true; empty.hidden = false; };
    if (cover) { image.alt = episode.coverAlt || catalog.podcast?.coverAlt || episode.title || 'Podcast Passport Radio'; image.src = cover; }
    else { image.removeAttribute('src'); image.alt = ''; }
  }
  function select(i) {
    if (!episodes[i]) return;
    generation++; audio.pause(); index = i;
    audio.src = safeURL(episodes[i].src); audio.load();
    audio.volume = Number(volume.value); audio.playbackRate = Number(speed.value);
    text('podcast-name', catalog.podcast?.name || 'PODCAST PASSPORT RADIO');
    text('podcast-episode-title', episodes[i].title); text('podcast-description', episodes[i].description || '');
    const date = byId('podcast-date'); date.textContent = episodes[i].date || ''; date.hidden = !episodes[i].date;
    if (episodes[i].date) date.setAttribute('datetime', episodes[i].date); else date.removeAttribute('datetime');
    const hint = Number.isFinite(episodes[i].duration) && episodes[i].duration > 0 ? episodes[i].duration : 0;
    byId('podcast-episode-duration').hidden = !hint; text('podcast-episode-duration', hint ? clock(hint) : '');
    play.disabled = false; volume.disabled = false; speed.disabled = false;
    prev.disabled = i === 0; next.disabled = i === episodes.length - 1;
    text('podcast-elapsed', '00:00'); text('podcast-total', '00:00'); progress.value = 0;
    progress.disabled = true; rewind.disabled = true; forward.disabled = true;
    status.textContent = 'Episódio selecionado. Pressione Play para ouvir.';
    renderCover(episodes[i]); renderList(); renderPlay();
  }
  function seek(delta) { const total = duration(); if (total) audio.currentTime = Math.max(0, Math.min(total, seconds(audio.currentTime) + delta)); renderTimeline(); }
  play.addEventListener('click', async () => {
    if (index < 0) return;
    if (!audio.paused) { audio.pause(); return; }
    const token = generation;
    try { status.textContent = 'Carregando episódio…'; await audio.play(); } catch (_) { if (token === generation) { status.textContent = 'Não foi possível reproduzir o episódio. Tente novamente.'; renderPlay(); } }
  });
  prev.addEventListener('click', () => select(index - 1)); next.addEventListener('click', () => select(index + 1));
  rewind.addEventListener('click', () => seek(-15)); forward.addEventListener('click', () => seek(30));
  progress.addEventListener('input', () => { const total = duration(); if (total) audio.currentTime = total * Number(progress.value) / 100; renderTimeline(); });
  volume.addEventListener('input', () => { audio.volume = Number(volume.value); });
  speed.addEventListener('change', () => { audio.playbackRate = Number(speed.value); });
  ['loadedmetadata', 'durationchange', 'timeupdate', 'seeked'].forEach(event => audio.addEventListener(event, renderTimeline));
  audio.addEventListener('playing', () => { renderPlay(); status.textContent = 'Reproduzindo episódio.'; });
  audio.addEventListener('pause', () => { renderPlay(); if (!audio.ended) status.textContent = 'Episódio pausado.'; });
  audio.addEventListener('waiting', () => { status.textContent = 'Carregando áudio…'; });
  audio.addEventListener('ended', () => {
    if (index < 0) return;
    listened.add(episodes[index].id);
    try { localStorage.setItem(storageKey, JSON.stringify([...listened])); } catch (_) { /* Listening status is optional. */ }
    status.textContent = 'Episódio concluído.'; renderPlay(); renderList(); renderTimeline();
  });
  audio.addEventListener('error', () => { if (index >= 0) { status.textContent = 'Áudio indisponível. Tente novamente ou selecione outro episódio.'; renderPlay(); } });
  window.addEventListener('pagehide', () => { generation++; audio.pause(); });
  text('podcast-catalog-count', episodes.length + (episodes.length === 1 ? ' episódio' : ' episódios'));
  byId('podcast-catalog-empty').hidden = episodes.length > 0;
  renderCover();
  if (episodes.length) select(0);
})();
