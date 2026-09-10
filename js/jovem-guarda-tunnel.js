/* PASSPORT RADIO · JOVEM GUARDA TUNNEL™
   Sinal HLS da estação Jovem Guarda.
   Sem alterações de outros players, túneis ou layout.
*/
(()=>{
  "use strict";

  const STREAM="https://stream.vagalume.fm/hls/1520610873192520.m3u8";
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

  function pauseOthers(){
    document.querySelectorAll("audio,video").forEach(a=>{if(a!==audio&&!a.paused)try{a.pause()}catch(_){}});
  }

  async function start(){
    wants=true;
    pauseOthers();
    if(window.PassportBus&&typeof window.PassportBus.claim==="function")window.PassportBus.claim();
    status.textContent="CONNECTING";
    if(audio.src!==STREAM){audio.src=STREAM;audio.load()}
    try{await audio.play()}
    catch(_){wants=false;status.textContent="OFFLINE";play.textContent="▶"}
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
  audio.addEventListener("error",()=>{if(wants){wants=false;status.textContent="OFFLINE";play.textContent="▶"}});

  window.PassportJovemGuardaTunnel={play:start,stop,isActive:()=>wants,audio,playButton:play,statusEl:status};
})();
