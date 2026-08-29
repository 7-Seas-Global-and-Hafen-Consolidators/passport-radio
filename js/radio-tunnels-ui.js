/* PASSPORT RADIO · TUNNELS UI
   Presentation/orchestration only. Does not replace any player engine.
   One tunnel panel is visible at a time; known audio elements are mutually exclusive.
*/
(() => {
  "use strict";
  if (!document.body.classList.contains("live-page")) return;

  const hub = document.getElementById("passportTunnels");
  if (!hub) return;

  const panelIds = ["passport80s", "passportSoul", "passportMPB", "passportHits", "passport5060", "passportFlashHouse"];
  let activeId = "";
  let applying = false;

  function ensureHitsDirectory(){
    const directory = hub.querySelector(".tunnel-directory");
    if (!directory || directory.querySelector('[data-tunnel-target="passportHits"]')) return;
    const button = document.createElement("button");
    button.className = "tunnel-directory__row"; button.type = "button"; button.dataset.tunnelTarget = "passportHits";
    button.setAttribute("aria-controls", "passportHits"); button.setAttribute("aria-expanded", "false");
    button.innerHTML = `<span class="tunnel-directory__number">04</span><strong class="tunnel-directory__title">Passport Hits Tunnel™</strong><span class="tunnel-directory__format">Pop · Top 40</span><span class="tunnel-directory__state">24 HOURS</span><span class="tunnel-directory__action">Abrir player</span>`;
    directory.appendChild(button);
  }

  function ensure5060Directory(){
    const directory = hub.querySelector(".tunnel-directory");
    if (!directory || directory.querySelector('[data-tunnel-target="passport5060"]')) return;
    const button = document.createElement("button");
    button.className = "tunnel-directory__row"; button.type = "button"; button.dataset.tunnelTarget = "passport5060";
    button.setAttribute("aria-controls", "passport5060"); button.setAttribute("aria-expanded", "false");
    button.innerHTML = `<span class="tunnel-directory__number">05</span><strong class="tunnel-directory__title">50s &amp; 60s Tunnel™</strong><span class="tunnel-directory__format">Rock ’n’ Roll · Golden Era</span><span class="tunnel-directory__state">24 HOURS</span><span class="tunnel-directory__action">Abrir player</span>`;
    directory.appendChild(button);
  }

  function ensureFlashHouseDirectory(){
    const directory = hub.querySelector(".tunnel-directory");
    if (!directory || directory.querySelector('[data-tunnel-target="passportFlashHouse"]')) return;
    const button = document.createElement("button");
    button.className = "tunnel-directory__row"; button.type = "button"; button.dataset.tunnelTarget = "passportFlashHouse";
    button.setAttribute("aria-controls", "passportFlashHouse"); button.setAttribute("aria-expanded", "false");
    button.innerHTML = `<span class="tunnel-directory__number">06</span><strong class="tunnel-directory__title">Flash House Tunnel™</strong><span class="tunnel-directory__format">Flash House · Eurodance · House · Italo · Hi-NRG · Freestyle</span><span class="tunnel-directory__state">24 HOURS</span><span class="tunnel-directory__action">Abrir player</span>`;
    directory.appendChild(button);
    const intro = hub.querySelector(".tunnels-intro p");
    if (intro) intro.textContent = "Seis ambientes musicais contínuos, organizados sem transformar a página numa parede de players. Abra um por vez; a engenharia dos canais permanece independente.";
  }

  function ensurePopoutPilot(){
    const directory = hub.querySelector(".tunnel-directory");
    const row = directory && directory.querySelector('[data-tunnel-target="passport5060"]');
    if (!directory || !row || directory.querySelector("[data-passport-popout-pilot]")) return;
    if (!document.querySelector("style[data-passport-popout-pilot-style]")) {
      const style = document.createElement("style"); style.dataset.passportPopoutPilotStyle = "1";
      style.textContent = `.tunnel-popout-pilot{display:flex;justify-content:flex-end;padding:10px 0 3px}.tunnel-popout-pilot__button{appearance:none;border:0;background:transparent;color:#8a5a18;cursor:pointer;font:900 .55rem Inter,Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;text-decoration:none}.tunnel-popout-pilot__button:hover{text-decoration:underline;text-underline-offset:4px}@media(max-width:640px){.tunnel-popout-pilot{justify-content:flex-start;padding:10px 2px 4px}.tunnel-popout-pilot__button{font-size:.52rem}}`;
      document.head.appendChild(style);
    }
    const wrap = document.createElement("div"); wrap.className = "tunnel-popout-pilot"; wrap.dataset.passportPopoutPilot = "1";
    const button = document.createElement("button"); button.type = "button"; button.className = "tunnel-popout-pilot__button"; button.textContent = "Ouvir 50s & 60s em janela separada ↗";
    button.setAttribute("aria-label", "Abrir 50s e 60s Tunnel em player separado");
    button.addEventListener("click", () => { if (window.PassportRadioBridge && typeof window.PassportRadioBridge.pauseLocal === "function") window.PassportRadioBridge.pauseLocal(); else document.querySelectorAll("audio").forEach(a => { if (!a.paused) { try { a.pause(); } catch (_) {} } }); const popup = window.open("/passport-player.html?channel=5060", "passportPlayer", "popup=yes,width=470,height=820,resizable=yes,scrollbars=yes"); if (popup) { try { popup.focus(); } catch (_) {} } });
    wrap.appendChild(button); row.insertAdjacentElement("afterend", wrap);
  }

  function loadScript(src, attr){ if (document.querySelector(`script[${attr}]`)) return; const s=document.createElement("script"); s.src=src; s.setAttribute(attr,"1"); document.head.appendChild(s); }
  function getPanels(){ return panelIds.map(id => document.getElementById(id)).filter(Boolean); }
  function buttonFor(id){ return hub.querySelector(`[data-tunnel-target="${id}"]`); }
  function pausePanel(panel){ if (!panel) return; panel.querySelectorAll("audio").forEach(a => { if (!a.paused) { try { a.pause(); } catch (_) {} } }); }
  function setButtonState(id,text){ const b=buttonFor(id); const state=b&&b.querySelector(".tunnel-directory__state"); if(state) state.textContent=text; }
  function normalizePanels(){ if(applying)return; applying=true; try { getPanels().forEach(panel=>{ panel.dataset.passportTunnelPanel="1"; const isActive=panel.id===activeId; panel.hidden=!isActive; panel.setAttribute("aria-hidden",isActive?"false":"true"); const b=buttonFor(panel.id); if(b){b.classList.toggle("is-active",isActive);b.setAttribute("aria-expanded",isActive?"true":"false");} }); } finally { applying=false; } }
  function activate(id,options={}){ const panel=document.getElementById(id); if(!panel)return false; if(activeId&&activeId!==id)pausePanel(document.getElementById(activeId)); activeId=id; normalizePanels(); if(options.scroll)requestAnimationFrame(()=>panel.scrollIntoView({behavior:"smooth",block:"nearest"})); return true; }
  function collapse(id){ if(activeId!==id)return; pausePanel(document.getElementById(id)); activeId=""; normalizePanels(); }

  ensureHitsDirectory(); ensure5060Directory(); ensureFlashHouseDirectory(); ensurePopoutPilot();
  hub.querySelectorAll("[data-tunnel-target]").forEach(button=>button.addEventListener("click",()=>{ const id=button.dataset.tunnelTarget; if(activeId===id)collapse(id); else activate(id,{scroll:true}); }));

  document.addEventListener("play",event=>{ const target=event.target; if(!(target instanceof HTMLMediaElement))return; document.querySelectorAll("audio").forEach(a=>{if(a!==target&&!a.paused){try{a.pause();}catch(_){}}}); const panel=target.closest("[data-passport-tunnel-panel]")||target.closest("#passport80s,#passportSoul,#passportMPB,#passportHits,#passport5060,#passportFlashHouse"); if(panel&&panelIds.includes(panel.id)){activeId=panel.id;normalizePanels();panelIds.forEach(id=>setButtonState(id,id===panel.id?"ON AIR":"24 HOURS"));} if(target.id!=="passportAudio"){const yt=document.getElementById("tunnelPlay");if(yt&&(yt.textContent||"").trim()==="Ⅱ"){try{yt.click();}catch(_){}}}},true);
  document.addEventListener("pause",event=>{const target=event.target;if(!(target instanceof HTMLMediaElement))return;const panel=target.closest("#passport80s,#passportSoul,#passportMPB,#passportHits,#passport5060,#passportFlashHouse");if(panel&&panelIds.includes(panel.id))requestAnimationFrame(()=>{if(target.paused)setButtonState(panel.id,"24 HOURS");});},true);
  const bindTunnelControls=()=>{["tunnelPlay","tunnelPrev","tunnelNext","tunnelPrevPlaylist","tunnelNextPlaylist","tunnelPlaylistPrev","tunnelPlaylistNext"].forEach(id=>{const b=document.getElementById(id);if(!b||b.dataset.passportExclusiveBound)return;b.dataset.passportExclusiveBound="1";b.addEventListener("click",()=>document.querySelectorAll("audio").forEach(a=>{if(!a.paused){try{a.pause();}catch(_){}}}),{capture:true});});};
  const observer=new MutationObserver(()=>{normalizePanels();bindTunnelControls();}); observer.observe(document.body,{childList:true,subtree:true});
  normalizePanels(); bindTunnelControls();
  loadScript("/js/passport-hits-tunnel.js?v=202608242208","data-passport-hits-tunnel");
  loadScript("/js/50s-60s-tunnel.js?v=202608242230","data-passport-5060-tunnel");
  loadScript("/js/flash-house-tunnel.js?v=202608291930","data-passport-flash-house-tunnel");
  const hash=location.hash.replace("#",""); if(panelIds.includes(hash)){const openFromHash=()=>activate(hash,{scroll:false});if(!openFromHash())setTimeout(openFromHash,900);}
})();
