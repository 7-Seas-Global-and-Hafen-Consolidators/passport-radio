/* One controllable TV peer of the existing Passport Bus. No radio engine changes. */
(() => {
  'use strict';
  const SOURCE = 'https://video04.logicahost.com.br/mastervision/mastervision/playlist.m3u8';
  const HLS_LIBRARY = 'https://cdn.jsdelivr.net/npm/hls.js@1.7.0/dist/hls.min.js';
  let owned = false, bus, hls, pending, generation = 0, gesture = 0;
  const section = document.createElement('section'); section.id = 'passport-clips-tv'; section.setAttribute('aria-labelledby','passport-clips-title');
  const heading = document.createElement('h2'); heading.id = 'passport-clips-title'; heading.textContent = 'Passport Clips TV™';
  const intro = document.createElement('p'); intro.textContent = 'Primeiro a história. Depois a música. Sua primeira TV da Passport.';
  const video = document.createElement('video'); video.controls = true; video.playsInline = true; video.preload = 'none'; video.crossOrigin = 'anonymous'; video.setAttribute('aria-label','Passport Clips TV™ — transmissão ao vivo');
  const start = document.createElement('button'); start.type = 'button'; start.textContent = 'ASSISTIR À PASSPORT CLIPS TV™';
  const status = document.createElement('p'); status.setAttribute('role','status'); status.setAttribute('aria-live','polite'); status.textContent = 'A reprodução começa somente quando você escolher assistir.';
  section.append(heading,intro,video,start,status);
  const main = document.querySelector('main'); if (!main) return; main.prepend(section);
  const peer = {PassportBus:{enable(){owned=true;},silence(){owned=false;generation++;video.pause();}}};
  function register(){if(window.PassportBus && bus!==window.PassportBus){bus=window.PassportBus;bus.register(peer);}}
  function claim(){register();if(!bus)throw Error('bus');window.PassportContinuity?.pause();bus.claim(peer);owned=true;}
  function library(){
    if(window.Hls)return Promise.resolve(window.Hls);
    return new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=HLS_LIBRARY;script.crossOrigin='anonymous';script.onload=()=>window.Hls?resolve(window.Hls):reject(Error('library'));script.onerror=()=>reject(Error('library'));document.head.append(script);});
  }
  function prepare(){
    if(video.getAttribute('src') || hls)return Promise.resolve();
    if(pending)return pending;
    pending=(async()=>{
      if(video.canPlayType('application/vnd.apple.mpegurl')){video.src=SOURCE;return;}
      const Hls=await library();if(!Hls.isSupported())throw Error('unsupported');
      await new Promise((resolve,reject)=>{const instance=new Hls({enableWorker:true});hls=instance;
        instance.on(Hls.Events.MEDIA_ATTACHED,()=>instance.loadSource(SOURCE));
        instance.on(Hls.Events.MANIFEST_PARSED,resolve);
        instance.on(Hls.Events.ERROR,(_event,data)=>{if(data.fatal){instance.destroy();if(hls===instance)hls=null;reject(Error('signal'));video.pause();status.textContent='Não foi possível reproduzir a TV neste navegador. Tente novamente.';}});
        instance.attachMedia(video);
      });
    })().finally(()=>{pending=null;});return pending;
  }
  start.addEventListener('click',async event=>{
    if(!event.isTrusted || start.disabled)return;
    gesture=Date.now();const ticket=++generation;start.disabled=true;
    try{claim();status.textContent='Conectando a Passport Clips TV™…';await prepare();if(ticket!==generation||!owned)return;await video.play();}
    catch(_){video.pause();status.textContent='Não foi possível reproduzir a TV neste navegador. Tente novamente.';}
    finally{start.disabled=false;}
  });
  for(const event of ['pointerdown','keydown'])video.addEventListener(event,e=>{if(e.isTrusted)gesture=Date.now();});
  video.addEventListener('play',()=>{if(!owned){if(Date.now()-gesture>2000){video.pause();return;}try{claim();}catch(_){video.pause();}}});
  video.addEventListener('playing',()=>{if(!owned){video.pause();return;}status.textContent='Passport Clips TV™ · AO VIVO';start.textContent='RETOMAR PASSPORT CLIPS TV™';});
  video.addEventListener('pause',()=>{if(video.currentTime>0)status.textContent='Passport Clips TV™ · pausada';});
  video.addEventListener('error',()=>{status.textContent='Não foi possível reproduzir a TV neste navegador. Tente novamente.';});
  window.addEventListener('passport:audio-state',event=>{register();if(event.detail?.playing&&owned)peer.PassportBus.silence();});
  window.addEventListener('pagehide',()=>{peer.PassportBus.silence();hls?.destroy();bus?.unregister(peer);});
  register();
})();
