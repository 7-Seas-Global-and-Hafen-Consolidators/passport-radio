/* Payment presentation delegates to the one institutional footer. */
(() => {
  if (!document.querySelector('script[data-passport-cookie-foundation]')) {
    const s=document.createElement('script');s.src='/js/passport-site-foundation.js?v=20260918a';s.defer=true;s.dataset.passportCookieFoundation='1';document.head.appendChild(s);
  }
  if (window.PassportUniversalFooter) {window.PassportUniversalFooter.mount();return;}
  if (document.querySelector('script[data-passport-universal-footer]')) return;
  const s=document.createElement('script');s.src='/js/passport-universal-footer.js?v=20261010';s.defer=true;s.dataset.passportUniversalFooter='1';document.head.appendChild(s);
})();

/* Shared document continuity and discreet privacy link. No catalog or page content is changed. */
(() => { if (document.querySelector('script[data-passport-continuity]')) return;
  const script=document.createElement('script');script.src='/js/passport-audio-continuity.js';script.defer=true;script.dataset.passportContinuity='1';document.head.appendChild(script);
})();
