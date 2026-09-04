(() => {
  const AMAZON_AFFILIATE_SRC = '/js/passport-amazon-affiliate.js?v=202608311800';
  const HOME_EDITORIAL_SRC = '/js/home-editorial-priority.js?v=202608311216';
  const EDITORIAL_ROUTE_SRC = '/js/editorial-route.js?v=202608311405';
  const CONTINUOUS_HOME_SRC = '/js/continuous-signals-home.js?v=202608312145';
  const RECIRCULATION_SRC = '/js/editorial-recirculation.js?v=20260903';
  const RECIRCULATION_CSS = '/css/editorial-recirculation.css?v=20260903';
  const ANOS80_VOL2_MEMORY_SRC = '/js/anos-80-vol2-memoria-extra.js?v=202609031723';
  const FESTA_PLOC_REMIX_SRC = '/js/festa-ploc-party-remix.js?v=2026090401';

  const addScript=(src,key)=>{if(!document.head||document.querySelector(`script[data-${key}]`))return;const s=document.createElement('script');s.src=src;s.defer=true;s.setAttribute(`data-${key}`,'1');document.head.appendChild(s);};
  const installAmazonAffiliate=()=>{if(window.__PASSPORT_AMAZON_AFFILIATE__)return;addScript(AMAZON_AFFILIATE_SRC,'passport-amazon-affiliate');};
  const installHomeEditorial=()=>{if(location.pathname!=='/')return;addScript(HOME_EDITORIAL_SRC,'passport-home-editorial');};
  const installContinuousHome=()=>{if(location.pathname!=='/'&&location.pathname!=='/index.html')return;addScript(CONTINUOUS_HOME_SRC,'passport-continuous-home');};
  const installEditorialRoute=()=>{if(!document.querySelector('.pe-prose'))return;addScript(EDITORIAL_ROUTE_SRC,'passport-editorial-route');};
  const installRecirculation=()=>{
    if(!document.head||!document.querySelector('.pe-prose'))return;
    if(!document.querySelector('link[data-passport-recirculation]')){const l=document.createElement('link');l.rel='stylesheet';l.href=RECIRCULATION_CSS;l.dataset.passportRecirculation='1';document.head.appendChild(l);}
    addScript(RECIRCULATION_SRC,'passport-recirculation');
  };
  const installAnos80Vol2Memory=()=>{if(location.pathname!=='/anos-80-volume-2-musicas-memoria-brasileira.html')return;addScript(ANOS80_VOL2_MEMORY_SRC,'passport-anos80-vol2-memory');};
  const installFestaPlocRemix=()=>{if(location.pathname!=='/editorial/2026/09/03/festa-ploc-musicas-anos-80-nostalgia-shows-ao-vivo.html')return;addScript(FESTA_PLOC_REMIX_SRC,'passport-festa-ploc-remix');};
  const install=()=>{installAmazonAffiliate();installHomeEditorial();installContinuousHome();installEditorialRoute();installRecirculation();installAnos80Vol2Memory();installFestaPlocRemix();};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();