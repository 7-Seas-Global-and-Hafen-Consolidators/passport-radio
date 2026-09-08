/* Passport Radio — Novelas Tunnel™
 * Fonte: playlists YouTube escolhidas pelo Mr. Nomad / primeiro apoiador.
 * NÃO raspa áudio. Toca no player oficial do YouTube.
 */
(() => {
  'use strict';

  const PANEL_ID = 'passportNovelas';
  const FRAME_ID = 'passportNovelasFrame';

  const PLAYLISTS = [
    { id: 'PL74FzgX6Wbls4sJiOZfPg5INFEiNJOmbb', label: '01 · Trilha 1' },
    { id: 'PLmgkGSqOPCzuxlATw8oZmimIJzhKvykK0', label: '02 · Trilha 2' },
    { id: 'PL7X8pld-Y43YMbL3HCFjnJeB4qFX9sjrN', label: '03 · Trilha 3' },
    { id: 'PL32elvOIURf97NmdtWYgS4ewh8COdcYbp', label: '04 · Trilha 4' },
    { id: 'PL7X8pld-Y43bCcopcIghZ9mYvGdLYrtbl', label: '05 · Trilha 5' },
    { id: 'PL7X8pld-Y43Z4xUxmWFDJvg4R5gX5Sg20', label: '06 · Trilha 6' },
    { id: 'PLBXBmZcJbX0yqCULtYkzVzoNRnWpiWA0-', label: '07 · Trilha 7' },
    { id: 'PL4E403236D3CE379F', label: '08 · Trilha 8' },
    { id: 'PL74FzgX6Wbltkk3UcFkDhqVb20MXIvek6', label: '09 · Trilha 9' }
  ];

  function embedSrc(listId) {
    return 'https://www.youtube-nocookie.com/embed/videoseries?list=' + encodeURIComponent(listId) + '&rel=0';
  }

  function stopOthers() {
    document.querySelectorAll('audio').forEach((a) => { if (!a.paused) try { a.pause(); } catch (_) {} });
  }

  function ensureDirectory() {
    const directory = document.querySelector('#passportTunnels .tunnel-directory');
    if (!directory || directory.querySelector('[data-passport-novelas-directory]')) return;
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'tunnel-directory__row';
    row.dataset.passportNovelasDirectory = '1';
    row.dataset.tunnelTarget = PANEL_ID;
    row.setAttribute('aria-controls', PANEL_ID);
    row.setAttribute('aria-expanded', 'false');
    row.innerHTML = '<span class="tunnel-directory__number">09</span><strong class="tunnel-directory__title">Novelas Tunnel™</strong><span class="tunnel-directory__format">1970–1990 · playlists do primeiro apoiador</span><span class="tunnel-directory__state">24 HOURS</span><span class="tunnel-directory__action">Abrir sinal</span>';
    row.addEventListener('click', () => {
      const panel = document.getElementById(PANEL_ID);
      if (!panel) return;
      const willOpen = panel.hidden;
      document.querySelectorAll('[data-passport-tunnel-panel="1"]').forEach((other) => { other.hidden = true; });
      panel.hidden = !willOpen;
      row.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      if (willOpen) { stopOthers(); panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
    });
    directory.appendChild(row);
  }

  function ensurePanel() {
    const host = document.getElementById('passportTunnels');
    if (!host || document.getElementById(PANEL_ID)) return;
    const panel = document.createElement('section');
    panel.id = PANEL_ID;
    panel.hidden = true;
    panel.dataset.passportTunnelPanel = '1';
    panel.className = 'tunnel-panel';
    panel.innerHTML =
      '<div class="tunnel-panel-copy">' +
      '<span class="tunnel-eyebrow">PASSPORT MEMORY SIGNAL™ · PEDIDO DO PRIMEIRO APOIADOR</span>' +
      '<h3>Novelas Tunnel™</h3>' +
      '<p>As playlists que você passou. Década por década. Sem rádio aleatória. Sem oração alemã.</p>' +
      '</div>' +
      '<div id="novelasDeck" style="display:flex;flex-wrap:wrap;gap:6px;margin:12px 0"></div>' +
      '<div style="position:relative;padding-top:56.25%;background:#111">' +
      '<iframe id="' + FRAME_ID + '" title="Novelas Tunnel" src="' + embedSrc(PLAYLISTS[0].id) + '" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;border:0"></iframe>' +
      '</div>';
    host.appendChild(panel);
    const deck = panel.querySelector('#novelasDeck');
    PLAYLISTS.forEach((p, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = p.label;
      b.style.cssText = 'font:700 .72rem Inter,sans-serif;letter-spacing:.06em;border:1px solid #111;background:' + (i === 0 ? '#111' : '#fff') + ';color:' + (i === 0 ? '#fff' : '#111') + ';padding:6px 8px;cursor:pointer';
      b.addEventListener('click', () => {
        const frame = document.getElementById(FRAME_ID);
        if (frame) frame.src = embedSrc(p.id);
        deck.querySelectorAll('button').forEach((x) => { x.style.background = '#fff'; x.style.color = '#111'; });
        b.style.background = '#111'; b.style.color = '#fff';
        stopOthers();
      });
      deck.appendChild(b);
    });
  }

  function boot() {
    ensureDirectory();
    ensurePanel();
    window.PassportNovelasTunnel = { stop() {} };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
