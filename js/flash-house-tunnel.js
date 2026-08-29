/* PASSPORT RADIO · FLASH HOUSE TUNNEL™
   Main terrestrial FM programming: TOPradio Belgium.
*/
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
  panel.innerHTML = `
    <div class="live-shell eighties-layout">
      <div class="passport80s-section__head">
        <span class="live-kicker">PASSPORT RADIO™ · 24 HOURS · FM SIGNAL</span>
        <h2>Flash House<br>Tunnel™</h2>
        <p>Dancefloor 80s/90s · house · Eurodance · Italo · Hi-NRG · freestyle.</p>
        <span class="handwritten">the dancefloor never clocks out.</span>
      </div>
      <div class="live-now">
        <small>Sinal principal · Bélgica</small>
        <h2>TOPradio</h2>
        <p>FM · dance &amp; house · programação principal</p>
        <div class="audio-player">
          <audio id="passportFlashHouseAudio" preload="none" controls src="https://playerservices.streamtheworld.com/api/livestream-redirect/TOP_RADIO.mp3"></audio>
        </div>
      </div>
    </div>`;
  stage.appendChild(panel);
})();
