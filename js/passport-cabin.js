(()=>{
"use strict";
const CHANNELS={
  "live-rare":{label:"LIVE & RARE™",playId:"tunnelPlay",nowId:"tunnelConsoleTitle",detailId:"tunnelConsoleMeta"},
  "5060":{label:"50s & 60s TUNNEL™",playId:"passport5060Play",audioId:"passport5060Audio"},
  "80s":{label:"80s TUNNEL™",playId:"passport80sPlay",audioId:"passport80sAudio",nowId:"passport80sTitle",detailId:"passport80sMeta"},
  soul:{label:"SOUL TUNNEL™",playId:"passportSoulPlay",audioId:"passportSoulAudio"},
  mpb:{label:"MPB TUNNEL™",playId:"passportMPBPlay",audioId:"passportMPBAudio"},
  hits:{label:"PASSPORT HITS™",playId:"passportHitsPlay",audioId:"passportHitsAudio"},
  continuous:{label:"CONTINUOUS SIGNALS™ · HEAVY METAL",playId:"passport-live-play",audioId:"passport-live-audio",nowId:"passport-live-channel-name"},
  brrock:{label:"ROCK BRASIL TUNNEL™",playId:"passportBRRockPlay",audioId:"passportBRRockAudio"},
  world:{label:"WORLD DIAL™",playId:"passportWorldPlay",audioId:"passportWorldAudio",nowId:"passportWorldNow"}
};
const WORLD=[
  {id:"py",name:"Paraguay",src:"Rock & Pop 95.5 FM · Asunción",url:"https://cp9.serverse.com/proxy/rockandpop/stream"},
  {id:"fr",name:"France",src:"OÜI FM 102.3 · Paris",url:"https://ouifm.ice.infomaniak.ch/ouifm-high.mp3"},
  {id:"ca",name:"Québec",src:"CIBM-FM 107.1",url:"https://stream.statsradio.com:8050/stream"},
  {id:"kr",name:"Korea",src:"Big B Radio · Kpop",url:"https://antares.dribbcast.com/proxy/kpop?mp=/s"},
  {id:"tr",name:"Türkiye",src:"Türk Rock FM",url:"https://yayin5.radyohizmeti.com/8090/stream;"},
  {id:"ua",name:"Ukraine",src:"Хіт FM",url:"https://tavr.tvstitch.com/HitFM?.mp3"},
  {id:"ir",name:"Iran",src:"Radio AvazFarsi",url:"https://radio.avazfarsi.com:8000/radio.mp3"},
  {id:"ve",name:"Venezuela",src:"La Mega 107.3 FM",url:"https://acp4.lorini.net:2050/stream"},
  {id:"ea",name:"África",src:"Jacaranda FM",url:"https://edge.iono.fm/xice/jacarandafm_live_medium.aac"},
  {id:"ro",name:"România",src:"Rock FM",url:"https://live.rockfm.ro/rockfm.aacp"},
  {id:"cz",name:"Česko",src:"HEY Radio",url:"https://icecast3.play.cz/hey-radio128.mp3"},
  {id:"lt",name:"Lietuva",src:"ROCK FM",url:"https://stream2.rockfm.lt/crf128.mp3"},
  {id:"gr",name:"Ελλάδα",src:"RED 96.3",url:"https://stream.radiojar.com/redfm963"},
  {id:"il",name:"ישראל",src:"גלגלצ",url:"https://glzwizzlv.bynetcdn.com/glglz_mp3"},
  {id:"it",name:"Italia",src:"Radio Company",url:"https://str01.fluidstream.net/company.mp3"}
];
const $=id=>document.getElementById(id);
let active="live-rare",worldId="py",started=0,timer=0,muted=false;
function el(id){return $(id)}
function control(k){return el(CHANNELS[k]?.playId)}
function audio(k){return el(CHANNELS[k]?.audioId)}
function ytPlaying(){const b=el("tunnelPlay");return!!b&&(b.textContent||"").trim()==="Ⅱ"}
function playing(k){if(k==="live-rare")return ytPlaying();const a=audio(k);return!!a&&!a.paused}
function stopOthers(k){
  document.querySelectorAll("audio").forEach(a=>{if(a!==audio(k)&&!a.paused)try{a.pause()}catch(_){}});
  if(k!=="live-rare"&&ytPlaying())try{el("tunnelPlay").click()}catch(_){}
}
function stopAll(){
  document.querySelectorAll("audio").forEach(a=>{try{a.pause()}catch(_){}});
  if(ytPlaying())try{el("tunnelPlay").click()}catch(_){}
}
function text(id){const n=id&&el(id);return n?(n.textContent||"").trim():""}
function worldNow(){return WORLD.find(s=>s.id===worldId)||WORLD[0]}
function paint(){
  const c=CHANNELS[active];
  if(!c||!el("signal"))return;
  el("signal").textContent=c.label;
  const on=playing(active);
  el("status").textContent=on?"ON AIR":"CALADA";
  el("status").className=on?"live":"";
  el("ledOn").className="led"+(on?" on":"");
  const w=worldNow();
  const m=active==="world"?w.name+" · "+w.src:[text(c.nowId),text(c.detailId)].filter(Boolean).join(" · ");
  el("meta").textContent=m||"—";
  el("format").textContent="—";
  el("bitrate").textContent="—";
  el("source").textContent=on?"ATIVO":"—";
  document.querySelectorAll("[data-signal]").forEach(b=>b.classList.toggle("active",b.dataset.signal===active));
  const box=el("worldCountries");
  if(box) box.hidden=active!=="world";
  if(on&&!timer){
    started=Date.now();
    timer=setInterval(()=>{
      const s=Math.floor((Date.now()-started)/1000);
      const h=String(Math.floor(s/3600)).padStart(2,"0");
      const m=String(Math.floor(s%3600/60)).padStart(2,"0");
      const x=String(s%60).padStart(2,"0");
      el("airtime").textContent=h+":"+m+":"+x;
    },1000);
  }
  if(!on&&timer){clearInterval(timer);timer=0;el("airtime").textContent="00:00:00"}
}
function armMetal(){
  const hw=document.querySelector('[data-live-channel="metalwarriors"]');
  if(hw) hw.click();
}
function select(k,autoplay=true){
  if(!CHANNELS[k])return;
  stopOthers(k);
  active=k;
  paint();
  if(k==="continuous") armMetal();
  if(autoplay){
    const b=control(k);
    if(b) try{b.click()}catch(_){}
    if(k==="continuous") setTimeout(armMetal,80);
    setTimeout(paint,120);
  }
}
function renderSignals(){
  const drawer=el("signalsDrawer");
  if(!drawer)return;
  drawer.innerHTML=Object.entries(CHANNELS).map(([k,c])=>'<button type="button" data-all-signal="'+k+'">'+c.label+'</button>').join("");
  drawer.addEventListener("click",e=>{
    const b=e.target.closest("[data-all-signal]");
    if(b) select(b.dataset.allSignal,true);
  });
}
function renderWorld(){
  let box=el("worldCountries");
  if(!box){
    box=document.createElement("div");
    box.id="worldCountries";
    box.className="drawer";
    const host=el("signalsDrawer");
    if(host&&host.parentNode) host.parentNode.insertBefore(box,host.nextSibling);
  }
  box.hidden=true;
  box.innerHTML=WORLD.map(s=>'<button type="button" data-world="'+s.id+'">'+s.name+'</button>').join("");
  box.addEventListener("click",e=>{
    const b=e.target.closest("[data-world]");
    if(!b)return;
    worldId=b.dataset.world;
    const now=el("passportWorldNow");
    const w=worldNow();
    if(now) now.textContent=w.src;
    active="world";
    const a=el("passportWorldAudio");
    if(a){
      stopOthers("world");
      a.src=w.url;
      a.play().catch(err=>console.warn("[World Dial]",err));
    }
    paint();
  });
}
const worldAudio=el("passportWorldAudio"),worldPlay=el("passportWorldPlay"),worldStatus=el("passportWorldStatus");
if(worldAudio&&worldPlay){
  worldPlay.addEventListener("click",async()=>{
    if(!worldAudio.paused){
      worldAudio.pause();
      worldPlay.textContent="▶";
      if(worldStatus) worldStatus.textContent="READY";
      return;
    }
    stopOthers("world");
    worldAudio.src=worldNow().url;
    try{
      await worldAudio.play();
      worldPlay.textContent="Ⅱ";
      if(worldStatus) worldStatus.textContent="ON AIR";
    }catch(e){
      worldAudio.removeAttribute("src");
      worldAudio.load();
      worldPlay.textContent="▶";
      if(worldStatus) worldStatus.textContent="OFFLINE";
      console.warn("[World Dial] play()",e);
    }
  });
  worldAudio.addEventListener("playing",()=>{worldPlay.textContent="Ⅱ";if(worldStatus)worldStatus.textContent="ON AIR"});
  worldAudio.addEventListener("pause",()=>{worldPlay.textContent="▶"});
}
el("quick").addEventListener("click",e=>{
  const b=e.target.closest("[data-signal]");
  if(b) select(b.dataset.signal,true);
});
el("signalsBtn").onclick=()=>{
  const d=el("signalsDrawer");
  d.hidden=!d.hidden;
  if(!d.hidden) el("worldCountries").hidden=false;
};
el("playedBtn").onclick=()=>el("playedDrawer").hidden=!el("playedDrawer").hidden;
el("play").onclick=()=>{
  const b=control(active);
  if(!b)return;
  stopOthers(active);
  if(active==="continuous") armMetal();
  try{b.click()}catch(_){}
  setTimeout(paint,100);
};
el("stop").onclick=()=>{stopAll();setTimeout(paint,50)};
el("mute").onclick=()=>{
  muted=!muted;
  document.querySelectorAll("audio").forEach(a=>a.muted=muted);
  el("mute").textContent=muted?"UNMUTE":"MUTE";
};
el("volume").oninput=e=>document.querySelectorAll("audio").forEach(a=>a.volume=Number(e.target.value));
document.addEventListener("play",()=>setTimeout(paint,0),true);
document.addEventListener("pause",()=>setTimeout(paint,0),true);
renderSignals();
renderWorld();
paint();
setInterval(paint,600);
})();
