(()=>{
'use strict';
if(!document.querySelector('.pe-prose')||document.getElementById('passport-recirculation'))return;
const FEED='/data/editorial-feed.json';
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const path=u=>{try{return new URL(u,location.origin).pathname.replace(/\/+$/,'')||'/'}catch(_){return String(u||'').split('?')[0].replace(/\/+$/,'')||'/'}};
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const stamp=v=>{try{return new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(v))}catch(_){return ''}};
const days=v=>Math.floor((Date.now()-new Date(v).getTime())/86400000);
const current=path(location.pathname);
const score=(here,x)=>{const ce=new Set((here?.entities||[]).map(norm));let shared=0;(x.entities||[]).forEach(e=>{if(ce.has(norm(e)))shared++});let n=shared*12;if(norm(here?.category)&&norm(here.category)===norm(x.category))n+=6;if(here?.decade&&here.decade===x.decade)n+=5;if(here?.genre&&here.genre===x.genre)n+=3;const age=days(x.published_at||0);if(age<7)n+=6;else if(age<30)n+=3;else if(age<180)n+=1;if(x.evergreen)n+=4;if(['MR_NOMAD','LIVE_SIGNAL'].includes(x.format))n+=2;return n};
const img=x=>x.hero_image||x.image||'/images/passport-radio-definitive.jpg';
const card=(x,variant='default')=>`<a class="pr-card pr-card--${variant}" href="${esc(x.url)}"><div class="pr-card__media" style="background-image:url('${esc(img(x))}')"></div><div class="pr-card__body"><small>${esc((x.kicker||x.category||'MÚSICA').replaceAll('_',' '))}</small><h3>${esc(x.title)}</h3>${x.deck?`<p>${esc(x.deck.substring(0,140))}${x.deck.length>140?'…':''}</p>`:''}<time>${esc(stamp(x.published_at))}</time></div></a>`;
fetch(`${FEED}?v=${Math.floor(Date.now()/600000)}`,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('feed');return r.json()}).then(data=>{
 const items=Array.isArray(data)?data:(data.items||data.feed||data.stories||[]);if(!items.length)return;
 const here=items.find(x=>path(x.url)===current)||{};
 const candidates=items.filter(x=>x.url&&path(x.url)!==current).map(x=>({...x,_score:score(here,x)})).sort((a,b)=>b._score-a._score||new Date(b.published_at||0)-new Date(a.published_at||0));
 const related=candidates.slice(0,12);const latest=[...candidates].sort((a,b)=>new Date(b.published_at||0)-new Date(a.published_at||0)).slice(0,6);
 const prose=document.querySelector('.pe-prose');
 const nodes=[...prose.querySelectorAll('p,h2,blockquote,figure')];related.slice(0,3).forEach((x,i)=>{const at=nodes[Math.floor((i+1)*nodes.length/4)];if(!at)return;const w=document.createElement('div');w.className='pr-inline-card';w.innerHTML=card(x,'inline');at.insertAdjacentElement('afterend',w)});
 const host=prose.closest('article')||prose;if(related.length){const rail=document.createElement('aside');rail.className='pr-rail';rail.innerHTML=`<div class="pr-rail__head"><span>CONTINUE NA PASSPORT</span><strong>Você também vai curtir</strong></div>${related.slice(0,4).map(x=>card(x,'rail')).join('')}`;host.insertAdjacentElement('afterend',rail);host.parentElement?.classList.add('pr-article-with-rail')}
 const old=items.filter(x=>x.url&&path(x.url)!==current&&(x.evergreen||days(x.published_at||0)>30)).sort((a,b)=>(b.evergreen?1:0)-(a.evergreen?1:0)||new Date(b.published_at||0)-new Date(a.published_at||0)).slice(0,4);
 const now=new Date(),m=now.getMonth()+1,d=now.getDate();const today=items.filter(x=>x.url&&path(x.url)!==current&&((x.on_this_day_month===m&&x.on_this_day_day===d)||(x.published_at&&new Date(x.published_at).getMonth()+1===m&&new Date(x.published_at).getDate()===d&&days(x.published_at)>=365))).slice(0,4);
 const section=document.createElement('section');section.id='passport-recirculation';section.className='pr-wrap';section.innerHTML=`<div class="pr-shell">${today.length?`<div class="pr-head"><span>HOJE NA HISTÓRIA</span><h2>${now.toLocaleDateString('pt-BR',{day:'2-digit',month:'long'})}</h2></div><div class="pr-grid pr-grid--4">${today.map(x=>card(x,'today')).join('')}</div>`:''}${old.length?`<div class="pr-head pr-head--spaced"><span>ARQUIVO VIVO</span><h2>Você perdeu na Passport</h2></div><div class="pr-grid pr-grid--4">${old.map(x=>card(x,'missed')).join('')}</div>`:''}<div class="pr-head pr-head--spaced"><span>CONTINUE NA ROTA</span><h2>Leia também</h2></div><div class="pr-grid">${related.slice(0,6).map(x=>card(x)).join('')}</div><div class="pr-head pr-head--latest"><span>PUBLICADO AGORA</span><h2>Últimas da Passport</h2></div><div class="pr-latest">${latest.map(x=>card(x,'latest')).join('')}</div><div class="pr-return"><div><strong>Não perca a próxima.</strong><p>Notícias, histórias, shows e música direto pelos canais da Passport Radio.</p></div><div class="pr-actions"><a href="https://t.me/+447594716370" target="_blank" rel="noopener">TELEGRAM</a><a href="https://wa.me/48732099369?text=Ol%C3%A1%20Passport%20Radio!" target="_blank" rel="noopener">WHATSAPP</a><a href="/editorial.html">ARQUIVO</a></div></div></div>`;
 (document.querySelector('main')||document.body).appendChild(section);
}).catch(()=>{});
})();
