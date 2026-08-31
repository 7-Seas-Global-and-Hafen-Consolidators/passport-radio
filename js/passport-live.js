/* PASSPORT RADIO — CONTINUOUS SIGNALS / PASSPORT LIVE */
(() => {
  "use strict";

  const CHANNELS = {
    metal: { label: "METAL", stream: "https://mediaserv68.live-streams.nl:18012/OnlyLive" },
    unplugged: { label: "UNPLUGGED", stream: "https://stations.radio-host.com/proxy/unpluggedlive/stream" },
    livejam: { label: "LIVE JAM", stream: "https://stations.radio-host.com/proxy/livejam/stream" }
  };

  let currentChannel = "metal";
  let playAttempt = 0;
  let retryTimer = 0;
  let userPaused = true;

  const getArchiveAudio = () => document.getElementById("audio");
  const getLiveAudio = () => document.getElementById("passport-live-audio");
  const getLivePlayButton = () => document.getElementById("passport-live-play");

  function stopArchive() {
    const archive = getArchiveAudio();
    if (archive && !archive.paused) archive.pause();
  }

  function setStatus(text) {
    const status = document.getElementById("passport-live-status");
    if (status) status.textContent = text;
  }

  function setChannelLabel(text) {
    const label = document.getElementById("passport-live-channel-name");
    if (label) label.textContent = text;
  }

  function updateActiveButton(channelKey) {
    document.querySelectorAll("[data-live-channel]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.liveChannel === channelKey);
    });
  }

  function setPlayGlyph(playing) {
    const button = getLivePlayButton();
    if (button) button.textContent = playing ? "Ⅱ" : "▶";
  }

  function getStream(channelKey, retry = false) {
    const base = CHANNELS[channelKey]?.stream || "";
    if (!base || !retry) return base;
    return `${base}${base.includes("?") ? "&" : "?"}_passport=${Date.now()}`;
  }

  function armStream(channelKey, retry = false) {
    const live = getLiveAudio();
    if (!live) return;
    live.pause();
    live.removeAttribute("src");
    live.load();
    live.src = getStream(channelKey, retry);
    live.load();
  }

  async function startLive(retry = false) {
    const live = getLiveAudio();
    if (!live || !CHANNELS[currentChannel]) return;

    clearTimeout(retryTimer);
    stopArchive();
    userPaused = false;
    setStatus(retry ? "RECONECTANDO" : "CONECTANDO");
    if (!live.src || retry) armStream(currentChannel, retry);

    const attempt = ++playAttempt;
    try {
      await live.play();
    } catch (error) {
      if (attempt !== playAttempt || userPaused) return;
      console.error("[Passport Live] falha de reprodução:", error);
      if (!retry) {
        setStatus("RECONECTANDO");
        retryTimer = window.setTimeout(() => {
          if (!userPaused) startLive(true);
        }, 700);
      } else {
        setPlayGlyph(false);
        setStatus("SINAL INDISPONÍVEL");
      }
    }
  }

  function buildPlayer() {
    const host = document.getElementById("passport-live-radio");
    if (!host) return;
    host.innerHTML = `<section class="passport-live-panel"><div class="passport-live-head"><div><small>PASSPORT LIVE</small><strong id="passport-live-channel-name">METAL</strong></div></div><div class="passport-live-channels"><button type="button" class="passport-live-channel is-active" data-live-channel="metal">METAL</button><button type="button" class="passport-live-channel" data-live-channel="unplugged">UNPLUGGED</button><button type="button" class="passport-live-channel" data-live-channel="livejam">LIVE JAM</button></div><div class="passport-live-controls"><button id="passport-live-play" type="button" class="passport-live-play" aria-label="Ouvir ao vivo" title="Ouvir ao vivo">▶</button><span id="passport-live-status">PRONTO</span></div><audio id="passport-live-audio" preload="none"></audio></section>`;
    installChannelButtons();
    installPlayerControls();
    selectChannel("metal", false);
  }

  function installChannelButtons() {
    document.querySelectorAll("[data-live-channel]").forEach((button) => {
      button.addEventListener("click", () => selectChannel(button.dataset.liveChannel, true));
    });
  }

  function installPlayerControls() {
    const play = getLivePlayButton();
    const live = getLiveAudio();
    if (!play || !live) return;

    play.addEventListener("click", () => {
      if (!live.paused) {
        userPaused = true;
        ++playAttempt;
        clearTimeout(retryTimer);
        live.pause();
      } else {
        startLive(false);
      }
    });

    live.addEventListener("playing", () => {
      userPaused = false;
      setPlayGlyph(true);
      setStatus("NO AR");
    });
    live.addEventListener("pause", () => {
      setPlayGlyph(false);
      if (userPaused) setStatus("PAUSADO");
    });
    live.addEventListener("waiting", () => { if (!userPaused) setStatus("CONECTANDO"); });
    live.addEventListener("stalled", () => { if (!userPaused) setStatus("RECONECTANDO"); });
    live.addEventListener("canplay", () => { if (live.paused && userPaused) setStatus("PRONTO"); });
    live.addEventListener("error", () => {
      console.error("[Passport Live] erro de áudio:", live.error);
      if (!userPaused) setStatus("RECONECTANDO");
      else setStatus("SINAL INDISPONÍVEL");
    });
  }

  function selectChannel(channelKey, autoplay) {
    const config = CHANNELS[channelKey];
    const live = getLiveAudio();
    if (!config || !live) return;

    ++playAttempt;
    clearTimeout(retryTimer);
    userPaused = true;
    currentChannel = channelKey;
    setChannelLabel(config.label);
    updateActiveButton(channelKey);
    setPlayGlyph(false);
    setStatus("PRONTO");
    armStream(channelKey, false);
    if (autoplay) startLive(false);
  }

  function installArchiveInterlock() {
    const archive = getArchiveAudio();
    if (!archive) return;
    archive.addEventListener("play", () => {
      const live = getLiveAudio();
      if (live && !live.paused) {
        userPaused = true;
        ++playAttempt;
        clearTimeout(retryTimer);
        live.pause();
      }
    });
  }

  function init() {
    buildPlayer();
    installArchiveInterlock();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();