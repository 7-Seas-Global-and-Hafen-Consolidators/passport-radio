/*
  PASSPORT RADIO
  GLOBAL PLAYER ENGINE
  --------------------
  Persists playback state between Passport Radio pages.
  Does not modify page colors, layout or editorial content.
*/

(() => {
  "use strict";

  const STORAGE_KEY = "passportRadioGlobalPlayer";

  function saveState(audio) {
    if (!audio || !audio.src) return;
    const state = {src: audio.currentSrc || audio.src,currentTime: Number.isFinite(audio.currentTime) ? audio.currentTime : 0,volume: audio.volume,muted: audio.muted,playing: !audio.paused && !audio.ended,savedAt: Date.now()};
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
  }
  function readState(){try{const raw=sessionStorage.getItem(STORAGE_KEY);return raw?JSON.parse(raw):null}catch(e){return null}}
  function findAudio(){return document.querySelector("audio")}
  function restoreState(audio){
    const state=readState();if(!audio||!state||!state.src)return;
    const absoluteCurrentSrc=audio.currentSrc||audio.src;
    if(absoluteCurrentSrc&&new URL(absoluteCurrentSrc,location.href).href!==new URL(state.src,location.href).href)return;
    audio.volume=typeof state.volume==="number"?state.volume:audio.volume;audio.muted=!!state.muted;
    const elapsed=state.playing&&state.savedAt?Math.max(0,(Date.now()-state.savedAt)/1000):0;
    const targetTime=Math.max(0,Number(state.currentTime||0)+elapsed);
    const applyTime=()=>{try{audio.currentTime=Number.isFinite(audio.duration)&&audio.duration>0?Math.min(targetTime,Math.max(0,audio.duration-.25)):targetTime}catch(e){}if(state.playing){const promise=audio.play();if(promise&&typeof promise.catch==="function")promise.catch(()=>{})}};
    if(audio.readyState>=1)applyTime();else audio.addEventListener("loadedmetadata",applyTime,{once:true});
  }
  function install(){
    const audio=findAudio();if(!audio)return;restoreState(audio);const save=()=>saveState(audio);
    audio.addEventListener("play",save);audio.addEventListener("pause",save);audio.addEventListener("volumechange",save);audio.addEventListener("seeked",save);audio.addEventListener("ended",save);
    setInterval(()=>{if(!audio.paused)saveState(audio)},1000);window.addEventListener("pagehide",save);window.addEventListener("beforeunload",save);document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")save()});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install);else install();
})();

/* =========================================================
   PASSPORT RADIO · LIVE & RARE
   Standalone audiovisual player for radio.html only.
   It does NOT touch METAL / UNPLUGGED / LIVE JAM.
   Playback uses the official YouTube IFrame API.
   ========================================================= */
(() => {
  "use strict";
  if(!document.body.classList.contains("live-page") || !document.getElementById("player")) return;

  const catalog=[
    {artist:"THE KINKS",title:"You Really Got Me",place:"The Midnight Special",year:"1974",source:"THE MIDNIGHT SPECIAL",id:"yxgut9pmopU",start:100,end:384},
    {artist:"PANIC! AT THE DISCO",title:"High Hopes",place:"Reading + Leeds",year:"2018",source:"BBC MUSIC",id:"bnZqZxRcM7Y",start:0},
    {artist:"ACCEPT",title:"Princess of the Dawn",place:"Wacken Open Air",year:"2024",source:"WACKENTV",id:"gNf2eAFrUDo",start:0,end:450},
    {artist:"ACCEPT",title:"Teutonic Terror",place:"Wacken Open Air",year:"2024",source:"WACKENTV",id:"gNf2eAFrUDo",start:450,end:776},
    {artist:"ACCEPT",title:"Fast as a Shark",place:"Wacken Open Air",year:"2024",source:"WACKENTV",id:"gNf2eAFrUDo",start:776}
  ];

  const host=document.getElementById("player");
  const oldPlayer=host.querySelector(".audio-player");
  const oldAudio=document.getElementById("passportAudio");
  if(oldAudio){oldAudio.pause();oldAudio.removeAttribute("autoplay")}
  if(oldPlayer)oldPlayer.style.display="none";

  const style=document.createElement("style");
  style.textContent=`
    .live-rare-stage{margin-top:18px;border:1px solid #333;background:#090909;overflow:hidden}
    .live-rare-video{position:relative;aspect-ratio:16/9;background:#000;overflow:hidden}
    .live-rare-video iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
    .live-rare-console{padding:15px}
    .live-rare-source{display:flex;justify-content:space-between;gap:12px;color:#d71920;font-size:.54rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase}
    .live-rare-title{margin-top:7px;font-size:1rem;font-weight:900;line-height:1.15}
    .live-rare-sub{margin-top:4px;color:#888;font-size:.59rem}
    .live-rare-controls{display:grid;grid-template-columns:auto auto auto 1fr;gap:9px;align-items:center;margin-top:14px}
    .live-rare-btn{width:38px;height:38px;border:1px solid #444;border-radius:50%;background:#171717;color:#fff;cursor:pointer;font-weight:900}
    .live-rare-btn--play{width:48px;height:48px;border-color:#d71920;background:#d71920}
    .live-rare-progress{width:100%;accent-color:#d71920}
    .live-rare-pipes{display:flex;gap:7px;flex-wrap:wrap;margin-top:12px}
    .live-rare-pipe{padding:5px 8px;border:1px solid #333;color:#777;font-size:.48rem;font-weight:900;letter-spacing:.08em}
    .live-rare-pipe.is-current{border-color:#d71920;color:#fff}
    @media(max-width:560px){.live-rare-console{padding:12px}.live-rare-controls{grid-template-columns:auto auto auto;}.live-rare-progress{grid-column:1/-1}.live-rare-title{font-size:.9rem}}
  `;
  document.head.appendChild(style);

  const stage=document.createElement("div");stage.className="live-rare-stage";stage.innerHTML=`
    <div class="live-rare-video"><div id="passport-live-rare-youtube"></div></div>
    <div class="live-rare-console">
      <div class="live-rare-source"><span>LIVE & RARE · PASSPORT RADIO</span><span id="liveRareStatus">READY</span></div>
      <div class="live-rare-title" id="liveRareTitle"></div>
      <div class="live-rare-sub" id="liveRareMeta"></div>
      <div class="live-rare-controls"><button class="live-rare-btn" id="liveRarePrev" type="button" aria-label="Anterior">◀</button><button class="live-rare-btn live-rare-btn--play" id="liveRarePlay" type="button" aria-label="Reproduzir">▶</button><button class="live-rare-btn" id="liveRareNext" type="button" aria-label="Próxima">▶</button><input class="live-rare-progress" id="liveRareProgress" type="range" min="0" max="100" step=".1" value="0" aria-label="Progresso"></div>
      <div class="live-rare-pipes"><span class="live-rare-pipe" data-pipe="THE MIDNIGHT SPECIAL">THE MIDNIGHT SPECIAL</span><span class="live-rare-pipe" data-pipe="BBC MUSIC">BBC MUSIC</span><span class="live-rare-pipe" data-pipe="WACKENTV">WACKENTV</span></div>
    </div>`;
  host.appendChild(stage);

  let index=0,player=null,ready=false,timer=null;
  const q=id=>document.getElementById(id), title=q("liveRareTitle"),meta=q("liveRareMeta"),status=q("liveRareStatus"),play=q("liveRarePlay"),progress=q("liveRareProgress");
  function item(){return catalog[index]}
  function syncCopy(){const x=item();title.textContent=`${x.artist} · ${x.title}`;meta.textContent=`${x.place} · ${x.year}`;const top=q("currentTrackTitle");if(top)top.textContent=`${x.artist} · ${x.title} · ${x.year}`;const desc=q("currentTrackDescription");if(desc)desc.textContent=`Passport Radio · Live & Rare · ${x.source}`;const bt=q("bottomTrackTitle");if(bt)bt.textContent=`${x.artist} · ${x.title}`;const bm=q("bottomTrackMeta");if(bm)bm.textContent=`Live & Rare · ${x.source}`;document.querySelectorAll(".live-rare-pipe").forEach(p=>p.classList.toggle("is-current",p.dataset.pipe===x.source))}
  function cue(auto=false){syncCopy();progress.value=0;if(!ready)return;const x=item(),o={videoId:x.id,startSeconds:x.start||0};if(x.end)o.endSeconds=x.end;auto?player.loadVideoById(o):player.cueVideoById(o)}
  function move(step){index=(index+step+catalog.length)%catalog.length;cue(true)}
  function watch(){clearInterval(timer);timer=setInterval(()=>{if(!ready||!player.getCurrentTime)return;const x=item(),t=player.getCurrentTime(),start=x.start||0,end=x.end||player.getDuration();if(end>start)progress.value=Math.max(0,Math.min(100,((t-start)/(end-start))*100));if(x.end&&t>=x.end-.3)move(1)},500)}
  function stopWatch(){clearInterval(timer);timer=null}
  function makePlayer(){if(player||!window.YT||!YT.Player)return;player=new YT.Player("passport-live-rare-youtube",{playerVars:{playsinline:1,rel:0,modestbranding:1},events:{onReady:()=>{ready=true;cue(false)},onStateChange:e=>{if(e.data===YT.PlayerState.PLAYING){status.textContent="PLAYING";play.textContent="Ⅱ";watch()}else if(e.data===YT.PlayerState.PAUSED){status.textContent="PAUSED";play.textContent="▶";stopWatch()}else if(e.data===YT.PlayerState.ENDED)move(1)},onError:()=>{status.textContent="SKIPPING";setTimeout(()=>move(1),500)}}})}
  function loadApi(){if(window.YT&&YT.Player){makePlayer();return}const s=document.createElement("script");s.src="https://www.youtube.com/iframe_api";document.head.appendChild(s);const prior=window.onYouTubeIframeAPIReady;window.onYouTubeIframeAPIReady=()=>{if(typeof prior==="function")prior();makePlayer()}}
  play.addEventListener("click",()=>{if(!ready)return;const st=player.getPlayerState();st===YT.PlayerState.PLAYING?player.pauseVideo():player.playVideo()});
  q("liveRarePrev").addEventListener("click",()=>move(-1));q("liveRareNext").addEventListener("click",()=>move(1));progress.addEventListener("input",()=>{if(!ready)return;const x=item(),start=x.start||0,end=x.end||player.getDuration();if(end>start)player.seekTo(start+(Number(progress.value)/100)*(end-start),true)});
  const bottomPlay=q("bottomPlay"),bottomNext=q("bottomNext");if(bottomPlay)bottomPlay.addEventListener("click",e=>{e.stopImmediatePropagation();play.click()},{capture:true});if(bottomNext)bottomNext.addEventListener("click",e=>{e.stopImmediatePropagation();move(1)},{capture:true});
  syncCopy();loadApi();
})();
