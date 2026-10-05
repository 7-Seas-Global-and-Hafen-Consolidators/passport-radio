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
  let selected = 0, page = 0;
  const pageSize = 6;
  const pages = document.createElement('nav'); pages.className = 'collection-pages'; pages.setAttribute('aria-label', 'Páginas de Broadcast'); list.after(pages);
  const publicTitle = item => item.title.replace(/(?:NPR Music|Tiny Desk) /g, '');
  function select(index) {
    const item = entries[index];
    if (!item) return;
    selected = index; page = Math.floor(index / pageSize);
    stage.replaceChildren();
    get('broadcast-title').textContent = publicTitle(item);
    get('broadcast-description').textContent = item.artist + ' · apresentação.';
    const image = get('broadcast-cover'), empty = get('broadcast-cover-empty');
    image.hidden = true; empty.hidden = false;
    image.onload = () => { image.hidden = false; empty.hidden = true; };
    image.onerror = () => { image.hidden = true; empty.hidden = false; };
    if (typeof item.cover === 'string' && item.cover.startsWith('/assets/podcast-broadcast/')) {
      image.src = item.cover; image.alt = publicTitle(item);
    } else { image.removeAttribute('src'); }
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'broadcast-load'; button.textContent = 'REPRODUZIR VÍDEO';
    button.addEventListener('click', () => {
      const frame = document.createElement('iframe');
      frame.src = 'https://www.youtube-nocookie.com/embed/' + item.id + '?autoplay=0';
      frame.title = publicTitle(item); frame.allow = 'encrypted-media; fullscreen; picture-in-picture';
      frame.allowFullscreen = true; frame.referrerPolicy = 'strict-origin-when-cross-origin';
      stage.replaceChildren(frame);
    });
    stage.appendChild(button);
    renderList();
  }
  function renderList() {
    list.replaceChildren();
    entries.slice(page * pageSize, (page + 1) * pageSize).forEach((item, offset) => {
      const index = page * pageSize + offset;
      const li = document.createElement('li'), button = document.createElement('button');
      button.type = 'button';
      const image = document.createElement('img'); image.src = item.cover; image.alt = ''; image.loading = 'lazy';
      const title = document.createElement('strong'); title.textContent = publicTitle(item); button.append(image, title);
      if (index === selected) button.setAttribute('aria-current', 'true');
      button.addEventListener('click', () => select(index)); li.appendChild(button); list.appendChild(li);
    });
    pages.replaceChildren();
    const total = Math.ceil(entries.length / pageSize);
    const control = (label, target, disabled = false) => {
      const button = document.createElement('button'); button.type = 'button'; button.textContent = label; button.disabled = disabled;
      if (target === page && !disabled) button.setAttribute('aria-current', 'page');
      button.addEventListener('click', () => { page = target; renderList(); list.scrollIntoView({block: 'start'}); }); pages.append(button);
    };
    control('← ANTERIOR', page - 1, page === 0);
    for (let n = 0; n < total; n++) control(String(n + 1), n);
    control('PRÓXIMA →', page + 1, page === total - 1);
  }
  if (entries.length) select(0);
})();
