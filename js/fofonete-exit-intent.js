(()=>{
'use strict';
const IMAGE='/images/fofonete-caderninho.jpg';
const SUPPORT='https://www.asaas.com/c/shpb8gbiswnw4t2n';
const SEEN_KEY='passport_fofonete_exit_v3';
const MIN_MS=12000, COUNTDOWN=15;
const page=location.pathname.split('/').pop()||'index.html';
const configs={
'index.html':{kicker:'MANTENHA A PASSPORT NO AR',title:'Eu fiz as contas de novo.',text:'Continuou faltando. Se puder ajudar, qualquer valor ajuda a manter a Passport gratuita, independente e no ar.',button:'AJUDAR A MANTER A PASSPORT NO AR',href:SUPPORT,external:true,home:true},
'loja.html':{kicker:'PASSPORT STORE',title:'Já vai?',text:'Eu já tinha até começado a anotar seu pedido…',button:'VOLTAR PARA A LOJA',href:'#products'},
'anuncie.html':{kicker:'ANUNCIE NA PASSPORT',title:'Ué… já vai?',text:'Ainda ficou faltando o nome da sua empresa aqui no meu caderninho.',button:'QUERO ANUNCIAR',href:'#contato-comercial'}
};
let cfg=configs[page];
if(!cfg&&document.getElementById('apoie')&&!['loja.html','anuncie.html'].includes(page))cfg={kicker:'MANTENHA A PASSPORT NO AR',title:'Eu fiz as contas de novo.',text:'Continuou faltando. Se puder ajudar, qualquer valor mantém a Passport no ar.',button:'AJUDAR A PASSPORT NO AR',href:SUPPORT,external:true,home:location.pathname==='/'||page==='index.html'};
if(!cfg)return;
let armed=!!cfg.home,shown=false,start=cfg.home?Date.now()-MIN_MS:Date.now(),timer=null,unlocked=!cfg.home;
try{if(sessionStorage.getItem(SEEN_KEY)==='1')return}catch(_){}
const mark=()=>{try{sessionStorage.setItem(SEEN_KEY,'1')}catch(_){}};
const close=()=>{if(cfg.home&&!unlocked)return;clearInterval(timer);document.getElementById('fofonete-exit')?.remove();document.documentElement.classList.remove('fofonete-exit-open')};
const show=()=>{
 if(shown||!armed||Date.now()-start<MIN_MS||document.querySelector('[aria-modal="true"]'))return;shown=true;mark();
 const o=document.createElement('div');o.id='fofonete-exit';o.className='fofonete-exit';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');
 o.innerHTML=`<div class="fofonete-exit__card"><button class="fofonete-exit__close" type="button" aria-label="Fechar"${cfg.home?' disabled':''}>×</button><div class="fofonete-exit__image"><img src="${IMAGE}" alt="Fofonete — personagem da Passport Radio com caderno e caneta"></div><div class="fofonete-exit__copy"><span>${cfg.kicker}</span><h2>${cfg.title}</h2><p>${cfg.text}</p><a class="fofonete-exit__cta" href="${cfg.href}"${cfg.external?' target="_blank" rel="noopener noreferrer"':''}>${cfg.button} →</a><button class="fofonete-exit__later" type="button"${cfg.home?' disabled':''}>${cfg.home?`Liberando a escolha em ${COUNTDOWN}s…`:'Agora não, Fofonete.'}</button></div></div>`;
 document.body.appendChild(o);document.documentElement.classList.add('fofonete-exit-open');
 const later=o.querySelector('.fofonete-exit__later'),x=o.querySelector('.fofonete-exit__close');later.addEventListener('click',close);x.addEventListener('click',close);
 o.addEventListener('click',e=>{if(e.target===o)close()});
 document.addEventListener('keydown',function esc(e){if(e.key==='Escape'&&(!cfg.home||unlocked)){close();document.removeEventListener('keydown',esc)}});
 if(cfg.home){let s=COUNTDOWN;timer=setInterval(()=>{s--;if(s<=0){clearInterval(timer);timer=null;unlocked=true;later.disabled=false;x.disabled=false;later.textContent='Agora não, Fofonete. Seguir sem doar.';return}later.textContent='Liberando a escolha em '+s+'s…'},1000)}
 else later.focus();
};
if(cfg.home)setTimeout(show,650);
['scroll','click','touchstart','keydown'].forEach(evt=>addEventListener(evt,()=>{armed=true},{once:true,passive:evt!=='keydown'}));
document.addEventListener('mouseout',e=>{if(e.clientY<=8&&!e.relatedTarget)show()});
})();