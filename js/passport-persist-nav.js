/* Shared editorial navigation. Keep the current document and its opaque radio
   hosts alive; the reader gets the original editorial document, CSS and scripts. */
(() => {
  'use strict';
  if (window.PassportPersistNav) return;
  // A reader frame belongs to its existing outer navigation, never another shell.
  try { if (window !== top && top.PassportPersistNav?.owns(window)) return; } catch (_) {}

  const originHome = /^(\/|\/index\.html)$/.test(location.pathname);
  if (!originHome && !/^\/(?:noticias|editorial|blog)\.html$/.test(location.pathname) &&
      !/^\/blog\//.test(location.pathname) &&
      !document.querySelector('body.pp-article,.pe-prose,.mn-prose,article.prose,main.story')) return;
  const originURL = location.href;
  const originTitle = document.title;
  const excluded = /\/(?:radio[^/]*|globo-de-ouro-player|passport-player[^/]*|adapter-lab)\.html$/i;
  let frame, currentURL, savedOverflow, pending = 0;
  // Presentation only: keep the opaque transport mounted, remove the underlying
  // page from the reader's visual/accessibility flow until the reader closes.
  const presentation = document.createElement('style');
  presentation.textContent = 'body.pp-editorial-reader-active{height:100dvh;overflow:hidden!important}body.pp-editorial-reader-active> :not(#root):not(#pp-nav-page):not(#qwen-engine-bay):not(#passport-casa-host):not(script):not(style){visibility:hidden!important;position:fixed!important}body.pp-editorial-reader-active #root{position:fixed;inset:0 0 auto;z-index:2147483001;background:#fff}body.pp-editorial-reader-active #root>:not(.player-bar):not(.pb-door){display:none!important}body.pp-editorial-reader-active #root .pb-door{max-height:35dvh;overflow:auto;margin-top:0;margin-bottom:0}#pp-nav-page[hidden]{display:none!important}#pp-nav-page:not([hidden]){display:block!important}';
  document.head.append(presentation);
  const root = document.getElementById('root');
  const priorInert = root?.inert;
  function readerActive(active) {
    document.body.classList.toggle('pp-editorial-reader-active', active);
    // The approved Home facade stays in its React root. Keep its real controls
    // and complete catalog reachable; hide only the Home's editorial sections.
    if (root) root.inert = priorInert;
    readerBounds();
  }
  function readerBounds() {
    if(!frame)return;
    const height=root && document.body.classList.contains('pp-editorial-reader-active') ? root.getBoundingClientRect().height : 0;
    frame.style.top=height+'px';
    frame.style.height='calc(100dvh - '+height+'px)';
  }
  if(root && typeof ResizeObserver==='function')new ResizeObserver(readerBounds).observe(root);
  window.addEventListener('resize',readerBounds);
  const urlOf = href => { try { return new URL(href, location.href); } catch (_) { return null; } };
  const home = url => /^(\/|\/index\.html)$/.test(url.pathname);
  const compatible = url => url && url.origin === location.origin && !excluded.test(url.pathname) &&
    (home(url) || /\.html$/i.test(url.pathname) || /^\/blog\/(?:[^?#]*\/)?$/.test(url.pathname));
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
      if(root?.querySelector('.player-bar'))window.PassportContinuity?.detachControls();
      else window.PassportContinuity?.attachControls(doc);
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
      readerActive(false);
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
      readerActive(true);
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
      readerActive(false);
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

