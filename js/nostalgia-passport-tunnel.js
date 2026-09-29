/* PASSPORT RADIO · NOSTALGIA PASSPORT TUNNEL™
   Studio Flashback: usa a própria página/player que foi validada tocando no navegador.
   Sem alterações de outros players, túneis ou layout.
*/
(()=>{
  "use strict";

  const PLAYER_URL="https://onlineradiobox.com/br/studioflashback/?lang=pt";
  const host=document.getElementById("ppv2EngineBay")||document.getElementById("engineBay");
  if(!host)return;

  const engine=document.createElement("div");
  engine.dataset.passportNostalgiaEngine="current";
  engine.innerHTML='<button id="passportNostalgiaPlay" type="button" aria-label="Reproduzir ou pausar Nostalgia Passport™">▶</button><strong id="passportNostalgiaStatus">READY</strong><audio id="passportNostalgiaAudio" preload="none"></audio>';
  host.appendChild(engine);

  const audio=document.getElementById("passportNostalgiaAudio");
  const play=document.getElementById("passportNostalgiaPlay");
  const status=document.getElementById("passportNostalgiaStatus");
  if(!audio||!play||!status)return;

  let wants=false, popup=null;

  function pauseOthers(){
    document.querySelectorAll("audio,video").forEach(a=>{if(a!==audio&&!a.paused)try{a.pause()}catch(_){}});
  }

  function start(){
    wants=true;
    pauseOthers();
    if(window.PassportBus&&typeof window.PassportBus.claim==="function")window.PassportBus.claim();
    popup=window.open(PLAYER_URL,"passportStudioFlashback","width=520,height=220,resizable=yes,scrollbars=yes");
    if(!popup){
      wants=false;
      status.textContent="OFFLINE";
      play.textContent="▶";
      return;
    }
    status.textContent="ON AIR";
    play.textContent="Ⅱ";
  }

  function stop(){
    wants=false;
    try{if(popup&&!popup.closed)popup.close()}catch(_){}
    popup=null;
    status.textContent="READY";
    play.textContent="▶";
  }

  play.addEventListener("click",()=>wants?stop():start());

  window.PassportNostalgiaTunnel={play:start,stop,isActive:()=>wants,audio,playButton:play,statusEl:status};
})();
