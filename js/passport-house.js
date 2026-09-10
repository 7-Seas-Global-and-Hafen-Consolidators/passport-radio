/* Show the actual controls of exactly one unchanged engine per house. */
(() => {
  "use strict";
  function boot() {
    const signal = document.body.dataset.signal;
    const selectors = {
      mpb: "[data-passport-mpb-engine]",
      brrock: "[data-passport-brrock-engine]",
      "5060": "[data-passport-5060-engine]",
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
