/* PASSPORT RADIO · SOUL TUNNEL
   Total Soul UK via the station's published direct stream.
   Isolated from Live & Rare, 80s Tunnel and protected 24h players.
*/
(() => {
  "use strict";
  if (!document.body.classList.contains("live-page")) return;

  const anchor = document.getElementById("passport80s");
  if (!anchor) return;

  const stale = document.getElementById("passportSoul");
  if (stale) {
    const oldAudio = stale.querySelector("audio");
    if (oldAudio) { try { oldAudio.pause(); } catch (_) {} }
    stale.remove();
  }
  document.querySelectorAll("style[data-passport-soul-style]").forEach(el => el.remove());

  const STREAM = "https://onair7.xdevel.com/proxy/xautocloud_atvn_1069?mp=%2F%3B1%2F";

  const style = document.createElement("style");
  style.dataset.passportSoulStyle = "1";
  style.textContent = `
    .passport-soul-section{padding:46px 0 52px;border-bottom:1px solid #d8d0c5;background:#efe7db;color:#101010}
    .passport-soul-shell{width:min(calc(100% - 40px),1180px);margin:auto;display:grid;grid-template-columns:minmax(220px,.52fr) minmax(0,1.48fr);gap:42px;align-items:center}
    .passport-soul-kicker{color:#7e1834;font-size:.54rem;font-weight:900;letter-spacing:.18em;text-transform:uppercase}
    .passport-soul-title{margin:8px 0 0;font-family:"Bebas Neue",Impact,sans-serif;font-size:clamp(2.8rem,5vw,5rem);font-weight:400;line-height:.88;letter-spacing:.01em}
    .passport-soul-copy{max-width:350px;margin:16px 0 0;color:#716960;font-size:.76rem;line-height:1.65}
    .passport-soul-script{display:block;margin-top:23px;color:#7e1834;font-family:Caveat,cursive;font-size:clamp(1.8rem,3vw,2.7rem);font-weight:600;line-height:.95;transform:rotate(-2deg)}
    .passport-soul-card{border-radius:26px 4px 26px 4px;background:#130d0f;color:#fff;overflow:hidden;box-shadow:0 22px 58px rgba(68,31,40,.13)}
    .passport-soul-cardhead{display:grid;grid-template-columns:1fr auto;gap:18px;align-items:center;padding:19px 22px;border-bottom:1px solid rgba(255,255,255,.07)}
    .passport-soul-cardhead small{display:block;color:#c6a46c;font-size:.49rem;font-weight:900;letter-spacing:.16em;text-transform:uppercase}
    .passport-soul-cardhead strong{display:block;margin-top:5px;font-size:.92rem;letter-spacing:-.02em}
    .passport-soul-status{color:#b9aaa9;font-size:.49rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase}
    .passport-soul-console{display:grid;grid-template-columns:66px 1fr;gap:18px;align-items:center;padding:22px;background:linear-gradient(135deg,#1b1014,#100b0d)}
    .passport-soul-play{width:66px;height:66px;border:0;border-radius:50%;background:#9b1f49;color:#fff;cursor:pointer;font-size:1.15rem;font-weight:900;box-shadow:0 0 0 8px rgba(155,31,73,.08)}
    .passport-soul-now small{display:block;color:#b88d9d;font-size:.48rem;font-weight:900;letter-spacing:.14em;text-transform:uppercase}
    .passport-soul-now strong{display:block;margin-top:5px;font-size:1.25rem;letter-spacing:-.035em}
    .passport-soul-now span{display:block;margin-top:5px;color:#8e8185;font-size:.55rem}
    .passport-soul-line{height:2px;margin-top:13px;background:linear-gradient(90deg,#9b1f49 0 34%,#3a242c 34% 100%)}
    .passport-soul-note{padding:10px 22px 13px;border-top:1px solid rgba(255,255,255,.06);color:#746b70;font-size:.48rem;line-height:1.5}
    @media(max-width:900px){.passport-soul-shell{grid-template-columns:1fr;gap:26px}.passport-soul-copy{max-width:540px}}
    @media(max-width:560px){.passport-soul-section{padding:42px 0 46px}.passport-soul-shell{width:min(calc(100% - 28px),1180px)}.passport-soul-cardhead{padding:17px}.passport-soul-console{padding:18px;grid-template-columns:60px 1fr}.passport-soul-play{width:60px;height:60px}.passport-soul-note{padding:9px 17px 11px}}
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
        <p class="passport-soul-copy">Soul dos anos 80 até agora, em sinal direto do Reino Unido. Sem iframe, sem página externa ocupando espaço.</p>
        <span class="passport-soul-script">where the groove remembers.</span>
      </div>
      <div class="passport-soul-card">
        <div class="passport-soul-cardhead">
          <div>
            <small>UK · DIRECT LIVE SIGNAL</small>
            <strong>Total Soul</strong>
          </div>
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

  function start(){
    pausePassportPlayers();
    if (!audio.src) audio.src = STREAM;
    status.textContent = "CONNECTING";
    const p = audio.play();
    if (p && p.catch) p.catch(() => {
      status.textContent = "ERROR";
      play.textContent = "▶";
    });
  }

  function stop(){
    audio.pause();
  }

  function toggle(){
    audio.paused ? start() : stop();
  }

  audio.addEventListener("playing", () => { status.textContent = "ON AIR"; play.textContent = "Ⅱ"; });
  audio.addEventListener("pause", () => { status.textContent = "PAUSED"; play.textContent = "▶"; });
  audio.addEventListener("waiting", () => { status.textContent = "BUFFERING"; });
  audio.addEventListener("stalled", () => { status.textContent = "BUFFERING"; });
  audio.addEventListener("error", () => { status.textContent = "ERROR"; play.textContent = "▶"; });
  play.addEventListener("click", toggle);

  document.addEventListener("play", e => {
    if (e.target instanceof HTMLMediaElement && e.target !== audio && !audio.paused) audio.pause();
  }, true);

  ["tunnelPlay","tunnelPrev","tunnelNext","tunnelPrevPlaylist","tunnelNextPlaylist","passport80sPlay","passport80sPrev","passport80sNext"].forEach(id => {
    const b = document.getElementById(id);
    if (b) b.addEventListener("click", () => { if (!audio.paused) audio.pause(); }, {capture:true});
  });
})();
