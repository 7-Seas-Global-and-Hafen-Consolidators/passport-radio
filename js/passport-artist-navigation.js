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
  let data={nodes:[],edges:[]};let dataReady=false;let media={};let names={};
  function shownName(doc,a,fallback){
    const path=new URL(a.href,doc.URL).pathname;
    return names[path]||media[path]?.name||fallback;
  }
  function pictures(doc){
    for(const a of doc.querySelectorAll('.blog-entity-cloud a[href^="/blog/e/"]')){
      const photo=media[new URL(a.href,doc.URL).pathname];if(!photo?.image||a.dataset.artistPhoto)continue;
      const storyCount=a.querySelector("small")?.textContent.trim()||"";
      const label=shownName(doc,a,[...a.childNodes].filter(node=>node.nodeType===3).map(node=>node.textContent).join(" ").trim()||a.textContent.replace(storyCount,"").trim());
      a.dataset.artistName=photo.name||label;a.dataset.artistPhoto="1";a.dataset.photoSource=photo.source;a.dataset.photoLicense=photo.license_url;
      const img=doc.createElement("img");img.src=photo.image;img.alt=photo.name||label;img.loading="lazy";img.decoding="async";
      if(photo.kind==="logo")img.className="passport-az-logo";
      const shot=doc.createElement("span");shot.className="passport-az-shot";shot.append(img);
      if(photo.credit){const stamp=doc.createElement("em");stamp.className="passport-az-credit";stamp.textContent=photo.credit;shot.append(stamp);}
      const name=doc.createElement("span");name.className="passport-artist-name";name.textContent=label;
      const count=doc.createElement("small");count.className="passport-artist-story-count";count.textContent=storyCount;count.setAttribute("aria-label",storyCount+" matérias relacionadas");
      a.replaceChildren(shot,name,count);
      let credits=doc.querySelector("[data-passport-gallery-credits]");if(!credits){credits=doc.createElement("p");credits.dataset.passportGalleryCredits="1";credits.className="passport-gallery-credits";doc.querySelector("main")?.append(credits)}
      credits.append(link(doc,photo.name+" — "+photo.credit,photo.source),doc.createTextNode(" · "),link(doc,photo.license,photo.license_url),doc.createTextNode(". "));
    }
    cards(doc);
  }
  const columns=new Set(["a-cena","agenda","albunsquemarcaram","apos","baixo","baterista","biografias","blabbermouth","box-set","brasil","canal","cds","celebridades","clubedos27","colecoes","curiosidades","engenheiros","e-studos","ex-vocal","guitarrista","historiasdemusicas","historiasdemusicassaxon","ibagenscast","ingressos","instrumentos","lancamentos","livros","lollapalooza","mashups","melhores","melhores2025","melhoresporestilorym","metal-hammer","morteozzyosbourne","newmetal","noisecreep","opinioes","pedepagina","policia","prog-metal","thrash-metal","traducoes","woodstock1969","rock-and-rollhalloffame","rock-inrio1985","rock-inrio2026","the-town2025","monsters-of-rock-brasil-2026","bangersopenair2026","bangersopenair2027"]);
  function isColumn(path){
    return columns.has(path.split("/").pop().replace(".html",""));
  }
  function cards(doc){
    let themes=doc.querySelector('[data-passport-az-themes]');
    for(const a of doc.querySelectorAll('.blog-entity-cloud a[href^="/blog/e/"]')){
      const small=a.querySelector('small');
      const storyCount=small?.textContent.trim()||a.dataset.storyCount||'';
      const path=new URL(a.href,doc.URL).pathname;
      const raw=shownName(doc,a,a.dataset.artistName||[...a.childNodes].filter(node=>node.nodeType===3).map(node=>node.textContent).join(' ').trim()||a.textContent.replace(storyCount,'').trim());
      const label=raw;
      a.dataset.artistName=label;
      const nameEl=a.querySelector('.passport-artist-name');
      if(nameEl&&nameEl.textContent!==label)nameEl.textContent=label;
      if(isColumn(path)||fold(label)==='acena'){
        if(!themes){
          themes=doc.createElement('section');
          themes.dataset.passportAzThemes='1';
          themes.className='passport-az-themes';
          const heading=doc.createElement('h2');heading.textContent='Temas e categorias';themes.append(heading);
          const nav=doc.createElement('nav');nav.className='passport-az-theme-links';nav.setAttribute('aria-label','Temas e categorias do acervo');themes.append(nav);
          doc.querySelector('main')?.append(themes);
        }
        if(a.parentElement!==themes.querySelector('nav')) themes.querySelector('nav').append(a);
        continue;
      }
      a.classList.add('passport-az-card');
      if(a.querySelector('img'))continue;
      if(a.querySelector('.passport-artist-name')&&!a.querySelector('.passport-az-plate'))continue;
      const name=doc.createElement('span');name.className='passport-artist-name passport-az-fallback';name.textContent=label;
      const count=doc.createElement('small');count.className='passport-artist-story-count';count.textContent=storyCount;
      if(storyCount)count.setAttribute('aria-label',storyCount+' matérias relacionadas');
      a.replaceChildren(name,count);
    }
  }
  function link(doc, text, href) {
    const a = doc.createElement('a'); a.textContent=text; a.href=href; return a;
  }
  function styles(doc) {
      const cardsCss=doc.querySelector('link[data-passport-az-cards]')||doc.createElement('link');
      if(!cardsCss.parentNode){cardsCss.rel='stylesheet';cardsCss.dataset.passportAzCards='1';doc.head.append(cardsCss);}
      cardsCss.href='/css/passport-az-cards.css?v=20261009-az268';
    if (doc.querySelector('link[data-passport-artist-navigation]')) return;
    const css=doc.createElement('link');css.rel='stylesheet';css.href='/css/passport-artist-navigation.css?v=20261009-az-directory';css.dataset.passportArtistNavigation='1';doc.head.append(css);
  }
  function enhance(doc) {
    if(!doc?.body)return;
    const path=new URL(doc.URL).pathname;
    const archive=/^\/blog\/(?:arquivo\/[^/]*\.html|e\/[^/]+\.html)$/.test(path);
    const article=doc.body.classList.contains('pp-blog-article');
    const az=/^\/blog\/arquivo\/(?:letras|letra-[a-z])\.html$/.test(path);
    if(!archive&&!article)return;
    if(!az&&!dataReady)return;
    if(archive)doc.body.classList.add('passport-artist-archive');
    if(az){
      doc.body.classList.add('passport-az-directory');styles(doc);
      const blogQ=doc.querySelector('#blog-q');
      if(blogQ){blogQ.placeholder='Nome do artista ou banda';blogQ.setAttribute('aria-label','Buscar pelo nome');}
    }
    const existing=doc.querySelector('[data-passport-artist-tools]');
    if(existing){existing._passportAzUpdate?.();return;}
    const main=doc.querySelector('main'); if (!main) return;
    styles(doc);pictures(doc);cards(doc);
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
    if(az) {
      const indexPage=path.endsWith('/letras.html');
      if(indexPage){
        const title=main.querySelector('h1');if(title)title.textContent='ARTISTAS & BANDAS';
        const intro=main.querySelector('.blog-intro');if(intro)intro.textContent='Primeiro a história. Depois a música.';
      }
      let alphabet=main.querySelector('.blog-az');
      if(!alphabet){
        alphabet=doc.createElement('nav');alphabet.className='blog-az';
        for(const letter of 'abcdefghijklmnopqrstuvwxyz'){
          const a=link(doc,letter.toUpperCase(),'/blog/arquivo/letra-'+letter+'.html');
          if(path.endsWith('/letra-'+letter+'.html'))a.setAttribute('aria-current','page');
          alphabet.append(a);
        }
        const firstSection=main.querySelector('.blog-section');if(firstSection)firstSection.before(alphabet);
      } else if(alphabet.tagName!=='NAV'){
        const index=doc.createElement('nav');index.className='blog-az';index.setAttribute('aria-label','Índice alfabético');
        while(alphabet.firstChild)index.append(alphabet.firstChild);alphabet.replaceWith(index);alphabet=index;
      }
      alphabet.setAttribute('aria-label','Índice alfabético de artistas e bandas');
      for(const a of alphabet.querySelectorAll('a[href]')){
        if(new URL(a.href,doc.URL).pathname===path)a.setAttribute('aria-current','page');
        else a.removeAttribute('aria-current');
      }

      const entries=[...main.querySelectorAll('.blog-entity-cloud a[href^="/blog/e/"]')];
      for(const a of entries){
        a.classList.add('passport-az-entry');
        if(!a.dataset.artistName){
          const small=a.querySelector('small');
          a.dataset.artistName=[...a.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join(' ').trim()||a.textContent.replace(small?.textContent||'','').trim();
        }
      }
      if(entries.length){
        const heading=doc.createElement('h2');heading.className='passport-az-tools-title';heading.textContent=indexPage?'Explore o diretório':'Filtre esta letra';nav.append(heading);
        const row=doc.createElement('nav');row.setAttribute('aria-label','Caminhos do acervo');row.append(link(doc,'A–Z completo','/blog/arquivo/letras.html'),link(doc,'Blog','/blog.html'));nav.append(row);

        const searchLabel=doc.createElement('label');searchLabel.className='passport-az-search-label';searchLabel.textContent='Buscar nome';
        const input=doc.createElement('input');input.type='search';input.className='passport-az-search';input.placeholder='Nome do artista ou banda';input.setAttribute('aria-label','Buscar pelo nome');searchLabel.append(input);nav.append(searchLabel);

        const typeLabel=doc.createElement('label');typeLabel.className='passport-az-type-label';typeLabel.textContent='Tipo identificado no acervo';
        const type=doc.createElement('select');type.className='passport-az-type';type.setAttribute('aria-label','Filtrar por tipo identificado');
        for(const [value,label] of [['all','Todos os nomes'],['band','Bandas identificadas'],['artist','Artistas e músicos identificados'],['formation','Com vínculo de formação explícito'],['untyped','Sem classificação estruturada']]){
          const option=doc.createElement('option');option.value=value;option.textContent=label;type.append(option);
        }
        typeLabel.append(type);nav.append(typeLabel);
        const count=doc.createElement('p');count.className='passport-az-results';count.setAttribute('aria-live','polite');nav.append(count);
        const pages=doc.createElement('nav');pages.className='passport-az-pagination';pages.setAttribute('aria-label','Paginação do diretório');
        const previous=doc.createElement('button');previous.type='button';previous.textContent='Anterior';
        const next=doc.createElement('button');next.type='button';next.textContent='Próxima';
        const pageLabel=doc.createElement('span');pages.append(previous,pageLabel,next);nav.append(pages);

        const params=new URL(doc.URL).searchParams;input.value=params.get('q')||'';type.value=params.get('tipo')||'all';
        if(!['all','band','artist','formation','untyped'].includes(type.value))type.value='all';
        let page=Math.max(1,Number.parseInt(params.get('pagina'),10)||1);
        const pageSize=24;
        const update=()=>{
          const nodesByPath=new Map((data?.nodes||[]).map(n=>[n.url,n]));
          const formationIds=new Set((data?.edges||[]).flatMap(e=>[e.artist,e.band]));
          const q=fold(input.value),kind=type.value;
          const filtered=entries.filter(a=>{
            const folded=fold(a.dataset.artistName||a.textContent);
            if(q && !(folded.startsWith(q) || folded.replace(/^(the|os|as|o|a|los|las)/,'')===q))return false;
            const node=nodesByPath.get(new URL(a.href,doc.URL).pathname);
            if(kind==='all')return true;
            if(kind==='band')return node?.kind==='band';
            if(kind==='artist')return node?.kind==='artist';
            if(kind==='formation')return !!node&&formationIds.has(node.id);
            return !node;
          });
          const total=Math.max(1,Math.ceil(filtered.length/pageSize));page=Math.max(1,Math.min(page,total));
          const visible=new Set(filtered.slice((page-1)*pageSize,page*pageSize));
          for(const a of entries)a.hidden=!visible.has(a);
          for(const cloud of main.querySelectorAll('.blog-entity-cloud')){
            const show=[...cloud.querySelectorAll('a')].some(a=>!a.hidden);cloud.hidden=!show;
            if(cloud.parentElement?.classList.contains('blog-section'))cloud.parentElement.hidden=!show;
            const heading=cloud.previousElementSibling;if(heading?.tagName==='H2')heading.hidden=!show;
          }
          const typed=entries.filter(a=>nodesByPath.has(new URL(a.href,doc.URL).pathname)).length;
          count.textContent=filtered.length.toLocaleString('pt-BR')+' resultados · '+entries.length.toLocaleString('pt-BR')+' destinos · '+typed.toLocaleString('pt-BR')+' com tipo estruturado';
          pageLabel.textContent='Página '+page+' de '+total;previous.disabled=page<=1;next.disabled=page>=total;
          try{const url=new URL(doc.URL);url.searchParams.set('pagina',String(page));
            if(input.value.trim())url.searchParams.set('q',input.value.trim());else url.searchParams.delete('q');
            if(kind==='all')url.searchParams.delete('tipo');else url.searchParams.set('tipo',kind);
            doc.defaultView.history.replaceState(doc.defaultView.history.state,'',url.href);
          }catch(_){}
        };
        nav._passportAzUpdate=update;
        input.addEventListener('input',()=>{page=1;update();});type.addEventListener('change',()=>{page=1;update();});
        previous.addEventListener('click',()=>{if(page>1){page--;update();}});
        next.addEventListener('click',()=>{if(page<Math.ceil(entries.length/pageSize)){page++;update();}});
        update();
      }
      const firstSection=main.querySelector('.blog-section');if(firstSection&&alphabet.parentElement!==main)firstSection.before(alphabet);
      const intro=main.querySelector('.blog-intro');
      if(intro)intro.after(nav);else if(alphabet.parentElement===main)alphabet.before(nav);else if(firstSection)firstSection.before(nav);
    }
    const crumbs=main.querySelector('.blog-crumbs');
    if(az){}else if(crumbs)crumbs.insertAdjacentElement('afterend',nav);else main.prepend(nav);
  }
  function watch(frame) {
    if(watched.has(frame))return;watched.add(frame);
    const run=()=>{try{enhance(frame.contentDocument);}catch(_){}};
    frame.addEventListener('load',run);run();
  }
  window.PassportArtistNavigation=Object.freeze({enhance});
  enhance(document);
  window.addEventListener('passport:editorial-rendered',()=>{enhance(document);pictures(document);cards(document)});
  fetch('/data/blog-artist-media.json',{credentials:'same-origin'}).then(r=>r.ok?r.json():{}).then(value=>{media=value||{};pictures(document);cards(document);}).catch(()=>{});
  fetch('/data/blog-artist-names.json',{credentials:'same-origin'}).then(r=>r.ok?r.json():{}).then(value=>{names=value||{};pictures(document);cards(document);}).catch(()=>{});
  fetch('/data/blog-artist-navigation.json',{credentials:'same-origin'}).then(r=>{if(!r.ok)throw Error('archive navigation unavailable');return r.json();}).then(value=>{
    data=value;dataReady=true;enhance(document);
    const frames=()=>document.querySelectorAll('#pp-nav-page').forEach(watch);frames();
    new MutationObserver(frames).observe(document.body,{childList:true,subtree:true});
  }).catch(()=>{}); // Existing archive links remain usable when enhancement is unavailable.
})();


