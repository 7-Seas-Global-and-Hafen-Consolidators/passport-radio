/* PASSPORT RADIO · TOTAL SOUL TUNNEL
   Dedicated Soul Tunnel using Total Soul UK direct streams.
   Isolated from Live & Rare, 80s Tunnel and protected 24h players.
*/
(() => {
  "use strict";
  if (!document.body.classList.contains("live-page")) return;

  const anchor = document.getElementById("passport80s");
  if (!anchor) return;

  const previous = document.getElementById("passportSoul");
  if (previous) {
    previous.querySelectorAll("audio").forEach(a => { try { a.pause(); a.removeAttribute("src"); a.load(); } catch (_) {} });
    previous.remove();
  }
  document.querySelectorAll("style[data-passport-soul-style]").forEach(el => el.remove());

  const STREAMS = [
    "https://onair7.xdevel.com/proxy/xautocloud_atvn_1069?mp=%2F%3B1%2F",
    "https://onair7.xdevel.com/proxy/xautocloud_atvn_1069?mp=/;1/&_=652337"
  ];
  let streamIndex = 0;
  let retryTimer = 0;

  const style = document.createElement("style");
  style.dataset.passportSoulStyle = "1";
  style.textContent = `
    .passport-soul-section{padding:44px 0 50px;border-bottom:1px solid #d8d0c5;background:#efe7db;color:#101010}
    .passport-soul-shell{width:min(calc(100% - 40px),1180px);margin:auto;display:grid;grid-template-columns:minmax(220px,.52fr) minmax(0,1.48fr);gap:42px;align-items:center}
    .passport-soul-kicker{color:#7e1834;font-size:.54rem;font-weight:900;letter-spacing:.18em;text-transform:uppercase}
    .passport-soul-title{margin:8px 0 0;font-family:"Bebas Neue",Impact,sans-serif;font-size:clamp(2.8rem,5vw,5rem);font-weight:400;line-height:.88;letter-spacing:.01em}
    .passport-soul-copy{max-width:350px;margin:16px 0 0;color:#716960;font-size:.76rem;line-height:1.65}
    .passport-soul-script{display:block;margin-top:23px;color:#7e1834;font-family:Caveat,cursive;font-size:clamp(1.8rem,3vw,2.7rem);font-weight:600;line-height:.95;transform:rotate(-2deg)}
    .passport-soul-card{border-radius:26px 4px 26px 4px;background:#130d0f;color:#fff;overflow:hidden;box-shadow:0 22px 58px rgba(68,31,40,.13)}
    .passport-soul-cardhead{display:grid;grid-template-columns:1fr auto;gap:18px;align-items:center;padding:18px 22px;border-bottom:1px solid rgba(255,255,255,.07)}
    .passport-soul-cardhead small{display:block;color:#c6a46c;font-size:.49rem;font-weight:900;letter-spacing:.16em;text-transform:uppercase}
    .passport-soul-cardhead strong{display:block;margin-top:5px;font-size:.92rem;letter-spacing:-.02em}
    .passport-soul-status{color:#b9aaa9;font-size:.49rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase}
    .passport-soul-console{display:grid;grid-template-columns:64px 1fr;gap:18px;align-items:center;padding:20px 22px;background:linear-gradient(135deg,#1b1014,#100b0d)}
    .passport-soul-play{width:64px;height:64px;border:0;border-radius:50%;background:#9b1f49;color:#fff;cursor:pointer;font-size:1.1rem;font-weight:900;box-shadow:0 0 0 8px rgba(155,31,73,.08)}
    .passport-soul-now small{display:block;color:#b88d9d;font-size:.48rem;font-weight:900;letter-spacing:.14em;text-transform:uppercase}
    .passport-soul-now strong{display:block;margin-top:5px;font-size:1.25rem;letter-spacing:-.035em}
    .passport-soul-now span{display:block;margin-top:5px;color:#8e8185;font-size:.55rem}
    .passport-soul-line{height:2px;margin-top:13px;background:linear-gradient(90deg,#9b1f49 0 34%,#3a242c 34% 100%)}
    .passport-soul-note{padding:10px 22px 13px;border-top:1px solid rgba(255,255,255,.06);color:#746b70;font-size:.48rem;line-height:1.5}
    @media(max-width:900px){.passport-soul-shell{grid-template-columns:1fr;gap:26px}.passport-soul-copy{max-width:540px}}
    @media(max-width:560px){.passport-soul-section{padding:40px 0 44px}.passport-soul-shell{width:min(calc(100% - 28px),1180px)}.passport-soul-cardhead{padding:16px}.passport-soul-console{padding:17px;grid-template-columns:58px 1fr}.passport-soul-play{width:58px;height:58px}.passport-soul-note{padding:9px 16px 11px}}
  `;
  document.head.appendChild(style);

  const section = document.createElement("section");
  section.className = "passport-soul-section";
  section.id = "passportSoul";
  section.setAttribute("aria-labelledby", "passportSoulHeading");
  section.innerHTML = `
    <div class="passport-soul-shell">
      <div>
        <span class="passport-soul-kicker">PASSPORT RADIO™ · SOUL SIGNAL</span>
        <h2 class="passport-soul-title" id="passportSoulHeading">Soul<br>Tunnel™</h2>
        <p class="passport-soul-copy">Soul dos anos 80 até agora, direto do Reino Unido. Um player Passport próprio, sem iframe externo.</p>
        <span class="passport-soul-script">where the groove remembers.</span>
      </div>
      <div class="passport-soul-card">
        <div class="passport-soul-cardhead">
          <div><small>UK · DIRECT LIVE SIGNAL</small><strong>Total Soul</strong></div>
          <span class="passport-soul-status" id="passportSoulStatus">READY</span>
        </div>
        <div class="passport-soul-console">
          <button class="passport-soul-play" id="passportSoulPlay" type="button" aria-label="Reproduzir Total Soul">▶</button>
          <div class="passport-soul-now">
            <small>NOW · SOUL TUNNEL™</small>
            <strong>Total Soul · UK</strong>
            <span>Non-stop soul · 80s to now</span>
            <div class="passport-soul-line"></div>
          </div>
        </div>
        <div class="passport-soul-note">Total Soul · sinal direto publicado pela própria estação para internet radio.</div>
        <audio id="passportSoulAudio" preload="none"></audio>
      </div>
    </div>`;

  anchor.insertAdjacentElement("afterend", section);

  const audio = document.getElementById("passportSoulAudio");
  const play = document.getElementById("passportSoulPlay");
  const status = document.getElementById("passportSoulStatus");

  function pausePassportPlayers(){
    const yt = document.getElementById("tunnelPlay");
    if (yt && (yt.textContent || "").trim() === "Ⅱ") yt.click();
    const eighties = document.getElementById("passport80sAudio");
    if (eighties && !eighties.paused) eighties.pause();
  }

  function clearRetry(){
    if (retryTimer) { clearTimeout(retryTimer); retryTimer = 0; }
  }

  function loadCurrentStream(){
    clearRetry();
    audio.pause();
    audio.src = STREAMS[streamIndex];
    audio.load();
  }

  function tryNextStream(){
    if (streamIndex + 1 >= STREAMS.length) {
      status.textContent = "ERROR";
      play.textContent = "▶";
      return;
    }
    streamIndex += 1;
    status.textContent = "RETRY";
    loadCurrentStream();
    const p = audio.play();
    if (p && p.catch) p.catch(() => {
      status.textContent = "ERROR";
      play.textContent = "▶";
    });
  }

  function start(){
    pausePassportPlayers();
    if (!audio.src) loadCurrentStream();
    status.textContent = "CONNECTING";
    const p = audio.play();
    if (p && p.catch) p.catch(() => tryNextStream());
    retryTimer = setTimeout(() => {
      if (audio.paused && status.textContent !== "ON AIR") tryNextStream();
    }, 8000);
  }

  function stop(){ clearRetry(); audio.pause(); }
  function toggle(){ audio.paused ? start() : stop(); }

  audio.addEventListener("playing", () => { clearRetry(); status.textContent = "ON AIR"; play.textContent = "Ⅱ"; });
  audio.addEventListener("pause", () => { if (status.textContent !== "ERROR") status.textContent = "PAUSED"; play.textContent = "▶"; });
  audio.addEventListener("waiting", () => { status.textContent = "BUFFERING"; });
  audio.addEventListener("stalled", () => { status.textContent = "BUFFERING"; });
  audio.addEventListener("error", () => { clearRetry(); tryNextStream(); });
  play.addEventListener("click", toggle);

  document.addEventListener("play", e => {
    if (e.target instanceof HTMLMediaElement && e.target !== audio && !audio.paused) audio.pause();
  }, true);

  ["tunnelPlay","tunnelPrev","tunnelNext","tunnelPrevPlaylist","tunnelNextPlaylist","passport80sPlay","passport80sPrev","passport80sNext"].forEach(id => {
    const b = document.getElementById(id);
    if (b) b.addEventListener("click", () => { if (!audio.paused) audio.pause(); }, {capture:true});
  });
})();
