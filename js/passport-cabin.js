/* PASSPORT RADIO · CABINE = TELECOMANDO DOS MOTORES ORIGINAIS
   Um visor. Um som. A cabine delega cada sinal ao seu motor real.
   WORLD usa o catálogo real de 18 sinais já publicado pela Passport.
*/
(()=>{
"use strict";
const WORLD=[
{id:'py',name:'Radio Paraguay',source:'Passport Radio',stream:'https://cp9.serverse.com/proxy/rockandpop/stream'},
{id:'fr',name:'Radio France',source:'Passport Radio',stream:'https://ouifm.ice.infomaniak.ch/ouifm-high.mp3'},
{id:'ca',name:'Radio Québec',source:'Passport Radio',stream:'https://stream.statsradio.com:8050/stream'},
{id:'kr',name:'한국 음악 라디오',source:'Passport Radio',stream:'https://antares.dribbcast.com/proxy/kpop?mp=/s'},
{id:'tr',name:'Türkiye Müzik Radyosu',source:'Passport Radio',stream:'https://yayin5.radyohizmeti.com/8090/stream;'},
{id:'cn',name:'中国音乐电台',source:'Passport Radio',stream:'https://lhttp.qingting.fm/live/4804/64k.mp3'},
{id:'ua',name:'Українське музичне радіо',source:'Passport Radio',stream:'https://tavr.tvstitch.com/HitFM?.mp3'},
{id:'ir',name:'رادیو موسیقی ایران',source:'Passport Radio',stream:'https://radio.avazfarsi.com:8000/radio.mp3'},
{id:'ve',name:'Radio Venezuela',source:'Passport Radio',stream:'https://acp4.lorini.net:2050/stream'},
{id:'ea',name:'Rádio África',source:'Passport Radio',stream:'https://edge.iono.fm/xice/jacarandafm_live_medium.aac'},
{id:'pk',name:'پاکستانی موسیقی ریڈیو',source:'Passport Radio',stream:'https://radio.cityfm89.com/stream'},
{id:'ro',name:'Radio Muzică Românească',source:'Passport Radio',stream:'https://live.rockfm.ro/rockfm.aacp'},
{id:'fi',name:'Suomalainen rockradio',source:'Passport Radio',stream:'https://aud-stream-radiorock.nm-elemental.nelonenmedia.fi/playlist.m3u8'},
{id:'cz',name:'České rockové rádio',source:'Passport Radio',stream:'https://icecast3.play.cz/hey-radio128.mp3'},
{id:'lt',name:'Lietuvos roko radijas',source:'Passport Radio',stream:'https://stream2.rockfm.lt/crf128.mp3'},
{id:'gr',name:'Ελληνικό ροκ ραδιόφωνο',source:'Passport Radio',stream:'https://stream.radiojar.com/redfm963'},
{id:'il',name:'רדיו מוזיקה ישראלית',source:'Passport Radio',stream:'https://glzwizzlv.bynetcdn.com/glglz_mp3'},
{id:'it',name:'Radio Italia',source:'Passport Radio',stream:'https://str01.fluidstream.net/company.mp3'}
];
const SIGNALS={
'live-rare':{label:'LIVE & RARE™',meta:'Arquivo underground',playId:'tunnelPlay',yt:true},
'80s':{label:'80s TUNNEL™',meta:'Passport Radio',playId:'passport80sPlay',audioId:'passport80sAudio'},
soul:{label:'SOUL TUNNEL™',meta:'Passport Radio',playId:'passportSoulPlay',audioId:'passportSoulAudio'},
mpb:{label:'MPB TUNNEL™',meta:'Passport Radio',playId:'passportMPBPlay',audioId:'passportMPBAudio'},
hits:{label:'PASSPORT HITS™',meta:'Pop · Top 40',playId:'passportHitsPlay',audioId:'passportHitsAudio'},
continuous:{label:'CONTINUOUS SIGNALS™',meta:'Passport Live',playId:'passport-live-play',audioId:'passport-live-audio'},
brrock:{label:'ROCK BRASIL TUNNEL™',meta:'Passport Radio',playId:'passportBRRockPlay',audioId:'passportBRRockAudio'},
'5060':{label:'50s & 60s TUNNEL™',meta:'Passport Radio',playId:'passport5060Play',audioId:'passport5060Audio'},
world:{label:'WORLD DIAL™',meta:'Atlas',audioId:'passportWorldAudio'}
};
const $=id=>document.getElementById(id);
let active='live-rare',worldId='py',started=0,timer=0,generation=0,worldHls=null,worldHlsLoader=null;
const worldNow=()=>WORLD.find(w=>w.id===worldId)||WORLD[0];
const ytPlaying=()=>{const b=$('tunnelPlay');return !!b&&(b.textContent||'').trim()==='Ⅱ'};
const mediaPlaying=id=>{const a=$(id);return !!a&&!a.paused};
const isOn=id=>{const s=SIGNALS[id];return !!s&&(s.yt?ytPlaying():(s.audioId?mediaPlaying(s.audioId):false))};
function destroyWorldHls(){if(worldHls){try{worldHls.destroy()}catch(_){}worldHls=null}}
function stopYt(){if(ytPlaying())try{$('tunnelPlay').click()}catch(_){}}
function stopMediaExcept(keep){document.querySelectorAll('audio,video').forEach(el=>{if(el!==keep&&!el.paused)try{el.pause()}catch(_){}})}
function stopAll(){generation++;destroyWorldHls();stopMediaExcept(null);stopYt();setTimeout(paint,40)}
function paint(){const s=SIGNALS[active];if(!s||!$('signal'))return;const on=isOn(active);$('signal').textContent=s.label;$('status').textContent=on?'ON AIR':'CALADA';$('status').className=on?'live':'';if($('ledOn'))$('ledOn').className='led'+(on?' on':'');$('meta').textContent=active==='world'?worldNow().name+' · '+worldNow().source:(s.meta||'—');if($('source'))$('source').textContent=on?'ATIVO':'—';document.querySelectorAll('[data-signal]').forEach(b=>b.classList.toggle('active',b.dataset.signal===active));if($('worldCountries'))$('worldCountries').hidden=active!=='world';if(on&&!timer){started=Date.now();timer=setInterval(()=>{const sec=Math.floor((Date.now()-started)/1000);if($('airtime'))$('airtime').textContent=[Math.floor(sec/3600),Math.floor((sec%3600)/60),sec%60].map(n=>String(n).padStart(2,'0')).join(':')},1000)}if(!on&&timer){clearInterval(timer);timer=0;if($('airtime'))$('airtime').textContent='00:00:00'}}
function waitButton(id,token,tries=30){return new Promise(resolve=>{const step=()=>{if(token!==generation)return resolve(null);const b=$(id);if(b)return resolve(b);if(tries--<=0)return resolve(null);setTimeout(step,120)};step()})}
async function loadHls(){if(window.Hls)return window.Hls;if(worldHlsLoader)return worldHlsLoader;worldHlsLoader=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/hls.js@1.7.0/dist/hls.min.js';s.async=true;s.onload=()=>window.Hls?resolve(window.Hls):reject(new Error('HLS unavailable'));s.onerror=()=>reject(new Error('HLS load failed'));document.head.appendChild(s)}).catch(e=>{worldHlsLoader=null;throw e});return worldHlsLoader}
async function playWorld(token){const a=$('passportWorldAudio');if(!a||token!==generation)return;const w=worldNow();stopMediaExcept(a);stopYt();destroyWorldHls();a.pause();a.removeAttribute('src');a.load();try{if(/\.m3u8(?:$|[?#])/i.test(w.stream)&&!a.canPlayType('application/vnd.apple.mpegurl')){const Hls=await loadHls();if(token!==generation)return;if(!Hls.isSupported())throw new Error('HLS unsupported');worldHls=new Hls({enableWorker:true});worldHls.loadSource(w.stream);worldHls.attachMedia(a);await new Promise((resolve,reject)=>{worldHls.on(Hls.Events.MANIFEST_PARSED,resolve);worldHls.on(Hls.Events.ERROR,(_e,d)=>{if(d&&d.fatal)reject(new Error(d.details||'HLS fatal'))})})}else{a.src=w.stream;a.load()}if(token!==generation)return;await a.play()}catch(e){if(token===generation){$('status').textContent='SINAL INDISPONÍVEL';console.warn('[WORLD]',w.source,e)}}}
async function playActive(){const s=SIGNALS[active];if(!s)return;const token=++generation;if(s.yt){stopMediaExcept(null);const b=await waitButton(s.playId,token);if(b&&token===generation)b.click();return}stopYt();if(active==='world'){await playWorld(token);return}stopMediaExcept(null);const b=await waitButton(s.playId,token);if(b&&token===generation)b.click()}
function select(id){if(!SIGNALS[id])return;stopAll();active=id;paint();setTimeout(()=>playActive(),30)}
document.addEventListener('play',e=>{const target=e.target;if(!(target instanceof HTMLMediaElement))return;stopMediaExcept(target);if(ytPlaying())stopYt();const found=Object.entries(SIGNALS).find(([,s])=>s.audioId===target.id);if(found)active=found[0];setTimeout(paint,0)},true);
document.addEventListener('pause',()=>setTimeout(paint,0),true);
function renderWorld(){const box=$('worldCountries');if(!box)return;box.innerHTML=WORLD.map(w=>'<button type="button" data-world="'+w.id+'">'+w.name+'</button>').join('');box.onclick=e=>{const b=e.target.closest('[data-world]');if(!b)return;worldId=b.dataset.world;select('world')}}
function renderSignals(){const d=$('signalsDrawer');if(!d)return;d.innerHTML=Object.entries(SIGNALS).map(([k,s])=>'<button type="button" data-all-signal="'+k+'">'+s.label+'</button>').join('');d.onclick=e=>{const b=e.target.closest('[data-all-signal]');if(b)select(b.dataset.allSignal)}}
if($('quick'))$('quick').addEventListener('click',e=>{const b=e.target.closest('[data-signal]');if(b)select(b.dataset.signal)});if($('play'))$('play').onclick=playActive;if($('stop'))$('stop').onclick=stopAll;if($('mute'))$('mute').onclick=()=>{const on=$('mute').dataset.on!=='1';$('mute').dataset.on=on?'1':'0';$('mute').textContent=on?'UNMUTE':'MUTE';document.querySelectorAll('audio').forEach(a=>a.muted=on)};if($('volume'))$('volume').oninput=e=>{const v=Number(e.target.value);document.querySelectorAll('audio').forEach(a=>a.volume=v)};if($('signalsBtn'))$('signalsBtn').onclick=()=>{$('signalsDrawer').hidden=!$('signalsDrawer').hidden};if($('playedBtn'))$('playedBtn').onclick=()=>{$('playedDrawer').hidden=!$('playedDrawer').hidden};const yt=$('tunnelPlay');if(yt)new MutationObserver(()=>paint()).observe(yt,{childList:true,characterData:true,subtree:true});renderWorld();renderSignals();paint();setInterval(paint,800);
})();
