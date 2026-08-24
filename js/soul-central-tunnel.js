/* RETIRED: Soul Central tunnel.
   Compatibility shim for stale radio.html versions.
   Removes any old Soul Central UI and loads the new isolated Total Soul tunnel.
*/
(() => {
  "use strict";
  const stale = document.getElementById("passportSoul");
  if (stale) {
    stale.querySelectorAll("audio").forEach(a => { try { a.pause(); a.removeAttribute("src"); a.load(); } catch (_) {} });
    stale.querySelectorAll("iframe").forEach(f => { try { f.src = "about:blank"; } catch (_) {} });
    stale.remove();
  }
  document.querySelectorAll("style[data-passport-soul-style]").forEach(el => el.remove());
  if (!document.body || !document.body.classList.contains("live-page")) return;
  if (!document.getElementById("passport80s")) return;
  if (document.querySelector('script[data-passport-total-soul]')) return;
  const s = document.createElement("script");
  s.src = "/js/total-soul-tunnel.js?v=202608232322";
  s.dataset.passportTotalSoul = "1";
  document.head.appendChild(s);
})();
