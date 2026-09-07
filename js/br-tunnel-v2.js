/* PASSPORT RADIO · BR TUNNEL™ · ROCK NACIONAL BRASILEIRO
   Direct Zeno signal selected after mobile listening test.
   Native radio orchestrator + standalone Player V2 adapter. BR only.
*/
(() => {
  "use strict";

  if (!document.body.classList.contains("live-page")) return;

  const hub = document.getElementById("passportTunnels");
  const radioStage = hub?.querySelector(".tunnel-stage-shell");
  const standaloneBay = document.getElementById("ppv2EngineBay");
  const stage = radioStage || standaloneBay;
  if (!stage) return;

  const STREAM = "https://stream.zeno.fm/4cksare80s8uv";
  const ID = "passportBRv2";

  document.querySelectorAll("#passportBR, #passportBRv2").forEach(el => el.remove());

  const panel = document.createElement("section");
  panel.id = ID;
  panel.className = "passport-br-section";
  panel.setAttribute("data-passport-tunnel-panel", "1");
  panel.hidden = Boolean(hub);
  panel.setAttribute("aria-hidden", hub ? "true" : "false");
  panel.innerHTML = `
    <div class="live-shell">
      <div style="padding:34px 0 40px">
        <span class="live-kicker">PASSPORT RADIO™ · 24 HOURS · BRAZIL</span>
        <h2 style="margin:.25em 0 .18em;font-size:clamp(3rem,9vw,7rem);line-height:.86">BR<br>Tunnel™</h2>
        <p style="max-width:720px">Rock brasileiro dos 80s, 90s e 2000 em sinal contínuo, com clássicos, raridades e versões ao vivo.</p>
        <div style="margin-top:24px;border:1px solid #d8d8d8;background:#fff;padding:20px;max-width:760px">
          <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap">
            <button type="button" id="brPlay" aria-label="Tocar BR Tunnel" style="width:58px;height:58px;border-radius:50%;border:0;background:#e10600;color:#fff;font-size:1.25rem;cursor:pointer">▶</button>
            <div style="min-width:220px;flex:1">
              <small style="display:block;font-weight:800;letter-spacing:.12em;text-transform:uppercase">BR Tunnel™ · 24H</small>
              <strong id="brStatus" style="display:block;margin-top:5px;font-size:1.1rem">Pronto para tocar</strong>
              <span style="display:block;margin-top:3px;color:#666;font-size:.82rem">Rock Brasil · 80s · 90s · 2000</span>
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
  const rowState = hub?.querySelector('[data-tunnel-target="passportBRv2"] .tunnel-directory__state') || null;

  if (!audio || !play || !status) return;

  // --- INSTRUMENTAÇÃO FORENSE BR-AUDIO (TEMPORÁRIO) ---
  const brAudio = document.getElementById("brAudio");

  if (brAudio) {
    const logPrefix = "[BR-AUDIO FORENSIC]";
    const netState = { 0: "NETWORK_EMPTY", 1: "NETWORK_IDLE", 2: "NETWORK_LOADING", 3: "NETWORK_NO_SOURCE" };
    const readyState = { 0: "HAVE_NOTHING", 1: "HAVE_METADATA", 2: "HAVE_CURRENT_DATA", 3: "HAVE_FUTURE_DATA", 4: "HAVE_ENOUGH_DATA" };
    const errCodes = { 1: "MEDIA_ERR_ABORTED", 2: "MEDIA_ERR_NETWORK", 3: "MEDIA_ERR_DECODE", 4: "MEDIA_ERR_SRC_NOT_SUPPORTED" };

    const events = [
      "loadstart", "loadedmetadata", "loadeddata", "canplay", "canplaythrough",
      "play", "playing", "waiting", "stalled", "suspend", "abort", "emptied"
    ];

    events.forEach(evt => {
      brAudio.addEventListener(evt, () => {
        console.log(`${logPrefix} EVENT: ${evt} | readyState: ${readyState[brAudio.readyState]} | networkState: ${netState[brAudio.networkState]} | src: ${brAudio.currentSrc}`);
      });
    });

    brAudio.addEventListener("error", () => {
      const err = brAudio.error;
      console.error(`${logPrefix} 🔥 MEDIA ERROR DETECTED 🔥`);
      console.error(`Code: ${err?.code} (${errCodes[err?.code] || "UNKNOWN"})`);
      console.error(`Message: ${err?.message || "No message"}`);
      console.error(`networkState: ${netState[brAudio.networkState]} | readyState: ${readyState[brAudio.readyState]}`);
      console.error(`currentSrc: ${brAudio.currentSrc}`);
    });

    console.log(`${logPrefix} Instrumentation armed. Target src: ${brAudio.src || brAudio.currentSrc}`);
  }
  // --- FIM DA INSTRUMENTAÇÃO ---

  audio.addEventListener("playing", () => {
    play.textContent = "Ⅱ";
    play.setAttribute("aria-label", "Pausar BR Tunnel");
    status.textContent = "ON AIR · ROCK BRASILEIRO";
    if (rowState) rowState.textContent = "ON AIR";
  });

  audio.addEventListener("pause", () => {
    play.textContent = "▶";
    play.setAttribute("aria-label", "Tocar BR Tunnel");
    if (status.textContent.startsWith("ON AIR")) status.textContent = "Pausado";
    if (rowState) rowState.textContent = "24 HOURS";
  });

  audio.addEventListener("error", () => {
    play.textContent = "▶";
    play.setAttribute("aria-label", "Tocar BR Tunnel");
    status.textContent = "Sinal indisponível agora · tente novamente";
    if (rowState) rowState.textContent = "SIGNAL UNAVAILABLE";
    audio.removeAttribute("src");
    try { audio.load(); } catch (_) {}
  });

  audio.addEventListener("waiting", () => {
    status.textContent = "Conectando…";
  });

  play.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!audio.paused) {
      audio.pause();
      return;
    }

    document.querySelectorAll("audio, video").forEach(media => {
      if (media !== audio && !media.paused) {
        try { media.pause(); } catch (_) {}
      }
    });

    status.textContent = "Conectando…";

    try {
      if (audio.src !== STREAM) audio.src = STREAM;
      await audio.play();
    } catch (error) {
      console.warn("[Passport BR Tunnel] stream unavailable", error);
      status.textContent = "Sinal indisponível agora · tente novamente";
      play.textContent = "▶";
      play.setAttribute("aria-label", "Tocar BR Tunnel");
      if (rowState) rowState.textContent = "24 HOURS";
      audio.removeAttribute("src");
      try { audio.load(); } catch (_) {}
    }
  });
})();
