(() => {
  const src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7728480662290062';
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
   PASSPORT HOME WIRE · GLOBAL SIGNALS 24H · PT-BR
   Reads only the sanitized tunnel payload. Source names/URLs
   are never rendered. Translation happens before rendering.
   Players, interlock and sponsor blocks are untouched.
   ========================================================= */
(() => {
  const PREMIUM_ENDPOINT = '/data/editorial-feed.json';
  const TUNNEL_ENDPOINT = 'https://global-signals-production.up.railway.app/feed';
  const REFRESH_MS = 10 * 60 * 1000;
  const PAGE_SIZE = 30;
  const INITIAL_COUNT = 44;
  const STORAGE_KEY = 'passport-global-signals-ptbr-v3';
  const TRANSLATION_KEY = 'passport-global-signals-translations-v3';
  const TRANSLATION_TTL = 72 * 60 * 60 * 1000;
  const state = { premium: [], raw: [], signals: [], visible: PAGE_SIZE, desired: INITIAL_COUNT, updatedAt: null, timer: null, translating: false };

  const esc = (value = '') => String(value).replace(/[&<>'"]/g, (ch) => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;'
  }[ch]));

  const decodeEntities = (value = '') => {
    const box = document.createElement('textarea');
    box.innerHTML = String(value);
    return box.value;
  };

  const clean = (value = '') => decodeEntities(String(value))
    .replace(/<[^>]*>/g, ' ')
    .replace(/\]\]>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const stamp = (value, full = false) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('pt-BR', full
      ? { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' }
      : { hour:'2-digit', minute:'2-digit' }).format(d);
  };

  const category = (value = '') => {
    const labels = {
      pop_poprock:'Pop · Pop Rock', classic_rock:'Classic Rock',
      alternative_gothic:'Alternative · Gothic', metal:'Metal',
      progressive:'Progressive', punk_hardcore:'Punk · Hardcore',
      soul_rnb:'Soul · R&B', mpb_brazil:'MPB · Brasil'
    };
    return labels[value] || String(value).replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
  };

  const signalUrl = (signal) => `/signal.html?id=${encodeURIComponent(signal.id)}`;
  const cacheKey = (s) => `${s.id}::${s.title}`;

  const readTranslationCache = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(TRANSLATION_KEY) || '{}');
      if (!parsed || typeof parsed !== 'object') return {};
      const now = Date.now();
      Object.keys(parsed).forEach((k) => {
        if (!parsed[k] || now - Number(parsed[k].savedAt || 0) > TRANSLATION_TTL) delete parsed[k];
      });
      return parsed;
    } catch (_) { return {}; }
  };

  const translationCache = readTranslationCache();

  const saveTranslationCache = () => {
    try {
      const entries = Object.entries(translationCache)
        .sort((a,b) => Number(b[1].savedAt || 0) - Number(a[1].savedAt || 0))
        .slice(0, 500);
      localStorage.setItem(TRANSLATION_KEY, JSON.stringify(Object.fromEntries(entries)));
    } catch (_) {}
  };

  const rememberSignals = (items) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ savedAt:Date.now(), items:items.slice(0, 240) }));
    } catch (_) {}
  };

  const ensureStyle = () => {
    if (document.querySelector('link[data-passport-editorial-home-style]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/css/editorial-home.css?v=202608261215';
    link.dataset.passportEditorialHomeStyle = '1';
    document.head.appendChild(link);
  };

  const sanitizeRaw = (payload) => {
    const raw = Array.isArray(payload) ? payload : Array.isArray(payload && payload.items) ? payload.items : [];
    const seen = new Set();
    const out = [];
    raw.forEach((item, index) => {
      const signal = {
        id: clean(item.id || `signal-${index}`),
        title: clean(item.title),
        summary: clean(item.summary || item.description || item.deck || ''),
        date: item.date || item.published_at || item.published || '',
        region: clean(item.region || 'Global'),
        genre: clean(item.genre || 'Música'),
        language: clean(item.language || '')
      };
      if (!signal.title) return;
      const key = signal.title.toLocaleLowerCase('pt-BR').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
      if (!key || seen.has(key)) return;
      seen.add(key);
      out.push(signal);
    });
    return out.sort((a, b) => (new Date(b.date).getTime() || 0) - (new Date(a.date).getTime() || 0));
  };

  const normalizeLang = (value='') => {
    const v = String(value).toLowerCase();
    if (v.startsWith('pt')) return 'pt';
    if (v.startsWith('en')) return 'en';
    if (v.startsWith('es')) return 'es';
    if (v.startsWith('de')) return 'de';
    if (v.startsWith('fr')) return 'fr';
    if (v.startsWith('it')) return 'it';
    if (v.startsWith('ja')) return 'ja';
    if (v.startsWith('ko')) return 'ko';
    if (v.startsWith('zh')) return 'zh-CN';
    return 'auto';
  };

  const googleTranslate = async (text, signal) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);
    try {
      const q = new URLSearchParams({ client:'gtx', sl:normalizeLang(signal.language), tl:'pt', dt:'t', q:text });
      const r = await fetch(`https://translate.googleapis.com/translate_a/single?${q}`, {
        cache:'no-store', credentials:'omit', mode:'cors', signal:controller.signal
      });
      if (!r.ok) throw new Error(`Google ${r.status}`);
      const data = await r.json();
      const translated = Array.isArray(data && data[0]) ? data[0].map((x) => Array.isArray(x) ? (x[0] || '') : '').join('') : '';
      if (!translated.trim()) throw new Error('Google empty');
      return clean(translated);
    } finally { clearTimeout(timeout); }
  };

  const memoryTranslate = async (text, signal) => {
    const src = normalizeLang(signal.language);
    if (src === 'auto' || src === 'pt') throw new Error('No source language');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);
    try {
      const q = new URLSearchParams({ q:text, langpair:`${src}|pt-BR` });
      const r = await fetch(`https://api.mymemory.translated.net/get?${q}`, {
        cache:'no-store', credentials:'omit', mode:'cors', signal:controller.signal
      });
      if (!r.ok) throw new Error(`MyMemory ${r.status}`);
      const data = await r.json();
      const translated = clean(data && data.responseData && data.responseData.translatedText || '');
      if (!translated) throw new Error('MyMemory empty');
      return translated;
    } finally { clearTimeout(timeout); }
  };

  const translateText = async (text, signal) => {
    if (!text) return '';
    try { return await googleTranslate(text, signal); }
    catch (_) { return memoryTranslate(text, signal); }
  };

  const translateSignal = async (signal) => {
    if (normalizeLang(signal.language) === 'pt') return { ...signal, language:'PT-BR' };
    const key = cacheKey(signal);
    const cached = translationCache[key];
    if (cached && cached.title) return { ...signal, title:cached.title, summary:cached.summary || '', language:'PT-BR' };

    const marker = '[[[PASSPORT_SPLIT_9F3A]]]';
    let title = '';
    let summary = '';
    try {
      const joined = `${signal.title}\n${marker}\n${signal.summary || ''}`;
      const translated = await translateText(joined, signal);
      const parts = translated.split(marker);
      if (parts.length >= 2) {
        title = clean(parts.shift());
        summary = clean(parts.join(marker));
      }
    } catch (_) {}

    if (!title) {
      try { title = await translateText(signal.title, signal); } catch (_) { return null; }
      if (signal.summary) {
        try { summary = await translateText(signal.summary, signal); } catch (_) { summary = ''; }
      }
    }
    if (!title) return null;
    translationCache[key] = { title:clean(title), summary:clean(summary), savedAt:Date.now() };
    saveTranslationCache();
    return { ...signal, title:clean(title), summary:clean(summary), language:'PT-BR' };
  };

  const translatedFromCache = (rawItems) => rawItems.map((signal) => {
    if (normalizeLang(signal.language) === 'pt') return { ...signal, language:'PT-BR' };
    const cached = translationCache[cacheKey(signal)];
    return cached && cached.title ? { ...signal, title:cached.title, summary:cached.summary || '', language:'PT-BR' } : null;
  }).filter(Boolean);

  const translateToDesired = async () => {
    if (state.translating || !state.raw.length) return;
    state.translating = true;
    try {
      const translatedMap = new Map(state.signals.map((s) => [s.id, s]));
      const candidates = state.raw.filter((s) => !translatedMap.has(s.id)).slice(0, Math.max(0, state.desired - translatedMap.size + 12));
      for (let i = 0; i < candidates.length && translatedMap.size < state.desired; i += 6) {
        const batch = candidates.slice(i, i + 6);
        const results = await Promise.allSettled(batch.map(translateSignal));
        results.forEach((r) => {
          if (r.status === 'fulfilled' && r.value) translatedMap.set(r.value.id, r.value);
        });
        state.signals = state.raw.map((r) => translatedMap.get(r.id)).filter(Boolean);
        rememberSignals(state.signals);
        render();
      }
    } finally { state.translating = false; }
  };

  const loadPremium = async () => {
    try {
      const r = await fetch(PREMIUM_ENDPOINT, { cache:'no-store', credentials:'omit' });
      if (!r.ok) return [];
      const data = await r.json();
      return Array.isArray(data && data.items) ? data.items.slice(0, 6) : [];
    } catch (_) { return []; }
  };

  const loadRawSignals = async () => {
    const r = await fetch(TUNNEL_ENDPOINT, { cache:'no-store', credentials:'omit', mode:'cors', headers:{ Accept:'application/json' } });
    if (!r.ok) throw new Error(`Tunnel ${r.status}`);
    const data = await r.json();
    return { items:sanitizeRaw(data), generatedAt:data && (data.generated_at || data.updated_at || data.date) || null };
  };

  const mount = () => {
    let section = document.getElementById('passport-editorial-home');
    if (section) return section;
    const anchor = document.getElementById('noticias') || document.getElementById('agenda') || document.querySelector('main section:last-of-type');
    if (!anchor || !anchor.parentNode) return null;
    section = document.createElement('section');
    section.id = 'passport-editorial-home';
    section.className = 'passport-editorial-home';
    anchor.parentNode.insertBefore(section, anchor.nextSibling);
    return section;
  };

  const hero = () => {
    const premium = state.premium[0];
    if (premium) return `
      <a class="passport-wire__hero" href="${esc(premium.url || '/editorial.html')}">
        <div class="passport-wire__eyebrow"><span>DESTAQUE PASSPORT</span><span>${esc(category(premium.category || ''))}</span></div>
        <h3>${esc(clean(premium.title))}</h3><p>${esc(clean(premium.deck || ''))}</p>
        <small>${esc(stamp(premium.published_at, true))} · ${esc(String(premium.format || 'STORY').replace(/_/g, ' ').toUpperCase())}</small>
      </a>`;
    const s = state.signals[0];
    if (!s) return `<article class="passport-wire__hero passport-wire__hero--waiting"><div class="passport-wire__eyebrow"><span>RADAR GLOBAL</span><span>24H</span></div><h3>Traduzindo o radar mundial.</h3><p>Os Signals aparecem assim que chegam em português.</p></article>`;
    return `<a class="passport-wire__hero" href="${esc(signalUrl(s))}"><div class="passport-wire__eyebrow"><span>PASSPORT SIGNAL</span><span>${esc(s.region)}</span></div><h3>${esc(s.title)}</h3><p>${esc(s.summary || 'Sinal detectado pelo radar editorial mundial da Passport.')}</p><small>${esc(stamp(s.date, true))} · ${esc(s.genre)} · PT-BR</small></a>`;
  };

  const rail = () => state.signals.slice(1, 7).map((s) => `<a class="passport-wire__rail-item" href="${esc(signalUrl(s))}" style="display:block;text-decoration:none;color:inherit"><div><span>${esc(s.region)}</span><span>${esc(s.genre)}</span></div><strong>${esc(s.title)}</strong><small>${esc(stamp(s.date))} · PT-BR</small></a>`).join('');
  const card = (s, index) => `<a class="passport-wire__signal${index < 3 ? ' passport-wire__signal--hot' : ''}" href="${esc(signalUrl(s))}" style="text-decoration:none;color:inherit"><div class="passport-wire__signal-meta"><span>${index < 3 ? 'AGORA' : 'PASSPORT SIGNAL'}</span><span>${esc(s.region)}</span></div><h4>${esc(s.title)}</h4>${s.summary ? `<p>${esc(s.summary)}</p>` : ''}<small>${esc(s.genre)} · PT-BR${s.date ? ` · ${esc(stamp(s.date))}` : ''}</small></a>`;

  const render = () => {
    const section = mount();
    if (!section) return;
    const total = state.signals.length;
    const visible = state.signals.slice(7, Math.max(7, state.visible));
    const updated = state.updatedAt ? stamp(state.updatedAt, true) : '';
    section.innerHTML = `<div class="shell passport-wire">
      <header class="passport-wire__header"><div><small>PASSPORT RADIO · GLOBAL WIRE 24H</small><h2>O mundo da música.<br>Sem intervalo.</h2></div><div class="passport-wire__live" aria-live="polite"><span></span><strong>AO VIVO</strong><small>${total ? `${total} SINAIS EM PORTUGUÊS` : 'TRADUZINDO AGORA'}${updated ? ` · ${esc(updated)}` : ''}</small></div></header>
      <div class="passport-wire__masthead">${hero()}<aside class="passport-wire__rail" aria-label="Últimos sinais globais"><div class="passport-wire__rail-title">ÚLTIMAS AGORA</div>${rail() || '<p class="passport-wire__waiting">Primeiros Signals em tradução…</p>'}</aside></div>
      <div class="passport-wire__strip" aria-hidden="true"><span>ROCK</span><span>METAL</span><span>ALTERNATIVE</span><span>CLASSIC ROCK</span><span>PUNK</span><span>BLUES</span><span>INDIE</span><span>ÁSIA</span><span>AMÉRICA LATINA</span><span>EUROPA</span></div>
      <div class="passport-wire__section-head"><div><small>RADAR EDITORIAL MUNDIAL</small><h3>Notícias entrando agora.</h3></div><a href="/editorial.html">MR. NOMAD · HISTÓRIAS PREMIUM →</a></div>
      <div class="passport-wire__stream">${visible.map(card).join('') || '<div class="passport-wire__waiting">Traduzindo os primeiros Signals para português…</div>'}</div>
      ${(state.raw.length > state.signals.length || state.visible < total) ? `<div class="passport-wire__more-wrap"><button class="passport-wire__more" type="button" data-passport-wire-more>${state.translating ? 'TRADUZINDO…' : 'MAIS NOTÍCIAS · 30 →'}</button></div>` : ''}
      <footer class="passport-wire__footer"><div><strong>— MR. NOMAD</strong><span>Every Song Is A Destination.</span></div><small>RADAR GLOBAL · PT-BR · ATUALIZAÇÃO AUTOMÁTICA 24H</small></footer>
    </div>`;
    const more = section.querySelector('[data-passport-wire-more]');
    if (more) more.addEventListener('click', () => {
      state.visible += PAGE_SIZE;
      state.desired = Math.min(state.raw.length, Math.max(state.desired + PAGE_SIZE, state.visible + 14));
      render();
      translateToDesired();
    }, { once:true });
  };

  const refresh = async () => {
    try {
      const next = await loadRawSignals();
      if (!next.items.length) return;
      state.raw = next.items;
      state.updatedAt = next.generatedAt || new Date().toISOString();
      state.signals = translatedFromCache(state.raw);
      render();
      translateToDesired();
    } catch (_) {
      // Last translated snapshot remains visible.
    }
  };

  const boot = async () => {
    ensureStyle();
    render();
    const [premium, raw] = await Promise.allSettled([loadPremium(), loadRawSignals()]);
    if (premium.status === 'fulfilled') state.premium = premium.value;
    if (raw.status === 'fulfilled' && raw.value.items.length) {
      state.raw = raw.value.items;
      state.updatedAt = raw.value.generatedAt || new Date().toISOString();
      state.signals = translatedFromCache(state.raw);
      rememberSignals(state.signals);
    }
    render();
    translateToDesired();
    if (state.timer) clearInterval(state.timer);
    state.timer = setInterval(refresh, REFRESH_MS);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
  else boot();
})();

/* =========================================================
   KEEP IT ON AIR · PAYPAL
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
    link.innerHTML = `<span class="passport-support-float__copy"><strong>MANTENHA A PASSPORT NO AR</strong><small>APOIO DIRETO · PAYPAL</small></span><span class="passport-support-float__go" aria-hidden="true">↗</span>`;
    document.body.appendChild(link);
  };

  const renderHostedButton = () => {
    const container = document.getElementById(`paypal-container-${HOSTED_BUTTON_ID}`);
    if (!container || container.dataset.rendered === '1') return;
    if (!window.paypal || typeof window.paypal.HostedButtons !== 'function') return;
    try {
      container.dataset.rendered = '1';
      const result = window.paypal.HostedButtons({ hostedButtonId: HOSTED_BUTTON_ID }).render(`#paypal-container-${HOSTED_BUTTON_ID}`);
      if (result && typeof result.catch === 'function') result.catch(() => { container.dataset.rendered = '0'; });
    } catch (_) { container.dataset.rendered = '0'; }
  };

  const loadPayPalSDK = () => {
    if (window.paypal && typeof window.paypal.HostedButtons === 'function') return renderHostedButton();
    const existing = document.querySelector('script[data-passport-paypal-sdk]');
    if (existing) return existing.addEventListener('load', renderHostedButton, { once:true });
    const script = document.createElement('script');
    script.src = SDK_URL;
    script.async = true;
    script.dataset.passportPaypalSdk = '1';
    script.addEventListener('load', renderHostedButton, { once:true });
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
    block.innerHTML = `<a class="btn passport-paypal-direct" href="${PAYPAL_URL}" target="_blank" rel="noopener">APOIAR VIA PAYPAL ↗</a><div id="paypal-container-${HOSTED_BUTTON_ID}" aria-label="Pagamento PayPal"></div><small class="passport-paypal-support__caption">PayPal é uma alternativa direta ao apoio via Asaas. Você escolhe a rota.</small>`;
    if (asaas && asaas.parentNode === supportBox) asaas.insertAdjacentElement('afterend', block);
    else supportBox.prepend(block);
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        loadPayPalSDK();
      }, { rootMargin:'300px 0px' });
      observer.observe(block);
    } else loadPayPalSDK();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installHomeSupport, { once:true });
  else installHomeSupport();
})();
