/* PASSPORT RADIO · CABINE = TELECOMANDO DOS MOTORES ORIGINAIS
   Não cria audio para túneis. Não inventa stream de túnel.
   Mutex global: um som por vez. WORLD usa somente a baia própria já existente.
*/
(() => {
  "use strict";

  const WORLD = [
    { id:"py", name:"Paraguay", src:"Rock & Pop 95.5 · Asunción", url:"https://cp9.serverse.com/proxy/rockandpop/stream" },
    { id:"fr", name:"France", src:"OÜI FM · Paris", url:"https://ouifm.ice.infomaniak.ch/ouifm-high.mp3" },
    { id:"it", name:"Italia", src:"Radio Company", url:"https://str01.fluidstream.net/company.mp3" },
    { id:"cz", name:"Česko", src:"HEY Radio", url:"https://icecast3.play.cz/hey-radio128.mp3" }
  ];

  const SIGNALS = {
    "live-rare": { label:"LIVE & RARE™", meta:"Arquivo underground", playId:"tunnelPlay", yt:true },
    "80s": { label:"80s TUNNEL™", meta:"181.FM", playId:"passport80sPlay", audioId:"passport80sAudio" },
    soul: { label:"SOUL TUNNEL™", meta:"Total Soul", playId:"passportSoulPlay", audioId:"passportSoulAudio" },
    mpb: { label:"MPB TUNNEL™", meta:"Rádio Só MPB", playId:"passportMPBPlay", audioId:"passportMPBAudio" },
    hits: { label:"PASSPORT HITS™", meta:"Pop · Top 40", playId:"passportHitsPlay", audioId:"passportHitsAudio" },
    continuous: { label:"CONTINUOUS SIGNALS™", meta:"Passport Live", playId:"passport-live-play", audioId:"passport-live-audio" },
    brrock: { label:"ROCK BRASIL TUNNEL™", meta:"91 Rock Curitiba", playId:"passportBRRockPlay", audioId:"passportBRRockAudio" },
    "5060": { label:"50s & 60s TUNNEL™", meta:"181.FM Good Time", playId:"passport5060Play", audioId:"passport5060Audio" },
    world: { label:"WORLD DIAL™", meta:"Atlas", audioId:"passportWorldAudio" }
  };

  const $ = id => document.getElementById(id);
  let active="live-rare", worldId="py", started=0, timer=0;
  const worldNow=()=>WORLD.find(w=>w.id===worldId)||WORLD[0];
  const ytPlaying=()=>{const b=$("tunnelPlay");return !!b&&(b.textContent||"").trim()==="Ⅱ";};
  const mediaPlaying=id=>{const a=$(id);return !!a&&!a.paused;};
  const isOn=id=>{const s=SIGNALS[id];return !!s&&(s.yt?ytPlaying():(s.audioId?mediaPlaying(s.audioId):false));};

  function stopYt(){ if(ytPlaying()) try{$("tunnelPlay").click();}catch(_){} }
  function stopMediaExcept(keep){
    document.querySelectorAll("audio,video").forEach(el=>{
      if(el!==keep&&!el.paused) try{el.pause();}catch(_){}
    });
  }
  function stopAll(){ stopMediaExcept(null); stopYt(); setTimeout(paint,60); }

  /* Captura qualquer motor original que realmente entrou em play e mata todos os irmãos.
     Isto resolve motores que historicamente só conheciam parte dos outros túneis. */
  document.addEventListener("play", e=>{
    const target=e.target;
    if(!(target instanceof HTMLMediaElement)) return;
    stopMediaExcept(target);
    if(ytPlaying()) stopYt();
    const found=Object.entries(SIGNALS).find(([,s])=>s.audioId===target.id);
    if(found) active=found[0];
    setTimeout(paint,0);
  },true);
  document.addEventListener("pause",()=>setTimeout(paint,0),true);

  function paint(){
    const s=SIGNALS[active]; if(!s||!$("signal")) return;
    const on=isOn(active);
    $("signal").textContent=s.label;
    $("status").textContent=on?"ON AIR":"CALADA";
    $("status").className=on?"live":"";
    if($("ledOn")) $("ledOn").className="led"+(on?" on":"");
    $("meta").textContent=active==="world"?worldNow().name+" · "+worldNow().src:(s.meta||"—");
    if($("source")) $("source").textContent=on?"ATIVO":"—";
    document.querySelectorAll("[data-signal]").forEach(b=>b.classList.toggle("active",b.dataset.signal===active));
    if($("worldCountries")) $("worldCountries").hidden=active!=="world";
    if(on&&!timer){started=Date.now();timer=setInterval(()=>{const sec=Math.floor((Date.now()-started)/1000);if($("airtime")) $("airtime").textContent=[Math.floor(sec/3600),Math.floor((sec%3600)/60),sec%60].map(n=>String(n).padStart(2,"0")).join(":");},1000);}
    if(!on&&timer){clearInterval(timer);timer=0;if($("airtime")) $("airtime").textContent="00:00:00";}
  }

  function clickWhenReady(id,tries=30){
    const btn=$(id); if(btn){btn.click();return;}
    if(tries<=0){console.warn("[cabin] motor ausente:",id);return;}
    setTimeout(()=>clickWhenReady(id,tries-1),150);
  }

  function playActive(){
    const s=SIGNALS[active]; if(!s)return;
    if(s.yt){stopMediaExcept(null);clickWhenReady(s.playId);return;}
    stopYt();
    if(active==="world"){
      const a=$("passportWorldAudio");if(!a)return;
      stopMediaExcept(a);
      const w=worldNow();
      if(a.dataset.world!==w.id){a.pause();a.src=w.url;a.dataset.world=w.id;a.load();}
      a.play().catch(()=>{$("status").textContent="SIGNAL INDISPONÍVEL";});
      return;
    }
    /* mata tudo ANTES de delegar; o motor escolhido mantém sua própria URL/fallback/watchdog */
    stopMediaExcept(null);
    if(s.playId) clickWhenReady(s.playId);
  }

  function select(id){if(!SIGNALS[id])return;stopAll();active=id;paint();setTimeout(playActive,20);setTimeout(paint,300);}

  function renderWorld(){
    const box=$("worldCountries");if(!box)return;
    box.innerHTML=WORLD.map(w=>'<button type="button" data-world="'+w.id+'">'+w.name+'</button>').join("");
    box.onclick=e=>{const b=e.target.closest("[data-world]");if(!b)return;worldId=b.dataset.world;select("world");};
  }
  function renderSignals(){
    const d=$("signalsDrawer");if(!d)return;
    d.innerHTML=Object.entries(SIGNALS).map(([k,s])=>'<button type="button" data-all-signal="'+k+'">'+s.label+'</button>').join("");
    d.onclick=e=>{const b=e.target.closest("[data-all-signal]");if(b)select(b.dataset.allSignal);};
  }

  if($("quick")) $("quick").addEventListener("click",e=>{const b=e.target.closest("[data-signal]");if(b)select(b.dataset.signal);});
  if($("play")) $("play").onclick=playActive;
  if($("stop")) $("stop").onclick=stopAll;
  if($("mute")) $("mute").onclick=()=>{const turnOn=$("mute").dataset.on!=="1";$("mute").dataset.on=turnOn?"1":"0";$("mute").textContent=turnOn?"UNMUTE":"MUTE";document.querySelectorAll("audio").forEach(a=>a.muted=turnOn);};
  if($("volume")) $("volume").oninput=e=>{const v=Number(e.target.value);document.querySelectorAll("audio").forEach(a=>a.volume=v);};
  if($("signalsBtn")) $("signalsBtn").onclick=()=>{$("signalsDrawer").hidden=!$("signalsDrawer").hidden;};
  if($("playedBtn")) $("playedBtn").onclick=()=>{$("playedDrawer").hidden=!$("playedDrawer").hidden;};
  const yt=$("tunnelPlay");if(yt)new MutationObserver(()=>paint()).observe(yt,{childList:true,characterData:true,subtree:true});
  renderWorld();renderSignals();paint();setInterval(paint,800);
})();
