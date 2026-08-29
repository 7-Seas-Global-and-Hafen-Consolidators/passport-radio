(()=>{
'use strict';
const stations=[
{id:'bo',name:'Radio Bolivia',terms:'Rock boliviano · Música Aymara · Música Quechua',lang:'es-BO',dir:'ltr',page:'/radio-bolivia.html',stream:''},
{id:'kr',name:'한국 음악 라디오',terms:'드라마 OST · K-Rock · 인디 음악',lang:'ko-KR',dir:'ltr',page:'/radio-korea.html',stream:''},
{id:'tr',name:'Türkiye Müzik Radyosu',terms:'Dizi Müzikleri · Anadolu Rock · Türkçe Rock',lang:'tr-TR',dir:'ltr',page:'/radio-turkiye.html',stream:''},
{id:'cn',name:'中国音乐电台',terms:'华语摇滚 · 独立音乐 · 后摇',lang:'zh-CN',dir:'ltr',page:'/radio-china.html',stream:''},
{id:'ua',name:'Українське музичне радіо',terms:'Український рок · Постпанк · Інді',lang:'uk-UA',dir:'ltr',page:'/radio-ukraine.html',stream:''},
{id:'ir',name:'رادیو موسیقی ایران',terms:'راک ایرانی · موسیقی فارسی · موسیقی سنتی',lang:'fa-IR',dir:'rtl',page:'/radio-iran.html',stream:''},
{id:'ve',name:'Radio Venezuela',terms:'Rock venezolano · Música venezolana · Alternativa',lang:'es-VE',dir:'ltr',page:'/radio-venezuela.html',stream:''},
{id:'ea',name:'Redio ya Muziki ya Afrika Mashariki',terms:'Muziki wa Afrika Mashariki · Afro-fusion · Hip-Hop',lang:'sw',dir:'ltr',page:'/radio-east-africa.html',stream:''},
{id:'af',name:'رادیو موسیقی افغانستان',terms:'موسیقی افغانستان · موسیقی دری · موسیقی پشتو',lang:'fa-AF',dir:'rtl',page:'/radio-afghanistan.html',stream:''},
{id:'ro',name:'Radio Muzică Românească',terms:'Rock românesc · Muzică românească · Muzică tradițională',lang:'ro-RO',dir:'ltr',page:'/radio-romania.html',stream:''}
];
const $=s=>document.querySelector(s),list=$('#world-stations'),audio=$('#world-audio'),play=$('#world-play'),stop=$('#world-stop'),name=$('#world-name'),desc=$('#world-description'),status=$('#world-status'),territory=$('#world-territory'),lang=$('#world-lang');
let current=null;
const select=s=>{current=s;document.querySelectorAll('.station').forEach(x=>x.classList.toggle('is-active',x.dataset.id===s.id));name.textContent=s.name;name.lang=s.lang;name.dir=s.dir;desc.textContent=s.terms;desc.lang=s.lang;desc.dir=s.dir;lang.textContent=s.terms;lang.lang=s.lang;lang.dir=s.dir;territory.href=s.page;territory.textContent=s.name+' →';territory.lang=s.lang;territory.dir=s.dir;audio.pause();audio.removeAttribute('src');audio.load();if(s.stream){audio.src=s.stream;play.disabled=false;stop.disabled=false;status.textContent='PRONTO PARA TOCAR'}else{play.disabled=true;stop.disabled=true;status.textContent='STREAM EM VALIDAÇÃO · TERRITÓRIO ATIVO'}};
stations.forEach(s=>{const b=document.createElement('button');b.type='button';b.className='station';b.dataset.id=s.id;b.lang=s.lang;b.dir=s.dir;b.innerHTML=`<strong></strong><span></span>`;b.querySelector('strong').textContent=s.name;b.querySelector('span').textContent=s.terms;b.addEventListener('click',()=>select(s));list.appendChild(b)});
play.addEventListener('click',async()=>{if(!current?.stream)return;try{await audio.play();status.textContent='NO AR · '+current.name;play.textContent='❚❚ PAUSE'}catch{status.textContent='SINAL INDISPONÍVEL';}});
play.addEventListener('click',()=>{if(!audio.paused){audio.pause();play.textContent='▶ PLAY';status.textContent='PAUSADO · '+current.name}});
stop.addEventListener('click',()=>{audio.pause();audio.currentTime=0;play.textContent='▶ PLAY';status.textContent='PRONTO PARA TOCAR'});
audio.addEventListener('playing',()=>{play.textContent='❚❚ PAUSE'});audio.addEventListener('error',()=>{status.textContent='SINAL INDISPONÍVEL'});
const requested=new URLSearchParams(location.search).get('station');select(stations.find(s=>s.id===requested)||stations[0]);
})();