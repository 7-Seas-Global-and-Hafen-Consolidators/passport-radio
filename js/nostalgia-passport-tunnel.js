/* PASSPORT RADIO · NOSTALGIA PASSPORT TUNNEL™
   Fonte substituta: Rádio Studio Flashback via player OnlineRadioBox.
   Sem alterações de outros players, túneis ou layout.
*/
(()=>{
  "use strict";

  const host=document.getElementById("ppv2EngineBay")||document.getElementById("engineBay");
  if(!host)return;

  const engine=document.createElement("div");
  engine.dataset.passportNostalgiaEngine="current";
  engine.innerHTML='<button id="passportNostalgiaPlay" type="button" aria-label="Reproduzir ou pausar Nostalgia Passport™">▶</button><strong id="passportNostalgiaStatus">READY</strong><div class="orbP" id="orb_player_1f7dba3ac97c8165" vlm="0.8" style="position:absolute;width:1px;height:1px;overflow:hidden"><audio id="passportNostalgiaAudio" crossorigin="true"></audio><button class="orbPp" country="br" alias="studioflashback" stream="1"></button><span class="orbPtt"></span></div>';
  host.appendChild(engine);

  const audio=document.getElementById("passportNostalgiaAudio");
  const play=document.getElementById("passportNostalgiaPlay");
  const status=document.getElementById("passportNostalgiaStatus");
  const orbPlay=engine.querySelector(".orbPp");
  if(!audio||!play||!status||!orbPlay)return;

  window.orbp_w=window.orbp_w||{lang:"pt-pt"};
  window.orbp_w.apiUrl="https://onlineradiobox.com";
  window.orbp_w.cmd=window.orbp_w.cmd||[];
  window.orbp_w.cmd.push(()=>window.orbp_w.init("orb_player_1f7dba3ac97c8165"));

  if(!document.querySelector('script[data-passport-orb]')){
    const s=document.createElement("script");
    s.src="https://ecdn.onlineradiobox.com/js/pwidget2.min.235ca64e.js";
    s.async=true;
    s.dataset.passportOrb="studioflashback";
    document.head.appendChild(s);
  }

  let wants=false;

  function pauseOthers(){
    document.querySelectorAll("audio,video").forEach(a=>{if(a!==audio&&!a.paused)try{a.pause()}catch(_){}});
  }

  function start(){
    wants=true;
    pauseOthers();
    if(window.PassportBus&&typeof window.PassportBus.claim==="function")window.PassportBus.claim();
    status.textContent="CONNECTING";
    orbPlay.click();
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

  window.PassportNostalgiaTunnel={play:start,stop,isActive:()=>wants,audio,playButton:play,statusEl:status};
})();
