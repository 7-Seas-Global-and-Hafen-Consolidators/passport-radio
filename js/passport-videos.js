/* Page-local video catalogue. Uses the existing Bus/continuity; never changes radio engines. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const search=$('videos-search'), collection=$('videos-collection'), type=$('videos-type');
  const grid=$('videos-grid'), pagination=$('videos-pagination'), status=$('videos-status');
  const section=$('videos-player-section'), title=$('videos-player-title'), mount=$('videos-player-mount');
  const start=$('videos-start'), playerStatus=$('videos-player-status');
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
    grid.replaceChildren();pagination.replaceChildren();status.textContent=items.length?'':'Nenhum resultado.';
    for(const v of items.slice((page-1)*SIZE,page*SIZE)){
      const button=document.createElement('button');button.type='button';button.className='videos-card';
      const artist=document.createElement('strong');artist.textContent=v.artist;button.append(artist);
      if(v.showDate){const time=document.createElement('time');time.dateTime=v.showDate;time.textContent=dateText(v);button.append(time);}
      button.addEventListener('click',()=>select(v));grid.append(button);
    }
    function control(label,target,disabled=false){const b=document.createElement('button');b.type='button';b.textContent=label;b.disabled=disabled;if(target===page&&/^\d+$/.test(label))b.setAttribute('aria-current','page');b.addEventListener('click',()=>{page=target;render(true);});pagination.append(b);}
    if(total>1){control('← ANTERIOR',page-1,page===1);const pages=new Set([1,total]);for(let n=Math.max(1,page-2);n<=Math.min(total,page+2);n++)pages.add(n);let last=0;for(const n of [...pages].sort((a,b)=>a-b)){if(last&&n>last+1){const gap=document.createElement('span');gap.textContent='…';pagination.append(gap);}control(String(n),n);last=n;}control('PRÓXIMA →',page+1,page===total);}
    if(scroll)grid.scrollIntoView({block:'start',behavior:'auto'});
  }
  let apiPromise;
  function api(){if(window.YT?.Player)return Promise.resolve(window.YT);if(apiPromise)return apiPromise;apiPromise=new Promise((resolve,reject)=>{const old=window.onYouTubeIframeAPIReady;window.onYouTubeIframeAPIReady=()=>{try{old?.();}finally{resolve(window.YT);}};let script=document.querySelector('script[src="https://www.youtube.com/iframe_api"]');if(!script){script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.onerror=()=>reject(Error('player'));document.head.append(script);}setTimeout(()=>{if(window.YT?.Player)resolve(window.YT);else reject(Error('timeout'));},20000);});return apiPromise;}
  function close(){generation++;player?.destroy?.();player=null;current=null;owned=false;revoked=false;mount.replaceChildren();section.hidden=true;}
  async function select(v){
    const token=++generation;player?.destroy?.();player=null;current=v;owned=false;revoked=false;mount.replaceChildren();section.hidden=false;start.disabled=true;
    title.textContent=v.artist+(dateText(v)?' · '+dateText(v):'');playerStatus.textContent='';
    section.scrollIntoView({block:'start',behavior:'auto'});
    if(!v.embedAllowed){playerStatus.textContent='Este vídeo não permite reprodução incorporada.';return;}
    playerStatus.textContent='Carregando reprodução…';
    try{
      const YT=await api();if(token!==generation)return;
      const frame=document.createElement('iframe');frame.title=v.artist;frame.allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';
      frame.src='https://www.youtube-nocookie.com/embed/'+v.id+'?enablejsapi=1&autoplay=0&playsinline=1&origin='+encodeURIComponent(location.origin);mount.append(frame);
      player=new YT.Player(frame,{events:{onReady(){if(token!==generation)return;start.disabled=false;playerStatus.textContent='';},onStateChange(event){if(token!==generation)return;if(event.data===1){if(revoked){event.target.pauseVideo();return;}if(!owned){claim();event.target.playVideo();}}},onError(){if(token!==generation)return;start.disabled=true;playerStatus.textContent='Vídeo indisponível para reprodução incorporada.';}}});
    }catch(_){if(token===generation)playerStatus.textContent='Não foi possível carregar a reprodução. Recarregue a página para tentar novamente.';}
  }
  start.addEventListener('click',()=>{if(!player)return;claim();player.playVideo();});
  $('videos-close').addEventListener('click',close);
  for(const [el,event] of [[search,'input'],[collection,'change'],[type,'change']])el.addEventListener(event,()=>{page=1;render();});
  window.addEventListener('passport:audio-state',event=>{register();if(event.detail?.playing&&owned)peer.PassportBus.silence();});
  window.addEventListener('pagehide',()=>{bus?.unregister(peer);player?.destroy?.();});
  register();
  fetch('/data/passport-videos.json').then(r=>{if(!r.ok)throw Error('catalogue');return r.json();}).then(data=>{
    catalogue=data.videos;for(const c of data.collections){const option=document.createElement('option');option.value=c.id;option.textContent=c.label;collection.append(option);}render();
  }).catch(()=>{status.textContent='Não foi possível carregar o catálogo. Recarregue a página para tentar novamente.';});
})();
