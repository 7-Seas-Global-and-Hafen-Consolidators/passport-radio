(()=>{
'use strict';
const IMAGE='/images/fofonete-caderninho.jpg';
const SUPPORT='https://www.asaas.com/c/shpb8gbiswnw4t2n';
const SEEN_KEY='passport_fofonete_exit_v3';
const MIN_MS=12000, COUNTDOWN=15;
const page=location.pathname.split('/').pop()||'index.html';
const configs={'index.html':{kicker:'MANTENHA A PASSPORT NO AR',title:'Eu fiz as contas de novo.',text:'Continuou faltando. Se puder ajudar, qualquer valor ajuda a manter a Passport gratuita, independente e no ar.',button:'AJUDAR A MANTER A PASSPORT NO AR',href:SUPPORT,external:true,home:true}};
let cfg=configs[page];
if(!cfg)return;
let shown=false,timer=null,unlocked=false;
try{if(sessionStorage.getItem(SEEN_KEY)==='1')return}catch(_){}
const mark=()=>{try{sessionStorage.setItem(SEEN_KEY,'1')}catch(_){}};
const close=()=>{if(!unlocked)return;clearInterval(timer);document.getElementById('fofonete-exit')?.remove();document.documentElement.classList.remove('fofonete-exit-open')};
const show=()=>{
 if(shown||document.querySelector('[aria-modal="true"]'))return;shown=true;mark();
 const o=document.createElement('div');o.id='fofonete-exit';o.className='fofonete-exit';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');
 o.innerHTML=`<div class="fofonete-exit__card"><button class="fofonete-exit__close" type="button" aria-label="Fechar" disabled>×</button><div class="fofonete-exit__image"><img src="${IMAGE}" alt="Fofonete — personagem da Passport Radio com caderno e caneta"></div><div class="fofonete-exit__copy"><span>${cfg.kicker}</span><h2>${cfg.title}</h2><p>${cfg.text}</p><a class="fofonete-exit__cta" href="${cfg.href}" target="_blank" rel="noopener noreferrer">${cfg.button} →</a><button class="fofonete-exit__later" type="button" disabled>Liberando a escolha em ${COUNTDOWN}s…</button></div></div>`;
 document.body.appendChild(o);document.documentElement.classList.add('fofonete-exit-open');
 const later=o.querySelector('.fofonete-exit__later'),x=o.querySelector('.fofonete-exit__close');
 later.addEventListener('click',close);x.addEventListener('click',close);
 let s=COUNTDOWN;timer=setInterval(()=>{s--;if(s<=0){clearInterval(timer);unlocked=true;later.disabled=false;x.disabled=false;later.textContent='Agora não, Fofonete. Seguir sem doar.';return}later.textContent='Liberando a escolha em '+s+'s…'},1000);
};
setTimeout(show,650);
})();