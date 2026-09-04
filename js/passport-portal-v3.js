(()=>{
'use strict';
const FEED_URLS=['/data/editorial-manual-feed.json','/data/editorial-feed.json'];
const PROMO_URL='/data/promocoes.json';
const FEED_LIMIT=30;
const esc=v=>String(v||'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const CAT={brasil:'Brasil',brazilian_rock:'Rock BR',rock:'Rock',classic_rock:'Clássico',hard_rock:'Hard Rock',hard_rock_metal:'Hard Rock/Metal',metal:'Metal',punk_hardcore:'Punk',progressive_rock:'Progressivo',alternative_rock:'Alternativo',alternative_gothic:'Gótico',pop_poprock:'Pop/Pop Rock',country_americana:'Country',instruments:'Instrumentos',middle_east:'Oriente Médio',east_africa:'África Oriental'},FMT={FLASH:'Notícia',LIVE_SIGNAL:'Sinal',MR_NOMAD:'Mr. Nomad',STORY:'História'};
const catLabel=v=>CAT[v]||String(v||'').replace(/_/g,' '),fmtLabel=v=>FMT[v]||'';
const IMAGE_MAP=[[/zz top|billy gibbons|frank beard|dusty hill/i,'/images/frank-beard-zz-top-01.jpg'],[/therion/i,'/images/therion-miskolc/maxresdefault32.jpg'],[/within temptation|sharon den adel/i,'/images/sharon-den-adel-within-temptation-2026.webp'],[/deep purple|ritchie blackmore/i,'/images/ritchie-blackmore-deep-purple-reunion-2026.webp'],[/scorpions/i,'/images/scorpions-hurricane-graphic-novel.webp'],[/roger taylor|\bqueen\b/i,'/images/roger-taylor/rogertayloriseeaug2026_638.webp'],[/hoobastank/i,'/images/hoobastank/hoobastankjune2026_638.webp'],[/rhapsody/i,'/images/rhapsody-of-fire/Rhapsody-3-madrid.jpg'],[/eye of the tiger|stallone|rocky/i,'/images/rocky_3_metro_goldwyn_mayer.webp'],[/1986|anos 80.*radio/i,'/images/1986/attachment-social-image-366-2026-08-10-09-04-20.webp'],[/iron maiden/i,'/images/ironmaiden_future_past_tour_2024.webp'],[/kate bush/i,'/images/kate_bush_the_dreaming_capa_corte.webp'],[/the cure/i,'/images/the-cure.png'],[/type o negative/i,'/images/type-o-negative.png'],[/led zeppelin/i,'/images/led-zeppelin-a-cancao-rockprogressivo.png'],[/live aid/i,'/images/live-aid-1985.png'],[/cannibal corpse/i,'/images/cannibal-corpse-live.png'],[/wacken/i,'/images/wacken-open-air-festival.png'],[/tony iommi/i,'/images/tony-iommi-2026.webp'],[/ramones/i,'/images/the-ramones.png'],[/greta van fleet/i,'/greta-van-fleet-palace-for-the-people.webp']];
function resolveImage(item){
  if(item.image && !/passport-radio-definitive/i.test(item.image)) return item.image;
  const text=((item.title||'')+' '+(item.entities||[]).join(' ')+' '+(item.url||'')).toLowerCase();
  for(const [re,src] of IMAGE_MAP) if(re.test(text)) return src;
  return '';
}
const radioStrip=()=>`<div class="pp-strip pp-strip-radio"><span class="pp-strip-label">RÁDIO 24H</span><strong>Continuous Signals™ · escolha o sinal e continue lendo.</strong><span>Live & Rare™ · Tunnels™ · World Dial™</span><a href="radio.html">OUVIR →</a></div>`;
async function loadFeed(){
  const el=document.getElementById('pp-feed'); if(!el)return;
  const results=await Promise.allSettled(FEED_URLS.map(u=>fetch(u,{cache:'no-store'}).then(r=>r.ok?r.json():{items:[]})));
  const seen=new Set(),items=[];
  for(const r of results){if(r.status!=='fulfilled')continue;const arr=Array.isArray(r.value)?r.value:(r.value.items||[]);for(const item of arr){if(!item||!item.url||seen.has(item.url))continue;seen.add(item.url);items.push(item)}}
  items.sort((a,b)=>new Date(b.published_at||0)-new Date(a.published_at||0));
  if(!items.length){el.innerHTML='<p class="pp-empty">O sinal editorial está sendo atualizado.</p>';return}
  let html='';
  items.slice(0,FEED_LIMIT).forEach((item,i)=>{
    const img=resolveImage(item),kicker=[fmtLabel(item.format),catLabel(item.category)].filter(Boolean).join(' · ');
    html+=`<a class="pp-feed-item${img?' has-image':' is-text-only'}" href="${esc(item.url)}">${img?`<img src="${esc(img)}" alt="" loading="lazy" onerror="this.remove();this.closest('.pp-feed-item')?.classList.add('is-text-only')">`:''}<div><span class="pp-fi-k">${esc(kicker)}</span><h3>${esc(item.title)}</h3>${item.deck?`<p>${esc(item.deck)}</p>`:''}</div></a>`;
    if(i===9||i===19)html+=radioStrip();
  });
  html+='<div class="pp-btnrow"><a href="editorial.html">EDITORIAL 24H →</a><a href="destinos.html">ARQUIVO COMPLETO →</a><a href="radio.html">OUVIR A RÁDIO →</a></div>';
  el.innerHTML=html;
  populateReco(items);populateMissed(items);populateAssuntos(items);
}
function populateReco(items){const el=document.getElementById('pp-reco');if(!el)return;let picks=items.filter(i=>i.format==='MR_NOMAD'||i.format==='STORY').slice(0,5);if(!picks.length)picks=items.slice(0,5);el.innerHTML=picks.map(i=>`<li><a href="${esc(i.url)}">${esc(i.title)}</a></li>`).join('')}
function populateMissed(items){const el=document.getElementById('pp-missed');if(el)el.innerHTML=items.slice(-12).reverse().slice(0,6).map(i=>`<li><a href="${esc(i.url)}">${esc(i.title)}</a></li>`).join('')}
function populateAssuntos(items){const el=document.getElementById('pp-assuntos');if(!el)return;const count=new Map();items.forEach(i=>(i.entities||[]).forEach(e=>{const k=String(e).trim();if(k)count.set(k,(count.get(k)||0)+1)}));const tags=[...count.entries()].sort((a,b)=>b[1]-a[1]).slice(0,12).map(([t])=>t);el.innerHTML=tags.map(t=>`<a href="editorial.html">${esc(t)}</a>`).join('')}
function removeFalseHistory(){document.getElementById('hoje')?.remove()}
const WORLD_STATIONS=[{name:'Paraguay',station:'Rock & Pop 95.5',href:'/radio-mundo-player.html?station=py'},{name:'France',station:'OÜI FM',href:'/radio-mundo-player.html?station=fr'},{name:'Québec',station:'CIBM-FM 107.1',href:'/radio-mundo-player.html?station=ca'},{name:'한국',station:'Big B Radio',href:'/radio-korea.html'},{name:'Türkiye',station:'Türk Rock FM',href:'/radio-turkiye.html'},{name:'中国',station:'怀集音乐之声',href:'/radio-china.html'},{name:'Україна',station:'Хіт FM',href:'/radio-ukraine.html'},{name:'ایران',station:'Radio AvazFarsi',href:'/radio-iran.html'},{name:'Venezuela',station:'La Mega 107.3',href:'/radio-venezuela.html'},{name:'România',station:'Rock FM',href:'/radio-romania.html'},{name:'Finland',station:'Radio Rock',href:'/radio-mundo-player.html?station=fi'},{name:'Česko',station:'HEY Radio',href:'/radio-mundo-player.html?station=cz'}];
function populateWorldDial(){const el=document.getElementById('pp-world-dial');if(el)el.innerHTML=WORLD_STATIONS.map(s=>`<a class="pp-world-item" href="${esc(s.href)}"><b>${esc(s.name)}</b><span>${esc(s.station)}</span></a>`).join('')}
const STATUS_LABELS={ATIVA:'Inscrições abertas',EM_BREVE:'Em breve',NA_FILA:'Na fila',ENCERRADA:'Encerrada',RESULTADO_PUBLICADO:'Resultado'};
async function loadPromos(){try{const res=await fetch(PROMO_URL,{cache:'no-store'});if(!res.ok)throw new Error();const data=await res.json(),items=data.items||[];renderPromoSidebar(items);renderPromoHome(items)}catch(_){}}
function renderPromoSidebar(items){const el=document.getElementById('pp-promo-widget');if(!el)return;const active=items.find(i=>i.status==='ATIVA'),result=items.find(i=>i.status==='RESULTADO_PUBLICADO');let html='';if(result){html+=`<a class="pp-promo-mini" href="${esc(result.url)}"><b>RESULTADO · ${esc(result.id)}</b><strong>${esc(result.title)}</strong>${result.result?`<span>${esc(result.result.winner)} · ${esc(result.result.doc)}</span>`:''}</a>`}if(active)html+=`<a class="pp-promo-mini" href="${esc(active.url)}"><b>INSCRIÇÕES ABERTAS · ${esc(active.id)}</b><strong>${esc(active.title)}</strong><span>PARTICIPAR →</span></a>`;if(!html){const next=items.find(i=>i.status==='EM_BREVE');if(next)html=`<a class="pp-promo-mini" href="${esc(next.url)}"><b>EM BREVE · ${esc(next.id)}</b><strong>${esc(next.title)}</strong></a>`}el.innerHTML=html}
function renderPromoHome(items){const el=document.getElementById('pp-promo-home');if(!el)return;el.innerHTML=items.slice(0,3).map(item=>`<a class="pp-card pp-card-txt" href="${esc(item.url)}"><span class="pp-card-k">${esc(STATUS_LABELS[item.status]||item.status)} · ${esc(item.id)}</span><strong>${esc(item.title)}</strong></a>`).join('')}
function addYouTube(){const host=document.querySelector('.pp-top-actions');if(!host||host.querySelector('.pp-youtube'))return;const a=document.createElement('a');a.className='pp-youtube';a.href='https://www.youtube.com/@Passportradio.online';a.target='_blank';a.rel='noopener';a.setAttribute('aria-label','Passport Radio no YouTube');a.textContent='▶ YOUTUBE';host.insertBefore(a,host.firstChild)}
function initAds(){document.querySelectorAll('.pp-ad-slot').forEach(slot=>{const ins=slot.querySelector('ins.adsbygoogle');if(!ins)return;try{(window.adsbygoogle=window.adsbygoogle||[]).push({})}catch(_){};const check=()=>{const st=ins.getAttribute('data-ad-status');slot.classList.toggle('is-empty',st==='unfilled'||(st!=='filled'&&!ins.querySelector('iframe')))};[1200,3000,6000].forEach(t=>setTimeout(check,t))})}
function boot(){removeFalseHistory();loadFeed();populateWorldDial();loadPromos();addYouTube();initAds()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();