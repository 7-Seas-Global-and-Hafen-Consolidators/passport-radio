/* PASSPORT RADIO · PLAYER V2 LAUNCHER
   Mobile: mesma aba. Nunca window.open("").
*/
(() => {
  "use strict";

  const WINDOW_NAME = "passportPlayerV2";
  const CONTROL_CHANNEL = "passport-player-v2-control";

  function normalize(channel){
    return String(channel || "5060").trim().toLowerCase();
  }

  function playerUrl(channel){
    return "/passport-player-v2.html?channel=" + encodeURIComponent(normalize(channel));
  }

  function isMobile(){
    return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || "");
  }

  function sendSelect(channel){
    try {
      if (!("BroadcastChannel" in window)) return false;
      const bus = new BroadcastChannel(CONTROL_CHANNEL);
      bus.postMessage({ type:"SELECT", channel:normalize(channel), at:Date.now() });
      setTimeout(function(){ try { bus.close(); } catch (_) {} }, 250);
      return true;
    } catch (_) {
      return false;
    }
  }

  function open(channel){
    const key = normalize(channel);
    const url = playerUrl(key);
    sendSelect(key);
    if (isMobile()) {
      window.location.assign(url);
      return true;
    }
    const player = window.open(url, WINDOW_NAME, "noopener=yes,width=1040,height=760,resizable=yes,scrollbars=yes");
    if (player) {
      try { player.focus(); } catch (_) {}
      return player;
    }
    window.location.assign(url);
    return true;
  }

  document.addEventListener("click", function(event) {
    const trigger = event.target && event.target.closest && event.target.closest("[data-passport-player]");
    if (!trigger) return;
    event.preventDefault();
    open(trigger.getAttribute("data-passport-player") || "5060");
  });

  window.PassportPlayerV2 = Object.freeze({ open: open, playerUrl: playerUrl });
})();
