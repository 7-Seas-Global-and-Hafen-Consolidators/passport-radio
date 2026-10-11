/* One controllable TV peer of the existing Passport Bus. No radio engine changes. */
(() => {
  'use strict';
  const section = document.getElementById('passport-clips-tv');
  if (!section) return;
  const HLS_LIBRARY = 'https://cdn.jsdelivr.net/npm/hls.js@1.7.0/dist/hls.min.js';
  const video = document.getElementById('passport-clips-video');
  const heading = document.getElementById('passport-clips-title');
  const start = document.getElementById('passport-clips-start');
  const status = document.getElementById('passport-clips-status');
  const grid = document.getElementById('passport-clips-channels');
  video.crossOrigin = 'anonymous';
  let channels = [], selected, owned = false, bus, hls, generation = 0, gesture = 0;
  let libraryPromise, preparing, cancelPrepare, loadTimer;
  const unavailable = () => {
    status.textContent = 'Este canal está indisponível neste momento. Tente novamente ou escolha outra TV.';
    start.textContent = 'TENTAR NOVAMENTE';
  };
  const peer = {PassportBus:{
    enable(){owned=true;},
    silence(){owned=false;release();}
  }};
  function register(){if(window.PassportBus && bus!==window.PassportBus){bus=window.PassportBus;bus.register(peer);}}
  function claim(){register();if(!bus)throw Error('bus');window.PassportContinuity?.pause();bus.claim(peer);owned=true;}
  function release(){
    generation++;cancelPrepare?.();cancelPrepare=null;clearTimeout(loadTimer);
    video.pause();hls?.destroy();hls=null;preparing=null;
    video.removeAttribute('src');video.load();start.disabled=!selected;
  }
  function library(){
    if(window.Hls)return Promise.resolve(window.Hls);
    if(libraryPromise)return libraryPromise;
    libraryPromise=new Promise((resolve,reject)=>{
      const script=document.createElement('script');script.src=HLS_LIBRARY;script.crossOrigin='anonymous';
      const timeout=setTimeout(()=>{script.remove();reject(Error('library'));},15000);
      script.onload=()=>{clearTimeout(timeout);window.Hls?resolve(window.Hls):reject(Error('library'));};
      script.onerror=()=>{clearTimeout(timeout);script.remove();reject(Error('library'));};document.head.append(script);
    }).catch(error=>{libraryPromise=null;throw error;});return libraryPromise;
  }
  async function prepare(ticket){
    if(video.getAttribute('src') || hls)return;
    if(preparing)return preparing;
    const source=selected.stream;
    preparing=(async()=>{
      if(video.canPlayType('application/vnd.apple.mpegurl')){
        if(ticket!==generation)throw Error('cancelled');video.src=source;return;
      }
      const Hls=await library();if(ticket!==generation)throw Error('cancelled');
      if(!Hls.isSupported())throw Error('unsupported');
      await new Promise((resolve,reject)=>{
        const instance=new Hls({enableWorker:true});hls=instance;
        const done=error=>{clearTimeout(timeout);if(cancelPrepare===cancel)cancelPrepare=null;error?reject(error):resolve();};
        const cancel=()=>done(Error('cancelled'));cancelPrepare=cancel;
        const timeout=setTimeout(()=>done(Error('timeout')),20000);
        instance.on(Hls.Events.MEDIA_ATTACHED,()=>instance.loadSource(source));
        instance.on(Hls.Events.MANIFEST_PARSED,()=>done());
        instance.on(Hls.Events.ERROR,(_event,data)=>{
          if(!data.fatal || hls!==instance)return;
          done(Error('signal'));instance.destroy();hls=null;video.pause();
          if(ticket===generation){owned=false;start.disabled=false;unavailable();}
        });
        instance.attachMedia(video);
      });
    })();
    try{await preparing;}finally{if(ticket===generation)preparing=null;}
  }
  async function play(){
    gesture=Date.now();const ticket=++generation;start.disabled=true;
    try{
      claim();status.textContent='Conectando '+selected.name+'…';
      loadTimer=setTimeout(()=>{if(ticket!==generation)return;release();owned=false;unavailable();},25000);
      await prepare(ticket);if(ticket!==generation||!owned)return;await video.play();
    }catch(_){if(ticket===generation){release();owned=false;unavailable();}}
    finally{if(ticket===generation)start.disabled=false;}
  }
  function choose(channel,playNow=false){
    if(selected?.id!==channel.id){release();owned=false;selected=channel;}
    heading.textContent=channel.name;video.setAttribute('aria-label',channel.name+' — transmissão ao vivo');
    start.textContent='ASSISTIR À '+channel.name.toLocaleUpperCase('pt-BR');start.disabled=false;
    for(const button of grid.querySelectorAll('button'))button.setAttribute('aria-pressed',String(button.dataset.channelId===channel.id));
    status.textContent='A reprodução começa somente quando você escolher assistir.';
    if(playNow)play();
  }
  start.addEventListener('click',event=>{if(event.isTrusted && selected && !start.disabled)play();});
  for(const event of ['pointerdown','keydown'])video.addEventListener(event,e=>{if(e.isTrusted)gesture=Date.now();});
  video.addEventListener('play',()=>{if(!owned){if(Date.now()-gesture>2000){video.pause();return;}try{claim();}catch(_){video.pause();}}});
  video.addEventListener('playing',()=>{
    if(!owned){video.pause();return;}clearTimeout(loadTimer);start.disabled=false;
    status.textContent=selected.name+(selected.live?' · AO VIVO':'');start.textContent='RETOMAR '+selected.name.toLocaleUpperCase('pt-BR');
  });
  video.addEventListener('waiting',()=>{
    if(!owned)return;status.textContent='Reconectando '+selected.name+'…';clearTimeout(loadTimer);
    const ticket=generation;loadTimer=setTimeout(()=>{if(ticket===generation){release();owned=false;unavailable();}},25000);
  });
  video.addEventListener('pause',()=>{clearTimeout(loadTimer);if(video.currentTime>0 && selected && !/indisponível/.test(status.textContent))status.textContent=selected.name+' · pausada';});
  video.addEventListener('error',()=>{if(selected && video.getAttribute('src')){release();owned=false;unavailable();}});
  window.addEventListener('passport:audio-state',event=>{register();if(event.detail?.playing&&owned)peer.PassportBus.silence();});
  window.addEventListener('pagehide',()=>{owned=false;release();bus?.unregister(peer);});
  window.addEventListener('pageshow',()=>{register();bus?.register(peer);});
  register();
  fetch('/data/passport-clips-channels.json').then(response=>{if(!response.ok)throw Error('catalog');return response.json();}).then(data=>{
    channels=data.channels;
    for(const channel of channels){
      const button=document.createElement('button');button.type='button';button.className='clips-channel-card';button.dataset.channelId=channel.id;
      button.setAttribute('aria-pressed','false');
      const type=document.createElement('span');type.className='clips-channel-type';type.textContent='PASSPORT RADIO · TV';
      const name=document.createElement('strong');name.textContent=channel.name;
      const action=document.createElement('span');action.className='clips-channel-action';action.textContent='ASSISTIR →';
      button.append(type,name,action);button.addEventListener('click',event=>{if(event.isTrusted)choose(channel,true);});grid.append(button);
    }
    choose(channels[0]);
  }).catch(()=>{status.textContent='Não foi possível carregar os canais. Recarregue a página para tentar novamente.';});
})();
