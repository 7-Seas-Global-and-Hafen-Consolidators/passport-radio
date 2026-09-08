/* PASSPORT RADIO · GLOBO DE OURO TUNNEL™
   Isolated audio-only engine. No video/iframe is rendered.
   The stream endpoint is intentionally external/configurable; existing tunnel engines stay untouched.
*/
(()=>{"use strict";
const PANEL_ID="passportGloboOuro",AUDIO_ID="passportGloboOuroAudio",PLAY_ID="passportGloboOuroPlay",STATUS_ID="passportGloboOuroStatus";
const DEFAULT_STREAM="";
function streamUrl(){return String(window.PASSPORT_GLOBO_DE_OURO_STREAM||DEFAULT_STREAM).trim()}
function ensurePanel(){
 const hub=document.getElementById("passportTunnels");if(!hub||document.getElementById(PANEL_ID))return;
 const panel=document.createElement("section");panel.id=PANEL_ID;panel.className="tunnel-panel passport-globo-ouro";panel.hidden=true;panel.setAttribute("aria-hidden","true");panel.innerHTML=`<div class="tunnel-panel__head"><span>ARCHIVE SIGNAL · 1973–1990</span><h3>Globo de Ouro Tunnel™</h3><p>Somente áudio. Apresentadores, plateia e performances preservados como blocos de memória da televisão musical brasileira.</p></div><div class="tunnel-player"><button id="${PLAY_ID}" type="button" aria-label="Reproduzir Globo de Ouro Tunnel">▶</button><div><strong>GLOBO DE OURO TUNNEL™</strong><span>1973–1990 · AUDIO ARCHIVE · 24 HOURS</span></div><span id="${STATUS_ID}">READY</span></div><audio id="${AUDIO_ID}" preload="none"></audio>`;hub.appendChild(panel);
 const audio=document.getElementById(AUDIO_ID),play=document.getElementById(PLAY_ID),status=document.getElementById(STATUS_ID);
 const sync=()=>{play.textContent=audio.paused?"▶":"Ⅱ";status.textContent=audio.paused?"READY":"ON AIR"};
 play.addEventListener("click",async()=>{if(!audio.paused){audio.pause();sync();return}const src=streamUrl();if(!src){status.textContent="STREAM PENDING";return}if(audio.src!==src)audio.src=src;document.querySelectorAll("audio").forEach(a=>{if(a!==audio&&!a.paused)try{a.pause()}catch(_){}});try{await audio.play();sync()}catch(e){console.error("[Globo de Ouro Tunnel]",e);status.textContent="RETRY"}});
 audio.addEventListener("play",sync);audio.addEventListener("pause",sync);audio.addEventListener("error",()=>status.textContent="OFFLINE");
}
function boot(){ensurePanel()}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
window.PassportGloboOuroTunnel={setStream:url=>{window.PASSPORT_GLOBO_DE_OURO_STREAM=String(url||"");const a=document.getElementById(AUDIO_ID);if(a){a.pause();a.removeAttribute("src");a.load()}},stop:()=>{const a=document.getElementById(AUDIO_ID);if(a&&!a.paused)a.pause()}};
})();
