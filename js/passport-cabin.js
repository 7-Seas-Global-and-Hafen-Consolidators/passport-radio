(()=>{
"use strict";
const EIGHTIES=[
  {id:"awesome",name:"AWESOME 80s",url:"https://listen.181fm.com/181-awesome80s_128k.mp3"},
  {id:"lite",name:"LITE 80s",url:"https://listen.181fm.com/181-lite80s_128k.mp3"},
  {id:"hair",name:"HAIRBAND",url:"https://listen.181fm.com/181-hairband_128k.mp3"},
  {id:"rnb",name:"80s R&B",url:"https://listen.181fm.com/181-80srnb_128k.mp3"},
  {id:"country",name:"80s COUNTRY",url:"https://listen.181fm.com/181-80scountry_128k.mp3"}
];
const LIVE=[
  {id:"livejam",name:"LIVE JAM",url:"https://stations.radio-host.com/proxy/livejam/stream"},
  {id:"awesome",name:"AWESOME",url:"https://listen.181fm.com/181-awesome80s_128k.mp3"},
  {id:"acoustic",name:"ACOUSTIC",url:"https://streams.radio7.de/unplugged/mp3-192/web/"},
  {id:"metal",name:"METAL",url:"https://streaming.viphosting.cl/8012/stream"}
];
const CHANNELS={
  "live-rare":{label:"LIVE & RARE™",playId:"tunnelPlay",nowId:"tunnelConsoleTitle"},
  "80s":{label:"80s TUNNEL™",audioId:"passport80sAudio"},
  soul:{label:"SOUL TUNNEL™",audioId:"passportSoulAudio",url:"https://onair7.xdevel.com/proxy/xautocloud_atvn_1069?mp=%2F%3B1%2F"},
  mpb:{label:"MPB TUNNEL™",playId:"passportMPBPlay",audioId:"passportMPBAudio"},
  hits:{label:"PASSPORT HITS™",audioId:"passportHitsAudio",url:"https://listen.181fm.com/181-power_128k.mp3"},
  continuous:{label:"CONTINUOUS SIGNALS™",audioId:"passport-live-audio"},
  brrock:{label:"ROCK BRASIL TUNNEL™",audioId:"passportBRRockAudio",urls:[
    "https://playerservices.streamtheworld.com/api/livestream-redirect/RADIO_KISSFM.mp3",
    "https://playerservices.streamtheworld.com/api/livestream-redirect/RADIO_KISSFM_ADP.aac",
    "https://s03.svrdedicado.org:7298/stream"
  ]},
  "5060":{label:"50s & 60s TUNNEL™",audioId:"passport5060Audio",url:"https://listen.181fm.com/181-goodtime_128k.mp3"},
  world:{label:"WORLD DIAL™",audioId:"passportWorldAudio"}
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
let active="live-rare",worldId="py",eightId="awesome",liveId="livejam",started=0,timer=0,muted=false;
function bay(){return $("engineBay")||document.body}
function ensureAudio(id){
  let a=$(id);
  if(a) return a;
  a=document.createElement("audio");
  a.id=id;
  a.preload="none";
  bay().appendChild(a);
  return a;
}
function audio(k){const id=CHANNELS[k]&&CHANNELS[k].audioId;return id?ensureAudio(id):null}
function ytPlaying(){const b=$("tunnelPlay");return!!b&&(b.textContent||"").trim()==="Ⅱ"}
function playing(k){if(k==="live-rare")return ytPlaying();const a=audio(k);return!!a&&!a.paused}
function stopOthers(k){
  const keep=audio(k);
  document.querySelectorAll("audio").forEach(a=>{if(a!==keep)try{a.pause()}catch(_){}});
  if(k!=="live-rare"&&ytPlaying()) try{$("tunnelPlay").click()}catch(_){}
}
function stopAll(){
  document.querySelectorAll("audio").forEach(a=>{try{a.pause()}catch(_){}});
  if(ytPlaying()) try{$("tunnelPlay").click()}catch(_){}
}
function worldNow(){return WORLD.find(s=>s.id===worldId)||WORLD[0]}
function eightNow(){return EIGHTIES.find(s=>s.id===eightId)||EIGHTIES[0]}
function liveNow(){return LIVE.find(s=>s.id===liveId)||LIVE[0]}
function paint(){
  const c=CHANNELS[active];if(!c||!$("signal"))return;
  $("signal").textContent=c.label;
  const on=playing(active);
  $("status").textContent=on?"ON AIR":"CALADA";
  $("status").className=on?"live":"";
  $("ledOn").className="led"+(on?" on":"");
  let meta="—";
  if(active==="world") meta=worldNow().name+" · "+worldNow().src;
  else if(active==="80s") meta=eightNow().name;
  else if(active==="continuous") meta=liveNow().name;
  else if(active==="brrock") meta="Kiss FM 92.5 · São Paulo";
  else if(c.nowId&&$(c.nowId)) meta=$(c.nowId).textContent.trim()||"—";
  $("meta").textContent=meta;
  $("source").textContent=on?"ATIVO":"—";
  document.querySelectorAll("[data-signal]").forEach(b=>b.classList.toggle("active",b.dataset.signal===active));
  const world=$("worldCountries"); if(world) world.hidden=active!=="world";
  const e80=$("eightiesSubs"); if(e80) e80.hidden=active!=="80s";
  const lv=$("liveSubs"); if(lv) lv.hidden=active!=="continuous";
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
  if(!a||!url)return false;
  const list=Array.isArray(url)?url:[url];
  for(const u of list){
    try{
      try{a.pause()}catch(_){}
      a.removeAttribute("crossorigin");
      a.src=u;
      await a.play();
      if(!a.paused) return true;
    }catch(e){
      console.warn("[cabin] stream falhou",u,e);
    }
  }
  return false;
}
async function select(k,autoplay=true){
  if(!CHANNELS[k])return;
  stopOthers(k);
  active=k;
  paint();
  if(!autoplay)return;
  const c=CHANNELS[k];
  if(k==="world") await playUrl(audio("world"),worldNow().url);
  else if(k==="80s") await playUrl(audio("80s"),eightNow().url);
  else if(k==="continuous") await playUrl(audio("continuous"),liveNow().url);
  else if(c.urls||c.url) await playUrl(audio(k),c.urls||c.url);
  else if(c.playId&&$(c.playId)) try{$(c.playId).click()}catch(_){}
  setTimeout(paint,250);
}
function renderSubs(){
  let e80=$("eightiesSubs");
  if(!e80){
    e80=document.createElement("div");
    e80.id="eightiesSubs";
    e80.className="quick";
    const q=$("quick");
    if(q&&q.parentNode) q.parentNode.insertBefore(e80,q.nextSibling);
  }
  e80.innerHTML=EIGHTIES.map(s=>'<button type="button" data-80="'+s.id+'">'+s.name+'</button>').join("");
  e80.onclick=e=>{
    const b=e.target.closest("[data-80]");
    if(!b)return;
    eightId=b.getAttribute("data-80");
    select("80s",true);
  };
  let lv=$("liveSubs");
  if(!lv){
    lv=document.createElement("div");
    lv.id="liveSubs";
    lv.className="quick";
    const q=$("quick");
    if(q&&q.parentNode) q.parentNode.insertBefore(lv,q.nextSibling);
  }
  lv.innerHTML=LIVE.map(s=>'<button type="button" data-live="'+s.id+'">'+s.name+'</button>').join("");
  lv.onclick=e=>{
    const b=e.target.closest("[data-live]");
    if(!b)return;
    liveId=b.getAttribute("data-live");
    select("continuous",true);
  };
  let world=$("worldCountries");
  if(!world){
    world=document.createElement("div");
    world.id="worldCountries";
    world.className="quick";
    const q=$("quick");
    if(q&&q.parentNode) q.parentNode.insertBefore(world,q.nextSibling);
  }
  world.innerHTML=WORLD.map(s=>'<button type="button" data-world="'+s.id+'">'+s.name+'</button>').join("");
  world.onclick=e=>{
    const b=e.target.closest("[data-world]");
    if(!b)return;
    worldId=b.dataset.world;
    select("world",true);
  };
}
function renderSignals(){
  const drawer=$("signalsDrawer");if(!drawer)return;
  drawer.innerHTML=Object.entries(CHANNELS).map(([k,c])=>'<button type="button" data-all-signal="'+k+'">'+c.label+'</button>').join("");
  drawer.addEventListener("click",e=>{const b=e.target.closest("[data-all-signal]");if(b)select(b.dataset.allSignal,true)});
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
renderSubs();
paint();
setInterval(paint,600);
})();
