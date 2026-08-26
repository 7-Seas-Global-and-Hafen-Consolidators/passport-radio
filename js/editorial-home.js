(() => {
  const load = src => new Promise((ok,fail)=>{const s=document.createElement('script');s.src=src;s.async=false;s.onload=ok;s.onerror=fail;document.head.appendChild(s)});
  (async()=>{try{await load('/js/global-signals-lib.js?v=5');await Promise.all([load('/js/global-signals-home.js?v=5'),load('/js/home-support.js?v=5')])}catch(e){console.error('Passport Home Wire',e)}})();
})();