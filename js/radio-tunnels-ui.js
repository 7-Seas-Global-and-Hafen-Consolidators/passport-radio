/* PASSPORT RADIO · TUNNELS UI
   Presentation/orchestration only. Does not replace any player engine.
   One tunnel panel is visible at a time; known audio elements are mutually exclusive.
*/
(() => {
  "use strict";
  if (!document.body.classList.contains("live-page")) return;

  const hub = document.getElementById("passportTunnels");
  if (!hub) return;

  const panelIds = ["passport80s", "passportSoul", "passportMPB", "passportHits", "passport5060"];
  let activeId = "";
  let applying = false;

  function ensureHitsDirectory(){
    const directory = hub.querySelector(".tunnel-directory");
    if (!directory || directory.querySelector('[data-tunnel-target="passportHits"]')) return;

    const button = document.createElement("button");
    button.className = "tunnel-directory__row";
    button.type = "button";
    button.dataset.tunnelTarget = "passportHits";
    button.setAttribute("aria-controls", "passportHits");
    button.setAttribute("aria-expanded", "false");
    button.innerHTML = `
      <span class="tunnel-directory__number">04</span>
      <strong class="tunnel-directory__title">Passport Hits Tunnel™</strong>
      <span class="tunnel-directory__format">Pop · Top 40</span>
      <span class="tunnel-directory__state">24 HOURS</span>
      <span class="tunnel-directory__action">Abrir player</span>`;
    directory.appendChild(button);

    const intro = hub.querySelector(".tunnels-intro p");
    if (intro && /^Três ambientes musicais contínuos/.test((intro.textContent || "").trim())) {
      intro.textContent = "Quatro ambientes musicais contínuos, organizados sem transformar a página numa parede de players. Abra um por vez; a engenharia dos canais permanece independente.";
    }
  }

  function ensure5060Directory(){
    const directory = hub.querySelector(".tunnel-directory");
    if (!directory || directory.querySelector('[data-tunnel-target="passport5060"]')) return;

    const button = document.createElement("button");
    button.className = "tunnel-directory__row";
    button.type = "button";
    button.dataset.tunnelTarget = "passport5060";
    button.setAttribute("aria-controls", "passport5060");
    button.setAttribute("aria-expanded", "false");
    button.innerHTML = `
      <span class="tunnel-directory__number">05</span>
      <strong class="tunnel-directory__title">50s &amp; 60s Tunnel™</strong>
      <span class="tunnel-directory__format">Rock ’n’ Roll · Golden Era</span>
      <span class="tunnel-directory__state">24 HOURS</span>
      <span class="tunnel-directory__action">Abrir player</span>`;
    directory.appendChild(button);

    const intro = hub.querySelector(".tunnels-intro p");
    if (intro && /^(Quatro|Três) ambientes musicais contínuos/.test((intro.textContent || "").trim())) {
      intro.textContent = "Cinco ambientes musicais contínuos, organizados sem transformar a página numa parede de players. Abra um por vez; a engenharia dos canais permanece independente.";
    }
  }

  function loadHitsTunnel(){
    if (document.querySelector('script[data-passport-hits-tunnel]')) return;
    const s = document.createElement("script");
    s.src = "/js/passport-hits-tunnel.js?v=202608242208";
    s.dataset.passportHitsTunnel = "1";
    document.head.appendChild(s);
  }

  function load5060Tunnel(){
    if (document.querySelector('script[data-passport-5060-tunnel]')) return;
    const s = document.createElement("script");
    s.src = "/js/50s-60s-tunnel.js?v=202608242230";
    s.dataset.passport5060Tunnel = "1";
    document.head.appendChild(s);
  }

  function getPanels(){
    return panelIds.map(id => document.getElementById(id)).filter(Boolean);
  }

  function buttonFor(id){
    return hub.querySelector(`[data-tunnel-target="${id}"]`);
  }

  function pausePanel(panel){
    if (!panel) return;
    panel.querySelectorAll("audio").forEach(a => {
      if (!a.paused) { try { a.pause(); } catch (_) {} }
    });
  }

  function setButtonState(id, text){
    const b = buttonFor(id);
    const state = b && b.querySelector(".tunnel-directory__state");
    if (state) state.textContent = text;
  }

  function normalizePanels(){
    if (applying) return;
    applying = true;
    try {
      getPanels().forEach(panel => {
        panel.dataset.passportTunnelPanel = "1";
        const isActive = panel.id === activeId;
        panel.hidden = !isActive;
        panel.setAttribute("aria-hidden", isActive ? "false" : "true");
        const b = buttonFor(panel.id);
        if (b) {
          b.classList.toggle("is-active", isActive);
          b.setAttribute("aria-expanded", isActive ? "true" : "false");
        }
      });
    } finally {
      applying = false;
    }
  }

  function activate(id, options = {}){
    const panel = document.getElementById(id);
    if (!panel) return false;

    if (activeId && activeId !== id) pausePanel(document.getElementById(activeId));
    activeId = id;
    normalizePanels();

    if (options.scroll) {
      requestAnimationFrame(() => panel.scrollIntoView({ behavior:"smooth", block:"nearest" }));
    }
    return true;
  }

  function collapse(id){
    if (activeId !== id) return;
    pausePanel(document.getElementById(id));
    activeId = "";
    normalizePanels();
  }

  ensureHitsDirectory();
  ensure5060Directory();

  hub.querySelectorAll("[data-tunnel-target]").forEach(button => {
    button.addEventListener("click", () => {
      const id = button.dataset.tunnelTarget;
      if (activeId === id) collapse(id);
      else activate(id, { scroll:true });
    });
  });

  /* Keep every HTML audio engine mutually exclusive without changing the engines themselves. */
  document.addEventListener("play", event => {
    const target = event.target;
    if (!(target instanceof HTMLMediaElement)) return;

    document.querySelectorAll("audio").forEach(a => {
      if (a !== target && !a.paused) { try { a.pause(); } catch (_) {} }
    });

    const panel = target.closest("[data-passport-tunnel-panel]") || target.closest("#passport80s,#passportSoul,#passportMPB,#passportHits,#passport5060");
    if (panel && panelIds.includes(panel.id)) {
      activeId = panel.id;
      normalizePanels();
      panelIds.forEach(id => setButtonState(id, id === panel.id ? "ON AIR" : "24 HOURS"));
    }

    /* Live & Rare uses the YouTube iframe engine, so radio audio also asks it to pause. */
    if (target.id !== "passportAudio") {
      const yt = document.getElementById("tunnelPlay");
      if (yt && (yt.textContent || "").trim() === "Ⅱ") {
        try { yt.click(); } catch (_) {}
      }
    }
  }, true);

  document.addEventListener("pause", event => {
    const target = event.target;
    if (!(target instanceof HTMLMediaElement)) return;
    const panel = target.closest("#passport80s,#passportSoul,#passportMPB,#passportHits,#passport5060");
    if (panel && panelIds.includes(panel.id)) {
      requestAnimationFrame(() => {
        if (target.paused) setButtonState(panel.id, "24 HOURS");
      });
    }
  }, true);

  /* Starting the YouTube archive pauses all HTML radio signals first. */
  const bindTunnelControls = () => {
    ["tunnelPlay","tunnelPrev","tunnelNext","tunnelPrevPlaylist","tunnelNextPlaylist","tunnelPlaylistPrev","tunnelPlaylistNext"].forEach(id => {
      const b = document.getElementById(id);
      if (!b || b.dataset.passportExclusiveBound) return;
      b.dataset.passportExclusiveBound = "1";
      b.addEventListener("click", () => {
        document.querySelectorAll("audio").forEach(a => {
          if (!a.paused) { try { a.pause(); } catch (_) {} }
        });
      }, { capture:true });
    });
  };

  const observer = new MutationObserver(() => {
    normalizePanels();
    bindTunnelControls();
  });
  observer.observe(document.body, { childList:true, subtree:true });

  normalizePanels();
  bindTunnelControls();
  loadHitsTunnel();
  load5060Tunnel();

  /* Deep links can open a tunnel, but the normal page starts compact. */
  const hash = location.hash.replace("#", "");
  if (panelIds.includes(hash)) {
    const openFromHash = () => activate(hash, { scroll:false });
    if (!openFromHash()) setTimeout(openFromHash, 900);
  }
})();
