/* PASSPORT RADIO · PLAYER V2 LAUNCHER
   Not wired globally yet.
   Safe launcher for future buttons/links using data-passport-player="channel".
*/
(() => {
  "use strict";

  const WINDOW_NAME = "passportPlayerV2";
  const CONTROL_CHANNEL = "passport-player-v2-control";
  const HEARTBEAT_KEY = "passport-player-v2-heartbeat";
  const HEARTBEAT_TTL = 3500;

  function normalize(channel){
    return String(channel || "5060").trim().toLowerCase();
  }

  function playerUrl(channel){
    return `/passport-player-v2.html?channel=${encodeURIComponent(normalize(channel))}`;
  }

  function readHeartbeat(){
    try {
      const raw = localStorage.getItem(HEARTBEAT_KEY);
      const beat = raw ? JSON.parse(raw) : null;
      if (!beat || !Number.isFinite(Number(beat.at))) return null;
      if (Date.now() - Number(beat.at) > HEARTBEAT_TTL) return null;
      return beat;
    } catch (_) {
      return null;
    }
  }

  function sendSelect(channel){
    try {
      if (!("BroadcastChannel" in window)) return false;
      const bus = new BroadcastChannel(CONTROL_CHANNEL);
      bus.postMessage({ type:"SELECT", channel:normalize(channel), at:Date.now() });
      setTimeout(() => { try { bus.close(); } catch (_) {} }, 250);
      return true;
    } catch (_) {
      return false;
    }
  }

  function open(channel){
    const key = normalize(channel);
    const heartbeat = readHeartbeat();

    if (heartbeat) {
      sendSelect(key);
      try {
        const existing = window.open("", WINDOW_NAME);
        if (existing) {
          existing.focus();
          return existing;
        }
      } catch (_) {}
    }

    const features = [
      "popup=yes",
      "width=1040",
      "height=760",
      "resizable=yes",
      "scrollbars=yes",
      "noopener=no"
    ].join(",");

    const player = window.open(playerUrl(key), WINDOW_NAME, features);
    if (player) {
      try { player.focus(); } catch (_) {}
      return player;
    }

    /* Popup blocked: direct same-tab fallback is intentionally NOT forced.
       Caller can keep a normal href to preserve user agency and mobile reliability. */
    return null;
  }

  document.addEventListener("click", event => {
    const trigger = event.target && event.target.closest && event.target.closest("[data-passport-player]");
    if (!trigger) return;

    const channel = trigger.getAttribute("data-passport-player") || "5060";
    const opened = open(channel);
    if (opened) event.preventDefault();
  });

  window.PassportPlayerV2 = Object.freeze({ open, playerUrl });
})();
