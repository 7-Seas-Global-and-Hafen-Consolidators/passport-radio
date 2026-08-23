/* PASSPORT RADIO · GLOBAL AUDIO STATE */
(() => {
  "use strict";
  const STORAGE_KEY="passportRadioGlobalPlayer";
  function saveState(audio){if(!audio||!audio.src)return;const state={src:audio.currentSrc||audio.src,currentTime:Number.isFinite(audio.currentTime)?audio.currentTime:0,volume:audio.volume,muted:audio.muted,playing:!audio.paused&&!audio.ended,savedAt:Date.now()};try{sessionStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch(e){}}
  function readState(){try{const raw=sessionStorage.getItem(STORAGE_KEY);return raw?JSON.parse(raw):null}catch(e){return null}}
  function restoreState(audio){const state=readState();if(!audio||!state||!state.src)return;const current=audio.currentSrc||audio.src;if(current&&new URL(current,location.href).href!==new URL(state.src,location.href).href)return;audio.volume=typeof state.volume==="number"?state.volume:audio.volume;audio.muted=!!state.muted;const elapsed=state.playing&&state.savedAt?Math.max(0,(Date.now()-state.savedAt)/1000):0,target=Math.max(0,Number(state.currentTime||0)+elapsed);const apply=()=>{try{audio.currentTime=Number.isFinite(audio.duration)&&audio.duration>0?Math.min(target,Math.max(0,audio.duration-.25)):target}catch(e){}if(state.playing){const p=audio.play();if(p&&p.catch)p.catch(()=>{})}};audio.readyState>=1?apply():audio.addEventListener("loadedmetadata",apply,{once:true})}
  function install(){const audio=document.querySelector("audio");if(!audio)return;restoreState(audio);const save=()=>saveState(audio);["play","pause","volumechange","seeked","ended"].forEach(x=>audio.addEventListener(x,save));setInterval(()=>{if(!audio.paused)save()},1000);window.addEventListener("pagehide",save)}
  document.readyState==="loading"?document.addEventListener("DOMContentLoaded",install):install();
})();

/* PASSPORT RADIO · LIVE & RARE · isolated audiovisual player for radio.html */
(() => {
  "use strict";
  if(!document.body.classList.contains("live-page"))return;
  const host=document.getElementById("player");if(!host)return;

  /* Curated starter catalog. Source identity stays behind the wall; UI is Passport only. */
  const catalog=[
    /* MIDNIGHT SPECIAL · EP 1 · 1973 */
    {artist:"HELEN REDDY",title:"I Am Woman",place:"LIVE",year:"1973",id:"bf1mfLZhmjk",start:62,end:377},
    {artist:"IKE & TINA TURNER",title:"I Can't Turn You Loose",place:"LIVE",year:"1973",id:"bf1mfLZhmjk",start:377,end:1019},
    {artist:"CURTIS MAYFIELD",title:"Superfly",place:"LIVE",year:"1973",id:"bf1mfLZhmjk",start:1019,end:1260},
    {artist:"DON McLEAN",title:"Dreidel",place:"LIVE",year:"1973",id:"bf1mfLZhmjk",start:1260,end:1513},
    {artist:"RARE EARTH",title:"We're Gonna Have a Good Time",place:"LIVE",year:"1973",id:"bf1mfLZhmjk",start:1513,end:1748},
    {artist:"HELEN REDDY",title:"Peaceful",place:"LIVE",year:"1973",id:"bf1mfLZhmjk",start:1748,end:2062},
    {artist:"KENNY RANKIN",title:"Comin' Down",place:"LIVE",year:"1973",id:"bf1mfLZhmjk",start:2062,end:2368},
    {artist:"THE BYRDS",title:"Mr. Tambourine Man / So You Want to Be a Rock 'n' Roll Star",place:"LIVE",year:"1973",id:"bf1mfLZhmjk",start:2368,end:2640},
    {artist:"THE IMPRESSIONS",title:"Preacher Man",place:"LIVE",year:"1973",id:"bf1mfLZhmjk",start:2640,end:3101},
    {artist:"IKE & TINA TURNER",title:"With a Little Help from My Friends",place:"LIVE",year:"1973",id:"bf1mfLZhmjk",start:3101,end:3282},
    {artist:"DON McLEAN",title:"If We Try",place:"LIVE",year:"1973",id:"bf1mfLZhmjk",start:3282,end:3487},
    {artist:"RARE EARTH",title:"I Just Want to Celebrate",place:"LIVE",year:"1973",id:"bf1mfLZhmjk",start:3487,end:3793},

    /* MIDNIGHT SPECIAL · 1974 */
    {artist:"THE KINKS",title:"You Really Got Me",place:"LIVE",year:"1974",id:"yxgut9pmopU",start:100,end:384},
    {artist:"ELECTRIC LIGHT ORCHESTRA",title:"Showdown",place:"LIVE",year:"1974",id:"yxgut9pmopU",start:384,end:1350},
    {artist:"SUZI QUATRO",title:"All Shook Up",place:"LIVE",year:"1974",id:"yxgut9pmopU",start:1350,end:1887},
    {artist:"RORY GALLAGHER",title:"Hands Off",place:"LIVE",year:"1974",id:"yxgut9pmopU",start:1887,end:2201},
    {artist:"ELECTRIC LIGHT ORCHESTRA",title:"Bluebird Is Dead",place:"LIVE",year:"1974",id:"yxgut9pmopU",start:2201,end:3003},
    {artist:"THE KINKS",title:"Celluloid Heroes",place:"LIVE",year:"1974",id:"yxgut9pmopU",start:3003,end:3532},
    {artist:"RORY GALLAGHER",title:"Who's That Comin'",place:"LIVE",year:"1974",id:"yxgut9pmopU",start:3532},

    /* BBC MUSIC */
    {artist:"U2",title:"With Or Without You",place:"ABBEY ROAD",year:"2017",id:"6DeDzsCGbsQ",start:0},
    {artist:"PANIC! AT THE DISCO",title:"High Hopes",place:"READING + LEEDS",year:"2018",id:"bnZqZxRcM7Y",start:0},

    /* WACKEN */
    {artist:"ACCEPT",title:"Princess of the Dawn",place:"WACKEN OPEN AIR",year:"2024",id:"gNf2eAFrUDo",start:0,end:450},
    {artist:"ACCEPT",title:"Teutonic Terror",place:"WACKEN OPEN AIR",year:"2024",id:"gNf2eAFrUDo",start:450,end:776},
    {artist:"ACCEPT",title:"Fast as a Shark",place:"WACKEN OPEN AIR",year:"2024",id:"gNf2eAFrUDo",start:776},
    {artist:"CEMICAN",title:"Ritual",place:"WACKEN OPEN AIR",year:"2023",id:"UE8ndD-u-Zg",start:0,end:363},
    {artist:"CEMICAN",title:"Cuando los Muertos Suspiran",place:"WACKEN OPEN AIR",year:"2023",id:"UE8ndD-u-Zg",start:363,end:718},
    {artist:"CEMICAN",title:"Guerreros de Cemican",place:"WACKEN OPEN AIR",year:"2023",id:"UE8ndD-u-Zg",start:718},
    {artist:"BURNING WITCHES",title:"Wings of Steel",place:"WACKEN OPEN AIR",year:"2023",id:"IXx3E3kvf0M",start:0,end:299},
    {artist:"BURNING WITCHES",title:"We Stand as One",place:"WACKEN OPEN AIR",year:"2023",id:"IXx3E3kvf0M",start:299,end:655},
    {artist:"BURNING WITCHES",title:"Hexenhammer",place:"WACKEN OPEN AIR",year:"2023",id:"IXx3E3kvf0M",start:655}
  ];

  const oldPlayer=host.querySelector(".audio-player"),oldAudio=document.getElementById("passportAudio");if(oldAudio){oldAudio.pause();oldAudio.removeAttribute("autoplay")}if(oldPlayer)oldPlayer.remove();
  const style=document.createElement("style");style.textContent=`
    .live-rare-stage{margin-top:18px;border:1px solid #333;background:#090909;overflow:hidden}
    .live-rare-video{position:relative;aspect-ratio:16/9;background:#050505;overflow:hidden;isolation:isolate}
    .live-rare-video iframe{position:absolute;left:-7%;top:-12%;width:114%;height:124%;border:0;pointer-events:none}
    .live-rare-cover{position:absolute;inset:0;z-index:5;display:flex;align-items:flex-end;padding:18px;background:#080808 center/cover no-repeat;cursor:pointer;transition:opacity .18s ease,visibility .18s ease}
    .live-rare-cover::before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.18) 42%,rgba(0,0,0,.90))}
    .live-rare-cover.is-hidden{opacity:0;visibility:hidden;pointer-events:none}
    .live-rare-cover-copy{position:relative;z-index:1;max-width:78%}
    .live-rare-cover-kicker{color:#d71920;font-size:.54rem;font-weight:900;letter-spacing:.13em;text-transform:uppercase}
    .live-rare-cover-title{margin-top:6px;color:#fff;font-size:clamp(1.05rem,3vw,1.8rem);font-weight:900;line-height:1.02}
    .live-rare-cover-play{position:absolute;z-index:2;right:18px;bottom:18px;width:58px;height:58px;display:grid;place-items:center;border-radius:50%;background:#d71920;color:#fff;font-size:1.25rem;font-weight:900;box-shadow:0 8px 24px rgba(0,0,0,.35)}
    .live-rare-console{padding:15px}.live-rare-brand{display:flex;justify-content:space-between;gap:12px;color:#d71920;font-size:.54rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase}
    .live-rare-title{margin-top:7px;font-size:1rem;font-weight:900;line-height:1.15}.live-rare-sub{margin-top:4px;color:#888;font-size:.59rem}
    .live-rare-controls{display:grid;grid-template-columns:auto auto auto 1fr;gap:9px;align-items:center;margin-top:14px}.live-rare-btn{width:38px;height:38px;border:1px solid #444;border-radius:50%;background:#171717;color:#fff;cursor:pointer;font-weight:900}.live-rare-btn--play{width:48px;height:48px;border-color:#d71920;background:#d71920}.live-rare-progress{width:100%;accent-color:#d71920}
    @media(max-width:560px){.live-rare-cover{padding:13px}.live-rare-cover-play{right:13px;bottom:13px;width:50px;height:50px}.live-rare-cover-copy{max-width:72%}.live-rare-console{padding:12px}.live-rare-controls{grid-template-columns:auto auto auto}.live-rare-progress{grid-column:1/-1}.live-rare-title{font-size:.9rem}}
  `;document.head.appendChild(style);
  const stage=document.createElement("div");stage.className="live-rare-stage";stage.innerHTML=`<div class="live-rare-video"><div id="passport-live-rare-video"></div><div class="live-rare-cover" id="liveRareCover"><div class="live-rare-cover-copy"><div class="live-rare-cover-kicker">LIVE & RARE · PASSPORT RADIO</div><div class="live-rare-cover-title" id="liveRareCoverTitle"></div></div><span class="live-rare-cover-play">▶</span></div></div><div class="live-rare-console"><div class="live-rare-brand"><span>LIVE & RARE · PASSPORT RADIO</span><span id="liveRareStatus">READY</span></div><div class="live-rare-title" id="liveRareTitle"></div><div class="live-rare-sub" id="liveRareMeta"></div><div class="live-rare-controls"><button class="live-rare-btn" id="liveRarePrev" type="button" aria-label="Anterior">◀</button><button class="live-rare-btn live-rare-btn--play" id="liveRarePlay" type="button" aria-label="Reproduzir">▶</button><button class="live-rare-btn" id="liveRareNext" type="button" aria-label="Próxima">▶</button><input class="live-rare-progress" id="liveRareProgress" type="range" min="0" max="100" step=".1" value="0" aria-label="Progresso"></div></div>`;host.appendChild(stage);
  let index=Math.floor(Math.random()*catalog.length),player=null,ready=false,timer=null;const q=id=>document.getElementById(id),title=q("liveRareTitle"),meta=q("liveRareMeta"),status=q("liveRareStatus"),play=q("liveRarePlay"),progress=q("liveRareProgress"),cover=q("liveRareCover"),coverTitle=q("liveRareCoverTitle");const item=()=>catalog[index];
  function poster(x){return `https://i.ytimg.com/vi/${x.id}/hqdefault.jpg`}
  function sync(){const x=item();title.textContent=`${x.artist} · ${x.title}`;meta.textContent=`${x.place} · ${x.year}`;coverTitle.textContent=`${x.artist} · ${x.title} · ${x.year}`;cover.style.backgroundImage=`url("${poster(x)}")`;cover.classList.remove("is-hidden");const top=q("currentTrackTitle");if(top)top.textContent=`${x.artist} · ${x.title} · ${x.year}`;const desc=q("currentTrackDescription");if(desc)desc.textContent="Passport Radio · Live & Rare";const bt=q("bottomTrackTitle");if(bt)bt.textContent=`${x.artist} · ${x.title}`;const bm=q("bottomTrackMeta");if(bm)bm.textContent="Passport Radio · Live & Rare"}
  function cue(auto=false){sync();progress.value=0;if(!ready)return;const x=item(),o={videoId:x.id,startSeconds:x.start||0};if(x.end)o.endSeconds=x.end;auto?player.loadVideoById(o):player.cueVideoById(o)}
  function move(step){index=(index+step+catalog.length)%catalog.length;cue(true)}
  function watch(){clearInterval(timer);timer=setInterval(()=>{if(!ready||!player.getCurrentTime)return;const x=item(),t=player.getCurrentTime(),start=x.start||0,end=x.end||player.getDuration();if(end>start)progress.value=Math.max(0,Math.min(100,((t-start)/(end-start))*100));if(x.end&&t>=x.end-.3)move(1)},500)}
  function makePlayer(){if(player||!window.YT||!YT.Player)return;player=new YT.Player("passport-live-rare-video",{playerVars:{playsinline:1,rel:0,controls:0,fs:0,disablekb:1,iv_load_policy:3,modestbranding:1},events:{onReady:()=>{ready=true;cue(false)},onStateChange:e=>{if(e.data===YT.PlayerState.PLAYING){status.textContent="ON AIR";play.textContent="Ⅱ";cover.classList.add("is-hidden");watch()}else if(e.data===YT.PlayerState.PAUSED||e.data===YT.PlayerState.CUED){status.textContent=e.data===YT.PlayerState.PAUSED?"PAUSED":"READY";play.textContent="▶";cover.classList.remove("is-hidden");clearInterval(timer)}else if(e.data===YT.PlayerState.ENDED)move(1)},onError:()=>{status.textContent="NEXT";cover.classList.remove("is-hidden");setTimeout(()=>move(1),500)}}})}
  function loadApi(){if(window.YT&&YT.Player){makePlayer();return}const s=document.createElement("script");s.src="https://www.youtube.com/iframe_api";document.head.appendChild(s);const prior=window.onYouTubeIframeAPIReady;window.onYouTubeIframeAPIReady=()=>{if(typeof prior==="function")prior();makePlayer()}}
  function toggle(){if(!ready)return;player.getPlayerState()===YT.PlayerState.PLAYING?player.pauseVideo():player.playVideo()}
  play.addEventListener("click",toggle);cover.addEventListener("click",toggle);q("liveRarePrev").addEventListener("click",()=>move(-1));q("liveRareNext").addEventListener("click",()=>move(1));progress.addEventListener("input",()=>{if(!ready)return;const x=item(),start=x.start||0,end=x.end||player.getDuration();if(end>start)player.seekTo(start+(Number(progress.value)/100)*(end-start),true)});
  const bp=q("bottomPlay"),bn=q("bottomNext");if(bp)bp.addEventListener("click",e=>{e.stopImmediatePropagation();toggle()},{capture:true});if(bn)bn.addEventListener("click",e=>{e.stopImmediatePropagation();move(1)},{capture:true});sync();loadApi();
})();