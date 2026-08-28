(() => {
  'use strict';

  const text = (node, value) => {
    if (node && typeof value === 'string') node.textContent = value;
  };

  const cleanPromotions = () => {
    const section = document.querySelector('.passport-promos-home');
    if (!section) return;

    section.querySelectorAll('.passport-promo-card').forEach((card) => {
      const status = card.querySelector('.passport-promo-card__meta b');
      if (status && /^EM BREVE$/i.test(status.textContent.trim())) card.remove();
    });

    section.querySelectorAll('h3').forEach((h) => {
      if (/Ganhe um Fone Bluetooth 5\.3/i.test(h.textContent)) {
        h.textContent = h.textContent.replace(/5\.3/g, '5.4');
      }
    });
    section.querySelectorAll('[aria-label]').forEach((el) => {
      const label = el.getAttribute('aria-label') || '';
      if (/Fone Bluetooth 5\.3/i.test(label)) el.setAttribute('aria-label', label.replace(/5\.3/g, '5.4'));
    });

    const grid = section.querySelector('.passport-promos-home__grid');
    if (grid && grid.children.length === 1) grid.classList.add('passport-promos-home__grid--single');
  };

  const parseAgendaEnd = (event) => {
    const raw = event.querySelector('.date strong')?.textContent?.trim().toUpperCase() || '';
    const year = Number(event.querySelector('.date span')?.textContent?.trim());
    if (!raw || !Number.isFinite(year)) return null;

    const months = { JAN:0, FEV:1, MAR:2, ABR:3, MAI:4, JUN:5, JUL:6, AGO:7, SET:8, OUT:9, NOV:10, DEZ:11 };
    const match = raw.match(/(\d{1,2})(?:\s*[–-]\s*(\d{1,2}))?\s+([A-ZÇ]{3})/);
    if (!match || !(match[3] in months)) return null;
    const day = Number(match[2] || match[1]);
    return new Date(year, months[match[3]], day, 23, 59, 59, 999);
  };

  const cleanAgenda = () => {
    const section = document.getElementById('agenda');
    const agenda = section?.querySelector('.agenda');
    if (!agenda) return;

    const now = new Date();
    agenda.querySelectorAll('.event').forEach((event) => {
      const end = parseAgendaEnd(event);
      if (end && end < now) event.remove();
    });

    if (!agenda.querySelector('.event')) section.hidden = true;
  };

  const plainLabels = () => {
    const support = document.getElementById('apoie');
    if (support) {
      text(support.querySelector('.eyebrow'), 'DOAR');
      text(support.querySelector('h2'), 'Ajude a manter a Passport no ar.');
      support.querySelectorAll('a.btn').forEach((a) => {
        if (/ASAAS/i.test(a.textContent) || /APOIAR A PASSPORT/i.test(a.textContent)) a.textContent = 'DOAR VIA ASAAS';
        if (/PAYPAL/i.test(a.textContent)) a.textContent = 'DOAR VIA PAYPAL ↗';
      });
    }

    document.querySelectorAll('a[href="#apoie"],a[href="index.html#apoie"],a[href="/index.html#apoie"]').forEach((a) => {
      if (/^APOIE$/i.test(a.textContent.trim()) || /^APOIAR$/i.test(a.textContent.trim())) a.textContent = 'Doar';
    });

    const storeEyebrow = document.querySelector('#loja .eyebrow');
    if (storeEyebrow && /PASSPORT STORE/i.test(storeEyebrow.textContent)) storeEyebrow.textContent = 'LOJA';

    const agendaEyebrow = document.querySelector('#agenda .eyebrow');
    if (agendaEyebrow && /AGENDA DE SHOWS/i.test(agendaEyebrow.textContent)) agendaEyebrow.textContent = 'SHOWS · BRASIL';

    const float = document.getElementById('passport-support-float');
    if (float) {
      text(float.querySelector('.passport-support-float__copy strong'), 'DOAR PARA A PASSPORT');
      text(float.querySelector('.passport-support-float__copy small'), 'PAYPAL · VALOR LIVRE');
      float.setAttribute('aria-label', 'Doar para a Passport via PayPal');
    }
  };

  const removeTrulyEmptyCards = () => {
    const selectors = [
      '.quick-card', '.card', '.program-item', '.product', '.contact-card',
      '.passport-promo-card', '.commercial-card', '.archive-card', '.story-link'
    ].join(',');

    document.querySelectorAll(selectors).forEach((card) => {
      const hasText = (card.textContent || '').replace(/\s+/g, '').length > 0;
      const hasMedia = !!card.querySelector('img,video,audio,svg,[role="img"]');
      const hasLink = card.matches('a[href]') || !!card.querySelector('a[href]');
      if (!hasText && !hasMedia && !hasLink) card.remove();
    });
  };

  const keepWireOnlyWhenUseful = () => {
    const wire = document.getElementById('passport-editorial-home');
    if (!wire) return;
    const hasStory = !!wire.querySelector('a.passport-wire__hero[href], .passport-wire__signal[href], .passport-wire__rail-item[href]');
    const waitingOnly = !!wire.querySelector('.passport-wire__waiting, .passport-wire__hero--waiting');
    wire.hidden = !hasStory && waitingOnly;
  };

  const installStyle = () => {
    if (document.getElementById('passport-site-polish-style')) return;
    const style = document.createElement('style');
    style.id = 'passport-site-polish-style';
    style.textContent = `
      .passport-promos-home__grid--single{grid-template-columns:1fr!important}
      .passport-promos-home__grid--single .passport-promo-card--featured{min-height:0!important}
      [hidden]{display:none!important}
      @media(max-width:760px){
        .passport-promos-home__grid--single{display:block!important}
      }
    `;
    document.head.appendChild(style);
  };

  const run = () => {
    installStyle();
    cleanPromotions();
    cleanAgenda();
    plainLabels();
    removeTrulyEmptyCards();
    keepWireOnlyWhenUseful();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once:true });
  else run();

  window.setTimeout(run, 1500);
  window.setTimeout(run, 6000);

  const observer = new MutationObserver(() => {
    window.clearTimeout(observer._passportTimer);
    observer._passportTimer = window.setTimeout(run, 120);
  });
  if (document.documentElement) observer.observe(document.documentElement, { childList:true, subtree:true });
})();
