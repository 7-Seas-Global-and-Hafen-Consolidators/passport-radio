/* PASSPORT AUDIO BUS · same-origin houses · no streams, no autoplay. */
(() => {
  "use strict";
  if (window.PassportBus) return;
  let enabled = false;
  const children = new Set();
  let parentBus = null;
  try { if (parent !== window) parentBus = parent.PassportBus; } catch (_) {}
  function pauseMedia(keep) {
    document.querySelectorAll("audio,video").forEach(media => {
      if (media !== keep && !media.paused) try { media.pause(); } catch (_) {}
    });
  }
  function silence() {
    enabled = false;
    // Stop the existing YouTube engines through their own controls where available.
    if (window.PassportNovelasTunnel) window.PassportNovelasTunnel.stop();
    const tunnel = document.getElementById("tunnelPlay");
    if (tunnel && tunnel.textContent.trim() === "Ⅱ") tunnel.click();
    if (window.PassportGloboPlayer) window.PassportGloboPlayer.stop();
    if (window.PassportBRRockTunnel) window.PassportBRRockTunnel.stop();
    pauseMedia();
    document.querySelectorAll("iframe").forEach(frame => {
      try {
        const url = new URL(frame.src, location.href);
        if (url.hostname === "www.youtube.com" || url.hostname === "www.youtube-nocookie.com")
          frame.contentWindow.postMessage(JSON.stringify({event:"command",func:"pauseVideo",args:[]}), url.origin);
      } catch (_) {}
    });
  }
  function claim(owner = window) {
    if (parentBus) return parentBus.claim(owner);
    if (owner !== window) silence(); else enabled = true;
    children.forEach(child => {
      try {
        if (child === owner) child.PassportBus.enable();
        else child.PassportBus.silence();
      } catch (_) { children.delete(child); }
    });
  }
  const bus = {
    claim,
    enable() { enabled = true; },
    allowed() { return enabled; },
    silence,
    register(child) { children.add(child); },
    unregister(child) { children.delete(child); }
  };
  window.PassportBus = bus;
  if (parentBus) parentBus.register(window);
  // Claim only from a real user gesture, never from a retry or a synthetic click.
  document.addEventListener("click", event => {
    if (!event.isTrusted || !(event.target instanceof Element)) return;
    const scope = parentBus || document.body.classList.contains("passport-house")
      ? "button,audio,video,input,select" : "#passport-player button,#passport-player input,#passport-player audio";
    if (event.target.closest(scope)) claim();
  }, true);
  document.addEventListener("play", event => {
    if (!(event.target instanceof HTMLMediaElement)) return;
    if (!enabled) { event.target.pause(); return; }
    pauseMedia(event.target);
  }, true);
  // A late retry in an inactive house must not start sound again.
  document.addEventListener("playing", event => {
    if (event.target instanceof HTMLMediaElement && !enabled) event.target.pause();
  }, true);
  // YouTube state arrives asynchronously, outside HTMLMediaElement events.
  // Stop a late start after the listener selected another house.
  const guardYouTube = () => {
    if (enabled) return;
    const ids = ["tunnelPlay","novelasPlay","gdoPlay"];
    if (ids.some(id => {
      const button = document.getElementById(id);
      return button && /^(Ⅱ|PAUSE|❚❚)$/.test(button.textContent.trim());
    })) silence();
  };
  new MutationObserver(guardYouTube).observe(document.documentElement,{
    childList:true,subtree:true,characterData:true
  });
  window.addEventListener("pagehide", () => {
    silence();
    children.forEach(child => { try { child.PassportBus.silence(); } catch (_) {} });
    if (parentBus) parentBus.unregister(window);
  });
})();
