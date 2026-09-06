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

  const STREAM = "https://14923.live.streamtheworld.com/CIDADEROCKBRASILAAC";
  const ID = "passportBRv2";

  // Remove any stale BR DOM left by older implementations
  hub.querySelectorAll("#passportBR, #passportBRv2").forEach(el => el.remove());

  // Create the panel (visibility managed by orchestrator)
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

  audio.addEventListener("playing", () => {
    play.textContent = "Ⅱ";
    play.setAttribute("aria-label", "Pausar BR Tunnel");
    status.textContent = "ON AIR · ROCK BRASILEIRO";
    if (rowState) rowState.textContent = "ON AIR";
  });

  audio.addEventListener("pause", () => {
    play.textContent = "▶";
    play.setAttribute("aria-label", "Tocar BR Tunnel");
    if (status.textContent.startsWith("ON AIR")) {
      status.textContent = "Pausado";
    }
    if (rowState) rowState.textContent = "24 HOURS";
  });

  audio.addEventListener("error", () => {
    play.textContent = "▶";
    status.textContent = "Sinal indisponível agora · tente novamente";
    if (rowState) rowState.textContent = "SIGNAL UNAVAILABLE";
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

    if (!audio.src) {
      audio.src = STREAM;
    }

    status.textContent = "Conectando…";

    try {
      await audio.play();
    } catch (error) {
      status.textContent = "Sinal indisponível agora · tente novamente";
      play.textContent = "▶";
      play.setAttribute("aria-label", "Tocar BR Tunnel");
      if (rowState) rowState.textContent = "24 HOURS";
    }
  });
})();
