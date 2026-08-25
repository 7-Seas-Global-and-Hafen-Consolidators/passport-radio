/* PASSPORT RADIO · WINDOW BRIDGE
   Cross-window interlock only. Does not replace or alter any player engine.
*/
(() => {
  "use strict";

  const CHANNEL_NAME = "passport-radio-playback-v1";
  const instanceId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  let channel = null;

  try {
    if ("BroadcastChannel" in window) channel = new BroadcastChannel(CHANNEL_NAME);
  } catch (_) {}

  function pauseLocal(){
    document.querySelectorAll("audio").forEach(audio => {
      if (!audio.paused) {
        try { audio.pause(); } catch (_) {}
      }
    });

    const yt = document.getElementById("tunnelPlay");
    if (yt && (yt.textContent || "").trim() === "Ⅱ") {
      try { yt.click(); } catch (_) {}
    }
  }

  function broadcastPlay(kind = "audio"){
    if (!channel) return;
    try {
      channel.postMessage({ type:"PLAY", source:instanceId, kind, at:Date.now() });
    } catch (_) {}
  }

  if (channel) {
    channel.addEventListener("message", event => {
      const data = event.data || {};
      if (data.type !== "PLAY" || data.source === instanceId) return;
      pauseLocal();
    });
  }

  document.addEventListener("play", event => {
    if (event.target instanceof HTMLMediaElement) broadcastPlay("audio");
  }, true);

  document.addEventListener("click", event => {
    const control = event.target && event.target.closest && event.target.closest("#tunnelPlay,#tunnelPrev,#tunnelNext,#tunnelPrevPlaylist,#tunnelNextPlaylist,#tunnelPlaylistPrev,#tunnelPlaylistNext");
    if (!control) return;

    if (control.id === "tunnelPlay") {
      const isCurrentlyPlaying = (control.textContent || "").trim() === "Ⅱ";
      if (!isCurrentlyPlaying) broadcastPlay("live-rare");
      return;
    }

    broadcastPlay("live-rare");
  }, true);

  window.PassportRadioBridge = Object.freeze({ pauseLocal, broadcastPlay });
})();
