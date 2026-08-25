/* PASSPORT RADIO · PLAYER V2 WIRING LAYER
   ---------------------------------------------------------
   Safe integration layer only.
   Existing engines, streams, interlocks and inline players remain untouched.
   Directory rows are converted to real named-target links for reliability.
*/
(() => {
  "use strict";

  if (!document.body.classList.contains("live-page")) return;

  const MAP = {
    passport80s: "80s",
    passportSoul: "soul",
    passportMPB: "mpb",
    passportHits: "hits",
    passport5060: "5060"
  };

  const playerUrl = channel => `/passport-player-v2.html?channel=${encodeURIComponent(channel)}`;

  function pauseLocal(){
    if (window.PassportRadioBridge && typeof window.PassportRadioBridge.pauseLocal === "function") {
      try { window.PassportRadioBridge.pauseLocal(); return; } catch (_) {}
    }

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

  function makeLinkFromRow(row){
    if (!row || row.dataset.passportPlayerWired === "1") return row;

    const channel = MAP[row.dataset.tunnelTarget];
    if (!channel) return row;

    const link = document.createElement("a");
    [...row.attributes].forEach(attr => {
      if (["type","aria-controls","aria-expanded"].includes(attr.name)) return;
      link.setAttribute(attr.name, attr.value);
    });

    link.className = row.className;
    link.href = playerUrl(channel);
    link.target = "passportPlayerV2";
    link.rel = "noopener";
    link.dataset.passportPlayer = channel;
    link.dataset.passportPlayerWired = "1";
    link.setAttribute("aria-label", `Abrir ${row.querySelector(".tunnel-directory__title")?.textContent?.trim() || "sinal Passport"} em player separado`);
    link.innerHTML = row.innerHTML;

    const action = link.querySelector(".tunnel-directory__action");
    if (action) action.textContent = "Abrir player ↗";

    link.addEventListener("click", () => {
      pauseLocal();
    }, { capture:true });

    row.replaceWith(link);
    return link;
  }

  function wireDirectory(){
    document.querySelectorAll("#passportTunnels [data-tunnel-target]").forEach(makeLinkFromRow);

    /* Old 50s/60s pilot CTA becomes redundant once every row opens the V2. */
    document.querySelectorAll("[data-passport-popout-pilot]").forEach(node => node.remove());
  }

  function createStandaloneCta(host, channel, label){
    if (!host || host.querySelector(`[data-passport-player-cta="${channel}"]`)) return;

    const link = document.createElement("a");
    link.href = playerUrl(channel);
    link.target = "passportPlayerV2";
    link.rel = "noopener";
    link.dataset.passportPlayer = channel;
    link.dataset.passportPlayerCta = channel;
    link.className = "passport-player-v2-standalone-cta";
    link.textContent = label;
    link.addEventListener("click", pauseLocal, { capture:true });
    host.appendChild(link);
  }

  function installSupplementalCtas(){
    const liveHost = document.querySelector(".live-deck-section .live-shell");
    createStandaloneCta(liveHost, "live-rare", "ABRIR LIVE & RARE™ NO PLAYER SEPARADO ↗");

    const continuousHost = document.querySelector(".continuous-signals .live-shell");
    createStandaloneCta(continuousHost, "continuous", "ABRIR CONTINUOUS SIGNALS™ NO PLAYER SEPARADO ↗");
  }

  function installStyle(){
    if (document.querySelector("style[data-passport-player-v2-wire-style]")) return;

    const style = document.createElement("style");
    style.dataset.passportPlayerV2WireStyle = "1";
    style.textContent = `
      #passportTunnels a.tunnel-directory__row{color:inherit;text-decoration:none}
      #passportTunnels a.tunnel-directory__row:focus-visible{outline:2px solid #d71920;outline-offset:4px}
      #passportTunnels a.tunnel-directory__row .tunnel-directory__action{color:#111}
      #passportTunnels a.tunnel-directory__row:hover .tunnel-directory__action{color:#d71920}
      .passport-player-v2-standalone-cta{display:inline-flex;align-items:center;justify-content:center;min-height:42px;margin-top:18px;padding:0 16px;border:1px solid #111;background:#111;color:#fff!important;text-decoration:none!important;font:900 .56rem Inter,Arial,sans-serif;letter-spacing:.10em;text-transform:uppercase;transition:background .16s ease,color .16s ease,border-color .16s ease}
      .passport-player-v2-standalone-cta:hover,.passport-player-v2-standalone-cta:focus-visible{background:#d71920;border-color:#d71920;color:#fff!important;outline:none}
      @media(max-width:640px){.passport-player-v2-standalone-cta{width:100%;font-size:.52rem}}
    `;
    document.head.appendChild(style);
  }

  function boot(){
    installStyle();
    wireDirectory();
    installSupplementalCtas();

    const hub = document.getElementById("passportTunnels");
    if (!hub) return;

    const observer = new MutationObserver(() => wireDirectory());
    observer.observe(hub, { childList:true, subtree:true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once:true });
  } else {
    boot();
  }
})();
