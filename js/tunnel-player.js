/* PASSPORT RADIO · UNDERGROUND TUNNEL PLAYER
   One engine, one state machine, playlist catalog kept outside this file.
   Runs only on body.live-page + #player.
*/
(() => {
  "use strict";

  if (!document.body.classList.contains("live-page")) return;
  const host = document.getElementById("player");
  if (!host) return;

  const catalog = Array.isArray(window.PASSPORT_TUNNEL_PLAYLISTS)
    ? window.PASSPORT_TUNNEL_PLAYLISTS.filter(x => x && x.id)
    : [];
  if (!catalog.length) return;

  const old = host.querySelector(".audio-player");
  const oldAudio = document.getElementById("passportAudio");
  if (oldAudio) { try { oldAudio.pause(); } catch (_) {} }
  if (old) old.remove();

  const style = document.createElement("style");
  style.textContent = `
    .tunnel-stage{position:relative;margin-top:18px;border:1px solid #303030;background:#090909;overflow:hidden}
    .tunnel-engine{position:fixed!important;left:-10000px!important;top:0!important;width:480px!important;height:270px!important;opacity:.01!important;pointer-events:none!important;z-index:-1!important}
    .tunnel-engine iframe{width:480px!important;height:270px!important;border:0!important;pointer-events:none!important}
    .tunnel-visual{position:relative;min-height:178px;display:flex;align-items:flex-end;padding:20px;overflow:hidden;background:radial-gradient(ellipse at 50% 55%,#292929 0,#171717 24%,#0b0b0b 52%,#050505 76%,#020202 100%)}
    .tunnel-visual:before{content:"";position:absolute;inset:-40%;background:repeating-radial-gradient(ellipse at center,transparent 0 22px,rgba(255,255,255,.035) 23px 24px,transparent 25px 44px);transform:scaleY(.42);animation:tunnelPulse 4s linear infinite;pointer-events:none}
    .tunnel-visual:after{content:"";position:absolute;left:50%;top:50%;width:8px;height:8px;border-radius:50%;background:#d71920;box-shadow:0 0 20px 5px rgba(215,25,32,.5);transform:translate(-50%,-50%)}
    @keyframes tunnelPulse{from{transform:scaleY(.42) scale(.82)}to{transform:scaleY(.42) scale(1.18)}}
    .tunnel-copy{position:relative;z-index:2;max-width:90%}.tunnel-kicker,.tunnel-brand{color:#d71920;font-size:.54rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.tunnel-title{margin-top:7px;color:#fff;font-size:clamp(1.05rem,3vw,1.8rem);font-weight:900;line-height:1.04}.tunnel-meta,.tunnel-sub{margin-top:6px;color:#888;font-size:.58rem}.tunnel-console{padding:15px;border-top:1px solid #262626}.tunnel-brand{display:flex;justify-content:space-between;gap:12px}.tunnel-controls{display:grid;grid-template-columns:auto auto auto 1fr;gap:9px;align-items:center;margin-top:14px}.tunnel-btn{width:38px;height:38px;border:1px solid #444;border-radius:50%;background:#171717;color:#fff;cursor:pointer;font-weight:900}.tunnel-btn--play{width:48px;height:48px;border-color:#d71920;background:#d71920}.tunnel-progress{width:100%;accent-color:#d71920}.tunnel-diagnostic{margin-top:8px;color:#666;font-size:.52rem;font-variant-numeric:tabular-nums}
    @media(max-width:560px){.tunnel-controls{grid-template-columns:auto auto auto}.tunnel-progress{grid-column:1/-1}}
  `;
  document.head.appendChild(style);

  const stage = document.createElement("div");
  stage.className = "tunnel-stage";
  stage.innerHTML = `
    <div class="tunnel-engine" aria-hidden="true"><div id="passport-tunnel-engine"></div></div>
    <div class="tunnel-visual"><div class="tunnel-copy">
      <div class="tunnel-kicker">LIVE & RARE · PASSPORT RADIO</div>
      <div class="tunnel-title" id="tunnelTitle">Carregando acervo…</div>
      <div class="tunnel-meta" id="tunnelMeta">UNDERGROUND AUDIO TUNNEL</div>
    </div></div>
    <div class="tunnel-console">
      <div class="tunnel-brand"><span>LIVE & RARE · PASSPORT RADIO</span><span id="tunnelStatus">LOADING</span></div>
      <div class="tunnel-title" id="tunnelConsoleTitle">Underground Archive</div>
      <div class="tunnel-sub" id="tunnelConsoleMeta">Playlist 1/${catalog.length}</div>
      <div class="tunnel-controls">
        <button class="tunnel-btn" id="tunnelPrev" type="button" aria-label="Anterior">◀</button>
        <button class="tunnel-btn tunnel-btn--play" id="tunnelPlay" type="button" aria-label="Reproduzir">▶</button>
        <button class="tunnel-btn" id="tunnelNext" type="button" aria-label="Próxima">▶</button>
        <input class="tunnel-progress" id="tunnelProgress" type="range" min="0" max="100" step=".1" value="0" aria-label="Progresso">
      </div>
      <div class="tunnel-diagnostic" id="tunnelDiagnostic">playlist 1/${catalog.length} · faixa ?/?</div>
    </div>`;
  host.appendChild(stage);

  const $ = id => document.getElementById(id);
  const ui = {
    title: $("tunnelTitle"), meta: $("tunnelMeta"), status: $("tunnelStatus"),
    consoleTitle: $("tunnelConsoleTitle"), consoleMeta: $("tunnelConsoleMeta"),
    play: $("tunnelPlay"), prev: $("tunnelPrev"), next: $("tunnelNext"),
    progress: $("tunnelProgress"), diagnostic: $("tunnelDiagnostic")
  };

  let yt = null;
  let ready = false;
  let desiredPlay = false;
  let playlistIndex = 0;
  let playlistSize = 0;
  let lastKnownItemIndex = 0;
  let progressTimer = null;
  let loadToken = 0;
  let errorGuard = false;

  function currentSource() { return catalog[playlistIndex] || catalog[0]; }
  function getIndex() {
    const n = yt && yt.getPlaylistIndex ? Number(yt.getPlaylistIndex()) : NaN;
    return Number.isFinite(n) && n >= 0 ? n : lastKnownItemIndex;
  }
  function getSize() {
    const list = yt && yt.getPlaylist ? yt.getPlaylist() : [];
    if (Array.isArray(list) && list.length) playlistSize = list.length;
    return playlistSize;
  }
  function paintDiagnostic() {
    const idx = getIndex();
    const size = getSize();
    lastKnownItemIndex = idx;
    const label = size ? `${idx + 1}/${size}` : `${idx + 1}/?`;
    ui.diagnostic.textContent = `playlist ${playlistIndex + 1}/${catalog.length} · faixa ${label}`;
    ui.consoleMeta.textContent = `${currentSource().label || currentSource().group || "Playlist"} · ${playlistIndex + 1}/${catalog.length} · ${label}`;
  }
  function syncMetadata() {
    if (!ready || !yt) return;
    const data = yt.getVideoData ? yt.getVideoData() : {};
    const title = data && data.title ? String(data.title).replace(/\s+-\s+YouTube$/i, "").trim() : "Underground Archive";
    ui.title.textContent = title;
    ui.consoleTitle.textContent = title;
    ui.meta.textContent = `${currentSource().group || "LIVE ARCHIVE"} · UNDERGROUND AUDIO TUNNEL`;
    const top = $("currentTrackTitle"); if (top) top.textContent = title;
    const desc = $("currentTrackDescription"); if (desc) desc.textContent = "Passport Radio · Live & Rare · Underground Tunnel";
    const bt = $("bottomTrackTitle"); if (bt) bt.textContent = title;
    const bm = $("bottomTrackMeta"); if (bm) bm.textContent = `${currentSource().label || currentSource().group || "Playlist"} · Live & Rare`;
    paintDiagnostic();
  }
  function startProgress() {
    clearInterval(progressTimer);
    progressTimer = setInterval(() => {
      if (!ready || !yt) return;
      const dur = yt.getDuration ? yt.getDuration() : 0;
      const cur = yt.getCurrentTime ? yt.getCurrentTime() : 0;
      if (dur > 0) ui.progress.value = Math.max(0, Math.min(100, cur / dur * 100));
      paintDiagnostic();
    }, 500);
  }
  function stopProgress() { clearInterval(progressTimer); }

  function loadPlaylist(n, autoplay = false) {
    if (!ready || !yt) return;
    const my = ++loadToken;
    playlistIndex = (n + catalog.length) % catalog.length;
    playlistSize = 0;
    lastKnownItemIndex = 0;
    errorGuard = false;
    ui.status.textContent = "LOADING";
    ui.progress.value = 0;
    const src = currentSource();
    try {
      yt.cuePlaylist({ listType: "playlist", list: src.id, index: 0, startSeconds: 0, suggestedQuality: "default" });
    } catch (_) {
      if (my === loadToken) setTimeout(() => loadPlaylist(playlistIndex + 1, autoplay), 400);
      return;
    }
    const started = Date.now();
    const wait = () => {
      if (my !== loadToken || !ready) return;
      const size = getSize();
      const data = yt.getVideoData ? yt.getVideoData() : {};
      if (size > 0 && data && data.title) {
        syncMetadata();
        if (autoplay || desiredPlay) {
          desiredPlay = true;
          try { yt.unMute(); yt.setVolume(100); yt.playVideo(); } catch (_) {}
        } else {
          ui.status.textContent = "READY";
          ui.play.textContent = "▶";
        }
        return;
      }
      if (Date.now() - started > 12000) {
        loadPlaylist(playlistIndex + 1, autoplay);
        return;
      }
      setTimeout(wait, 250);
    };
    setTimeout(wait, 350);
  }

  function advance(direction) {
    if (!ready || !yt) return;
    errorGuard = false;
    desiredPlay = true;
    const idx = getIndex();
    const size = getSize();
    if (direction > 0 && size && idx >= size - 1) {
      loadPlaylist(playlistIndex + 1, true);
      return;
    }
    if (direction < 0 && idx <= 0) {
      const previous = (playlistIndex - 1 + catalog.length) % catalog.length;
      playlistIndex = previous;
      const my = ++loadToken;
      playlistSize = 0;
      ui.status.textContent = "LOADING";
      try { yt.cuePlaylist({ listType: "playlist", list: currentSource().id, index: 0 }); } catch (_) { loadPlaylist(previous, true); return; }
      const started = Date.now();
      const waitLast = () => {
        if (my !== loadToken) return;
        const size2 = getSize();
        if (size2 > 0) {
          lastKnownItemIndex = size2 - 1;
          try { yt.playVideoAt(size2 - 1); } catch (_) { loadPlaylist(previous, true); }
          return;
        }
        if (Date.now() - started > 12000) { loadPlaylist(previous, true); return; }
        setTimeout(waitLast, 250);
      };
      setTimeout(waitLast, 350);
      return;
    }
    try {
      direction > 0 ? yt.nextVideo() : yt.previousVideo();
    } catch (_) {
      direction > 0 ? loadPlaylist(playlistIndex + 1, true) : loadPlaylist(playlistIndex - 1, true);
    }
  }

  function toggle() {
    if (!ready || !yt) return;
    const state = yt.getPlayerState ? yt.getPlayerState() : -1;
    if (state === YT.PlayerState.PLAYING) {
      desiredPlay = false;
      yt.pauseVideo();
    } else {
      desiredPlay = true;
      try { yt.unMute(); yt.setVolume(100); yt.playVideo(); } catch (_) {}
    }
  }

  function makePlayer() {
    if (yt || !window.YT || !YT.Player) return;
    yt = new YT.Player("passport-tunnel-engine", {
      width: "480", height: "270",
      playerVars: { playsinline: 1, rel: 0, controls: 0, fs: 0, disablekb: 1, iv_load_policy: 3, autoplay: 0, origin: location.origin },
      events: {
        onReady: () => { ready = true; loadPlaylist(0, false); },
        onStateChange: e => {
          if (!ready) return;
          if (e.data === YT.PlayerState.CUED) {
            syncMetadata();
            ui.status.textContent = desiredPlay ? "LOADING" : "READY";
            if (!desiredPlay) ui.play.textContent = "▶";
          } else if (e.data === YT.PlayerState.PLAYING) {
            errorGuard = false;
            syncMetadata();
            ui.status.textContent = "PLAYING";
            ui.play.textContent = "Ⅱ";
            startProgress();
          } else if (e.data === YT.PlayerState.PAUSED) {
            syncMetadata();
            ui.status.textContent = "PAUSED";
            ui.play.textContent = "▶";
            stopProgress();
          } else if (e.data === YT.PlayerState.ENDED) {
            stopProgress();
            advance(1);
          }
        },
        onError: () => {
          if (errorGuard) return;
          errorGuard = true;
          ui.status.textContent = "SKIPPED";
          setTimeout(() => { errorGuard = false; advance(1); }, 500);
        }
      }
    });
  }

  function loadApi() {
    if (window.YT && YT.Player) { makePlayer(); return; }
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { if (typeof previous === "function") previous(); makePlayer(); };
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(s);
    }
  }

  ui.play.addEventListener("click", toggle);
  ui.prev.addEventListener("click", () => advance(-1));
  ui.next.addEventListener("click", () => advance(1));
  ui.progress.addEventListener("input", () => {
    if (!ready || !yt) return;
    const dur = yt.getDuration ? yt.getDuration() : 0;
    if (dur > 0) yt.seekTo(Number(ui.progress.value) / 100 * dur, true);
  });

  const bottomPlay = $("bottomPlay");
  const bottomNext = $("bottomNext");
  if (bottomPlay) bottomPlay.addEventListener("click", e => { e.stopImmediatePropagation(); toggle(); }, { capture: true });
  if (bottomNext) bottomNext.addEventListener("click", e => { e.stopImmediatePropagation(); advance(1); }, { capture: true });

  loadApi();
})();