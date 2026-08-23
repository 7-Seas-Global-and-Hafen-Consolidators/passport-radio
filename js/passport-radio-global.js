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

/* PASSPORT RADIO · LIVE & RARE · WACKENTV FULL UNDERGROUND TUNNEL
   This block is intentionally restricted to body.live-page + #player.
   It does not initialize on the separate 24h online-player pages.
   WackenTV channel: UCvQT6N9nu2BJ-lJuMg1jEZQ
   Uploads playlist: UUvQT6N9nu2BJ-lJuMg1jEZQ
   No hand-picked catalog and no title filter: the tunnel follows the channel uploads archive.
*/
(() => {
  "use strict";
  if(!document.body.classList.contains("live-page"))return;
  const host=document.getElementById("player");if(!host)return;

  const WACKEN_UPLOADS="UUvQT6N9nu2BJ-lJuMg1jEZQ";
  const oldPlayer=host.querySelector(".audio-player"),oldAudio=document.getElementById("passportAudio");
  if(oldAudio){oldAudio.pause();oldAudio.removeAttribute("autoplay")}
  if(oldPlayer)oldPlayer.remove();

  const style=document.createElement("style");
  style.textContent=`
    .live-rare-stage{position:relative;margin-top:18px;border:1px solid #303030;background:#090909;overflow:hidden}
    .live-rare-engine{position:fixed!important;left:-99999px!important;top:-99999px!important;width:1px!important;height:1px!important;opacity:0!important;visibility:hidden!important;overflow:hidden!important;pointer-events:none!important;z-index:-2147483647!important}
    .live-rare-engine iframe{position:absolute!important;left:-99999px!important;top:-99999px!important;width:1px!important;height:1px!important;border:0!important;opacity:0!important;visibility:hidden!important;pointer-events:none!important}
    .live-rare-tunnel{position:relative;min-height:178px;display:flex;align-items:flex-end;padding:20px;overflow:hidden;background:radial-gradient(ellipse at 50% 55%,#292929 0,#171717 24%,#0b0b0b 52%,#050505 76%,#020202 100%)}
    .live-rare-tunnel:before{content:"";position:absolute;inset:-40%;background:repeating-radial-gradient(ellipse at center,transparent 0 22px,rgba(255,255,255,.035) 23px 24px,transparent 25px 44px);transform:scaleY(.42);animation:tunnelPulse 4s linear infinite;pointer-events:none}
    .live-rare-tunnel:after{content:"";position:absolute;left:50%;top:50%;width:8px;height:8px;border-radius:50%;background:#d71920;box-shadow:0 0 20px 5px rgba(215,25,32,.5);transform:translate(-50%,-50%)}
    @keyframes tunnelPulse{from{transform:scaleY(.42) scale(.82)}to{transform:scaleY(.42) scale(1.18)}}
    .live-rare-tunnel-copy{position:relative;z-index:2;max-width:88%}.live-rare-kicker{color:#d71920;font-size:.54rem;font-weight:900;letter-spacing:.14em;text-transform:uppercase}.live-rare-tunnel-title{margin-top:7px;color:#fff;font-size:clamp(1.05rem,3vw,1.8rem);font-weight:900;line-height:1.02}.live-rare-tunnel-meta{margin-top:6px;color:#8b8b8b;font-size:.58rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase}
    .live-rare-console{padding:15px;border-top:1px solid #262626}.live-rare-brand{display:flex;justify-content:space-between;gap:12px;color:#d71920;font-size:.54rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.live-rare-title{margin-top:7px;color:#fff;font-size:1rem;font-weight:900;line-height:1.15}.live-rare-sub{margin-top:4px;color:#888;font-size:.59rem}.live-rare-controls{display:grid;grid-template-columns:auto auto auto 1fr;gap:9px;align-items:center;margin-top:14px}.live-rare-btn{width:38px;height:38px;border:1px solid #444;border-radius:50%;background:#171717;color:#fff;cursor:pointer;font-weight:900}.live-rare-btn--play{width:48px;height:48px;border-color:#d71920;background:#d71920}.live-rare-progress{width:100%;accent-color:#d71920}
    @media(max-width:560px){.live-rare-tunnel{min-height:155px;padding:14px}.live-rare-console{padding:12px}.live-rare-controls{grid-template-columns:auto auto auto}.live-rare-progress{grid-column:1/-1}.live-rare-title{font-size:.9rem}}
  `;
  document.head.appendChild(style);

  const stage=document.createElement("div");
  stage.className="live-rare-stage";
  stage.innerHTML=`<div class="live-rare-engine" aria-hidden="true"><div id="passport-live-rare-engine"></div></div><div class="live-rare-tunnel"><div class="live-rare-tunnel-copy"><div class="live-rare-kicker">LIVE & RARE · PASSPORT RADIO</div><div class="live-rare-tunnel-title" id="liveRareTunnelTitle">Carregando WackenTV…</div><div class="live-rare-tunnel-meta" id="liveRareTunnelMeta">WACKEN OPEN AIR · COMPLETE CHANNEL FEED</div></div></div><div class="live-rare-console"><div class="live-rare-brand"><span>LIVE & RARE · PASSPORT RADIO</span><span id="liveRareStatus">LOADING</span></div><div class="live-rare-title" id="liveRareTitle">WackenTV</div><div class="live-rare-sub" id="liveRareMeta">WackenTV · Underground Archive</div><div class="live-rare-controls"><button class="live-rare-btn" id="liveRarePrev" type="button" aria-label="Anterior">◀</button><button class="live-rare-btn live-rare-btn--play" id="liveRarePlay" type="button" aria-label="Reproduzir">▶</button><button class="live-rare-btn" id="liveRareNext" type="button" aria-label="Próxima">▶</button><input class="live-rare-progress" id="liveRareProgress" type="range" min="0" max="100" step=".1" value="0" aria-label="Progresso"></div></div>`;
  host.appendChild(stage);

  const q=id=>document.getElementById(id);
  const title=q("liveRareTitle"),meta=q("liveRareMeta"),status=q("liveRareStatus"),play=q("liveRarePlay"),progress=q("liveRareProgress"),tunnelTitle=q("liveRareTunnelTitle"),tunnelMeta=q("liveRareTunnelMeta");
  let player=null,ready=false,timer=null;

  function parseDisplay(raw){
    const clean=String(raw||"WackenTV").replace(/\s+-\s+YouTube$/i,"").trim();
    const year=(clean.match(/\b(19|20)\d{2}\b/)||[])[0]||"";
    const artist=(clean.split(/\s+-\s+/)[0]||clean).trim();
    return {clean,artist,year};
  }

  function syncFromVideo(){
    if(!ready)return false;
    const data=player.getVideoData?player.getVideoData():{};
    const raw=data&&data.title?data.title:"WackenTV";
    const d=parseDisplay(raw);
    title.textContent=d.clean;
    meta.textContent=`WACKENTV · CHANNEL ARCHIVE${d.year?` · ${d.year}`:""}`;
    tunnelTitle.textContent=d.clean;
    tunnelMeta.textContent=`WACKENTV · UNDERGROUND FEED${d.year?` · ${d.year}`:""}`;
    const top=q("currentTrackTitle");if(top)top.textContent=d.clean;
    const desc=q("currentTrackDescription");if(desc)desc.textContent="Passport Radio · Live & Rare · WackenTV";
    const bt=q("bottomTrackTitle");if(bt)bt.textContent=d.artist;
    const bm=q("bottomTrackMeta");if(bm)bm.textContent=`WackenTV · Live & Rare${d.year?` · ${d.year}`:""}`;
    return true;
  }

  function watch(){
    clearInterval(timer);
    timer=setInterval(()=>{
      if(!ready||!player.getCurrentTime)return;
      const dur=player.getDuration?player.getDuration():0,t=player.getCurrentTime();
      if(dur>0)progress.value=Math.max(0,Math.min(100,(t/dur)*100));
    },500);
  }

  function makePlayer(){
    if(player||!window.YT||!YT.Player)return;
    player=new YT.Player("passport-live-rare-engine",{
      width:"1",height:"1",
      playerVars:{playsinline:1,rel:0,controls:0,fs:0,disablekb:1,iv_load_policy:3},
      events:{
        onReady:()=>{ready=true;status.textContent="READY";player.cuePlaylist({listType:"playlist",list:WACKEN_UPLOADS,index:0});},
        onStateChange:e=>{
          if(e.data===YT.PlayerState.CUED){syncFromVideo();status.textContent="READY";play.textContent="▶";}
          else if(e.data===YT.PlayerState.PLAYING){syncFromVideo();status.textContent="ON AIR";play.textContent="Ⅱ";watch();}
          else if(e.data===YT.PlayerState.PAUSED){syncFromVideo();status.textContent="PAUSED";play.textContent="▶";clearInterval(timer);}
          else if(e.data===YT.PlayerState.ENDED){player.nextVideo();}
        },
        onError:()=>{status.textContent="NEXT";setTimeout(()=>player.nextVideo(),100);}
      }
    });
  }

  function loadApi(){
    if(window.YT&&YT.Player){makePlayer();return}
    const s=document.createElement("script");s.src="https://www.youtube.com/iframe_api";document.head.appendChild(s);
    const prior=window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady=()=>{if(typeof prior==="function")prior();makePlayer()};
  }

  function toggle(){if(!ready)return;player.getPlayerState()===YT.PlayerState.PLAYING?player.pauseVideo():player.playVideo()}
  play.addEventListener("click",toggle);
  q("liveRarePrev").addEventListener("click",()=>{if(!ready)return;status.textContent="LOADING";player.previousVideo()});
  q("liveRareNext").addEventListener("click",()=>{if(!ready)return;status.textContent="LOADING";player.nextVideo()});
  progress.addEventListener("input",()=>{if(!ready)return;const dur=player.getDuration?player.getDuration():0;if(dur>0)player.seekTo((Number(progress.value)/100)*dur,true)});
  const bp=q("bottomPlay");if(bp)bp.addEventListener("click",e=>{e.stopImmediatePropagation();toggle()},{capture:true});
  const bn=q("bottomNext");if(bn)bn.addEventListener("click",e=>{e.stopImmediatePropagation();player.nextVideo()},{capture:true});
  loadApi();
})();
