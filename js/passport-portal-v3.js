/* PASSPORT PORTAL v3.9-rescue — único writer de #pp-feed. */
(() => {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const AMP = String.fromCharCode(38);
  const esc = (s) => String(s == null ? "" : s)
    .replace(/&/g, AMP + "amp;")
    .replace(/</g, AMP + "lt;")
    .replace(/>/g, AMP + "gt;")
    .replace(/"/g, AMP + "quot;")
    .replace(/'/g, AMP + "#39;");
  const safeHref = (v) => {
    const h = String(v == null ? "" : v).trim();
    if (!h) return "#";
    if (/^(?:[\/?#.]|https?:|mailto:|tel:)/i.test(h)) return esc(h);
    return "#";
  };
  const FEEDS = ["/data/editorial-priority-feed.json", "/data/editorial-manual-feed.json", "/data/editorial-feed.json"];
  const MISSION_COVER = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjY6SH2hyyFKaVndenvIK7088r1hW1z8h8wuS3m0FSvw";
  const LEGACY = [
    ["the-mission", MISSION_COVER],
    ["sisters-of-mercy", MISSION_COVER],
    ["rhapsody-of-fire", "/images/rhapsody-of-fire/Rhapsody-3-madrid.jpg"],
    ["therion-miskolc", "/images/therion-miskolc/maxresdefault32.jpg"],
    ["1986-musicas", "/images/1986/attachment-social-image-366-2026-08-10-09-04-20.webp"],
    ["eye-of-the-tiger", "/images/rocky_3_metro_goldwyn_mayer.webp"],
    ["frank-beard", "/images/frank-beard-zz-top-01.jpg"],
    ["live-aid", "/images/passport-radio-definitive.jpg"]
  ];
  const state = (v) => { try { document.documentElement.dataset.portalState = v; } catch (e) {} };
  const die = (msg) => {
    state("error:" + msg);
    const b = $("#pp-feed");
    if (b) b.innerHTML = '<p class="rv6-empty">Falha no rio: ' + esc(msg) + "</p>";
    console.error("[portal-v3]", msg);
  };
  function resolveImage(item) {
    const im = item && item.image;
    if (im && im.src && im.approved !== false) return { src: im.src, alt: im.alt || item.title || "", credit: im.credit || "", fit: im.fit || "cover" };
    const slug = String((item && (item.slug || item.url || item.title)) || "").toLowerCase();
    for (let i = 0; i < LEGACY.length; i++) if (slug.indexOf(LEGACY[i][0]) !== -1) return { src: LEGACY[i][1], alt: item.title || "", credit: "Passport Radio", fit: "cover" };
    return null;
  }
  const media = (img, eager) => {
    if (!img || !img.src) return "";
    const load = eager ? 'fetchpriority="high" loading="eager"' : 'loading="lazy" decoding="async"';
    return '<div class="rv6-media"><img src="' + esc(img.src) + '" alt="' + esc(img.alt || "") + '" ' + load + ' onerror="this.parentNode.setAttribute(\'data-img\',\'error\')">' + (img.credit ? '<span class="rv6-credit">' + esc(img.credit) + "</span>" : "") + "</div>";
  };
  const kick = (t) => '<span class="rv6-kicker">' + esc(String(t || "").replace(/_/g, " ")) + "</span>";
  const meta = (it) => '<span class="rv6-meta">' + esc(it.published_at ? String(it.published_at).slice(0, 10) : "") + (it.author ? " · <b>" + esc(it.author) + "</b>" : "") + "</span>";
  async function loadAll() {
    const out = []; const seen = new Set();
    const results = await Promise.allSettled(FEEDS.map((u) => fetch(u, { cache: "no-store" }).then((r) => { if (!r.ok) throw new Error(u + " -> " + r.status); return r.json(); })));
    results.forEach((res, i) => {
      if (res.status !== "fulfilled") { console.warn("[portal-v3] fonte:", FEEDS[i], res.reason); return; }
      const d = res.value;
      const items = Array.isArray(d) ? d : (d && Array.isArray(d.items) ? d.items : []);
      items.forEach((it) => {
        const key = String(it.url || it.title || "").trim();
        if (!key || seen.has(key)) return;
        seen.add(key); out.push(it);
      });
    });
    return out;
  }
  function render(items) {
    const b = $("#pp-feed");
    if (!b) { die("#pp-feed ausente"); return; }
    if (!items.length) {
      state("empty");
      b.innerHTML = '<p class="rv6-empty">O arquivo está acordando… nenhuma matéria chegou dos feeds.</p>';
      return;
    }
    state("ok:" + items.length);
    let i = 0; let h = "";
    const lead = items[i++];
    const limg = resolveImage(lead);
    h += '<article class="rv6-lead">' + media(limg, true) + kick(lead.category) + '<h2><a href="' + safeHref(lead.url) + '">' + esc(lead.title) + "</a></h2><p class=\"rv6-deck\">" + esc(lead.deck || "") + "</p>" + meta(lead) + "</article>";
    if (items.length - i >= 2) {
      h += '<div class="rv6-duo">';
      [items[i++], items[i++]].forEach((it) => {
        h += '<a class="rv6-duo-item" href="' + safeHref(it.url) + '">' + media(resolveImage(it)) + kick(it.category) + "<h3>" + esc(it.title) + "</h3></a>";
      });
      h += "</div>";
    }
    h += '<div class="rv6-band"><i></i><b>PASSPORT ON AIR · 24H</b><span>Continuous Signals™ · Live & Rare™ · Tunnels™</span><a href="radio.html">OUVIR →</a></div>';
    h += items.slice(i).map((it) => '<a class="rv6-row" href="' + safeHref(it.url) + '">' + media(resolveImage(it)) + "<span>" + kick(it.category) + "<h3>" + esc(it.title) + "</h3><p>" + esc(String(it.deck || "").slice(0, 140)) + "</p>" + meta(it) + "</span></a>").join("");
    b.innerHTML = h;
    const fill = (sel, arr) => {
      const el = $(sel); if (!el) return;
      el.innerHTML = arr.map((it) => "<li><a href=\"" + safeHref(it.url) + "\">" + esc(it.title) + "</a></li>").join("");
    };
    fill("#pp-reco", items.slice(0, 6));
    fill("#pp-missed", items.slice(6, 12));
    fill("#pp-today", items.slice(12, 18));
    const tags = $("#pp-assuntos");
    if (tags) {
      const c = {};
      items.forEach((it) => { const k = it.category || "geral"; c[k] = (c[k] || 0) + 1; });
      tags.innerHTML = Object.keys(c).map((k) => '<a href="destinos.html?q=' + encodeURIComponent(k) + '">' + esc(k.replace(/_/g, " ")) + "</a>").join("");
    }
    window.PASSPORT_FEED_ITEMS = items;
    console.info("[portal-v3] rio vivo:", items.length);
  }
  async function boot() {
    try { render(await loadAll()); } catch (e) { die(String((e && e.message) || e)); }
  }
  window.PassportPortal = { refresh: boot };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
