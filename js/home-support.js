(() => {
  if(document.querySelector('script[data-passport-support-global]')) return;
  const script=document.createElement('script');
  script.src='/js/passport-support.js?v=3';
  script.defer=true;
  script.dataset.passportSupportGlobal='1';
  document.head.appendChild(script);
})();
