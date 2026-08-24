/* PASSPORT RADIO · MPB TUNNEL
   Brazilian music signal from outside Brazil.
   Primary bridge: Brasil Best public external playlist (Radios.com.br listing 142468).
   Resilient fallbacks: independent Brazilian-music streams published outside Brazil.
   Visual identity remains 100% Passport Radio; provider branding is not rendered.
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

  const PLAYLIST_ENDPOINTS = [
    { type: "m3u", url: "https://www.radios.com.br/play/playlist/142468/listen-radio.m3u" },
    { type: "pls", url: "https://www.radios.com.br/play/playlist/142468/listen-radio.pls" }
  ];

  /* Verified public audio/mpeg fallbacks from Brazilian-music web radios abroad.
     Kept technical-only: no third-party logo/name is rendered in the Passport UI. */
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

  function parsePlaylist(text, type){
    const body = String(text || "").replace(/\r/g, "");
    if (type === "pls") {
      const m = body.match(/^File\d+\s*=\s*(https?:\/\/[^\s]+)\s*$/im);
      return m ? m[1].trim() : "";
    }
    const line = body.split("\n").map(x => x.trim()).find(x => /^https?:\/\//i.test(x));
    return line || "";
  }

  async function fetchWithTimeout(url, ms){
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    try {
      const r = await fetch(url, { cache:"no-store", credentials:"omit", signal:controller.signal });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.text();
    } finally {
      clearTimeout(timer);
    }
  }

  async function prepareCandidates(){
    if (prepared || resolving) return;
    resolving = true;
    status.textContent = "LOCATING";
    let primary = "";
    for (const item of PLAYLIST_ENDPOINTS) {
      try {
        const text = await fetchWithTimeout(item.url, 5000);
        primary = parsePlaylist(text, item.type);
        if (primary) break;
      } catch (_) {}
    }
    candidates = [...new Set([primary, ...FALLBACK_STREAMS].filter(Boolean))];
    prepared = true;
    resolving = false;
    candidateIndex = 0;
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

  function playCurrent(){
    if (!loadCandidate()) return;
    userStopped = false;
    status.textContent = candidateIndex ? "RETRY" : "CONNECTING";
    const p = audio.play();
    if (p && p.catch) p.catch(() => tryNext());
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
      await prepareCandidates();
      if (userStopped) return;
    }
    candidateIndex = Math.min(candidateIndex, Math.max(0, candidates.length - 1));
    playCurrent();
  }

  function stop(){
    userStopped = true;
    clearRetry();
    audio.pause();
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
    if (status.textContent !== "ERROR" && userStopped) status.textContent = "PAUSED";
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
})();
