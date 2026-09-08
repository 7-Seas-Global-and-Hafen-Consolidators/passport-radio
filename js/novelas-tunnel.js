/* Passport Radio — Novelas Tunnel™ · áudio only. YouTube escondido. */
(() => {
  'use strict';

  const PANEL_ID = 'passportNovelas';
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

  let player = null;
  let current = 0;
  let wantOn = false;

  function stopOthers() {
    document.querySelectorAll('audio').forEach((a) => { if (!a.paused) try { a.pause(); } catch (_) {} });
  }

  function loadApi(done) {
    if (window.YT && window.YT.Player) { done(); return; }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function () {
      if (typeof prev === 'function') try { prev(); } catch (_) {}
      done();
    };
    if (![...document.scripts].some((s) => /youtube\.com\/iframe_api/.test(s.src))) {
      const s = document.createElement('script');
      s.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(s);
    }
  }

  function ensurePlayer(cb) {
    loadApi(() => {
      if (player) { cb(); return; }
      player = new window.YT.Player('passportNovelasHidden', {
        width: 1,
        height: 1,
        playerVars: { autoplay: 0, controls: 0, rel: 0, modestbranding: 1, playsinline: 1, listType: 'playlist', list: PLAYLISTS[0].id },
        events: {
          onReady: cb,
          onStateChange: (e) => {
            const st = document.getElementById('novelasStatus');
            const pb = document.getElementById('novelasPlay');
            if (!st || !pb) return;
            if (e.data === 1) { st.textContent = 'ON AIR'; pb.textContent = 'PAUSE'; }
            else { st.textContent = wantOn ? 'READY' : 'READY'; pb.textContent = 'PLAY'; }
          }
        }
      });
    });
  }

  function playList(i) {
    current = i;
    wantOn = true;
    stopOthers();
    ensurePlayer(() => {
      try { player.loadPlaylist({ list: PLAYLISTS[i].id, listType: 'playlist', index: 0 }); player.playVideo(); } catch (_) {}
    });
  }

  function toggle() {
    ensurePlayer(() => {
      const state = player.getPlayerState && player.getPlayerState();
      if (state === 1) { wantOn = false; player.pauseVideo(); }
      else playList(current);
    });
  }

  function ensureDirectory() {
    const directory = document.querySelector('#passportTunnels .tunnel-directory');
    if (!directory || directory.querySelector('[data-passport-novelas-directory]')) return;
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'tunnel-directory__row';
    row.dataset.passportNovelasDirectory = '1';
    row.innerHTML = '<span class="tunnel-directory__number">09</span><strong class="tunnel-directory__title">Novelas Tunnel™</strong><span class="tunnel-directory__format">1970–1990 · playlists do primeiro apoiador · áudio</span><span class="tunnel-directory__state">24 HOURS</span><span class="tunnel-directory__action">Abrir sinal</span>';
    row.addEventListener('click', () => {
      const panel = document.getElementById(PANEL_ID);
      if (!panel) return;
      const willOpen = panel.hidden;
      document.querySelectorAll('[data-passport-tunnel-panel="1"]').forEach((o) => { o.hidden = true; });
      panel.hidden = !willOpen;
      if (willOpen) panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
      '<div class="tunnel-panel-copy"><span class="tunnel-eyebrow">PASSPORT MEMORY SIGNAL™ · ÁUDIO</span><h3>Novelas Tunnel™</h3><p>O vídeo fica escondido. Só o som sai. Playlists que você passou.</p></div>' +
      '<div id="novelasDeck" style="display:flex;flex-wrap:wrap;gap:6px;margin:12px 0"></div>' +
      '<div class="tunnel-player" style="display:flex;align-items:center;gap:12px;padding:14px 0;border-top:1px solid #111">' +
      '<button id="novelasPlay" type="button">PLAY</button>' +
      '<div><strong>NOVELAS TUNNEL™</strong><small> ÁUDIO · 24 HOURS</small></div>' +
      '<span id="novelasStatus">READY</span></div>' +
      '<div id="passportNovelasHidden" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)"></div>';
    host.appendChild(panel);
    document.getElementById('novelasPlay').addEventListener('click', toggle);
    const deck = panel.querySelector('#novelasDeck');
    PLAYLISTS.forEach((p, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = p.label;
      b.style.cssText = 'font:700 .72rem Inter,sans-serif;border:1px solid #111;background:#fff;padding:6px 8px;cursor:pointer';
      b.addEventListener('click', () => {
        deck.querySelectorAll('button').forEach((x) => { x.style.background = '#fff'; x.style.color = '#111'; });
        b.style.background = '#111'; b.style.color = '#fff';
        playList(i);
      });
      deck.appendChild(b);
    });
  }

  function boot() {
    ensureDirectory();
    ensurePanel();
    window.PassportNovelasTunnel = {
      stop() { wantOn = false; try { player && player.pauseVideo(); } catch (_) {} }
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
