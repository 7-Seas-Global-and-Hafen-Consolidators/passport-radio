(()=>{'use strict';if(window.__PASSPORT_COMMERCIAL_LAYER__)return;window.__PASSPORT_COMMERCIAL_LAYER__=true;const load=src=>{if(document.querySelector(`script[src^="${src}"]`))return;const s=document.createElement('script');s.src=src;s.defer=true;document.body.appendChild(s)};const install=()=>{if(document.body.classList.contains('store-page'))load('/js/store-commerce-v2.js?v=20260907');load('/js/passport-affiliate-contextual.js?v=20260907');load('/js/passport-analytics.js?v=20260907');load('/js/passport-seo.js?v=20260907')};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install()})();

/* Editorial copy: a single shared implementation; non-article surfaces are excluded. */
(() => {
  const install = () => {
    if (!document.querySelector('.pe-prose') && !document.body.classList.contains('pp-article')) return;
    if (document.querySelector('script[data-passport-editorial-copy]')) return;
    const script = document.createElement('script');
    script.src = '/js/passport-editorial-copy.js?v=20260930';
    script.dataset.passportEditorialCopy = '1';
    document.head.appendChild(script);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, {once:true});
  else install();
})();
