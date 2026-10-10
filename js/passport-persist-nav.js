/* Same-document editorial outlet. The approved App owns its sole player/catalog. */
(() => {
 'use strict';
 if(window.PassportPersistNav)return;
 const originalURL=location.href,originalTitle=document.title;
 const home=url=>/^\/(?:index\.html)?$/.test(url.pathname);
 const known=url=>/^\/blog(?:\.html|\/)/.test(url.pathname)||/^\/(?:noticias|editorial)\.html$/.test(url.pathname)||/^\/(?:editorial|historias)\//.test(url.pathname);
 const excluded=/\/(?:radio[^/]*|globo-de-ouro-player|passport-player[^/]*|adapter-lab)\.html$/i;
 const compatible=url=>url.origin===location.origin&&!!document.querySelector('#root #passport-editorial-outlet')&&!excluded.test(url.pathname)&&(home(url)||known(url));
 let serial=0,current=null;const cache=new Map();
 const parse=html=>new DOMParser().parseFromString(html,'text/html');
 const isEditorial=(doc,url)=>!!doc.querySelector('main')&&(!!doc.querySelector('body.pp-blog,body.pp-blog-article,body.pp-article,.pe-prose,.mn-prose,article.prose,main.story,body.passport-news-paper')||known(url));
 function waitForOutlet(){
  const existing=document.getElementById('passport-editorial-outlet');if(existing&&!existing.hidden)return Promise.resolve(existing);
  return new Promise((resolve,reject)=>{
   const observer=new MutationObserver(()=>{const node=document.getElementById('passport-editorial-outlet');if(node&&!node.hidden){observer.disconnect();clearTimeout(timeout);resolve(node)}});
   const timeout=setTimeout(()=>{observer.disconnect();reject(Error('Institutional outlet unavailable'))},10000);
   observer.observe(document.getElementById('root')||document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});
  });
 }
 function route(url){window.PassportEditorialRoute=url;window.dispatchEvent(new CustomEvent('passport:editorial-route',{detail:{url}}));}
 function contentStyles(doc){
  for(const link of doc.querySelectorAll('link[rel="stylesheet"]')){
   const href=new URL(link.getAttribute('href'),location.href).href;
   if(href.includes('/css/passport-shell-')||href.includes('/css/passport-station-')||href.includes('/css/passport-four-doors'))continue;
   if([...document.querySelectorAll('link[rel="stylesheet"]')].some(l=>l.href===href))continue;
   const copy=link.cloneNode(true);copy.href=href;document.head.append(copy);
  }
 }
 function metadata(doc,url){
  document.title=doc.title;
  for(const selector of ['link[rel="canonical"]','meta[name="description"]','meta[property^="og:"]','meta[name^="twitter:"]','script[type="application/ld+json"]']){
   document.querySelectorAll(selector).forEach(n=>n.remove());doc.querySelectorAll(selector).forEach(n=>document.head.append(n.cloneNode(true)));
  }
 }
 async function render(doc,url,token){
  if(!isEditorial(doc,url))throw Error('Editorial main missing');
  route(url.pathname+url.search+url.hash);
  const outlet=await waitForOutlet();if(token!==serial)return;
  const main=doc.querySelector('main');
  main.querySelectorAll('script').forEach(s=>s.remove());
  outlet.replaceChildren(document.importNode(main,true));
  document.body.className=doc.body.className;document.body.dataset.passportInstitutional='1';
  contentStyles(doc);metadata(doc,url);current=url.href;
  if(/^\/blog(?:\.html|\/)/.test(url.pathname)){
   if(!window.PassportBlogShell)await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='/js/passport-blog-shell.js?v=20261009-az-directory';script.onload=resolve;script.onerror=reject;document.head.append(script)});
   if(token!==serial)return;
   const href='/css/passport-blog-shell.css?v=20261009-outlet';if(!document.querySelector('link[data-passport-outlet-style]')){const css=document.createElement('link');css.rel='stylesheet';css.href=href;css.dataset.passportOutletStyle='1';document.head.append(css)}
   window.PassportBlogShell.decorate(outlet.querySelector('main'));
  }
  // Generated articles supply content only; reuse the outer App and its transport.
  if(main.hasAttribute('data-passport-automatic-article')){
   if(!window.PassportAutomaticEditorial)await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='/js/passport-automatic-editorial.js';script.onload=resolve;script.onerror=reject;document.head.append(script)});
   if(token!==serial)return;
  }
  window.dispatchEvent(new CustomEvent('passport:editorial-rendered',{detail:{url:url.href}}));
  // Only page-content helpers run here. No source module, audio host or chrome scripts.
  for(const name of ['passport-blog-search','passport-blog-cover','passport-news','passport-archive']){
   const src=[...doc.scripts].find(s=>s.getAttribute('src')?.includes('/js/'+name+'.js'))?.getAttribute('src');
   if(!src)continue;
   if([...document.scripts].some(s=>s.getAttribute('src')?.split('?')[0]===src.split('?')[0]))continue;
   const script=document.createElement('script');script.src=src;script.dataset.passportContent='1';document.head.append(script);
  }
  window.scrollTo(0,0);
 }
 async function load(url,push){
  const token=++serial;
  try{
   if(home(url)){
    document.getElementById('passport-editorial-outlet')?.replaceChildren();route(null);
    document.body.className='pp-body pp-home';document.body.removeAttribute('data-passport-blog-shell');document.body.removeAttribute('data-passport-institutional');document.querySelectorAll('link[rel="canonical"]').forEach(n=>n.remove());const canonical=document.createElement('link');canonical.rel='canonical';canonical.href='https://passportradio.online/';document.head.append(canonical);const homeDoc=cache.get(new URL('/',originalURL).href);if(homeDoc)metadata(homeDoc,url);else document.querySelectorAll('meta[property^="og:"],meta[name^="twitter:"],script[type="application/ld+json"]').forEach(n=>n.remove());document.title=/^\/(?:index\.html)?$/.test(new URL(originalURL).pathname)?originalTitle:'Passport Radio — 1998·2026';current=null;
    if(push)history.pushState({ppNav:1},'',url.href);window.scrollTo(0,0);return;
   }
   let doc=cache.get(url.href);
   if(!doc){const response=await fetch(url.href,{credentials:'same-origin'});if(!response.ok)throw Error('Editorial request failed');doc=parse(await response.text());if(!isEditorial(doc,url))throw Error('Not editorial');cache.set(url.href,doc);}
   if(token!==serial)return;
   if(push)history.pushState({ppNav:1},'',url.href);
   await render(doc,url,token);
  }catch(error){if(token===serial){console.error('Passport editorial navigation:',error);location.assign(url.href);}}
 }
 document.addEventListener('click',event=>{
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const a=event.target.closest?.('a[href]');if(!a||(a.target&&a.target!=='_self')||a.hasAttribute('download'))return;
  const url=new URL(a.href,location.href);if(!compatible(url))return;
  if(url.hash&&url.href.split('#')[0]===location.href.split('#')[0])return;
  event.preventDefault();load(url,true);
 },true);
 document.addEventListener('submit',event=>{
  const form=event.target;if(!form.matches('form.blog-search')||form.method.toLowerCase()!=='get')return;
  const url=new URL(form.action,location.href);if(url.origin!==location.origin)return;
  const q=new FormData(form).get('q');if(!String(q||'').trim()){event.preventDefault();return;}
  url.searchParams.set('q',q);event.preventDefault();load(url,true);
 });
 window.addEventListener('popstate',()=>load(new URL(location.href),false));
 window.PassportPersistNav=Object.freeze({owns:()=>false,go:href=>load(new URL(href,location.href),true),home:()=>load(new URL('/',location.href),true),isAway:()=>!!current,isCompat:href=>compatible(new URL(href,location.href))});
 if(window.PassportInitialEditorial){const initial=window.PassportInitialEditorial;delete window.PassportInitialEditorial;cache.set(originalURL,initial);render(initial,new URL(originalURL),++serial).catch(e=>console.error(e));}
 else if(home(new URL(originalURL)))cache.set(originalURL,document.cloneNode(true));
})();

