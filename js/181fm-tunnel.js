/* PASSPORT RADIO · 80s CONTINUOUS TUNNEL
   Independent from the three existing 24h players and from the YouTube archive engine.
   Runs only on body.live-page + #player.
*/
(() => {
  "use strict";
  if (!document.body.classList.contains("live-page")) return;
  const host = document.getElementById("player");
  if (!host || document.getElementById("fm181Tunnel")) return;

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
    .fm181-stage{margin-top:14px;border:1px solid #303030;background:#080808;color:#fff;overflow:hidden}
    .fm181-head{padding:16px 18px;border-bottom:1px solid #252525;background:linear-gradient(135deg,#151515,#090909)}
    .fm181-kicker{color:#d71920;font-size:.54rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase}
    .fm181-title{margin-top:7px;font-size:1.12rem;font-weight:900;line-height:1.1}
    .fm181-meta{margin-top:5px;color:#888;font-size:.58rem}
    .fm181-controls{display:grid;grid-template-columns:auto auto auto 1fr;gap:9px;align-items:center;padding:14px 18px}
    .fm181-btn{min-width:38px;height:38px;padding:0 12px;border:1px solid #444;border-radius:999px;background:#171717;color:#fff;cursor:pointer;font-size:.58rem;font-weight:900}
    .fm181-btn--play{width:48px;height:48px;padding:0;border-color:#d71920;background:#d71920;font-size:.9rem}
    .fm181-status{justify-self:end;color:#888;font-size:.54rem;font-weight:900;letter-spacing:.08em;text-transform:uppercase}
    .fm181-picker{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;padding:0 18px 16px}
    .fm181-station{min-height:38px;padding:8px 10px;border:1px solid #303030;background:#111;color:#aaa;cursor:pointer;text-align:left;font-size:.57rem;font-weight:800}
    .fm181-station.is-active{border-color:#d71920;color:#fff;background:#1a0d0e}
    @media(max-width:560px){.fm181-controls{grid-template-columns:auto auto auto 1fr}.fm181-picker{grid-template-columns:repeat(2,minmax(0,1fr))}}
  `;
  document.head.appendChild(style);

  const stage = document.createElement("div");
  stage.id = "fm181Tunnel";
  stage.className = "fm181-stage";
  stage.innerHTML = `
    <div class="fm181-head">
      <div class="fm181-kicker">PASSPORT RADIO · 80s CONTINUOUS</div>
      <div class="fm181-title" id="fm181Title">${streams[0].name}</div>
      <div class="fm181-meta" id="fm181Meta">Canal 1/${streams.length} · transmissão contínua</div>
    </div>
    <div class="fm181-controls">
      <button class="fm181-btn" id="fm181Prev" type="button" aria-label="Canal anterior">◀</button>
      <button class="fm181-btn fm181-btn--play" id="fm181Play" type="button" aria-label="Reproduzir">▶</button>
      <button class="fm181-btn" id="fm181Next" type="button" aria-label="Próximo canal">▶</button>
      <span class="fm181-status" id="fm181Status">READY</span>
    </div>
    <div class="fm181-picker" id="fm181Picker"></div>
    <audio id="fm181Audio" preload="none" crossorigin="anonymous"></audio>`;
  host.appendChild(stage);

  const audio = document.getElementById("fm181Audio");
  const title = document.getElementById("fm181Title");
  const meta = document.getElementById("fm181Meta");
  const status = document.getElementById("fm181Status");
  const play = document.getElementById("fm181Play");
  const picker = document.getElementById("fm181Picker");
  let index = 0;

  function renderPicker(){
    picker.innerHTML = streams.map((s,i)=>`<button class="fm181-station${i===index?' is-active':''}" type="button" data-i="${i}">${s.name}</button>`).join("");
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

  document.getElementById("fm181Prev").addEventListener("click",()=>select(index-1,true));
  document.getElementById("fm181Next").addEventListener("click",()=>select(index+1,true));
  play.addEventListener("click",toggle);

  ["tunnelPlay","tunnelPrev","tunnelNext","tunnelPlaylistPrev","tunnelPlaylistNext"].forEach(id=>{
    const b=document.getElementById(id); if(b) b.addEventListener("click",()=>{ if(!audio.paused) audio.pause(); },{capture:true});
  });

  select(0,false);
})();