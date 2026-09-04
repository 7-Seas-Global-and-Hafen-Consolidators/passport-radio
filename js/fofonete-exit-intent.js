(()=>{
  'use strict';
  const IMAGE='/images/fofonete-caderninho.jpg';
  const SUPPORT='https://www.asaas.com/c/shpb8gbiswnw4t2n';
  const SEEN='passport_fofonete_exit_v1';
  const MIN_MS=12000;
  const page=location.pathname.split('/').pop()||'index.html';
  const configs={
    'index.html':{kicker:'MANTENHA A PASSPORT NO AR',title:'Eu fiz as contas de novo.',text:'Continuou faltando. Se puder ajudar, qualquer valor ajuda a manter a Passport gratuita, independente e no ar.',button:'AJUDAR A MANTER A PASSPORT NO AR',href:SUPPORT,external:true,home:true},
    'loja.html':{kicker:'PASSPORT STORE',title:'Já vai?',text:'Eu já tinha até começado a anotar seu pedido…',button:'VOLTAR PARA A LOJA',href:'#products'},
    'anuncie.html':{kicker:'ANUNCIE NA PASSPORT',title:'Ué… já vai?',text:'Ainda ficou faltando o nome da sua empresa aqui no meu caderninho.',button:'QUERO ANUNCIAR',href:'#contato-comercial'},
    'apoie.html':{kicker:'MANTENHA A PASSPORT NO AR',title:'Eu fiz as contas de novo.',text:'Continuou faltando. Se puder ajudar, qualquer valor ajuda a manter a Passport gratuita, independente e no ar.',button:'AJUDAR A MANTER A PASSPORT NO AR',href:SUPPORT,external:true}
  };
  let cfg=configs[page];
  if(!cfg && document.getElementById('apoie') && !['loja.html','anuncie.html'].includes(page)) cfg={kicker:'MANTENHA A PASSPORT NO AR',title:'Eu fiz as contas de novo.',text:'Continuou faltando. Se puder ajudar, qualquer valor ajuda a manter a Passport gratuita, independente e no ar.',button:'AJUDAR A MANTER A PASSPORT NO AR',href:SUPPORT,external:true,home:location.pathname==='/' };
  if(!cfg)return;
  let armed=!!cfg.home,shown=false,start=cfg.home?Date.now()-MIN_MS:Date.now();
  try{if(sessionStorage.getItem(SEEN)==='1')return;}catch(_e){}
  const mark=()=>{try{sessionStorage.setItem(SEEN,'1');}catch(_e){}};
  const close=()=>{document.getElementById('fofonete-exit')?.remove();document.documentElement.classList.remove('fofonete-exit-open');};
  const show=()=>{
    if(shown||!armed||Date.now()-start<MIN_MS||document.querySelector('[aria-modal="true"]'))return;
    shown=true;mark();
    const overlay=document.createElement('div');overlay.id='fofonete-exit';overlay.className='fofonete-exit';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-labelledby','fofonete-exit-title');
    overlay.innerHTML=`<div class="fofonete-exit__card"><button class="fofonete-exit__close" type="button" aria-label="Fechar">×</button><div class="fofonete-exit__image"><img src="${IMAGE}" alt="Personagem da Passport Radio com caderno e caneta"></div><div class="fofonete-exit__copy"><span>${cfg.kicker}</span><h2 id="fofonete-exit-title">${cfg.title}</h2><p>${cfg.text}</p><a class="fofonete-exit__cta" href="${cfg.href}"${cfg.external?' target="_blank" rel="noopener noreferrer"':''}>${cfg.button} →</a><button class="fofonete-exit__later" type="button">Agora não, Fofonete.</button></div></div>`;
    document.body.appendChild(overlay);document.documentElement.classList.add('fofonete-exit-open');
    overlay.querySelector('.fofonete-exit__close').addEventListener('click',close);overlay.querySelector('.fofonete-exit__later').addEventListener('click',close);overlay.addEventListener('click',e=>{if(e.target===overlay)close();});
    overlay.querySelector('.fofonete-exit__cta').addEventListener('click',()=>{if(!cfg.external)close();});
    document.addEventListener('keydown',function esc(e){if(e.key==='Escape'){close();document.removeEventListener('keydown',esc);}});
    overlay.querySelector('.fofonete-exit__close').focus();
  };
  if(cfg.home)setTimeout(show,650);
  ['scroll','click','touchstart','keydown'].forEach(evt=>addEventListener(evt,()=>{armed=true;},{once:true,passive:evt!=='keydown'}));
  document.addEventListener('mouseout',e=>{if(e.clientY<=8&&!e.relatedTarget)show();});
})();
