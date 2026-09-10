(()=>{
"use strict";
const CHANNELS={
  "live-rare":{label:"LIVE & RARE™",playId:"tunnelPlay",nowId:"tunnelConsoleTitle"},
  "80s":{label:"80s TUNNEL™",audioId:"passport80sAudio",url:"https://listen.181fm.com/181-awesome80s_128k.mp3"},
  soul:{label:"SOUL TUNNEL™",audioId:"passportSoulAudio",url:"https://onair7.xdevel.com/proxy/xautocloud_atvn_1069?mp=%2F%3B1%2F"},
  mpb:{label:"MPB TUNNEL™",playId:"passportMPBPlay",audioId:"passportMPBAudio"},
  hits:{label:"PASSPORT HITS™",audioId:"passportHitsAudio",url:"https://listen.181fm.com/181-power_128k.mp3"},
  continuous:{label:"HEAVY METAL",audioId:"passport-live-audio",url:"https://streaming.viphosting.cl/8012/stream"},
  brrock:{label:"ROCK BRASIL TUNNEL™",audioId:"passportBRRockAudio",urls:[
    "https://s03.svrdedicado.org:7298/stream",
    "https://playerservices.streamtheworld.com/api/livestream-redirect/RADIO_KISSFM_ADP.aac"
  ]},
  "5060":{label:"50s & 60s TUNNEL™",audioId:"passport5060Audio",url:"https://listen.181fm.com/181-goodtime_128k.mp3"},
  world:{label:"WORLD DIAL™",audioId:"passportWorldAudio",nowId:"passportWorldNow"}
};
const WORLD=[
  {id:"py",name:"Paraguay",src:"Rock & Pop 95.5 · Asunción",url:"https://cp9.serverse.com/proxy/rockandpop/stream"},
  {id:"fr",name:"France",src:"OÜI FM · Paris",url:"https://ouifm.ice.infomaniak.ch/ouifm-high.mp3"},
  {id:"ca",name:"Québec",src:"CIBM-FM 107.1",url:"https://stream.statsradio.com:8050/stream"},
  {id:"kr",name:"Korea",src:"Big B Radio · K-Pop",url:"https://antares.dribbcast.com/proxy/kpop?mp=/s"},
  {id:"tr",name:"Türkiye",src:"Türk Rock FM",url:"https://yayin5.radyohizmeti.com/8090/stream;"},
  {id:"ua",name:"Ukraine",src:"Hit FM",url:"https://tavr.tvstitch.com/HitFM?.mp3"},
  {id:"ve",name:"Venezuela",src:"La Mega 107.3",url:"https://acp4.lorini.net:2050/stream"},
  {id:"ea",name:"África",src:"Jacaranda FM",url:"https://edge.iono.fm/xice/jacarandafm_live_medium.aac"},
  {id:"ro",name:"România",src:"Rock FM",url:"https://live.rockfm.ro/rockfm.aacp"},
  {id:"cz",name:"Česko",src:"HEY Radio",url:"https://icecast3.play.cz/hey-radio128.mp3"},
  {id:"lt",name:"Lietuva",src:"ROCK FM",url:"https://stream2.rockfm.lt/crf128.mp3"},
  {id:"gr",name:"Ελλάδα",src:"RED 96.3",url:"https://stream.radiojar.com/redfm963"},
  {id:"il",name:"ישראל",src:"Galgalatz",url:"https://glzwizzlv.bynetcdn.com/glglz_mp3"},
  {id:"it",name:"Italia",src:"Radio Company",url:"https://str01.fluidstream.net/company.mp3"}
];
const $=id=>document.getElementById(id);
let active="live-rare",worldId="py",started=0,timer=0,muted=false;
function bay(){return $("engineBay")||document.body}
function ensureAudio(id){
  let a=$(id);
  if(a) return a;
  a=document.createElement("audio");
  a.id=id;a.preload="none";
  bay().appendChild(a);
  return a;
}
function audio(k){const id=CHANNELS[k]&&CHANNELS[k].audioId;return id?ensureAudio(id):null}
function ytPlaying(){const b=$("tunnelPlay");return!!b&&(b.textContent||"").trim()==="Ⅱ"}
function playing(k){
  if(k==="live-rare") return ytPlaying();
  const a=audio(k);return!!a&&!a.paused;
}
function stopOthers(k){
  const keep=audio(k);
  document.querySelectorAll("audio").forEach(a=>{if(a!==keep&&!a.paused)try{a.pause()}catch(_){}});
  if(k!=="live-rare"&&ytPlaying()) try{$("tunnelPlay").click()}catch(_){}
}
function stopAll(){
  document.querySelectorAll("audio").forEach(a=>{try{a.pause()}catch(_){}});
  if(ytPlaying()) try{$("tunnelPlay").click()}catch(_){}
}
function worldNow(){return WORLD.find(s=>s.id===worldId)||WORLD[0]}
function paint(){
  const c=CHANNELS[active];if(!c||!$("signal"))return;
  $("signal").textContent=c.label;
  const on=playing(active);
  $("status").textContent=on?"ON AIR":"CALADA";
  $("status").className=on?"live":"";
  $("ledOn").className="led"+(on?" on":"");
  const w=worldNow();
  let meta="—";
  if(active==="world") meta=w.name+" · "+w.src;
  else if(c.nowId&&$(c.nowId)) meta=$(c.nowId).textContent.trim()||"—";
  $("meta").textContent=meta;
  $("source").textContent=on?"ATIVO":"—";
  document.querySelectorAll("[data-signal]").forEach(b=>b.classList.toggle("active",b.dataset.signal===active));
  document.querySelectorAll("[data-world]").forEach(b=>b.classList.toggle("active",b.dataset.world===worldId));
  const box=$("worldCountries");
  if(box) box.hidden=active!=="world";
  if(on&&!timer){
    started=Date.now();
    timer=setInterval(()=>{
      const s=Math.floor((Date.now()-started)/1000);
      $("airtime").textContent=[Math.floor(s/3600),Math.floor(s%3600/60),s%60].map(n=>String(n).padStart(2,"0")).join(":");
    },1000);
  }
  if(!on&&timer){clearInterval(timer);timer=0;$("airtime").textContent="00:00:00"}
}
async function playUrl(a,url){
  if(!a||!url)return;
  const list=Array.isArray(url)?url:[url];
  for(const u of list){
    try{
      a.pause();
      a.src=u;
      a.load();
      await a.play();
      return;
    }catch(e){
      console.warn("[cabin] stream falhou",u,e);
    }
  }
}
async function select(k,autoplay=true){
  if(!CHANNELS[k])return;
  stopOthers(k);
  active=k;
  paint();
  if(!autoplay)return;
  const c=CHANNELS[k];
  if(k==="world"){
    await playUrl(audio("world"),worldNow().url);
  }else if(c.urls||c.url){
    await playUrl(audio(k),c.urls||c.url);
  }else if(c.playId&&$(c.playId)){
    try{$(c.playId).click()}catch(_){}
  }
  setTimeout(paint,200);
}
function renderSignals(){
  const drawer=$("signalsDrawer");if(!drawer)return;
  drawer.innerHTML=Object.entries(CHANNELS).map(([k,c])=>'<button type="button" data-all-signal="'+k+'">'+c.label+'</button>').join("");
  drawer.addEventListener("click",e=>{const b=e.target.closest("[data-all-signal]");if(b)select(b.dataset.allSignal,true)});
}
function renderWorld(){
  let box=$("worldCountries");
  if(!box){
    box=document.createElement("div");
    box.id="worldCountries";
    box.className="quick";
    const q=$("quick");
    if(q&&q.parentNode) q.parentNode.insertBefore(box,q.nextSibling);
  }
  box.innerHTML='<span style="color:#888;font-size:.65rem;letter-spacing:.08em">PAÍSES</span> '+WORLD.map(s=>'<button type="button" data-world="'+s.id+'">'+s.name+'</button>').join("");
  box.addEventListener("click",e=>{
    const b=e.target.closest("[data-world]");
    if(!b)return;
    worldId=b.dataset.world;
    const now=$("passportWorldNow");
    if(now) now.textContent=worldNow().src;
    select("world",true);
  });
}
$("quick").addEventListener("click",e=>{const b=e.target.closest("[data-signal]");if(b)select(b.dataset.signal,true)});
$("signalsBtn").onclick=()=>{$("signalsDrawer").hidden=!$("signalsDrawer").hidden};
$("playedBtn").onclick=()=>$("playedDrawer").hidden=!$("playedDrawer").hidden;
$("play").onclick=()=>select(active,true);
$("stop").onclick=()=>{stopAll();setTimeout(paint,50)};
$("mute").onclick=()=>{muted=!muted;document.querySelectorAll("audio").forEach(a=>a.muted=muted);$("mute").textContent=muted?"UNMUTE":"MUTE"};
$("volume").oninput=e=>document.querySelectorAll("audio").forEach(a=>a.volume=Number(e.target.value));
document.addEventListener("play",()=>setTimeout(paint,0),true);
document.addEventListener("pause",()=>setTimeout(paint,0),true);
renderSignals();
renderWorld();
paint();
setInterval(paint,600);
})();
