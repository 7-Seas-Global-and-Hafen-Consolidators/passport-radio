(() => {
  const esc = (s='') => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const label = (s='') => String(s).replaceAll('_',' ').replace(/\b\w/g,m=>m.toUpperCase());
  const date = (s) => { try{return new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(s));}catch(_){return '';} };
  const daysOld = (s) => Math.max(0,(Date.now()-new Date(s).getTime())/86400000);
  const score = (item,i) => Math.max(0,70-daysOld(item.published_at))+(item.entities?.length||0)*4+(item.format==='MR_NOMAD'?8:0)+Math.max(0,20-i);
  const thumb = (item) => item.image || item.image_url || item.thumbnail || item.og_image || '';
  const search = document.querySelector('.pp-search');
  search?.addEventListener('submit',(e)=>{e.preventDefault();const q=search.querySelector('input')?.value.trim();if(q) location.href=`destinos.html?q=${encodeURIComponent(q)}`;});
  fetch('/data/editorial-feed.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw 0;return r.json();}).then(data=>{
    const items=(data.items||[]).filter(x=>x&&x.title&&x.url).sort((a,b)=>new Date(b.published_at)-new Date(a.published_at));
    if(!items.length)return;
    const feed=document.querySelector('[data-pp-feed]');
    if(feed) feed.innerHTML=items.slice(0,18).map(item=>`<a class="pp-feed-row" href="${esc(item.url)}"><span class="pp-feed-thumb">${thumb(item)?`<img src="${esc(thumb(item))}" alt="" loading="lazy">`:''}</span><span class="pp-feed-copy"><small>${esc(label(item.category||item.format||'Passport'))}</small><h3>${esc(item.title)}</h3><p>${esc(item.deck||'')}</p><time>${esc(date(item.published_at))} · ${esc(item.author||'Passport Radio')}</time></span></a>`).join('');
    const rank=document.querySelector('[data-pp-rank]');
    if(rank) rank.innerHTML=[...items].sort((a,b)=>score(b,items.indexOf(b))-score(a,items.indexOf(a))).slice(0,8).map((item,i)=>`<a class="pp-rank" href="${esc(item.url)}"><b>${String(i+1).padStart(2,'0')}</b><span><strong>${esc(item.title)}</strong><small>${esc(label(item.category||'Passport'))}</small></span></a>`).join('');
    const missed=document.querySelector('[data-pp-missed]');
    const old=items.filter(x=>daysOld(x.published_at)>10).slice(0,6);
    if(missed) missed.innerHTML=(old.length?old:items.slice(18,24)).map(item=>`<a href="${esc(item.url)}"><small>VOCÊ PERDEU</small><strong>${esc(item.title)}</strong></a>`).join('');
    const tags=document.querySelector('[data-pp-tags]');
    if(tags){const count={};items.forEach(x=>(x.entities||[]).forEach(e=>count[e]=(count[e]||0)+1));tags.innerHTML=Object.entries(count).sort((a,b)=>b[1]-a[1]).slice(0,18).map(([e])=>`<a href="destinos.html?q=${encodeURIComponent(e)}">${esc(e)}</a>`).join('');}
    const hist=document.querySelector('[data-pp-history]');
    if(hist){const now=new Date();let hs=items.filter(x=>{const d=new Date(x.published_at);return d.getDate()===now.getDate()&&d.getMonth()===now.getMonth()&&d.getFullYear()<now.getFullYear();}).slice(0,4);if(!hs.length)hs=[...items].sort((a,b)=>new Date(a.published_at)-new Date(b.published_at)).slice(0,4);hist.innerHTML=hs.map(x=>`<div class="pp-history"><a href="${esc(x.url)}"><small>HOJE NA HISTÓRIA</small><strong>${esc(x.title)}</strong></a></div>`).join('');}
  }).catch(()=>{});
})();