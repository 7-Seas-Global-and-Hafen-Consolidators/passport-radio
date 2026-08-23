/* PASSPORT RADIO · 80s CONTINUOUS TUNNEL
   Independent second player for the Live page.
   Does not replace or modify the existing 24h players or the YouTube archive engine.
*/
(() => {
  "use strict";
  if (!document.body.classList.contains("live-page")) return;
  const host = document.getElementById("passport80sPlayer");
  if (!host || document.getElementById("passport80sTunnel")) return;

  const streams = [
    { name: "Awesome 80's", url: "https://listen.181fm.com/181-awesome80s_128k.mp3" },
    { name: "Lite 80's", url: "https://listen.181fm.com/181-lite80s_128k.mp3" },
    { name: "80's Country", url: "https://listen.181fm.com/181-80scountry_128k.mp3" },
    { name: "80's Lite RnB", url: "https://listen.181fm.com/181-80sliternb_128k.mp3" },
    { name: "80's RnB", url: "https://listen.181fm.com/181-80srnb_128k.mp3" },
    { name: "80's Hairband", url: "https://listen.181fm.com/181-hairband_128k.mp3" }
  ];

  const style = document.createElement("style");
  style.textContent = `
    .passport80s-stage{border:1px solid #303030;background:#080808;color:#fff;overflow:hidden}
    .passport80s-head{padding:18px 20px;border-bottom:1px solid #252525;background:linear-gradient(135deg,#151515,#090909)}
    .passport80s-kicker{color:#d71920;font-size:.56rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase}
    .passport80s-title{margin-top:8px;font-size:clamp(1.35rem,4vw,2rem);font-weight:900;line-height:1.08}
    .passport80s-meta{margin-top:6px;color:#888;font-size:.6rem}
    .passport80s-controls{display:grid;grid-template-columns:auto auto auto 1fr;gap:10px;align-items:center;padding:16px 20px}
    .passport80s-btn{min-width:40px;height:40px;padding:0 13px;border:1px solid #444;border-radius:999px;background:#171717;color:#fff;cursor:pointer;font-size:.6rem;font-weight:900}
    .passport80s-btn--play{width:50px;height:50px;padding:0;border-color:#d71920;background:#d71920;font-size:1rem}
    .passport80s-status{justify-self:end;color:#888;font-size:.55rem;font-weight:900;letter-spacing:.08em;text-transform:uppercase}
    .passport80s-picker{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;padding:0 20px 18px}
    .passport80s-station{min-height:42px;padding:9px 11px;border:1px solid #303030;background:#111;color:#aaa;cursor:pointer;text-align:left;font-size:.58rem;font-weight:800}
    .passport80s-station.is-active{border-color:#d71920;color:#fff;background:#1a0d0e}
    @media(max-width:560px){.passport80s-picker{grid-template-columns:repeat(2,minmax(0,1fr))}.passport80s-controls{grid-template-columns:auto auto auto 1fr}}
  `;
  document.head.appendChild(style);

  const stage = document.createElement("div");
  stage.id = "passport80sTunnel";
  stage.className = "passport80s-stage";
  stage.innerHTML = `
    <div class="passport80s-head">
      <div class="passport80s-kicker">PASSPORT RADIO · 80s CONTINUOUS</div>
      <div class="passport80s-title" id="passport80sTitle">${streams[0].name}</div>
      <div class="passport80s-meta" id="passport80sMeta">Canal 1/${streams.length} · transmissão contínua</div>
    </div>
    <div class="passport80s-controls">
      <button class="passport80s-btn" id="passport80sPrev" type="button" aria-label="Canal anterior">◀</button>
      <button class="passport80s-btn passport80s-btn--play" id="passport80sPlay" type="button" aria-label="Reproduzir">▶</button>
      <button class="passport80s-btn" id="passport80sNext" type="button" aria-label="Próximo canal">▶</button>
      <span class="passport80s-status" id="passport80sStatus">READY</span>
    </div>
    <div class="passport80s-picker" id="passport80sPicker"></div>
    <audio id="passport80sAudio" preload="none"></audio>`;
  host.appendChild(stage);

  const audio = document.getElementById("passport80sAudio");
  const title = document.getElementById("passport80sTitle");
  const meta = document.getElementById("passport80sMeta");
  const status = document.getElementById("passport80sStatus");
  const play = document.getElementById("passport80sPlay");
  const picker = document.getElementById("passport80sPicker");
  let index = 0;

  function renderPicker(){
    picker.innerHTML = streams.map((s,i)=>`<button class="passport80s-station${i===index?' is-active':''}" type="button" data-i="${i}">${s.name}</button>`).join("");
    picker.querySelectorAll("button").forEach(btn=>btn.addEventListener("click",()=>select(Number(btn.dataset.i), true)));
  }

  function update(){
    title.textContent = streams[index].name;
    meta.textContent = `Canal ${index+1}/${streams.length} · transmissão contínua`;
    renderPicker();
  }

  function stopYouTubeTunnel(){
    const b = document.getElementById("tunnelPlay");
    if (b && (b.textContent || "").trim() === "Ⅱ") b.click();
  }

  function select(i, autoplay){
    index = (i + streams.length) % streams.length;
    const wasPlaying = !audio.paused;
    audio.pause();
    audio.src = streams[index].url;
    audio.load();
    update();
    status.textContent = "READY";
    play.textContent = "▶";
    if (autoplay || wasPlaying) start();
  }

  function start(){
    stopYouTubeTunnel();
    if (!audio.src) audio.src = streams[index].url;
    status.textContent = "CONNECTING";
    const p = audio.play();
    if (p && p.catch) p.catch(()=>{ status.textContent = "ERROR"; play.textContent = "▶"; });
  }

  function toggle(){ audio.paused ? start() : audio.pause(); }

  audio.addEventListener("playing",()=>{ status.textContent = "ON AIR"; play.textContent = "Ⅱ"; });
  audio.addEventListener("pause",()=>{ status.textContent = "PAUSED"; play.textContent = "▶"; });
  audio.addEventListener("waiting",()=>{ status.textContent = "BUFFERING"; });
  audio.addEventListener("stalled",()=>{ status.textContent = "BUFFERING"; });
  audio.addEventListener("error",()=>{ status.textContent = "ERROR"; play.textContent = "▶"; });

  document.getElementById("passport80sPrev").addEventListener("click",()=>select(index-1,true));
  document.getElementById("passport80sNext").addEventListener("click",()=>select(index+1,true));
  play.addEventListener("click",toggle);

  ["tunnelPlay","tunnelPrev","tunnelNext","tunnelPlaylistPrev","tunnelPlaylistNext"].forEach(id=>{
    const b=document.getElementById(id);
    if(b) b.addEventListener("click",()=>{ if(!audio.paused) audio.pause(); },{capture:true});
  });

  select(0,false);
})();