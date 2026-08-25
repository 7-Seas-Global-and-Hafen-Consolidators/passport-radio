(() => {
  const endpoint = '/data/editorial-feed.json';
  const escapeHTML = (value = '') => String(value).replace(/[&<>'"]/g, (ch) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const stamp = (value) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('pt-BR', {day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit'}).format(d);
  };
  fetch(endpoint, {cache:'no-store', credentials:'omit'})
    .then((r) => r.ok ? r.json() : Promise.reject())
    .then((data) => {
      const items = Array.isArray(data && data.items) ? data.items.slice(0, 6) : [];
      if (!items.length || document.getElementById('passport-editorial-home')) return;
      const anchor = document.getElementById('noticias') || document.getElementById('agenda') || document.querySelector('main section:last-of-type');
      if (!anchor || !anchor.parentNode) return;
      const section = document.createElement('section');
      section.id = 'passport-editorial-home';
      section.className = 'passport-editorial-home';
      section.innerHTML = `
        <div class="shell">
          <div class="passport-editorial-home__head">
            <div><small>PASSPORT RADIO · EDITORIAL 24H</small><h2>Novas histórias. O dia inteiro.</h2></div>
            <a href="/editorial.html">VER TODO O EDITORIAL →</a>
          </div>
          <div class="passport-editorial-home__grid">
            ${items.map((item) => `<a href="${escapeHTML(item.url)}"><small>${escapeHTML(item.format)} · ${escapeHTML(item.category)}</small><strong>${escapeHTML(item.title)}</strong><span>${escapeHTML(item.deck || '')}</span><small>${escapeHTML(stamp(item.published_at))}</small></a>`).join('')}
          </div>
        </div>`;
      anchor.parentNode.insertBefore(section, anchor.nextSibling);
    })
    .catch(() => {});
})();
