/* Qwen Home babies adapter — reuse existing stream/YT contracts. No invented URLs. */
(() => {
  "use strict";

  const HOUSES = [
    {
      id: "continuous",
      name: "Continuous Signals™",
      kids: [
        { id: "metal", name: "Metal", kind: "audio", src: "https://mediaserv68.live-streams.nl:18012/OnlyLive" },
        { id: "unplugged1", name: "Unplugged I", kind: "audio", src: "https://streams.radio7.de/unplugged/mp3-192/web/" },
        { id: "unplugged2", name: "Unplugged II", kind: "audio", src: "https://stream.regenbogen.de/unplugged/mp3-128/stream.regenbogen.de/" },
        { id: "heavy", name: "Heavy Metal", kind: "audio", src: "https://streaming.viphosting.cl/8012/stream" },
        { id: "gothic", name: "Gothic Passport", kind: "audio", src: "https://streams.radio.co/s62583474c/listen" },
        { id: "livejam", name: "Live Jam", kind: "audio", src: "https://stations.radio-host.com/proxy/livejam/stream" }
      ]
    },
    {
      id: "eighties",
      name: "80s Tunnel™",
      kids: [
        { id: "80s-pop", name: "Pop 80s", kind: "audio", src: "https://listen.181fm.com/181-awesome80s_128k.mp3" },
        { id: "80s-lite", name: "Lite 80s", kind: "audio", src: "https://listen.181fm.com/181-lite80s_128k.mp3" },
        { id: "80s-country", name: "80s Country", kind: "audio", src: "https://listen.181fm.com/181-80scountry_128k.mp3" },
        { id: "80s-lite-rnb", name: "80s Lite R&B", kind: "audio", src: "https://listen.181fm.com/181-80sliternb_128k.mp3" },
        { id: "80s-rnb", name: "80s R&B", kind: "audio", src: "https://listen.181fm.com/181-80srnb_128k.mp3" },
        { id: "80s-hair", name: "Hair Band", kind: "audio", src: "https://listen.181fm.com/181-hairband_128k.mp3" }
      ]
    },
    {
      id: "world",
      name: "World Dial™",
      kids: [
        { id: "py", name: "Radio Paraguay", kind: "audio", src: "https://cp9.serverse.com/proxy/rockandpop/stream" },
        { id: "fr", name: "Radio France", kind: "audio", src: "https://ouifm.ice.infomaniak.ch/ouifm-high.mp3" },
        { id: "qc", name: "Radio Québec", kind: "audio", src: "https://stream.statsradio.com:8050/stream" },
        { id: "kr", name: "Korea", kind: "audio", src: "https://antares.dribbcast.com/proxy/kpop?mp=/s" },
        { id: "tr", name: "Türkiye Müzik", kind: "audio", src: "https://yayin5.radyohizmeti.com/8090/stream;" },
        { id: "cn", name: "China", kind: "audio", src: "https://lhttp.qingting.fm/live/4804/64k.mp3" },
        { id: "ua", name: "Ukraine", kind: "audio", src: "https://tavr.tvstitch.com/HitFM?.mp3" },
        { id: "ir", name: "Iran", kind: "audio", src: "https://radio.avazfarsi.com:8000/radio.mp3" },
        { id: "ve", name: "Radio Venezuela", kind: "audio", src: "https://acp4.lorini.net:2050/stream" },
        { id: "za", name: "Rádio África", kind: "audio", src: "https://edge.iono.fm/xice/jacarandafm_live_medium.aac" }
      ]
    },
    {
      id: "liverare",
      name: "Live & Rare™",
      kids: [
        { id: "lr-engine", name: "Live & Rare (motor YouTube real)", kind: "youtube-house", note: "usa tunnel-player.js na casa /radio-live-rare.html — não converte YT em MP3" }
      ]
    },
    {
      id: "mpb", name: "MPB Tunnel™",
      kids: [{ id: "mpb1", name: "Rádio Só MPB", kind: "audio", src: "https://srv1.braudio.com.br:7008/;" }]
    },
    {
      id: "jovem", name: "Jovem Guarda™",
      kids: [{ id: "jg1", name: "Jovem Guarda HLS", kind: "hls", src: "https://stream.vagalume.fm/hls/1520610873192520.m3u8" }]
    },
    {
      id: "rockbr", name: "Rock Brasil Tunnel™",
      kids: [{ id: "rbr1", name: "Rock Brasil", kind: "audio", src: "https://s01.brascast.com:7054/live" }]
    },
    {
      id: "hits", name: "Passport Hits Tunnel™",
      kids: [{ id: "hits1", name: "Power Hits", kind: "audio", src: "https://listen.181fm.com/181-power_128k.mp3" }]
    },
    {
      id: "disco", name: "World Disco Deutschland™",
      kids: [{ id: "disco1", name: "0N Disco", kind: "audio", src: "https://0n-disco.radionetz.de/0n-disco.mp3" }]
    },
    {
      id: "soul", name: "Soul Tunnel™",
      kids: [{ id: "soul1", name: "Total Soul", kind: "audio", src: "https://onair7.xdevel.com/proxy/xautocloud_atvn_1069?mp=%2F%3B1%2F" }]
    },
    {
      id: "flash", name: "Flash House Tunnel™",
      kids: [{ id: "flash1", name: "Top Radio", kind: "audio", src: "https://playerservices.streamtheworld.com/api/livestream-redirect/TOP_RADIO.mp3" }]
    },
    {
      id: "reggae", name: "World Tunnel Reggae™",
      kids: [{ id: "reg1", name: "0N Reggae", kind: "audio", src: "https://0n-reggae.radionetz.de/0n-reggae.mp3" }]
    },
    {
      id: "nostalgia", name: "Nostalgia Passport™",
      kids: [{ id: "nos1", name: "Nostalgia", kind: "audio", src: "https://centova2.euroti.com.br:20062/;" }]
    },
    {
      id: "golden", name: "50s & 60s Tunnel™",
      kids: [{ id: "5060", name: "Good Time", kind: "audio", src: "https://listen.181fm.com/181-goodtime_128k.mp3" }]
    },
    {
      id: "novelas", name: "Novelas™",
      kids: [
        { id: "nov1", name: "01 · Trilha 1", kind: "yt-list", src: "PL74FzgX6Wbls4sJiOZfPg5INFEiNJOmbb" },
        { id: "nov2", name: "02 · Trilha 2", kind: "yt-list", src: "PLmgkGSqOPCzuxlATw8oZmimIJzhKvykK0" },
        { id: "nov3", name: "03 · Trilha 3", kind: "yt-list", src: "PL7X8pld-Y43YMbL3HCFjnJeB4qFX9sjrN" }
      ]
    },
    {
      id: "globo", name: "Globo de Ouro™",
      kids: [
        { id: "g1", name: "Arquivo 1", kind: "yt-video", src: "E5uyPR8Zb9A" },
        { id: "g2", name: "Arquivo 2", kind: "yt-video", src: "zjxnOpUnRis" },
        { id: "g3", name: "Arquivo 3", kind: "yt-video", src: "mgIl2h7rr7E" },
        { id: "g4", name: "Arquivo 4", kind: "yt-video", src: "FwcHnyEPzEY" },
        { id: "g5", name: "Arquivo 5", kind: "yt-video", src: "T-cindr--4c" }
      ]
    }
  ];

  const audio = document.getElementById("audio");
  const playBtn = document.getElementById("play");
  const vol = document.getElementById("qwen-vol");
  const track = document.getElementById("track");
  const meta = document.getElementById("meta");
  const state = document.getElementById("state");
  const parentsEl = document.getElementById("qwen-parents");
  const kidsEl = document.getElementById("qwen-kids");
  const ytHost = document.getElementById("qwen-yt");

  if (!audio || !playBtn || !parentsEl || !kidsEl) return;

  let parent = HOUSES[0];
  let baby = parent.kids[0];
  let hls;
  let ytPlayer;
  let wantPlay = false;

  function busClaim() {
    try { window.PassportBus && window.PassportBus.claim(window); } catch (_) {}
  }
  function busSilenceOthers() {
    try { window.PassportBus && window.PassportBus.silence && window.PassportBus.silence(); } catch (_) {}
  }

  function stopAll() {
    wantPlay = false;
    try { audio.pause(); audio.removeAttribute("src"); audio.load(); } catch (_) {}
    if (hls) { try { hls.destroy(); } catch (_) {} hls = null; }
    if (ytPlayer && ytPlayer.pauseVideo) try { ytPlayer.pauseVideo(); } catch (_) {}
    busSilenceOthers();
    paint(false);
  }

  function paint(playing) {
    if (track) track.textContent = baby.name;
    if (meta) meta.textContent = "Passport Radio · " + parent.name;
    if (state) state.textContent = playing ? "NO AR" : (wantPlay ? "CONECTANDO" : "PRONTO");
    playBtn.textContent = playing ? "Ⅱ" : "▶";
    parentsEl.querySelectorAll("[data-parent]").forEach(b => {
      b.classList.toggle("is-on", b.dataset.parent === parent.id);
    });
    kidsEl.querySelectorAll("[data-baby]").forEach(b => {
      b.classList.toggle("is-on", b.dataset.baby === baby.id);
    });
  }

  function renderParents() {
    parentsEl.innerHTML = HOUSES.map(h =>
      `<button type="button" data-parent="${h.id}">${h.name}</button>`
    ).join("");
  }
  function renderKids() {
    kidsEl.innerHTML = parent.kids.map(k =>
      `<button type="button" data-baby="${k.id}">${k.name}</button>`
    ).join("");
  }

  function loadYT(kind, id) {
    function boot() {
      if (ytPlayer && ytPlayer.loadPlaylist) {
        if (kind === "yt-list") ytPlayer.loadPlaylist({ list: id, listType: "playlist" });
        else ytPlayer.loadVideoById(id);
        return;
      }
      ytPlayer = new window.YT.Player("qwen-yt", {
        height: "0", width: "0",
        playerVars: { autoplay: 1, playsinline: 1 },
        events: {
          onReady(e) {
            if (kind === "yt-list") e.target.loadPlaylist({ list: id, listType: "playlist" });
            else e.target.loadVideoById(id);
          },
          onStateChange(e) {
            paint(e.data === 1);
          }
        }
      });
    }
    if (window.YT && window.YT.Player) boot();
    else {
      window.onYouTubeIframeAPIReady = boot;
      if (!document.getElementById("ytapi")) {
        const s = document.createElement("script");
        s.id = "ytapi";
        s.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(s);
      }
    }
  }

  async function start() {
    busClaim();
    wantPlay = true;
    paint(false);
    if (baby.kind === "youtube-house") {
      state.textContent = "MOTOR YT NA CASA — sem URL de áudio inventada";
      return;
    }
    if (baby.kind === "yt-list" || baby.kind === "yt-video") {
      try { audio.pause(); } catch (_) {}
      loadYT(baby.kind, baby.src);
      return;
    }
    if (ytPlayer && ytPlayer.pauseVideo) try { ytPlayer.pauseVideo(); } catch (_) {}
    if (hls) { try { hls.destroy(); } catch (_) {} hls = null; }
    audio.pause();
    audio.removeAttribute("src");
    if (baby.kind === "hls" && window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls();
      hls.loadSource(baby.src);
      hls.attachMedia(audio);
    } else {
      audio.src = baby.src;
    }
    audio.volume = vol ? Number(vol.value) : 1;
    try {
      await audio.play();
      paint(true);
    } catch (err) {
      state.textContent = "BLOQUEADO / SINAL INDISPONÍVEL";
      console.error("[qwen babies]", baby.id, err);
    }
  }

  function selectParent(id, keepSound) {
    const next = HOUSES.find(h => h.id === id);
    if (!next) return;
    const was = wantPlay && !audio.paused;
    stopAll();
    parent = next;
    baby = next.kids[0];
    renderKids();
    paint(false);
    if (keepSound && was) start();
  }

  function selectBaby(id) {
    const next = parent.kids.find(k => k.id === id);
    if (!next) return;
    const resume = wantPlay || !audio.paused;
    stopAll();
    baby = next;
    paint(false);
    if (resume) start();
    else start();
  }

  playBtn.addEventListener("click", () => {
    if (!audio.paused || (ytPlayer && ytPlayer.getPlayerState && ytPlayer.getPlayerState() === 1)) {
      stopAll();
      if (ytPlayer && ytPlayer.pauseVideo) ytPlayer.pauseVideo();
      paint(false);
    } else start();
  });
  if (vol) vol.addEventListener("input", () => {
    audio.volume = Number(vol.value);
    if (ytPlayer && ytPlayer.setVolume) ytPlayer.setVolume(Number(vol.value) * 100);
  });
  audio.addEventListener("playing", () => paint(true));
  audio.addEventListener("pause", () => { if (!wantPlay) paint(false); });

  parentsEl.addEventListener("click", e => {
    const b = e.target.closest("[data-parent]");
    if (b) selectParent(b.dataset.parent, false);
  });
  kidsEl.addEventListener("click", e => {
    const b = e.target.closest("[data-baby]");
    if (b) selectBaby(b.dataset.baby);
  });

  renderParents();
  renderKids();
  paint(false);
})();
