/* PASSPORT RADIO · MPB TUNNEL
   Brazilian music signal from outside Brazil.
   Primary bridge: Brasil Best public stream, resolved through public station directories/playlists.
   Fallback bridges: Brazilian-music streams published outside Brazil.
   Visual identity remains 100% Passport Radio; provider logo/name is never rendered.
*/
(() => {
  "use strict";
  if (!document.body.classList.contains("live-page")) return;

  const baseAnchor = document.getElementById("passportSoul") || document.getElementById("passport80s");
  if (!baseAnchor) return;

  const stale = document.getElementById("passportMPB");
  if (stale) {
    stale.querySelectorAll("audio").forEach(a => {
      try { a.pause(); a.removeAttribute("src"); a.load(); } catch (_) {}
    });
    stale.remove();
  }
  document.querySelectorAll("style[data-passport-mpb-style]").forEach(el => el.remove());

  const RADIO_BROWSER_MIRRORS = [
    "https://de1.api.radio-browser.info",
    "https://fi1.api.radio-browser.info",
    "https://nl1.api.radio-browser.info"
  ];

  const PLAYLIST_ENDPOINTS = [
    { type: "m3u", url: "https://www.radios.com.br/play/playlist/142468/listen-radio.m3u" },
    { type: "pls", url: "https://www.radios.com.br/play/playlist/142468/listen-radio.pls" }
  ];

  /* Technical-only fallback signals. No third-party logo/name is rendered. */
  const FALLBACK_STREAMS = [
    "https://usa10.fastcast4u.com/paulinrio",
    "https://eu10.fastcast4u.com/iloverio"
  ];

  const style = document.createElement("style");
  style.dataset.passportMpbStyle = "1";
  style.textContent = `
    .passport-mpb-section{padding:44px 0 50px;border-bottom:1px solid #d8d0c5;background:#ece8dc;color:#101010}
    .passport-mpb-shell{width:min(calc(100% - 40px),1180px);margin:auto;display:grid;grid-template-columns:minmax(220px,.52fr) minmax(0,1.48fr);gap:42px;align-items:center}
    .passport-mpb-kicker{color:#165f47;font-size:.54rem;font-weight:900;letter-spacing:.18em;text-transform:uppercase}
    .passport-mpb-title{margin:8px 0 0;font-family:"Bebas Neue",Impact,sans-serif;font-size:clamp(2.8rem,5vw,5rem);font-weight:400;line-height:.88;letter-spacing:.01em}
    .passport-mpb-copy{max-width:360px;margin:16px 0 0;color:#6e6a60;font-size:.76rem;line-height:1.65}
    .passport-mpb-script{display:block;margin-top:23px;color:#165f47;font-family:Caveat,cursive;font-size:clamp(1.8rem,3vw,2.7rem);font-weight:600;line-height:.95;transform:rotate(-2deg)}
    .passport-mpb-card{border-radius:4px 30px 4px 30px;background:#071510;color:#fff;overflow:hidden;box-shadow:0 22px 58px rgba(20,67,51,.14)}
    .passport-mpb-cardhead{display:grid;grid-template-columns:1fr auto;gap:18px;align-items:center;padding:18px 22px;border-bottom:1px solid rgba(255,255,255,.08)}
    .passport-mpb-cardhead small{display:block;color:#e1bd57;font-size:.49rem;font-weight:900;letter-spacing:.16em;text-transform:uppercase}
    .passport-mpb-cardhead strong{display:block;margin-top:5px;font-size:.92rem;letter-spacing:-.02em}
    .passport-mpb-status{color:#aab9b2;font-size:.49rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase}
    .passport-mpb-console{display:grid;grid-template-columns:64px 1fr;gap:18px;align-items:center;padding:20px 22px;background:linear-gradient(135deg,#0d281e,#07130f)}
    .passport-mpb-play{width:64px;height:64px;border:0;border-radius:5px 25px 5px 25px;background:#1f805f;color:#fff;cursor:pointer;font-size:1.1rem;font-weight:900;box-shadow:9px -7px 0 rgba(225,189,87,.13)}
    .passport-mpb-now small{display:block;color:#80b9a5;font-size:.48rem;font-weight:900;letter-spacing:.14em;text-transform:uppercase}
    .passport-mpb-now strong{display:block;margin-top:5px;font-size:1.22rem;letter-spacing:-.035em}
    .passport-mpb-now span{display:block;margin-top:5px;color:#81948c;font-size:.55rem}
    .passport-mpb-line{height:2px;margin-top:13px;background:linear-gradient(90deg,#1f805f 0 38%,#284239 38% 100%)}
    .passport-mpb-note{padding:10px 22px 13px;border-top:1px solid rgba(255,255,255,.06);color:#70837b;font-size:.48rem;line-height:1.5;letter-spacing:.03em}
    @media(max-width:900px){.passport-mpb-shell{grid-template-columns:1fr;gap:26px}.passport-mpb-copy{max-width:540px}}
    @media(max-width:560px){.passport-mpb-section{padding:38px 0 42px}.passport-mpb-shell{width:min(calc(100% - 28px),1180px)}.passport-mpb-cardhead{padding:16px}.passport-mpb-console{padding:17px;grid-template-columns:58px 1fr}.passport-mpb-play{width:58px;height:58px}.passport-mpb-note{padding:9px 16px 11px}}
  `;
  document.head.appendChild(style);

  const section = document.createElement("section");
  section.className = "passport-mpb-section";
  section.id = "passportMPB";
  section.dataset.passportTunnelPanel = "1";
  section.setAttribute("aria-labelledby", "passportMPBHeading");
  section.innerHTML = `
    <div class="passport-mpb-shell">
      <div>
        <span class="passport-mpb-kicker">PASSPORT RADIO™ · BRAZILIAN SIGNAL</span>
        <h2 class="passport-mpb-title" id="passportMPBHeading">MPB<br>Tunnel™</h2>
        <p class="passport-mpb-copy">MPB, samba, soul brasileiro, bossa e novas gerações em um sinal contínuo de música brasileira vindo de fora do Brasil.</p>
        <span class="passport-mpb-script">the song crossed the border.</span>
      </div>
      <div class="passport-mpb-card">
        <div class="passport-mpb-cardhead">
          <div><small>WORLDWIDE · BRAZILIAN MUSIC SIGNAL</small><strong>MPB Tunnel™ · 24 Hours</strong></div>
          <span class="passport-mpb-status" id="passportMPBStatus">READY</span>
        </div>
        <div class="passport-mpb-console">
          <button class="passport-mpb-play" id="passportMPBPlay" type="button" aria-label="Reproduzir MPB Tunnel">▶</button>
          <div class="passport-mpb-now">
            <small>NOW · MPB TUNNEL™</small>
            <strong>Brazilian Music · Continuous</strong>
            <span>MPB · Samba · Brazilian Soul · Bossa · New generation</span>
            <div class="passport-mpb-line"></div>
          </div>
        </div>
        <div class="passport-mpb-note">24 HOURS · MUSIC FROM BRAZIL · SIGNAL FROM ABROAD</div>
        <audio id="passportMPBAudio" preload="none"></audio>
      </div>
    </div>`;

  const anchor = document.getElementById("passportSoul") || document.getElementById("passport80s");
  anchor.insertAdjacentElement("afterend", section);

  const audio = document.getElementById("passportMPBAudio");
  const play = document.getElementById("passportMPBPlay");
  const status = document.getElementById("passportMPBStatus");

  let candidates = [];
  let candidateIndex = 0;
  let prepared = false;
  let resolving = false;
  let retryTimer = 0;
  let userStopped = false;
  let preparePromise = null;

  function pausePassportPlayers(){
    const yt = document.getElementById("tunnelPlay");
    if (yt && (yt.textContent || "").trim() === "Ⅱ") yt.click();
    ["passport80sAudio","passportSoulAudio","passport-live-audio"].forEach(id => {
      const a = document.getElementById(id);
      if (a && !a.paused) { try { a.pause(); } catch (_) {} }
    });
  }

  function clearRetry(){
    if (retryTimer) { clearTimeout(retryTimer); retryTimer = 0; }
  }

  function uniqueHttps(urls){
    const out = [];
    urls.forEach(value => {
      const url = String(value || "").trim();
      if (!/^https:\/\//i.test(url)) return;
      if (!out.includes(url)) out.push(url);
    });
    return out;
  }

  async function fetchWithTimeout(url, ms){
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    try {
      const r = await fetch(url, { cache:"no-store", credentials:"omit", signal:controller.signal });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r;
    } finally {
      clearTimeout(timer);
    }
  }

  async function resolveBrasilBestViaDirectory(){
    for (const base of RADIO_BROWSER_MIRRORS) {
      try {
        const params = new URLSearchParams({
          name: "Brasil Best",
          countrycode: "US",
          hidebroken: "true",
          limit: "20"
        });
        const r = await fetchWithTimeout(`${base}/json/stations/search?${params}`, 4500);
        const list = await r.json();
        if (!Array.isArray(list)) continue;

        const matches = list.filter(station => {
          const name = String(station && station.name || "");
          const homepage = String(station && station.homepage || "");
          return /brasil\s*best/i.test(name) || /brasilbest\.com/i.test(homepage);
        }).sort((a,b) => {
          const homeA = /brasilbest\.com/i.test(String(a.homepage || "")) ? 1 : 0;
          const homeB = /brasilbest\.com/i.test(String(b.homepage || "")) ? 1 : 0;
          const okA = Number(a.lastcheckok || 0);
          const okB = Number(b.lastcheckok || 0);
          return (homeB - homeA) || (okB - okA);
        });

        for (const station of matches) {
          const resolved = String(station.url_resolved || station.url || "").trim();
          if (/^https:\/\//i.test(resolved)) return resolved;
        }
      } catch (_) {}
    }
    return "";
  }

  function parsePlaylist(text, type){
    const body = String(text || "").replace(/\r/g, "");
    if (type === "pls") {
      const m = body.match(/^File\d+\s*=\s*(https?:\/\/[^\s]+)\s*$/im);
      return m ? m[1].trim() : "";
    }
    const line = body.split("\n").map(x => x.trim()).find(x => /^https?:\/\//i.test(x));
    return line || "";
  }

  async function resolveBrasilBestViaPlaylist(){
    for (const item of PLAYLIST_ENDPOINTS) {
      try {
        const r = await fetchWithTimeout(item.url, 4500);
        const text = await r.text();
        const stream = parsePlaylist(text, item.type);
        if (/^https:\/\//i.test(stream)) return stream;
      } catch (_) {}
    }
    return "";
  }

  async function prepareCandidates(){
    if (prepared) return candidates;
    if (resolving && preparePromise) return preparePromise;
    resolving = true;

    let primary = await resolveBrasilBestViaDirectory();
    if (!primary) primary = await resolveBrasilBestViaPlaylist();

    candidates = uniqueHttps([primary, ...FALLBACK_STREAMS]);
    prepared = true;
    resolving = false;
    return candidates;
  }

  function loadCandidate(){
    clearRetry();
    if (!candidates.length || candidateIndex >= candidates.length) {
      status.textContent = "ERROR";
      play.textContent = "▶";
      return false;
    }
    try { audio.pause(); } catch (_) {}
    audio.src = candidates[candidateIndex];
    audio.load();
    return true;
  }

  function handlePlayFailure(error){
    clearRetry();
    if (error && error.name === "NotAllowedError") {
      status.textContent = "TAP PLAY";
      play.textContent = "▶";
      return;
    }
    tryNext();
  }

  function playCurrent(){
    if (!loadCandidate()) return;
    userStopped = false;
    status.textContent = candidateIndex ? "RETRY" : "CONNECTING";
    const p = audio.play();
    if (p && p.catch) p.catch(handlePlayFailure);
    retryTimer = setTimeout(() => {
      if (status.textContent !== "ON AIR" && !userStopped) tryNext();
    }, 9000);
  }

  function tryNext(){
    clearRetry();
    if (userStopped) return;
    candidateIndex += 1;
    if (candidateIndex >= candidates.length) {
      status.textContent = "ERROR";
      play.textContent = "▶";
      return;
    }
    playCurrent();
  }

  async function start(){
    pausePassportPlayers();
    userStopped = false;

    if (!prepared) {
      status.textContent = "LOCATING";
      try {
        if (!preparePromise) preparePromise = prepareCandidates();
        await preparePromise;
      } catch (_) {
        candidates = uniqueHttps(FALLBACK_STREAMS);
        prepared = true;
        resolving = false;
      }
      if (userStopped) return;
    }

    if (!candidates.length) {
      candidates = uniqueHttps(FALLBACK_STREAMS);
      candidateIndex = 0;
    }
    candidateIndex = Math.min(candidateIndex, Math.max(0, candidates.length - 1));
    playCurrent();
  }

  function stop(){
    userStopped = true;
    clearRetry();
    audio.pause();
    status.textContent = "PAUSED";
    play.textContent = "▶";
  }

  function toggle(){
    if (audio.paused) start();
    else stop();
  }

  audio.addEventListener("playing", () => {
    clearRetry();
    status.textContent = "ON AIR";
    play.textContent = "Ⅱ";
  });
  audio.addEventListener("pause", () => {
    if (userStopped && status.textContent !== "ERROR") status.textContent = "PAUSED";
    play.textContent = "▶";
  });
  audio.addEventListener("waiting", () => { if (!userStopped) status.textContent = "BUFFERING"; });
  audio.addEventListener("stalled", () => { if (!userStopped) status.textContent = "BUFFERING"; });
  audio.addEventListener("error", () => { if (!userStopped) tryNext(); });
  play.addEventListener("click", toggle);

  document.addEventListener("play", e => {
    if (e.target instanceof HTMLMediaElement && e.target !== audio && !audio.paused) {
      userStopped = true;
      clearRetry();
      audio.pause();
    }
  }, true);

  /* Resolve the preferred bridge while the visitor reads/scrolls, before the first tap. */
  preparePromise = prepareCandidates().catch(() => {
    candidates = uniqueHttps(FALLBACK_STREAMS);
    prepared = true;
    resolving = false;
    return candidates;
  });
})();
