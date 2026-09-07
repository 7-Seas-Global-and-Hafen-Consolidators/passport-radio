/**
 * PASSPORT RADIO · BR TUNNEL™
 * Engenharia Principal · Pop Rock Brasil · Rock Nacional 24H
 * Versão: 3.0.0 (Cirurgia Completa - Respeita Orquestrador)
 */
(function () {
  const TUNNEL_ID = "br";
  const PANEL_ID = "passportBR";
  const AUDIO_ID = "brAudio";
  const PLAY_ID = "brPlay";
  const STATUS_ID = "brStatus";
  const PLAYLIST_URL = "https://www.radios.com.br/play/playlist/289021/listen-radio.m3u";

  let audioEl = null;
  let playBtn = null;
  let statusEl = null;
  let resolvedStream = "";
  let wantsPlayback = false;
  let recoveryAttempts = 0;
  let recoveryTimer = null;
  let watchdogTimer = null;
  let isInjected = false;

  function log(msg) { console.log(`[BR TUNNEL] ${msg}`); }

  function setStatus(text, state) {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.dataset.state = state || "idle";
  }

  function updatePlayButton(isPlaying) {
    if (!playBtn) return;
    playBtn.textContent = isPlaying ? "❚❚" : "▶";
    playBtn.setAttribute("aria-label", isPlaying ? "Pausar" : "Tocar");
  }

  function injectEngine() {
    if (isInjected) return true;
    let panel = document.getElementById(PANEL_ID) ||
                document.querySelector(`[data-tunnel-id="${TUNNEL_ID}"]`) ||
                document.querySelector(`.tunnel-stage-shell[data-tunnel="${TUNNEL_ID}"]`);
    if (!panel) {
      log("Painel do orquestrador ainda não existe. Aguardando...");
      return false;
    }

    panel.innerHTML = `
      <div class="br-engine-wrapper" style="width:100%; display:flex; flex-direction:column; gap:12px; padding:10px 0;">
        <div class="br-controls" style="display:flex; align-items:center; gap:15px;">
          <button id="${PLAY_ID}" class="br-play-btn" aria-label="Tocar BR Tunnel" style="font-size:28px; background:transparent; border:2px solid currentColor; border-radius:50%; width:50px; height:50px; cursor:pointer; display:flex; align-items:center; justify-content:center; color:inherit; transition: all 0.2s;">▶</button>
          <div class="br-info" style="display:flex; flex-direction:column; gap:4px;">
            <strong id="${STATUS_ID}" style="font-size:13px; letter-spacing:1.5px; text-transform:uppercase; font-weight:700;">AGUARDANDO</strong>
            <span style="font-size:11px; opacity:0.6; letter-spacing:0.5px;">do Brasil, alto e sem pedir licença.</span>
          </div>
        </div>
        <audio id="${AUDIO_ID}" preload="none" crossorigin="anonymous" playsinline></audio>
      </div>`;

    audioEl = document.getElementById(AUDIO_ID);
    playBtn = document.getElementById(PLAY_ID);
    statusEl = document.getElementById(STATUS_ID);
    bindEvents();
    isInjected = true;
    log("Motor injetado com sucesso no shell do orquestrador.");
    return true;
  }

  function bindEvents() {
    playBtn.addEventListener("click", togglePlayback);
    audioEl.addEventListener("playing", () => {
      wantsPlayback = true;
      recoveryAttempts = 0;
      clearRecovery();
      startWatchdog();
      updatePlayButton(true);
      setStatus("ON AIR · ROCK BRASILEIRO", "playing");
    });
    audioEl.addEventListener("pause", () => {
      if (audioEl.ended || !wantsPlayback) {
        updatePlayButton(false);
        if (!wantsPlayback) setStatus("PAUSADO", "paused");
      }
    });
    audioEl.addEventListener("waiting", () => {
      if (wantsPlayback) setStatus("BUFFERING...", "buffering");
    });
    audioEl.addEventListener("error", () => {
      log("Erro no áudio: " + (audioEl.error ? audioEl.error.code : "Desconhecido"));
      if (wantsPlayback) triggerRecovery("ERROR");
    });
    audioEl.addEventListener("stalled", () => {
      if (wantsPlayback) setStatus("RECONECTANDO...", "reconnecting");
    });
    audioEl.addEventListener("ended", () => {
      if (wantsPlayback) triggerRecovery("ENDED");
    });
    window.addEventListener("online", () => {
      if (wantsPlayback) triggerRecovery("ONLINE");
    });
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && wantsPlayback && audioEl.paused) triggerRecovery("VISIBILITY");
    });
  }

  function togglePlayback() {
    if (wantsPlayback) {
      wantsPlayback = false;
      audioEl.pause();
      audioEl.removeAttribute("src");
      audioEl.load();
      updatePlayButton(false);
      setStatus("PAUSADO", "paused");
      clearRecovery();
      stopWatchdog();
    } else {
      wantsPlayback = true;
      openSocket();
    }
  }

  async function resolveStream() {
    if (resolvedStream) return resolvedStream;
    try {
      setStatus("RESOLVENDO SINAL...", "connecting");
      const response = await fetch(`${PLAYLIST_URL}?t=${Date.now()}`, { cache: "no-store", mode: "cors" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      const stream = text.split(/\r?\n/).map(line => line.trim()).find(line => /^https?:\/\//i.test(line));
      if (!stream) throw new Error("M3U vazio");
      resolvedStream = stream;
      return resolvedStream;
    } catch (err) {
      log("Falha ao resolver M3U via fetch (CORS/Hotlink): " + err.message);
      return PLAYLIST_URL;
    }
  }

  async function openSocket() {
    if (!wantsPlayback) return;
    setStatus("CONECTANDO...", "connecting");
    const stream = await resolveStream();
    if (!wantsPlayback) return;
    if (audioEl.src !== stream) audioEl.src = stream;
    audioEl.load();
    try {
      await audioEl.play();
    } catch (err) {
      log("Play falhou: " + err.name);
      if (err.name === "NotAllowedError") {
        setStatus("TOQUE PARA ATIVAR", "error");
        wantsPlayback = false;
        updatePlayButton(false);
      } else {
        triggerRecovery("PLAY_ERROR");
      }
    }
  }

  function triggerRecovery(reason) {
    if (!wantsPlayback) return;
    clearRecovery();
    recoveryAttempts++;
    if (recoveryAttempts > 5) {
      setStatus("SINAL INDISPONÍVEL", "error");
      wantsPlayback = false;
      updatePlayButton(false);
      return;
    }
    setStatus(`RECONECTANDO (${recoveryAttempts})...`, "reconnecting");
    const delay = Math.min(1000 * Math.pow(2, recoveryAttempts - 1), 8000);
    recoveryTimer = setTimeout(() => {
      audioEl.pause();
      audioEl.removeAttribute("src");
      audioEl.load();
      resolvedStream = "";
      openSocket();
    }, delay);
  }

  function clearRecovery() {
    if (recoveryTimer) { clearTimeout(recoveryTimer); recoveryTimer = null; }
  }

  function startWatchdog() {
    stopWatchdog();
    watchdogTimer = setInterval(() => {
      if (wantsPlayback && audioEl.paused && audioEl.readyState < 3) {
        log("Watchdog: Áudio travado, forçando recovery.");
        triggerRecovery("WATCHDOG");
      }
    }, 5000);
  }

  function stopWatchdog() {
    if (watchdogTimer) { clearInterval(watchdogTimer); watchdogTimer = null; }
  }

  window.BRTunnelEngine = {
    init: injectEngine,
    play: () => { if (!wantsPlayback) togglePlayback(); },
    pause: () => { if (wantsPlayback) togglePlayback(); },
    isPlaying: () => wantsPlayback && audioEl && !audioEl.paused
  };

  function boot() {
    if (injectEngine()) return;
    const observer = new MutationObserver((mutations, obs) => {
      if (injectEngine()) obs.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), 10000);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
