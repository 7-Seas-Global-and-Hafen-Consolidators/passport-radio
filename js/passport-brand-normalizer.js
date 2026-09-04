(()=>{
'use strict';
const special=()=>document.body.classList.contains('ploc-special')||document.body.classList.contains('memorial')||document.body.classList.contains('archives')||document.body.classList.contains('live-page')||['/','/index.html','/radio.html','/loja.html','/destinos.html','/promocoes.html','/minha-passport.html','/anuncie.html'].includes(location.pathname);
const article=()=>document.querySelector('.pe-prose');
const route66=a=>{if(a.querySelector('.pe-route66'))return;const ps=a.querySelectorAll('p');if(ps.length<4)return;const f=document.createElement('figure');f.className='pe-route66';f.innerHTML='<img src="/images/passport-radio-definitive.jpg" alt="Passport Radio — Route 66" loading="lazy" decoding="async">';const p=ps[Math.floor(ps.length/2)];p.parentNode.insertBefore(f,p.nextSibling)};
const signature=a=>{if(a.querySelector('.pe-signature'))return;const s=document.createElement('div');s.className='pe-signature';s.textContent='Mr. Nomad';const m=document.createElement('div');m.className='pe-signature-meta';m.textContent='Curador · Passport Radio';a.append(s,m)};
const reading=a=>{if(a.querySelector('.pe-reading-time'))return;const words=(a.innerText||'').trim().split(/\s+/).filter(Boolean).length;if(!words)return;const e=document.createElement('div');e.className='pe-reading-time';e.textContent=`${Math.max(1,Math.round(words/220))} min de leitura`;a.insertAdjacentElement('afterbegin',e)};
const run=()=>{if(special())return;const a=article();if(!a)return;document.body.classList.add('passport-editorial-v2');reading(a);route66(a);signature(a)};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();
