/* Porta musical da Passport.
   Um ponto de escolha no topo. Um elemento de áudio visível por página.
   Os motores publicados continuam donos das URLs. Este arquivo não troca stream.
   Na Home, continuous-signals-home.js ainda arma #audio em Metal/Unplugged/Live Jam.
   Fora da Home esse motor não liga (pathname). A porta toca a mesma URL no
   áudio desta página e pausa qualquer outro. Um som por vez.
   Navegação multipágina recarrega o documento: o mesmo elemento de áudio não
   sobrevive. Se o visitante estava no ar, a porta tenta o mesmo endereço de
   novo e, se o navegador bloquear, fica em "toque para continuar" — sem fingir
   que segue tocando. */
(() => {
  "use strict";
  if (window.PassportPorta) return;

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
    mpb: { name: "MPB", note: "Rádio Só MPB", url: "https://srv1.braudio.com.br:7008/;" },
    rock: { name: "Rock Brasil", note: "Rock nacional", url: "https://s01.brascast.com:7054/live" },
    soul: { name: "Soul", note: "Soul", url: "https://onair7.xdevel.com/proxy/xautocloud_atvn_1069?mp=%2F%3B1%2F" },
    disco: { name: "Disco", note: "Passport Disco", url: "https://0n-disco.radionetz.de/0n-disco.mp3" },
    reggae: { name: "Reggae", note: "Passport Reggae", url: "https://0n-reggae.radionetz.de/0n-reggae.mp3" },
    hits: { name: "Hits", note: "Pop · Top 40", url: "https://listen.181fm.com/181-power_128k.mp3" },
    oldies: { name: "50s & 60s", note: "50s & 60s", url: "https://listen.181fm.com/181-goodtime_128k.mp3" },
    flash: { name: "Flash House", note: "Flash House", url: "https://playerservices.streamtheworld.com/api/livestream-redirect/TOP_RADIO.mp3" },
    nostalgia: { name: "Nostalgia", note: "Anos 70, 80 e 90", url: "https://centova2.euroti.com.br:20062/;" },
    jovem: { name: "Jovem Guarda", note: "Jovem Guarda", url: "https://stream.vagalume.fm/hls/1520610873192520.m3u8", hls: true }
  };
  const NOVELAS = [
    { id: "PL74FzgX6Wbls4sJiOZfPg5INFEiNJOmbb" },
    { id: "PLmgkGSqOPCzuxlATw8oZmimIJzhKvykK0" },
    { id: "PL7X8pld-Y43YMbL3HCFjnJeB4qFX9sjrN" },
    { id: "PL32elvOIURf97NmdtWYgS4ewh8COdcYbp" },
    { id: "PL7X8pld-Y43bCcopcIghZ9mYvGdLYrtbl" },
    { id: "PL7X8pld-Y43Z4xUxmWFDJvg4R5gX5Sg20" },
    { id: "PLBXBmZcJbX0yqCULtYkzVzoNRnWpiWA0-" },
    { id: "PL4E403236D3CE379F" },
    { id: "PL74FzgX6Wbltkk3UcFkDhqVb20MXIvek6" }
  ];
  const GLOBO = ["E5uyPR8Zb9A", "zjxnOpUnRis", "mgIl2h7rr7E", "FwcHnyEPzEY", "T-cindr--4c", "lBBOTVtXftA"];
  const PRIMARY = [
    ["metal", "Metal"], ["80s", "80s"], ["mpb", "MPB"], ["rock", "Rock Brasil"],
    ["soul", "Soul"], ["disco", "Disco"], ["reggae", "Reggae"], ["jovem", "Jovem Guarda"]
  ];
  const MORE = [
    ["hits", "Hits"], ["oldies", "50s & 60s"], ["flash", "Flash House"], ["nostalgia", "Nostalgia"],
    ["novelas", "Novelas"], ["liverare", "Live & Rare"], ["globo", "Globo de Ouro"], ["world", "Rádios do Mundo"]
  ];
  const PLACE = {
    py: ["Américas", "Paraguai"],
    ca: ["Américas", "Québec"],
    ve: ["Américas", "Venezuela"],
    mx: ["Américas", "México"],
    fr: ["Europa", "França"],
    ua: ["Europa", "Ucrânia"],
    ro: ["Europa", "Romênia"],
    fi: ["Europa", "Finlândia"],
    cz: ["Europa", "Tchéquia"],
    lt: ["Europa", "Lituânia"],
    gr: ["Europa", "Grécia"],
    it: ["Europa", "Itália"],
    catalunya: ["Europa", "Catalunya"],
    tr: ["Europa", "Türkiye"],
    kr: ["Ásia", "Coreia"],
    cn: ["Ásia", "China"],
    jp: ["Ásia", "Japão"],
    th: ["Ásia", "Tailândia"],
    kz: ["Ásia", "Cazaquistão"],
    pk: ["Ásia", "Paquistão"],
    ir: ["Ásia", "Irã"],
    il: ["Ásia", "Israel"],
    ea: ["África", "África do Sul"]
  };
  const REGION_ORDER = ["Américas", "Europa", "África", "Ásia"];
  const STORE = "passport.porta";

  let owned = null;
  let motor = null;
  let hls = null;
  let worldCache = null;
  let liveCache = null;
  let arming = 0;
  const $ = (id) => document.getElementById(id);

  function claimBus() {
    if (window.PassportBus && window.PassportBus.claim) window.PassportBus.claim();
  }

  function qs(sel) { return document.querySelector(sel); }
  function qsa(sel) { return [...document.querySelectorAll(sel)]; }

  function ensureCss() {
    if ($("pg-porta-css")) return;
    const style = document.createElement("style");
    style.id = "pg-porta-css";
    style.textContent = "#pg-porta-player{display:none!important}";
    document.head.appendChild(style);
  }

  function nodes() {
    const homeAudio = $("audio");
    const home = !!($("passport-player") && homeAudio && $("play"));
    let audio = home ? homeAudio : $("pg-porta-audio");
    if (!audio) {
      audio = document.createElement("audio");
      audio.id = "pg-porta-audio";
      audio.preload = "none";
      document.body.appendChild(audio);
    }
    return {
      root: $("pg-porta") || $("passport-player"),
      play: $("pg-porta-play") || $("play"),
      track: $("pg-porta-track") || $("track"),
      meta: $("pg-porta-meta") || $("meta"),
      state: $("pg-porta-state") || $("state"),
      audio: audio,
      home: home
    };
  }

  function paint(name, note, status) {
    const ui = nodes();
    if (ui.track && name) ui.track.textContent = name;
    if (ui.meta) ui.meta.textContent = note || "";
    if (ui.state && status) ui.state.textContent = status;
    const on = status === "TOCANDO";
    if (ui.play) ui.play.textContent = on ? "Pausar" : "Tocar";
    const human = {
      TOCANDO: "No ar",
      PAUSADO: "Pausado",
      CONECTANDO: "Conectando",
      "SINAL INDISPONÍVEL": "Sinal indisponível",
      "TOQUE PARA CONTINUAR": "Toque para continuar",
      ABERTO: "Aberto"
    };
    if (ui.state && status) ui.state.textContent = human[status] || "";
    const bar = $("pg-porta");
    if (bar) bar.classList.toggle("is-live", on);
    scrub();
  }

  function scrub() {
    ["meta", "track", "state", "pg-porta-meta", "pg-porta-track", "pg-porta-state"].forEach((id) => {
      const node = $(id);
      if (!node) return;
      const text = node.textContent || "";
      if (!/Continuous Signals|World Dial|Tunnel/i.test(text)) return;
      node.textContent = text
        .replace(/Passport Radio · Continuous Signals™ · 24H/g, "24 horas")
        .replace(/Continuous Signals™/g, "Metal")
        .replace(/WORLD DIAL™|World Dial™?/g, "Rádios do Mundo")
        .replace(/\bTUNNEL™/g, "")
        .replace(/\s{2,}/g, " ")
        .trim();
    });
  }

  function remember(extra) {
    if (!owned) return;
    const payload = {
      id: owned.chooseId || "",
      name: owned.name || "",
      note: owned.note || "",
      url: owned.url || "",
      hls: !!owned.hls,
      kind: owned.kind || "",
      live: extra && typeof extra.live === "boolean" ? extra.live : owned.live !== false
    };
    owned.live = payload.live;
    try { sessionStorage.setItem(STORE, JSON.stringify(payload)); } catch (_) {}
  }

  function saved() {
    try { return JSON.parse(sessionStorage.getItem(STORE) || "null"); } catch (_) { return null; }
  }

  function stopOthers(keep) {
    qsa("audio,video").forEach((media) => {
      if (media !== keep && !media.paused) {
        try { media.pause(); } catch (_) {}
      }
      if (media !== keep && media.id === "passport-live-audio") {
        try { media.pause(); } catch (_) {}
      }
    });
    const youtube = owned && (owned.kind === "novela" || owned.kind === "live" || owned.kind === "globo");
    qsa("iframe").forEach((frame) => {
      if (frame.id === "pg-embed-frame" && youtube) return;
      const src = frame.getAttribute("src") || "";
      if (!src || src === "about:blank") return;
      if (/youtube\.com|youtu\.be|onlineradiobox\.com/i.test(src)) {
        frame.setAttribute("src", "about:blank");
      }
    });
  }

  function hookMotor() {
    const play = $("play");
    const audio = $("audio");
    const next = $("next");
    const prev = $("prev");
    if (!play || !audio || !next || !$("passport-player") || !play.onclick) return false;
    if (motor && motor.playFn) return true;
    motor = { audio, play, next, prev, playFn: play.onclick, nextFn: next.onclick, prevFn: prev && prev.onclick };
    play.onclick = () => {
      if (owned && owned.kind !== "motor") toggle();
      else motor.playFn.call(play);
    };
    if (next) next.onclick = () => {
      if (owned && owned.kind !== "motor") return;
      owned = null;
      const media = $("audio");
      if (media) delete media.dataset.pgDoor;
      motor.nextFn.call(next);
    };
    if (prev && motor.prevFn) prev.onclick = () => {
      if (owned && owned.kind !== "motor") return;
      owned = null;
      const media = $("audio");
      if (media) delete media.dataset.pgDoor;
      motor.prevFn.call(prev);
    };
    const onError = audio.onerror;
    audio.onerror = () => {
      if (audio.dataset.pgDoor === "1") {
        paint(owned && owned.name, owned && owned.note, "SINAL INDISPONÍVEL");
        return;
      }
      if (onError) onError.call(audio);
    };
    return true;
  }

  function pauseMotor() {
    const audio = $("audio");
    if (!motor || !audio || audio.dataset.pgDoor === "1") {
      if (motor && motor.audio && motor.audio !== nodes().audio && !motor.audio.paused) {
        try { motor.audio.pause(); } catch (_) {}
      }
      return;
    }
    if (!motor.audio.paused) motor.playFn.call(motor.play);
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if ([...document.scripts].some((s) => (s.src || "").indexOf(src.split("?")[0]) !== -1)) { resolve(); return; }
      const s = document.createElement("script");
      s.src = src;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(src));
      document.head.appendChild(s);
    });
  }

  function playUrl(item) {
    claimBus();
    const ui = nodes();
    hookMotor();
    if (hls) { try { hls.destroy(); } catch (_) {} hls = null; }
    const audio = ui.audio;
    owned = {
      kind: "url",
      chooseId: item.chooseId,
      name: item.name,
      note: item.note,
      url: item.url,
      hls: !!item.hls,
      media: audio,
      live: false
    };
    audio.dataset.pgDoor = "1";
    if (ui.home && motor && motor.audio === audio) {
      /* o motor da Home não pode reconectar por cima desta escolha */
    }
    stopOthers(audio);
    audio.pause();
    arming = Date.now();
    paint(item.name, item.note, "CONECTANDO");
    remember({ live: false });
    const startNative = () => {
      audio.src = item.url;
      const volume = $("pg-home-volume") || $("pg-porta-volume");
      if (volume) audio.volume = Number(volume.value);
      const attempt = audio.play();
      if (attempt && attempt.catch) {
        attempt.catch(() => {
          paint(item.name, item.note, "TOQUE PARA CONTINUAR");
          remember({ live: false });
        });
      }
    };
    const bar = $("pg-porta");
    if (bar) bar.classList.remove("is-open");
    if (!item.hls || audio.canPlayType("application/vnd.apple.mpegurl")) { startNative(); return; }
    const bootHls = () => {
      if (!window.Hls || !window.Hls.isSupported()) { paint(item.name, item.note, "SINAL INDISPONÍVEL"); return; }
      hls = new window.Hls();
      hls.loadSource(item.url);
      hls.attachMedia(audio);
      hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
        const attempt = audio.play();
        if (attempt && attempt.catch) {
          attempt.catch(() => paint(item.name, item.note, "TOQUE PARA CONTINUAR"));
        }
      });
    };
    if (window.Hls) bootHls();
    else loadScript("https://cdn.jsdelivr.net/npm/hls.js@1.7.0/dist/hls.min.js").then(bootHls).catch(() => paint(item.name, item.note, "SINAL INDISPONÍVEL"));
  }

  function embed(url, name, note, chooseId, kind) {
    claimBus();
    let frame = $("pg-embed-frame");
    if (!frame) {
      frame = document.createElement("iframe");
      frame.id = "pg-embed-frame";
      frame.title = "Reprodução";
      frame.allow = "autoplay";
      frame.hidden = true;
      frame.style.cssText = "position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)";
      document.body.appendChild(frame);
    }
    owned = { kind: kind, chooseId: chooseId, name: name, note: note, url: url, live: true };
    const ui = nodes();
    if (ui.audio) {
      ui.audio.pause();
      delete ui.audio.dataset.pgDoor;
    }
    stopOthers(null);
    owned = { kind: kind, chooseId: chooseId, name: name, note: note, url: url, live: true };
    frame.src = url;
    /* Iframe não confirma playback. Não marcar TOCANDO. */
    paint(name, note, "ABERTO");
    remember({ live: false });
  }

  function toggle() {
    if (!owned) {
      const ui = nodes();
      if (motor && ui.home) motor.playFn.call(motor.play);
      else if (ui.audio && ui.audio.src) {
        if (ui.audio.paused) ui.audio.play().catch(() => {});
        else ui.audio.pause();
      }
      return;
    }
    if (owned.kind === "url" && owned.media) {
      const media = owned.media;
      if (media.paused) {
        claimBus();
        media.play().then(() => { /* TOCANDO só no evento playing */ }).catch(() => paint(owned.name, owned.note, "TOQUE PARA CONTINUAR"));
      } else { media.pause(); paint(owned.name, owned.note, "PAUSADO"); remember({ live: false }); }
      return;
    }
    if (owned.kind === "novela" || owned.kind === "live" || owned.kind === "globo") {
      const frame = $("pg-embed-frame");
      if (frame && frame.src && frame.src !== "about:blank") {
        frame.src = "about:blank";
        paint(owned.name, owned.note, "PAUSADO");
        remember({ live: false });
      } else if (owned.url) {
        embed(owned.url, owned.name, owned.note, owned.chooseId, owned.kind);
      }
      return;
    }
    if (motor) motor.playFn.call(motor.play);
  }

  function panel() { return $("pg-porta-panel"); }
  function openPanel(html) {
    const el = panel();
    if (!el) return;
    el.hidden = false;
    el.innerHTML = html;
  }
  function closePanel() {
    const el = panel();
    if (!el) return;
    el.hidden = true;
    el.innerHTML = "";
  }
  function closeMenus() {
    closePanel();
    const bar = $("pg-porta");
    if (bar) bar.classList.remove("is-open");
    const more = $("pg-porta-more");
    if (more) more.setAttribute("aria-expanded", "false");
  }
  function mark(id) {
    qsa("[data-pg-choose]").forEach((el) => {
      const on = el.getAttribute("data-pg-choose") === id;
      el.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }
  function choices(html) {
    return '<div class="pg-porta-choices">' + html + "</div>";
  }

  function choose(id) {
    mark(id);
    if (id === "metal" || id === "80s" || id === "novelas" || id === "globo" || id === "world" || id === "liverare") {
      return;
    }
    closePanel();
    const item = DIRECT[id];
    if (!item) return;
    const pageButton = qs('[data-live-channel="' + id + '"]');
    if (pageButton && id === "metal") {
      pageButton.click();
      return;
    }
    playUrl({ chooseId: id, name: item.name, note: item.note, url: item.url, hls: item.hls });
    const bar = $("pg-porta");
    if (bar) bar.classList.remove("is-open");
  }

  function playMetal(id) {
    const item = METAL.find((entry) => entry.id === id);
    if (!item) return;
    const button = qs('[data-live-channel="' + id + '"]');
    if (button && $("passport-live-audio")) {
      button.click();
      const play = $("passport-live-play");
      const media = $("passport-live-audio");
      if (play && media && media.paused) play.click();
      owned = { kind: "external", chooseId: "metal", name: "Metal", note: item.name, external: media, media: media, live: false };
      stopOthers(media);
      paint("Metal", item.name, "CONECTANDO");
      remember({ live: false });
      media.addEventListener("playing", () => {
        if (!owned || owned.media !== media) return;
        paint("Metal", item.name, "TOCANDO");
        remember({ live: true });
      });
      media.addEventListener("pause", () => {
        if (!owned || owned.media !== media) return;
        paint("Metal", item.name, "PAUSADO");
        remember({ live: false });
      });
      closePanel();
      return;
    }
    playUrl({ chooseId: "metal", name: "Metal", note: item.name, url: item.url });
    closePanel();
  }

  function playEighties(name) {
    const item = EIGHTIES.find((entry) => entry.name === name);
    if (!item) return;
    playUrl({ chooseId: "80s", name: "80s", note: name, url: item.url });
    closePanel();
  }

  function playNovela(index) {
    const item = NOVELAS[index];
    if (!item) return;
    const label = String(index + 1).padStart(2, "0");
    embed("https://www.youtube.com/embed/videoseries?list=" + encodeURIComponent(item.id) + "&autoplay=1&controls=0", "Novelas", label, "novelas", "novela");
    closePanel();
  }

  function playGlobo(index) {
    const id = GLOBO[index];
    if (!id) return;
    embed("https://www.youtube.com/embed/" + encodeURIComponent(id) + "?autoplay=1", "Globo de Ouro", String(index + 1).padStart(2, "0"), "globo", "globo");
    closePanel();
  }

  function playLive(index) {
    const item = liveCache && liveCache[index];
    if (!item) return;
    embed("https://www.youtube.com/embed/videoseries?list=" + encodeURIComponent(item.id) + "&autoplay=1&controls=0", "Live & Rare", item.label, "liverare", "live");
    closePanel();
  }

  function loadLive() {
    const draw = (query) => {
      const list = $("pg-live-list");
      if (!list || !liveCache) return;
      const q = (query || "").trim().toLowerCase();
      const rows = liveCache.filter((item) => !q || (item.label + " " + item.group).toLowerCase().indexOf(q) !== -1);
      const groups = [];
      rows.forEach((item) => {
        let bucket = groups.find((entry) => entry.name === item.group);
        if (!bucket) { bucket = { name: item.group, items: [] }; groups.push(bucket); }
        bucket.items.push(item);
      });
      const slug = { "WackenTV": "wackentv", "BBC Music": "bbc-music", "The Midnight Special": "midnight-special", "Live Aid": "live-aid" };
      list.innerHTML = groups.map((bucket) => {
        const id = slug[bucket.name] || "";
        return '<h3 id="' + id + '">' + bucket.name + '</h3><div class="pg-names">' +
          bucket.items.map((item) => '<button type="button" data-pg-live="' + item.index + '" aria-pressed="false">' + item.label + "</button>").join("") +
          "</div>";
      }).join("") || "<p>Nenhum artista com esse texto.</p>";
    };
    if (liveCache) { draw($("pg-live-q") && $("pg-live-q").value); return; }
    loadScript("/js/tunnel-playlists.js?v=20260916d").then(() => {
      const rows = window.PASSPORT_TUNNEL_PLAYLISTS || [];
      liveCache = rows.filter((item) => item && item.id && item.label).map((item, index) => ({
        index: index,
        id: item.id,
        label: item.label,
        group: item.group || "Acervo"
      }));
      draw("");
    }).catch(() => {
      const list = $("pg-live-list");
      if (list) list.textContent = "O acervo não carregou.";
    });
  }

  function worldButton(station) {
    return '<button type="button" data-pg-world="' + station.id + '" aria-pressed="false">' + station.name.replace(/™/g, "") + "</button>";
  }

  function paintWorld(query) {
    const list = $("pg-world-list");
    if (!list || !worldCache) return;
    const q = (query || "").trim().toLowerCase();
    const rows = worldCache.filter((station) => {
      const place = PLACE[station.id] ? PLACE[station.id].join(" ") : "";
      return !q || (station.name + " " + station.terms + " " + place).toLowerCase().indexOf(q) !== -1;
    });
    if (!rows.length) { list.innerHTML = "<p>Nenhuma estação com esse texto.</p>"; return; }
    if (q) {
      list.innerHTML = '<div class="pg-names">' + rows.map(worldButton).join("") + "</div>";
      return;
    }
    const grouped = REGION_ORDER.map((region) => {
      const group = rows.filter((station) => PLACE[station.id] && PLACE[station.id][0] === region);
      if (!group.length) return "";
      return '<h3 class="pg-reg">' + region + '</h3><div class="pg-names">' + group.map(worldButton).join("") + "</div>";
    }).join("");
    const loose = rows.filter((station) => !PLACE[station.id]);
    list.innerHTML = grouped + (loose.length ? '<h3 class="pg-reg">Outras</h3><div class="pg-names">' + loose.map(worldButton).join("") + "</div>" : "");
  }

  function loadWorld() {
    if (worldCache) { paintWorld($("pg-world-q") && $("pg-world-q").value); return; }
    fetch("/js/world-radio-player.js", { credentials: "same-origin" }).then((r) => r.text()).then((text) => {
      const re = /\{id:'([^']+)',name:'([^']*)',source:'([^']*)',terms:'([^']*)'[^}]*?stream:'([^']+)'\}/g;
      const stations = [];
      let match;
      while ((match = re.exec(text))) stations.push({ id: match[1], name: match[2], source: match[3], terms: match[4], url: match[5] });
      worldCache = stations;
      paintWorld("");
    }).catch(() => {
      const list = $("pg-world-list");
      if (list) list.textContent = "A lista de estações não carregou.";
    });
  }

  function stationButton(attrs, label) {
    return '<button type="button" ' + attrs + ' aria-pressed="false">' + label + "</button>";
  }
  function gradeRow(title, inner) {
    return "<h3>" + title + "</h3><div class=\"pg-names\">" + inner + "</div>";
  }
  function mount() {
    if ($("pg-porta")) return;
    ensureCss();
    const bar = document.createElement("div");
    bar.id = "pg-porta";
    bar.className = "pg-porta";
    const directOrder = [
      ["mpb", "MPB"], ["rock", "Rock Brasil"], ["soul", "Soul"], ["disco", "Disco"], ["reggae", "Reggae"],
      ["jovem", "Jovem Guarda"], ["hits", "Hits"], ["oldies", "50s & 60s"], ["flash", "Flash House"], ["nostalgia", "Nostalgia"]
    ];
    const showLive = /(\/radio(?:-live-rare)?\.html|\/radio\/?)$/.test(location.pathname);
    bar.innerHTML =
      '<div class="pg-dial">' +
        '<button type="button" id="pg-porta-play" aria-label="Tocar ou pausar">Tocar</button>' +
        '<span class="pg-nowcopy"><strong id="pg-porta-track">Passport Radio</strong><small id="pg-porta-meta"></small></span>' +
        '<label class="pg-vol">Volume <input id="pg-porta-volume" type="range" min="0" max="1" step="0.05" value="0.8" aria-label="Volume"></label>' +
        '<span id="pg-porta-state" class="pg-state"></span>' +
      "</div>" +
      '<div class="pg-grade" id="pg-porta-grade">' +
        gradeRow("Música", METAL.map((item) => stationButton('data-pg-metal="' + item.id + '"', item.name)).join("")) +
        gradeRow("80s", EIGHTIES.map((item) => stationButton('data-pg-80s="' + item.name + '"', item.name)).join("")) +
        gradeRow("Outras rádios", directOrder.map(([id, label]) => stationButton('data-pg-choose="' + id + '"', label)).join("")) +
        gradeRow("Novelas", NOVELAS.map((_, index) => stationButton('data-pg-novela="' + index + '"', String(index + 1).padStart(2, "0"))).join("")) +
        gradeRow("Globo de Ouro", GLOBO.map((_, index) => stationButton('data-pg-globo="' + index + '"', String(index + 1).padStart(2, "0"))).join("")) +
        gradeRow("Live & Rare",
          '<a class="pg-st" href="/radio.html#wackentv">WackenTV</a>' +
          '<a class="pg-st" href="/radio.html#bbc-music">BBC Music</a>' +
          '<a class="pg-st" href="/radio.html#midnight-special">The Midnight Special</a>' +
          '<a class="pg-st" href="/radio.html#live-aid">Live Aid</a>') +
        "<h3>Rádios do Mundo</h3><div class=\"pg-world\" id=\"pg-world-list\"></div>" +
        (showLive
          ? '<div class="pg-live-find"><input id="pg-live-q" type="search" placeholder="Buscar no Live & Rare" aria-label="Buscar no Live & Rare"></div><div id="pg-live-list"></div>'
          : "") +
      "</div>";
    const mast = $("pr-mast");
    if (mast && mast.parentNode) mast.insertAdjacentElement("afterend", bar);
    else document.body.insertBefore(bar, document.body.firstChild);
    $("pg-porta-play").addEventListener("click", toggle);
    $("pg-porta-volume").addEventListener("input", (event) => {
      const value = Number(event.target.value);
      qsa("audio").forEach((audio) => { audio.volume = value; });
    });
    loadWorld();
    if (showLive) loadLive();
  }

  function resume() {
    const item = saved();
    if (!item || !item.name) return;
    mark(item.id);
    const ui = nodes();
    owned = {
      kind: item.kind || "url",
      chooseId: item.id,
      name: item.name,
      note: item.note,
      url: item.url,
      hls: !!item.hls,
      live: false
    };
    /* A seleção sobrevive ao reload. O elemento de áudio, não. */
    if ((item.kind === "url" || !item.kind) && item.url && ui.audio && !item.hls) {
      ui.audio.dataset.pgDoor = "1";
      owned.media = ui.audio;
      try { ui.audio.src = item.url; } catch (_) {}
    }
    paint(item.name, item.note, "TOQUE PARA CONTINUAR");
  }

  document.addEventListener("click", (event) => {
    const chooseButton = event.target.closest("[data-pg-choose]");
    if (chooseButton && (chooseButton.closest("#pg-porta") || chooseButton.closest(".ouv-doors"))) {
      event.preventDefault();
      choose(chooseButton.getAttribute("data-pg-choose"));
      return;
    }
    const metal = event.target.closest("[data-pg-metal]");
    if (metal) { playMetal(metal.getAttribute("data-pg-metal")); return; }
    const eight = event.target.closest("[data-pg-80s]");
    if (eight) { playEighties(eight.getAttribute("data-pg-80s")); return; }
    const novela = event.target.closest("[data-pg-novela]");
    if (novela) { playNovela(Number(novela.getAttribute("data-pg-novela"))); return; }
    const globo = event.target.closest("[data-pg-globo]");
    if (globo) { playGlobo(Number(globo.getAttribute("data-pg-globo"))); return; }
    const live = event.target.closest("[data-pg-live]");
    if (live) { playLive(Number(live.getAttribute("data-pg-live"))); return; }
    const world = event.target.closest("[data-pg-world]");
    if (world && worldCache) {
      const station = worldCache.find((item) => item.id === world.getAttribute("data-pg-world"));
      if (!station) return;
      const place = PLACE[station.id] ? PLACE[station.id][1] : station.terms;
      playUrl({ chooseId: "world", name: station.name.replace(/™/g, ""), note: place, url: station.url, hls: /\.m3u8(?:$|[?#])/i.test(station.url) });
      closeMenus();
      return;
    }
    const pressed = event.target.closest("#pg-porta button[data-pg-metal], #pg-porta button[data-pg-80s], #pg-porta button[data-pg-choose], #pg-porta button[data-pg-novela], #pg-porta button[data-pg-globo], #pg-porta button[data-pg-world], #pg-porta button[data-pg-live]");
    if (pressed) {
      qsa("#pg-porta button[aria-pressed='true']").forEach((el) => el.setAttribute("aria-pressed", "false"));
      pressed.setAttribute("aria-pressed", "true");
    }
    if (event.target.closest("#pg-porta, #pg-porta-player, #passport-player")) return;
  });

  document.addEventListener("input", (event) => {
    if (event.target.id === "pg-world-q") paintWorld(event.target.value);
    if (event.target.id === "pg-live-q") loadLive();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenus();
  });

  document.addEventListener("playing", (event) => {
    const media = event.target;
    if (!(media instanceof HTMLMediaElement) || !owned) return;
    if (owned.media === media || owned.external === media) {
      paint(owned.name, owned.note, "TOCANDO");
      remember({ live: true });
    }
  }, true);

  document.addEventListener("pause", (event) => {
    const media = event.target;
    if (!(media instanceof HTMLMediaElement) || !owned) return;
    if ((owned.media === media || owned.external === media) && media.paused) {
      if (Date.now() - arming < 700) return;
      paint(owned.name, owned.note, "PAUSADO");
      remember({ live: false });
    }
  }, true);

  document.addEventListener("play", (event) => {
    const media = event.target;
    if (!(media instanceof HTMLMediaElement)) return;
    const ui = nodes();
    if (ui.audio && media !== ui.audio && !ui.audio.paused && media.dataset.pgDoor !== "1") ui.audio.pause();
  }, true);

  function boot() {
    mount();
    hookMotor();
    const late = saved();
    if (!late) scrub();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  window.addEventListener("load", () => {
    hookMotor();
    resume();
    scrub();
    setTimeout(scrub, 400);
  });

  window.PassportPorta = { choose, toggle, close: closeMenus };
})();
