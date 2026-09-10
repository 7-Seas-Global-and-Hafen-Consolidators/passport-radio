/* PASSPORT RADIO · JOVEM GUARDA TUNNEL™
   Sinal HLS da estação Jovem Guarda.
   Sem alterações de outros players, túneis ou layout.
*/
(()=>{
  "use strict";

  const STREAM="https://stream.vagalume.fm/hls/1520610873192520.m3u8";
  const HLS_MIME="application/vnd.apple.mpegurl";
  const HLS_CDN="https://cdn.jsdelivr.net/npm/hls.js@1.7.0/dist/hls.min.js";
  const host=document.getElementById("ppv2EngineBay")||document.getElementById("engineBay");
  if(!host)return;

  const engine=document.createElement("div");
  engine.dataset.passportJovemGuardaEngine="current";
  engine.innerHTML='<button id="passportJovemGuardaPlay" type="button" aria-label="Reproduzir ou pausar Jovem Guarda™">▶</button><strong id="passportJovemGuardaStatus">READY</strong><audio id="passportJovemGuardaAudio" preload="none"></audio>';
  host.appendChild(engine);

  const audio=document.getElementById("passportJovemGuardaAudio");
  const play=document.getElementById("passportJovemGuardaPlay");
  const status=document.getElementById("passportJovemGuardaStatus");
  if(!audio||!play||!status)return;

  let wants=false;
  let hls=null;
  let hlsLoader=null;

  function pauseOthers(){
    document.querySelectorAll("audio,video").forEach(a=>{if(a!==audio&&!a.paused)try{a.pause()}catch(_){}});
  }

  function destroyHls(){
    if(hls){try{hls.destroy()}catch(_){}hls=null}
  }

  function loadHls(){
    if(window.Hls)return Promise.resolve(window.Hls);
    if(hlsLoader)return hlsLoader;
    hlsLoader=new Promise((resolve,reject)=>{
      const script=document.createElement("script");
      script.src=HLS_CDN;
      script.async=true;
      script.crossOrigin="anonymous";
      script.onload=()=>window.Hls?resolve(window.Hls):reject(new Error("HLS library unavailable"));
      script.onerror=()=>reject(new Error("HLS library failed to load"));
      document.head.appendChild(script);
    }).catch(error=>{hlsLoader=null;throw error});
    return hlsLoader;
  }

  async function prepareStream(){
    if(audio.canPlayType(HLS_MIME)){
      if(audio.src!==STREAM){audio.src=STREAM;audio.load()}
      return;
    }
    const Hls=await loadHls();
    if(!Hls.isSupported())throw new Error("HLS unsupported");
    destroyHls();
    await new Promise((resolve,reject)=>{
      const instance=new Hls({enableWorker:true});
      hls=instance;
      let settled=false;
      const finish=(fn,value)=>{if(settled)return;settled=true;fn(value)};
      instance.on(Hls.Events.MEDIA_ATTACHED,()=>instance.loadSource(STREAM));
      instance.on(Hls.Events.MANIFEST_PARSED,()=>finish(resolve));
      instance.on(Hls.Events.ERROR,(_event,data)=>{
        if(data&&data.fatal){destroyHls();finish(reject,new Error(data.details||"HLS fatal error"))}
      });
      instance.attachMedia(audio);
    });
  }

  async function start(){
    wants=true;
    pauseOthers();
    if(window.PassportBus&&typeof window.PassportBus.claim==="function")window.PassportBus.claim();
    status.textContent="CONNECTING";
    try{
      if(!audio.canPlayType(HLS_MIME)&&!hls)await prepareStream();
      else if(audio.canPlayType(HLS_MIME)&&audio.src!==STREAM)await prepareStream();
      await audio.play();
    }catch(_){
      wants=false;
      destroyHls();
      try{audio.pause();audio.removeAttribute("src");audio.load()}catch(__){}
      status.textContent="OFFLINE";
      play.textContent="▶";
    }
  }

  function stop(){
    wants=false;
    try{audio.pause()}catch(_){}
    status.textContent="READY";
    play.textContent="▶";
  }

  play.addEventListener("click",()=>wants?stop():start());
  audio.addEventListener("playing",()=>{if(!wants)return;status.textContent="ON AIR";play.textContent="Ⅱ"});
  audio.addEventListener("pause",()=>{if(wants)status.textContent="READY";play.textContent="▶"});
  audio.addEventListener("waiting",()=>{if(wants)status.textContent="CONNECTING"});
  audio.addEventListener("error",()=>{
    if(wants&&!hls){wants=false;status.textContent="OFFLINE";play.textContent="▶"}
  });

  window.PassportJovemGuardaTunnel={play:start,stop,isActive:()=>wants,audio,playButton:play,statusEl:status};
})();
