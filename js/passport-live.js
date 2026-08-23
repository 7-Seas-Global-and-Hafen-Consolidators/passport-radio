/* PASSPORT RADIO — LIVE + LIVE ARCHIVE ENGINE */
(() => {
  "use strict";

  const CHANNELS = {
    metal:{label:"METAL",stream:"https://stations.radio-host.com/proxy/metalmanialive/stream"},
    unplugged:{label:"UNPLUGGED",stream:"https://stations.radio-host.com/proxy/unpluggedlive/stream"},
    livejam:{label:"LIVE JAM",stream:"https://stations.radio-host.com/proxy/livejam/stream"}
  };

  /*
    LIVE ARCHIVE V1
    ----------------
    The player is source-agnostic. These are seed records only; the catalog can
    grow from The Midnight Special, BBC Music and WackenTV without changing UI.
    YouTube remains the playback provider through its official embedded player.
  */
  const ARCHIVE = [
    {source:"THE MIDNIGHT SPECIAL",artist:"THE KINKS",title:"You Really Got Me",year:"1974",youtubeId:"yxgut9pmopU",start:100,end:384},
    {source:"THE MIDNIGHT SPECIAL",artist:"ELECTRIC LIGHT ORCHESTRA",title:"Showdown",year:"1974",youtubeId:"yxgut9pmopU",start:384,end:1350},
    {source:"THE MIDNIGHT SPECIAL",artist:"SUZI QUATRO",title:"All Shook Up",year:"1974",youtubeId:"yxgut9pmopU",start:1350,end:1887},
    {source:"THE MIDNIGHT SPECIAL",artist:"RORY GALLAGHER",title:"Hands Off",year:"1974",youtubeId:"yxgut9pmopU",start:1887,end:2201},
    {source:"THE MIDNIGHT SPECIAL",artist:"ELECTRIC LIGHT ORCHESTRA",title:"Bluebird Is Dead",year:"1974",youtubeId:"yxgut9pmopU",start:2201,end:3003},
    {source:"THE MIDNIGHT SPECIAL",artist:"THE KINKS",title:"Celluloid Heroes",year:"1974",youtubeId:"yxgut9pmopU",start:3003,end:3532},
    {source:"THE MIDNIGHT SPECIAL",artist:"RORY GALLAGHER",title:"Who's That Comin'",year:"1974",youtubeId:"yxgut9pmopU",start:3532}
  ];

  let mode="stream";
  let currentChannel="metal";
  let archiveIndex=Math.floor(Math.random()*ARCHIVE.length);
  let yt=null;
  let ytReady=false;
  let archivePlaying=false;
  let endTimer=null;

  const $=id=>document.getElementById(id);
  const archiveAudio=()=>$("audio");
  const liveAudio=()=>$("passport-live-audio");
  const livePlay=()=>$("passport-live-play");
  const status=t=>{const e=$("passport-live-status");if(e)e.textContent=t;};
  const label=t=>{const e=$("passport-live-channel-name");if(e)e.textContent=t;};

  function stopArchiveAudio(){const a=archiveAudio();if(a&&!a.paused)a.pause();}
  function stopLive(){const a=liveAudio();if(a&&!a.paused)a.pause();}
  function clearEndTimer(){if(endTimer){clearInterval(endTimer);endTimer=null;}}
  function stopYouTube(){clearEndTimer();archivePlaying=false;if(yt&&ytReady&&yt.pauseVideo)yt.pauseVideo();}

  function updateButtons(key){
    document.querySelectorAll("[data-live-channel]").forEach(b=>b.classList.toggle("is-active",b.dataset.liveChannel===key));
  }

  function updateArchiveCopy(item){
    const title=$("passport-live-archive-title");
    const meta=$("passport-live-archive-meta");
    if(title)title.textContent=`${item.artist} · ${item.title}`;
    if(meta)meta.textContent=`${item.year} · ${item.source}`;
  }

  function buildPlayer(){
    const host=$("passport-live-radio");
    if(!host)return;
    host.innerHTML=`
      <section class="passport-live-panel">
        <div class="passport-live-head"><div><small>PASSPORT LIVE</small><strong id="passport-live-channel-name">METAL</strong></div></div>
        <div class="passport-live-channels">
          <button type="button" class="passport-live-channel is-active" data-live-channel="metal">METAL</button>
          <button type="button" class="passport-live-channel" data-live-channel="unplugged">UNPLUGGED</button>
          <button type="button" class="passport-live-channel" data-live-channel="livejam">LIVE JAM</button>
          <button type="button" class="passport-live-channel passport-live-channel--archive" data-live-channel="archive">LIVE ARCHIVE</button>
        </div>
        <div id="passport-live-archive-copy" class="passport-live-archive-copy" hidden>
          <strong id="passport-live-archive-title">LIVE ARCHIVE</strong>
          <small id="passport-live-archive-meta">PASSPORT RADIO</small>
        </div>
        <div class="passport-live-controls">
          <button id="passport-live-prev" type="button" aria-label="Anterior" title="Anterior" hidden>◀</button>
          <button id="passport-live-play" type="button" class="passport-live-play" aria-label="Ouvir" title="Ouvir">▶</button>
          <button id="passport-live-next" type="button" aria-label="Próxima" title="Próxima" hidden>▶</button>
          <span id="passport-live-status">PRONTO</span>
        </div>
        <audio id="passport-live-audio" preload="none"></audio>
        <div id="passport-youtube-stage" class="passport-youtube-stage" aria-hidden="true"><div id="passport-youtube-player"></div></div>
      </section>`;
    installChannelButtons();
    installControls();
    selectChannel("metal",false);
    loadYouTubeAPI();
  }

  function loadYouTubeAPI(){
    if(window.YT&&window.YT.Player){createYouTubePlayer();return;}
    if(!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')){
      const s=document.createElement("script");s.src="https://www.youtube.com/iframe_api";document.head.appendChild(s);
    }
    const old=window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady=()=>{if(typeof old==="function")old();createYouTubePlayer();};
  }

  function createYouTubePlayer(){
    if(yt||!$("passport-youtube-player")||!window.YT)return;
    yt=new YT.Player("passport-youtube-player",{
      height:"1",width:"1",
      playerVars:{autoplay:0,controls:0,playsinline:1,rel:0,modestbranding:1},
      events:{
        onReady:()=>{ytReady=true;if(mode==="archive")status("PRONTO");},
        onStateChange:e=>{
          if(e.data===YT.PlayerState.PLAYING){archivePlaying=true;status("NO AR");const b=livePlay();if(b)b.textContent="Ⅱ";watchEnd();}
          if(e.data===YT.PlayerState.PAUSED){archivePlaying=false;clearEndTimer();const b=livePlay();if(b)b.textContent="▶";if(mode==="archive")status("PAUSADO");}
          if(e.data===YT.PlayerState.ENDED&&mode==="archive")nextArchive(true);
        },
        onError:()=>{archivePlaying=false;clearEndTimer();status("REGISTRO INDISPONÍVEL");}
      }
    });
  }

  function watchEnd(){
    clearEndTimer();
    const item=ARCHIVE[archiveIndex];
    if(!item.end)return;
    endTimer=setInterval(()=>{
      if(mode==="archive"&&ytReady&&yt.getCurrentTime&&yt.getCurrentTime()>=item.end-0.25)nextArchive(true);
    },500);
  }

  function loadArchive(index,autoplay){
    archiveIndex=(index+ARCHIVE.length)%ARCHIVE.length;
    const item=ARCHIVE[archiveIndex];
    updateArchiveCopy(item);
    if(!ytReady){status("CARREGANDO ARCHIVE");return;}
    stopLive();stopArchiveAudio();clearEndTimer();
    const opts={videoId:item.youtubeId,startSeconds:item.start||0};
    if(item.end)opts.endSeconds=item.end;
    if(autoplay)yt.loadVideoById(opts);else yt.cueVideoById(opts);
    status(autoplay?"CONECTANDO":"PRONTO");
  }

  function nextArchive(autoplay=true){loadArchive(archiveIndex+1,autoplay);}
  function prevArchive(){loadArchive(archiveIndex-1,true);}

  function installChannelButtons(){
    document.querySelectorAll("[data-live-channel]").forEach(button=>button.addEventListener("click",()=>selectChannel(button.dataset.liveChannel,true)));
  }

  function installControls(){
    const play=livePlay(), live=liveAudio();
    if(!play||!live)return;
    play.addEventListener("click",async()=>{
      if(mode==="archive"){
        stopLive();stopArchiveAudio();
        if(!ytReady){status("CARREGANDO ARCHIVE");return;}
        if(archivePlaying){yt.pauseVideo();return;}
        const item=ARCHIVE[archiveIndex];
        const current=yt.getVideoData&&yt.getVideoData().video_id;
        if(current===item.youtubeId){yt.playVideo();}else{loadArchive(archiveIndex,true);}
        return;
      }
      stopYouTube();stopArchiveAudio();
      if(!live.src){status("CANAL SEM STREAM");return;}
      if(!live.paused){live.pause();return;}
      status("CONECTANDO");
      try{await live.play();}catch(e){console.error("[Passport Live]",e);status("ERRO AO CONECTAR");}
    });
    $("passport-live-next").addEventListener("click",()=>nextArchive(true));
    $("passport-live-prev").addEventListener("click",prevArchive);
    live.addEventListener("playing",()=>{play.textContent="Ⅱ";status("NO AR");});
    live.addEventListener("pause",()=>{if(mode==="stream"){play.textContent="▶";status("PAUSADO");}});
    live.addEventListener("waiting",()=>status("CONECTANDO"));
    live.addEventListener("stalled",()=>status("RECONECTANDO"));
    live.addEventListener("error",()=>{play.textContent="▶";status("SINAL INDISPONÍVEL");});
  }

  function selectChannel(key,autoplay){
    const live=liveAudio(), play=livePlay();
    if(!live)return;
    if(key==="archive"){
      mode="archive";currentChannel="archive";live.pause();live.removeAttribute("src");live.load();
      label("LIVE ARCHIVE");updateButtons("archive");
      $("passport-live-archive-copy").hidden=false;$("passport-live-prev").hidden=false;$("passport-live-next").hidden=false;
      play.textContent="▶";loadArchive(archiveIndex,autoplay);return;
    }
    const config=CHANNELS[key];if(!config)return;
    mode="stream";currentChannel=key;stopYouTube();
    $("passport-live-archive-copy").hidden=true;$("passport-live-prev").hidden=true;$("passport-live-next").hidden=true;
    live.pause();live.removeAttribute("src");live.load();label(config.label);updateButtons(key);live.src=config.stream;live.load();play.textContent="▶";status("PRONTO");
    if(autoplay){stopArchiveAudio();status("CONECTANDO");live.play().catch(()=>status("CLIQUE NO PLAY"));}
  }

  function installMutualExclusion(){
    document.addEventListener("play",event=>{
      const t=event.target;if(!(t instanceof HTMLMediaElement))return;
      if(t.id==="passport-live-audio")stopArchiveAudio();
      if(t.id==="audio"){stopLive();stopYouTube();}
    },true);
  }

  function boot(){buildPlayer();installMutualExclusion();console.log("[Passport Live] LIVE ARCHIVE iniciado.",currentChannel);}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
