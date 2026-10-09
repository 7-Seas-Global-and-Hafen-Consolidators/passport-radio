/* Additive archive navigation. Explicit entities/relationships only; no audio ownership. */
(() => {
  'use strict';
  if (window.PassportArtistNavigation) return;
  // The existing reader's outer document owns navigation across its child loads.
  try {
    if (window !== top && top.PassportPersistNav?.owns(window)) {
      if (!top.document.querySelector('script[data-passport-artist-navigation]')) {
        const script = top.document.createElement('script');
        script.src = '/js/passport-artist-navigation.js?v=20261008';
        script.dataset.passportArtistNavigation = '1';
        top.document.head.append(script);
      }
      return;
    }
  } catch (_) { return; }
  const fold = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const watched = new WeakSet();
  let data;
  function link(doc, text, href) {
    const a = doc.createElement('a'); a.textContent=text; a.href=href; return a;
  }
  function styles(doc) {
    if (doc.querySelector('link[data-passport-artist-navigation]')) return;
    const css=doc.createElement('link');css.rel='stylesheet';css.href='/css/passport-artist-navigation.css?v=20261008';css.dataset.passportArtistNavigation='1';doc.head.append(css);
  }
  function enhance(doc) {
    if (!data || !doc?.body || doc.querySelector('[data-passport-artist-tools]')) return;
    const path=new URL(doc.URL).pathname;
    const archive=/^\/blog\/(?:arquivo\/[^/]*\.html|e\/[^/]+\.html)$/.test(path);
    const article=doc.body.classList.contains('pp-blog-article');
    if (!archive && !article) return;
    if(archive)doc.body.classList.add('passport-artist-archive');
    const main=doc.querySelector('main'); if (!main) return;
    styles(doc);
    const nav=doc.createElement('section');nav.className='passport-artist-nav';nav.dataset.passportArtistTools='1';nav.setAttribute('aria-label','Navegação do artista e do acervo');
    const heading=doc.createElement('h2');heading.textContent='Explore o acervo';nav.append(heading);
    const row=doc.createElement('nav');row.setAttribute('aria-label','Caminhos do acervo');row.append(link(doc,'A–Z completo','/blog/arquivo/letras.html'),link(doc,'Blog','/blog.html'));
    const node=data.nodes.find(n=>path===n.url || path.replace(/-p\d+\.html$/,'.html')===n.url);
    const explicit=[...doc.querySelectorAll('.blog-entities a')].map(a=>fold(a.textContent));
    const selected=node?[node]:data.nodes.filter(n=>[n.name,...n.aliases].some(name=>explicit.includes(fold(name))));
    for(const n of selected) {
      if(article) row.append(link(doc,'Acervo: '+n.name,n.url));
      row.append(link(doc,'Buscar '+n.name,'/blog/busca.html?q='+encodeURIComponent(n.name)));
    }
    nav.append(row);
    const related=new Map();
    for(const n of selected) for(const edge of data.edges) {
      const id=edge.artist===n.id?edge.band:edge.band===n.id?edge.artist:null;
      const other=data.nodes.find(x=>x.id===id);if(other) related.set(id,other);
    }
    if(related.size) {
      const h=doc.createElement('h3');h.textContent='Bandas e artistas ligados à formação';nav.append(h);
      const links=doc.createElement('nav');links.setAttribute('aria-label','Vínculos de formação');for(const n of related.values())links.append(link(doc,n.name,n.url));nav.append(links);
    }
    if(/^\/blog\/arquivo\/(?:letras|letra-[a-z])\.html$/.test(path)) {
      const entries=[...main.querySelectorAll('a[href^="/blog/e/"]')];
      if(entries.length) {
        const label=doc.createElement('label');label.textContent='Encontre no A–Z';const input=doc.createElement('input');input.type='search';input.placeholder='Nome do artista ou banda';label.append(input);nav.append(label);
        const count=doc.createElement('p');count.setAttribute('aria-live','polite');nav.append(count);
        const pages=doc.createElement('nav');pages.setAttribute('aria-label','Paginação do A–Z');
        const previous=doc.createElement('button');previous.type='button';previous.textContent='Anterior';
        const next=doc.createElement('button');next.type='button';next.textContent='Próxima';
        const pageLabel=doc.createElement('span');pages.append(previous,pageLabel,next);nav.append(pages);
        const params=new URL(doc.URL).searchParams;input.value=params.get('q')||'';
        let page=Math.max(1,Number.parseInt(params.get('pagina'),10)||1);
        const pageSize=48;
        const update=()=>{
          const q=fold(input.value),matches=entries.filter(a=>fold(a.textContent).includes(q));
          const total=Math.max(1,Math.ceil(matches.length/pageSize));page=Math.min(page,total);
          const visibleEntries=new Set(matches.slice((page-1)*pageSize,page*pageSize));
          for(const a of entries)a.hidden=!visibleEntries.has(a);
          for(const cloud of main.querySelectorAll('.blog-entity-cloud')){
            const visible=[...cloud.querySelectorAll('a')].some(a=>!a.hidden);cloud.hidden=!visible;
            if(cloud.parentElement?.classList.contains('blog-section'))cloud.parentElement.hidden=!visible;
            const heading=cloud.previousElementSibling;if(heading?.tagName==='H2')heading.hidden=!visible;
          }
          count.textContent=matches.length.toLocaleString('pt-BR')+' entradas encontradas · '+entries.length.toLocaleString('pt-BR')+' destinos neste índice';
          pageLabel.textContent='Página '+page+' de '+total;previous.disabled=page===1;next.disabled=page===total;
          // Canonical remains the historical URL. Reader frame owns its own pagination URL.
          try{const url=new URL(doc.URL);url.searchParams.set('pagina',String(page));if(input.value)url.searchParams.set('q',input.value);else url.searchParams.delete('q');doc.defaultView.history.replaceState(doc.defaultView.history.state,'',url.href);}catch(_){}
        };
        input.addEventListener('input',()=>{page=1;update();});
        previous.addEventListener('click',()=>{page--;update();});next.addEventListener('click',()=>{page++;update();});update();
      }
    }
    const crumbs=main.querySelector('.blog-crumbs');
    if(crumbs) crumbs.insertAdjacentElement('afterend',nav);else main.prepend(nav);
  }
  function watch(frame) {
    if(watched.has(frame))return;watched.add(frame);
    const run=()=>{try{enhance(frame.contentDocument);}catch(_){}};
    frame.addEventListener('load',run);run();
  }
  window.PassportArtistNavigation=Object.freeze({enhance});
  window.addEventListener('passport:editorial-rendered',()=>enhance(document));
  fetch('/data/blog-artist-navigation.json',{credentials:'same-origin'}).then(r=>{if(!r.ok)throw Error('archive navigation unavailable');return r.json();}).then(value=>{
    data=value;enhance(document);
    const frames=()=>document.querySelectorAll('#pp-nav-page').forEach(watch);frames();
    new MutationObserver(frames).observe(document.body,{childList:true,subtree:true});
  }).catch(()=>{}); // Existing archive links remain usable when enhancement is unavailable.
})();


