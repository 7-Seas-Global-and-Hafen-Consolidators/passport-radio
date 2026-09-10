/* PASSPORT RADIO · ROCK BRASIL TUNNEL™
   Cabine unificada.
   91 Rock Curitiba · FM brasileira de rock · MP3 Icecast + CORS.
   O Zeno "classic rock" anterior tocava Eagles e ainda por cima voltou 401.
*/
(()=>{
  "use strict";
  const STREAM_URL="https://servidor40.brlogic.com:8044/live";
  const host=document.getElementById("ppv2EngineBay")||document.getElementById("engineBay");
  if(!host)return;
  document.querySelectorAll("#passportBRRockAudio,#passportBRRockPlay,#passportBRRockStatus,[data-passport-brrock-engine]").forEach(n=>{if(n instanceof HTMLMediaElement){try{n.pause();n.removeAttribute("src");n.load()}catch(_){}}try{n.remove()}catch(_){}});
  const engine=document.createElement("div");engine.dataset.passportBrrockEngine="current";engine.hidden=true;engine.innerHTML='<button id="passportBRRockPlay" type="button">▶</button><strong id="passportBRRockStatus">READY</strong><audio id="passportBRRockAudio" preload="none"></audio>';host.appendChild(engine);
  const audio=document.getElementById("passportBRRockAudio"),play=document.getElementById("passportBRRockPlay"),status=document.getElementById("passportBRRockStatus");if(!audio||!play||!status)return;
  let wants=false;
  function pauseOthers(){document.querySelectorAll("audio").forEach(a=>{if(a!==audio&&!a.paused)try{a.pause()}catch(_){}})}
  async function start(){wants=true;pauseOthers();status.textContent="CONNECTING";if(audio.src!==STREAM_URL){audio.src=STREAM_URL;audio.load()}try{await audio.play()}catch(e){wants=false;status.textContent="OFFLINE";play.textContent="▶";console.warn("[Rock Brasil] play()",e)}}
  function stop(){wants=false;try{audio.pause()}catch(_){}status.textContent="READY";play.textContent="▶"}
  play.addEventListener("click",()=>wants&&!audio.paused?stop():start());
  audio.addEventListener("playing",()=>{if(!wants)return;status.textContent="ON AIR";play.textContent="Ⅱ"});
  audio.addEventListener("pause",()=>{if(wants)status.textContent="READY";play.textContent="▶"});
  audio.addEventListener("waiting",()=>{if(wants)status.textContent="CONNECTING"});
  audio.addEventListener("error",()=>{wants=false;status.textContent="OFFLINE";play.textContent="▶"});
  window.PassportBRRockTunnel={play:start,stop,isActive:()=>wants&&!audio.paused,audio,playButton:play,statusEl:status};
})();
