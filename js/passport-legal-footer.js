(() => {
  const AMAZON_AFFILIATE_SRC = '/js/passport-amazon-affiliate.js?v=202608311800';
  const HOME_EDITORIAL_SRC = '/js/home-editorial-priority.js?v=202608311216';
  const EDITORIAL_ROUTE_SRC = '/js/editorial-route.js?v=202608311405';

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

  const installEditorialRoute = () => {
    if (!document.head || !document.querySelector('.pe-prose')) return;
    if (document.querySelector('script[data-passport-editorial-route]')) return;
    const script = document.createElement('script');
    script.src = EDITORIAL_ROUTE_SRC;
    script.defer = true;
    script.dataset.passportEditorialRoute = '1';
    document.head.appendChild(script);
  };

  const install = () => {
    installAmazonAffiliate();
    installHomeEditorial();
    installEditorialRoute();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();