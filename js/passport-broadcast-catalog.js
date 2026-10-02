/* Page-local video catalogue. No radio state, audio engine or interlock. */
(() => {
  'use strict';
  const root = document.getElementById('passport-broadcast');
  const config = document.getElementById('passport-broadcast-catalog');
  if (!root || !config) return;
  const get = id => root.querySelector('#' + id);
  let entries;
  try { entries = JSON.parse(config.textContent).broadcasts; } catch (_) { return; }
  const seen = new Set();
  entries = (Array.isArray(entries) ? entries : []).filter(item => {
    if (!item || !/^[\w-]{11}$/.test(item.id) || seen.has(item.id) || typeof item.title !== 'string') return false;
    try {
      const url = new URL(item.officialUrl);
      if (url.protocol !== 'https:' || url.hostname !== 'www.youtube.com' || url.searchParams.get('v') !== item.id) return false;
    } catch (_) { return false; }
    seen.add(item.id); return true;
  });
  const stage = get('passport-broadcast-stage'), list = get('broadcast-items');
  function select(index) {
    const item = entries[index];
    if (!item) return;
    stage.replaceChildren();
    get('broadcast-name').textContent = item.source;
    get('broadcast-title').textContent = item.title;
    get('broadcast-description').textContent = item.artist + ' · apresentação oficial NPR Music.';
    get('broadcast-official').href = item.officialUrl;
    const image = get('broadcast-cover'), empty = get('broadcast-cover-empty');
    image.hidden = true; empty.hidden = false;
    image.onload = () => { image.hidden = false; empty.hidden = true; };
    image.onerror = () => { image.hidden = true; empty.hidden = false; };
    if (typeof item.cover === 'string' && item.cover.startsWith('/assets/podcast-broadcast/')) {
      image.src = item.cover; image.alt = item.coverAlt || item.title;
    } else { image.removeAttribute('src'); }
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'broadcast-load'; button.textContent = 'REPRODUZIR VÍDEO';
    button.addEventListener('click', () => {
      const frame = document.createElement('iframe');
      frame.src = 'https://www.youtube-nocookie.com/embed/' + item.id + '?autoplay=0';
      frame.title = item.title; frame.allow = 'encrypted-media; fullscreen; picture-in-picture';
      frame.allowFullscreen = true; frame.referrerPolicy = 'strict-origin-when-cross-origin';
      stage.replaceChildren(frame);
    });
    stage.appendChild(button);
    list.querySelectorAll('button').forEach((button, i) => {
      if (i === index) button.setAttribute('aria-current', 'true'); else button.removeAttribute('aria-current');
    });
  }
  entries.forEach((item, index) => {
    const li = document.createElement('li'), button = document.createElement('button');
    button.type = 'button'; button.textContent = item.title;
    button.addEventListener('click', () => select(index)); li.appendChild(button); list.appendChild(li);
  });
  get('broadcast-count').textContent = entries.length + (entries.length === 1 ? ' vídeo' : ' vídeos');
  if (entries.length) select(0);
})();
