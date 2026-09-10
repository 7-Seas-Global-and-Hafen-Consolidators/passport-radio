/* PASSPORT RADIO · ROCK BRASIL TUNNEL™
   DUAS FONTES BRASILEIRAS, UMA ÚNICA CABINE.
   A) Mais Tocadas · Pop-Rock/Rock Nacional 80/90/2000 · playlist YouTube do próprio ranking.
   B) Rádio RockBR · stream Brascast.
   Sem alterações de player, layout ou outras rádios.
*/
(()=>{
  "use strict";

  const ROCKBR_STREAM="https://s01.brascast.com:7054/live";
  const MTC_PLAYLIST="T4zkb05tkms,z6uM7FehywQ,JRJj4z-prvM,cLXmiAsyJdY,_KVpOP3vgxE,qxRRxN5Lx3o,aF1gjdRgcxM,X0OjbLKIbcc,6NktvIzx94I,wPBFZldSsMI,pM2WCCiTJWM,oISdAqx2o10,tI9kSZgMLsc,MHJloaXS64Q,bFtvXWT5cKo,UNNOHk60ojk,umMIcZODm2k,x7WHL-o5tMo,akpfMSn9mMw,r71BvxeVFGY,M0p4VqQ_PMs,TqOMV6NsqrI,EdZi3tZnbds,fX3ix7rFp9U,v3SQTOZO36E,9dsUVU7ERK4,svUp8isgmes,81Szobx5SLM,erOZ2_vV6hQ,vk6rKZEbSRw,tFsou8Szb3M,hvbuYbwrpxc,7XdnTBnVGXk,Qv6IZkh4fFM,NeADhPP0G2Q,I7_-RqxQRG0,bRvNhTr2s5Q,mwffm8sYo2Q,OUs-0m4pTAI,fAQj1gj49SI,IMK8XhR4yl8,h8y-45T_Hak,8rFXLeDTWys,FkXWfreN2QA,Jcfkl9QTl08,m2TIIJvW-xk,cv8mUTfZPsI,n2nMv-eULfg,3BjAD4R8ncI,LA68bgpaRkI,LU9deI7Czy8,sfixHYBWaiU,QpSOWQwpaBI,9GhWFIgaqL0,ck0LsAGZ4r4,itS3sjWCAnc,I29JUuotXG4,FltzZX30XyY,5zjo7OENWUc,WEhfKg6kXE8,dxCe0b5vVh8,i1Nm-MJ313w,BMDcQcC1ayw,zuaX4QT6rzg,eLkkFXkAYAc,oAu0SEi4Xh8,bsKDohqXkHI,e9aO-ZxJfEE,llRWoANxjME,_BcgIz32xoA,NK88geNsUmQ,ekupEx3YLSk,NESahqPhQdc,AarQjCUPDro,XW7TG_ht6LQ,kkGDWRIe8rs,ZBwjT-3t2O8,DSQg96Xzx7g,Tu4sXwpY6S0,oC7KYC-OaIA,mYxpz69HUys,8zsZ3Ql8x7o,7UZNHXYLQds,DH51b0SwDw8,DP3j6hgS4VY,uJfYja5noKI,e_OzUN3FUFA,juM8luwwMoo,LpYj_sI79v8,vF1Ad3hrdzY,lzu-R1zHaZM,bsutUab2fkI,jfwRNZG5D6E,r9AA-697NfY,ASZFN46jYD0,wgSWAnsdpr0,HaPMYOmToD4,IswmpzEoNy8,FC5SG27kcC4,hIXPOhNozlc".split(",");

  const host=document.getElementById("ppv2EngineBay")||document.getElementById("engineBay");
  if(!host)return;

  document.querySelectorAll("#passportBRRockAudio,#passportBRRockPlay,#passportBRRockStatus,#passportBRRockYT,[data-passport-brrock-engine]").forEach(n=>{
    if(n instanceof HTMLMediaElement){try{n.pause();n.removeAttribute("src");n.load()}catch(_){}}
    try{n.remove()}catch(_){}
  });

  const engine=document.createElement("div");
  engine.dataset.passportBrrockEngine="current";
  engine.hidden=true;
  engine.innerHTML='<button id="passportBRRockPlay" type="button">▶</button><strong id="passportBRRockStatus">READY</strong><audio id="passportBRRockAudio" preload="none"></audio><div id="passportBRRockYT" hidden></div>';
  host.appendChild(engine);

  const audio=document.getElementById("passportBRRockAudio");
  const play=document.getElementById("passportBRRockPlay");
  const status=document.getElementById("passportBRRockStatus");
  if(!audio||!play||!status)return;

  let wants=false;
  let source="rockbr";
  let nextSource="rockbr";
  let yt=null;
  let ytReadyPromise=null;

  function pauseOthers(){
    document.querySelectorAll("audio,video").forEach(a=>{if(a!==audio&&!a.paused)try{a.pause()}catch(_){}});
  }

  function loadYTApi(){
    if(window.YT&&window.YT.Player)return Promise.resolve();
    if(ytReadyPromise)return ytReadyPromise;
    ytReadyPromise=new Promise(resolve=>{
      const previous=window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady=()=>{try{if(typeof previous==="function")previous()}catch(_){}resolve()};
      if(!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')){
        const script=document.createElement("script");
        script.src="https://www.youtube.com/iframe_api";
        document.head.appendChild(script);
      }
    });
    return ytReadyPromise;
  }

  async function ensureYT(){
    await loadYTApi();
    if(yt)return yt;
    return new Promise(resolve=>{
      yt=new YT.Player("passportBRRockYT",{
        height:"1",width:"1",
        playerVars:{playsinline:1,autoplay:0,controls:0,rel:0},
        events:{
          onReady:()=>resolve(yt),
          onStateChange:e=>{
            if(e.data===YT.PlayerState.PLAYING&&wants&&source==="maistocadas"){
              status.textContent="ON AIR";play.textContent="Ⅱ";
            }
          },
          onError:()=>{if(wants&&source==="maistocadas")startRockBR()}
        }
      });
    });
  }

  function stopYT(){try{if(yt&&typeof yt.stopVideo==="function")yt.stopVideo()}catch(_){}}

  async function startMaisTocadas(){
    source="maistocadas";
    try{audio.pause()}catch(_){}
    audio.removeAttribute("src");
    status.textContent="CONNECTING";
    try{
      const player=await ensureYT();
      if(!wants||source!=="maistocadas")return;
      const index=Math.floor(Math.random()*MTC_PLAYLIST.length);
      player.loadPlaylist({playlist:MTC_PLAYLIST,index,playerVars:{autoplay:1}});
    }catch(_){if(wants)startRockBR()}
  }

  async function startRockBR(){
    source="rockbr";
    stopYT();
    pauseOthers();
    status.textContent="CONNECTING";
    if(audio.src!==ROCKBR_STREAM){audio.src=ROCKBR_STREAM;audio.load()}
    try{await audio.play()}
    catch(e){
      if(wants){source="maistocadas";startMaisTocadas()}
      else{status.textContent="OFFLINE";play.textContent="▶"}
    }
  }

  async function start(){
    wants=true;
    pauseOthers();
    const chosen=nextSource;
    nextSource=chosen==="rockbr"?"maistocadas":"rockbr";
    if(chosen==="rockbr")await startRockBR();
    else await startMaisTocadas();
  }

  function stop(){
    wants=false;
    try{audio.pause()}catch(_){}
    stopYT();
    status.textContent="READY";
    play.textContent="▶";
  }

  play.addEventListener("click",()=>wants?stop():start());
  audio.addEventListener("playing",()=>{if(!wants||source!=="rockbr")return;status.textContent="ON AIR";play.textContent="Ⅱ"});
  audio.addEventListener("pause",()=>{if(wants&&source==="rockbr")status.textContent="READY";if(source==="rockbr")play.textContent="▶"});
  audio.addEventListener("waiting",()=>{if(wants&&source==="rockbr")status.textContent="CONNECTING"});
  audio.addEventListener("error",()=>{if(wants&&source==="rockbr")startMaisTocadas()});

  window.PassportBRRockTunnel={play:start,stop,isActive:()=>wants,audio,playButton:play,statusEl:status};
})();
