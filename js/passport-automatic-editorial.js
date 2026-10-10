/* Automatic articles use the existing institutional App and its sole transport.
   No station, media engine, selection, volume or mutex is implemented here. */
(() => {
  'use strict';
  if (window.PassportAutomaticEditorial) return;
  const automatic = () => !!document.querySelector('main[data-passport-automatic-article]');
  const script = (src) => new Promise((resolve, reject) => {
    if ([...document.scripts].some(s => s.src.split('?')[0] === new URL(src, location.href).href.split('?')[0])) { resolve(); return; }
    const node = document.createElement('script'); node.src = src;
    node.onload = resolve; node.onerror = reject; document.head.append(node);
  });
  const css = href => {
    if ([...document.querySelectorAll('link[rel="stylesheet"]')].some(l => l.href === new URL(href, location.href).href)) return;
    const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = href; document.head.append(link);
  };
  function decorate() {
    const active = automatic();
    document.body.toggleAttribute('data-passport-automatic', active);
    document.querySelectorAll('[data-passport-automatic-nav]').forEach(n => n.remove());
    // Reference classes also provide wrapping: the App's horizontal strip
    // would otherwise clip the first destinations when all routes are shown.
    for (const [selector, name] of [['.pb-mast__logo','participe-paper-mast__logo'],['.pb-nav','participe-paper-nav'],['.pb-footer','participe-paper-footer'],['.pb-footer__brand','participe-paper-footer-brand'],['.pb-footer__bottom','participe-paper-footer-bottom']]) {
      document.querySelector('#root '+selector)?.classList.toggle(name, active);
    }
    if (!active) return;
    // Existing approved destinations omitted from the current App's nav.
    const list = document.querySelector('#root .pb-nav ul');
    if (list) for (const [href, label, after] of [['/radio.html','Podcast & Broadcast','/videos.html'],['/promocoes.html','Promoções','/divulgar-bandas.html']]) {
      if ([...list.querySelectorAll('a')].some(a => a.getAttribute('href') === href)) continue;
      const anchor = [...list.querySelectorAll('a')].find(a => a.getAttribute('href') === after)?.closest('li');
      const li = document.createElement('li'); li.dataset.passportAutomaticNav = '1';
      const a = document.createElement('a'); a.href = href; a.textContent = label; li.append(a);
      if (anchor) anchor.after(li); else list.append(li);
    }
    css('/css/payment-footer-trust.css');
    // Same shared footer/support loader used by the reference article.
    script('/js/passport-legal-footer.js?v=20260903').catch(console.error);
  }
  async function mount() {
    if (!automatic()) return;
    if (document.querySelector('#root #passport-editorial-outlet')) { decorate(); return; }
    const initial = document.cloneNode(true);
    try {
      // Resolve the current approved App from Home, rather than copy its chrome
      // or pin a second build/player in the editorial factory.
      const response = await fetch('/', {credentials:'same-origin'});
      if (!response.ok) throw Error('Passport Home unavailable: ' + response.status);
      const home = new DOMParser().parseFromString(await response.text(), 'text/html');
      const entry = home.querySelector('script[type="module"][src^="/assets/index-"]');
      if (!entry) throw Error('Approved institutional App missing');
      home.querySelectorAll('link[rel="stylesheet"]').forEach(l => css(l.getAttribute('href')));
      window.PassportInstitutionalHost = true;
      window.PassportEditorialRoute = location.pathname + location.search + location.hash;
      window.PassportInitialEditorial = initial;
      const root = document.createElement('div'); root.id = 'root';
      document.body.replaceChildren(root);
      await script('/js/passport-audio-continuity.js');
      const module = document.createElement('script'); module.type = 'module'; module.src = entry.getAttribute('src');
      module.onerror = () => { if (!document.querySelector('#passport-editorial-outlet main')) root.replaceChildren(initial.querySelector('main').cloneNode(true)); };
      document.head.append(module);
    } catch (error) { console.error('Passport automatic editorial:', error); }
  }
  window.PassportAutomaticEditorial = Object.freeze({decorate});
  window.addEventListener('passport:editorial-rendered', decorate);
  window.addEventListener('passport:editorial-route', () => {
    document.body.removeAttribute('data-passport-automatic');
    document.querySelectorAll('[data-passport-automatic-nav]').forEach(n => n.remove());
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, {once:true}); else mount();
})();
