/* Shared editorial navigation. Keep the current document and its opaque radio
   hosts alive; the reader gets the original editorial document, CSS and scripts. */
(() => {
  'use strict';
  if (window.PassportPersistNav) return;
  // A reader frame belongs to its existing outer navigation, never another shell.
  try { if (window !== top && top.PassportPersistNav?.owns(window)) return; } catch (_) {}

  const originHome = /^(\/|\/index\.html)$/.test(location.pathname);
  if (!originHome && !/^\/(?:noticias|editorial|blog)\.html$/.test(location.pathname) &&
      !document.querySelector('body.pp-article,.pe-prose,.mn-prose,article.prose,main.story')) return;
  const originURL = location.href;
  const originTitle = document.title;
  const excluded = /\/(?:radio[^/]*|globo-de-ouro-player|passport-player[^/]*|adapter-lab)\.html$/i;
  let frame, currentURL, savedOverflow, pending = 0;
  const urlOf = href => { try { return new URL(href, location.href); } catch (_) { return null; } };
  const home = url => /^(\/|\/index\.html)$/.test(url.pathname);
  const compatible = url => url && url.origin === location.origin && !excluded.test(url.pathname) &&
    (home(url) || /\.html$/i.test(url.pathname));
  const knownEditorial = url => /^\/(?:editorial|historias|blog)\//.test(url.pathname) ||
    /^\/(?:noticias|editorial|blog)\.html$/.test(url.pathname);

  async function editorial(url) {
    if (knownEditorial(url)) return true;
    // Legacy root-level articles use the same editorial families.
    const response = await fetch(url.href, {credentials:'same-origin'});
    if (!response.ok || !(response.headers.get('content-type') || '').includes('html')) return false;
    const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
    return !!doc.querySelector('body.pp-article,.pe-prose,.mn-prose,article.prose,main.story');
  }
  function attach(doc) {
    doc.addEventListener('click', click, true);
  }
  function reader() {
    if (frame) return frame;
    frame = document.createElement('iframe');
    frame.id = 'pp-nav-page';
    frame.title = 'Matéria — Passport Radio';
    frame.hidden = true;
    // Isolate the existing editorial CSS from the live Home; no layout rewrite.
    frame.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;border:0;background:#fff;z-index:2147483000';
    frame.addEventListener('load', () => {
      const doc = frame.contentDocument;
      if (!doc || !currentURL || frame.contentWindow.location.href !== currentURL.href) return;
      attach(doc);
      document.title = doc.title;
      window.PassportContinuity?.attachControls(doc);
      frame.focus();
    });
    document.body.append(frame);
    return frame;
  }
  async function load(url, push) {
    const token = ++pending;
    if (home(url)) {
      if (!originHome) { location.assign(url.href); return; }
      currentURL = null;
      if (frame) { frame.hidden = true; frame.contentWindow.location.replace('about:blank'); }
      document.body.style.overflow = savedOverflow ?? document.body.style.overflow;
      window.PassportContinuity?.detachControls();
      document.title = originTitle;
      if (push) history.pushState({ppNav:1}, '', url.href);
      return;
    }
    try {
      if (!await editorial(url)) { location.assign(url.href); return; }
      if (token !== pending) return;
      const view = reader();
      if (view.hidden) savedOverflow = document.body.style.overflow;
      currentURL = url;
      view.hidden = false;
      document.body.style.overflow = 'hidden';
      // Only the reader document changes. No engine, media node or source calls.
      view.contentWindow.location.replace(url.href);
      if (push) history.pushState({ppNav:1}, '', url.href);
    } catch (_) { if (token === pending) location.assign(url.href); }
  }
  function click(event) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const a = event.target.closest?.('a[href]');
    if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
    const url = new URL(a.href, a.ownerDocument.URL);
    if (url.hash && url.href.split('#')[0] === a.ownerDocument.URL.split('#')[0]) return;
    if (!compatible(url)) {
      if (a.ownerDocument !== document && /^https?:$/.test(url.protocol)) {
        event.preventDefault(); location.assign(url.href);
      }
      return;
    }
    event.preventDefault();
    load(url, true);
  }
  attach(document);
  window.addEventListener('popstate', () => {
    const url = urlOf(location.href);
    if (url.href === originURL && !originHome) {
      currentURL = null;
      if (frame) {frame.hidden=true;frame.contentWindow.location.replace('about:blank');}
      document.body.style.overflow = savedOverflow ?? '';
      window.PassportContinuity?.detachControls();
      document.title = originTitle;
    } else if (compatible(url)) load(url, false);
    else location.reload();
  });
  window.PassportPersistNav = Object.freeze({
    owns: child => !!frame && frame.contentWindow === child,
    go: href => { const url=urlOf(href); if(compatible(url)) return load(url,true); location.assign(href); },
    home: () => load(urlOf('/'),true),
    isAway: () => !!frame && !frame.hidden,
    isCompat: href => compatible(urlOf(href))
  });
})();
