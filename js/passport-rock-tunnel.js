/* PASSPORT RADIO · ROCK CONTINUOUS TUNNEL
   New isolated player. Does not modify the existing Live & Rare tunnel,
   Passport 80s tunnel, or the three protected 24h players.
*/
(() => {
  "use strict";
  if (!document.body.classList.contains("live-page")) return;
  const host = document.getElementById("passportRockPlayer");
  if (!host || document.getElementById("passportRockTunnel")) return;

  const streams = [
    { name: "Rock Main", url: "https://stream-ar.hellorayo.co.uk/absoluteradio.mp3?direct=true" },
    { name: "Rock Main HQ", url: "https://stream-ar.hellorayo.co.uk/absoluteradiohigh.aac?direct=true" }
  ];

  const style = document.createElement("style");
  style.textContent = `
    .passport-rock-stage{border:1px solid #303030;background:#080808;color:#fff;overflow:hidden}
    .passport-rock-head{padding:16px 18px;border-bottom:1px solid #252525;background:linear-gradient(135deg,#151515,#090909)}
    .passport-rock-kicker{color:#d71920;font-size:.54rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase}
    .passport-rock-title{margin-top:7px;font-size:1.12rem;font-weight:900;line-height:1.1}
    .passport-rock-meta{margin-top:5px;color:#888;font-size:.58rem}
    .passport-rock-controls{display:grid;grid-template-columns:auto auto auto 1fr;gap:9px;align-items:center;padding:14px 18px}
    .passport-rock-btn{min-width:38px;height:38px;padding:0 12px;border:1px solid #444;border-radius:999px;background:#171717;color:#fff;cursor:pointer;font-size:.58rem;font-weight:900}
    .passport-rock-btn--play{width:48px;height:48px;padding:0;border-color:#d71920;background:#d71920;font-size:.9rem}
    .passport-rock-status{justify-self:end;color:#888;font-size:.54rem;font-weight:900;letter-spacing:.08em;text-transform:uppercase}
    .passport-rock-picker{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;padding:0 18px 16px}
    .passport-rock-station{min-height:38px;padding:8px 10px;border:1px solid #303030;background:#111;color:#aaa;cursor:pointer;text-align:left;font-size:.57rem;font-weight:800}
    .passport-rock-station.is-active{border-color:#d71920;color:#fff;background:#1a0d0e}
  `;
  document.head.appendChild(style);

  const stage = document.createElement("div");
  stage.id = "passportRockTunnel";
  stage.className = "passport-rock-stage";
  stage.innerHTML = `
    <div class="passport-rock-head">
      <div class="passport-rock-kicker">PASSPORT RADIO · ROCK CONTINUOUS</div>
      <div class="passport-rock-title" id="passportRockTitle">${streams[0].name}</div>
      <div class="passport-rock-meta" id="passportRockMeta">Canal 1/${streams.length} · transmissão contínua</div>
    </div>
    <div class="passport-rock-controls">
      <button class="passport-rock-btn" id="passportRockPrev" type="button" aria-label="Canal anterior">◀</button>
      <button class="passport-rock-btn passport-rock-btn--play" id="passportRockPlay" type="button" aria-label="Reproduzir">▶</button>
      <button class="passport-rock-btn" id="passportRockNext" type="button" aria-label="Próximo canal">▶</button>
      <span class="passport-rock-status" id="passportRockStatus">READY</span>
    </div>
    <div class="passport-rock-picker" id="passportRockPicker"></div>
    <audio id="passportRockAudio" preload="none"></audio>`;
  host.appendChild(stage);

  const audio = document.getElementById("passportRockAudio");
  const title = document.getElementById("passportRockTitle");
  const meta = document.getElementById("passportRockMeta");
  const status = document.getElementById("passportRockStatus");
  const play = document.getElementById("passportRockPlay");
  const picker = document.getElementById("passportRockPicker");
  let index = 0;

  function renderPicker(){
    picker.innerHTML = streams.map((s,i)=>`<button class="passport-rock-station${i===index?' is-active':''}" type="button" data-i="${i}">${s.name}</button>`).join("");
    picker.querySelectorAll("button").forEach(btn=>btn.addEventListener("click",()=>select(Number(btn.dataset.i),true)));
  }
  function update(){
    title.textContent=streams[index].name;
    meta.textContent=`Canal ${index+1}/${streams.length} · transmissão contínua`;
    renderPicker();
  }
  function pauseOtherNewTunnels(){
    const yt=document.getElementById("tunnelPlay");
    if(yt && (yt.textContent||"").trim()==="Ⅱ") yt.click();
    const eighties=document.getElementById("fm181Audio");
    if(eighties && !eighties.paused) eighties.pause();
  }
  function select(i,autoplay){
    index=(i+streams.length)%streams.length;
    const wasPlaying=!audio.paused;
    audio.pause(); audio.src=streams[index].url; audio.load(); update();
    status.textContent="READY"; play.textContent="▶";
    if(autoplay||wasPlaying) start();
  }
  function start(){
    pauseOtherNewTunnels();
    if(!audio.src) audio.src=streams[index].url;
    status.textContent="CONNECTING";
    const p=audio.play();
    if(p&&p.catch)p.catch(()=>{status.textContent="ERROR";play.textContent="▶";});
  }
  function toggle(){audio.paused?start():audio.pause();}

  audio.addEventListener("playing",()=>{status.textContent="ON AIR";play.textContent="Ⅱ";});
  audio.addEventListener("pause",()=>{status.textContent="PAUSED";play.textContent="▶";});
  audio.addEventListener("waiting",()=>{status.textContent="BUFFERING";});
  audio.addEventListener("stalled",()=>{status.textContent="BUFFERING";});
  audio.addEventListener("error",()=>{status.textContent="ERROR";play.textContent="▶";});
  document.getElementById("passportRockPrev").addEventListener("click",()=>select(index-1,true));
  document.getElementById("passportRockNext").addEventListener("click",()=>select(index+1,true));
  play.addEventListener("click",toggle);
  select(0,false);
})();