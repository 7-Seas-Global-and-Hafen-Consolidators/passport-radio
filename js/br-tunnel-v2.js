/* PASSPORT RADIO · BR TUNNEL™ V2
   Brazilian rock tunnel panel. Integrates with the main tunnel orchestrator.
   Panel visibility is managed by radio-tunnels-ui.js.
*/
(() => {
  "use strict";

  if (!document.body.classList.contains("live-page")) return;

  const hub = document.getElementById("passportTunnels");
  const stage = hub?.querySelector(".tunnel-stage-shell");
  if (!hub || !stage) return;

  const PLAYLIST = "https://www.radios.com.br/play/playlist/289021/listen-radio.m3u";
  const ID = "passportBRv2";

  hub.querySelectorAll("#passportBR, #passportBRv2").forEach(el => el.remove());

  const panel = document.createElement("section");
  panel.id = ID;
  panel.className = "passport-br-section";
  panel.setAttribute("data-passport-tunnel-panel", "1");
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
            <button type="button" id="brPlay" aria-label="Tocar BR Tunnel" style="width:58px;height:58px;border-radius:50%;border:0;background:#e10600;color:#fff;font-size:1.25rem;cursor:pointer">▶</button>
            <div style="min-width:220px;flex:1">
              <small style="display:block;font-weight:800;letter-spacing:.12em;text-transform:uppercase">BR Tunnel™ · 24H</small>
              <strong id="brStatus" style="display:block;margin-top:5px;font-size:1.1rem">Pronto para tocar</strong>
              <span style="display:block;margin-top:3px;color:#666;font-size:.82rem">Rock Brasil · sinal contínuo</span>
            </div>
          </div>
          <audio id="brAudio" preload="none"></audio>
        </div>
        <span class="handwritten" style="display:block;margin-top:20px">do Brasil, alto e sem pedir licença.</span>
      </div>
    </div>`;
  stage.appendChild(panel);

  const audio = document.getElementById("brAudio");
  const play = document.getElementById("brPlay");
  const status = document.getElementById("brStatus");
  const rowState = hub.querySelector('[data-tunnel-target="passportBRv2"] .tunnel-directory__state');

  if (!audio || !play || !status) return;

  let resolvedStream = "";
  let recoveryTimer = 0;
  let shouldPlay = false;
  let internalRecovery = false;

  async function resolveStream(force = false) {
    if (resolvedStream && !force) return resolvedStream;
    if (force) resolvedStream = "";

    const response = await fetch(`${PLAYLIST}?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`BR playlist HTTP ${response.status}`);

    const text = await response.text();
    const candidate = text
      .split(/\r?\n/)
      .map(line => line.trim())
      .find(line => /^https?:\/\//i.test(line));

    if (!candidate) throw new Error("BR playlist has no stream URL");
    resolvedStream = candidate;
    return resolvedStream;
  }

  function clearRecovery() {
    if (recoveryTimer) {
      clearTimeout(recoveryTimer);
      recoveryTimer = 0;
    }
  }

  function recover(delay = 900) {
    if (!shouldPlay) return;
    clearRecovery();
    status.textContent = "Reconectando…";
    if (rowState) rowState.textContent = "RECONNECTING";

    recoveryTimer = window.setTimeout(async () => {
      if (!shouldPlay) return;
      try {
        const stream = await resolveStream(true);
        if (!shouldPlay) return;
        internalRecovery = true;
        audio.src = stream;
        audio.load();
        await audio.play();
      } catch (error) {
        console.warn("[Passport BR Tunnel] recovery failed", error);
        if (shouldPlay) recover(2500);
      } finally {
        internalRecovery = false;
      }
    }, delay);
  }

  audio.addEventListener("playing", () => {
    shouldPlay = true;
    clearRecovery();
    play.textContent = "Ⅱ";
    play.setAttribute("aria-label", "Pausar BR Tunnel");
    status.textContent = "ON AIR · ROCK BRASILEIRO";
    if (rowState) rowState.textContent = "ON AIR";
  });

  audio.addEventListener("pause", () => {
    play.textContent = "▶";
    play.setAttribute("aria-label", "Tocar BR Tunnel");
    if (!internalRecovery) {
      shouldPlay = false;
      clearRecovery();
      if (status.textContent.startsWith("ON AIR") || status.textContent.startsWith("Reconectando")) status.textContent = "Pausado";
      if (rowState) rowState.textContent = "24 HOURS";
    }
  });

  audio.addEventListener("error", () => {
    if (shouldPlay) {
      recover(700);
      return;
    }
    play.textContent = "▶";
    status.textContent = "Sinal indisponível agora · tente novamente";
    if (rowState) rowState.textContent = "SIGNAL UNAVAILABLE";
  });

  audio.addEventListener("stalled", () => {
    if (shouldPlay) recover(1200);
  });

  audio.addEventListener("ended", () => {
    if (shouldPlay) recover(500);
  });

  audio.addEventListener("waiting", () => {
    if (shouldPlay) status.textContent = "Conectando…";
  });

  window.addEventListener("online", () => {
    if (shouldPlay) recover(300);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && shouldPlay && (audio.paused || audio.ended || audio.networkState === HTMLMediaElement.NETWORK_NO_SOURCE)) {
      recover(250);
    }
  });

  play.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!audio.paused) {
      shouldPlay = false;
      clearRecovery();
      audio.pause();
      return;
    }

    document.querySelectorAll("audio, video").forEach(media => {
      if (media !== audio && !media.paused) {
        try { media.pause(); } catch (_) {}
      }
    });

    shouldPlay = true;
    status.textContent = "Conectando…";

    try {
      const stream = await resolveStream(true);
      if (!shouldPlay) return;
      audio.src = stream;
      audio.load();
      await audio.play();
    } catch (error) {
      console.warn("[Passport BR Tunnel] stream unavailable", error);
      if (shouldPlay) recover(1500);
    }
  });
})();
