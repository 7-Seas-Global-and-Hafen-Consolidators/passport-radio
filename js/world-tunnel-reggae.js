/* PASSPORT RADIO · WORLD TUNNEL REGGAE™ */
(() => {
  "use strict";
  if (!document.body.classList.contains("live-page")) return;
  if (document.getElementById("passportWorldTunnelReggae")) return;
  const stage = document.querySelector(".tunnel-stage-shell");
  if (!stage) return;

  const panel = document.createElement("section");
  panel.id = "passportWorldTunnelReggae";
  panel.className = "passport80s-section";
  panel.dataset.passportTunnelPanel = "1";
  panel.hidden = true;
  panel.innerHTML = `
    <div class="live-shell eighties-layout">
      <div class="passport80s-section__head">
        <span class="live-kicker">PASSPORT RADIO™ · 24 HOURS · WORLD TUNNEL REGGAE™</span>
        <h2>WORLD TUNNEL<br>REGGAE™</h2>
      </div>
      <div class="live-now">
        <small>Passport Radio · WORLD TUNNEL REGGAE™</small>
        <h2>Passport Radio</h2>
        <div class="audio-player">
          <audio id="passportWorldTunnelReggaeAudio" preload="none" controls src="https://0n-reggae.radionetz.de/0n-reggae.mp3"></audio>
        </div>
      </div>
    </div>`;
  stage.appendChild(panel);

  const audio = document.getElementById("passportWorldTunnelReggaeAudio");
  if (!audio) return;
  audio.controls = false;
  const controls = document.createElement("div");
  controls.className = "house-tools";
  const play = document.createElement("button");
  play.id = "passportWorldTunnelReggaePlay";
  play.type = "button";
  play.textContent = "▶ PLAY";
  play.setAttribute("aria-label", "Reproduzir WORLD TUNNEL REGGAE™");
  const status = document.createElement("span");
  status.id = "passportWorldTunnelReggaeStatus";
  status.setAttribute("role", "status");
  status.textContent = "PRONTO";
  controls.append(play, status);
  audio.before(controls);
  audio.hidden = true;
  play.addEventListener("click", async () => {
    if (!audio.paused) { audio.pause(); return; }
    window.PassportBus.claim();
    status.textContent = "CONECTANDO";
    try { await audio.play(); }
    catch (_) { status.textContent = "SINAL INDISPONÍVEL · TENTE NOVAMENTE"; }
  });
  audio.addEventListener("playing", () => {
    play.textContent = "Ⅱ PAUSAR";
    play.setAttribute("aria-label", "Pausar WORLD TUNNEL REGGAE™");
    status.textContent = "NO AR";
  });
  audio.addEventListener("pause", () => {
    play.textContent = "▶ PLAY";
    play.setAttribute("aria-label", "Reproduzir WORLD TUNNEL REGGAE™");
    status.textContent = "PAUSADO";
  });
  audio.addEventListener("waiting", () => { status.textContent = "CONECTANDO"; });
  audio.addEventListener("error", () => { status.textContent = "SINAL INDISPONÍVEL · TENTE NOVAMENTE"; });
})();
