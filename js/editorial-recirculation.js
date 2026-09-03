(()=>{
'use strict';
if(!document.querySelector('.pe-prose')||document.getElementById('passport-recirculation'))return;
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=u=>{try{return new URL(u,location.origin).pathname.replace(/\/$/,'')||'/';}catch(_){return u;}};
const stamp=v=>{try{return new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(v));}catch(_){return '';}};
const current=norm(location.pathname);
fetch('/data/editorial-feed.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('feed');return r.json();}).then(data=>{
 const items=Array.isArray(data)?data:(data.items||data.feed||data.stories||[]);
 if(!items.length)return;
 const here=items.find(x=>norm(x.url)===current);
 const entities=new Set((here?.entities||[]).map(x=>String(x).toLowerCase()));
 const category=here?.category||'';
 const candidates=items.filter(x=>x.url&&norm(x.url)!==current).map((x,i)=>{
   const overlap=(x.entities||[]).reduce((n,e)=>n+(entities.has(String(e).toLowerCase())?1:0),0);
   const score=overlap*10+(category&&x.category===category?4:0)+Math.max(0,3-i/50);
   return {...x,_score:score};
 });
 const related=[...candidates].sort((a,b)=>b._score-a._score).slice(0,6);
 const latest=[...candidates].sort((a,b)=>new Date(b.published_at||0)-new Date(a.published_at||0)).slice(0,6);
 const card=x=>`<a class="pr-card" href="${esc(x.url)}"><small>${esc((x.category||'MÚSICA').replaceAll('_',' '))}</small><h3>${esc(x.title)}</h3><p>${esc(x.deck||'')}</p><time>${esc(stamp(x.published_at))}</time></a>`;
 const section=document.createElement('section');section.id='passport-recirculation';section.className='pr-wrap';
 section.innerHTML=`<div class="pr-shell"><div class="pr-head"><span>CONTINUE NA PASSPORT</span><h2>Leia também</h2></div><div class="pr-grid">${related.map(card).join('')}</div><div class="pr-head pr-head--latest"><span>PUBLICADO AGORA</span><h2>Últimas notícias</h2></div><div class="pr-latest">${latest.map(card).join('')}</div><div class="pr-return"><div><strong>Não perca a próxima.</strong><p>Notícias, histórias, shows e música direto pelos canais da Passport Radio.</p></div><div class="pr-actions"><a href="https://t.me/+447594716370" target="_blank" rel="noopener">TELEGRAM</a><a href="https://wa.me/48732099369?text=Ol%C3%A1%20Passport%20Radio!" target="_blank" rel="noopener">WHATSAPP</a><a href="/editorial.html">MAIS NOTÍCIAS</a></div></div></div>`;
 const main=document.querySelector('main');(main||document.body).appendChild(section);
 }).catch(()=>{});
})();
