/* PASSPORT RADIO · TUNNELS UI
   Presentation/orchestration only. Does not replace any player engine.
   One tunnel panel is visible at a time; known audio elements are mutually exclusive.
*/
(() => {
  "use strict";
  if (!document.body.classList.contains("live-page")) return;
  const hub=document.getElementById("passportTunnels"); if(!hub)return;
  const panelIds=["passport80s","passportSoul","passportMPB","passportHits","passport5060","passportFlashHouse"];
  let activeId="",applying=false;

  function makeRow(target,number,title,format){
    const b=document.createElement("button"); b.className="tunnel-directory__row"; b.type="button"; b.dataset.tunnelTarget=target;
    b.setAttribute("aria-controls",target); b.setAttribute("aria-expanded","false");
    b.innerHTML=`<span class="tunnel-directory__number">${number}</span><strong class="tunnel-directory__title">${title}</strong><span class="tunnel-directory__format">${format}</span><span class="tunnel-directory__state">24 HOURS</span><span class="tunnel-directory__action">Abrir player</span>`;
    return b;
  }
  function ensureHitsDirectory(){const d=hub.querySelector(".tunnel-directory");if(!d||d.querySelector('[data-tunnel-target="passportHits"]'))return;d.appendChild(makeRow("passportHits","04","Passport Hits Tunnel™","Pop · Top 40"));}
  function ensure5060Directory(){const d=hub.querySelector(".tunnel-directory");if(!d||d.querySelector('[data-tunnel-target="passport5060"]'))return;d.appendChild(makeRow("passport5060","05","50s &amp; 60s Tunnel™","Rock ’n’ Roll · Golden Era"));}
  function ensureJovemGuardaDirectory(){
    const d=hub.querySelector(".tunnel-directory"); if(!d||d.querySelector("[data-jovem-guarda-directory]"))return;
    const row=makeRow("passport5060","JG","Jovem Guarda™","Iê-iê-iê brasileiro · Studio Souto"); row.dataset.jovemGuardaDirectory="1";
    row.querySelector(".tunnel-directory__action").textContent="Abrir player";
    row.addEventListener("click",()=>setTimeout(()=>{const p=document.getElementById("passportJovemGuardaPlayer");if(p)p.scrollIntoView({behavior:"smooth",block:"center"});},180));
    const a=d.querySelector('[data-tunnel-target="passport5060"]'); if(a)a.insertAdjacentElement("afterend",row);else d.prepend(row);
  }
  function ensureFlashHouseDirectory(){
    const d=hub.querySelector(".tunnel-directory");if(!d||d.querySelector('[data-tunnel-target="passportFlashHouse"]'))return;
    d.appendChild(makeRow("passportFlashHouse","06","Flash House Tunnel™","Flash House · Eurodance · House · Italo · Hi-NRG · Freestyle"));
    const intro=hub.querySelector(".tunnels-intro p");if(intro)intro.textContent="Seis ambientes musicais contínuos, organizados sem transformar a página numa parede de players. Abra um por vez; a engenharia dos canais permanece independente.";
  }
  function ensurePopoutPilot(){
    const d=hub.querySelector(".tunnel-directory"),row=d&&d.querySelector('[data-tunnel-target="passport5060"]');if(!d||!row||d.querySelector("[data-passport-popout-pilot]"))return;
    if(!document.querySelector("style[data-passport-popout-pilot-style]")){const s=document.createElement("style");s.dataset.passportPopoutPilotStyle="1";s.textContent=`.tunnel-popout-pilot{display:flex;justify-content:flex-end;padding:10px 0 3px}.tunnel-popout-pilot__button{appearance:none;border:0;background:transparent;color:#8a5a18;cursor:pointer;font:900 .55rem Inter,Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;text-decoration:none}@media(max-width:640px){.tunnel-popout-pilot{justify-content:flex-start;padding:10px 2px 4px}}`;document.head.appendChild(s);}
    const w=document.createElement("div");w.className="tunnel-popout-pilot";w.dataset.passportPopoutPilot="1";const b=document.createElement("button");b.type="button";b.className="tunnel-popout-pilot__button";b.textContent="Ouvir 50s & 60s em janela separada ↗";
    b.addEventListener("click",()=>{if(window.PassportRadioBridge&&typeof window.PassportRadioBridge.pauseLocal==="function")window.PassportRadioBridge.pauseLocal();else document.querySelectorAll("audio").forEach(a=>{if(!a.paused){try{a.pause();}catch(_){}}});const p=window.open("/passport-player.html?channel=5060","passportPlayer","popup=yes,width=470,height=820,resizable=yes,scrollbars=yes");if(p)try{p.focus();}catch(_){}});w.appendChild(b);row.insertAdjacentElement("afterend",w);
  }
  function loadScript(src,attr){if(document.querySelector(`script[${attr}]`))return;const s=document.createElement("script");s.src=src;s.setAttribute(attr,"1");document.head.appendChild(s);}
  function getPanels(){return panelIds.map(id=>document.getElementById(id)).filter(Boolean);}
  function buttonFor(id){return hub.querySelector(`[data-tunnel-target="${id}"]`);}
  function pausePanel(p){if(!p)return;p.querySelectorAll("audio").forEach(a=>{if(!a.paused)try{a.pause();}catch(_){}});}
  function setButtonState(id,text){hub.querySelectorAll(`[data-tunnel-target="${id}"] .tunnel-directory__state`).forEach(s=>s.textContent=text);}
  function normalizePanels(){if(applying)return;applying=true;try{getPanels().forEach(p=>{p.dataset.passportTunnelPanel="1";const on=p.id===activeId;p.hidden=!on;p.setAttribute("aria-hidden",on?"false":"true");hub.querySelectorAll(`[data-tunnel-target="${p.id}"]`).forEach(b=>{b.classList.toggle("is-active",on);b.setAttribute("aria-expanded",on?"true":"false");});});}finally{applying=false;}}
  function activate(id,o={}){const p=document.getElementById(id);if(!p)return false;if(activeId&&activeId!==id)pausePanel(document.getElementById(activeId));activeId=id;normalizePanels();if(o.scroll)requestAnimationFrame(()=>p.scrollIntoView({behavior:"smooth",block:"nearest"}));return true;}
  function collapse(id){if(activeId!==id)return;pausePanel(document.getElementById(id));activeId="";normalizePanels();}

  ensureHitsDirectory();ensure5060Directory();ensureJovemGuardaDirectory();ensureFlashHouseDirectory();ensurePopoutPilot();
  hub.querySelectorAll("[data-tunnel-target]").forEach(b=>b.addEventListener("click",()=>{const id=b.dataset.tunnelTarget;if(activeId===id)collapse(id);else activate(id,{scroll:true});}));
  document.addEventListener("play",e=>{const t=e.target;if(!(t instanceof HTMLMediaElement))return;document.querySelectorAll("audio").forEach(a=>{if(a!==t&&!a.paused)try{a.pause();}catch(_){}});const p=t.closest("[data-passport-tunnel-panel]")||t.closest("#passport80s,#passportSoul,#passportMPB,#passportHits,#passport5060,#passportFlashHouse");if(p&&panelIds.includes(p.id)){activeId=p.id;normalizePanels();panelIds.forEach(id=>setButtonState(id,id===p.id?"ON AIR":"24 HOURS"));}if(t.id!=="passportAudio"){const yt=document.getElementById("tunnelPlay");if(yt&&(yt.textContent||"").trim()==="Ⅱ")try{yt.click();}catch(_){}}},true);
  document.addEventListener("pause",e=>{const t=e.target;if(!(t instanceof HTMLMediaElement))return;const p=t.closest("#passport80s,#passportSoul,#passportMPB,#passportHits,#passport5060,#passportFlashHouse");if(p&&panelIds.includes(p.id))requestAnimationFrame(()=>{if(t.paused)setButtonState(p.id,"24 HOURS");});},true);
  const bind=()=>{["tunnelPlay","tunnelPrev","tunnelNext","tunnelPrevPlaylist","tunnelNextPlaylist","tunnelPlaylistPrev","tunnelPlaylistNext"].forEach(id=>{const b=document.getElementById(id);if(!b||b.dataset.passportExclusiveBound)return;b.dataset.passportExclusiveBound="1";b.addEventListener("click",()=>document.querySelectorAll("audio").forEach(a=>{if(!a.paused)try{a.pause();}catch(_){}}),{capture:true});});};
  new MutationObserver(()=>{normalizePanels();bind();}).observe(document.body,{childList:true,subtree:true});normalizePanels();bind();
  loadScript("/js/passport-hits-tunnel.js?v=202608242208","data-passport-hits-tunnel");
  loadScript("/js/50s-60s-tunnel.js?v=202609020135","data-passport-5060-tunnel");
  loadScript("/js/flash-house-tunnel.js?v=202608291930","data-passport-flash-house-tunnel");
  const hash=location.hash.replace("#","");if(panelIds.includes(hash)){const f=()=>activate(hash,{scroll:false});if(!f())setTimeout(f,900);}
})();
