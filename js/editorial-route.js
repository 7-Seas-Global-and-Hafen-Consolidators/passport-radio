(() => {
  'use strict';

  const FEED = '/data/editorial-feed.json';
  const LIMIT = 5;
  const norm = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const esc = value => String(value || '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const cleanPath = value => {
    try { return new URL(value, location.origin).pathname.replace(/\/+$/, '') || '/'; }
    catch (_) { return String(value || '').split('?')[0].replace(/\/+$/, '') || '/'; }
  };

  const score = (current, item) => {
    const currentEntities = new Set((current.entities || []).map(norm).filter(Boolean));
    const itemEntities = new Set((item.entities || []).map(norm).filter(Boolean));
    let shared = 0;
    itemEntities.forEach(entity => { if (currentEntities.has(entity)) shared += 1; });
    let points = shared * 10;
    if (norm(current.category) && norm(current.category) === norm(item.category)) points += 3;
    if (norm(current.format) && norm(current.format) === norm(item.format)) points += 1;
    return { points, shared };
  };

  const render = (current, items) => {
    if (!items.length) return;
    let section = document.querySelector('main .related');
    if (!section) {
      const main = document.querySelector('main');
      if (!main) return;
      section = document.createElement('section');
      section.className = 'related';
      main.appendChild(section);
    }
    const routeEntities = (current.entities || []).slice(0, 3).filter(Boolean);
    const context = routeEntities.length ? `<small class="passport-route-context">${esc(routeEntities.join(' · '))}</small>` : '';
    const cards = items.map(({item, shared}) => `<a href="${esc(item.url)}"><small>${shared ? 'MESMA ROTA' : esc(item.category || 'PASSPORT RADIO')}</small><strong>${esc(item.title)}</strong></a>`).join('');
    section.innerHTML = `<span>CONTINUE ESTA ROTA</span>${context}<div>${cards}</div>`;
    section.dataset.passportRoute = 'entities';
  };

  const installStyle = () => {
    if (document.getElementById('passport-route-style')) return;
    const style = document.createElement('style');
    style.id = 'passport-route-style';
    style.textContent = '.passport-route-context{display:block;margin:-10px 0 18px;color:#777;font-size:.56rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.related[data-passport-route="entities"] a{transition:transform .18s ease,box-shadow .18s ease}.related[data-passport-route="entities"] a:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.07)}';
    document.head.appendChild(style);
  };

  const boot = async () => {
    if (!document.querySelector('.pe-prose')) return;
    try {
      const response = await fetch(`${FEED}?v=${Math.floor(Date.now()/600000)}`, { cache: 'no-store' });
      if (!response.ok) return;
      const payload = await response.json();
      const feed = Array.isArray(payload) ? payload : (Array.isArray(payload.items) ? payload.items : []);
      const path = cleanPath(location.pathname);
      const current = feed.find(item => cleanPath(item.url) === path);
      if (!current) return;
      const ranked = feed
        .filter(item => item && item.url && cleanPath(item.url) !== path)
        .map(item => ({ item, ...score(current, item) }))
        .filter(entry => entry.points > 0)
        .sort((a, b) => b.points - a.points || String(b.item.published_at || '').localeCompare(String(a.item.published_at || '')))
        .slice(0, LIMIT);
      if (!ranked.length) return;
      installStyle();
      render(current, ranked);
    } catch (_) {
      /* Fail-open: a matéria permanece intacta se o feed não estiver disponível. */
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
