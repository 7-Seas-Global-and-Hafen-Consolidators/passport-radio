/* Fase 2: presentation only. Existing article nodes and media are moved, never recreated. */
(() => {
 'use strict';
 if (window.PassportEditorialLayout) return;
 const config = () => {try{return JSON.parse(document.querySelector('script[data-passport-editorial-presentation]')?.textContent || '{}')}catch{return {}}};
 const image = (record, role) => {
  if (!record?.src || !record.src.startsWith('/')) return null;
  const img=document.createElement('img');img.src=record.src;img.alt=record.alt||'';img.className=role;img.dataset.editorialAdded='image';img.decoding='async';img.loading=role==='editorial-hero-image'?'eager':'lazy';
  if(record.width&&record.height){img.width=record.width;img.height=record.height}return img;
 };
 function prepare(main) {
  if(!main || main.dataset.editorialLayout==='2')return;
  const settings=config(); const hero=main.querySelector('.hero,.pe-hero,.mn-hero');
  if(!hero || !main.querySelector('h1'))return;
  document.body.classList.add('passport-editorial-rollout'); main.classList.add('participe-content');main.dataset.editorialLayout='2';
  hero.classList.add('hero');
  const copy=hero.querySelector('.hero-copy,.pe-shell,.shell')||hero;copy.classList.add('hero-copy');
  const category=copy.querySelector('.pe-kicker,.mn-kicker,.tag,.eyebrow,.editorial-category');category?.classList.add('editorial-category');
  const deck=copy.querySelector('.dek,.mn-deck')||[...copy.children].find(e=>e.tagName==='P'&&!e.matches('.az-entities,.eyebrow,.editorial-category,.editorial-byline'));
  deck?.classList.add('dek');
  const byline=copy.querySelector('.pe-stamp,.mn-meta,.byline,.editorial-byline,.eyebrow:last-child');byline?.classList.add('editorial-byline');
  if(!byline&&settings.byline){const p=document.createElement('p');p.className='editorial-byline';p.textContent=settings.byline;p.dataset.editorialAdded='metadata';copy.append(p)}
  if(!main.querySelector('.editorial-return,.story-return')){const a=document.createElement('a');a.className='editorial-return';a.href='/noticias.html';a.textContent='← Voltar a Notícias';a.dataset.editorialAdded='return';main.prepend(a)}
  else main.querySelector('.story-return')?.classList.add('editorial-return');
  let photo=hero.querySelector('img:not([data-editorial-added])');
  if(!photo&&settings.hero){photo=image(settings.hero,'editorial-hero-image');if(photo)hero.append(photo)}
  if(photo){photo.classList.add('editorial-hero-image');const block=photo.closest('figure')||photo;block.classList.add('editorial-hero-figure');hero.append(block)}
  let prose=main.querySelector('#article-text,.pe-prose,.mn-prose,.article-content,.passport-prose');
  if(!prose){
   const parent=main.querySelector('article.article')||main;
   const nodes=[...parent.children].filter(e=>e!==hero&&!e.matches('.editorial-return,.story-return')&&!e.contains(hero));
   if(!nodes.length)return;prose=document.createElement('div');nodes[0].before(prose);prose.append(...nodes);
  }
  prose.classList.add('editorial-prose');
  main.querySelectorAll('.pe-layout,.mn-main').forEach(e=>e.classList.add('editorial-layout'));
  main.querySelectorAll('.pe-side,.mn-side').forEach(e=>e.classList.add('editorial-context'));
  // Split only at existing headings. Labels immediately preceding a heading stay attached.
  const direct=[...prose.childNodes];let section=null;
  for(const node of direct){
   if(node.nodeType===1&&node.matches('section,.album-grid,.editorial-chapter-grid,.editorial-outro')){section=null;continue}
   if(node.nodeType===1&&node.matches('h2')){
    section=document.createElement('section');section.className='editorial-chapter';node.before(section);
    const previous=section.previousElementSibling;
    if(previous?.matches('span.chapter,.mn-chapter,.chapter-label'))section.append(previous);
   }
   if(section)section.append(node);
  }
  [...prose.children].filter(e=>e.matches('section,.chapter,.album-grid>section')).forEach(e=>{if(e.querySelector('h2'))e.classList.add('editorial-chapter')});
  prose.querySelectorAll('.album-chapter,.story-chapter').forEach(e=>e.classList.add('editorial-chapter'));
  prose.querySelectorAll('.album-grid').forEach(e=>e.classList.add('editorial-chapter-grid'));
  const pool=settings.images||[];let photoIndex=0;
  const chapters=[...prose.querySelectorAll('.editorial-chapter')];
  for(const chapter of chapters){
   chapter.classList.add('editorial-card');
   if(chapter.querySelector('iframe,video,.video'))chapter.classList.add('editorial-multimedia');
   if(!chapter.querySelector('img')&&pool.length){
    const text=chapter.textContent.toLocaleLowerCase();const pertinent=pool.filter(i=>i.subject&&text.includes(i.subject.toLocaleLowerCase()));
    const options=pertinent.length?pertinent:pool.filter(i=>i.primary);const chosen=(options.length?options:pool)[photoIndex++%(options.length||pool.length)];
    const img=image(chosen,'editorial-chapter-photo');if(img){const h=chapter.querySelector('h2,h3');if(h)h.after(img);else chapter.prepend(img)}
   }
  }
  // Pair adjacent chapters only; no CSS reordering or changes to narrative/media order.
  let pending=[];const flush=()=>{
   while(pending.length){const pair=pending.splice(0,2);const grid=document.createElement('div');grid.className='editorial-chapter-grid';pair[0].before(grid);grid.append(...pair)}
  };
  for(const child of [...prose.children]){
   if(child.matches('.editorial-chapter')&&!child.matches('.editorial-opening,.editorial-closing,.story-opening'))pending.push(child);
   else {flush();if(child.matches('.editorial-chapter-grid'))child.querySelectorAll('section').forEach(e=>e.classList.add('editorial-card'))}
  }flush();
  // Standalone media keeps its actual node, attributes, URL and controls.
  prose.querySelectorAll('iframe,video').forEach(media=>{
   if(media.closest('.video,.editorial-media-frame'))return;
   const wrap=document.createElement('div');wrap.className='editorial-media-frame';media.before(wrap);wrap.append(media);
  });
 }
 const install=()=>document.querySelectorAll('main').forEach(prepare);
 window.PassportEditorialLayout=Object.freeze({prepare,install});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
 // The existing profile renderer and institutional reader may insert their own main asynchronously.
 document.addEventListener('passport:editorial-rendered',install);
 const observer=new MutationObserver(records=>{if(records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1&&(n.matches('main')||n.querySelector('main')))))install()});
 observer.observe(document.body,{childList:true,subtree:true});
})();
