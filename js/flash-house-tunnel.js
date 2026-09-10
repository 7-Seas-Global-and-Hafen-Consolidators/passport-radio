/* PASSPORT RADIO · FLASH HOUSE TUNNEL™ · motor independente */
(() => {
  "use strict";
  if (!document.body.classList.contains("live-page")) return;
  if (document.getElementById("passportFlashHouse")) return;
  const stage = document.querySelector(".tunnel-stage-shell");
  if (!stage) return;

  const panel = document.createElement("section");
  panel.id = "passportFlashHouse";
  panel.className = "passport80s-section";
  panel.dataset.passportTunnelPanel = "1";
  panel.hidden = true;
  panel.innerHTML = `<button id="passportFlashPlay" type="button" aria-label="Reproduzir Flash House Tunnel™">▶</button><strong id="passportFlashStatus">READY</strong><audio id="passportFlashHouseAudio" preload="none" src="https://playerservices.streamtheworld.com/api/livestream-redirect/TOP_RADIO.mp3"></audio>`;
  stage.appendChild(panel);
  const audio = document.getElementById("passportFlashHouseAudio");
  const play = document.getElementById("passportFlashPlay");
  const status = document.getElementById("passportFlashStatus");
  if (!audio || !play || !status) return;
  play.addEventListener("click", async () => {
    if (!audio.paused) { audio.pause(); return; }
    try { await audio.play(); } catch (e) { status.textContent = "SINAL INDISPONÍVEL"; console.warn("[Flash House] play failed", e); }
  });
  audio.addEventListener("playing", () => { status.textContent = "ON AIR"; play.textContent = "Ⅱ"; });
  audio.addEventListener("pause", () => { status.textContent = "PAUSED"; play.textContent = "▶"; });
})();
