/* PASSPORT RADIO — fetal transplant: Continuous Signals -> Home primary player
   Reversible layer. Local MP3 archive remains untouched in portal-home.js. */
(() => {
  'use strict';

  if (location.pathname !== '/' && location.pathname !== '/index.html') return;

  const SIGNALS = [
    { key: 'metal', label: 'METAL', stream: 'https://stations.radio-host.com/proxy/metalmanialive/stream' },
    { key: 'unplugged', label: 'UNPLUGGED', stream: 'https://stations.radio-host.com/proxy/unpluggedlive/stream' },
    { key: 'livejam', label: 'LIVE JAM', stream: 'https://stations.radio-host.com/proxy/livejam/stream' }
  ];

  const audio = document.getElementById('audio');
  const play = document.getElementById('play');
  const prev = document.getElementById('prev');
  const next = document.getElementById('next');
  const track = document.getElementById('track');
  const meta = document.getElementById('meta');
  const state = document.getElementById('state');
  if (!audio || !play || !prev || !next || !track || !meta || !state) return;

  let index = Number(sessionStorage.getItem('passport_continuous_signal') || 0) % SIGNALS.length;
  let requestedPlay = false;

  const stopOtherMedia = () => {
    document.querySelectorAll('audio,video').forEach((media) => {
      if (media !== audio && !media.paused) media.pause();
    });
  };

  const paint = () => {
    const signal = SIGNALS[index];
    track.textContent = signal.label;
    meta.textContent = 'Passport Radio · Continuous Signals™ · 24H';
    sessionStorage.setItem('passport_continuous_signal', String(index));
  };

  const arm = () => {
    const signal = SIGNALS[index];
    requestedPlay = false;
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    audio.src = signal.stream;
    audio.preload = 'none';
    paint();
    play.textContent = '▶';
    state.textContent = '24H · PRONTO';
  };

  const start = async () => {
    requestedPlay = true;
    stopOtherMedia();
    if (!audio.src || !audio.src.includes(SIGNALS[index].stream)) arm();
    requestedPlay = true;
    state.textContent = 'CONECTANDO';
    try {
      await audio.play();
    } catch (_) {
      if (requestedPlay) state.textContent = 'SINAL INDISPONÍVEL';
    }
  };

  const choose = (nextIndex) => {
    const wasPlaying = !audio.paused || requestedPlay;
    index = (nextIndex + SIGNALS.length) % SIGNALS.length;
    arm();
    if (wasPlaying) start();
  };

  play.onclick = () => {
    if (audio.paused) start();
    else {
      requestedPlay = false;
      audio.pause();
    }
  };
  prev.onclick = () => choose(index - 1);
  next.onclick = () => choose(index + 1);

  audio.onplaying = () => {
    requestedPlay = true;
    play.textContent = 'Ⅱ';
    state.textContent = 'NO AR';
  };
  audio.onpause = () => {
    play.textContent = '▶';
    if (!requestedPlay) state.textContent = '24H · PAUSADO';
  };
  audio.onerror = () => {
    if (requestedPlay) state.textContent = 'SINAL INDISPONÍVEL';
  };
  audio.onended = () => {
    if (requestedPlay) start();
  };

  arm();
})();
