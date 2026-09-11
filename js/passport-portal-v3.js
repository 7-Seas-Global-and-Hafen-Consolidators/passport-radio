/* PASSPORT HOME — compositor visual. Não controla áudio, player, stream ou Engine. */
(() => {
  "use strict";
  const root = document.querySelector("#pp-feed");
  const esc = (v="") => String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const safe = v => /^(?:[/?#.]|https?:)/i.test(String(v||"").trim()) ? esc(String(v).trim()) : "#";
  const read = url => fetch(url,{cache:"no-store",credentials:"omit"}).then(r=>r.ok?r.json():({items:[]})).catch(()=>({items:[]}));
  const items = data => Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
  const time = item => new Date(item?.published_at||0).getTime() || 0;
  const date = item => { const d = new Date(item?.published_at||""); return Number.isNaN(d.getTime()) ? "" : new Intl.DateTimeFormat("pt-BR",{dateStyle:"medium"}).format(d); };
  const nomad = item => /mr\.?\s*nomad/i.test(String(item?.author||"")) || /mr_?nomad/i.test(String(item?.format||""));
  const week = item => { const d=new Date(item.published_at); if(Number.isNaN(d))return ""; const n=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate())); const day=n.getUTCDay()||7;n.setUTCDate(n.getUTCDate()-day+1);return n.toISOString().slice(0,10); };
  const unique = list => { const seen=new Set(); return list.filter(item=>item?.url&&!seen.has(item.url)&&(seen.add(item.url),true)); };
  const pic = item => item?.image?.approved&&item.image.src ? '<div class="week-story__media"><img src="'+esc(item.image.src)+'" alt="'+esc(item.image.alt||item.title||"")+'" loading="lazy" decoding="async" style="object-position:'+esc(item.image.focalPoint||"50% 45%")+'"></div>' : "";
  const story = (item,lead=false) => '<article class="week-story'+(lead?' week-story--lead':'')+'">'+pic(item)+'<div class="week-story__copy"><span class="pi-kicker">Mr. Nomad · esta semana</span><h'+(lead?'2':'3')+'><a href="'+safe(item.url)+'">'+esc(item.title)+'</a></h'+(lead?'2':'3')+'>'+ (item.deck?'<p>'+esc(item.deck)+'</p>':'') +'<span class="week-meta">'+esc(date(item))+'</span></div></article>';
  const newsCard = item => '<article><span class="pi-kicker">'+esc(String(item.category||item.format||"Notícias").replace(/_/g," "))+'</span><h3><a href="'+safe(item.url)+'">'+esc(item.title)+'</a></h3>'+(item.deck?'<p>'+esc(item.deck)+'</p>':'')+'<span class="week-meta">'+esc(date(item))+'</span></article>';
  async function render(){
    if(!root)return;
    const [priority,manual,rss]=await Promise.all(["/data/editorial-priority-feed.json","/data/editorial-manual-feed.json","/data/editorial-feed.json"].map(read));
    const authored=unique([...items(priority),...items(manual)]).filter(nomad).sort((a,b)=>time(b)-time(a));
    const newestWeek=week(authored[0]);
    const selection=authored.filter(x=>week(x)===newestWeek).slice(0,10);
    const weekly=selection.length?selection:authored.slice(0,10);
    const news=unique(items(rss)).filter(x=>!nomad(x)).sort((a,b)=>time(b)-time(a)).slice(0,4);
    if(!weekly.length){root.innerHTML='<p class="pi-copy">A seleção do Mr. Nomad está sendo organizada.</p>';return;}
    const lead=weekly[0], side=weekly.slice(1,5), rest=weekly.slice(5);
    root.innerHTML='<section class="home-week" aria-labelledby="home-week-title"><header class="home-section-head"><div><span class="pi-kicker">Curadoria humana</span><h1 id="home-week-title">Mr. Nomad · esta semana</h1></div><p>Histórias autorais escolhidas para ouvir e ler. O arquivo completo continua vivo, sem despejar o acervo na chegada.</p></header><div class="week-feature">'+story(lead,true)+'<div class="week-side">'+side.map(x=>story(x)).join("")+'</div></div>'+(rest.length?'<div class="week-grid">'+rest.map(x=>story(x)).join("")+'</div>':'')+'</section>';
    const casas=document.querySelector("#passport-casas"); if(casas) root.after(casas);
    const fof=document.createElement("section");fof.className="home-fofonete";fof.id="ajude";fof.innerHTML='<img src="/images/fofonete-home.jpg" alt="Fofonete da Passport Radio" loading="lazy"><div class="home-fofonete__copy"><span class="pi-kicker">Fofonetes™</span><h2>Tá gostando?<br>O boleto não.</h2><p>Ouvir que é bom você ouve. Agora ajuda a manter essa porra no ar.</p><a class="pi-button" href="ajude.html">Ajude a Passport →</a></div>';casas?.after(fof);
    const section=document.createElement("section");section.className="home-news";section.innerHTML='<header class="home-section-head home-section-head--small"><div><span class="pi-kicker">Circulação</span><h2>Notícias</h2></div><p>O fluxo contínuo tem uma casa própria. Aqui, apenas uma amostra.</p></header><div class="news-sample">'+news.map(newsCard).join("")+'</div><div class="home-more"><a class="pi-button" href="noticias.html">Ver todas as notícias →</a></div>';fof.after(section);
    const business=document.createElement("section");business.className="home-business";business.innerHTML='<a href="loja.html"><span>PASSAPORT STORE</span><h2>Loja</h2><p>Produtos oficiais e objetos da casa.</p></a><a href="anuncie.html"><span>MÍDIA PASSPORT</span><h2>Anuncie</h2><p>Formatos e conversa direta, sem números inventados.</p></a><a href="ajude.html"><span>MANTER NO AR</span><h2>Ajude</h2><p>Apoio direto para a rádio, a memória e as histórias.</p></a>';section.after(business);
    document.documentElement.dataset.passportHome="ready";
  }
  render().catch(()=>{if(root)root.innerHTML='<p class="pi-copy">A curadoria está voltando ao ar.</p>';});
})();