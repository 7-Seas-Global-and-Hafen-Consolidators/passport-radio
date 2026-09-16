/* Mount each original engine in its own document, inside the Home host. */
(() => {
  "use strict";
  const root=document.getElementById("passport-casas");
  if(!root)return;
  const grid=root.querySelector(".casas-grid");
  if(grid&&!grid.querySelector('[data-house="/radio-jovem-guarda.html"]')){
    const card=document.createElement("details");
    card.className="casa";
    card.dataset.house="/radio-jovem-guarda.html";
    card.dataset.name="Jovem Guarda™";
    card.innerHTML='<summary>Jovem Guarda™<span>Passport Radio · Jovem Guarda · ABRIR PLAYER</span></summary><div class="casa-actions"><a href="/radio-jovem-guarda.html" target="_blank" rel="noopener">Abrir Jovem Guarda™ em outra página</a><button type="button" data-close-house>Fechar e parar</button></div><div class="casa-stage"></div>';
    grid.appendChild(card);
  }
  if(grid&&!grid.querySelector('[data-house="/radio-nostalgia-passport.html"]')){
    const card=document.createElement("details");
    card.className="casa";
    card.dataset.house="/radio-nostalgia-passport.html";
    card.dataset.name="Nostalgia Passport™";
    card.innerHTML='<summary>Nostalgia Passport™<span>Passport Radio · Nostalgia Passport · ABRIR PLAYER</span></summary><div class="casa-actions"><a href="/radio-nostalgia-passport.html" target="_blank" rel="noopener">Abrir Nostalgia Passport™ em outra página</a><button type="button" data-close-house>Fechar e parar</button></div><div class="casa-stage"></div>';
    grid.appendChild(card);
  }
  function playingLabel(txt) {
    return txt === "Ⅱ" || txt === "PAUSE" || txt === "STOP" || txt.indexOf("PAUSADO") !== -1;
  }
  function engineReady(house, win, doc, playBtn) {
    if (!playBtn || playBtn.disabled) return false;
    if (house === "radio-live-rare.html") {
      try {
        const p = win.YT && win.YT.get && win.YT.get("passport-tunnel-engine");
        if (!p || !p.getPlayerState) return false;
        return p.getPlayerState() !== -1;
      } catch (_) { return false; }
    }
    if (house === "globo-de-ouro-player.html") {
      return !playBtn.disabled;
    }
    return true;
  }
  function kickYouTube(win, ids) {
    try {
      const YT = win.YT;
      if (!YT || !YT.get) return false;
      for (let i = 0; i < ids.length; i++) {
        const p = YT.get(ids[i]);
        if (!p || !p.getPlayerState) continue;
        const s = p.getPlayerState();
        if (s === 1) return true;
        if (s === -1) continue;
        try { if (p.unMute) p.unMute(); p.playVideo(); } catch (_) {}
      }
    } catch (_) {}
    return false;
  }
  function mediaPlaying(doc, win) {
    const audio = doc.querySelector("audio");
    if (audio && audio.paused === false && audio.currentTime > 0) return true;
    try {
      if (win.PassportGloboPlayer && win.PassportGloboPlayer.state() === 1) return true;
    } catch (_) {}
    try {
      const YT = win.YT;
      if (YT && YT.get) {
        const ids = ["passport-tunnel-engine", "passportNovelasHidden", "gdoHidden"];
        for (let i = 0; i < ids.length; i++) {
          const p = YT.get(ids[i]);
          if (p && p.getPlayerState && p.getPlayerState() === 1) return true;
        }
      }
    } catch (_) {}
    return false;
  }
  function triggerAutoplay(frame) {
    try {
      const win = frame.contentWindow;
      const doc = frame.contentDocument;
      if (!win || !doc) return;
      if (win.PassportBus) {
        win.PassportBus.claim(win);
      }
      const house = frame.src.split("/").pop().split("?")[0];
      function tryPlay() {
        try {
          if (mediaPlaying(doc, win)) return true;
          if (house === "radio-world-tunnel-reggae.html") {
            const audio = doc.getElementById("passportWorldTunnelReggaeAudio");
            if (audio && audio.paused) audio.play().catch(function () {});
            return !!(audio && audio.paused === false);
          }
          if (house === "radio-world-disco-deutschland.html") {
            const audio = doc.getElementById("passportWorldDiscoDeutschlandAudio");
            if (audio && audio.paused) audio.play().catch(function () {});
            return !!(audio && audio.paused === false);
          }
          if (house === "radio-flash-house.html") {
            const audio = doc.getElementById("passportFlashHouseAudio");
            if (audio && audio.paused) audio.play().catch(function () {});
            return !!(audio && audio.paused === false);
          }
          let playBtn = null;
          if (house === "radio-continuous.html") playBtn = doc.getElementById("passport-live-play");
          else if (house === "radio-live-rare.html") playBtn = doc.getElementById("tunnelPlay");
          else if (house === "radio-80s.html") playBtn = doc.getElementById("passport80sPlay");
          else if (house === "radio-soul.html") playBtn = doc.getElementById("passportSoulPlay");
          else if (house === "radio-mpb.html") playBtn = doc.getElementById("passportMPBPlay");
          else if (house === "radio-hits.html") playBtn = doc.getElementById("passportHitsPlay");
          else if (house === "radio-rock-brasil.html") playBtn = doc.getElementById("passportBRRockPlay");
          else if (house === "radio-50s-60s.html") playBtn = doc.getElementById("passport5060Play");
          else if (house === "radio-novelas.html") playBtn = doc.getElementById("novelasPlay");
          else if (house === "globo-de-ouro-player.html") playBtn = doc.getElementById("gdoPlay");
          else if (house === "radio-mundo-player.html") playBtn = doc.getElementById("world-play");
          else if (house === "radio-jovem-guarda.html") playBtn = doc.getElementById("passportJovemGuardaPlay");
          else if (house === "radio-nostalgia-passport.html") playBtn = doc.getElementById("passportNostalgiaPlay");
          else if (house === "radio-catalunya.html") playBtn = doc.getElementById("passportCatalunyaPlay");
          if (!playBtn) return false;
          const txt = playBtn.textContent.trim();
          if (playingLabel(txt)) return true;
          if (kickYouTube(win, ["passport-tunnel-engine", "passportNovelasHidden", "gdoHidden"])) return true;
          if (!engineReady(house, win, doc, playBtn)) return false;
          if (playBtn.getAttribute("data-pp-armed") !== "1") {
            playBtn.setAttribute("data-pp-armed", "1");
            playBtn.click();
          }
          kickYouTube(win, ["passport-tunnel-engine", "passportNovelasHidden", "gdoHidden"]);
          return false;
        } catch (_) {
          return false;
        }
      }
      if (!tryPlay()) {
        let attempts = 0;
        const interval = setInterval(() => {
          attempts++;
          if (!frame.isConnected || tryPlay() || attempts > 150) {
            clearInterval(interval);
          }
        }, 100);
      }
    } catch (_) {}
  }
  function hostBox() {
    return document.getElementById("passport-casa-host");
  }
  function hostStage() {
    const box = hostBox();
    return box ? box.querySelector(".casa-host-stage") : null;
  }
  function houseFrames() {
    return document.querySelectorAll("#passport-casa-host iframe, #passport-casas .casa-stage iframe");
  }
  function variantFor(src) {
    if ((src || "").indexOf("radio-mundo-player") !== -1) return "host--world";
    if (/live-rare|novelas|globo-de-ouro/.test(src || "")) return "host--media";
    return "host--simple";
  }
  function teardownFrame() {
    houseFrames().forEach(frame => {
      try {
        frame.contentWindow.PassportBus?.silence();
        window.PassportBus.unregister(frame.contentWindow);
      } catch (_) {}
      frame.remove();
    });
  }
  function hideHost() {
    const box = hostBox();
    if (!box) return;
    box.hidden = true;
    box.classList.remove("is-active", "host--simple", "host--media", "host--world");
    box.removeAttribute("data-house");
    box.removeAttribute("data-name");
    const title = document.getElementById("passport-casa-host-title");
    if (title) title.textContent = "";
  }
  function paintHost(card) {
    const box = hostBox();
    const stage = hostStage();
    if (!box || !stage) return null;
    const src = card.dataset.house || "";
    box.classList.remove("host--simple", "host--media", "host--world");
    box.classList.add(variantFor(src), "is-active");
    box.hidden = false;
    box.dataset.house = src;
    box.dataset.name = card.dataset.name || "";
    const title = document.getElementById("passport-casa-host-title");
    if (title) title.textContent = card.dataset.name || "";
    const open = document.getElementById("passport-casa-host-open");
    if (open) open.href = src;
    return stage;
  }
  function createFrame(card) {
    const stage = paintHost(card);
    if (!stage) return;
    const frame = document.createElement("iframe");
    frame.title = (card.dataset.name || "Sinal") + " · player";
    frame.src = card.dataset.house;
    frame.allow = "autoplay; encrypted-media";
    frame.addEventListener("load", () => {
      if (!frame.isConnected) return;
      try {
        const doc = frame.contentDocument;
        if (!doc) return;
        if (!doc.getElementById("pp-home-host-frame-style")) {
          const style = doc.createElement("style");
          style.id = "pp-home-host-frame-style";
          style.textContent = "#fofonete-dock,.fofonete-dock{display:none!important}";
          doc.head.appendChild(style);
        }
        if (!frame.contentWindow.PassportBus) {
          const script = doc.createElement("script");
          script.src = "/js/passport-bus.js?v=20260910";
          script.onload = () => triggerAutoplay(frame);
          doc.head.appendChild(script);
        } else {
          triggerAutoplay(frame);
        }
      } catch (_) {}
    });
    stage.appendChild(frame);
  }
  let gate = false;
  let active = null;
  function activate(card) {
    if (active === card && hostStage() && hostStage().querySelector("iframe")) return;
    gate = true;
    root.querySelectorAll("details[data-house]").forEach(other => {
      if (other !== card && other.open) other.open = false;
    });
    gate = false;
    teardownFrame();
    active = card;
    gate = true;
    if (!card.open) card.open = true;
    gate = false;
    createFrame(card);
  }
  function deactivate() {
    teardownFrame();
    const card = active;
    active = null;
    gate = true;
    if (card && card.open) card.open = false;
    gate = false;
    hideHost();
  }
  root.querySelectorAll("details[data-house]").forEach(card => {
    card.addEventListener("toggle", () => {
      if (gate) return;
      if (card.open) activate(card);
      else if (active === card) deactivate();
    });
    const closeBtn = card.querySelector("[data-close-house]");
    if (closeBtn) closeBtn.addEventListener("click", () => {
      deactivate();
      const summary = card.querySelector("summary");
      if (summary) summary.focus();
    });
  });
  const hostClose = document.getElementById("passport-casa-host-close");
  if (hostClose) hostClose.addEventListener("click", () => {
    const card = active;
    deactivate();
    const summary = card && card.querySelector("summary");
    if (summary) summary.focus();
  });
})();
