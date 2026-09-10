/* PASSPORT RADIO · GLOBAL AUDIO BUS · UM SOM POR VEZ */
(() => {
  "use strict";
  const custom = new Map();
  let owner = null;

  function stopCustomExcept(keep) {
    custom.forEach((stop, id) => {
      if (id === keep) return;
      try { stop(); } catch (_) {}
    });
  }

  function pauseMediaExcept(keep) {
    document.querySelectorAll("audio,video").forEach(media => {
      if (media === keep || media.paused) return;
      try { media.pause(); } catch (_) {}
    });
  }

  function claim(id, media = null) {
    owner = id || null;
    pauseMediaExcept(media);
    stopCustomExcept(id);
    document.dispatchEvent(new CustomEvent("passport-bus-claim", { detail: { owner, media } }));
  }

  function silence() {
    owner = null;
    pauseMediaExcept(null);
    stopCustomExcept(null);
    document.dispatchEvent(new CustomEvent("passport-bus-silence"));
  }

  function register(id, stop) {
    if (!id || typeof stop !== "function") return;
    custom.set(id, stop);
  }

  function release(id) {
    if (owner === id) owner = null;
  }

  document.addEventListener("play", event => {
    const active = event.target;
    if (!(active instanceof HTMLMediaElement)) return;
    claim(active.id || "html-media", active);
  }, true);

  window.PassportBus = { claim, silence, register, release, get owner() { return owner; } };
})();
