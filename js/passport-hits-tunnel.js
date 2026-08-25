/* PASSPORT RADIO · PASSPORT HITS TUNNEL
   Dedicated Pop / Top 40 signal.
   Isolated from Live & Rare, 80s, Soul, MPB and protected 24h players.
   Third-party station branding is never rendered in the Passport UI.
*/
(() => {
  "use strict";
  if (!document.body.classList.contains("live-page")) return;

  const anchor = document.getElementById("passportMPB") || document.getElementById("passportSoul") || document.getElementById("passport80s");
  if (!anchor) return;

  const previous = document.getElementById("passportHits");
  if (previous) {
    previous.querySelectorAll("audio").forEach(a => {
      try { a.pause(); a.removeAttribute("src"); a.load(); } catch (_) {}
    });
    previous.remove();
  }
  document.querySelectorAll("style[data-passport-hits-style]").forEach(el => el.remove());

  const STREAM = "https://stream-mz.hellorayo.co.uk/net1london.aac?aw_0_1st.bauer_listenerid=undefined&aw_0_1st.skey=1602676850&direct=true&rp_source=1";

  const style = document.createElement("style");
  style.dataset.passportHitsStyle = "1";
  style.textContent = `
    .passport-hits-section{padding:44px 0 50px;border-bottom:1px solid #d8d0c5;background:#f2eee8;color:#101010}
    .passport-hits-shell{width:min(calc(100% - 40px),1180px);margin:auto;display:grid;grid-template-columns:minmax(220px,.52fr) minmax(0,1.48fr);gap:42px;align-items:center}
    .passport-hits-kicker{color:#c70000;font-size:.54rem;font-weight:900;letter-spacing:.18em;text-transform:uppercase}
    .passport-hits-title{margin:8px 0 0;font-family:"Bebas Neue",Impact,sans-serif;font-size:clamp(2.8rem,5vw,5rem);font-weight:400;line-height:.88;letter-spacing:.01em}
    .passport-hits-copy{max-width:360px;margin:16px 0 0;color:#66615b;font-size:.76rem;line-height:1.65}
    .passport-hits-script{display:block;margin-top:23px;color:#c70000;font-family:Caveat,cursive;font-size:clamp(1.8rem,3vw,2.7rem);font-weight:600;line-height:.95;transform:rotate(-2deg)}
    .passport-hits-card{border-radius:28px 5px 28px 5px;background:#151515;color:#fff;overflow:hidden;box-shadow:0 22px 58px rgba(0,0,0,.14)}
    .passport-hits-cardhead{display:grid;grid-template-columns:1fr auto;gap:18px;align-items:center;padding:18px 22px;border-bottom:1px solid rgba(255,255,255,.08)}
    .passport-hits-cardhead small{display:block;color:#f0c98e;font-size:.49rem;font-weight:900;letter-spacing:.16em;text-transform:uppercase}
    .passport-hits-cardhead strong{display:block;margin-top:5px;font-size:.92rem;letter-spacing:-.02em}
    .passport-hits-status{color:#bdb7af;font-size:.49rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase}
    .passport-hits-console{display:grid;grid-template-columns:64px 1fr;gap:18px;align-items:center;padding:20px 22px;background:linear-gradient(135deg,#242424,#111)}
    .passport-hits-play{width:64px;height:64px;border:0;border-radius:50%;background:#c70000;color:#fff;cursor:pointer;font-size:1.1rem;font-weight:900;box-shadow:0 0 0 8px rgba(199,0,0,.09)}
    .passport-hits-now small{display:block;color:#f0c98e;font-size:.48rem;font-weight:900;letter-spacing:.14em;text-transform:uppercase}
    .passport-hits-now strong{display:block;margin-top:5px;font-size:1.25rem;letter-spacing:-.035em}
    .passport-hits-now span{display:block;margin-top:5px;color:#9b958e;font-size:.55rem}
    .passport-hits-line{height:2px;margin-top:13px;background:linear-gradient(90deg,#c70000 0 42%,#4b3030 42% 100%)}
    .passport-hits-note{padding:10px 22px 13px;border-top:1px solid rgba(255,255,255,.06);color:#77716c;font-size:.48rem;line-height:1.5;letter-spacing:.03em}
    @media(max-width:900px){.passport-hits-shell{grid-template-columns:1fr;gap:26px}.passport-hits-copy{max-width:540px}}
    @media(max-width:560px){.passport-hits-section{padding:38px 0 42px}.passport-hits-shell{width:min(calc(100% - 28px),1180px)}.passport-hits-cardhead{padding:16px}.passport-hits-console{padding:17px;grid-template-columns:58px 1fr}.passport-hits-play{width:58px;height:58px}.passport-hits-note{padding:9px 16px 11px}}
  `;
  document.head.appendChild(style);

  const section = document.createElement("section");
  section.className = "passport-hits-section";
  section.id = "passportHits";
  section.dataset.passportTunnelPanel = "1";
  section.hidden = true;
  section.setAttribute("aria-labelledby", "passportHitsHeading");
  section.innerHTML = `
    <div class="passport-hits-shell">
      <div>
        <span class="passport-hits-kicker">PASSPORT RADIO™ · HITS SIGNAL</span>
        <h2 class="passport-hits-title" id="passportHitsHeading">Passport Hits<br>Tunnel™</h2>
        <p class="passport-hits-copy">Pop e Top 40 em rotação contínua, dentro de um player próprio da Passport.</p>
        <span class="passport-hits-script">hits keep moving.</span>
      </div>
      <div class="passport-hits-card">
        <div class="passport-hits-cardhead">
          <div><small>PASSPORT HITS TUNNEL™</small><strong>Pop · Top 40</strong></div>
          <span class="passport-hits-status" id="passportHitsStatus">READY</span>
        </div>
        <div class="passport-hits-console">
          <button class="passport-hits-play" id="passportHitsPlay" type="button" aria-label="Reproduzir Passport Hits Tunnel">▶</button>
          <div class="passport-hits-now">
            <small>NOW · PASSPORT HITS TUNNEL™</small>
            <strong>Pop · Top 40</strong>
            <span>24 HOURS</span>
            <div class="passport-hits-line"></div>
          </div>
        </div>
        <div class="passport-hits-note">PASSPORT HITS TUNNEL™ · POP · TOP 40 · 24 HOURS</div>
        <audio id="passportHitsAudio" preload="none"></audio>
      </div>
    </div>`;

  anchor.insertAdjacentElement("afterend", section);

  const audio = document.getElementById("passportHitsAudio");
  const play = document.getElementById("passportHitsPlay");
  const status = document.getElementById("passportHitsStatus");

  function loadStream(){
    audio.pause();
    audio.src = STREAM;
    audio.load();
  }

  function start(){
    if (!audio.src) loadStream();
    status.textContent = "CONNECTING";
    const p = audio.play();
    if (p && p.catch) p.catch(() => {
      status.textContent = "ERROR";
      play.textContent = "▶";
    });
  }

  function stop(){ audio.pause(); }
  function toggle(){ audio.paused ? start() : stop(); }

  audio.addEventListener("playing", () => { status.textContent = "ON AIR"; play.textContent = "Ⅱ"; });
  audio.addEventListener("pause", () => { if (status.textContent !== "ERROR") status.textContent = "PAUSED"; play.textContent = "▶"; });
  audio.addEventListener("waiting", () => { status.textContent = "BUFFERING"; });
  audio.addEventListener("stalled", () => { status.textContent = "BUFFERING"; });
  audio.addEventListener("error", () => { status.textContent = "ERROR"; play.textContent = "▶"; });
  play.addEventListener("click", toggle);
})();
