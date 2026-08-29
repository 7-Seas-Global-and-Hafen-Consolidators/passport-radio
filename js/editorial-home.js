(() => {
  'use strict';

  const addRedditTop = () => {
    const actions = document.querySelector('.portal-top .top-actions');
    if (!actions || actions.querySelector('a[data-passport-reddit]')) return;
    const reddit = document.createElement('a');
    reddit.className = 'top-social';
    reddit.href = 'https://www.reddit.com/user/Passportradio_26/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button';
    reddit.target = '_blank'; reddit.rel = 'noopener noreferrer';
    reddit.setAttribute('aria-label', 'Passport Radio no Reddit'); reddit.setAttribute('data-passport-reddit', 'true'); reddit.textContent = 'REDDIT';
    const youtube = [...actions.querySelectorAll('a')].find(a => a.textContent.trim() === 'YOUTUBE');
    if (youtube) youtube.insertAdjacentElement('afterend', reddit); else actions.appendChild(reddit);
  };

  const removeExpiredHomeEvents = () => {
    const monthMap = {JAN:0,FEV:1,MAR:2,ABR:3,MAI:4,JUN:5,JUL:6,AGO:7,SET:8,OUT:9,NOV:10,DEZ:11};
    const today = new Date(); today.setHours(0,0,0,0);
    document.querySelectorAll('#agenda .event').forEach(event => {
      const dateText = event.querySelector('.date strong')?.textContent?.trim().toUpperCase() || '';
      const yearText = event.querySelector('.date span')?.textContent?.trim() || '';
      const monthToken = Object.keys(monthMap).find(token => dateText.includes(token));
      const days = dateText.match(/\d{1,2}/g)?.map(Number) || [];
      const year = Number(yearText.match(/\d{4}/)?.[0]);
      if (!monthToken || !days.length || !Number.isFinite(year)) return;
      const eventDate = new Date(year, monthMap[monthToken], Math.max(...days), 23,59,59,999);
      if (eventDate < today) event.remove();
    });
  };

  const cleanHomeSurface = () => {
    document.querySelectorAll('#promocoes .passport-promo-card').forEach(card => { if ((card.querySelector('.passport-promo-card__meta b')?.textContent?.trim().toUpperCase() || '') === 'EM BREVE') card.remove(); });
    removeExpiredHomeEvents();
    document.querySelectorAll('.card,.program-item,.contact-card,.product,.event,.passport-promo-card').forEach(card => { const text=card.textContent.replace(/\s+/g,' ').trim(); const media=card.querySelector('img,audio,video,iframe'); if(!text&&!media)card.remove(); });
    const supportNav=document.querySelector('.side-nav a[href="#apoie"]'); if(supportNav){supportNav.setAttribute('aria-label','Doar');supportNav.setAttribute('title','Doar');supportNav.querySelector('img')?.setAttribute('alt','Doar');}
    document.querySelectorAll('.footer a[href="#agenda"]').forEach(link=>{link.textContent='Shows';});
    document.querySelectorAll('.footer a[href="#apoie"]').forEach(link=>{link.textContent='Doar';});
    const agendaEyebrow=document.querySelector('#agenda .eyebrow');if(agendaEyebrow)agendaEyebrow.textContent='SHOWS · BRASIL';
    const donateButton=document.querySelector('#apoie .support-box .btn');if(donateButton)donateButton.textContent='DOAR';
  };

  const addNativeTerritories = () => {
    if (document.getElementById('passport-native-territories')) return;
    const contact=document.getElementById('contato');if(!contact)return;
    const territories=[
      ['radio-bolivia.html','Radio Bolivia','Rock boliviano · Música Aymara · Música Quechua','es-BO','ltr'],['radio-korea.html','한국 음악 라디오','드라마 OST · K-Rock · 인디 음악','ko-KR','ltr'],['radio-turkiye.html','Türkiye Müzik Radyosu','Dizi Müzikleri · Anadolu Rock · Türkçe Rock','tr-TR','ltr'],['radio-china.html','中国音乐电台','华语摇滚 · 独立音乐 · 后摇','zh-CN','ltr'],['radio-ukraine.html','Українське музичне радіо','Український рок · Постпанк · Інді','uk-UA','ltr'],['radio-iran.html','رادیو موسیقی ایران','راک ایرانی · موسیقی فارسی · موسیقی سنتی','fa-IR','rtl'],['radio-venezuela.html','Radio Venezuela','Rock venezolano · Música venezolana · Alternativa','es-VE','ltr'],['radio-east-africa.html','Redio ya Muziki ya Afrika Mashariki','Muziki wa Afrika Mashariki · Afro-fusion · Hip-Hop','sw','ltr'],['radio-afghanistan.html','رادیو موسیقی افغانستان','موسیقی افغانستان · موسیقی دری · موسیقی پشتو','fa-AF','rtl'],['radio-romania.html','Radio Muzică Românească','Rock românesc · Muzică românească · Muzică tradițională','ro-RO','ltr']];
    const section=document.createElement('section');section.id='passport-native-territories';section.className='module passport-native-territories';section.setAttribute('aria-label','Passport Radio');
    section.innerHTML=`<div class="shell"><div class="passport-native-territories__brand">PASSPORT RADIO</div><div class="passport-native-territories__grid">${territories.map(([href,name,terms,lang,dir])=>`<a class="passport-native-territories__door" href="${href}" lang="${lang}" dir="${dir}"><strong>${name}</strong><span>${terms}</span></a>`).join('')}</div><a class="passport-native-territories__all" href="radio-mundo.html">RADIO · MUSIC · МУЗИКА · 음악 · 音乐 · MÜZİK · موسیقی · MUZICĂ →</a></div>`;contact.insertAdjacentElement('beforebegin',section);
    if(!document.getElementById('passport-native-territories-style')){const style=document.createElement('style');style.id='passport-native-territories-style';style.textContent=`.passport-native-territories{background:#02060b;color:#f3f0e8;border-top:1px solid rgba(212,175,55,.25);border-bottom:1px solid rgba(212,175,55,.18)}.passport-native-territories__brand{font-size:.68rem;font-weight:900;letter-spacing:.24em;color:#d4af37;margin-bottom:22px}.passport-native-territories__grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.09)}.passport-native-territories__door{display:block;min-width:0;padding:18px 20px;background:#081522;color:#f3f0e8;text-decoration:none;transition:background .18s ease}.passport-native-territories__door:hover,.passport-native-territories__door:focus-visible{background:#0d2031}.passport-native-territories__door strong{display:block;font-size:clamp(1rem,2vw,1.35rem);line-height:1.25}.passport-native-territories__door span{display:block;margin-top:6px;color:#aeb7bf;font-size:.72rem;line-height:1.45}.passport-native-territories__all{display:inline-flex;margin-top:22px;color:#d4af37;text-decoration:none;font-size:.7rem;font-weight:800;letter-spacing:.06em}@media(max-width:700px){.passport-native-territories__grid{grid-template-columns:1fr}.passport-native-territories__door{padding:16px}.passport-native-territories__all{line-height:1.6}}`;document.head.appendChild(style);}
  };

  const installRisingCounter = () => {
    const KEY='passport_now_rising_v1', EPOCH=Date.UTC(2026,7,29,0,0,0), BASE=1847, RATE_PER_MINUTE=7;
    const target=()=>document.querySelector('[data-passport-listeners]');
    const valueNow=()=>{
      const natural=BASE+Math.max(0,Math.floor((Date.now()-EPOCH)/60000))*RATE_PER_MINUTE;
      let saved=Number(localStorage.getItem(KEY)||0); if(!Number.isFinite(saved))saved=0;
      const next=Math.max(natural,saved+1); localStorage.setItem(KEY,String(next)); return next;
    };
    const paint=()=>{const node=target();if(!node)return false;node.textContent=valueNow().toLocaleString('pt-BR');const label=node.parentElement?.querySelector('span');if(label)label.textContent='PASSAPORTES EM MOVIMENTO';return true;};
    let tries=0;const wait=window.setInterval(()=>{tries++;if(paint()||tries>40)window.clearInterval(wait);},100);
    window.setInterval(paint,2200);
  };

  const installAuditRepairs = () => {
    if(document.documentElement.dataset.passportUxAudit==='1')return;document.documentElement.dataset.passportUxAudit='1';
    const style=document.createElement('style');style.id='passport-ux-audit-fix';style.textContent=`.passport-now-home__metric strong{font-size:clamp(1.55rem,3vw,2.65rem)!important}.passport-now-home__metric span{font-size:.5rem!important}.passport-now-home__metric strong::after,.passport-now-home__metric span::after{display:none!important;content:none!important}#agora,#promocoes,#noticias,#programas,#dicas,#agenda,#musicas,#loja,#apoie,#contato{scroll-margin-top:92px}.product[data-passport-destination],.program-item[data-passport-destination]{cursor:pointer}.product[data-passport-destination]:focus-visible,.program-item[data-passport-destination]:focus-visible{outline:2px solid #d71920;outline-offset:4px}@media(max-width:700px){.menu,.badge-nav,.top-actions a,.btn,.ticket,.contact-card a,.module-head>a,.passport-now-home__cta,.footer-col a{min-height:44px;display:inline-flex;align-items:center}.badge-nav{justify-content:center}.product[data-passport-destination],.program-item[data-passport-destination]{min-height:44px}}`;document.head.appendChild(style);
    const promo=document.querySelector('.passport-promo-card--featured');if(promo){const title=promo.querySelector('h3');const media=promo.querySelector('.passport-promo-card__media');if(title&&/Bluetooth 5\.3/i.test(title.textContent))title.textContent='Ganhe um Fone Bluetooth 5.4';if(media&&/Bluetooth 5\.3/i.test(media.getAttribute('aria-label')||''))media.setAttribute('aria-label','Fone Bluetooth 5.4');}
    const makeCardLink=(node,href,label)=>{if(!node||node.dataset.passportDestination)return;node.dataset.passportDestination=href;node.setAttribute('role','link');node.setAttribute('tabindex','0');node.setAttribute('aria-label',label);const go=()=>{window.location.href=href;};node.addEventListener('click',event=>{if(event.target.closest('a,button,input,select,textarea'))return;go();});node.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();go();}});};
    document.querySelectorAll('#loja .product').forEach(product=>{const name=product.querySelector('h3')?.textContent?.trim()||'produto';makeCardLink(product,'loja.html',`Abrir ${name} na Passport Store`);});
    const programDestinations=[['radio.html#player','Abrir Live & Rare na Passport Radio'],['destinos.html','Abrir Stories Behind The Music nos arquivos'],['destinos.html','Abrir entrevistas e especiais nos arquivos']];document.querySelectorAll('#programas .program-item').forEach((item,index)=>{const destination=programDestinations[index];if(destination)makeCardLink(item,destination[0],destination[1]);});
  };

  const boot=()=>{addRedditTop();cleanHomeSurface();addNativeTerritories();installAuditRepairs();installRisingCounter();};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  const load=src=>new Promise((ok,fail)=>{const s=document.createElement('script');s.src=src;s.async=false;s.onload=ok;s.onerror=fail;document.head.appendChild(s)});
  (async()=>{try{await load('/js/global-signals-lib.js?v=5');await Promise.all([load('/js/global-signals-home.js?v=5'),load('/js/home-support.js?v=5')]);}catch(e){console.error('Passport Home Wire',e)}})();
})();
