(() => {
  const src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5489546241643636';
  if (!document.querySelector('script[data-passport-adsense],script[src^="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]')) {
    const script = document.createElement('script');
    script.async = true;
    script.src = src;
    script.crossOrigin = 'anonymous';
    script.dataset.passportAdsense = '1';
    document.head.appendChild(script);
  }
})();

/* =========================================================
   PASSPORT HOME WIRE · GLOBAL SIGNALS 24H
   - Reads only the sanitized tunnel payload.
   - Never renders source names, source URLs or feed health.
   - Does not touch players, player interlock or commercial DOM.
   ========================================================= */
(() => {
  const PREMIUM_ENDPOINT = '/data/editorial-feed.json';
  const TUNNEL_ENDPOINT = 'https://global-signals-production.up.railway.app/feed';
  const REFRESH_MS = 10 * 60 * 1000;
  const PAGE_SIZE = 30;

  const state = {
    premium: [],
    signals: [],
    visible: PAGE_SIZE,
    updatedAt: null,
    refreshTimer: null
  };

  const ensureStyle = () => {
    if (document.querySelector('link[data-passport-editorial-home-style]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/css/editorial-home.css?v=202608261215';
    link.dataset.passportEditorialHomeStyle = '1';
    document.head.appendChild(link);
  };

  const escapeHTML = (value = '') => String(value).replace(/[&<>'"]/g, (ch) => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;'
  }[ch]));

  const cleanText = (value = '') => String(value)
    .replace(/\]\]>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const stamp = (value, withDate = false) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('pt-BR', withDate
      ? { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' }
      : { hour:'2-digit', minute:'2-digit' }
    ).format(d);
  };

  const categoryLabel = (value = '') => {
    const labels = {
      pop_poprock: 'Pop · Pop Rock',
      classic_rock: 'Classic Rock',
      alternative_gothic: 'Alternative · Gothic',
      metal: 'Metal',
      progressive: 'Progressive',
      punk_hardcore: 'Punk · Hardcore',
      soul_rnb: 'Soul · R&B',
      mpb_brazil: 'MPB · Brasil'
    };
    return labels[value] || String(value).replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
  };

  const formatLabel = (value = '') => String(value).replace(/_/g, ' ').toUpperCase();

  const normalizeSignal = (item = {}, index = 0) => ({
    id: cleanText(item.id || `signal-${index}`),
    title: cleanText(item.title),
    summary: cleanText(item.summary || item.description || item.deck || ''),
    date: item.date || item.published_at || item.published || '',
    region: cleanText(item.region || 'Global'),
    genre: cleanText(item.genre || 'Música'),
    language: cleanText(item.language || '')
  });

  const sanitizeSignals = (payload) => {
    const raw = Array.isArray(payload)
      ? payload
      : Array.isArray(payload && payload.items) ? payload.items : [];
    const seen = new Set();
    const safe = [];

    raw.forEach((item, index) => {
      const signal = normalizeSignal(item, index);
      if (!signal.title) return;
      const key = signal.title.toLocaleLowerCase('pt-BR').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
      if (!key || seen.has(key)) return;
      seen.add(key);
      safe.push(signal);
    });

    return safe.sort((a, b) => {
      const ta = new Date(a.date).getTime() || 0;
      const tb = new Date(b.date).getTime() || 0;
      return tb - ta;
    });
  };

  const loadPremium = async () => {
    try {
      const response = await fetch(PREMIUM_ENDPOINT, { cache:'no-store', credentials:'omit' });
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data && data.items) ? data.items.slice(0, 6) : [];
    } catch (_) {
      return [];
    }
  };

  const loadSignals = async () => {
    const response = await fetch(TUNNEL_ENDPOINT, {
      cache:'no-store',
      credentials:'omit',
      mode:'cors',
      headers:{ 'Accept':'application/json' }
    });
    if (!response.ok) throw new Error(`Tunnel ${response.status}`);
    const data = await response.json();
    return {
      items: sanitizeSignals(data),
      generatedAt: data && (data.generated_at || data.updated_at || data.date) || null
    };
  };

  const heroMarkup = () => {
    const premium = state.premium[0];
    if (premium) {
      return `
        <a class="passport-wire__hero" href="${escapeHTML(premium.url || '/editorial.html')}">
          <div class="passport-wire__eyebrow">
            <span>DESTAQUE PASSPORT</span>
            <span>${escapeHTML(categoryLabel(premium.category || ''))}</span>
          </div>
          <h3>${escapeHTML(cleanText(premium.title))}</h3>
          <p>${escapeHTML(cleanText(premium.deck || ''))}</p>
          <small>${escapeHTML(stamp(premium.published_at, true))} · ${escapeHTML(formatLabel(premium.format || 'STORY'))}</small>
        </a>`;
    }

    const signal = state.signals[0];
    if (!signal) {
      return `
        <article class="passport-wire__hero passport-wire__hero--waiting">
          <div class="passport-wire__eyebrow"><span>RADAR GLOBAL</span><span>24H</span></div>
          <h3>O radar está aquecendo.</h3>
          <p>A Home permanece intacta enquanto o túnel prepara o próximo snapshot.</p>
        </article>`;
    }

    return `
      <article class="passport-wire__hero">
        <div class="passport-wire__eyebrow">
          <span>PASSPORT SIGNAL</span>
          <span>${escapeHTML(signal.region)}</span>
        </div>
        <h3>${escapeHTML(signal.title)}</h3>
        <p>${escapeHTML(signal.summary || 'Sinal detectado pelo radar editorial mundial da Passport.')}</p>
        <small>${escapeHTML(stamp(signal.date, true))} · ${escapeHTML(signal.genre)}</small>
      </article>`;
  };

  const railMarkup = () => state.signals.slice(1, 7).map((signal) => `
    <article class="passport-wire__rail-item">
      <div><span>${escapeHTML(signal.region)}</span><span>${escapeHTML(signal.genre)}</span></div>
      <strong>${escapeHTML(signal.title)}</strong>
      <small>${escapeHTML(stamp(signal.date))}${signal.language ? ` · ${escapeHTML(signal.language)}` : ''}</small>
    </article>
  `).join('');

  const signalCardMarkup = (signal, index) => `
    <article class="passport-wire__signal${index < 3 ? ' passport-wire__signal--hot' : ''}">
      <div class="passport-wire__signal-meta">
        <span>${index < 3 ? 'AGORA' : 'PASSPORT SIGNAL'}</span>
        <span>${escapeHTML(signal.region)}</span>
      </div>
      <h4>${escapeHTML(signal.title)}</h4>
      ${signal.summary ? `<p>${escapeHTML(signal.summary)}</p>` : ''}
      <small>${escapeHTML(signal.genre)}${signal.language ? ` · ${escapeHTML(signal.language)}` : ''}${signal.date ? ` · ${escapeHTML(stamp(signal.date))}` : ''}</small>
    </article>`;

  const mountShell = () => {
    let section = document.getElementById('passport-editorial-home');
    if (section) return section;

    const anchor = document.getElementById('noticias')
      || document.getElementById('agenda')
      || document.querySelector('main section:last-of-type');
    if (!anchor || !anchor.parentNode) return null;

    section = document.createElement('section');
    section.id = 'passport-editorial-home';
    section.className = 'passport-editorial-home';
    anchor.parentNode.insertBefore(section, anchor.nextSibling);
    return section;
  };

  const render = () => {
    const section = mountShell();
    if (!section) return;

    const visibleSignals = state.signals.slice(7, Math.max(7, state.visible));
    const total = state.signals.length;
    const updated = state.updatedAt ? stamp(state.updatedAt, true) : '';

    section.innerHTML = `
      <div class="shell passport-wire">
        <header class="passport-wire__header">
          <div>
            <small>PASSPORT RADIO · GLOBAL WIRE 24H</small>
            <h2>O mundo da música.<br>Sem intervalo.</h2>
          </div>
          <div class="passport-wire__live" aria-live="polite">
            <span></span>
            <strong>AO VIVO</strong>
            <small>${total ? `${total} SINAIS NO RADAR` : 'RADAR CONECTANDO'}${updated ? ` · ${escapeHTML(updated)}` : ''}</small>
          </div>
        </header>

        <div class="passport-wire__masthead">
          ${heroMarkup()}
          <aside class="passport-wire__rail" aria-label="Últimos sinais globais">
            <div class="passport-wire__rail-title">ÚLTIMAS AGORA</div>
            ${railMarkup() || '<p class="passport-wire__waiting">Aguardando o próximo snapshot global.</p>'}
          </aside>
        </div>

        <div class="passport-wire__strip" aria-hidden="true">
          <span>ROCK</span><span>METAL</span><span>ALTERNATIVE</span><span>CLASSIC ROCK</span><span>PUNK</span><span>BLUES</span><span>INDIE</span><span>ÁSIA</span><span>AMÉRICA LATINA</span><span>EUROPA</span>
        </div>

        <div class="passport-wire__section-head">
          <div>
            <small>RADAR EDITORIAL MUNDIAL</small>
            <h3>Notícias entrando agora.</h3>
          </div>
          <a href="/editorial.html">MR. NOMAD · HISTÓRIAS PREMIUM →</a>
        </div>

        <div class="passport-wire__stream">
          ${visibleSignals.map(signalCardMarkup).join('') || '<div class="passport-wire__waiting">O túnel está preparando o próximo lote. O restante da Home continua normalmente.</div>'}
        </div>

        ${state.visible < total ? `
          <div class="passport-wire__more-wrap">
            <button class="passport-wire__more" type="button" data-passport-wire-more>
              MAIS NOTÍCIAS · ${Math.min(PAGE_SIZE, total - state.visible)} →
            </button>
          </div>` : ''}

        <footer class="passport-wire__footer">
          <div>
            <strong>— MR. NOMAD</strong>
            <span>Every Song Is A Destination.</span>
          </div>
          <small>RADAR GLOBAL · ATUALIZAÇÃO AUTOMÁTICA 24H</small>
        </footer>
      </div>`;

    const more = section.querySelector('[data-passport-wire-more]');
    if (more) {
      more.addEventListener('click', () => {
        state.visible = Math.min(state.signals.length, state.visible + PAGE_SIZE);
        render();
      }, { once:true });
    }
  };

  const refreshSignals = async () => {
    try {
      const result = await loadSignals();
      if (!result.items.length) return;
      state.signals = result.items;
      state.updatedAt = result.generatedAt || new Date().toISOString();
      if (state.visible < PAGE_SIZE) state.visible = PAGE_SIZE;
      render();
    } catch (_) {
      // Keep the last good snapshot on-screen. Never collapse the Home on tunnel failure.
    }
  };

  const boot = async () => {
    ensureStyle();

    const [premiumResult, signalResult] = await Promise.allSettled([
      loadPremium(),
      loadSignals()
    ]);

    if (premiumResult.status === 'fulfilled') state.premium = premiumResult.value;
    if (signalResult.status === 'fulfilled' && signalResult.value.items.length) {
      state.signals = signalResult.value.items;
      state.updatedAt = signalResult.value.generatedAt || new Date().toISOString();
    }

    render();

    if (state.refreshTimer) clearInterval(state.refreshTimer);
    state.refreshTimer = setInterval(refreshSignals, REFRESH_MS);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once:true });
  } else {
    boot();
  }
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

    if (asaas && asasa.parentNode === supportBox) {
      asasa.insertAdjacentElement('afterend', block);
    } else if (asaas && asaas.parentNode === supportBox) {
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
