/* PASSPORT RADIO · 50s & 60s TUNNEL™
   Motor da cabine unificada.
   Somente o sinal internacional 181.FM Good Time Oldies.
*/
(()=>{
  "use strict";
  const host=document.getElementById("engineBay")||document.getElementById("ppv2EngineBay");
  if(!host) return;
  document.querySelectorAll("#passport5060,[data-passport-5060-engine]").forEach(n=>{n.querySelectorAll?.("audio").forEach(a=>{try{a.pause();a.removeAttribute("src");a.load()}catch(_){}});n.remove()});
  const engine=document.createElement("div");
  engine.dataset.passport5060Engine="current";
  engine.hidden=true;
  engine.innerHTML='<button id="passport5060Play" type="button">▶</button><strong id="passport5060Status">READY</strong><audio id="passport5060Audio" preload="none"></audio>';
  host.appendChild(engine);
  const audio=document.getElementById("passport5060Audio"),play=document.getElementById("passport5060Play"),status=document.getElementById("passport5060Status");
  const STREAM="https://listen.181fm.com/181-goodtime_128k.mp3";
  function stopOthers(){document.querySelectorAll("audio").forEach(a=>{if(a!==audio&&!a.paused)try{a.pause()}catch(_){}})}
  async function start(){stopOthers();if(!audio.src){audio.src=STREAM;audio.load()}status.textContent="CONNECTING";try{await audio.play()}catch(e){status.textContent="ERROR";play.textContent="▶";console.warn("[50s60s] play()",e)}}
  function stop(){try{audio.pause()}catch(_){}}
  play.addEventListener("click",()=>audio.paused?start():stop());
  audio.addEventListener("playing",()=>{status.textContent="ON AIR";play.textContent="Ⅱ"});
  audio.addEventListener("pause",()=>{if(status.textContent!=="ERROR")status.textContent="READY";play.textContent="▶"});
  audio.addEventListener("waiting",()=>status.textContent="CONNECTING");
  audio.addEventListener("error",()=>{status.textContent="ERROR";play.textContent="▶"});
})();
