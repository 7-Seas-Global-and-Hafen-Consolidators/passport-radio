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
  const $ = (id) => document.getElementById(id);

  function qs(sel) { return document.querySelector(sel); }
  function qsa(sel) { return [...document.querySelectorAll(sel)]; }

  function ensureCss() {
    if ($("pg-porta-css")) return;
    const style = document.createElement("style");
    style.id = "pg-porta-css";
    style.textContent = [
      "#pg-porta{background:#fff;color:#1a2744;border-bottom:1px solid #1a2744;position:relative;z-index:40}",
      "#pg-porta-bar{width:min(1180px,calc(100% - 28px));margin:0 auto;display:flex;align-items:center;gap:8px 18px;min-height:52px}",
      "#pg-porta-now{display:flex;align-items:center;gap:8px;border:0;background:#fff;color:#1a2744;padding:8px 0;cursor:pointer;text-align:left;min-height:44px}",
      "#pg-porta-now i{width:8px;height:8px;border-radius:50%;background:#1a2744;display:block;flex:0 0 auto}",
      "#pg-porta.is-live #pg-porta-now i{background:#c4312e}",
      "#pg-porta-now strong{display:block;font:700 15px/1.1 Georgia,'Newsreader',serif}",
      "#pg-porta-now small{display:block;font:500 12px/1.2 'Source Sans 3',sans-serif}",
      "#pg-porta-more{display:none;margin-left:auto;border:0;background:#fff;color:#1a2744;font:700 15px/1 'Source Sans 3',sans-serif;min-height:44px;padding:0 2px;cursor:pointer}",
      "#pg-porta-row{display:flex;flex-wrap:wrap;gap:0 16px;align-items:center;min-width:0}",
      "#pg-porta-row button,#pg-porta-row a{border:0;background:transparent;color:#1a2744;font:700 15px/1 'Source Sans 3',sans-serif;padding:12px 0;cursor:pointer;text-decoration:none;min-height:44px}",
      "#pg-porta-row button[aria-pressed='true']{color:#c4312e;box-shadow:inset 0 -2px 0 #c4312e}",
      "#pg-porta-row button:focus-visible,#pg-porta-now:focus-visible,#pg-porta-more:focus-visible,#pg-porta-panel button:focus-visible,#pg-porta-panel a:focus-visible,#pg-porta-panel input:focus-visible{outline:2px solid #c4312e;outline-offset:2px}",
      "#pg-porta-panel{width:min(1180px,calc(100% - 28px));margin:0 auto;padding:0 0 16px}",
      "#pg-porta-panel[hidden]{display:none!important}",
      "#pg-porta-panel p{margin:0 0 8px;font:500 15px/1.4 'Source Sans 3',sans-serif}",
      ".pg-porta-choices{display:flex;flex-direction:column}",
      ".pg-porta-choices button,.pg-porta-choices a{display:flex;justify-content:space-between;gap:12px;width:100%;text-align:left;background:#fff;color:#1a2744;border:0;border-bottom:1px solid #1a2744;min-height:48px;padding:10px 0;cursor:pointer;font:600 18px/1.3 Georgia,'Newsreader',serif;text-decoration:none}",
      ".pg-porta-choices button span,.pg-porta-choices a span{font:500 14px/1.3 'Source Sans 3',sans-serif}",
      ".pg-reg{margin:12px 0 0;font:700 12px/1 'Source Sans 3',sans-serif;letter-spacing:.08em;text-transform:uppercase}",
      "#pg-world-q,#pg-live-q{display:block;width:min(520px,100%);min-height:44px;margin:0 0 8px;border:0;border-bottom:1px solid #1a2744;background:#fff;padding:0 2px;font-size:16px;color:#1a2744}",
      "#pg-porta-player{position:fixed;left:0;right:0;bottom:0;z-index:70;display:flex;align-items:center;gap:12px;min-height:64px;padding:8px 16px;background:#fff;color:#1a2744;border-top:1px solid #1a2744}",
      "body:has(#pg-porta-player){padding-bottom:76px}",
      "#pg-porta-player img{width:44px;height:44px;object-fit:cover;flex:0 0 auto}",
      "#pg-porta-play{width:44px;height:44px;border-radius:50%;border:0;background:#c4312e;color:#fff;font-size:16px;cursor:pointer}",
      "#pg-porta-player .player-copy{display:flex;flex-direction:column;min-width:0}",
      "#pg-porta-player strong{font:600 18px/1.2 Georgia,'Newsreader',serif}",
      "#pg-porta-player small{font-size:13px}",
      "#pg-porta-expand{margin-left:auto;border:0;background:transparent;color:#1a2744;font-weight:700;min-height:44px;cursor:pointer}",
      "#pg-porta-player.is-open{flex-wrap:wrap}",
      "#pg-porta-drawer{flex:1 0 100%;padding-top:8px}",
      "#pg-porta-drawer[hidden]{display:none!important}",
      "@media (max-width:759px){#pg-porta-more{display:inline-flex!important}#pg-porta-row{display:none!important;position:absolute;left:0;right:0;top:100%;background:#fff;border-bottom:1px solid #1a2744;padding:4px 16px 10px;flex-direction:column;align-items:stretch;z-index:45}#pg-porta.is-open #pg-porta-row{display:flex!important}#pg-porta-bar{position:relative}}"
    ].join("");
    document.head.appendChild(style);
  }

  function nodes() {
    if ($("passport-player") && $("audio") && $("play")) {
      return { root: $("passport-player"), play: $("play"), track: $("track"), meta: $("meta"), state: $("state"), audio: $("audio"), home: true };
    }
    let root = $("pg-porta-player");
    if (!root) {
      root = document.createElement("div");
      root.id = "pg-porta-player";
      root.className = "player pg-now";
      root.innerHTML = '<img src="/images/passport-radio-definitive.jpg" alt="" width="44" height="44">'
        + '<button type="button" id="pg-porta-play" aria-label="Tocar ou pausar">▶</button>'
        + '<span class="player-copy"><strong id="pg-porta-track">Passport Radio</strong><small id="pg-porta-meta">Escolha uma rádio no topo</small></span>'
        + '<span class="status"><span id="pg-porta-state">PRONTO</span></span>'
        + '<button type="button" id="pg-porta-expand" aria-expanded="false">Volume</button>'
        + '<div id="pg-porta-drawer" hidden><label>Volume <input id="pg-porta-volume" type="range" min="0" max="1" step="0.05" value="0.8" aria-label="Volume"></label></div>'
        + '<audio id="pg-porta-audio" preload="none"></audio>';
      document.body.appendChild(root);
      $("pg-porta-play").addEventListener("click", toggle);
      $("pg-porta-expand").addEventListener("click", () => {
        const drawer = $("pg-porta-drawer");
        const open = drawer.hasAttribute("hidden");
        if (open) drawer.removeAttribute("hidden"); else drawer.setAttribute("hidden", "");
        root.classList.toggle("is-open", open);
        $("pg-porta-expand").setAttribute("aria-expanded", open ? "true" : "false");
      });
      $("pg-porta-volume").addEventListener("input", (event) => {
        const audio = $("pg-porta-audio");
        if (audio) audio.volume = Number(event.target.value);
      });
    }
    return { root, play: $("pg-porta-play"), track: $("pg-porta-track"), meta: $("pg-porta-meta"), state: $("pg-porta-state"), audio: $("pg-porta-audio"), home: false };
  }

  function paint(name, note, status) {
    const ui = nodes();
    if (ui.track && name) ui.track.textContent = name;
    if (ui.meta) ui.meta.textContent = note || "";
    if (ui.state && status) ui.state.textContent = status;
    const on = status === "NO AR";
    if (ui.play) ui.play.textContent = on ? "Ⅱ" : "▶";
    const nowName = $("pg-porta-now-name");
    const nowNote = $("pg-porta-now-note");
    if (nowName && name) nowName.textContent = name;
    if (nowNote) nowNote.textContent = note || "";
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
    });
    if (!owned || owned.kind === "url" || owned.kind === "motor") {
      const frame = $("pg-embed-frame");
      if (frame) frame.src = "about:blank";
    }
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
      live: true
    };
    audio.dataset.pgDoor = "1";
    if (ui.home && motor && motor.audio === audio) {
      /* o motor da Home não pode reconectar por cima desta escolha */
    }
    stopOthers(audio);
    audio.pause();
    paint(item.name, item.note, "CONECTANDO");
    remember({ live: true });
    const startNative = () => {
      audio.src = item.url;
      const volume = $("pg-home-volume") || $("pg-porta-volume");
      if (volume) audio.volume = Number(volume.value);
      audio.play().then(() => {
        paint(item.name, item.note, "NO AR");
        remember({ live: true });
      }).catch(() => {
        paint(item.name, item.note, "TOQUE PARA CONTINUAR");
        remember({ live: false });
      });
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
        audio.play().then(() => paint(item.name, item.note, "NO AR")).catch(() => paint(item.name, item.note, "TOQUE PARA CONTINUAR"));
      });
    };
    if (window.Hls) bootHls();
    else loadScript("https://cdn.jsdelivr.net/npm/hls.js@1.7.0/dist/hls.min.js").then(bootHls).catch(() => paint(item.name, item.note, "SINAL INDISPONÍVEL"));
  }

  function embed(url, name, note, chooseId, kind) {
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
    paint(name, note, "NO AR");
    remember({ live: true });
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
      if (media.paused) media.play().then(() => { paint(owned.name, owned.note, "NO AR"); remember({ live: true }); }).catch(() => paint(owned.name, owned.note, "TOQUE PARA CONTINUAR"));
      else { media.pause(); paint(owned.name, owned.note, "PAUSADO"); remember({ live: false }); }
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
    if (id === "metal") {
      openPanel("<p>Metal. Seis sinais reais. A página fica onde está.</p>" + choices(
        METAL.map((item) => '<button type="button" data-pg-metal="' + item.id + '">' + item.name + "</button>").join("")
      ));
      return;
    }
    if (id === "80s") {
      openPanel("<p>80s. Seis estações. Sem anterior e próximo.</p>" + choices(
        EIGHTIES.map((item) => '<button type="button" data-pg-80s="' + item.name + '">' + item.name + "</button>").join("")
      ));
      return;
    }
    if (id === "novelas") {
      openPanel("<p>Novelas. Nove playlists do acervo. O arquivo só publica o número, não o nome da novela.</p>" + choices(
        NOVELAS.map((item, index) => '<button type="button" data-pg-novela="' + index + '"><strong>' + String(index + 1).padStart(2, "0") + "</strong><span>playlist</span></button>").join("")
      ));
      return;
    }
    if (id === "globo") {
      openPanel("<p>Globo de Ouro. Seis programas do acervo. O motor não publica título além da ordem.</p>" + choices(
        GLOBO.map((vid, index) => '<button type="button" data-pg-globo="' + index + '"><strong>' + String(index + 1).padStart(2, "0") + "</strong><span>programa</span></button>").join("")
      ));
      return;
    }
    if (id === "world") {
      openPanel('<p>Rádios do Mundo. Só estações com transmissão nesta lista. A página não muda.</p><input id="pg-world-q" type="search" placeholder="Buscar país ou rádio" aria-label="Buscar país ou rádio"><div id="pg-world-list"></div>');
      loadWorld();
      return;
    }
    if (id === "liverare") {
      openPanel('<p>Live & Rare é acervo de performances, não uma rádio contínua.</p><input id="pg-live-q" type="search" placeholder="Buscar artista" aria-label="Buscar no acervo"><div id="pg-live-list" class="pg-porta-choices"></div>');
      loadLive();
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
      owned = { kind: "external", chooseId: "metal", name: "Metal", note: item.name, external: media, live: true };
      stopOthers(media);
      paint("Metal", item.name, "NO AR");
      remember({ live: true });
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
      const shown = q ? rows.slice(0, 40) : rows.slice(0, 12);
      list.innerHTML = shown.map((item) => '<button type="button" data-pg-live="' + item.index + '"><strong>' + item.label + "</strong><span>" + item.group + "</span></button>").join("")
        || "<p>Nenhum artista com esse texto.</p>";
      if (!q && rows.length > shown.length) {
        const more = document.createElement("p");
        more.textContent = shown.length + " de " + rows.length + " no acervo. A busca encontra o resto.";
        list.appendChild(more);
      }
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
    const place = PLACE[station.id] ? PLACE[station.id][1] : "";
    return '<button type="button" data-pg-world="' + station.id + '"><strong>' + (place || station.name.replace(/™/g, "")) + "</strong><span>" + station.name.replace(/™/g, "") + "</span></button>";
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
      list.innerHTML = choices(rows.map(worldButton).join(""));
      return;
    }
    const grouped = REGION_ORDER.map((region) => {
      const group = rows.filter((station) => PLACE[station.id] && PLACE[station.id][0] === region);
      if (!group.length) return "";
      return '<h3 class="pg-reg">' + region + "</h3>" + choices(group.map(worldButton).join(""));
    }).join("");
    const loose = rows.filter((station) => !PLACE[station.id]);
    list.innerHTML = grouped + (loose.length ? '<h3 class="pg-reg">Outras</h3>' + choices(loose.map(worldButton).join("")) : "") + '<h3 class="pg-reg">Páginas sem transmissão nesta lista</h3>' + choices(
      '<a href="/radio-bolivia.html">Bolívia<span>página editorial</span></a><a href="/radio-afghanistan.html">Afeganistão<span>página editorial</span></a>'
    );
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

  function mount() {
    if ($("pg-porta")) return;
    ensureCss();
    const nav = qs("nav.pp-nav, nav.pg-nav, nav[aria-label='Seções'], nav.pp-signal-nav");
    const bar = document.createElement("div");
    bar.id = "pg-porta";
    bar.className = "pg-porta";
    const button = (id, label) => '<button type="button" data-pg-choose="' + id + '" aria-pressed="false">' + label + "</button>";
    bar.innerHTML = '<div id="pg-porta-bar"><button type="button" id="pg-porta-now" aria-label="Tocar ou pausar a seleção"><i aria-hidden="true"></i><span><strong id="pg-porta-now-name">Escolha</strong><small id="pg-porta-now-note">uma rádio</small></span></button><button type="button" id="pg-porta-more" aria-expanded="false" aria-controls="pg-porta-row">Rádios</button><div id="pg-porta-row" role="group" aria-label="Rádios da Passport">'
      + PRIMARY.map(([id, label]) => button(id, label)).join("")
      + MORE.map(([id, label]) => button(id, label)).join("")
      + '<a href="/radio.html">Todas</a></div></div><div id="pg-porta-panel" class="pg-porta-panel" hidden></div>';
    if (nav && nav.parentNode) nav.insertAdjacentElement("afterend", bar);
    else document.body.insertBefore(bar, document.body.firstChild);
    $("pg-porta-now").addEventListener("click", toggle);
    $("pg-porta-more").addEventListener("click", () => {
      const open = !bar.classList.contains("is-open");
      bar.classList.toggle("is-open", open);
      $("pg-porta-more").setAttribute("aria-expanded", open ? "true" : "false");
      if (!open) closePanel();
    });
    nodes();
  }

  function resume() {
    const item = saved();
    if (!item || !item.name) return;
    mark(item.id);
    if (item.kind === "url" && item.url) {
      const ui = nodes();
      ui.audio.dataset.pgDoor = "1";
      owned = { kind: "url", chooseId: item.id, name: item.name, note: item.note, url: item.url, hls: item.hls, media: ui.audio, live: false };
      paint(item.name, item.note, item.live ? "CONECTANDO" : "PAUSADO");
      if (!item.live) {
        ui.audio.src = item.url;
        return;
      }
      playUrl({ chooseId: item.id, name: item.name, note: item.note, url: item.url, hls: item.hls });
      return;
    }
    paint(item.name, item.note, "TOQUE PARA CONTINUAR");
    owned = { kind: item.kind, chooseId: item.id, name: item.name, note: item.note, url: item.url, live: false };
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
    if (event.target.closest("#pg-porta, #pg-porta-player, #passport-player")) return;
  });

  document.addEventListener("input", (event) => {
    if (event.target.id === "pg-world-q") paintWorld(event.target.value);
    if (event.target.id === "pg-live-q") {
      const q = event.target.value;
      const list = $("pg-live-list");
      if (!list || !liveCache) return;
      const rows = liveCache.filter((item) => (item.label + " " + item.group).toLowerCase().indexOf(q.trim().toLowerCase()) !== -1).slice(0, 40);
      list.innerHTML = rows.map((item) => '<button type="button" data-pg-live="' + item.index + '"><strong>' + item.label + "</strong><span>" + item.group + "</span></button>").join("") || "<p>Nenhum artista com esse texto.</p>";
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenus();
  });

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
