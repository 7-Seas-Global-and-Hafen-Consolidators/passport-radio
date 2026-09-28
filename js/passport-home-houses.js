/* Home houses — native mount. No iframe. Radio engines/pages stay untouched. */
(() => {
  "use strict";
  const root = document.getElementById("passport-casas");
  const host = document.getElementById("passport-casa-host");
  const stage = host && host.querySelector(".casa-host-stage");
  if (!root || !host || !stage) return;

  let active = null;
  let gate = false;
  let mountedScripts = [];

  function stopMountedMedia() {
    stage.querySelectorAll("audio,video").forEach(m => {
      try { m.pause(); m.removeAttribute("src"); m.load(); } catch (_) {}
    });
    try { window.PassportBus && window.PassportBus.silence && window.PassportBus.silence(); } catch (_) {}
  }

  function clearStage() {
    stopMountedMedia();
    mountedScripts.forEach(s => s.remove());
    mountedScripts = [];
    stage.replaceChildren();
  }

  function setHost(card) {
    host.hidden = false;
    host.classList.add("is-active");
    host.dataset.house = card.dataset.house || "";
    host.dataset.name = card.dataset.name || "";
    const title = document.getElementById("passport-casa-host-title");
    if (title) title.textContent = card.dataset.name || "";
    const open = document.getElementById("passport-casa-host-open");
    if (open) open.href = card.dataset.house || "#";
  }

  function cleanFragment(doc) {
    const body = doc.body.cloneNode(true);
    body.querySelectorAll("header.house-head,.pp-topbar,.pp-nav,footer,.pp-footer,#fofonete-dock,.fofonete-dock,script").forEach(n => n.remove());
    body.querySelectorAll('a[target="_top"][href*="passport-casas"]').forEach(n => n.remove());
    return body;
  }

  function stylesheetHrefs(doc) {
    return [...doc.querySelectorAll('link[rel="stylesheet"][href]')]
      .map(x => x.getAttribute("href"))
      .filter(Boolean)
      .filter(h => !/fofonete|passport-tokens|passport-portal|passport-legal-footer|passport-paper-home/.test(h));
  }

  function scriptSrcs(doc) {
    return [...doc.querySelectorAll("script[src]")]
      .map(x => x.getAttribute("src"))
      .filter(Boolean)
      .filter(s => !/passport-bus\.js|fofonete-exit-intent|passport-signal-habitat|passport-house\.js|passport-legal-footer/.test(s));
  }

  function ensureScopedStyles(doc) {
    stylesheetHrefs(doc).forEach(href => {
      const key = "pp-native-style-" + btoa(unescape(encodeURIComponent(href))).replace(/[^a-z0-9]/gi,"");
      if (document.getElementById(key)) return;
      const link = document.createElement("link");
      link.id = key;
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
    });
  }

  function loadScripts(srcs) {
    return srcs.reduce((p, src) => p.then(() => new Promise(resolve => {
      const s = document.createElement("script");
      s.src = src;
      s.dataset.ppNativeHouse = "1";
      s.onload = resolve;
      s.onerror = resolve;
      document.body.appendChild(s);
      mountedScripts.push(s);
    })), Promise.resolve());
  }

  async function mountNative(card) {
    clearStage();
    setHost(card);
    const src = card.dataset.house;
    stage.innerHTML = '<div class="pp-house-loading">Abrindo…</div>';
    try {
      const res = await fetch(src, {credentials:"same-origin", cache:"no-store"});
      if (!res.ok) throw new Error("HTTP " + res.status);
      const html = await res.text();
      if (active !== card) return;
      const doc = new DOMParser().parseFromString(html, "text/html");
      ensureScopedStyles(doc);
      const fragment = cleanFragment(doc);
      stage.replaceChildren(...fragment.childNodes);
      await loadScripts(scriptSrcs(doc));
      if (active !== card) return;
      sync();
    } catch (err) {
      if (active === card) {
        stage.innerHTML = '<p class="pp-house-error">Não foi possível abrir este sinal aqui.</p>';
        console.error("[Passport Home] native house:", src, err);
      }
    }
  }

  function activate(card) {
    if (active === card && !host.hidden) return;
    gate = true;
    root.querySelectorAll("details[data-house]").forEach(other => {
      if (other !== card) other.open = false;
    });
    if (!card.open) card.open = true;
    gate = false;
    active = card;
    mountNative(card);
  }

  function deactivate() {
    const card = active;
    active = null;
    clearStage();
    gate = true;
    if (card) card.open = false;
    gate = false;
    host.hidden = true;
    host.classList.remove("is-active");
    host.removeAttribute("data-house");
    host.removeAttribute("data-name");
    sync();
  }

  function findPlayButton() {
    const ids = [
      "passport-live-play","tunnelPlay","passport80sPlay","passportSoulPlay",
      "passportMPBPlay","passportHitsPlay","passportBRRockPlay","passport5060Play",
      "novelasPlay","gdoPlay","world-play","passportJovemGuardaPlay",
      "passportNostalgiaPlay","passportWorldTunnelReggaePlay",
      "passportWorldDiscoDeutschlandPlay","passportFlashHousePlay"
    ];
    for (const id of ids) {
      const el = stage.querySelector("#" + id);
      if (el) return el;
    }
    return null;
  }

  function togglePlay() {
    const btn = findPlayButton();
    if (btn) btn.click();
  }

  function sync() {
    root.querySelectorAll("details[data-house]").forEach(card => {
      card.classList.toggle("is-selected", card === active);
    });
    const hp = document.getElementById("passport-casa-host-play");
    if (hp) hp.textContent = "Tocar / Pausar";
  }

  root.querySelectorAll("details[data-house]").forEach(card => {
    card.addEventListener("toggle", () => {
      if (gate) return;
      if (card.open) activate(card);
      else if (active === card) deactivate();
    });
  });

  const close = document.getElementById("passport-casa-host-close");
  if (close) close.addEventListener("click", deactivate);
  const play = document.getElementById("passport-casa-host-play");
  if (play) play.addEventListener("click", togglePlay);

  window.PassportHouses = {activate,deactivate,togglePlay,sync};
})();