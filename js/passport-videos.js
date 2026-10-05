/* Page-local video catalogue. Uses the existing Bus/continuity; never changes radio engines. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const search=$('videos-search'), collection=$('videos-collection'), type=$('videos-type');
  const grid=$('videos-grid'), pagination=$('videos-pagination'), status=$('videos-status');
  const SIZE=24, norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  let catalogue=[], page=1, player=null, current=null, generation=0, bus=null, owned=false, revoked=false;
  // A registered peer of the existing Bus, not another Bus or audio engine.
  const peer={PassportBus:{enable(){owned=true;revoked=false;},silence(){owned=false;revoked=true;player?.pauseVideo?.();}}};
  function register(){if(window.PassportBus&&bus!==window.PassportBus){bus=window.PassportBus;bus.register(peer);}}
  function claim(){register();window.PassportContinuity?.pause();bus?.claim(peer);owned=true;revoked=false;}
  function dateText(v){if(!v.showDate)return '';if(/^\d{4}$/.test(v.showDate))return v.showDate;return v.showDate.split('-').reverse().join('.');}
  const results=()=>catalogue.filter(v=>(!search.value||norm(v.artist).includes(norm(search.value)))&&(!collection.value||v.collections.includes(collection.value))&&(!type.value||v.type===type.value)).sort((a,b)=>collection.value?(a.collectionOrder?.[collection.value]??0)-(b.collectionOrder?.[collection.value]??0):0);
  function render(scroll=false){
    const items=results(), total=Math.ceil(items.length/SIZE); page=Math.max(1,Math.min(page,total||1));
    close();grid.replaceChildren();pagination.replaceChildren();status.textContent=items.length?'':'Nenhum resultado.';
    for(const v of items.slice((page-1)*SIZE,page*SIZE)){
      const card=document.createElement('article');card.className='videos-card';
      const media=document.createElement('div');media.className='videos-media';
      const preview=document.createElement('button');preview.type='button';preview.className='videos-preview';preview.setAttribute('aria-label','Reproduzir '+v.artist+' — '+v.title);
      const img=document.createElement('img');img.src=v.thumbnail;img.alt='';img.loading='lazy';img.decoding='async';img.width=336;img.height=189;
      const play=document.createElement('span');play.className='videos-play';play.textContent='▶';play.setAttribute('aria-hidden','true');preview.append(img,play);media.append(preview);card.append(media);
      const artist=document.createElement('h2');artist.textContent=v.artist;card.append(artist);
      const name=document.createElement('p');name.className='videos-title';name.textContent=v.title;card.append(name);
      if(v.showDate){const time=document.createElement('time');time.dateTime=v.showDate;time.textContent=dateText(v);card.append(time);}
      const message=document.createElement('p');message.className='videos-player-status';message.setAttribute('role','status');card.append(message);
      preview.addEventListener('click',()=>select(v,card,media,preview,message));grid.append(card);
    }
    function control(label,target,disabled=false){const b=document.createElement('button');b.type='button';b.textContent=label;b.disabled=disabled;if(target===page&&/^\d+$/.test(label))b.setAttribute('aria-current','page');b.addEventListener('click',()=>{page=target;render(true);});pagination.append(b);}
    if(total>1){control('← ANTERIOR',page-1,page===1);const pages=new Set([1,total]);for(let n=Math.max(1,page-2);n<=Math.min(total,page+2);n++)pages.add(n);let last=0;for(const n of [...pages].sort((a,b)=>a-b)){if(last&&n>last+1){const gap=document.createElement('span');gap.textContent='…';pagination.append(gap);}control(String(n),n);last=n;}control('PRÓXIMA →',page+1,page===total);}
    if(scroll)grid.scrollIntoView({block:'start',behavior:'auto'});
  }
  let apiPromise;
  function api(){if(window.YT?.Player)return Promise.resolve(window.YT);if(apiPromise)return apiPromise;apiPromise=new Promise((resolve,reject)=>{const old=window.onYouTubeIframeAPIReady;window.onYouTubeIframeAPIReady=()=>{try{old?.();}finally{resolve(window.YT);}};let script=document.querySelector('script[src="https://www.youtube.com/iframe_api"]');if(!script){script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.onerror=()=>reject(Error('player'));document.head.append(script);}setTimeout(()=>{if(window.YT?.Player)resolve(window.YT);else reject(Error('timeout'));},20000);});return apiPromise;}
  let activePreview=null,activeMedia=null,activeActions=null,activeMessage=null;
  function close(){generation++;player?.destroy?.();player=null;current=null;owned=false;revoked=false;if(activePreview&&activeMedia){activePreview.disabled=false;activeMedia.replaceChildren(activePreview);}if(activeMessage)activeMessage.textContent='';activeMessage=null;activeActions?.remove();activeActions=null;activePreview=null;activeMedia=null;}
  async function select(v,card,media,preview,message){
    close();const token=++generation;current=v;activePreview=preview;activeMedia=media;activeMessage=message;
    message.textContent='';
    if(!v.embedAllowed){message.textContent='Este vídeo não permite reprodução incorporada.';return;}
    message.textContent='Carregando reprodução…';preview.disabled=true;
    try{
      const YT=await api();if(token!==generation)return;
      const frame=document.createElement('iframe');frame.title=v.artist+' — '+v.title;frame.allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';
      frame.src='https://www.youtube-nocookie.com/embed/'+v.id+'?enablejsapi=1&autoplay=0&playsinline=1&origin='+encodeURIComponent(location.origin);media.replaceChildren(frame);
      const actions=document.createElement('div');actions.className='videos-card-actions';activeActions=actions;
      const start=document.createElement('button');start.type='button';start.textContent='REPRODUZIR';start.disabled=true;
      const stop=document.createElement('button');stop.type='button';stop.textContent='FECHAR ×';stop.addEventListener('click',()=>{close();message.textContent='';preview.disabled=false;preview.focus();});
      start.addEventListener('click',()=>{if(player){claim();player.playVideo();}});actions.append(start,stop);card.append(actions);
      player=new YT.Player(frame,{events:{onReady(event){if(token!==generation)return;start.disabled=false;preview.disabled=false;message.textContent='';if(!revoked){claim();event.target.playVideo();}},onStateChange(event){if(token!==generation)return;if(event.data===1){if(revoked){event.target.pauseVideo();return;}if(!owned){claim();event.target.playVideo();}}},onError(){if(token!==generation)return;start.disabled=true;preview.disabled=false;message.textContent='Vídeo indisponível para reprodução incorporada.';}}});
    }catch(_){if(token===generation){preview.disabled=false;message.textContent='Não foi possível carregar a reprodução. Recarregue a página para tentar novamente.';}}
  }
  for(const [el,event] of [[search,'input'],[collection,'change'],[type,'change']])el.addEventListener(event,()=>{page=1;render();});
  window.addEventListener('passport:audio-state',event=>{register();if(event.detail?.playing&&owned)peer.PassportBus.silence();});
  window.addEventListener('pagehide',()=>{bus?.unregister(peer);close();});
  register();
  fetch('/data/passport-videos.json').then(r=>{if(!r.ok)throw Error('catalogue');return r.json();}).then(data=>{
    catalogue=data.videos;for(const c of data.collections){const option=document.createElement('option');option.value=c.id;option.textContent=c.label;collection.append(option);}render();
  }).catch(()=>{status.textContent='Não foi possível carregar o catálogo. Recarregue a página para tentar novamente.';});
})();
