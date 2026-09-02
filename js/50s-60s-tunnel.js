/* PASSPORT RADIO · 50s & 60s TUNNEL
   Golden-era signal + native Jovem Guarda™ player.
   Both players stay inside Passport Radio. Existing protected players remain untouched.
*/
(() => {
  "use strict";
  if (!document.body.classList.contains("live-page")) return;

  const anchor = document.getElementById("passportHits") || document.getElementById("passportMPB") || document.getElementById("passportSoul") || document.getElementById("passport80s");
  if (!anchor) return;

  const previous = document.getElementById("passport5060");
  if (previous) {
    previous.querySelectorAll("audio").forEach(a => { try { a.pause(); a.removeAttribute("src"); a.load(); } catch (_) {} });
    previous.remove();
  }
  document.querySelectorAll("style[data-passport-5060-style]").forEach(el => el.remove());

  const STREAM = "https://listen.181fm.com/181-goodtime_128k.mp3";
  const JG_STREAM = "https://jovem-guarda-relay-production.up.railway.app/jovem-guarda";

  const style = document.createElement("style");
  style.dataset.passport5060Style = "1";
  style.textContent = `
    .passport-5060-section{padding:44px 0 50px;border-bottom:1px solid #d8d0c5;background:#efe7da;color:#101010}
    .passport-5060-shell{width:min(calc(100% - 40px),1180px);margin:auto;display:grid;grid-template-columns:minmax(220px,.52fr) minmax(0,1.48fr);gap:42px;align-items:center}
    .passport-5060-kicker{color:#8a5a18;font-size:.54rem;font-weight:900;letter-spacing:.18em;text-transform:uppercase}
    .passport-5060-title{margin:8px 0 0;font-family:"Bebas Neue",Impact,sans-serif;font-size:clamp(2.8rem,5vw,5rem);font-weight:400;line-height:.88}
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
    .passport-jg-card .passport-5060-console{background:linear-gradient(135deg,#241d17,#0d0d0d)}
    .passport-jg-card .passport-5060-play{background:#b4232d;box-shadow:0 0 0 8px rgba(180,35,45,.12)}
    .passport-jg-card .passport-5060-cardhead small,.passport-jg-card .passport-5060-now small{color:#efc36f}
    .passport-jg-card .passport-5060-line{background:linear-gradient(90deg,#b4232d 0 42%,#4d4030 42% 100%)}
    @media(max-width:900px){.passport-5060-shell{grid-template-columns:1fr;gap:26px}.passport-5060-copy{max-width:540px}}
    @media(max-width:560px){.passport-5060-section{padding:38px 0 42px}.passport-5060-shell{width:min(calc(100% - 28px),1180px)}.passport-5060-cardhead{padding:16px}.passport-5060-console{padding:17px;grid-template-columns:58px 1fr}.passport-5060-play{width:58px;height:58px}.passport-5060-note{padding:9px 16px 11px}}
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
        <div class="passport-5060-card passport-jg-card" id="passportJovemGuardaPlayer">
          <div class="passport-5060-cardhead">
            <div><small>JOVEM GUARDA™ · BRASIL · 24 HOURS</small><strong>Rádio Studio Souto · Jovem Guarda</strong></div>
            <span class="passport-5060-status" id="passportJGStatus">READY</span>
          </div>
          <div class="passport-5060-console">
            <button class="passport-5060-play" id="passportJGPlay" type="button" aria-label="Reproduzir Jovem Guarda">▶</button>
            <div class="passport-5060-now">
              <small>NOW · JOVEM GUARDA™</small>
              <strong>Iê-iê-iê brasileiro · Continuous</strong>
              <span>Roberto Carlos · Erasmo Carlos · Wanderléa · Golden Era</span>
              <div class="passport-5060-line"></div>
            </div>
          </div>
          <div class="passport-5060-note">JOVEM GUARDA™ · SINAL CONTÍNUO DENTRO DA PASSPORT RADIO</div>
          <audio id="passportJGAudio" preload="none"></audio>
        </div>
        <div class="passport-5060-card">
          <div class="passport-5060-cardhead">
            <div><small>50s &amp; 60s TUNNEL™</small><strong>Rock ’n’ Roll · Oldies</strong></div>
            <span class="passport-5060-status" id="passport5060Status">READY</span>
          </div>
          <div class="passport-5060-console">
            <button class="passport-5060-play" id="passport5060Play" type="button" aria-label="Reproduzir 50s e 60s Tunnel">▶</button>
            <div class="passport-5060-now"><small>NOW · 50s &amp; 60s TUNNEL™</small><strong>Rock ’n’ Roll · Soul · Golden Pop</strong><span>24 HOURS</span><div class="passport-5060-line"></div></div>
          </div>
          <div class="passport-5060-note">50s &amp; 60s TUNNEL™ · GOLDEN ERA · 24 HOURS</div>
          <audio id="passport5060Audio" preload="none"></audio>
        </div>
      </div>
    </div>`;
  anchor.insertAdjacentElement("afterend", section);

  function wire(audioId, playId, statusId, stream){
    const audio=document.getElementById(audioId), play=document.getElementById(playId), status=document.getElementById(statusId);
    function start(){
      document.querySelectorAll("audio").forEach(a=>{if(a!==audio&&!a.paused){try{a.pause();}catch(_){}}});
      if(!audio.src){audio.src=stream;audio.load();}
      status.textContent="CONNECTING";
      const p=audio.play(); if(p&&p.catch)p.catch(()=>{status.textContent="ERROR";play.textContent="▶";});
    }
    function stop(){audio.pause();}
    play.addEventListener("click",()=>audio.paused?start():stop());
    audio.addEventListener("playing",()=>{status.textContent="ON AIR";play.textContent="Ⅱ";});
    audio.addEventListener("pause",()=>{if(status.textContent!=="ERROR")status.textContent="PAUSED";play.textContent="▶";});
    audio.addEventListener("waiting",()=>{status.textContent="BUFFERING";});
    audio.addEventListener("stalled",()=>{status.textContent="BUFFERING";});
    audio.addEventListener("error",()=>{status.textContent="ERROR";play.textContent="▶";});
  }
  wire("passportJGAudio","passportJGPlay","passportJGStatus",JG_STREAM);
  wire("passport5060Audio","passport5060Play","passport5060Status",STREAM);
})();
