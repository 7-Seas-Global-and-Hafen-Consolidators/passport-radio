/* PASSPORT RADIO · AUDIO BUS · UM SOM POR PÁGINA · sem streams, sem URLs */
(() => {
  "use strict";
  function pauseOthers(active) {
    document.querySelectorAll("audio, video").forEach((media) => {
      if (media !== active && !media.paused) {
        try { media.pause(); } catch (_) {}
      }
    });
  }
  document.addEventListener("play", (event) => {
    const active = event.target;
    if (!(active instanceof HTMLMediaElement)) return;
    pauseOthers(active);
  }, true);
  window.PassportBus = {
    silence() {
      document.querySelectorAll("audio, video").forEach((media) => {
        try { media.pause(); } catch (_) {}
      });
    }
  };
  window.addEventListener("pagehide", () => { window.PassportBus.silence(); });
})();
