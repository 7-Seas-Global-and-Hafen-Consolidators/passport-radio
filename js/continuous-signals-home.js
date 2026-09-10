/* ========================================================================== 
   PASSPORT RADIO — DEFINITIVE CONTINUOUS SIGNALS ENGINE (v2026-RESCUE)
   Single unified audio controller for Home & Cabin.
   ========================================================================== */
(() => {
  "use strict";

  // Canais verificados e ativos com fallback
  const SIGNALS = [
    {
      key: "metal",
      label: "METAL",
      desc: "Continuous Signals™ · Heavy & Extreme",
      stream: "https://mediaserv68.live-streams.nl:18012/OnlyLive"
    },
    {
      key: "unplugged",
      label: "UNPLUGGED",
      desc: "Continuous Signals™ · Acoustic Sessions",
      stream: "https://streams.radio7.de/unplugged/mp3-192/web/"
    },
    {
      key: "livejam",
      label: "LIVE JAM",
      desc: "Continuous Signals™ · Live Rock & Classics",
      stream: "https://stations.radio-host.com/proxy/livejam/stream"
    },
    {
      key: "regenbogen",
      label: "ACOUSTIC ROCK",
      desc: "Continuous Signals™ · Pure Guitars",
      stream: "https://stream.regenbogen.de/unplugged/mp3-128/stream.regenbogen.de/"
    }
  ];

  let currentIndex = Number(sessionStorage.getItem("passport_continuous_signal") || 0) % SIGNALS.length;
  let isPlaying = false;
  let retryTimer = null;
  let playAttempt = 0;

  // Cache dos elementos do DOM
  function getElements() {
    return {
      audio: document.getElementById("audio") || document.getElementById("passport-live-audio"),
      playBtn: document.getElementById("play") || document.getElementById("passport-live-play") || document.getElementById("pp-play"),
      prevBtn: document.getElementById("prev"),
      nextBtn: document.getElementById("next"),
      trackLabel: document.getElementById("track") || document.getElementById("passport-live-channel-name") || document.getElementById("pp-signal-name-bar"),
      metaLabel: document.getElementById("meta"),
      stateLabel: document.getElementById("state") || document.getElementById("passport-live-status") || document.getElementById("pp-state")
    };
  }

  function setStatus(text) {
    const { stateLabel } = getElements();
    if (stateLabel) stateLabel.textContent = text;
  }

  function setTrackInfo(signal) {
    const { trackLabel, metaLabel } = getElements();
    if (trackLabel) trackLabel.textContent = signal.label;
    if (metaLabel) metaLabel.textContent = signal.desc;
    sessionStorage.setItem("passport_continuous_signal", String(currentIndex));
  }

  function setPlayButtonVisual(playing) {
    const { playBtn } = getElements();
    if (!playBtn) return;
    playBtn.textContent = playing ? "❚❚" : "▶";
    playBtn.setAttribute("aria-label", playing ? "Pausar" : "Tocar");
    document.body.dataset.playing = playing ? "1" : "0";
  }

  function silenceAllOtherMedia(currentAudio) {
    document.querySelectorAll("audio, video").forEach((media) => {
      if (media !== currentAudio && !media.paused) {
        try { media.pause(); } catch (_) {}
      }
    });
  }

  function armStream(index, bustCache = false) {
    const { audio } = getElements();
    if (!audio) return;

    const signal = SIGNALS[index];
    setTrackInfo(signal);

    audio.pause();
    audio.removeAttribute("src");
    audio.load();

    let streamUrl = signal.stream;
    if (bustCache) {
      streamUrl += (streamUrl.includes("?") ? "&" : "?") + "_ts=" + Date.now();
    }

    audio.src = streamUrl;
    audio.preload = "none";
  }

  async function executePlay(retry = false) {
    const { audio } = getElements();
    if (!audio) return;

    clearTimeout(retryTimer);
    silenceAllOtherMedia(audio);

    const targetSignal = SIGNALS[currentIndex];
    if (!audio.src || !audio.src.includes(targetSignal.stream.split("?")[0]) || retry) {
      armStream(currentIndex, retry);
    }

    setStatus(retry ? "RECONECTANDO..." : "CONECTANDO...");
    const currentAttempt = ++playAttempt;

    try {
      await audio.play();
      if (currentAttempt === playAttempt) {
        isPlaying = true;
        setPlayButtonVisual(true);
        setStatus("NO AR · 24H");
      }
    } catch (err) {
      console.warn("[Passport Radio] Erro ao reproduzir stream:", err);
      if (currentAttempt !== playAttempt) return;

      if (!retry) {
        setStatus("RECONECTANDO...");
        retryTimer = setTimeout(() => {
          executePlay(true);
        }, 1000);
      } else {
        isPlaying = false;
        setPlayButtonVisual(false);
        setStatus("SINAL INSTÁVEL");
      }
    }
  }

  function executePause() {
    const { audio } = getElements();
    clearTimeout(retryTimer);
    ++playAttempt;
    isPlaying = false;
    if (audio) audio.pause();
    setPlayButtonVisual(false);
    setStatus("24H · PAUSADO");
  }

  function switchChannel(step) {
    clearTimeout(retryTimer);
    const wasPlaying = isPlaying;
    currentIndex = (currentIndex + step + SIGNALS.length) % SIGNALS.length;
    armStream(currentIndex, false);

    if (wasPlaying) {
      executePlay(false);
    } else {
      setStatus("24H · PRONTO");
      setPlayButtonVisual(false);
    }
  }

  // Monitor de métricas / CounterAPI (preservado e isolado)
  function initAnalyticsHeartbeat() {
    const endpoint = "https://counterapi.com/api/passportradio.online/listen/signal";
    let lastBeat = 0;

    const ping = () => {
      const now = Date.now();
      if (now - lastBeat < 30000) return;
      lastBeat = now;
      fetch(`${endpoint}?trackOnly=true`, { mode: "cors", cache: "no-store" }).catch(() => {});
    };

    document.addEventListener("play", (e) => {
      if (e.target instanceof HTMLMediaElement) ping();
    }, true);
  }

  function installEngine() {
    const els = getElements();
    if (!els.audio || !els.playBtn) {
      console.warn("[Passport Engine] Elementos do player não localizados no DOM.");
      return;
    }

    // Inicializa a interface com o sinal gravado
    setTrackInfo(SIGNALS[currentIndex]);
    setStatus("24H · PRONTO");
    setPlayButtonVisual(false);

    // Eventos dos Controles
    els.playBtn.onclick = (e) => {
      e.preventDefault();
      const { audio } = getElements();
      if (!audio) return;
      if (audio.paused) {
        executePlay(false);
      } else {
        executePause();
      }
    };

    if (els.prevBtn) {
      els.prevBtn.onclick = (e) => {
        e.preventDefault();
        switchChannel(-1);
      };
    }

    if (els.nextBtn) {
      els.nextBtn.onclick = (e) => {
        e.preventDefault();
        switchChannel(1);
      };
    }

    // Atalhos dos Chips/Botões de canal adicionais caso existam na página
    document.querySelectorAll("[data-live-channel]").forEach((chip) => {
      chip.addEventListener("click", () => {
        const key = chip.dataset.liveChannel;
        const targetIdx = SIGNALS.findIndex((s) => s.key === key);
        if (targetIdx !== -1) {
          currentIndex = targetIdx;
          armStream(currentIndex, false);
          executePlay(false);
        }
      });
    });

    // Eventos Nativos da Tag <audio>
    els.audio.addEventListener("playing", () => {
      isPlaying = true;
      setPlayButtonVisual(true);
      setStatus("NO AR · 24H");
    });

    els.audio.addEventListener("pause", () => {
      if (!isPlaying) {
        setPlayButtonVisual(false);
        setStatus("24H · PAUSADO");
      }
    });

    els.audio.addEventListener("error", () => {
      if (isPlaying) {
        setStatus("RECONECTANDO...");
        clearTimeout(retryTimer);
        retryTimer = setTimeout(() => executePlay(true), 1200);
      }
    });

    // Subir tracking em background
    initAnalyticsHeartbeat();
    console.info("[Passport Radio] Motor contínuo carregado com sucesso.");
  }

  // Boot seguro esperando o DOM carregar
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installEngine, { once: true });
  } else {
    installEngine();
  }
})();
