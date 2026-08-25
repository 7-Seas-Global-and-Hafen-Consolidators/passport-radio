(() => {
  const ADSENSE_SRC = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5489546241643636';
  const PAYPAL_URL = 'https://www.paypal.com/ncp/payment/WK4CLBGVD2Y4C';
  const FLOAT_ID = 'passport-support-float';

  const installAdSense = () => {
    if (!document.head) return;
    if (document.querySelector('script[data-passport-adsense],script[src^="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]')) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = ADSENSE_SRC;
    script.crossOrigin = 'anonymous';
    script.dataset.passportAdsense = '1';
    document.head.appendChild(script);
  };

  const install = () => {
    installAdSense();
    if (!document.body || document.getElementById(FLOAT_ID)) return;

    const link = document.createElement('a');
    link.id = FLOAT_ID;
    link.className = 'passport-support-float';
    link.href = PAYPAL_URL;
    link.target = '_blank';
    link.rel = 'noopener';
    link.setAttribute('aria-label', 'Mantenha a Passport no ar com PayPal');
    link.innerHTML = `
      <span class="passport-support-float__copy">
        <strong>MANTENHA A PASSPORT NO AR</strong>
        <small>APOIO DIRETO · PAYPAL</small>
      </span>
      <span class="passport-support-float__go" aria-hidden="true">↗</span>
    `;

    document.body.appendChild(link);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();