/* PASSPORT PERSIST NAV · shell stays; content swaps. Playback is the live iframe.
   History API + in-memory Map cache. Does not fake playback with storage. */
(() => {
  "use strict";
  if (window.PassportPersistNav) return;

  const HOUSE_PAGE = /\/(radio-[^/]+\.html|globo-de-ouro-player\.html|radio\.html|passport-player[^/]*|adapter-lab\.html)$/i;
  const SKIP_SRC = /passport-persist-nav|passport-home-houses|passport-now-info|passport-bus|passport-live\.js|continuous-signals-home|passport-shell|passport-portal|fofonete-exit-intent/;
  const cache = new Map();
  let navigating = false;

  function abs(href, base) {
    try { return new URL(href, base || location.href); } catch (_) { return null; }
  }
  function isHome(url) {
    const p = (url.pathname || "/").replace(/\/+$/, "") || "/";
    return p === "/" || p === "/index.html";
  }
  function isCompat(url) {
    if (!url || url.origin !== location.origin) return false;
    if (HOUSE_PAGE.test(url.pathname)) return false;
    if (/\.(mp3|mp4|pdf|zip|png|jpe?g|webp|svg|json)$/i.test(url.pathname)) return false;
    if (url.pathname !== "/" && !/\.html$/i.test(url.pathname)) return false;
    return true;
  }
  function pageRoot() {
    let el = document.getElementById("pp-nav-page");
    if (!el) {
      el = document.createElement("div");
      el.id = "pp-nav-page";
      el.hidden = true;
      document.body.appendChild(el);
    }
    return el;
  }
  function adoptSheets(doc) {
    doc.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
      const href = link.getAttribute("href");
      if (!href) return;
      const absHref = abs(href, location.href);
      if (!absHref) return;
      if ([...document.querySelectorAll("link[rel=stylesheet]")].some((l) => l.href === absHref.href)) return;
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = absHref.href;
      document.head.appendChild(l);
    });
  }
  function skipNode(n) {
    if (!n || n.nodeType !== 1) return false;
    const id = n.id || "";
    if (id === "passport-player" || id === "pp-persist" || id === "pp-nav-page") return true;
    const cls = n.classList;
    if (!cls) return false;
    if (cls.contains("player") && id === "passport-player") return true;
    if (cls.contains("pp-topbar") || cls.contains("pp-nav") || cls.contains("pp-footer")) return true;
    return false;
  }
  function runScripts(root) {
    root.querySelectorAll("script").forEach((old) => {
      const src = old.getAttribute("src") || "";
      if (SKIP_SRC.test(src)) {
        old.remove();
        return;
      }
      const s = document.createElement("script");
      [...old.attributes].forEach((a) => s.setAttribute(a.name, a.value));
      if (!old.src) s.textContent = old.textContent;
      old.replaceWith(s);
    });
  }
  function fillPage(doc) {
    const wrap = document.createElement("div");
    wrap.className = "pp-nav-page-in";
    const main = doc.querySelector("main") || doc.querySelector(".fd-page") || doc.querySelector(".blog-page");
    if (main) wrap.appendChild(document.importNode(main, true));
    else {
      [...doc.body.childNodes].forEach((n) => {
        if (n.nodeType === 3) wrap.appendChild(document.importNode(n, true));
        if (skipNode(n)) return;
        if (n.nodeType === 1 && n.tagName === "SCRIPT") return;
        if (n.nodeType === 1) wrap.appendChild(document.importNode(n, true));
      });
    }
    doc.body.querySelectorAll("script").forEach((old) => {
      if (main && main.contains(old)) return;
      const src = old.getAttribute("src") || "";
      if (SKIP_SRC.test(src)) return;
      wrap.appendChild(document.importNode(old, true));
    });
    return wrap;
  }
  function keepHomeClass() {
    if (!document.body.classList.contains("pp-home")) document.body.classList.add("pp-home");
    if (!document.body.classList.contains("pp-body")) document.body.classList.add("pp-body");
  }
  function setAway(on) {
    document.body.classList.toggle("pp-nav-away", on);
    keepHomeClass();
    const page = pageRoot();
    if (on) {
      page.hidden = false;
      document.body.style.overflow = "hidden";
    } else {
      page.hidden = true;
      page.replaceChildren();
      document.body.style.overflow = "";
      document.body.className = document.body.className
        .replace(/\bfd-body\b/g, "")
        .replace(/\bpp-station\b/g, "")
        .replace(/\bpp-listing\b/g, "")
        .replace(/\bpp-blog\b/g, "")
        .trim();
      keepHomeClass();
    }
    if (window.PassportHouses) window.PassportHouses.sync();
  }
  async function load(url, push) {
    if (navigating) return;
    if (isHome(url)) {
      if (push) history.pushState({ppNav: 1, href: url.href}, "", url.href);
      document.title = "Passport Radio | Every Song Is A Destination";
      setAway(false);
      return;
    }
    navigating = true;
    try {
      let html = cache.get(url.pathname + url.search);
      if (!html) {
        const res = await fetch(url.href, {credentials: "same-origin"});
        const type = res.headers.get("content-type") || "";
        if (!res.ok || type.indexOf("html") === -1) {
          location.href = url.href;
          return;
        }
        html = await res.text();
        cache.set(url.pathname + url.search, html);
      }
      const doc = new DOMParser().parseFromString(html, "text/html");
      adoptSheets(doc);
      const page = pageRoot();
      page.replaceChildren();
      page.appendChild(fillPage(doc));
      document.title = doc.title || document.title;
      const bodyClass = (doc.body.getAttribute("class") || "").replace(/\bpp-home\b/g, "").trim();
      document.body.className = ("pp-body pp-home pp-nav-away pp-persist-ready " + bodyClass).trim();
      if (document.getElementById("passport-casa-host") && document.getElementById("passport-casa-host").dataset.house) {
        document.body.classList.add("pp-house-selected");
      }
      page.hidden = false;
      document.body.style.overflow = "hidden";
      runScripts(page);
      page.scrollTop = 0;
      if (push) history.pushState({ppNav: 1, href: url.href}, "", url.href);
      if (window.PassportHouses) window.PassportHouses.sync();
    } catch (_) {
      location.href = url.href;
    } finally {
      navigating = false;
    }
  }

  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const a = event.target.closest("a[href]");
    if (!a) return;
    if (a.target && a.target !== "_self") return;
    if (a.hasAttribute("download")) return;
    if (a.closest("#passport-casas")) return;
    if (a.hasAttribute("data-open-existing-house")) return;
    const url = abs(a.getAttribute("href"));
    if (!url || !isCompat(url)) return;
    if (url.href.split("#")[0] === location.href.split("#")[0] && url.hash) return;
    event.preventDefault();
    load(url, true);
  }, true);

  window.addEventListener("popstate", () => {
    const url = abs(location.href);
    if (!url) return;
    if (!isCompat(url)) {
      location.reload();
      return;
    }
    load(url, false);
  });

  window.PassportPersistNav = {
    go(href) {
      const url = abs(href);
      if (!url) return;
      if (!isCompat(url)) { location.href = href; return; }
      load(url, true);
    },
    home() { load(abs("/index.html"), true); },
    isAway() { return document.body.classList.contains("pp-nav-away"); },
    isCompat: (href) => {
      const url = abs(href);
      return !!(url && isCompat(url));
    }
  };
})();
