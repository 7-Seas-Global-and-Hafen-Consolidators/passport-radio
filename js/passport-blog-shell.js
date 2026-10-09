/* Editorial content inside the approved institutional App; no second chrome. */
(() => {
 'use strict';if(window.PassportBlogShell)return;
 const archiveLinks=[['/blog.html','Capa'],['/blog/busca.html','Busca'],['/blog/arquivo/','Arquivo'],['/blog/arquivo/letras.html','A–Z'],['/blog/arquivo/autores.html','Autores'],['/blog/arquivo/paises.html','Países'],['/blog/arquivo/formatos.html','Formatos'],['/blog/arquivo/epocas.html','Épocas'],['/blog/arquivo/temas.html','Temas'],['/blog/arquivo/agenda.html','Agenda do acervo'],['/blog/arquivo/hoje.html','Hoje no acervo'],['/blog/envie-sua-historia.html','Envie sua história']];
 const load=(tag,url)=>{if([...document.querySelectorAll(tag==='script'?'script[src]':'link[href]')].some(n=>(n.src||n.href).split('?')[0]===new URL(url,location.href).href.split('?')[0]))return;const n=document.createElement(tag);if(tag==='script'){n.src=url;n.defer=true}else{n.rel='stylesheet';n.href=url}document.head.append(n)};
  function refreshReadingTime(main) {
    const prose=main.querySelector('.pe-prose,.mn-prose,article.prose,.blog-profile');
    if(!prose)return;
    const words=[...prose.querySelectorAll('p,li')]
      .filter(node=>!node.closest('details,figure,nav,.blog-collab-strip,.blog-share,.blog-follow,.blog-prevnext,.blog-listen')&&!node.querySelector('p,li')&&!node.matches('.blog-kicker,[data-passport-reading-time]'))
      .map(node=>node.textContent.trim()).join(' ').split(/\s+/u).filter(Boolean).length;
    if(!words)return;
    let reading=main.querySelector('[data-passport-reading-time]');
    if(!reading){
      const title=main.querySelector('h1');if(!title)return;
      reading=document.createElement('p');reading.dataset.passportReadingTime='1';
      reading.className='passport-blog-shell-reading';title.after(reading);
    }
    const text='🕒 Leitura: '+Math.ceil(words/200)+' '+(words<=200?'minuto':'minutos');
    if(reading.textContent!==text)reading.textContent=text;
    reading.dataset.passportWordCount=String(words);
  }

 let proseObserver;
 function decorate(main){
  proseObserver?.disconnect();if(!main)return;
  document.body.dataset.passportBlogShell='1';document.body.dataset.editorialPaperChrome='1';
  load('link','/css/payment-footer-trust.css');
  load('link','https://fonts.googleapis.com/css2?family=Bodoni+Moda:wght@400;700&family=Instrument+Sans:wght@400;500;600;700&family=Source+Serif+4:wght@400;700&display=swap');
  main.querySelectorAll('.blog-doors,.passport-artist-nav').forEach(n=>n.remove());
  const editorial=document.createElement('nav');editorial.className='passport-blog-shell-editorial';editorial.setAttribute('aria-label','Navegação editorial');
  for(const [href,text]of archiveLinks){const a=document.createElement('a');a.href=href;a.textContent=text;editorial.append(a)}
  const form=document.createElement('form');form.className='blog-search passport-blog-shell-search';form.method='get';form.action='/blog/busca.html';form.setAttribute('role','search');form.innerHTML='<label for="passport-shell-query">Buscar no Blog</label><input id="passport-shell-query" name="q" type="search" placeholder="Artista, disco, país, ano…"><button type="submit">Buscar</button>';
  const edition=document.createElement('p');edition.className='passport-blog-shell-edition';edition.innerHTML='<span>ACERVO PASSPORT RADIO</span><span>EDIÇÃO MR. NOMAD</span>';
  // Content tools are inside the single main, below the original header/player/catalog.
  main.prepend(editorial,form,edition);
  refreshReadingTime(main);const prose=main.querySelector('.pe-prose,.mn-prose,article.prose,.blog-profile');if(prose){proseObserver=new MutationObserver(()=>refreshReadingTime(main));proseObserver.observe(prose,{childList:true,subtree:true,characterData:true})}
  load('script','/js/passport-artist-navigation.js?v=20261009-outlet');
 }
 function mount(){
  if(!/^\/blog(?:\.html|\/)/.test(location.pathname)||document.body.dataset.passportInstitutional)return;
  const main=document.querySelector('main');if(!main)return;
  window.PassportInitialEditorial=document.cloneNode(true);
  window.PassportEditorialRoute=location.pathname+location.search+location.hash;
  window.PassportInstitutionalHost=true;
  // Keep existing opaque transport hosts if one is already mounted. Templates are removed.
  for(const node of [...document.body.children])if(!node.matches('script,style,#qwen-engine-bay,#passport-casa-host'))node.remove();
  const root=document.createElement('div');root.id='root';document.body.prepend(root);
  document.body.dataset.passportInstitutional='1';
  load('link','/assets/index-CcTsvlNy.css');load('link','/css/passport-blog-shell.css?v=20261009-outlet');
  const module=document.createElement('script');module.type='module';module.src='/assets/index-DgBCruM8.js';document.head.append(module);
  load('script','/js/passport-persist-nav.js');load('script','/js/passport-audio-continuity.js');
 }
 window.PassportBlogShell=Object.freeze({mount,decorate,refreshReadingTime});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();

