/* Comportamento da casa. As URLs são as dos motores que já tocam. Este arquivo não troca stream. */
(() => {
  "use strict";
  if (window.PassportDoc) return;

  const METAL = [
    { id: "metal", name: "Metal", url: "https://mediaserv68.live-streams.nl:18012/OnlyLive" },
    { id: "unplugged", name: "Unplugged", url: "https://streams.radio7.de/unplugged/mp3-192/web/" },
    { id: "regenbogen", name: "Unplugged II", url: "https://stream.regenbogen.de/unplugged/mp3-128/stream.regenbogen.de/" },
    { id: "metalwarriors", name: "Heavy Metal", url: "https://streaming.viphosting.cl/8012/stream" },
    { id: "gothic", name: "Gothic Passport", url: "https://streams.radio.co/s62583474c/listen" },
    { id: "livejam", name: "Live Jam", url: "https://stations.radio-host.com/proxy/livejam/stream" }
  ];
  const EIGHTIES = [
    { name: "Pop", url: "https://listen.181fm.com/181-awesome80s_128k.mp3" },
    { name: "Soft", url: "https://listen.181fm.com/181-lite80s_128k.mp3" },
    { name: "Country", url: "https://listen.181fm.com/181-80scountry_128k.mp3" },
    { name: "Soft R&B", url: "https://listen.181fm.com/181-80sliternb_128k.mp3" },
    { name: "R&B", url: "https://listen.181fm.com/181-80srnb_128k.mp3" },
    { name: "Hair Metal", url: "https://listen.181fm.com/181-hairband_128k.mp3" }
  ];
  const DIRECT = {
    mpb: { name: "MPB", url: "https://srv1.braudio.com.br:7008/;" },
    rock: { name: "Rock Brasil", url: "https://s01.brascast.com:7054/live" },
    soul: { name: "Soul", url: "https://onair7.xdevel.com/proxy/xautocloud_atvn_1069?mp=%2F%3B1%2F" },
    disco: { name: "Disco", url: "https://0n-disco.radionetz.de/0n-disco.mp3" },
    reggae: { name: "Reggae", url: "https://0n-reggae.radionetz.de/0n-reggae.mp3" },
    jovem: { name: "Jovem Guarda", url: "https://stream.vagalume.fm/hls/1520610873192520.m3u8", hls: true },
    hits: { name: "Hits", url: "https://listen.181fm.com/181-power_128k.mp3" },
    oldies: { name: "50s & 60s", url: "https://listen.181fm.com/181-goodtime_128k.mp3" },
    flash: { name: "Flash House", url: "https://playerservices.streamtheworld.com/api/livestream-redirect/TOP_RADIO.mp3" },
    nostalgia: { name: "Nostalgia", url: "https://centova2.euroti.com.br:20062/;" }
  };
  const NOVELAS = [
    "PL74FzgX6Wbls4sJiOZfPg5INFEiNJOmbb",
    "PLmgkGSqOPCzuxlATw8oZmimIJzhKvykK0",
    "PL7X8pld-Y43YMbL3HCFjnJeB4qFX9sjrN",
    "PL32elvOIURf97NmdtWYgS4ewh8COdcYbp",
    "PL7X8pld-Y43bCcopcIghZ9mYvGdLYrtbl",
    "PL7X8pld-Y43Z4xUxmWFDJvg4R5gX5Sg20",
    "PLBXBmZcJbX0yqCULtYkzVzoNRnWpiWA0-",
    "PL4E403236D3CE379F",
    "PL74FzgX6Wbltkk3UcFkDhqVb20MXIvek6"
  ];
  const GLOBO = ["E5uyPR8Zb9A", "zjxnOpUnRis", "mgIl2h7rr7E", "FwcHnyEPzEY", "T-cindr--4c", "lBBOTVtXftA"];
  const WORLD = [
    { id: "py", name: "Radio Paraguay", url: "https://cp9.serverse.com/proxy/rockandpop/stream" },
    { id: "ca", name: "Radio Québec", url: "https://stream.statsradio.com:8050/stream" },
    { id: "ve", name: "Radio Venezuela", url: "https://acp4.lorini.net:2050/stream" },
    { id: "mx", name: "PASSPORT MÉXICO™", url: "https://playerservices.streamtheworld.com/api/livestream-redirect/XHFAJ_FM.mp3" },
    { id: "fr", name: "Radio France", url: "https://ouifm.ice.infomaniak.ch/ouifm-high.mp3" },
    { id: "ua", name: "Українське музичне радіо", url: "https://tavr.tvstitch.com/HitFM?.mp3" },
    { id: "ro", name: "Radio Muzică Românească", url: "https://live.rockfm.ro/rockfm.aacp" },
    { id: "fi", name: "Suomalainen rockradio", url: "https://aud-stream-radiorock.nm-elemental.nelonenmedia.fi/playlist.m3u8", hls: true },
    { id: "cz", name: "České rockové rádio", url: "https://icecast3.play.cz/hey-radio128.mp3" },
    { id: "lt", name: "Lietuvos roko radijas", url: "https://stream2.rockfm.lt/crf128.mp3" },
    { id: "gr", name: "Ελληνικό ροκ ραδιόφωνο", url: "https://stream.radiojar.com/redfm963" },
    { id: "it", name: "Radio Italia", url: "https://str01.fluidstream.net/company.mp3" },
    { id: "catalunya", name: "PASSPORT CATALUNYA™", url: "https://mdstrm.com/audio/65afe517d47dc208abd053d2/live.m3u8", hls: true },
    { id: "tr", name: "Türkiye Müzik Radyosu", url: "https://yayin5.radyohizmeti.com/8090/stream;" },
    { id: "ea", name: "Rádio África", url: "https://edge.iono.fm/xice/jacarandafm_live_medium.aac" },
    { id: "kr", name: "한국 음악 라디오", url: "https://antares.dribbcast.com/proxy/kpop?mp=/s" },
    { id: "cn", name: "中国音乐电台", url: "https://lhttp.qingting.fm/live/4804/64k.mp3" },
    { id: "jp", name: "パスポート日本™", url: "https://radio.gotanno.love/;" },
    { id: "th", name: "พาสปอร์ตประเทศไทย™", url: "https://coolism-web.cdn.byteark.com/;stream/1" },
    { id: "kz", name: "ПАСПОРТ ҚАЗАҚСТАН™", url: "https://service.ns.kz/bc/live" },
    { id: "pk", name: "پاکستانی موسیقی ریڈیو", url: "https://radio.cityfm89.com/stream" },
    { id: "ir", name: "رادیو موسیقی ایران", url: "https://radio.avazfarsi.com:8000/radio.mp3" },
    { id: "il", name: "רדיו מוזיקה ישראלית", url: "https://glzwizzlv.bynetcdn.com/glglz_mp3" }
  ];

  const $ = (id) => document.getElementById(id);
  let owned = null;
  let hls = null;
  let yt = null;
  let ytQueue = [];
  let ytAsked = false;
  let liveIds = null;
  let token = 0;
  let arming = false;

  function claimBus() {
    if (window.PassportBus && window.PassportBus.claim) {
      try { window.PassportBus.claim(); } catch (e) {}
    }
  }

  function paintPlayError(err) {
    arming = false;
    if (!owned) return;
    const name = err && err.name;
    if (name === "NotAllowedError") paint(owned.control, "Toque para continuar", false);
    else if (name === "AbortError") paint(owned.control, "Pausado", false);
    else paint(owned.control, "Indisponível", false);
  }

  function controlName(name) {
    const clean = String(name || "").replace(/™/g, "").trim();
    if (/passport|passaporte|パスポート|พาสปอร์ต|ПАСПОРТ/i.test(clean)) return clean;
    return "Passport " + clean;
  }

  function labelFor(kind, code) {
    if (kind === "yt-live") {
      if (code === 1) return "Aberto";
      if (code === 2 || code === 0) return "Pausado";
      if (code === 3 || code === 5 || code === -1) return "Conectando";
      return "";
    }
    if (code === 1) return "No ar";
    if (code === 2 || code === 0) return "Pausado";
    if (code === 3 || code === 5 || code === -1) return "Conectando";
    if (code === "fail") return "Indisponível";
    if (code === "gesture") return "Toque para continuar";
    return "";
  }

  function paint(name, status, on) {
    const title = $("pr-name");
    const state = $("pr-state");
    const play = $("pr-play");
    if (title && name) title.textContent = name;
    if (state) state.textContent = status || "";
    if (play) {
      play.textContent = on ? "❚❚" : "▶";
      play.setAttribute("aria-label", on ? "Pausar" : "Tocar");
    }
    const bar = $("pr-player");
    if (bar) bar.classList.toggle("is-on", !!on);
  }

  function mark(id) {
    document.querySelectorAll("#pr-babies [data-pr]").forEach((btn) => {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-pr") === id ? "true" : "false");
    });
  }

  function stopAudio() {
    const audio = $("pr-audio");
    if (!audio) return;
    try { audio.pause(); } catch (e) {}
    if (hls) { try { hls.destroy(); } catch (e) {} hls = null; }
  }

  function stopOthers() {
    document.querySelectorAll("audio").forEach((media) => {
      if (media.id === "pr-audio") return;
      if (!media.paused) { try { media.pause(); } catch (e) {} }
    });
  }

  function volumeValue() {
    const input = $("pr-volume");
    return input ? Number(input.value) : 0.8;
  }

  function applyVolume() {
    const value = volumeValue();
    const audio = $("pr-audio");
    if (audio) audio.volume = value;
    if (yt && owned && owned.kind === "yt-radio" && yt.setVolume) {
      try { yt.setVolume(Math.round(value * 100)); } catch (e) {}
    }
  }

  function setVolumeEnabled(on) {
    const input = $("pr-volume");
    if (!input) return;
    input.disabled = !on;
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const already = [...document.scripts].some((s) => (s.src || "").indexOf(src.split("?")[0]) !== -1);
      if (already && window.Hls) { resolve(); return; }
      if (already && src.indexOf("tunnel-playlists") !== -1 && window.PASSPORT_TUNNEL_PLAYLISTS) { resolve(); return; }
      const s = document.createElement("script");
      s.src = src;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(src));
      document.head.appendChild(s);
    });
  }

  function ensureYt(cb) {
    if (window.YT && window.YT.Player) { cb(); return; }
    ytQueue.push(cb);
    if (ytAsked) return;
    ytAsked = true;
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function () {
      if (typeof prev === "function") { try { prev(); } catch (e) {} }
      const queue = ytQueue.splice(0);
      queue.forEach((fn) => { try { fn(); } catch (e) {} });
    };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(s);
  }

  function playAudio(item, id) {
    const mine = ++token;
    claimBus();
    stopOthers();
    if (yt && yt.stopVideo) { try { yt.stopVideo(); } catch (e) {} }
    setVolumeEnabled(true);
    owned = { kind: "audio", id: id, control: controlName(item.name), url: item.url, token: mine };
    mark(id);
    paint(owned.control, "Conectando", false);
    const audio = $("pr-audio");
    if (!audio) return;
    arming = true;
    stopAudio();
    audio.volume = volumeValue();
    const start = () => {
      if (token !== mine) return;
      audio.src = item.url;
      const attempt = audio.play();
      if (attempt && attempt.catch) attempt.catch((err) => { if (token === mine) paintPlayError(err); });
    };
    const hlsUrl = !!(item.hls || /\.m3u8(\?|$)/i.test(item.url));
    if (!hlsUrl || audio.canPlayType("application/vnd.apple.mpegurl")) { start(); return; }
    const boot = () => {
      if (!window.Hls || !window.Hls.isSupported()) { paint(owned.control, "Indisponível", false); return; }
      hls = new window.Hls();
      hls.loadSource(item.url);
      hls.attachMedia(audio);
      hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
        const attempt = audio.play();
        if (attempt && attempt.catch) attempt.catch((err) => { if (token === mine) paintPlayError(err); });
      });
      hls.on(window.Hls.Events.ERROR, (_, data) => {
        if (data && data.fatal) paint(owned.control, "Indisponível", false);
      });
    };
    if (window.Hls) boot();
    else loadScript("https://cdn.jsdelivr.net/npm/hls.js@1.7.0/dist/hls.min.js").then(boot).catch(() => paint(owned.control, "Indisponível", false));
  }

  function armYt(spec) {
    const mine = ++token;
    claimBus();
    stopOthers();
    stopAudio();
    const radio = spec.kind === "yt-radio";
    setVolumeEnabled(radio);
    owned = { kind: spec.kind, id: spec.id, control: controlName(spec.name), token: mine, index: spec.index || 0, list: spec.list || "", video: spec.video || "" };
    mark(spec.id);
    paint(owned.control, "Conectando", false);
    const apply = () => {
      if (token !== mine) return;
      const host = $("pr-yt");
      if (!host) return;
      const vars = { autoplay: 1, controls: 0, rel: 0, modestbranding: 1, playsinline: 1 };
      if (spec.list) { vars.listType = "playlist"; vars.list = spec.list; }
      if (!yt) {
        yt = new window.YT.Player("pr-yt", {
          width: 1,
          height: 1,
          videoId: spec.video || undefined,
          playerVars: vars,
          events: {
            onReady: (ev) => {
              if (radio) { try { ev.target.setVolume(Math.round(volumeValue() * 100)); } catch (e) {} }
              try { ev.target.playVideo(); } catch (e) {}
            },
            onStateChange: (ev) => onYt(ev.data),
            onError: () => {
              if (!owned || owned.token !== token) return;
              paint(owned.control, owned.kind === "yt-radio" ? "Indisponível" : "Pausado", false);
            }
          }
        });
        return;
      }
      if (radio && yt.setVolume) { try { yt.setVolume(Math.round(volumeValue() * 100)); } catch (e) {} }
      try {
        if (spec.list) yt.loadPlaylist({ list: spec.list, listType: "playlist", index: 0 });
        else if (spec.video) yt.loadVideoById(spec.video);
        yt.playVideo();
      } catch (e) {
        setTimeout(() => { if (token === mine) apply(); }, 350);
      }
    };
    ensureYt(apply);
  }

  function onYt(code) {
    if (!owned || (owned.kind !== "yt-radio" && owned.kind !== "yt-live")) return;
    if (owned.kind === "yt-live" && code === 0 && liveIds && owned.index + 1 < liveIds.length) {
      owned.index += 1;
      const next = liveIds[owned.index];
      owned.list = next;
      if (yt && yt.loadPlaylist) yt.loadPlaylist({ list: next, listType: "playlist", index: 0 });
      paint(owned.control, "Conectando", false);
      return;
    }
    const status = labelFor(owned.kind, code);
    paint(owned.control, status, code === 1 && owned.kind === "yt-radio");
    if (owned.kind === "yt-live" && code === 1) paint(owned.control, "Aberto", true);
  }

  function playLive() {
    const start = (ids) => {
      if (!ids.length) { paint("Passport Live & Rare", "Indisponível", false); return; }
      liveIds = ids;
      armYt({ kind: "yt-live", id: "liverare", name: "Live & Rare", list: ids[0], index: 0 });
    };
    if (liveIds) { start(liveIds); return; }
    loadScript("/js/tunnel-playlists.js?v=20260916d").then(() => {
      const rows = window.PASSPORT_TUNNEL_PLAYLISTS || [];
      start(rows.filter((row) => row && row.id).map((row) => row.id));
    }).catch(() => paint("Passport Live & Rare", "Indisponível", false));
  }

  function choose(id) {
    if (!id) return;
    if (id.indexOf("metal:") === 0) {
      const item = METAL.find((row) => row.id === id.slice(6));
      if (item) playAudio(item, id);
      return;
    }
    if (id.indexOf("80s:") === 0) {
      const item = EIGHTIES.find((row) => row.name === id.slice(4));
      if (item) playAudio(item, id);
      return;
    }
    if (DIRECT[id]) { playAudio(DIRECT[id], id); return; }
    if (id.indexOf("novela:") === 0) {
      const index = Number(id.slice(7));
      const list = NOVELAS[index];
      if (list) armYt({ kind: "yt-radio", id: id, name: "Novelas " + String(index + 1).padStart(2, "0"), list: list });
      return;
    }
    if (id.indexOf("globo:") === 0) {
      const index = Number(id.slice(6));
      const video = GLOBO[index];
      if (video) armYt({ kind: "yt-radio", id: id, name: "Globo de Ouro " + String(index + 1).padStart(2, "0"), video: video });
      return;
    }
    if (id.indexOf("world:") === 0) {
      const item = WORLD.find((row) => row.id === id.slice(6));
      if (item) playAudio(item, id);
      return;
    }
    if (id === "liverare") playLive();
  }

  function toggle() {
    if (!owned) return;
    if (owned.kind === "audio") {
      const audio = $("pr-audio");
      if (!audio) return;
      if (audio.paused) {
        claimBus();
        const attempt = audio.play();
        if (attempt && attempt.catch) attempt.catch((err) => paintPlayError(err));
      } else {
        audio.pause();
        paint(owned.control, "Pausado", false);
      }
      return;
    }
    if (!yt || !yt.getPlayerState) return;
    if (yt.getPlayerState() === 1) yt.pauseVideo();
    else yt.playVideo();
  }

  function bindAudio() {
    const audio = $("pr-audio");
    if (!audio || audio.dataset.prBound) return;
    audio.dataset.prBound = "1";
    audio.addEventListener("playing", () => {
      arming = false;
      if (!owned || owned.kind !== "audio") return;
      paint(owned.control, "No ar", true);
    });
    audio.addEventListener("pause", () => {
      if (arming) return;
      if (!owned || owned.kind !== "audio") return;
      if (!audio.ended) paint(owned.control, "Pausado", false);
    });
    audio.addEventListener("waiting", () => {
      if (!owned || owned.kind !== "audio" || audio.paused) return;
      paint(owned.control, "Conectando", false);
    });
    audio.addEventListener("error", () => {
      if (!owned || owned.kind !== "audio") return;
      paint(owned.control, "Indisponível", false);
    });
  }

  function samePage(url) {
    return url.origin === location.origin && !/\.(pdf|zip|mp3|jpe?g|png|webp|gif|svg|mp4|webm)$/i.test(url.pathname);
  }

  function runScripts(root) {
    root.querySelectorAll("script").forEach((old) => {
      const script = document.createElement("script");
      [...old.attributes].forEach((attr) => script.setAttribute(attr.name, attr.value));
      if (!old.src) script.textContent = old.textContent;
      old.replaceWith(script);
    });
  }

  function markNav() {
    const path = location.pathname.replace(/\/index\.html$/, "/") || "/";
    document.querySelectorAll("#pr-sections a").forEach((a) => {
      let current = false;
      try {
        const next = new URL(a.getAttribute("href"), location.origin);
        current = next.pathname === path || (path === "/" && (next.pathname === "/" || next.pathname === "/index.html"));
      } catch (e) { current = false; }
      if (current) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  let navToken = 0;
  async function go(href, fromHistory) {
    const mine = ++navToken;
    let res;
    try { res = await fetch(href, { credentials: "same-origin" }); }
    catch (e) { location.href = href; return; }
    if (!res.ok) { location.href = href; return; }
    const html = await res.text();
    if (mine !== navToken) return;
    const doc = new DOMParser().parseFromString(html, "text/html");
    const next = doc.querySelector("#pr-main");
    const main = $("pr-main");
    if (!next || !main) { location.href = href; return; }
    main.innerHTML = next.innerHTML;
    document.title = doc.title || document.title;
    if (!fromHistory) history.pushState({ pr: 1 }, "", href);
    runScripts(main);
    markNav();
    document.dispatchEvent(new Event("pr:page"));
    window.scrollTo(0, 0);
  }

  function onClick(ev) {
    const station = ev.target.closest("[data-pr]");
    if (station && $("pr-house") && $("pr-house").contains(station)) {
      ev.preventDefault();
      choose(station.getAttribute("data-pr"));
      return;
    }
    if (ev.target.closest("#pr-play")) {
      ev.preventDefault();
      toggle();
      return;
    }
    const link = ev.target.closest("a");
    if (!link) return;
    if (ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    if (link.target && link.target !== "_self") return;
    const raw = link.getAttribute("href");
    if (!raw || raw.charAt(0) === "#" || /^(mailto:|tel:|javascript:)/i.test(raw)) return;
    let url;
    try { url = new URL(link.href, location.href); } catch (e) { return; }
    if (!samePage(url)) return;
    ev.preventDefault();
    go(url.href, false);
  }

  function onSubmit(ev) {
    const form = ev.target;
    if (!(form instanceof HTMLFormElement)) return;
    if ((form.getAttribute("method") || "get").toLowerCase() !== "get") return;
    let url;
    try { url = new URL(form.getAttribute("action") || location.href, location.href); } catch (e) { return; }
    if (!samePage(url)) return;
    ev.preventDefault();
    const data = new FormData(form);
    url.search = new URLSearchParams(data).toString();
    go(url.href, false);
  }

  function boot() {
    bindAudio();
    const audio = $("pr-audio");
    if (audio) audio.volume = volumeValue();
    const volume = $("pr-volume");
    if (volume && !volume.dataset.prBound) {
      volume.dataset.prBound = "1";
      volume.addEventListener("input", applyVolume);
    }
    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    window.addEventListener("popstate", () => { go(location.href, true); });
    history.replaceState({ pr: 1 }, "", location.href);
    markNav();
    document.querySelectorAll("audio").forEach((media) => {
      if (media.id !== "pr-audio" && !media.paused) { try { media.pause(); } catch (e) {} }
    });
  }

  window.PassportDoc = { choose: choose, go: go, labelFor: labelFor, controlName: controlName, stations: { metal: METAL, eighties: EIGHTIES, direct: DIRECT, novelas: NOVELAS, globo: GLOBO, world: WORLD } };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
