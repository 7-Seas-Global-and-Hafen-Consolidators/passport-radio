/* PASSPORT NOW INFO · informational layer only.
   Identifies what is actually playing and paints sticky + K-7.
   Does not own playback. Does not call play/pause/next/previous/load/src/
   claim/silence/retry/reconnect/HLS/YouTube controls. */
(() => {
  "use strict";
  if (location.pathname !== "/" && location.pathname !== "/index.html") return;
  if (window.PassportNowInfo) return;

  const STICKY_META = "24 horas";
  const STICKY_SIGNALS = [
    {key: "metal", label: "METAL", stream: "https://mediaserv68.live-streams.nl:18012/OnlyLive"},
    {key: "unplugged", label: "UNPLUGGED", stream: "https://streams.radio7.de/unplugged/mp3-192/web/"},
    {key: "livejam", label: "LIVE JAM", stream: "https://stations.radio-host.com/proxy/livejam/stream"}
  ];
  const FAKE_TITLE = /^(escolha uma r[aá]dio|selecione um territ[oó]rio|carregando acervo|underground archive|ready|loading|aguardando|pronto|paused|pausado|error|connecting|conectando|on air|no ar)$/i;
  const YT_IDS = ["passport-tunnel-engine", "passportNovelasHidden", "gdoHidden"];
  const boundDocs = new WeakSet();

  let token = 0;
  let lastHouseKey = "";
  let ticking = false;
  let state = {
    token: 0,
    source: "sticky",
    house: "",
    name: "Metal",
    title: "METAL",
    detail: STICKY_META,
    k7: "METAL · 24H",
    playing: false
  };

  function clean(v) {
    return String(v || "").replace(/\s+/g, " ").trim();
  }
  function bump() {
    token += 1;
    return token;
  }
  function text(doc, id) {
    if (!doc || !id) return "";
    const el = doc.getElementById(id);
    return clean(el && el.textContent);
  }
  function usableTitle(v) {
    const s = clean(v);
    if (!s || s.length < 2 || s.length > 180) return "";
    if (FAKE_TITLE.test(s)) return "";
    return s;
  }
  function clip(v, n) {
    const s = clean(v);
    if (s.length <= n) return s;
    return s.slice(0, n - 1).replace(/\s+\S*$/, "") + "…";
  }
  function frameDoc(frame) {
    try { return frame.contentDocument || null; } catch (_) { return null; }
  }
  function frameWin(frame) {
    try { return frame.contentWindow || null; } catch (_) { return null; }
  }
  function houseFile(card) {
    const src = String((card && card.dataset.house) || "");
    return src.split("/").pop().split("?")[0];
  }

  function stickySignal() {
    const audio = document.getElementById("audio");
    const src = audio ? String(audio.currentSrc || audio.getAttribute("src") || "") : "";
    const hit = STICKY_SIGNALS.find((s) => src && src.indexOf(s.stream) === 0);
    if (hit) return hit;
    const idx = Number(sessionStorage.getItem("passport_continuous_signal") || 0);
    return STICKY_SIGNALS[((idx % STICKY_SIGNALS.length) + STICKY_SIGNALS.length) % STICKY_SIGNALS.length];
  }
  function stickyPlaying() {
    const audio = document.getElementById("audio");
    return !!(audio && audio.paused === false && !audio.ended && audio.currentTime > 0);
  }

  function anyAudioPlaying(doc) {
    if (!doc) return false;
    const list = doc.querySelectorAll("audio");
    for (let i = 0; i < list.length; i++) {
      const a = list[i];
      if (a.paused === false && !a.ended && a.currentTime > 0) return true;
    }
    return false;
  }
  function ytPlayingTitle(win) {
    try {
      const YT = win && win.YT;
      if (!YT || !YT.get) return {playing: false, title: ""};
      for (let i = 0; i < YT_IDS.length; i++) {
        const p = YT.get(YT_IDS[i]);
        if (!p || !p.getPlayerState) continue;
        if (p.getPlayerState() !== 1) continue;
        let title = "";
        try {
          const data = p.getVideoData && p.getVideoData();
          title = usableTitle(data && data.title);
        } catch (_) {}
        return {playing: true, title: title};
      }
    } catch (_) {}
    return {playing: false, title: ""};
  }
  function globoPlaying(win) {
    try {
      return !!(win.PassportGloboPlayer && win.PassportGloboPlayer.state() === 1);
    } catch (_) { return false; }
  }

  const HOUSE_HINT = {
    "radio-continuous.html": {title: "passport-live-channel-name"},
    "radio-80s.html": {title: "passport80sTitle"},
    "radio-live-rare.html": {title: "tunnelTitle"},
    "radio-mundo-player.html": {title: "world-name"}
  };

  function bindFrame(frame) {
    try {
      const doc = frameDoc(frame);
      if (!doc || boundDocs.has(doc)) return;
      boundDocs.add(doc);
      doc.addEventListener("play", tick, true);
      doc.addEventListener("playing", tick, true);
      doc.addEventListener("pause", tick, true);
    } catch (_) {}
  }

  function readHouse(card) {
    const name = clean(card.dataset.name) || "Passport Radio";
    const file = houseFile(card);
    const host = document.getElementById("passport-casa-host");
    const frame = card.querySelector("iframe") || (
      host && host.dataset.house === card.dataset.house ? host.querySelector("iframe") : null
    );
    if (!frame) return null;
    bindFrame(frame);
    const doc = frameDoc(frame);
    const win = frameWin(frame);
    if (!doc || !win) return null;
    const hint = HOUSE_HINT[file] || {};
    const yt = ytPlayingTitle(win);
    const playing = anyAudioPlaying(doc) || yt.playing || globoPlaying(win);
    if (!playing) return null;
    const proven = usableTitle(yt.title) || usableTitle(text(doc, hint.title));
    const extra = proven || usableTitle(text(doc, "tunnelConsoleTitle"));
    return {
      house: file,
      name: name,
      playing: true,
      title: extra || name,
      detail: extra && extra !== name ? ("Passport Radio · " + name) : ("Passport Radio · 24H"),
      k7: extra && extra !== name ? (name.replace(/™/g, "") + " · " + extra) : (name.replace(/™/g, "") + " · 24H")
    };
  }

  function observe() {
    const mine = token;
    const cards = document.querySelectorAll("#passport-casas details[data-house]");
    let active = null;
    cards.forEach((card) => {
      if (!card.open) return;
      const hit = readHouse(card);
      if (hit) active = hit;
    });
    const houseKey = active ? active.house : "";
    if (houseKey !== lastHouseKey) {
      lastHouseKey = houseKey;
      bump();
    }
    if (mine !== token && mine !== token - 1) return null;
    const t = token;
    if (active) {
      return {
        token: t,
        source: "house",
        house: active.house,
        name: active.name,
        title: clip(active.title, 72),
        detail: active.detail,
        k7: clip(active.k7, 42),
        playing: true
      };
    }
    const signal = stickySignal();
    return {
      token: t,
      source: "sticky",
      house: "",
      name: signal.label,
      title: signal.label,
      detail: "24 horas",
      k7: signal.label + " · 24H",
      playing: stickyPlaying()
    };
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.textContent !== value) el.textContent = value;
  }
  function paint(next) {
    const audio = document.getElementById("audio");
    if (audio && audio.dataset.pgDoor === "1") return;
    if (!next || next.token !== token) return;
    state = next;
    setText("track", next.title);
    setText("meta", next.detail);
    setText("pp-onair-track", next.title);
    setText("pp-onair-sub", next.detail);
    const k7 = document.querySelector(".mold-radio .deck .cassette .label");
    if (k7 && k7.textContent !== next.k7) k7.textContent = next.k7;
  }

  function tick() {
    if (ticking) return;
    ticking = true;
    try {
      const next = observe();
      if (!next || next.token !== token) return;
      paint(next);
    } finally {
      ticking = false;
    }
  }

  const root = document.getElementById("passport-casas");
  if (root) {
    root.addEventListener("toggle", () => { bump(); lastHouseKey = ""; tick(); }, true);
    new MutationObserver(() => tick()).observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["open", "src"]
    });
  }
  const persistHost = document.getElementById("passport-casa-host");
  if (persistHost) {
    new MutationObserver(() => tick()).observe(persistHost, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["src", "data-house", "hidden", "class"]
    });
  }
  const track = document.getElementById("track");
  const meta = document.getElementById("meta");
  if (track || meta) {
    new MutationObserver(() => {
      if (state.source !== "house") return;
      tick();
    }).observe(track || meta, {childList: true, characterData: true, subtree: true});
  }
  document.addEventListener("play", tick, true);
  document.addEventListener("playing", tick, true);
  document.addEventListener("pause", tick, true);
  setInterval(tick, 700);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", tick, {once: true});
  else tick();

  window.PassportNowInfo = {
    snapshot() { return Object.assign({}, state); },
    token() { return token; }
  };
})();
