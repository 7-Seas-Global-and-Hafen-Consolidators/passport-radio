/* PASSPORT RADIO · GLOBO DE OURO TUNNEL™ */
(()=>{"use strict";
const TARGET="passportGloboOuro",PLAYER_URL="/globo-de-ouro-player.html";
function pauseLocal(){document.querySelectorAll("audio").forEach(a=>{if(!a.paused)try{a.pause()}catch(_){}})}
function ensureDirectory(){const hub=document.getElementById("passportTunnels"),d=hub&&hub.querySelector(".tunnel-directory");if(!d||d.querySelector(`[data-tunnel-target="${TARGET}"]`))return;const a=document.createElement("a");a.className="tunnel-directory__row";a.href=PLAYER_URL;a.target="_self";a.dataset.tunnelTarget=TARGET;a.setAttribute("aria-label","Abrir Globo de Ouro Tunnel™");a.innerHTML='<span class="tunnel-directory__number">08</span><strong class="tunnel-directory__title">Globo de Ouro Tunnel™</strong><span class="tunnel-directory__format">programas que o Nomad passou</span><span class="tunnel-directory__state">24 HOURS</span><span class="tunnel-directory__action">Abrir player →</span>';a.addEventListener("click",pauseLocal,{capture:true});d.appendChild(a);}
function boot(){document.getElementById(TARGET)?.remove();ensureDirectory()}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
window.PassportGloboOuroTunnel={open:()=>{location.href=PLAYER_URL},stop:()=>{}};
})();
