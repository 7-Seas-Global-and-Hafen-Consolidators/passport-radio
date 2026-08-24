/* PASSPORT RADIO · UNIVERSAL NOW PLAYING
   Presentation/proxy layer only. Existing player engines remain untouched.
*/
(() => {
  "use strict";
  if (!document.body.classList.contains("live-page")) return;

  const play = document.getElementById("passportNowPlay");
  const next = document.getElementById("passportNowNext");
  const title = document.getElementById("bottomTrackTitle");
  const meta = document.getElementById("bottomTrackMeta");
  if (!play || !next || !title || !meta) return;

  let active = "live";
  let rendering = false;

  const byId = id => document.getElementById(id);
  const clean = value => String(value || "").replace(/\s+/g, " ").trim();

  function tunnelKeyFromPanel(id){
    if (id === "passport80s") return "80s";
    if (id === "passportSoul") return "soul";
    if (id === "passportMPB") return "mpb";
    return "";
  }

  function audioFor(key){
    if (key === "80s") return byId("passport80sAudio");
    if (key === "soul") return byId("passportSoulAudio");
    if (key === "mpb") return byId("passportMPBAudio");
    if (key === "continuous") return byId("passport-live-audio");
    return null;
  }

  function liveIsPlaying(){
    const status = byId("tunnelStatus");
    return status && clean(status.textContent).toUpperCase() === "PLAYING";
  }

  function isPlaying(key){
    if (key === "live") return liveIsPlaying();
    const audio = audioFor(key);
    return !!(audio && !audio.paused && !audio.ended);
  }

  function active80sLabel(){
    const station = document.querySelector("#passport80sPlayer .passport80s-station.is-active");
    return station ? clean(station.textContent) : "Continuous 80s";
  }

  function continuousLabel(){
    const label = byId("passport-live-channel-name");
    return clean(label && label.textContent) || "Continuous Signal";
  }

  function copyFor(key){
    if (key === "80s") {
      return {
        title: "80s Tunnel™",
        meta: `Passport Radio™ · 24H · ${active80sLabel()}`,
        action: "PRÓXIMA"
      };
    }
    if (key === "soul") {
      return {
        title: "Soul Tunnel™",
        meta: "Passport Radio™ · 24H Soul Signal",
        action: "ABRIR"
      };
    }
    if (key === "mpb") {
      return {
        title: "MPB Tunnel™",
        meta: "Passport Radio™ · 24H Brazilian Music",
        action: "ABRIR"
      };
    }
    if (key === "continuous") {
      return {
        title: `${continuousLabel()} · 24H`,
        meta: "Passport Radio™ · Continuous Signal™",
        action: "CANAL"
      };
    }

    const liveTitle = clean(byId("tunnelConsoleTitle") && byId("tunnelConsoleTitle").textContent) || "Underground Archive";
    return {
      title: liveTitle,
      meta: "Passport Radio™ · Live & Rare™",
      action: "PRÓXIMA"
    };
  }

  function render(){
    if (rendering) return;
    rendering = true;
    try {
      const copy = copyFor(active);
      if (title.textContent !== copy.title) title.textContent = copy.title;
      if (meta.textContent !== copy.meta) meta.textContent = copy.meta;
      next.textContent = copy.action;
      play.textContent = isPlaying(active) ? "Ⅱ" : "▶";
      play.setAttribute("aria-label", isPlaying(active) ? "Pausar sinal atual" : "Reproduzir sinal atual");
      document.querySelector(".player-bar")?.setAttribute("data-now-source", active);
    } finally {
      rendering = false;
    }
  }

  function setActive(key){
    if (!key) return;
    active = key;
    render();
  }

  function openPanel(panelId){
    const panel = byId(panelId);
    const row = document.querySelector(`[data-tunnel-target="${panelId}"]`);
    if (row && (!panel || panel.hidden || row.getAttribute("aria-expanded") !== "true")) {
      row.click();
    }
    requestAnimationFrame(() => {
      const target = byId(panelId);
      if (target) target.scrollIntoView({ behavior:"smooth", block:"nearest" });
    });
  }

  function proxyPlay(){
    let control = null;
    if (active === "live") control = byId("tunnelPlay");
    if (active === "80s") control = byId("passport80sPlay");
    if (active === "soul") control = byId("passportSoulPlay");
    if (active === "mpb") control = byId("passportMPBPlay");
    if (active === "continuous") control = byId("passport-live-play");

    if (control) {
      control.click();
      setTimeout(render, 120);
      return;
    }

    if (active === "80s") openPanel("passport80s");
    if (active === "soul") openPanel("passportSoul");
    if (active === "mpb") openPanel("passportMPB");
  }

  function nextContinuousChannel(){
    const buttons = Array.from(document.querySelectorAll("#passport-live-radio [data-live-channel]"));
    if (!buttons.length) return;
    const current = buttons.findIndex(b => b.classList.contains("is-active"));
    buttons[(current + 1 + buttons.length) % buttons.length].click();
  }

  function proxyNext(){
    if (active === "live") {
      byId("tunnelNext")?.click();
      return;
    }
    if (active === "80s") {
      byId("passport80sNext")?.click();
      return;
    }
    if (active === "continuous") {
      nextContinuousChannel();
      return;
    }
    if (active === "soul") openPanel("passportSoul");
    if (active === "mpb") openPanel("passportMPB");
  }

  play.addEventListener("click", proxyPlay);
  next.addEventListener("click", proxyNext);

  document.addEventListener("play", event => {
    const target = event.target;
    if (!(target instanceof HTMLMediaElement)) return;
    if (target.id === "passport80sAudio") setActive("80s");
    else if (target.id === "passportSoulAudio") setActive("soul");
    else if (target.id === "passportMPBAudio") setActive("mpb");
    else if (target.id === "passport-live-audio") setActive("continuous");
  }, true);

  document.addEventListener("pause", event => {
    const target = event.target;
    if (!(target instanceof HTMLMediaElement)) return;
    if (target === audioFor(active)) requestAnimationFrame(render);
  }, true);

  document.addEventListener("click", event => {
    const row = event.target.closest && event.target.closest("[data-tunnel-target]");
    if (row) {
      const key = tunnelKeyFromPanel(row.dataset.tunnelTarget);
      if (key) setActive(key);
    }

    const channel = event.target.closest && event.target.closest("#passport-live-radio [data-live-channel]");
    if (channel) setActive("continuous");

    if (event.target.closest && event.target.closest("#player")) {
      const control = event.target.closest("#tunnelPlay,#tunnelPrev,#tunnelNext,#tunnelPrevPlaylist,#tunnelNextPlaylist");
      if (control) setActive("live");
    }
  }, true);

  /* The Live & Rare engine is a hidden YouTube iframe, so its PLAYING state is observed here. */
  let lastLiveState = "";
  function refresh(){
    const status = byId("tunnelStatus");
    const state = status ? clean(status.textContent).toUpperCase() : "";
    if (state === "PLAYING" && lastLiveState !== "PLAYING") setActive("live");
    lastLiveState = state;
    render();
  }

  setInterval(refresh, 700);
  render();
})();
