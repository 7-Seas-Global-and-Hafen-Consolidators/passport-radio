/* PASSPORT RADIO · BR TUNNEL™
   Clean engine · Pop Rock Brasil · Rock Nacional 24H
   Dedicated to BR only. No other Passport player is modified here.
*/
(() => {
  "use strict";
  if (!document.body.classList.contains("live-page")) return;

  const PLAYLIST = "https://www.radios.com.br/play/playlist/289021/listen-radio.m3u";
  const PANEL_ID = "passportBRv2";
  const AUDIO_ID = "brAudio";
  const PLAY_ID = "brPlay";
  const STATUS_ID = "brStatus";

  const hub = document.getElementById("passportTunnels");
  const stage = hub?.querySelector(".tunnel-stage-shell");
  if (!hub || !stage) return;

  /* BR-only sanitation: kill every stale BR engine/panel before mounting one current instance. */
  hub.querySelectorAll("#passportBR,#passportBRv2,[data-passport-br-engine]").forEach(node => {
    node.querySelectorAll?.("audio,video").forEach(media => {
      try { media.pause(); media.removeAttribute("src"); media.load(); } catch (_) {}
    });
    try { node.remove(); } catch (_) {}
  });
  document.querySelectorAll(`#${AUDIO_ID},#${PLAY_ID},#${STATUS_ID}`).forEach(node => {
    if (node instanceof HTMLMediaElement) {
      try { node.pause(); node.removeAttribute("src"); node.load(); } catch (_) {}
    }
    try { node.remove(); } catch (_) {}
  });

  const panel = document.createElement("section");
  panel.id = PANEL_ID;
  panel.className = "passport-br-section";
  panel.dataset.passportTunnelPanel = "1";
  panel.dataset.passportBrEngine = "current";
  panel.hidden = true;
  panel.setAttribute("aria-hidden", "true");
  panel.innerHTML = `
    <div class="live-shell">
      <div style="padding:34px 0 40px">
        <span class="live-kicker">PASSPORT RADIO™ · 24 HOURS · BRAZIL</span>
        <h2 style="margin:.25em 0 .18em;font-size:clamp(3rem,9vw,7rem);line-height:.86">BR<br>Tunnel™</h2>
        <p style="max-width:720px">Rock brasileiro atravessando gerações: clássicos, 80s, 90s, 2000 e novas cenas em sinal contínuo.</p>
        <div style="margin-top:24px;border:1px solid #d8d8d8;background:#fff;padding:20px;max-width:760px">
          <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap">
            <button type="button" id="${PLAY_ID}" aria-label="Tocar BR Tunnel" style="width:58px;height:58px;border-radius:50%;border:0;background:#e10600;color:#fff;font-size:1.25rem;cursor:pointer">▶</button>
            <div style="min-width:220px;flex:1">
              <small style="display:block;font-weight:800;letter-spacing:.12em;text-transform:uppercase">BR Tunnel™ · 24H</small>
              <strong id="${STATUS_ID}" style="display:block;margin-top:5px;font-size:1.1rem">READY</strong>
              <span style="display:block;margin-top:3px;color:#666;font-size:.82rem">Rock Brasil · sinal contínuo</span>
            </div>
          </div>
          <audio id="${AUDIO_ID}" preload="none"></audio>
        </div>
        <span class="handwritten" style="display:block;margin-top:20px">do Brasil, alto e sem pedir licença.</span>
      </div>
    </div>`;
  stage.appendChild(panel);

  const audio = document.getElementById(AUDIO_ID);
  const play = document.getElementById(PLAY_ID);
  const status = document.getElementById(STATUS_ID);
  const rowState = hub.querySelector('[data-tunnel-target="passportBRv2"] .tunnel-directory__state');
  if (!audio || !play || !status) return;

  let wantsPlayback = false;
  let recovering = false;
  let recoveryTimer = 0;
  let watchdogTimer = 0;
  let resolvedStream = "";

  const setStatus = value => {
    status.textContent = value;
    if (rowState) rowState.textContent = value === "ON AIR · ROCK BRASILEIRO" ? "ON AIR" : value;
  };

  function clearRecovery() {
    if (recoveryTimer) clearTimeout(recoveryTimer);
    recoveryTimer = 0;
  }

  function stopWatchdog() {
    if (watchdogTimer) clearInterval(watchdogTimer);
    watchdogTimer = 0;
  }

  function startWatchdog() {
    stopWatchdog();
    watchdogTimer = window.setInterval(() => {
      if (!wantsPlayback || recovering) return;
      if (audio.ended || audio.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) recover(100);
    }, 5000);
  }

  async function resolveStream(force = false) {
    if (resolvedStream && !force) return resolvedStream;
    if (force) resolvedStream = "";
    const response = await fetch(`${PLAYLIST}?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`BR playlist HTTP ${response.status}`);
    const text = await response.text();
    const stream = text.split(/\r?\n/).map(line => line.trim()).find(line => /^https?:\/\//i.test(line));
    if (!stream) throw new Error("BR playlist has no stream URL");
    resolvedStream = stream;
    return stream;
  }

  async function openSocket(force = false) {
    if (!wantsPlayback) return;
    setStatus("CONNECTING");
    const stream = await resolveStream(force);
    if (!wantsPlayback) return;
    audio.src = stream;
    audio.load();
    await audio.play();
  }

  function recover(delay = 900) {
    if (!wantsPlayback) return;
    clearRecovery();
    setStatus("RECONNECTING");
    recoveryTimer = window.setTimeout(async () => {
      recoveryTimer = 0;
      if (!wantsPlayback) return;
      recovering = true;
      try {
        audio.removeAttribute("src");
        audio.load();
        await openSocket(true);
      } catch (error) {
        console.warn("[Passport BR Tunnel] recovery failed", error);
        if (wantsPlayback) recover(2500);
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
      play.textContent = "▶";
      play.setAttribute("aria-label", "Tocar BR Tunnel");
      setStatus("24 HOURS");
    }
  }

  play.addEventListener("click", async event => {
    event.preventDefault();
    event.stopPropagation();
    if (wantsPlayback && !audio.paused) {
      stop(true);
      return;
    }

    /* Existing Passport exclusivity: pause other media, but never mutate their engines. */
    document.querySelectorAll("audio,video").forEach(media => {
      if (media !== audio && !media.paused) {
        try { media.pause(); } catch (_) {}
      }
    });

    wantsPlayback = true;
    try {
      await openSocket(true);
    } catch (error) {
      console.warn("[Passport BR Tunnel] initial connection failed", error);
      if (wantsPlayback) recover(1200);
    }
  });

  audio.addEventListener("playing", () => {
    wantsPlayback = true;
    recovering = false;
    clearRecovery();
    startWatchdog();
    play.textContent = "Ⅱ";
    play.setAttribute("aria-label", "Pausar BR Tunnel");
    setStatus("ON AIR · ROCK BRASILEIRO");
  });

  audio.addEventListener("pause", () => {
    if (recovering) return;
    if (wantsPlayback) return;
    play.textContent = "▶";
    play.setAttribute("aria-label", "Tocar BR Tunnel");
  });

  audio.addEventListener("waiting", () => {
    if (wantsPlayback) setStatus("CONNECTING");
  });
  audio.addEventListener("error", () => {
    if (wantsPlayback) recover(700);
  });
  audio.addEventListener("stalled", () => {
    if (wantsPlayback) recover(1200);
  });
  audio.addEventListener("ended", () => {
    if (wantsPlayback) recover(500);
  });

  window.addEventListener("online", () => {
    if (wantsPlayback) recover(300);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && wantsPlayback && (audio.paused || audio.ended || audio.networkState === HTMLMediaElement.NETWORK_NO_SOURCE)) recover(250);
  });
})();
