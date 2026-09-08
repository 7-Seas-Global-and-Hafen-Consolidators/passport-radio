/* PASSPORT RADIO · GLOBO DE OURO TUNNEL™
   Directory launcher only on radio.html. The channel opens in its own
   Passport player; no raw inline player is rendered on the radio page.
*/
(()=>{"use strict";
const TARGET="passportGloboOuro",PLAYER_URL="/globo-de-ouro-player.html";
function pauseLocal(){if(window.PassportRadioBridge&&typeof window.PassportRadioBridge.pauseLocal==="function"){try{window.PassportRadioBridge.pauseLocal();return}catch(_){}}document.querySelectorAll("audio").forEach(a=>{if(!a.paused)try{a.pause()}catch(_){}})}
function ensureDirectory(){const hub=document.getElementById("passportTunnels"),d=hub&&hub.querySelector(".tunnel-directory");if(!d||d.querySelector(`[data-tunnel-target="${TARGET}"]`))return;const a=document.createElement("a");a.className="tunnel-directory__row";a.href=PLAYER_URL;a.target="passportPlayerV2";a.rel="noopener";a.dataset.tunnelTarget=TARGET;a.dataset.passportPlayer="globo-ouro";a.dataset.passportPlayerWired="1";a.setAttribute("aria-label","Abrir Globo de Ouro Tunnel™ em player independente");a.innerHTML='<span class="tunnel-directory__number">08</span><strong class="tunnel-directory__title">Globo de Ouro Tunnel™</strong><span class="tunnel-directory__format">1973–1990 · apresentadores · plateia · performances · áudio</span><span class="tunnel-directory__state">24 HOURS</span><span class="tunnel-directory__action">Abrir player ↗</span>';a.addEventListener("click",pauseLocal,{capture:true});d.appendChild(a);const intro=hub.querySelector(".tunnels-intro p");if(intro)intro.textContent="Oito ambientes musicais contínuos. Os sinais independentes abrem em seu próprio player sem transformar esta página numa parede de players."}
function boot(){document.getElementById(TARGET)?.remove();ensureDirectory()}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
window.PassportGloboOuroTunnel={open:()=>window.open(PLAYER_URL,"passportPlayerV2"),stop:()=>{}};
})();
