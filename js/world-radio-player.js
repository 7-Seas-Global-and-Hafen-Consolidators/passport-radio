(()=>{
'use strict';
const stations=[
{id:'bo',name:'Radio Bolivia',source:'Radio San Gabriel 98.2 FM',terms:'Aymara · Español · Música Andina · Noticias · Cultura',lang:'ay-BO',dir:'ltr',page:'/radio-bolivia.html',stream:'https://spanel.gcomstreaming.com:7004/;'},
{id:'kr',name:'한국 음악 라디오',source:'Big B Radio · Kpop',terms:'K-Pop · 한국 음악 · Pop',lang:'ko-KR',dir:'ltr',page:'/radio-korea.html',stream:'https://antares.dribbcast.com/proxy/kpop?mp=/s'},
{id:'tr',name:'Türkiye Müzik Radyosu',source:'Türk Rock FM',terms:'Türkçe Rock · Rock · Pop',lang:'tr-TR',dir:'ltr',page:'/radio-turkiye.html',stream:'https://yayin5.radyohizmeti.com/8090/stream;'},
{id:'cn',name:'中国音乐电台',source:'怀集音乐之声',terms:'华语音乐 · 独立音乐 · Music',lang:'zh-CN',dir:'ltr',page:'/radio-china.html',stream:'https://lhttp.qingting.fm/live/4804/64k.mp3'},
{id:'ua',name:'Українське музичне радіо',source:'Хіт FM Україна',terms:'Українські хіти · Pop · Rock · International Hits',lang:'uk-UA',dir:'ltr',page:'/radio-ukraine.html',stream:'https://tavr.tvstitch.com/HitFM?.mp3'},
{id:'ir',name:'رادیو موسیقی ایران',source:'Radio AvazFarsi',terms:'موسیقی فارسی · پاپ ایرانی · Persian Music',lang:'fa-IR',dir:'rtl',page:'/radio-iran.html',stream:'https://radio.avazfarsi.com:8000/radio.mp3'},
{id:'ve',name:'Radio Venezuela',source:'La Mega 107.3 FM · Caracas',terms:'Pop · Rock · Alternativa · Urbano · Música venezolana · Internacional',lang:'es-VE',dir:'ltr',page:'/radio-venezuela.html',stream:'https://acp4.lorini.net:2050/stream'},
{id:'ea',name:'Redio ya Muziki ya Afrika Mashariki',source:'NRG Radio Kenya',terms:'Muziki wa Afrika Mashariki · Pop · Hip-Hop',lang:'sw',dir:'ltr',page:'/radio-east-africa.html',stream:'https://streamingv2.shoutcast.com/nrg-radio-ke'},
{id:'pk',name:'پاکستانی موسیقی ریڈیو',source:'CityFM89',terms:'پاکستانی موسیقی · پاپ · راک · انڈی · صوفی موسیقی',lang:'ur-PK',dir:'rtl',page:'/radio-mundo-player.html?station=pk',stream:'https://radio.cityfm89.com/stream'},
{id:'ro',name:'Radio Muzică Românească',source:'Rock FM România',terms:'Rock românesc · Rock · Metal',lang:'ro-RO',dir:'ltr',page:'/radio-romania.html',stream:'https://live.rockfm.ro/rockfm.aacp'},
{id:'fi',name:'Suomalainen rockradio',source:'Radio Rock Finland',terms:'Suomirock · Heavy metal · Power metal · Sinfoninen metalli',lang:'fi-FI',dir:'ltr',page:'/radio-mundo-player.html?station=fi',stream:'https://aud-stream-radiorock.nm-elemental.nelonenmedia.fi/playlist.m3u8'},
{id:'jp',name:'日本の音楽ラジオ',source:'TOKYO FM 80.0 · 東京',terms:'J-POP · J-ROCK · 音楽 · エンタメ · カルチャー',lang:'ja-JP',dir:'ltr',page:'/radio-mundo-player.html?station=jp',embed:'https://www.tfm.co.jp/radikoplayer/'},
{id:'cz',name:'České rockové rádio',source:'HEY Radio · Česká republika',terms:'Rock · Hard rock · Metal · Dark WAVE · Gothic · Post-punk',lang:'cs-CZ',dir:'ltr',page:'/radio-mundo-player.html?station=cz',stream:'https://icecast3.play.cz/hey-radio128.mp3'}
];
const $=s=>document.querySelector(s),list=$('#world-stations'),audio=$('#world-audio'),play=$('#world-play'),stop=$('#world-stop'),controls=$('#world-controls'),embed=$('#world-embed'),name=$('#world-name'),desc=$('#world-description'),status=$('#world-status'),territory=$('#world-territory'),lang=$('#world-lang');
let current=null,hls=null,hlsLoader=null;
const HLS_MIME='application/vnd.apple.mpegurl';
const HLS_CDN='https://cdn.jsdelivr.net/npm/hls.js@1.7.0/dist/hls.min.js';
const isHls=s=>/\.m3u8(?:$|[?#])/i.test((s&&s.stream)||'');
const nativeHls=()=>!!audio.canPlayType(HLS_MIME);
const readyText=s=>s.source?`FONTE · ${s.source}`:'PRONTO PARA TOCAR';
const clearEmbed=()=>{embed.hidden=true;embed.replaceChildren()};
const destroyHls=()=>{if(hls){hls.destroy();hls=null}};
const loadHls=()=>{
  if(window.Hls)return Promise.resolve(window.Hls);
  if(hlsLoader)return hlsLoader;
  hlsLoader=new Promise((resolve,reject)=>{
    const script=document.createElement('script');
    script.src=HLS_CDN;
    script.async=true;
    script.crossOrigin='anonymous';
    script.onload=()=>window.Hls?resolve(window.Hls):reject(new Error('HLS library unavailable'));
    script.onerror=()=>reject(new Error('HLS library failed to load'));
    document.head.appendChild(script);
  }).catch(error=>{hlsLoader=null;throw error});
  return hlsLoader;
};
const prepareHls=async s=>{
  if(nativeHls()){
    audio.src=s.stream;
    return;
  }
  const Hls=await loadHls();
  if(!Hls.isSupported())throw new Error('HLS unsupported');
  destroyHls();
  await new Promise((resolve,reject)=>{
    const instance=new Hls({enableWorker:true});
    hls=instance;
    let settled=false;
    const finish=(fn,value)=>{if(settled)return;settled=true;fn(value)};
    instance.on(Hls.Events.MEDIA_ATTACHED,()=>instance.loadSource(s.stream));
    instance.on(Hls.Events.MANIFEST_PARSED,()=>finish(resolve));
    instance.on(Hls.Events.ERROR,(_event,data)=>{
      if(data&&data.fatal){
        destroyHls();
        finish(reject,new Error(data.details||'HLS fatal error'));
      }
    });
    instance.attachMedia(audio);
  });
};
const select=s=>{current=s;document.querySelectorAll('.station').forEach(x=>x.classList.toggle('is-active',x.dataset.id===s.id));name.textContent=s.name;name.lang=s.lang;name.dir=s.dir;desc.textContent=s.terms;desc.lang=s.lang;desc.dir=s.dir;lang.textContent=s.terms;lang.lang=s.lang;lang.dir=s.dir;territory.href=s.page;territory.textContent=s.name+' →';territory.lang=s.lang;territory.dir=s.dir;audio.pause();destroyHls();audio.removeAttribute('src');audio.load();clearEmbed();controls.hidden=false;play.textContent='▶ PLAY';if(s.embed){controls.hidden=true;const frame=document.createElement('iframe');frame.src=s.embed;frame.title=s.source+' · transmissão ao vivo';frame.loading='eager';frame.allow='autoplay';frame.referrerPolicy='strict-origin-when-cross-origin';embed.appendChild(frame);embed.hidden=false;play.disabled=true;stop.disabled=true;status.textContent='AO VIVO NA PASSPORT · '+s.source}else if(s.stream){if(!isHls(s)||nativeHls())audio.src=s.stream;play.disabled=false;stop.disabled=false;status.textContent=readyText(s)}else if(s.external){play.disabled=false;stop.disabled=true;status.textContent=`OUVIR NA FONTE · ${s.source}`}else{play.disabled=true;stop.disabled=true;status.textContent='SINAL INDISPONÍVEL'}};
stations.forEach(s=>{const b=document.createElement('button');b.type='button';b.className='station';b.dataset.id=s.id;b.lang=s.lang;b.dir=s.dir;b.innerHTML=`<strong></strong><span></span>`;b.querySelector('strong').textContent=s.name;b.querySelector('span').textContent=s.source?`${s.source} · ${s.terms}`:s.terms;b.addEventListener('click',()=>select(s));list.appendChild(b)});
play.addEventListener('click',async()=>{if(!current)return;if(!current.stream&&current.external){window.open(current.external,'_blank','noopener');return}if(!current.stream)return;if(!audio.paused){audio.pause();play.textContent='▶ PLAY';status.textContent='PAUSADO · '+current.name;return}try{if(isHls(current)&&!audio.getAttribute('src')&&!hls){status.textContent='CONECTANDO · '+current.source;await prepareHls(current)}await audio.play();status.textContent='NO AR · '+current.source;play.textContent='❚❚ PAUSE'}catch{destroyHls();audio.pause();audio.removeAttribute('src');audio.load();status.textContent='SINAL INDISPONÍVEL · TENTE NOVAMENTE'}});
stop.addEventListener('click',()=>{audio.pause();if(Number.isFinite(audio.duration))audio.currentTime=0;play.textContent='▶ PLAY';status.textContent=current?readyText(current):'PRONTO PARA TOCAR'});
audio.addEventListener('playing',()=>{play.textContent='❚❚ PAUSE'});audio.addEventListener('error',()=>{if(current&&isHls(current)&&!nativeHls()&&!hls)return;status.textContent='SINAL INDISPONÍVEL · TENTE OUTRA ESTAÇÃO'});
const requested=new URLSearchParams(location.search).get('station');select(stations.find(s=>s.id===requested)||stations[0]);
})();