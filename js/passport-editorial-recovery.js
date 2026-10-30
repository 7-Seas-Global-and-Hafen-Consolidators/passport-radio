/* PR #584: explicit article composition. No station, transport or navigation operations. */
(() => {
 'use strict';
 if(window.PassportEditorialRecovery)return;
 let catalog;
 const text=node=>(node?.textContent||'').replace(/\s+/g,' ').trim();
 const added=node=>{node.dataset.prAdded='true';return node};
 const element=(tag,cls,content)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(content)n.textContent=content;return n};
 const block=node=>node.nodeType===1&&(node.matches('p,h2,h3,h4,blockquote,ul,ol,table,pre,figure,img,hr,iframe,video,a,button,details')||node.matches('.video,.party-video,.listen,.quote,.controversy-rank')||!node.children.length);
 function flatten(node,exclude){
  if(exclude.has(node)||node.nodeType===1&&node.matches('script,style,template'))return [];
  if(node.nodeType===3)return node.textContent.trim()?[node]:[];
  if(block(node))return [node];
  const children=[...node.childNodes].flatMap(n=>flatten(n,exclude));
  if(node.id&&node.id!=='article-text'){const anchor=element('span');anchor.id=node.id;anchor.dataset.prAnchor='true';return [anchor,...children]}
  return children;
 }
 function photo(record){
  if(!record?.src?.startsWith('/'))return null;
  const f=added(element('figure','pr-photo')),im=element('img');im.src=record.src;im.alt=record.alt||record.subject||'';im.loading='lazy';im.decoding='async';
  if(record.width&&record.height){im.width=record.width;im.height=record.height}
  f.append(im);if(record.caption||record.credit)f.append(element('figcaption','', [record.caption||record.subject,record.credit].filter(Boolean).join(' · ')));
  return f;
 }
 function compact(parent){
  let previous=null;
  for(const node of [...parent.children]){
   if(node.tagName!=='P'||node.matches('.caption,.credit,.photo-credit,.controversy-rank,.pr-fact')||node.querySelector('img,iframe,video')||node.id){previous=null;continue;}
   const words=text(node).split(' ').length;
   if(previous&&words<45&&text(previous).split(' ').length+words<=95){previous.append(document.createTextNode(' '),...node.childNodes);node.remove();}
   else previous=words<85?node:null;
  }
 }
 function media(section){
  section.querySelectorAll('iframe,video').forEach(frame=>{
   if(frame.closest('.pr-frame'))return;
   let box=frame.parentElement;
   if(box===section||!box.matches('.video,.party-video')){box=element('div','pr-frame');frame.before(box);box.append(frame)}else box.classList.add('pr-frame');
   const panel=element('div','pr-media');box.before(panel);panel.append(box);
   const title=frame.getAttribute('title');if(title&&!/^(?:youtube|vídeo|video)(?:\s+player)?$/i.test(title)){const h=added(element('p','pr-media-label',title));panel.prepend(h)}
   const next=panel.nextElementSibling;if(next?.matches('.caption,.party-caption'))panel.append(next);
  });
 }
 function feature(section,record){
  let figure;
  if(record?.image)figure=photo(record.image);
  if(figure){const title=section.querySelector(':scope > h2');title?title.after(figure):section.prepend(figure)}
  else figure=[...section.children].find(n=>n.matches('figure,img'));
  if(!figure)return;
  if(figure.tagName==='IMG'){const f=element('figure','pr-photo');figure.before(f);f.append(figure);figure=f}
  figure.classList.add('pr-photo');
  if(figure.querySelector('img')?.naturalWidth&&figure.querySelector('img').naturalWidth<600)figure.classList.add('pr-small-original');
  // Only a short opening sits beside the photograph. The full narrative continues below.
  const lead=[];let n=figure.nextElementSibling,words=0;
  while(n&&n.matches('p:not(.caption):not(.controversy-rank)')&&words+text(n).split(' ').length<=105){lead.push(n);words+=text(n).split(' ').length;n=n.nextElementSibling;}
  if(lead.length){const row=element('div','pr-feature'),copy=element('div','pr-feature-copy');figure.before(row);row.append(figure,copy);copy.append(...lead);}
 }
 function gallery(parent,records){
  if(!records?.length)return;const g=added(element('div','pr-gallery'));g.setAttribute('aria-label','Fotografias relacionadas a este capítulo');for(const r of records){const f=photo(r);if(f)g.append(f)}parent.append(g);
 }
 async function prepare(main,key){
  if(main.dataset.editorialLayout==='3'||main.dataset.prPreparing)return;
  main.dataset.prPreparing='true';
  try{
   catalog ||= fetch('/data/editorial-recovery-phase1.json').then(r=>{if(!r.ok)throw Error('Catálogo editorial indisponível');return r.json()});
   const settings=(await catalog).articles.find(a=>a.id===key);if(!settings)throw Error('Matéria fora do inventário da Fase 1');
   const hero=main.querySelector('.hero,.pe-hero,.story-hero');if(!hero)throw Error('Abertura editorial ausente');
   const config=main.querySelector('[data-passport-editorial-presentation]');
   const back=main.querySelector('.editorial-return,.story-return');
   const excluded=new Set([hero,config,back].filter(Boolean));
   const nodes=[...main.childNodes].flatMap(n=>flatten(n,excluded));
   const headings=nodes.filter(n=>n.nodeType===1&&n.matches('h2,h3'));
   headings.forEach((n,i)=>n.dataset.prSourceHeading=String(i));
   const byIndex=new Map(settings.chapters.map(r=>[r.sourceIndex,r]));
   for(const chapter of settings.chapters){if(text(headings[chapter.sourceIndex])!==chapter.title)throw Error('Capítulo divergente: '+chapter.sourceIndex)}
   const body=element('div','pr-body');body.id='article-text';const intro=element('div','pr-intro pr-reading');body.append(intro);let target=intro;const sections=[];
   for(const original of nodes){
    let node=original;
    if(node.nodeType===1&&node.matches('h2,h3')){
     const index=Number(node.dataset.prSourceHeading),record=byIndex.get(index);
     if(record){
      const previous=target.lastElementChild;
      const sec=element('section','pr-chapter'+(record.kind==='closing'?' pr-closing':''));sec.id=node.id||'pr-'+String(settings.number).padStart(2,'0')+'-'+String(sections.length+1).padStart(2,'0');
      sec.dataset.prChapter=String(index);body.append(sec);target=sec;sections.push({node:sec,record});
      if(previous?.matches('.controversy-rank'))sec.append(previous);
      if(node.tagName!=='H2'){const h=element('h2');h.append(...node.childNodes);if(node.id)h.id=node.id;node=h}
      node.classList.add('pr-section-title');target.append(node);continue;
     }
     const p=element('p','pr-interjection'),strong=element('strong');strong.append(...node.childNodes);p.append(strong);if(node.id)p.id=node.id;node=p;
     if(settings.facts?.includes(index))node.classList.add('pr-fact');
    }
    target.append(node);
   }
   if(!text(intro))intro.remove();
   main.replaceChildren(...[config,back,hero,body].filter(Boolean));
   if(!back){const a=added(element('a','pr-return','← Voltar a Notícias'));a.href='/noticias.html';main.prepend(a)}else back.classList.add('pr-return');
   main.classList.add('pr-recovery');main.dataset.editorialModel=settings.model;
   hero.classList.add('pr-hero');
   const copy=hero.querySelector('.hero-copy,.hero__content,.story-hero__copy')||hero;
   copy.classList.add('pr-titlegroup');
   if(settings.category&&!copy.querySelector('.pr-category,.editorial-category,.kicker,.pe-kicker'))copy.prepend(added(element('p','pr-category',settings.category)));
   const im=hero.querySelector('img');
   if(im){let f=im.closest('figure');if(!f){f=element('figure','pr-hero-photo');im.before(f);f.append(im)}f.classList.add('pr-hero-photo');hero.append(f);im.loading='eager';if(settings.heroCaption)f.append(added(element('figcaption','',settings.heroCaption)))}
   if(settings.date&&!copy.querySelector('time')){const t=added(element('time','pr-date',settings.date));t.dateTime=settings.isoDate;copy.append(t)}
   compact(intro);
   for(const {node:section,record}of sections){compact(section);feature(section,record);media(section);gallery(section,record.gallery);if(record.pair)section.dataset.prPair=record.pair;}
   // Pair only the explicitly identified short passages; never trap a long chapter in a half column.
   for(let i=0;i<sections.length-1;i++){
    const a=sections[i],b=sections[i+1];
    if(!a.record.pair||a.record.pair!==b.record.pair)continue;
    if([a,b].some(x=>text(x.node).split(' ').length>210||x.node.querySelector('iframe,video')||!x.node.querySelector('img')))throw Error('Par editorial incompatível com o conteúdo integral');
    const grid=element('div','pr-pair');a.node.before(grid);grid.append(a.node,b.node);i++;
   }
   if(settings.gallery){const section=settings.gallery.afterSourceIndex===-1?intro:sections.find(s=>s.record.sourceIndex===settings.gallery.afterSourceIndex)?.node;if(section)gallery(section,settings.gallery.images)}
   if(settings.toc&&sections.length){
    const toc=added(element('details','pr-toc'));toc.setAttribute('aria-label','Sumário desta matéria');toc.open=matchMedia('(min-width:768px)').matches;toc.append(element('summary','pr-toc-title','Sumário desta matéria'));const list=element('ol');
    for(const {node,record}of sections){if(record.toc===false)continue;const item=element('li'),a=element('a','',record.tocLabel||record.title);a.href='#'+node.id;item.append(a);list.append(item)}toc.append(list);intro.isConnected?intro.after(toc):body.prepend(toc);
   }
   main.dataset.editorialLayout='3';main.dataset.prReady='true';delete main.dataset.prPreparing;
  }catch(error){delete main.dataset.prPreparing;main.dataset.prError=error.message;console.error('Passport editorial recovery:',error.message)}
 }
 window.PassportEditorialRecovery=Object.freeze({prepare});
})();
