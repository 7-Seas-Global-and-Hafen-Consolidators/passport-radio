/* Passport Radio — Novelas Tunnel™
 * Audio-only soundtrack signal. No video/iframe.
 * The identity is deliberate mixed-shuffle: Brazilian + international
 * songs that appeared on novela soundtrack albums, 1970–1999.
 */
(() => {
  'use strict';

  const PANEL_ID = 'passportNovelas';
  const AUDIO_ID = 'passportNovelasAudio';
  const PLAY_ID = 'passportNovelasPlay';
  const STATUS_ID = 'passportNovelasStatus';

  const streamUrl = () => String(window.PASSPORT_NOVELAS_STREAM || '').trim();

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
    row.className = 'tunnel-directory-row';
    row.dataset.passportNovelasDirectory = '1';
    row.innerHTML = '<span class="tunnel-directory-number">09</span><span class="tunnel-directory-main"><strong>Novelas Tunnel™</strong><small>1970–1999 · trilhas nacionais + internacionais · salada mista</small></span><span class="tunnel-directory-state">24 HOURS</span>';
    row.addEventListener('click', () => {
      document.querySelectorAll('[data-passport-tunnel-panel="1"]').forEach((panel) => {
        panel.hidden = panel.id !== PANEL_ID;
      });
      const panel = document.getElementById(PANEL_ID);
      if (panel) panel.hidden = !panel.hidden;
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
        <p>As músicas dos discos de novelas — nacionais e internacionais — embaralhadas sem separar gênero, país ou década. A próxima faixa pode lembrar uma vida inteira.</p>
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
      if (!src) { status.textContent = 'STREAM PENDING'; return; }
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
    ensureDirectory();
    ensurePanel();
    window.PassportNovelasTunnel = {
      setStream(url) {
        window.PASSPORT_NOVELAS_STREAM = String(url || '').trim();
        const audio = document.getElementById(AUDIO_ID);
        if (audio) { audio.pause(); audio.removeAttribute('src'); audio.load(); }
      },
      stop() { const audio = document.getElementById(AUDIO_ID); if (audio) audio.pause(); }
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
