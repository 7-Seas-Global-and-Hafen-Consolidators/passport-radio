(() => {
  const endpoint = '/data/editorial-feed.json';
  const escapeHTML = (value = '') => String(value).replace(/[&<>'"]/g, (ch) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const stamp = (value) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('pt-BR', {day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit'}).format(d);
  };
  fetch(endpoint, {cache:'no-store', credentials:'omit'})
    .then((r) => r.ok ? r.json() : Promise.reject())
    .then((data) => {
      const items = Array.isArray(data && data.items) ? data.items.slice(0, 6) : [];
      if (!items.length || document.getElementById('passport-editorial-home')) return;
      const anchor = document.getElementById('noticias') || document.getElementById('agenda') || document.querySelector('main section:last-of-type');
      if (!anchor || !anchor.parentNode) return;
      const section = document.createElement('section');
      section.id = 'passport-editorial-home';
      section.className = 'passport-editorial-home';
      section.innerHTML = `
        <div class="shell">
          <div class="passport-editorial-home__head">
            <div><small>PASSPORT RADIO · EDITORIAL 24H</small><h2>Novas histórias. O dia inteiro.</h2></div>
            <a href="/editorial.html">VER TODO O EDITORIAL →</a>
          </div>
          <div class="passport-editorial-home__grid">
            ${items.map((item) => `<a href="${escapeHTML(item.url)}"><small>${escapeHTML(item.format)} · ${escapeHTML(item.category)}</small><strong>${escapeHTML(item.title)}</strong><span>${escapeHTML(item.deck || '')}</span><small>${escapeHTML(stamp(item.published_at))}</small></a>`).join('')}
          </div>
        </div>`;
      anchor.parentNode.insertBefore(section, anchor.nextSibling);
    })
    .catch(() => {});
})();

/* =========================================================
   KEEP IT ON AIR · PAYPAL
   Home keeps the existing Asaas route and adds PayPal as a visible alternate.
   A fixed conversion point stays above the home player without touching it.
   ========================================================= */
(() => {
  const PAYPAL_URL = 'https://www.paypal.com/ncp/payment/WK4CLBGVD2Y4C';
  const HOSTED_BUTTON_ID = 'WK4CLBGVD2Y4C';
  const SDK_URL = 'https://www.paypal.com/sdk/js?client-id=BAATSBUFD6IB4OXS-joVyzzy_g3mrTQpgVKQUEzGeayAmM3SZGlPPDc5F1BLA64l8h-BVGvpf0Rd2TuTz4&components=hosted-buttons&disable-funding=venmo&currency=BRL';

  const installFloat = () => {
    if (document.getElementById('passport-support-float')) return;
    const link = document.createElement('a');
    link.id = 'passport-support-float';
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

  const renderHostedButton = () => {
    const container = document.getElementById(`paypal-container-${HOSTED_BUTTON_ID}`);
    if (!container || container.dataset.rendered === '1') return;
    if (!window.paypal || typeof window.paypal.HostedButtons !== 'function') return;

    try {
      container.dataset.rendered = '1';
      const result = window.paypal.HostedButtons({ hostedButtonId: HOSTED_BUTTON_ID })
        .render(`#paypal-container-${HOSTED_BUTTON_ID}`);
      if (result && typeof result.catch === 'function') {
        result.catch(() => { container.dataset.rendered = '0'; });
      }
    } catch (_) {
      container.dataset.rendered = '0';
    }
  };

  const loadPayPalSDK = () => {
    if (window.paypal && typeof window.paypal.HostedButtons === 'function') {
      renderHostedButton();
      return;
    }

    const existing = document.querySelector('script[data-passport-paypal-sdk]');
    if (existing) {
      existing.addEventListener('load', renderHostedButton, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = SDK_URL;
    script.async = true;
    script.dataset.passportPaypalSdk = '1';
    script.addEventListener('load', renderHostedButton, { once: true });
    document.head.appendChild(script);
  };

  const installHomeSupport = () => {
    installFloat();

    const supportBox = document.querySelector('#apoie .support-box');
    if (!supportBox || document.getElementById('passport-paypal-support')) return;

    const asaas = supportBox.querySelector('a.btn[href*="asaas.com"]');
    if (asaas) asaas.textContent = 'APOIAR VIA ASAAS';

    const block = document.createElement('div');
    block.id = 'passport-paypal-support';
    block.className = 'passport-paypal-support';
    block.innerHTML = `
      <a class="btn passport-paypal-direct" href="${PAYPAL_URL}" target="_blank" rel="noopener">
        APOIAR VIA PAYPAL ↗
      </a>
      <div id="paypal-container-${HOSTED_BUTTON_ID}" aria-label="Pagamento PayPal"></div>
      <small class="passport-paypal-support__caption">
        PayPal é uma alternativa direta ao apoio via Asaas. Você escolhe a rota.
      </small>
    `;

    if (asaas && asaas.parentNode === supportBox) {
      asaas.insertAdjacentElement('afterend', block);
    } else {
      supportBox.prepend(block);
    }

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        loadPayPalSDK();
      }, { rootMargin: '300px 0px' });
      observer.observe(block);
    } else {
      loadPayPalSDK();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installHomeSupport, { once: true });
  } else {
    installHomeSupport();
  }
})();