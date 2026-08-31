(() => {
  const ADSENSE_SRC = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7728480662290062';
  const AMAZON_AFFILIATE_SRC = '/js/passport-amazon-affiliate.js?v=202608251738';
  const HOME_EDITORIAL_SRC = '/js/home-editorial-priority.js?v=202608311216';
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

  const installAmazonAffiliate = () => {
    if (!document.head) return;
    if (window.__PASSPORT_AMAZON_AFFILIATE__ || document.querySelector('script[data-passport-amazon-affiliate]')) return;
    const script = document.createElement('script');
    script.src = AMAZON_AFFILIATE_SRC;
    script.defer = true;
    script.dataset.passportAmazonAffiliate = '1';
    document.head.appendChild(script);
  };

  const installHomeEditorial = () => {
    if (!document.head || location.pathname !== '/') return;
    if (document.querySelector('script[data-passport-home-editorial]')) return;
    const script = document.createElement('script');
    script.src = HOME_EDITORIAL_SRC;
    script.defer = true;
    script.dataset.passportHomeEditorial = '1';
    document.head.appendChild(script);
  };

  const install = () => {
    installAdSense();
    installAmazonAffiliate();
    installHomeEditorial();
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