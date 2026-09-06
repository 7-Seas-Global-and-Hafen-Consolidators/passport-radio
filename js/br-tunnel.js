/* PASSPORT RADIO · BR TUNNEL™
   Brazilian rock continuous signal. Independent engine; participates in global audio interlock.
*/
(() => {
  "use strict";
  if (!document.body.classList.contains("live-page")) return;

  const host = document.querySelector(".tunnel-stage-shell");
  if (!host || document.getElementById("passportBR")) return;

  const SOURCES = [
    {
      label: "Rock Brasil · sinal contínuo",
      url: "https://14923.live.streamtheworld.com/CIDADEROCKBRASILAAC"
    }
  ];

  const section = document.createElement("section");
  section.id = "passportBR";
  section.className = "passport-br-section";
  section.dataset.passportTunnelPanel = "1";
  section.hidden = true;
  section.setAttribute("aria-hidden", "true");
  section.innerHTML = `
    <div class="live-shell">
      <div style="padding:34px 0 40px">
        <span class="live-kicker">PASSPORT RADIO™ · 24 HOURS · BRAZIL</span>
        <h2 style="margin:.25em 0 .18em;font-size:clamp(3rem,9vw,7rem);line-height:.86">BR<br>Tunnel™</h2>
        <p style="max-width:720px">Rock brasileiro atravessando gerações: clássicos, 80s, 90s, 2000 e novas cenas em sinal contínuo.</p>
        <div id="passportBRPlayer" style="margin-top:24px;border:1px solid #d8d8d8;background:#fff;padding:20px;max-width:760px">
          <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap">
            <button id="passportBRPlay" type="button" aria-label="Tocar BR Tunnel" style="width:58px;height:58px;border-radius:50%;border:0;background:#e10600;color:#fff;font-size:1.25rem;cursor:pointer">▶</button>
            <div style="min-width:220px;flex:1">
              <small style="display:block;font-weight:800;letter-spacing:.12em;text-transform:uppercase">BR Tunnel™ · 24H</small>
              <strong id="passportBRState" style="display:block;margin-top:5px;font-size:1.1rem">Pronto para tocar</strong>
              <span id="passportBRSource" style="display:block;margin-top:3px;color:#666;font-size:.82rem">Rock Brasil · sinal contínuo</span>
            </div>
          </div>
          <audio id="passportBRAudio" preload="none"></audio>
        </div>
        <span class="handwritten" style="display:block;margin-top:20px">do Brasil, alto e sem pedir licença.</span>
      </div>
    </div>`;
  host.appendChild(section);

  const audio = section.querySelector("#passportBRAudio");
  const play = section.querySelector("#passportBRPlay");
  const state = section.querySelector("#passportBRState");
  const source = section.querySelector("#passportBRSource");
  let sourceIndex = 0;

  function stopOthers() {
    document.querySelectorAll("audio").forEach(a => {
      if (a !== audio && !a.paused) try { a.pause(); } catch (_) {}
    });
    if (window.PassportRadioBridge && typeof window.PassportRadioBridge.pauseLocal === "function") {
      try { window.PassportRadioBridge.pauseLocal(audio); } catch (_) {}
    }
  }

  function prepare(index = 0) {
    sourceIndex = index % SOURCES.length;
    const s = SOURCES[sourceIndex];
    if (audio.src !== s.url) audio.src = s.url;
    source.textContent = s.label;
  }

  async function start() {
    stopOthers();
    prepare(sourceIndex);
    state.textContent = "Conectando…";
    try {
      await audio.play();
      play.textContent = "Ⅱ";
      play.setAttribute("aria-label", "Pausar BR Tunnel");
      state.textContent = "ON AIR · ROCK BRASILEIRO";
    } catch (_) {
      state.textContent = "Sinal indisponível agora · tente novamente";
      play.textContent = "▶";
    }
  }

  function pause() {
    try { audio.pause(); } catch (_) {}
    play.textContent = "▶";
    play.setAttribute("aria-label", "Tocar BR Tunnel");
    state.textContent = "Pausado";
  }

  play.addEventListener("click", () => audio.paused ? start() : pause());
  audio.addEventListener("playing", () => {
    play.textContent = "Ⅱ";
    state.textContent = "ON AIR · ROCK BRASILEIRO";
  });
  audio.addEventListener("pause", () => {
    play.textContent = "▶";
    if (state.textContent.startsWith("ON AIR")) state.textContent = "Pausado";
  });
  audio.addEventListener("error", () => {
    play.textContent = "▶";
    state.textContent = "Sinal indisponível agora · tente novamente";
  });

  prepare(0);
})();
