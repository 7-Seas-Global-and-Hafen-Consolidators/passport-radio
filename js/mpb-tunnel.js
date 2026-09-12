/* PASSPORT RADIO · MPB TUNNEL™
   Clean engine · Rádio Só MPB · 100% Brasil
   Icecast watchdog based on Qwen recovery plan.
*/
(() => {
  "use strict";

  const STREAM_URL = "https://srv1.braudio.com.br:7008/;";
  const AUDIO_ID = "passportMPBAudio";
  const PLAY_ID = "passportMPBPlay";
  const STATUS_ID = "passportMPBStatus";

  /* Total cleanup of stale MPB engine instances before mounting the current one. */
  document.querySelectorAll("#passportMPBAudio,#passportMPBPlay,#passportMPBStatus,[data-passport-mpb-engine]").forEach(node => {
    if (node instanceof HTMLMediaElement) {
      try { node.pause(); node.removeAttribute("src"); node.load(); } catch (_) {}
    }
    try { node.remove(); } catch (_) {}
  });

  const host = document.getElementById("ppv2EngineBay") || document.body;
  const engine = document.createElement("div");
  engine.dataset.passportMpbEngine = "current";
  engine.hidden = true;
  engine.innerHTML = `<button id="${PLAY_ID}" type="button" aria-label="Reproduzir MPB Tunnel™">▶</button><strong id="${STATUS_ID}">READY</strong><audio id="${AUDIO_ID}" preload="none"></audio>`;
  host.appendChild(engine);

  const audio = document.getElementById(AUDIO_ID);
  const play = document.getElementById(PLAY_ID);
  const status = document.getElementById(STATUS_ID);
  if (!audio || !play || !status) return;

  let wantsPlayback = false;
  let recovering = false;
  let watchdogInterval = 0;
  let recoveryTimeout = 0;

  function setStatus(value) { status.textContent = value; }
  function clearRecovery() {
    if (recoveryTimeout) clearTimeout(recoveryTimeout);
    recoveryTimeout = 0;
  }
  function stopWatchdog() {
    if (watchdogInterval) clearInterval(watchdogInterval);
    watchdogInterval = 0;
  }
  function startWatchdog() {
    stopWatchdog();
    watchdogInterval = window.setInterval(() => {
      if (!wantsPlayback || recovering) return;
      if (audio.ended || audio.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) recover(100);
    }, 5000);
  }
  function freshStream() {
    return `${STREAM_URL}?t=${Date.now()}`;
  }

  async function openSocket() {
    if (!wantsPlayback) return;
    setStatus("CONNECTING");
    audio.src = freshStream();
    audio.load();
    try {
      await audio.play();
    } catch (error) {
      console.warn("[MPB Tunnel] play failed", error);
      if (wantsPlayback) recover(1500);
    }
  }

  function recover(delay = 1000) {
    if (!wantsPlayback) return;
    clearRecovery();
    setStatus("RECONNECTING");
    recoveryTimeout = window.setTimeout(async () => {
      recoveryTimeout = 0;
      if (!wantsPlayback) return;
      recovering = true;
      try {
        audio.removeAttribute("src");
        audio.load();
        await openSocket();
      } finally {
        recovering = false;
      }
    }, delay);
  }

  function stop(intentional = true) {
    if (intentional) wantsPlayback = false;
    clearRecovery();
    stopWatchdog();
    try { audio.pause(); } catch (_) {}
    if (intentional) {
      setStatus("PAUSED");
      play.textContent = "▶";
      play.setAttribute("aria-label", "Reproduzir MPB Tunnel™");
    }
  }

  play.addEventListener("click", () => {
    if (wantsPlayback) {
      stop(true);
      return;
    }
    document.querySelectorAll("audio,video").forEach(media => {
      if (media !== audio && !media.paused) try { media.pause(); } catch (_) {}
    });
    wantsPlayback = true;
    openSocket();
  });

  audio.addEventListener("play", () => {
    wantsPlayback = true;
    startWatchdog();
  });
  audio.addEventListener("playing", () => {
    clearRecovery();
    setStatus("ON AIR");
    play.textContent = "Ⅱ";
    play.setAttribute("aria-label", "Pausar MPB Tunnel™");
  });
  audio.addEventListener("waiting", () => {
    if (wantsPlayback) setStatus("BUFFERING");
  });
  ["error", "stalled", "ended"].forEach(eventName => {
    audio.addEventListener(eventName, () => {
      if (wantsPlayback && !recovering) recover(eventName === "ended" ? 500 : 1500);
    });
  });
  audio.addEventListener("pause", () => {
    if (!recovering && wantsPlayback) {
      /* A pause emitted by another Passport player is intentional exclusivity. */
      wantsPlayback = false;
      clearRecovery();
      stopWatchdog();
      setStatus("PAUSED");
      play.textContent = "▶";
    }
  });

  document.addEventListener("play", event => {
    if (event.target instanceof HTMLMediaElement && event.target !== audio && wantsPlayback) stop(true);
  }, true);

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && wantsPlayback && (audio.ended || audio.networkState === HTMLMediaElement.NETWORK_NO_SOURCE)) recover(300);
  });
  window.addEventListener("online", () => {
    if (wantsPlayback) recover(500);
  });

  console.log("[MPB Tunnel] clean Só MPB engine initialized.");
})();
