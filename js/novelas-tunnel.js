/* Passport Radio — Novelas Tunnel™
 * Sinal: Antena 1 (ballads nacionais/internacionais — o som que novelas usavam)
 * https://antenaone.crossradio.com.br/stream/1
 */
(() => {
  'use strict';

  const PANEL_ID = 'passportNovelas';
  const AUDIO_ID = 'passportNovelasAudio';
  const PLAY_ID = 'passportNovelasPlay';
  const STATUS_ID = 'passportNovelasStatus';
  const DEFAULT_STREAM = 'https://antenaone.crossradio.com.br/stream/1';

  const streamUrl = () => String(window.PASSPORT_NOVELAS_STREAM || DEFAULT_STREAM).trim();

  function stopOthers(audio) {
    document.querySelectorAll('audio').forEach((other) => {
      if (other !== audio && !other.paused) other.pause();
    });
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
    row.innerHTML = '<span class="tunnel-directory__number">09</span><strong class="tunnel-directory__title">Novelas Tunnel™</strong><span class="tunnel-directory__format">1970–1999 · trilhas nacionais + internacionais · salada mista</span><span class="tunnel-directory__state">24 HOURS</span><span class="tunnel-directory__action">Abrir sinal</span>';
    row.addEventListener('click', () => {
      const panel = document.getElementById(PANEL_ID);
      if (!panel) return;
      const willOpen = panel.hidden;
      document.querySelectorAll('[data-passport-tunnel-panel="1"]').forEach((other) => {
        other.hidden = true;
      });
      panel.hidden = !willOpen;
      row.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
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
    panel.innerHTML = `
      <div class="tunnel-panel-copy">
        <span class="tunnel-eyebrow">PASSPORT MEMORY SIGNAL™ · 1970–1999</span>
        <h3>Novelas Tunnel™</h3>
        <p>O som das trilhas: ballad nacional e internacional. Pedido do primeiro apoiador da Passport.</p>
      </div>
      <div class="tunnel-player">
        <button id="${PLAY_ID}" type="button" aria-label="Tocar Novelas Tunnel">PLAY</button>
        <div><strong>NOVELAS TUNNEL™</strong><small>1970–1999 · SOUNDTRACK MEMORY · 24 HOURS</small></div>
        <span id="${STATUS_ID}">READY</span>
        <audio id="${AUDIO_ID}" preload="none"></audio>
      </div>`;
    host.appendChild(panel);

    const audio = panel.querySelector('#' + AUDIO_ID);
    const play = panel.querySelector('#' + PLAY_ID);
    const status = panel.querySelector('#' + STATUS_ID);

    play.addEventListener('click', async () => {
      if (!audio.paused) { audio.pause(); status.textContent = 'READY'; play.textContent = 'PLAY'; return; }
      const src = streamUrl();
      if (audio.src !== src) audio.src = src;
      stopOthers(audio);
      try { await audio.play(); status.textContent = 'ON AIR'; play.textContent = 'PAUSE'; }
      catch (_) { status.textContent = 'RETRY'; }
    });
    audio.addEventListener('playing', () => { status.textContent = 'ON AIR'; play.textContent = 'PAUSE'; });
    audio.addEventListener('pause', () => { if (status.textContent === 'ON AIR') status.textContent = 'READY'; play.textContent = 'PLAY'; });
    audio.addEventListener('error', () => { status.textContent = 'OFFLINE'; play.textContent = 'PLAY'; });
  }

  function boot() {
    window.PASSPORT_NOVELAS_STREAM = DEFAULT_STREAM;
    ensureDirectory();
    ensurePanel();
    window.PassportNovelasTunnel = {
      setStream(url) {
        window.PASSPORT_NOVELAS_STREAM = String(url || DEFAULT_STREAM).trim();
        const audio = document.getElementById(AUDIO_ID);
        if (audio) { audio.pause(); audio.removeAttribute('src'); audio.load(); }
      },
      stop() { const audio = document.getElementById(AUDIO_ID); if (audio) audio.pause(); }
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
