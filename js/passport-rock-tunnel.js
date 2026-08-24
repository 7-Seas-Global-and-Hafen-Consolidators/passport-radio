/* PASSPORT RADIO · RETIRED ROCK TUNNEL CLEANUP
   Safety tombstone: if an older cached radio.html still loads this file,
   remove only the retired Rock Tunnel. Do not touch Live & Rare,
   Passport 80s, or any protected 24h player.
*/
(() => {
  "use strict";

  const audio = document.getElementById("passportRockAudio");
  if (audio) {
    try { audio.pause(); } catch (_) {}
    try { audio.removeAttribute("src"); audio.load(); } catch (_) {}
  }

  const rockSection = document.getElementById("passportRock");
  if (rockSection) rockSection.remove();

  document.querySelectorAll('a[href="#passportRock"]').forEach(link => link.remove());
})();
