/* Show the actual controls of exactly one unchanged engine per house. */
(() => {
  "use strict";
  function boot() {
    const signal = document.body.dataset.signal;
    const selectors = {
      mpb: "[data-passport-mpb-engine]",
      brrock: "[data-passport-brrock-engine]",
      "5060": "[data-passport5060-engine]",
      hits: "#passportHits",
      flash: "#passportFlashHouse",
      novelas: "#passportNovelas"
    };
    const reveal = () => {
      const panel = selectors[signal] && document.querySelector(selectors[signal]);
      if (panel) { panel.hidden = false; panel.removeAttribute("aria-hidden"); }
    };
    reveal();
    // Novelas and Continuous build at DOMContentLoaded; observe only new child nodes.
    new MutationObserver(reveal).observe(document.body,{childList:true,subtree:true});
    // Native browser media controls can dispatch play before their click reaches
    // the page bus. Use an explicit, accessible click handler for Flash House.
    if (signal === "flash") {
      const audio = document.getElementById("passportFlashHouseAudio");
      if (audio) {
        audio.controls = false;
        const controls = document.createElement("div");
        controls.className = "house-tools";
        const play = document.createElement("button");
        play.id = "passportFlashHousePlay";
        play.type = "button";
        play.textContent = "▶ PLAY";
        play.setAttribute("aria-label", "Reproduzir Flash House™");
        const status = document.createElement("span");
        status.id = "passportFlashHouseStatus";
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
          play.setAttribute("aria-label", "Pausar Flash House™");
          status.textContent = "NO AR";
        });
        audio.addEventListener("pause", () => {
          play.textContent = "▶ PLAY";
          play.setAttribute("aria-label", "Reproduzir Flash House™");
          status.textContent = "PAUSADO";
        });
        audio.addEventListener("waiting", () => { status.textContent = "CONECTANDO"; });
        audio.addEventListener("error", () => { status.textContent = "SINAL INDISPONÍVEL · TENTE NOVAMENTE"; });
      }
    }
    const volume = document.getElementById("houseVolume");
    if (volume) volume.addEventListener("input", () => {
      document.querySelectorAll("audio").forEach(audio => { audio.volume = Number(volume.value); });
    });
    const stop = document.getElementById("houseStop");
    if (stop) stop.addEventListener("click", () => window.PassportBus.silence());
    // Named controls for the small hidden engines, now exposed in their own house.
    const labels = {mpb:"MPB™",brrock:"Rock Brasil™","5060":"50s & 60s™"};
    if (labels[signal]) {
      const button = document.querySelector(selectors[signal]+" button");
      if (button) button.setAttribute("aria-label", "Reproduzir ou pausar "+labels[signal]);
    }
    const report = () => {
      if (parent !== window) parent.postMessage({
        type:"passport-house-height",height:document.documentElement.scrollHeight
      },location.origin);
    };
    if (window.ResizeObserver) new ResizeObserver(report).observe(document.body);
    report();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded",boot,{once:true});
  else boot();
})();
