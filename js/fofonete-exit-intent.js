/* PASSPORT RADIO · FOFONETE EXIT-INTENT · OWNER ÚNICO DA CAMPANHA DA HOME */
(()=>{'use strict';
const IMAGE='/images/fofonete-home.jpg';
const SUPPORT='https://www.asaas.com/c/shpb8gbiswnw4t2n';
const SEEN_KEY='passport_fofonete_gate_v5';
const COUNTDOWN=15;
window.PASSPORT_FOFONETE={art:IMAGE,cta:SUPPORT};
try{if(sessionStorage.getItem(SEEN_KEY)==='1')return}catch(_){}
document.querySelectorAll('.fofonete-final,.fofonete-contextual,[data-fofonete]').forEach(el=>el.remove());
let shown=false,timer=null,scrollY0=0;
function lockScroll(){scrollY0=window.scrollY;document.documentElement.classList.add('fofonete-exit-open');document.body.style.position='fixed';document.body.style.top=`-${scrollY0}px`;document.body.style.left='0';document.body.style.right='0'}
function unlockScroll(){document.documentElement.classList.remove('fofonete-exit-open');document.body.style.position='';document.body.style.top='';document.body.style.left='';document.body.style.right='';window.scrollTo(0,scrollY0)}
function show(){
  if(shown||document.getElementById('fofonete-exit')||document.querySelector('[aria-modal="true"]'))return;
  shown=true;
  try{sessionStorage.setItem(SEEN_KEY,'1')}catch(_){}
  lockScroll();
  const overlay=document.createElement('div');
  overlay.id='fofonete-exit';
  overlay.className='fofonete-exit fofonete-exit--fullscreen';
  overlay.setAttribute('role','dialog');
  overlay.setAttribute('aria-modal','true');
  overlay.setAttribute('aria-label','Fofonete da Passport Radio');
  overlay.innerHTML=`<div class="fofonete-exit__card fofonete-exit__card--full">
    <div class="fofonete-exit__image"><img src="${IMAGE}" fetchpriority="high" alt="Fofonete da Passport Radio"></div>
    <div class="fofonete-exit__copy">
      <span class="fofonete-exit__kicker">MANTENHA A PASSPORT NO AR</span>
      <h2>Eu fiz as contas de novo.</h2>
      <p>A Passport fica no ar com quem lê, ouve, compra e apoia.</p>
      <div class="fofonete-exit__countdown" aria-live="polite"><span id="fofonete-timer">${COUNTDOWN}</span></div>
      <a class="fofonete-exit__cta fofonete-exit__cta--primary" href="${SUPPORT}" target="_blank" rel="noopener noreferrer">APOIAR A PASSPORT →</a>
      <button class="fofonete-exit__later" type="button" disabled aria-live="polite">Liberando a escolha em ${COUNTDOWN}s…</button>
    </div></div>`;
  document.body.appendChild(overlay);
  const later=overlay.querySelector('.fofonete-exit__later');
  const timerEl=overlay.querySelector('#fofonete-timer');
  const firstFocusable=overlay.querySelector('.fofonete-exit__cta--primary');
  if(firstFocusable)firstFocusable.focus();
  const close=()=>{clearInterval(timer);overlay.remove();unlockScroll();};
  let s=COUNTDOWN;
  timer=setInterval(()=>{
    s--;
    if(timerEl)timerEl.textContent=String(Math.max(s,0));
    if(s<=0){clearInterval(timer);later.disabled=false;later.textContent='CONTINUAR NO SITE →';later.addEventListener('click',close,{once:true});later.focus()}
    else later.textContent=`Liberando a escolha em ${s}s…`;
  },1000);
  overlay.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&!later.disabled){close();return}
  });
}
const IS_HOME = document.body.classList.contains('pp-home');
if (IS_HOME) { setTimeout(show,650); }
})();

/* FOFONETE DOCK — apêndice. Motor acima intocado. */
(() => {
  "use strict";
  const IMAGE = (window.PASSPORT_FOFONETE && window.PASSPORT_FOFONETE.art) || "/images/fofonete-home.jpg";
  const SUPPORT = (window.PASSPORT_FOFONETE && window.PASSPORT_FOFONETE.cta) || "https://www.asaas.com/c/shpb8gbiswnw4t2n";
  const DOCK_ID = "fofonete-dock";
  const GATE = "passport_fofonete_gate_v5";
  function bottomSafe() {
    const p = document.querySelector(".player,#passport-player");
    return (p ? p.offsetHeight : 56) + 12;
  }
  function dock() {
    if (document.getElementById(DOCK_ID)) return;
    const d = document.createElement("button");
    d.id = DOCK_ID; d.type = "button"; d.className = "fofonete-dock";
    d.setAttribute("aria-label", "Abrir campanha Fofonete");
    d.innerHTML = '<img src="' + IMAGE + '" alt="" width="44" height="44"><span>APOIE · FOFONETE</span>';
    d.style.bottom = bottomSafe() + "px";
    d.addEventListener("click", openView);
    document.body.appendChild(d);
  }
  function openView() {
    if (document.querySelector(".fofonete-view")) return;
    const ov = document.createElement("div");
    ov.className = "fofonete-exit--fullscreen fofonete-view";
    ov.innerHTML = '<div class="fofonete-exit__card--full"><div class="fofonete-exit__image"><img src="' + IMAGE +
      '" alt="Fofonete"></div><div class="fofonete-exit__copy">' +
      '<span class="fofonete-exit__kicker">PASSPORT RADIO · CAMPANHA</span>' +
      '<h2>A Passport fica no ar com você.</h2>' +
      '<p>Histórias, arquivo e rádio 24h. Quem banca é quem lê, ouve e compra.</p>' +
      '<a class="fofonete-exit__cta--primary" href="' + SUPPORT + '" target="_blank" rel="noopener">APOIAR A PASSPORT →</a>' +
      '<button type="button" class="fofonete-exit__later" data-fofonete-close>FECHAR ×</button></div></div>';
    ov.querySelector("[data-fofonete-close]").addEventListener("click", () => { ov.remove(); dock(); });
    ov.addEventListener("click", (e) => { if (e.target === ov) { ov.remove(); dock(); } });
    document.body.appendChild(ov);
  }
  const mo = new MutationObserver(() => {
    const motorAberto = document.getElementById("fofonete-exit");
    if (!motorAberto && !document.getElementById(DOCK_ID)) {
      try { if (sessionStorage.getItem(GATE) === "1") dock(); } catch (e) {}
    }
  });
  mo.observe(document.body, { childList: true, subtree: true });
  try {
    if (sessionStorage.getItem(GATE) === "1" && !document.getElementById("fofonete-exit")) dock();
  } catch (e) {}
})();
