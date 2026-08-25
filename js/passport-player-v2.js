/* PASSPORT RADIO · STANDALONE PLAYER V2
   ---------------------------------------------------------
   Adapter layer only.
   Existing audio engines remain untouched and are mounted off-screen.
   Public UI proxies their controls and state without duplicating streams.
*/
(() => {
  "use strict";

  const CONTROL_CHANNEL = "passport-player-v2-control";
  const HEARTBEAT_KEY = "passport-player-v2-heartbeat";
  const HEARTBEAT_MS = 1200;

  const CHANNELS = {
    "live-rare": {
      no: "01",
      label: "Live & Rare™",
      short: "Underground archive",
      kicker: "PASSPORT RADIO™ · LIVE & RARE",
      title: "Live & Rare™",
      description: "Performances e gravações que merecem contexto. O arquivo underground continua dentro do motor original da Passport.",
      playId: "tunnelPlay",
      statusId: "tunnelStatus",
      nowId: "tunnelConsoleTitle",
      detailId: "tunnelConsoleMeta",
      kind: "youtube"
    },
    "5060": {
      no: "02",
      label: "50s & 60s Tunnel™",
      short: "Golden era signal",
      kicker: "PASSPORT RADIO™ · GOLDEN ERA SIGNAL",
      title: "50s & 60s Tunnel™",
      description: "Rock ’n’ roll, doo-wop, soul e pop das décadas que mudaram a música para sempre.",
      playId: "passport5060Play",
      statusId: "passport5060Status",
      audioId: "passport5060Audio",
      now: "Rock ’n’ Roll · Soul · Golden Pop",
      detail: "50s & 60s · 24 HOURS"
    },
    "80s": {
      no: "03",
      label: "80s Tunnel™",
      short: "Six continuous signals",
      kicker: "PASSPORT RADIO™ · 80s CONTINUOUS",
      title: "80s Tunnel™",
      description: "Seis sinais contínuos atravessando pop, rock, hair metal, R&B e country da década de 1980.",
      playId: "passport80sPlay",
      statusId: "passport80sStatus",
      audioId: "passport80sAudio",
      nowId: "passport80sTitle",
      detailId: "passport80sMeta"
    },
    "soul": {
      no: "04",
      label: "Soul Tunnel™",
      short: "Soul signal · UK",
      kicker: "PASSPORT RADIO™ · SOUL SIGNAL",
      title: "Soul Tunnel™",
      description: "Soul dos anos 80 até agora em um sinal contínuo com identidade visual 100% Passport.",
      playId: "passportSoulPlay",
      statusId: "passportSoulStatus",
      audioId: "passportSoulAudio",
      now: "Soul · 80s to now",
      detail: "SOUL TUNNEL™ · CONTINUOUS"
    },
    "mpb": {
      no: "05",
      label: "MPB Tunnel™",
      short: "Brazilian signal",
      kicker: "PASSPORT RADIO™ · BRAZILIAN SIGNAL",
      title: "MPB Tunnel™",
      description: "MPB, samba, soul brasileiro, bossa e novas gerações em um sinal contínuo vindo de fora do Brasil.",
      playId: "passportMPBPlay",
      statusId: "passportMPBStatus",
      audioId: "passportMPBAudio",
      now: "Brazilian Music · Continuous",
      detail: "MPB · SAMBA · SOUL · BOSSA"
    },
    "hits": {
      no: "06",
      label: "Passport Hits™",
      short: "Pop · Top 40",
      kicker: "PASSPORT RADIO™ · HITS SIGNAL",
      title: "Passport Hits Tunnel™",
      description: "Pop e Top 40 em rotação contínua dentro do player independente da Passport.",
      playId: "passportHitsPlay",
      statusId: "passportHitsStatus",
      audioId: "passportHitsAudio",
      now: "Pop · Top 40",
      detail: "PASSPORT HITS™ · 24 HOURS"
    },
    "continuous": {
      no: "07",
      label: "Continuous Signals™",
      short: "Metal · Unplugged · Live Jam",
      kicker: "PASSPORT RADIO™ · CONTINUOUS SIGNALS",
      title: "Continuous Signals™",
      description: "Metal, Unplugged e Live Jam. Três canais contínuos preservados no motor Passport Live.",
      playId: "passport-live-play",
      statusId: "passport-live-status",
      audioId: "passport-live-audio",
      nowId: "passport-live-channel-name",
      detail: "METAL · UNPLUGGED · LIVE JAM"
    }
  };

  const aliases = {
    "50s60s": "5060",
    "50s-60s": "5060",
    "50-60": "5060",
    "rare": "live-rare",
    "live": "live-rare",
    "archive": "live-rare",
    "passport-hits": "hits",
    "signals": "continuous"
  };

  const $ = id => document.getElementById(id);
  const ui = {
    channels: $("ppv2Channels"),
    kicker: $("ppv2Kicker"),
    title: $("ppv2Title"),
    description: $("ppv2Description"),
    play: $("ppv2Play"),
    glyph: $("ppv2PlayGlyph"),
    now: $("ppv2Now"),
    detail: $("ppv2Detail"),
    status: $("ppv2Status"),
    subcontrols: $("ppv2Subcontrols"),
    copy: $("ppv2Copy"),
    close: $("ppv2Close")
  };

  let activeKey = "5060";
  let heartbeatTimer = 0;
  let syncTimer = 0;
  let controlChannel = null;
  let bootFinished = false;

  function normalizeKey(value){
    const raw = String(value || "").trim().toLowerCase();
    const key = aliases[raw] || raw;
    return CHANNELS[key] ? key : "5060";
  }

  function readInitialKey(){
    const params = new URLSearchParams(location.search);
    return normalizeKey(params.get("channel") || "5060");
  }

  function script(path){
    return new Promise((resolve, reject) => {
      const existing = [...document.scripts].find(s => {
        try { return new URL(s.src, location.href).pathname === path; }
        catch (_) { return false; }
      });
      if (existing) {
        if (existing.dataset.passportLoaded === "1") resolve();
        else {
          existing.addEventListener("load", resolve, { once:true });
          existing.addEventListener("error", reject, { once:true });
        }
        return;
      }
      const el = document.createElement("script");
      el.src = `${path}?v=202608251040`;
      el.async = false;
      el.addEventListener("load", () => { el.dataset.passportLoaded = "1"; resolve(); }, { once:true });
      el.addEventListener("error", () => reject(new Error(`Falha ao carregar ${path}`)), { once:true });
      document.head.appendChild(el);
    });
  }

  function renderChannelRail(){
    ui.channels.innerHTML = Object.entries(CHANNELS).map(([key, config]) => `
      <button class="ppv2-channel${key === activeKey ? " is-active" : ""}" type="button" data-ppv2-channel="${key}">
        <span class="ppv2-channel__no">${config.no}</span>
        <span class="ppv2-channel__copy"><strong>${config.label}</strong><small>${config.short}</small></span>
        <span class="ppv2-channel__state" data-ppv2-state-for="${key}">READY</span>
      </button>`).join("");

    ui.channels.querySelectorAll("[data-ppv2-channel]").forEach(button => {
      button.addEventListener("click", () => {
        const continuePlaying = anyPlaying();
        selectChannel(button.dataset.ppv2Channel, { autoplay: continuePlaying, source:"user" });
      });
    });
  }

  function controlFor(key){
    const config = CHANNELS[key];
    return config ? $(config.playId) : null;
  }

  function audioFor(key){
    const config = CHANNELS[key];
    return config && config.audioId ? $(config.audioId) : null;
  }

  function isYouTubePlaying(){
    const button = $("tunnelPlay");
    return !!button && (button.textContent || "").trim() === "Ⅱ";
  }

  function isPlaying(key){
    if (key === "live-rare") return isYouTubePlaying();
    const audio = audioFor(key);
    return !!audio && !audio.paused;
  }

  function anyPlaying(){
    return Object.keys(CHANNELS).some(isPlaying);
  }

  function stopAllExcept(key){
    const keepAudio = audioFor(key);
    document.querySelectorAll("audio").forEach(audio => {
      if (audio === keepAudio || audio.paused) return;
      try { audio.pause(); } catch (_) {}
    });

    if (key !== "live-rare" && isYouTubePlaying()) {
      const tunnel = $("tunnelPlay");
      try { tunnel.click(); } catch (_) {}
    }
  }

  function updateUrl(key){
    try {
      const url = new URL(location.href);
      url.searchParams.set("channel", key);
      history.replaceState({ channel:key }, "", `${url.pathname}${url.search}${url.hash}`);
    } catch (_) {}
  }

  function readText(id, fallback){
    const el = id ? $(id) : null;
    const value = el ? (el.textContent || "").trim() : "";
    return value || fallback || "";
  }

  function paintActiveCopy(){
    const config = CHANNELS[activeKey];
    ui.kicker.textContent = config.kicker;
    ui.title.textContent = config.title;
    ui.description.textContent = config.description;
    ui.now.textContent = readText(config.nowId, config.now || config.label);
    ui.detail.textContent = readText(config.detailId, config.detail || config.short);
    document.title = `${config.label} · Passport Player 24H™`;
  }

  function paintRail(){
    ui.channels.querySelectorAll("[data-ppv2-channel]").forEach(button => {
      const key = button.dataset.ppv2Channel;
      button.classList.toggle("is-active", key === activeKey);
      const state = button.querySelector("[data-ppv2-state-for]");
      if (state) {
        const config = CHANNELS[key];
        state.textContent = readText(config.statusId, controlFor(key) ? "READY" : "BOOT");
      }
    });
  }

  function paintPlayback(){
    const config = CHANNELS[activeKey];
    const control = controlFor(activeKey);
    ui.play.disabled = !bootFinished || !control;
    ui.glyph.textContent = isPlaying(activeKey) ? "Ⅱ" : "▶";
    ui.status.textContent = readText(config.statusId, control ? "READY" : "BOOT");
    ui.now.textContent = readText(config.nowId, config.now || config.label);
    ui.detail.textContent = readText(config.detailId, config.detail || config.short);
    paintRail();
    refreshSubcontrols(false);
  }

  function clickInternal(id){
    const button = $(id);
    if (!button) return false;
    try { button.click(); return true; } catch (_) { return false; }
  }

  function startIfNeeded(key){
    if (isPlaying(key)) return;
    stopAllExcept(key);
    clickInternal(CHANNELS[key].playId);
  }

  function selectChannel(value, options = {}){
    const key = normalizeKey(value);
    const changed = key !== activeKey;
    activeKey = key;
    stopAllExcept(key);
    updateUrl(key);
    paintActiveCopy();
    paintRail();
    refreshSubcontrols(true);

    if (options.autoplay && controlFor(key)) {
      setTimeout(() => startIfNeeded(key), changed ? 30 : 0);
    }
  }

  function refreshSubcontrols(force){
    if (!ui.subcontrols) return;
    const signatureBefore = ui.subcontrols.dataset.signature || "";
    let signature = activeKey;
    let html = "";

    if (activeKey === "80s") {
      const buttons = [...document.querySelectorAll("#passport80sPicker .passport80s-station")];
      signature += `:${buttons.map(b => `${b.textContent}:${b.classList.contains("is-active")}`).join("|")}`;
      html = buttons.map((button, index) => `<button type="button" data-ppv2-proxy="80s:${index}" class="${button.classList.contains("is-active") ? "is-active" : ""}">${(button.textContent || "CANAL").trim()}</button>`).join("");
    } else if (activeKey === "continuous") {
      const buttons = [...document.querySelectorAll("#passport-live-radio [data-live-channel]")];
      signature += `:${buttons.map(b => `${b.dataset.liveChannel}:${b.classList.contains("is-active")}`).join("|")}`;
      html = buttons.map(button => `<button type="button" data-ppv2-proxy="live:${button.dataset.liveChannel}" class="${button.classList.contains("is-active") ? "is-active" : ""}">${(button.textContent || "CANAL").trim()}</button>`).join("");
    } else if (activeKey === "live-rare") {
      signature += ":archive";
      html = [
        ["archive:tunnelPrevPlaylist", "◀ PLAYLIST"],
        ["archive:tunnelPrev", "◀ FAIXA"],
        ["archive:tunnelNext", "PRÓXIMA FAIXA ▶"],
        ["archive:tunnelNextPlaylist", "PRÓXIMA PLAYLIST ▶"]
      ].map(([value,label]) => `<button type="button" data-ppv2-proxy="${value}">${label}</button>`).join("");
    }

    if (!force && signature === signatureBefore) return;
    ui.subcontrols.dataset.signature = signature;
    ui.subcontrols.innerHTML = html;
    ui.subcontrols.hidden = !html;

    ui.subcontrols.querySelectorAll("[data-ppv2-proxy]").forEach(button => {
      button.addEventListener("click", () => {
        const [kind, value] = button.dataset.ppv2Proxy.split(":");
        stopAllExcept(activeKey);
        if (kind === "80s") {
          const internal = document.querySelectorAll("#passport80sPicker .passport80s-station")[Number(value)];
          if (internal) internal.click();
        } else if (kind === "live") {
          const internal = document.querySelector(`#passport-live-radio [data-live-channel="${CSS.escape(value)}"]`);
          if (internal) internal.click();
        } else if (kind === "archive") {
          clickInternal(value);
        }
        setTimeout(() => refreshSubcontrols(true), 60);
      });
    });
  }

  async function copyCurrentLink(){
    const url = new URL(location.href);
    url.searchParams.set("channel", activeKey);
    const text = url.toString();
    let copied = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        copied = true;
      }
    } catch (_) {}

    if (!copied) {
      const temp = document.createElement("textarea");
      temp.value = text;
      temp.setAttribute("readonly", "");
      temp.style.position = "fixed";
      temp.style.left = "-9999px";
      document.body.appendChild(temp);
      temp.select();
      try { copied = document.execCommand("copy"); } catch (_) {}
      temp.remove();
    }

    const old = ui.copy.textContent;
    ui.copy.textContent = copied ? "LINK COPIADO" : "COPIE NA BARRA";
    setTimeout(() => { ui.copy.textContent = old; }, 1500);
  }

  function installWindowControl(){
    try {
      if ("BroadcastChannel" in window) {
        controlChannel = new BroadcastChannel(CONTROL_CHANNEL);
        controlChannel.addEventListener("message", event => {
          const data = event.data || {};
          if (data.type === "SELECT" && data.channel) {
            const continuePlaying = anyPlaying();
            selectChannel(data.channel, { autoplay:continuePlaying, source:"remote" });
            try { window.focus(); } catch (_) {}
          }
        });
      }
    } catch (_) {}

    const beat = () => {
      try {
        localStorage.setItem(HEARTBEAT_KEY, JSON.stringify({ at:Date.now(), channel:activeKey, path:location.pathname }));
      } catch (_) {}
    };
    beat();
    heartbeatTimer = setInterval(beat, HEARTBEAT_MS);
  }

  async function loadEngines(){
    ui.status.textContent = "LOADING";

    /* Live & Rare has one dependency: playlist catalog before its state machine. */
    try { await script("/js/tunnel-playlists.js"); } catch (error) { console.error(error); }

    const engines = [
      "/js/tunnel-player.js",
      "/js/181fm-tunnel.js",
      "/js/total-soul-tunnel.js",
      "/js/mpb-tunnel.js",
      "/js/passport-hits-tunnel.js",
      "/js/50s-60s-tunnel.js",
      "/js/passport-live.js"
    ];

    const results = await Promise.allSettled(engines.map(script));
    results.forEach((result, index) => {
      if (result.status === "rejected") console.error(`[Passport Player V2] motor indisponível: ${engines[index]}`, result.reason);
    });

    bootFinished = true;
    selectChannel(activeKey, { autoplay:false, source:"boot" });
    paintPlayback();
  }

  function boot(){
    activeKey = readInitialKey();
    renderChannelRail();
    paintActiveCopy();
    installWindowControl();

    ui.play.addEventListener("click", () => {
      const control = controlFor(activeKey);
      if (!control) return;
      if (!isPlaying(activeKey)) stopAllExcept(activeKey);
      clickInternal(CHANNELS[activeKey].playId);
      setTimeout(paintPlayback, 50);
    });

    ui.copy.addEventListener("click", copyCurrentLink);
    ui.close.addEventListener("click", () => window.close());

    document.addEventListener("play", event => {
      if (!(event.target instanceof HTMLMediaElement)) return;
      setTimeout(paintPlayback, 0);
    }, true);
    document.addEventListener("pause", event => {
      if (!(event.target instanceof HTMLMediaElement)) return;
      setTimeout(paintPlayback, 0);
    }, true);

    syncTimer = setInterval(paintPlayback, 450);
    loadEngines();
  }

  window.addEventListener("beforeunload", () => {
    clearInterval(heartbeatTimer);
    clearInterval(syncTimer);
    try { if (controlChannel) controlChannel.close(); } catch (_) {}
    try {
      const raw = localStorage.getItem(HEARTBEAT_KEY);
      const beat = raw ? JSON.parse(raw) : null;
      if (beat && beat.path === location.pathname) localStorage.removeItem(HEARTBEAT_KEY);
    } catch (_) {}
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once:true });
  else boot();
})();
