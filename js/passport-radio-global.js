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

/* PASSPORT RADIO · LIVE & RARE · UNDERGROUND AUDIO TUNNEL
   Sources supplied for this tunnel:
   WackenTV · BBC Music · The Midnight Special
   YouTube is transport only: its iframe is never part of the visible UI.
*/
(() => {
  "use strict";
  if(!document.body.classList.contains("live-page"))return;
  const host=document.getElementById("player");if(!host)return;

  const catalog=[
    /* THE MIDNIGHT SPECIAL · EP 1 · 02 FEB 1973 */
    {source:"THE MIDNIGHT SPECIAL",artist:"HELEN REDDY",title:"I Am Woman",place:"THE MIDNIGHT SPECIAL",year:"1973",id:"bf1mfLZhmjk",start:62,end:377},
    {source:"THE MIDNIGHT SPECIAL",artist:"IKE & TINA TURNER",title:"I Can't Turn You Loose",place:"THE MIDNIGHT SPECIAL",year:"1973",id:"bf1mfLZhmjk",start:377,end:620},
    {source:"THE MIDNIGHT SPECIAL",artist:"CURTIS MAYFIELD",title:"Superfly",place:"THE MIDNIGHT SPECIAL",year:"1973",id:"bf1mfLZhmjk",start:1019,end:1260},
    {source:"THE MIDNIGHT SPECIAL",artist:"DON McLEAN",title:"Dreidel",place:"THE MIDNIGHT SPECIAL",year:"1973",id:"bf1mfLZhmjk",start:1260,end:1513},
    {source:"THE MIDNIGHT SPECIAL",artist:"RARE EARTH",title:"We're Gonna Have a Good Time",place:"THE MIDNIGHT SPECIAL",year:"1973",id:"bf1mfLZhmjk",start:1513,end:1748},
    {source:"THE MIDNIGHT SPECIAL",artist:"HELEN REDDY",title:"Peaceful",place:"THE MIDNIGHT SPECIAL",year:"1973",id:"bf1mfLZhmjk",start:1748,end:2062},
    {source:"THE MIDNIGHT SPECIAL",artist:"KENNY RANKIN",title:"Comin' Down",place:"THE MIDNIGHT SPECIAL",year:"1973",id:"bf1mfLZhmjk",start:2062,end:2368},
    {source:"THE MIDNIGHT SPECIAL",artist:"THE BYRDS",title:"Mr. Tambourine Man / So You Want to Be a Rock 'n' Roll Star",place:"THE MIDNIGHT SPECIAL",year:"1973",id:"bf1mfLZhmjk",start:2368,end:2640},
    {source:"THE MIDNIGHT SPECIAL",artist:"THE IMPRESSIONS",title:"Preacher Man",place:"THE MIDNIGHT SPECIAL",year:"1973",id:"bf1mfLZhmjk",start:2640,end:2906},
    {source:"THE MIDNIGHT SPECIAL",artist:"HELEN REDDY · CURTIS MAYFIELD · THE IMPRESSIONS",title:"Amen",place:"THE MIDNIGHT SPECIAL",year:"1973",id:"bf1mfLZhmjk",start:2906,end:3101},
    {source:"THE MIDNIGHT SPECIAL",artist:"IKE & TINA TURNER",title:"With a Little Help from My Friends",place:"THE MIDNIGHT SPECIAL",year:"1973",id:"bf1mfLZhmjk",start:3101,end:3282},
    {source:"THE MIDNIGHT SPECIAL",artist:"DON McLEAN",title:"If We Try",place:"THE MIDNIGHT SPECIAL",year:"1973",id:"bf1mfLZhmjk",start:3282,end:3487},
    {source:"THE MIDNIGHT SPECIAL",artist:"RARE EARTH",title:"I Just Want to Celebrate",place:"THE MIDNIGHT SPECIAL",year:"1973",id:"bf1mfLZhmjk",start:3487,end:3793},
    {source:"THE MIDNIGHT SPECIAL",artist:"HELEN REDDY",title:"Come On John",place:"THE MIDNIGHT SPECIAL",year:"1973",id:"bf1mfLZhmjk",start:3793},

    /* THE MIDNIGHT SPECIAL · EP 71 · 07 JUN 1974 */
    {source:"THE MIDNIGHT SPECIAL",artist:"THE KINKS",title:"You Really Got Me",place:"THE MIDNIGHT SPECIAL",year:"1974",id:"yxgut9pmopU",start:100,end:384},
    {source:"THE MIDNIGHT SPECIAL",artist:"ELECTRIC LIGHT ORCHESTRA",title:"Showdown",place:"THE MIDNIGHT SPECIAL",year:"1974",id:"yxgut9pmopU",start:384,end:649},
    {source:"THE MIDNIGHT SPECIAL",artist:"BUDDY MILES",title:"Life Is What You Make It",place:"THE MIDNIGHT SPECIAL",year:"1974",id:"yxgut9pmopU",start:649,end:1130},
    {source:"THE MIDNIGHT SPECIAL",artist:"ALAN PRICE",title:"In Times Like These",place:"THE MIDNIGHT SPECIAL",year:"1974",id:"yxgut9pmopU",start:1130,end:1350},
    {source:"THE MIDNIGHT SPECIAL",artist:"SUZI QUATRO",title:"All Shook Up",place:"THE MIDNIGHT SPECIAL",year:"1974",id:"yxgut9pmopU",start:1350,end:1648},
    {source:"THE MIDNIGHT SPECIAL",artist:"THE KINKS",title:"Money Talks",place:"THE MIDNIGHT SPECIAL",year:"1974",id:"yxgut9pmopU",start:1648,end:1887},
    {source:"THE MIDNIGHT SPECIAL",artist:"RORY GALLAGHER",title:"Hands Off",place:"THE MIDNIGHT SPECIAL",year:"1974",id:"yxgut9pmopU",start:1887,end:2201},
    {source:"THE MIDNIGHT SPECIAL",artist:"ELECTRIC LIGHT ORCHESTRA",title:"Bluebird Is Dead",place:"THE MIDNIGHT SPECIAL",year:"1974",id:"yxgut9pmopU",start:2201,end:2503},
    {source:"THE MIDNIGHT SPECIAL",artist:"SUZI QUATRO",title:"Glycerine Queen",place:"THE MIDNIGHT SPECIAL",year:"1974",id:"yxgut9pmopU",start:2503,end:2728},
    {source:"THE MIDNIGHT SPECIAL",artist:"THE KINKS",title:"Here Comes Yet Another Day",place:"THE MIDNIGHT SPECIAL",year:"1974",id:"yxgut9pmopU",start:2728,end:3003},
    {source:"THE MIDNIGHT SPECIAL",artist:"THE KINKS",title:"Celluloid Heroes",place:"THE MIDNIGHT SPECIAL",year:"1974",id:"yxgut9pmopU",start:3003,end:3267},
    {source:"THE MIDNIGHT SPECIAL",artist:"ALAN PRICE",title:"Between Today and Yesterday",place:"THE MIDNIGHT SPECIAL",year:"1974",id:"yxgut9pmopU",start:3267,end:3532},
    {source:"THE MIDNIGHT SPECIAL",artist:"RORY GALLAGHER",title:"Who's That Comin'",place:"THE MIDNIGHT SPECIAL",year:"1974",id:"yxgut9pmopU",start:3532,end:3900},
    {source:"THE MIDNIGHT SPECIAL",artist:"THE KINKS",title:"Skin and Bone",place:"THE MIDNIGHT SPECIAL",year:"1974",id:"yxgut9pmopU",start:3900},

    /* BBC MUSIC */
    {source:"BBC MUSIC",artist:"U2",title:"With Or Without You",place:"ABBEY ROAD",year:"2017",id:"6DeDzsCGbsQ",start:0},
    {source:"BBC MUSIC",artist:"PANIC! AT THE DISCO",title:"High Hopes",place:"READING + LEEDS",year:"2018",id:"bnZqZxRcM7Y",start:0},

    /* WACKENTV */
    {source:"WACKENTV",artist:"ACCEPT",title:"Princess of the Dawn",place:"WACKEN OPEN AIR",year:"2024",id:"gNf2eAFrUDo",start:0,end:450},
    {source:"WACKENTV",artist:"ACCEPT",title:"Teutonic Terror",place:"WACKEN OPEN AIR",year:"2024",id:"gNf2eAFrUDo",start:450,end:776},
    {source:"WACKENTV",artist:"ACCEPT",title:"Fast as a Shark",place:"WACKEN OPEN AIR",year:"2024",id:"gNf2eAFrUDo",start:776},
    {source:"WACKENTV",artist:"CEMICAN",title:"Ritual",place:"WACKEN OPEN AIR",year:"2023",id:"UE8ndD-u-Zg",start:0,end:363},
    {source:"WACKENTV",artist:"CEMICAN",title:"Cuando los Muertos Suspiran",place:"WACKEN OPEN AIR",year:"2023",id:"UE8ndD-u-Zg",start:363,end:718},
    {source:"WACKENTV",artist:"CEMICAN",title:"Guerreros de Cemican",place:"WACKEN OPEN AIR",year:"2023",id:"UE8ndD-u-Zg",start:718},
    {source:"WACKENTV",artist:"BURNING WITCHES",title:"Wings of Steel",place:"WACKEN OPEN AIR",year:"2023",id:"IXx3E3kvf0M",start:0,end:299},
    {source:"WACKENTV",artist:"BURNING WITCHES",title:"We Stand as One",place:"WACKEN OPEN AIR",year:"2023",id:"IXx3E3kvf0M",start:299,end:655},
    {source:"WACKENTV",artist:"BURNING WITCHES",title:"Hexenhammer",place:"WACKEN OPEN AIR",year:"2023",id:"IXx3E3kvf0M",start:655}
  ];

  const oldPlayer=host.querySelector(".audio-player"),oldAudio=document.getElementById("passportAudio");
  if(oldAudio){oldAudio.pause();oldAudio.removeAttribute("autoplay")}
  if(oldPlayer)oldPlayer.remove();

  const style=document.createElement("style");style.textContent=`
    .live-rare-stage{position:relative;margin-top:18px;border:1px solid #303030;background:#090909;overflow:hidden}
    .live-rare-engine{position:fixed!important;left:-99999px!important;top:-99999px!important;width:1px!important;height:1px!important;max-width:1px!important;max-height:1px!important;opacity:0!important;visibility:hidden!important;overflow:hidden!important;pointer-events:none!important;z-index:-2147483647!important}
    .live-rare-engine iframe,.live-rare-engine object,.live-rare-engine embed{position:absolute!important;left:-99999px!important;top:-99999px!important;width:1px!important;height:1px!important;max-width:1px!important;max-height:1px!important;border:0!important;opacity:0!important;visibility:hidden!important;pointer-events:none!important}
    .live-rare-tunnel{position:relative;min-height:178px;display:flex;align-items:flex-end;padding:20px;overflow:hidden;background:radial-gradient(ellipse at 50% 55%,#292929 0,#171717 24%,#0b0b0b 52%,#050505 76%,#020202 100%)}
    .live-rare-tunnel:before{content:"";position:absolute;inset:-40%;background:repeating-radial-gradient(ellipse at center,transparent 0 22px,rgba(255,255,255,.035) 23px 24px,transparent 25px 44px);transform:scaleY(.42);animation:tunnelPulse 4s linear infinite;pointer-events:none}
    .live-rare-tunnel:after{content:"";position:absolute;left:50%;top:50%;width:8px;height:8px;border-radius:50%;background:#d71920;box-shadow:0 0 20px 5px rgba(215,25,32,.5);transform:translate(-50%,-50%)}
    @keyframes tunnelPulse{from{transform:scaleY(.42) scale(.82)}to{transform:scaleY(.42) scale(1.18)}}
    .live-rare-tunnel-copy{position:relative;z-index:2;max-width:78%}.live-rare-kicker{color:#d71920;font-size:.54rem;font-weight:900;letter-spacing:.14em;text-transform:uppercase}.live-rare-tunnel-title{margin-top:7px;color:#fff;font-size:clamp(1.05rem,3vw,1.8rem);font-weight:900;line-height:1.02}.live-rare-tunnel-meta{margin-top:6px;color:#8b8b8b;font-size:.58rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase}
    .live-rare-console{padding:15px;border-top:1px solid #262626}.live-rare-brand{display:flex;justify-content:space-between;gap:12px;color:#d71920;font-size:.54rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.live-rare-title{margin-top:7px;color:#fff;font-size:1rem;font-weight:900;line-height:1.15}.live-rare-sub{margin-top:4px;color:#888;font-size:.59rem}.live-rare-controls{display:grid;grid-template-columns:auto auto auto 1fr;gap:9px;align-items:center;margin-top:14px}.live-rare-btn{width:38px;height:38px;border:1px solid #444;border-radius:50%;background:#171717;color:#fff;cursor:pointer;font-weight:900}.live-rare-btn--play{width:48px;height:48px;border-color:#d71920;background:#d71920}.live-rare-progress{width:100%;accent-color:#d71920}
    @media(max-width:560px){.live-rare-tunnel{min-height:155px;padding:14px}.live-rare-tunnel-copy{max-width:86%}.live-rare-console{padding:12px}.live-rare-controls{grid-template-columns:auto auto auto}.live-rare-progress{grid-column:1/-1}.live-rare-title{font-size:.9rem}}
  `;document.head.appendChild(style);

  const stage=document.createElement("div");stage.className="live-rare-stage";stage.innerHTML=`<div class="live-rare-engine" aria-hidden="true"><div id="passport-live-rare-engine"></div></div><div class="live-rare-tunnel"><div class="live-rare-tunnel-copy"><div class="live-rare-kicker">LIVE & RARE · PASSPORT RADIO</div><div class="live-rare-tunnel-title" id="liveRareTunnelTitle"></div><div class="live-rare-tunnel-meta" id="liveRareTunnelMeta"></div></div></div><div class="live-rare-console"><div class="live-rare-brand"><span>LIVE & RARE · PASSPORT RADIO</span><span id="liveRareStatus">READY</span></div><div class="live-rare-title" id="liveRareTitle"></div><div class="live-rare-sub" id="liveRareMeta"></div><div class="live-rare-controls"><button class="live-rare-btn" id="liveRarePrev" type="button" aria-label="Anterior">◀</button><button class="live-rare-btn live-rare-btn--play" id="liveRarePlay" type="button" aria-label="Reproduzir">▶</button><button class="live-rare-btn" id="liveRareNext" type="button" aria-label="Próxima">▶</button><input class="live-rare-progress" id="liveRareProgress" type="range" min="0" max="100" step=".1" value="0" aria-label="Progresso"></div></div>`;host.appendChild(stage);

  let index=Math.floor(Math.random()*catalog.length),player=null,ready=false,timer=null;
  const q=id=>document.getElementById(id),title=q("liveRareTitle"),meta=q("liveRareMeta"),status=q("liveRareStatus"),play=q("liveRarePlay"),progress=q("liveRareProgress"),tunnelTitle=q("liveRareTunnelTitle"),tunnelMeta=q("liveRareTunnelMeta");
  const item=()=>catalog[index];
  function sync(){const x=item();const name=`${x.artist} · ${x.title}`;title.textContent=name;meta.textContent=`${x.source} · ${x.place} · ${x.year}`;tunnelTitle.textContent=name;tunnelMeta.textContent=`${x.source} · ${x.place} · ${x.year}`;const top=q("currentTrackTitle");if(top)top.textContent=`${name} · ${x.year}`;const desc=q("currentTrackDescription");if(desc)desc.textContent="Passport Radio · Live & Rare";const bt=q("bottomTrackTitle");if(bt)bt.textContent=name;const bm=q("bottomTrackMeta");if(bm)bm.textContent=`${x.source} · Live & Rare`}
  function cue(auto=false){sync();progress.value=0;if(!ready)return;const x=item(),o={videoId:x.id,startSeconds:x.start||0};if(x.end)o.endSeconds=x.end;auto?player.loadVideoById(o):player.cueVideoById(o)}
  function move(step){index=(index+step+catalog.length)%catalog.length;cue(true)}
  function watch(){clearInterval(timer);timer=setInterval(()=>{if(!ready||!player.getCurrentTime)return;const x=item(),t=player.getCurrentTime(),start=x.start||0,end=x.end||player.getDuration();if(end>start)progress.value=Math.max(0,Math.min(100,((t-start)/(end-start))*100));if(x.end&&t>=x.end-.3)move(1)},500)}
  function makePlayer(){if(player||!window.YT||!YT.Player)return;player=new YT.Player("passport-live-rare-engine",{width:"1",height:"1",playerVars:{playsinline:1,rel:0,controls:0,fs:0,disablekb:1,iv_load_policy:3},events:{onReady:()=>{ready=true;cue(false)},onStateChange:e=>{if(e.data===YT.PlayerState.PLAYING){status.textContent="ON AIR";play.textContent="Ⅱ";watch()}else if(e.data===YT.PlayerState.PAUSED||e.data===YT.PlayerState.CUED){status.textContent=e.data===YT.PlayerState.PAUSED?"PAUSED":"READY";play.textContent="▶";clearInterval(timer)}else if(e.data===YT.PlayerState.ENDED)move(1)},onError:()=>{status.textContent="NEXT";setTimeout(()=>move(1),500)}}})}
  function loadApi(){if(window.YT&&YT.Player){makePlayer();return}const s=document.createElement("script");s.src="https://www.youtube.com/iframe_api";document.head.appendChild(s);const prior=window.onYouTubeIframeAPIReady;window.onYouTubeIframeAPIReady=()=>{if(typeof prior==="function")prior();makePlayer()}}
  function toggle(){if(!ready)return;player.getPlayerState()===YT.PlayerState.PLAYING?player.pauseVideo():player.playVideo()}
  play.addEventListener("click",toggle);q("liveRarePrev").addEventListener("click",()=>move(-1));q("liveRareNext").addEventListener("click",()=>move(1));
  progress.addEventListener("input",()=>{if(!ready)return;const x=item(),start=x.start||0,end=x.end||player.getDuration();if(end>start)player.seekTo(start+((end-start)*Number(progress.value)/100),true)});
  const bottomPlay=q("bottomPlayButton");if(bottomPlay)bottomPlay.addEventListener("click",toggle);const bottomNext=q("bottomNextButton");if(bottomNext)bottomNext.addEventListener("click",()=>move(1));
  sync();loadApi();
})();
