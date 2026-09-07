/* PASSPORT RADIO · FOFONETE EXIT-INTENT · OWNER ÚNICO DA CAMPANHA DA HOME
 * Arte oficial: /images/fofonete-home.jpg (Snoopy + Woodstock — PR #292).
 * Este arquivo é o ÚNICO owner de: render do modal, timer, abertura,
 * fechamento/liberação, persistência de sessão e CTA da campanha.
 * O card lateral (.v5-fofonete) apenas LÊ window.PASSPORT_FOFONETE.
 * NÃO toca em players, streams, Tunnels, World Dial ou listen-signal.
 */
(()=>{'use strict';
const IMAGE='/images/fofonete-home.jpg';
const SUPPORT='https://www.asaas.com/c/shpb8gbiswnw4t2n';
const SEEN_KEY='passport_fofonete_gate_v5';
const COUNTDOWN=15;

/* Fonte única de verdade para outras superfícies (card lateral v5). */
window.PASSPORT_FOFONETE={art:IMAGE,cta:SUPPORT};

try{if(sessionStorage.getItem(SEEN_KEY)==='1')return}catch(_){}

/* Sweep apenas de implementações MORTAS. O card lateral .v5-fofonete
   é preservado: ele usa a mesma arte oficial e não é mais concorrente. */
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
    <div class="fofonete-exit__image"><img src="${IMAGE}" fetchpriority="high" alt="Fofonete da Passport Radio: Snoopy com caderno de playlist e lápis, Woodstock ao lado, estúdio com rádio antigo, microfone ON AIR, discos de vinil, headphones e a nota Eu fiz as contas de novo. A Passport fica no ar com quem lê, ouve, compra e apoia."></div>
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

  const close=()=>{clearInterval(timer);overlay.remove();unlockScroll();const prev=document.querySelector('#play')||document.querySelector('main a');if(prev)prev.focus()};

  let s=COUNTDOWN;
  timer=setInterval(()=>{
    s--;
    if(timerEl)timerEl.textContent=String(Math.max(s,0));
    if(s<=0){clearInterval(timer);later.disabled=false;later.textContent='CONTINUAR NO SITE →';later.addEventListener('click',close,{once:true});later.focus()}
    else later.textContent=`Liberando a escolha em ${s}s…`;
  },1000);

  overlay.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&!later.disabled){close();return}
    if(e.key==='Tab'){const els=[...overlay.querySelectorAll('a[href],button:not([disabled])')];if(!els.length)return;const first=els[0],last=els[els.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}
  });
}
setTimeout(show,650);
})();
