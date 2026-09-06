/* PASSPORT RADIO · BR TUNNEL™
   Brazilian rock continuous signal. Independent engine; participates in global audio interlock.
*/
(() => {
  "use strict";
  if (!document.body.classList.contains("live-page")) return;
  const hub=document.getElementById("passportTunnels"),host=document.querySelector(".tunnel-stage-shell"),directory=hub&&hub.querySelector(".tunnel-directory");
  if(!hub||!host||!directory||document.getElementById("passportBR"))return;

  const SOURCES=[{label:"Rock Brasil · sinal contínuo",url:"https://14923.live.streamtheworld.com/CIDADEROCKBRASILAAC"}];

  const row=document.createElement("button");
  row.className="tunnel-directory__row";row.type="button";row.dataset.tunnelTarget="passportBR";row.setAttribute("aria-controls","passportBR");row.setAttribute("aria-expanded","false");
  row.innerHTML='<span class="tunnel-directory__number">07</span><strong class="tunnel-directory__title">BR Tunnel™</strong><span class="tunnel-directory__format">Rock brasileiro · clássicos · 80s · 90s · 2000 · nova cena</span><span class="tunnel-directory__state">24 HOURS</span><span class="tunnel-directory__action">Abrir player</span>';
  directory.appendChild(row);

  const section=document.createElement("section");section.id="passportBR";section.className="passport-br-section";section.dataset.passportTunnelPanel="1";section.hidden=true;section.setAttribute("aria-hidden","true");
  section.innerHTML=`<div class="live-shell"><div style="padding:34px 0 40px"><span class="live-kicker">PASSPORT RADIO™ · 24 HOURS · BRAZIL</span><h2 style="margin:.25em 0 .18em;font-size:clamp(3rem,9vw,7rem);line-height:.86">BR<br>Tunnel™</h2><p style="max-width:720px">Rock brasileiro atravessando gerações: clássicos, 80s, 90s, 2000 e novas cenas em sinal contínuo.</p><div id="passportBRPlayer" style="margin-top:24px;border:1px solid #d8d8d8;background:#fff;padding:20px;max-width:760px"><div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap"><button id="passportBRPlay" type="button" aria-label="Tocar BR Tunnel" style="width:58px;height:58px;border-radius:50%;border:0;background:#e10600;color:#fff;font-size:1.25rem;cursor:pointer">▶</button><div style="min-width:220px;flex:1"><small style="display:block;font-weight:800;letter-spacing:.12em;text-transform:uppercase">BR Tunnel™ · 24H</small><strong id="passportBRState" style="display:block;margin-top:5px;font-size:1.1rem">Pronto para tocar</strong><span id="passportBRSource" style="display:block;margin-top:3px;color:#666;font-size:.82rem">Rock Brasil · sinal contínuo</span></div></div><audio id="passportBRAudio" preload="none"></audio></div><span class="handwritten" style="display:block;margin-top:20px">do Brasil, alto e sem pedir licença.</span></div></div>`;
  host.appendChild(section);

  const audio=section.querySelector("#passportBRAudio"),play=section.querySelector("#passportBRPlay"),state=section.querySelector("#passportBRState"),source=section.querySelector("#passportBRSource"),dirState=row.querySelector(".tunnel-directory__state");
  let sourceIndex=0;
  const stopOthers=()=>document.querySelectorAll("audio").forEach(a=>{if(a!==audio&&!a.paused)try{a.pause()}catch(_){}});
  const prepare=(i=0)=>{sourceIndex=i%SOURCES.length;const s=SOURCES[sourceIndex];if(audio.src!==s.url)audio.src=s.url;source.textContent=s.label};
  const close=()=>{try{audio.pause()}catch(_){}section.hidden=true;section.setAttribute("aria-hidden","true");row.classList.remove("is-active");row.setAttribute("aria-expanded","false");dirState.textContent="24 HOURS"};
  const open=()=>{hub.querySelectorAll("[data-passport-tunnel-panel]").forEach(p=>{if(p!==section){p.querySelectorAll("audio").forEach(a=>{if(!a.paused)try{a.pause()}catch(_){}});p.hidden=true;p.setAttribute("aria-hidden","true")}});hub.querySelectorAll(".tunnel-directory__row").forEach(b=>{if(b!==row){b.classList.remove("is-active");b.setAttribute("aria-expanded","false")}});section.hidden=false;section.setAttribute("aria-hidden","false");row.classList.add("is-active");row.setAttribute("aria-expanded","true");requestAnimationFrame(()=>section.scrollIntoView({behavior:"smooth",block:"nearest"}))};
  async function start(){stopOthers();prepare(sourceIndex);state.textContent="Conectando…";try{await audio.play();play.textContent="Ⅱ";play.setAttribute("aria-label","Pausar BR Tunnel");state.textContent="ON AIR · ROCK BRASILEIRO";dirState.textContent="ON AIR"}catch(_){state.textContent="Sinal indisponível agora · tente novamente";play.textContent="▶";dirState.textContent="24 HOURS"}}
  function pause(){try{audio.pause()}catch(_){}play.textContent="▶";play.setAttribute("aria-label","Tocar BR Tunnel");state.textContent="Pausado";dirState.textContent="24 HOURS"}
  row.addEventListener("click",()=>section.hidden?open():close());play.addEventListener("click",()=>audio.paused?start():pause());
  audio.addEventListener("playing",()=>{play.textContent="Ⅱ";state.textContent="ON AIR · ROCK BRASILEIRO";dirState.textContent="ON AIR"});audio.addEventListener("pause",()=>{play.textContent="▶";if(state.textContent.startsWith("ON AIR"))state.textContent="Pausado";dirState.textContent="24 HOURS"});audio.addEventListener("error",()=>{play.textContent="▶";state.textContent="Sinal indisponível agora · tente novamente";dirState.textContent="24 HOURS"});
  prepare(0);
})();
