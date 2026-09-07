/* PASSPORT RADIO · MPB TUNNEL™
   Dedicated Brazilian MPB signal.
   Current motor: Rádio Só MPB · Sorocaba/SP · 100% Brasil.
   Native panel/orchestration contract remains unchanged.
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

  /* Resolve the station on demand, like BR Tunnel™: directory playlist first,
     verified direct route second. Re-resolve after failures instead of pinning
     a stale stream forever. */
  const PLAYLISTS = [
    { type: "m3u", url: "https://www.radios.com.br/play/playlist/40663/listen-radio.m3u" },
    { type: "pls", url: "https://www.radios.com.br/play/playlist/40663/listen-radio.pls" }
  ];
  const VERIFIED_DIRECT = "https://srv1.braudio.com.br:7008/";
  const RETRY_DELAYS = [1500, 3500, 7000, 12000];

  const style = document.createElement("style");
  style.dataset.passportMpbStyle = "1";
  style.textContent = `.passport-mpb-section{padding:44px 0 50px;border-bottom:1px solid #d8d0c5;background:#ece8dc;color:#101010}.passport-mpb-shell{width:min(calc(100% - 40px),1180px);margin:auto;display:grid;grid-template-columns:minmax(220px,.52fr) minmax(0,1.48fr);gap:42px;align-items:center}.passport-mpb-kicker{color:#165f47;font-size:.54rem;font-weight:900;letter-spacing:.18em;text-transform:uppercase}.passport-mpb-title{margin:8px 0 0;font-family:"Bebas Neue",Impact,sans-serif;font-size:clamp(2.8rem,5vw,5rem);font-weight:400;line-height:.88}.passport-mpb-copy{max-width:360px;margin:16px 0 0;color:#6e6a60;font-size:.76rem;line-height:1.65}.passport-mpb-script{display:block;margin-top:23px;color:#165f47;font-family:Caveat,cursive;font-size:clamp(1.8rem,3vw,2.7rem);font-weight:600}.passport-mpb-card{border-radius:4px 30px 4px 30px;background:#071510;color:#fff;overflow:hidden;box-shadow:0 22px 58px rgba(20,67,51,.14)}.passport-mpb-cardhead{display:grid;grid-template-columns:1fr auto;gap:18px;align-items:center;padding:18px 22px;border-bottom:1px solid rgba(255,255,255,.08)}.passport-mpb-cardhead small{display:block;color:#e1bd57;font-size:.49rem;font-weight:900;letter-spacing:.16em;text-transform:uppercase}.passport-mpb-cardhead strong{display:block;margin-top:5px;font-size:.92rem}.passport-mpb-status{color:#aab9b2;font-size:.49rem;font-weight:900;letter-spacing:.12em}.passport-mpb-console{display:grid;grid-template-columns:64px 1fr;gap:18px;align-items:center;padding:20px 22px;background:linear-gradient(135deg,#0d281e,#07130f)}.passport-mpb-play{width:64px;height:64px;border:0;border-radius:5px 25px 5px 25px;background:#1f805f;color:#fff;cursor:pointer;font-size:1.1rem;font-weight:900}.passport-mpb-now small{display:block;color:#80b9a5;font-size:.48rem;font-weight:900;letter-spacing:.14em}.passport-mpb-now strong{display:block;margin-top:5px;font-size:1.22rem}.passport-mpb-now span{display:block;margin-top:5px;color:#81948c;font-size:.55rem}.passport-mpb-line{height:2px;margin-top:13px;background:linear-gradient(90deg,#1f805f 0 38%,#284239 38% 100%)}.passport-mpb-note{padding:10px 22px 13px;border-top:1px solid rgba(255,255,255,.06);color:#70837b;font-size:.48rem}@media(max-width:900px){.passport-mpb-shell{grid-template-columns:1fr;gap:26px}}@media(max-width:560px){.passport-mpb-section{padding:38px 0 42px}.passport-mpb-shell{width:min(calc(100% - 28px),1180px)}}`;
  document.head.appendChild(style);

  const section = document.createElement("section");
  section.className = "passport-mpb-section";
  section.id = "passportMPB";
  section.dataset.passportTunnelPanel = "1";
  section.setAttribute("aria-labelledby", "passportMPBHeading");
  section.innerHTML = `<div class="passport-mpb-shell"><div><span class="passport-mpb-kicker">PASSPORT RADIO™ · BRAZILIAN SIGNAL</span><h2 class="passport-mpb-title" id="passportMPBHeading">MPB<br>Tunnel™</h2><p class="passport-mpb-copy">MPB atravessando gerações: grandes vozes, compositores, bossa, samba e novas cenas em sinal contínuo.</p><span class="passport-mpb-script">música brasileira, sem fronteiras.</span></div><div class="passport-mpb-card"><div class="passport-mpb-cardhead"><div><small>PASSPORT RADIO™ · BRAZILIAN MUSIC SIGNAL</small><strong>MPB Tunnel™ · 24 Hours</strong></div><span class="passport-mpb-status" id="passportMPBStatus">READY</span></div><div class="passport-mpb-console"><button class="passport-mpb-play" id="passportMPBPlay" type="button" aria-label="Reproduzir MPB Tunnel">▶</button><div class="passport-mpb-now"><small>NOW · MPB TUNNEL™</small><strong>MPB · Continuous</strong><span>Música Popular Brasileira · 24H</span><div class="passport-mpb-line"></div></div></div><div class="passport-mpb-note">24 HOURS · MÚSICA BRASILEIRA · SINAL CONTÍNUO</div><audio id="passportMPBAudio" preload="none"></audio></div></div>`;
  baseAnchor.insertAdjacentElement("afterend", section);

  const audio = document.getElementById("passportMPBAudio");
  const play = document.getElementById("passportMPBPlay");
  const status = document.getElementById("passportMPBStatus");
  if (!audio || !play || !status) return;

  let userStopped = true;
  let resolvedStream = "";
  let retryTimer = 0;
  let retryIndex = 0;
  let resolving = null;

  function clearRetry() {
    if (retryTimer) clearTimeout(retryTimer);
    retryTimer = 0;
  }

  function pauseOthers() {
    const yt = document.getElementById("tunnelPlay");
    if (yt && (yt.textContent || "").trim() === "Ⅱ") yt.click();
    document.querySelectorAll("audio,video").forEach(media => {
      if (media !== audio && !media.paused) {
        try { media.pause(); } catch (_) {}
      }
    });
  }

  async function fetchText(url, timeout = 5000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, { cache: "no-store", credentials: "omit", signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.text();
    } finally {
      clearTimeout(timer);
    }
  }

  function parsePlaylist(text, type) {
    const body = String(text || "").replace(/\r/g, "");
    if (type === "pls") {
      const match = body.match(/^File\d+\s*=\s*(https?:\/\/[^\s]+)\s*$/im);
      return match ? match[1].trim() : "";
    }
    return body.split("\n").map(line => line.trim()).find(line => /^https?:\/\//i.test(line)) || "";
  }

  async function resolveStream(force = false) {
    if (!force && resolvedStream) return resolvedStream;
    if (resolving) return resolving;
    resolving = (async () => {
      for (const playlist of PLAYLISTS) {
        try {
          const text = await fetchText(playlist.url);
          const candidate = parsePlaylist(text, playlist.type);
          if (/^https:\/\//i.test(candidate)) {
            resolvedStream = candidate;
            return candidate;
          }
        } catch (_) {}
      }
      resolvedStream = VERIFIED_DIRECT;
      return resolvedStream;
    })();
    try { return await resolving; }
    finally { resolving = null; }
  }

  async function connect(forceResolve = false) {
    if (userStopped) return;
    clearRetry();
    status.textContent = "CONNECTING";
    try {
      const stream = await resolveStream(forceResolve);
      if (!stream) throw new Error("MPB stream unavailable");
      if (audio.src !== stream) {
        audio.src = stream;
        audio.load();
      }
      await audio.play();
    } catch (error) {
      console.warn("[Passport MPB Tunnel] connect failed", error);
      scheduleRetry(true);
    }
  }

  function scheduleRetry(forceResolve = false) {
    if (userStopped || retryTimer) return;
    const delay = RETRY_DELAYS[Math.min(retryIndex, RETRY_DELAYS.length - 1)];
    retryIndex += 1;
    status.textContent = "RECONNECTING";
    play.textContent = "Ⅱ";
    retryTimer = setTimeout(() => {
      retryTimer = 0;
      connect(forceResolve);
    }, delay);
  }

  function start() {
    pauseOthers();
    userStopped = false;
    retryIndex = 0;
    connect(false);
  }

  function stop() {
    userStopped = true;
    clearRetry();
    try { audio.pause(); } catch (_) {}
    status.textContent = "PAUSED";
    play.textContent = "▶";
    play.setAttribute("aria-label", "Reproduzir MPB Tunnel");
  }

  play.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();
    if (!userStopped && (!audio.paused || retryTimer)) stop();
    else start();
  });

  audio.addEventListener("playing", () => {
    clearRetry();
    retryIndex = 0;
    status.textContent = "ON AIR";
    play.textContent = "Ⅱ";
    play.setAttribute("aria-label", "Pausar MPB Tunnel");
  });

  audio.addEventListener("waiting", () => {
    if (!userStopped) status.textContent = "BUFFERING";
  });
  audio.addEventListener("stalled", () => {
    if (!userStopped) scheduleRetry(true);
  });
  audio.addEventListener("error", () => {
    if (!userStopped) {
      resolvedStream = "";
      scheduleRetry(true);
    }
  });
  audio.addEventListener("ended", () => {
    if (!userStopped) {
      resolvedStream = "";
      scheduleRetry(true);
    }
  });
  audio.addEventListener("pause", () => {
    if (userStopped) {
      status.textContent = "PAUSED";
      play.textContent = "▶";
    }
  });

  document.addEventListener("play", event => {
    if (event.target instanceof HTMLMediaElement && event.target !== audio && !audio.paused) {
      userStopped = true;
      clearRetry();
      try { audio.pause(); } catch (_) {}
    }
  }, true);
})();
