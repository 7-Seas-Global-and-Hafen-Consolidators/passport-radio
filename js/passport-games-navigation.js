/* Complete the existing institutional navigation; never replace the page or its media. */
(() => {
  'use strict';
  if (window.PassportNavigation) { window.PassportNavigation.mount(); return; }
  const destinations = [
    ['/', 'Home'], ['/noticias.html', 'Notícias'], ['/agenda.html', 'Agenda'],
    ['/editorial.html', 'Arquivo'], ['/bandas/index.html', 'Bandas & Artistas'],
    ['/blog.html', 'Blog'], ['/jogos.html', 'Desafios Passport'],
    ['/clips-tv.html', 'Clips TV™'], ['/videos.html', 'Vídeos'],
    ['/blog/arquivo/letras.html', 'A–Z'], ['/radio.html', 'Podcast & Broadcast'],
    ['/#passport-radio-catalog', 'Rádio 24H'], ['/loja.html', 'Loja'],
    ['/divulgar-bandas.html', 'Participe'], ['/promocoes.html', 'Promoções'],
    ['/anuncie.html', 'Anuncie'], ['/doe.html', 'Apoie']
  ];
  const excluded = 'footer,main,article,.player,[id*="player"],.passport-continuity-controls';
  const principal = '.pb-nav,.news-nav,.archive-nav,.participe-paper-nav,.promo-paper-nav,.podcast-nav,.pp-nav,nav[aria-label="Seções"]';
  const key = anchor => {
    try {
      const url = new URL(anchor.getAttribute('href'), location.href);
      if (url.origin !== location.origin) return null;
      let path = url.pathname === '/index.html' ? '/' : url.pathname;
      if (path === '/bandas/') path = '/bandas/index.html';
      if (path === '/' && url.hash === '#passport-radio-catalog') return '/#passport-radio-catalog';
      if (url.hash || url.search) return null; // Keep cart actions and page tools untouched.
      return path;
    } catch (_) { return null; }
  };
  function current() {
    const p = location.pathname;
    if (/^\/(?:index\.html)?$/.test(p)) return location.hash === '#passport-radio-catalog' ? '/#passport-radio-catalog' : '/';
    if (/^\/loja\//.test(p)) return '/loja.html';
    if (/^\/blog\/(?:e\/|arquivo\/letras(?:\/|\.html))/.test(p)) return '/blog/arquivo/letras.html';
    if (/^\/blog\//.test(p)) return '/blog.html';
    if (/^\/(?:editorial|historias)\//.test(p)) return '/editorial.html';
    if (/^\/(?:bandas|artistas|bateristas|baixistas|guitarristas|vocalistas|anos-70|anos-80|anos-90)\//.test(p)) return '/bandas/index.html';
    return p;
  }
  function complete(nav) {
    const container = nav.querySelector(':scope > ul,:scope > ol,:scope > .pp-nav-in') || nav;
    const list = /^(UL|OL)$/.test(container.tagName);
    const existing = new Map();
    for (const a of container.querySelectorAll('a[href]')) {
      const k = key(a);
      if (!destinations.some(([href]) => href === k)) continue;
      if (existing.has(k)) {
        const item = list ? a.closest('li') : a;
        if (item && (!list || item.parentElement === container)) item.remove();
        continue;
      }
      existing.set(k, a);
    }
    const route = current();
    const selected = destinations.some(([href]) => href === route) ? route
      : [...existing].find(([, a]) => a.getAttribute('aria-current') === 'page')?.[0];
    for (let i = 0; i < destinations.length; i++) {
      const [href, label] = destinations[i];
      let a = existing.get(href);
      if (!a) {
        a = document.createElement('a');
        a.href = href;
        const sample = existing.values().next().value;
        if (sample) a.className = sample.className;
        const item = list ? document.createElement('li') : a;
        if (list) item.append(a);
        const next = destinations.slice(i + 1).map(([url]) => existing.get(url)).find(Boolean);
        container.insertBefore(item, next ? (list ? next.closest('li') : next) : null);
        existing.set(href, a);
      }
      if (a.getAttribute('href') !== href) a.setAttribute('href', href);
      if (a.textContent !== label) a.textContent = label;
      const active = href === selected;
      if (active && a.getAttribute('aria-current') !== 'page') a.setAttribute('aria-current', 'page');
      if (!active && a.hasAttribute('aria-current')) a.removeAttribute('aria-current');
    }
    if (!nav.hasAttribute('data-passport-navigation')) nav.dataset.passportNavigation = '1';
    if (!container.hasAttribute('data-passport-navigation-items')) container.dataset.passportNavigationItems = '1';
  }
  let queued = false;
  function mount() {
    if (!document.body) return;
    let navs = [...document.querySelectorAll('nav')].filter(nav => {
      if (nav.closest(excluded) || nav.matches('.pp-top-actions,.hub-nav')) return false;
      if (nav.matches(principal)) return true;
      const links = [...nav.querySelectorAll('a[href]')].map(key);
      return links.includes('/blog.html') && links.includes('/loja.html') && links.some(p => ['/', '/noticias.html'].includes(p));
    });
    // Some hubs and product pages have a masthead but only local/category links.
    if (!navs.length && !/^\/(?:app\/|radio-|player-|passport-player|adapter-lab)/.test(location.pathname) && !/-player\.html$/.test(location.pathname)) {
      const header = [...document.querySelectorAll('header')].find(n => !n.closest(excluded));
      if (header && document.querySelector('main')) {
        const nav = document.createElement('nav'); nav.setAttribute('aria-label', 'Seções');
        nav.className = 'passport-navigation-added'; header.after(nav); navs = [nav];
      }
    }
    if (!navs.length) return;
    if (!document.querySelector('link[data-passport-navigation-style]')) {
      const css = document.createElement('link'); css.rel = 'stylesheet';
      css.href = '/css/passport-navigation.css?v=20261019'; css.dataset.passportNavigationStyle = '1';
      document.head.append(css);
    }
    navs.forEach(complete);
  }
  function schedule() {
    if (queued) return;
    queued = true;
    queueMicrotask(() => { queued = false; mount(); });
  }
  window.PassportNavigation = Object.freeze({mount, destinations: Object.freeze(destinations.map(row => Object.freeze([...row])))});
  mount();
  new MutationObserver(schedule).observe(document.documentElement, {childList:true, subtree:true});
  window.addEventListener('passport:editorial-rendered', schedule);
  window.addEventListener('popstate', schedule);
  window.addEventListener('hashchange', schedule);
})();
