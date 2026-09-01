/* PASSPORT RADIO · 50s & 60s TUNNEL
   Dedicated golden-era signal + Jovem Guarda™ spotlight.
   Isolated from Live & Rare, 80s, Soul, MPB, Hits and protected 24h players.
   Existing 50s/60s player remains untouched; Jovem Guarda uses the station's external HTTPS player
   because its published direct stream is HTTP-only and would be blocked by GitHub Pages browsers.
*/
(() => {
  "use strict";
  if (!document.body.classList.contains("live-page")) return;

  const anchor = document.getElementById("passportHits") || document.getElementById("passportMPB") || document.getElementById("passportSoul") || document.getElementById("passport80s");
  if (!anchor) return;

  const previous = document.getElementById("passport5060");
  if (previous) {
    previous.querySelectorAll("audio").forEach(a => {
      try { a.pause(); a.removeAttribute("src"); a.load(); } catch (_) {}
    });
    previous.remove();
  }
  document.querySelectorAll("style[data-passport-5060-style]").forEach(el => el.remove());

  const STREAM = "https://listen.181fm.com/181-goodtime_128k.mp3";
  const JOVEM_GUARDA_PLAYER = "https://onlineradiobox.com/br/studiosoutojovemguarda/?lang=pt";

  const style = document.createElement("style");
  style.dataset.passport5060Style = "1";
  style.textContent = `
    .passport-5060-section{padding:44px 0 50px;border-bottom:1px solid #d8d0c5;background:#efe7da;color:#101010}
    .passport-5060-shell{width:min(calc(100% - 40px),1180px);margin:auto;display:grid;grid-template-columns:minmax(220px,.52fr) minmax(0,1.48fr);gap:42px;align-items:center}
    .passport-5060-kicker{color:#8a5a18;font-size:.54rem;font-weight:900;letter-spacing:.18em;text-transform:uppercase}
    .passport-5060-title{margin:8px 0 0;font-family:"Bebas Neue",Impact,sans-serif;font-size:clamp(2.8rem,5vw,5rem);font-weight:400;line-height:.88;letter-spacing:.01em}
    .passport-5060-copy{max-width:380px;margin:16px 0 0;color:#66615b;font-size:.76rem;line-height:1.65}
    .passport-5060-script{display:block;margin-top:23px;color:#8a5a18;font-family:Caveat,cursive;font-size:clamp(1.8rem,3vw,2.7rem);font-weight:600;line-height:.95;transform:rotate(-2deg)}
    .passport-5060-stack{display:grid;gap:14px}
    .passport-5060-card{border-radius:28px 5px 28px 5px;background:#151515;color:#fff;overflow:hidden;box-shadow:0 22px 58px rgba(0,0,0,.14)}
    .passport-5060-cardhead{display:grid;grid-template-columns:1fr auto;gap:18px;align-items:center;padding:18px 22px;border-bottom:1px solid rgba(255,255,255,.08)}
    .passport-5060-cardhead small{display:block;color:#e2bd7d;font-size:.49rem;font-weight:900;letter-spacing:.16em;text-transform:uppercase}
    .passport-5060-cardhead strong{display:block;margin-top:5px;font-size:.92rem;letter-spacing:-.02em}
    .passport-5060-status{color:#bdb7af;font-size:.49rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase}
    .passport-5060-console{display:grid;grid-template-columns:64px 1fr;gap:18px;align-items:center;padding:20px 22px;background:linear-gradient(135deg,#27231d,#111)}
    .passport-5060-play{width:64px;height:64px;border:0;border-radius:50%;background:#8a5a18;color:#fff;cursor:pointer;font-size:1.1rem;font-weight:900;box-shadow:0 0 0 8px rgba(138,90,24,.12)}
    .passport-5060-now small{display:block;color:#e2bd7d;font-size:.48rem;font-weight:900;letter-spacing:.14em;text-transform:uppercase}
    .passport-5060-now strong{display:block;margin-top:5px;font-size:1.25rem;letter-spacing:-.035em}
    .passport-5060-now span{display:block;margin-top:5px;color:#9b958e;font-size:.55rem}
    .passport-5060-line{height:2px;margin-top:13px;background:linear-gradient(90deg,#b77a27 0 42%,#4d4030 42% 100%)}
    .passport-5060-note{padding:10px 22px 13px;border-top:1px solid rgba(255,255,255,.06);color:#77716c;font-size:.48rem;line-height:1.5;letter-spacing:.03em}
    .passport-jg{position:relative;overflow:hidden;border:2px solid #151515;border-radius:5px 28px 5px 28px;background:#f5d43b;color:#101010;box-shadow:0 20px 45px rgba(0,0,0,.12)}
    .passport-jg:before{content:"BRAZIL · 1960s";position:absolute;top:17px;right:-43px;width:170px;padding:6px 0;background:#167548;color:#fff;text-align:center;font-size:.46rem;font-weight:900;letter-spacing:.13em;transform:rotate(38deg);z-index:2}
    .passport-jg__inner{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:20px;align-items:center;padding:22px 24px}
    .passport-jg__eyebrow{display:flex;align-items:center;gap:8px;font-size:.48rem;font-weight:900;letter-spacing:.15em;text-transform:uppercase}
    .passport-jg__dot{width:7px;height:7px;border-radius:50%;background:#d92323;box-shadow:0 0 0 5px rgba(217,35,35,.12);animation:passportJgPulse 1.4s infinite}
    .passport-jg__title{margin:7px 0 0;font-family:"Bebas Neue",Impact,sans-serif;font-size:clamp(2.5rem,5vw,4.3rem);font-weight:400;line-height:.86;letter-spacing:.015em;text-transform:uppercase}
    .passport-jg__tagline{margin:10px 0 0;font-family:Caveat,cursive;font-size:clamp(1.25rem,2.2vw,1.75rem);font-weight:700;line-height:1;color:#654b00}
    .passport-jg__meta{margin-top:12px;font-size:.5rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#4d410c}
    .passport-jg__listen{display:inline-flex;align-items:center;justify-content:center;min-width:142px;min-height:52px;padding:0 18px;border:0;border-radius:999px;background:#101010;color:#fff;text-decoration:none;font-size:.56rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase;box-shadow:0 10px 22px rgba(0,0,0,.18)}
    .passport-jg__listen:hover{transform:translateY(-1px)}
    .passport-jg__source{padding:9px 24px 11px;border-top:1px solid rgba(0,0,0,.13);font-size:.44rem;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:#655a23}
    @keyframes passportJgPulse{50%{opacity:.35;transform:scale(.75)}}
    @media(max-width:900px){.passport-5060-shell{grid-template-columns:1fr;gap:26px}.passport-5060-copy{max-width:540px}}
    @media(max-width:560px){.passport-5060-section{padding:38px 0 42px}.passport-5060-shell{width:min(calc(100% - 28px),1180px)}.passport-5060-cardhead{padding:16px}.passport-5060-console{padding:17px;grid-template-columns:58px 1fr}.passport-5060-play{width:58px;height:58px}.passport-5060-note{padding:9px 16px 11px}.passport-jg__inner{grid-template-columns:1fr;padding:20px 18px}.passport-jg__listen{width:100%}.passport-jg__source{padding:9px 18px 11px}}
  `;
  document.head.appendChild(style);

  const section = document.createElement("section");
  section.className = "passport-5060-section";
  section.id = "passport5060";
  section.dataset.passportTunnelPanel = "1";
  section.hidden = true;
  section.setAttribute("aria-labelledby", "passport5060Heading");
  section.innerHTML = `
    <div class="passport-5060-shell">
      <div>
        <span class="passport-5060-kicker">PASSPORT RADIO™ · GOLDEN ERA SIGNAL</span>
        <h2 class="passport-5060-title" id="passport5060Heading">50s &amp; 60s<br>Tunnel™</h2>
        <p class="passport-5060-copy">Rock ’n’ roll, doo-wop, soul e pop das décadas que mudaram a música para sempre.</p>
        <span class="passport-5060-script">where it all began.</span>
      </div>
      <div class="passport-5060-stack">
        <div class="passport-jg" aria-label="Jovem Guarda">
          <div class="passport-jg__inner">
            <div>
              <div class="passport-jg__eyebrow"><span class="passport-jg__dot"></span> SINAL ESPECIAL · BRASIL</div>
              <h3 class="passport-jg__title">Jovem Guarda™</h3>
              <p class="passport-jg__tagline">O iê-iê-iê brasileiro nunca saiu do ar.</p>
              <div class="passport-jg__meta">JOVEM GUARDA · 24 HORAS</div>
            </div>
            <a class="passport-jg__listen" href="${JOVEM_GUARDA_PLAYER}" target="_blank" rel="noopener noreferrer" aria-label="Ouvir Jovem Guarda ao vivo">▶ OUVIR AO VIVO ↗</a>
          </div>
          <div class="passport-jg__source">Curadoria Passport Radio™ · sinal de áudio: Rádio Studio Souto — Jovem Guarda</div>
        </div>
        <div class="passport-5060-card">
          <div class="passport-5060-cardhead">
            <div><small>50s &amp; 60s TUNNEL™</small><strong>Rock ’n’ Roll · Oldies</strong></div>
            <span class="passport-5060-status" id="passport5060Status">READY</span>
          </div>
          <div class="passport-5060-console">
            <button class="passport-5060-play" id="passport5060Play" type="button" aria-label="Reproduzir 50s e 60s Tunnel">▶</button>
            <div class="passport-5060-now">
              <small>NOW · 50s &amp; 60s TUNNEL™</small>
              <strong>Rock ’n’ Roll · Soul · Golden Pop</strong>
              <span>24 HOURS</span>
              <div class="passport-5060-line"></div>
            </div>
          </div>
          <div class="passport-5060-note">50s &amp; 60s TUNNEL™ · GOLDEN ERA · 24 HOURS</div>
          <audio id="passport5060Audio" preload="none"></audio>
        </div>
      </div>
    </div>`;

  anchor.insertAdjacentElement("afterend", section);

  const audio = document.getElementById("passport5060Audio");
  const play = document.getElementById("passport5060Play");
  const status = document.getElementById("passport5060Status");

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
