/* PASSPORT RADIO — Continuous Signals -> Home primary player
   Takes ownership only after the original portal-home.js player has finished
   installing its local MP3 handlers. The MP3 archive itself stays untouched. */
(() => {
  'use strict';

  if (location.pathname !== '/' && location.pathname !== '/index.html') return;

  const SIGNALS = [
    { key: 'metal', label: 'METAL', stream: 'https://mediaserv68.live-streams.nl:18012/OnlyLive' },
    { key: 'unplugged', label: 'UNPLUGGED · RADIO 7', stream: 'https://streams.radio7.de/unplugged/mp3-192/web/' },
    { key: 'regenbogen', label: 'UNPLUGGED · REGENBOGEN', stream: 'https://stream.regenbogen.de/unplugged/mp3-128/stream.regenbogen.de/' },
    { key: 'metalwarriors', label: 'HEAVY METAL', stream: 'https://nd02.ehostingperu.net:8009/stream' },
    { key: 'livejam', label: 'LIVE JAM', stream: 'https://stations.radio-host.com/proxy/livejam/stream' }
  ];

  const install = () => {
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
    let retryTimer = 0;

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

    const arm = (retry = false) => {
      const signal = SIGNALS[index];
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      audio.src = signal.stream + (retry ? `?_passport=${Date.now()}` : '');
      audio.preload = 'none';
      paint();
      play.textContent = '▶';
      state.textContent = retry ? 'RECONECTANDO' : '24H · PRONTO';
    };

    const start = async (retry = false) => {
      window.clearTimeout(retryTimer);
      requestedPlay = true;
      stopOtherMedia();

      const expected = SIGNALS[index].stream;
      if (!audio.src || !audio.src.startsWith(expected)) arm(retry);

      requestedPlay = true;
      state.textContent = retry ? 'RECONECTANDO' : 'CONECTANDO';
      try {
        await audio.play();
      } catch (_) {
        if (!requestedPlay) return;
        if (!retry) {
          retryTimer = window.setTimeout(() => {
            if (!requestedPlay) return;
            arm(true);
            start(true);
          }, 700);
        } else {
          state.textContent = 'SINAL INDISPONÍVEL';
        }
      }
    };

    const choose = (nextIndex) => {
      const wasPlaying = !audio.paused || requestedPlay;
      window.clearTimeout(retryTimer);
      requestedPlay = false;
      index = (nextIndex + SIGNALS.length) % SIGNALS.length;
      arm(false);
      if (wasPlaying) start(false);
    };

    play.onclick = () => {
      if (audio.paused) start(false);
      else {
        window.clearTimeout(retryTimer);
        requestedPlay = false;
        audio.pause();
      }
    };
    prev.onclick = () => choose(index - 1);
    next.onclick = () => choose(index + 1);

    audio.onplay = null;
    audio.onplaying = () => {
      requestedPlay = true;
      play.textContent = 'Ⅱ';
      state.textContent = 'NO AR';
    };
    audio.onpause = () => {
      play.textContent = '▶';
      if (!requestedPlay) state.textContent = '24H · PAUSADO';
    };
    audio.onended = () => {
      if (requestedPlay) start(false);
    };
    audio.onerror = () => {
      if (!requestedPlay) return;
      state.textContent = 'RECONECTANDO';
      window.clearTimeout(retryTimer);
      retryTimer = window.setTimeout(() => {
        if (!requestedPlay) return;
        arm(true);
        start(true);
      }, 700);
    };

    arm(false);
  };

  if (document.readyState === 'complete') install();
  else window.addEventListener('load', install, { once: true });
})();
