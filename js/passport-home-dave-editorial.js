/* One editorial addition to the existing Home rail. No player or runtime changes. */
(() => {
  function mount(){
    const rail=document.querySelector('.pb-rail--right');
    if(!rail)return false;
    if(document.getElementById('pp-dave-editorial'))return true;
    const item=document.createElement('div');item.id='pp-dave-editorial';item.className='pb-thumb';
    const img=document.createElement('img');img.src="/images/editorial/2026-10-07-seven/dave-grohl-acdc-highway-to-hell/1200px-x-630-px-5-1024x538.jpg";img.alt='Dave Grohl + AC/DC';img.width=86;img.height=64;img.style.cssText='width:86px;height:64px;object-fit:contain;flex-shrink:0';
    const copy=document.createElement('div'),tag=document.createElement('span'),title=document.createElement('h4'),link=document.createElement('a');
    tag.className='pb-kicker pb-kicker--red';tag.textContent='DESTAQUE';link.href="/editorial/2026/10/07/dave-grohl-acdc-highway-to-hell.html";link.textContent="Dave Grohl sobe ao palco com AC/DC para tocar “Highway to Hell” — e vira o garoto de 11 anos outra vez";title.append(link);copy.append(tag,title);item.append(img,copy);rail.append(item);return true;
  }
  if(mount())return;
  const observer=new MutationObserver(()=>{if(mount())observer.disconnect();});observer.observe(document.getElementById('root'),{childList:true,subtree:true});
})();
