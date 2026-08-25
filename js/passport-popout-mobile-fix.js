/* PASSPORT RADIO · POPOUT MOBILE LINK FIX
   Replaces the JS popup launcher with a real named-target link.
   Keeps the existing popout player, bridge and all audio engines untouched.
*/
(() => {
  "use strict";
  if (!document.body.classList.contains("live-page")) return;

  const wrap = document.querySelector("[data-passport-popout-pilot]");
  if (!wrap) return;

  const oldButton = wrap.querySelector(".tunnel-popout-pilot__button");
  if (!oldButton || oldButton.tagName === "A") return;

  const link = document.createElement("a");
  link.className = oldButton.className;
  link.href = "/passport-player.html?channel=5060";
  link.target = "passportPlayer";
  link.textContent = oldButton.textContent || "Ouvir 50s & 60s em janela separada ↗";
  link.setAttribute("aria-label", "Abrir 50s e 60s Tunnel em player separado");

  link.addEventListener("click", () => {
    if (window.PassportRadioBridge && typeof window.PassportRadioBridge.pauseLocal === "function") {
      window.PassportRadioBridge.pauseLocal();
    } else {
      document.querySelectorAll("audio").forEach(audio => {
        if (!audio.paused) {
          try { audio.pause(); } catch (_) {}
        }
      });
    }
    /* No preventDefault: the real link navigation must remain a direct user action. */
  });

  oldButton.replaceWith(link);
})();
