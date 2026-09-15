/* PASSPORT RADIO · WORLD DISCO DEUTSCHLAND™ */
(() => {
  "use strict";
  if (!document.body.classList.contains("live-page")) return;
  if (document.getElementById("passportWorldDiscoDeutschland")) return;
  const stage = document.querySelector(".tunnel-stage-shell");
  if (!stage) return;

  const panel = document.createElement("section");
  panel.id = "passportWorldDiscoDeutschland";
  panel.className = "passport80s-section";
  panel.dataset.passportTunnelPanel = "1";
  panel.hidden = true;
  panel.innerHTML = `
    <div class="live-shell eighties-layout">
      <div class="passport80s-section__head">
        <span class="live-kicker">PASSPORT RADIO™ · 24 HOURS · WORLD DISCO DEUTSCHLAND™</span>
        <h2>WORLD DISCO<br>DEUTSCHLAND™</h2>
        <p>Disco · 70s · 80s · Funk · Soul · Pop.</p>
      </div>
      <div class="live-now">
        <small>Passport Radio · WORLD DISCO DEUTSCHLAND™</small>
        <h2>Passport Radio</h2>
        <p>Passport Radio · Disco</p>
        <div class="audio-player">
          <audio id="passportWorldDiscoDeutschlandAudio" preload="none" controls src="https://0n-disco.radionetz.de/0n-disco.mp3"></audio>
        </div>
      </div>
    </div>`;
  stage.appendChild(panel);

  const audio = document.getElementById("passportWorldDiscoDeutschlandAudio");
  if (!audio) return;
  audio.controls = false;
  const controls = document.createElement("div");
  controls.className = "house-tools";
  const play = document.createElement("button");
  play.id = "passportWorldDiscoDeutschlandPlay";
  play.type = "button";
  play.textContent = "▶ PLAY";
  play.setAttribute("aria-label", "Reproduzir WORLD DISCO DEUTSCHLAND™");
  const status = document.createElement("span");
  status.id = "passportWorldDiscoDeutschlandStatus";
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
    play.setAttribute("aria-label", "Pausar WORLD DISCO DEUTSCHLAND™");
    status.textContent = "NO AR";
  });
  audio.addEventListener("pause", () => {
    play.textContent = "▶ PLAY";
    play.setAttribute("aria-label", "Reproduzir WORLD DISCO DEUTSCHLAND™");
    status.textContent = "PAUSADO";
  });
  audio.addEventListener("waiting", () => { status.textContent = "CONECTANDO"; });
  audio.addEventListener("error", () => { status.textContent = "SINAL INDISPONÍVEL · TENTE NOVAMENTE"; });
})();
