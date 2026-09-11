/* Home compositor. RSS off Home. Max 10 Nomad. No audio. */
(() => {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => {
    if (c === "&") return "&" + "amp;";
    if (c === "<") return "&" + "lt;";
    if (c === ">") return "&" + "gt;";
    if (c === '"') return "&" + "quot;";
    return "&#39;";
  });
  const safeHref = (v) => /^(?:[/?#.]|https?:|mailto:|tel:)/i.test(String(v || "").trim()) ? esc(String(v).trim()) : "#";
  const BRAND_LOGO = /passport-radio-definitive/i;
  const YT_GENERIC = /img\.youtube\.com\/vi\/Rck7vZN5dRI/i;
  function usablePhoto(item) {
    const im = item && item.image;
    if (!im || !im.src || im.approved === false) return null;
    if (BRAND_LOGO.test(im.src) || YT_GENERIC.test(im.src)) return null;
    return im;
  }
  function picture(item, eager) {
    const im = usablePhoto(item);
    if (!im) return "";
    const load = eager ? 'fetchpriority="high" loading="eager"' : 'loading="lazy" decoding="async"';
    return '<figure class="journey-media"><img src="' + esc(im.src) + '" alt="' + esc(im.alt || item.title || "") + '" ' + load + ' style="object-position:' + esc(im.focalPoint || "50% 40%") + '" onerror="this.closest(\'figure\').remove()"></figure>';
  }
  const kicker = (item) => '<span class="journey-kicker">' + esc(String(item.category || item.format || "Mr. Nomad").replace(/_/g, " ")) + "</span>";
  const meta = (item) => '<span class="journey-meta">' + esc(String(item.published_at || "").slice(0, 10)) + (item.author ? " \u00b7 <b>" + esc(item.author) + "</b>" : "") + "</span>";
  function card(item, cls, eager) {
    const extra = usablePhoto(item) ? "" : " journey-story--nophoto";
    return '<article class="' + cls + extra + '">' + picture(item, eager) + '<div class="journey-story__copy">' + kicker(item) + '<h3><a href="' + safeHref(item.url) + '">' + esc(item.title) + "</a></h3>" + (item.deck ? "<p>" + esc(item.deck) + "</p>" : "") + meta(item) + "</div></article>";
  }
  function slotFor(item, i) {
    const photo = !!usablePhoto(item);
    const map = photo ? ["s-row-r", "s-tile", "s-row-l", "s-tile", "s-tile", "s-row-r", "s-tile"] : ["s-text", "s-text", "s-text", "s-text", "s-text", "s-text", "s-text"];
    return "journey-story " + (map[i] || "s-tile");
  }
  function isNomad(item) {
    return /nomad|MR_NOMAD|autoral/i.test((item.author || "") + " " + (item.format || "") + " " + (item.category || ""));
  }
  async function readFeed(url) {
    try {
      const r = await fetch(url, {cache: "no-store"});
      if (!r.ok) return [];
      const data = await r.json();
      return Array.isArray(data) ? data : (data.items || []);
    } catch (e) { return []; }
  }
  function dedupe(items) {
    const seen = new Set(); const out = [];
    items.forEach((item) => {
      const key = String(item.url || item.title || "").split("?")[0].trim();
      if (!key || seen.has(key)) return;
      seen.add(key); out.push(item);
    });
    return out;
  }
  function territory() {
    return '<section class="fd-territory" data-open-existing-house="/radio-80s.html"><span class="fd-week__kicker">TERRIT\u00d3RIO</span><em class="fd-sign">a d\u00e9cada como destino</em><h2>Anos 80</h2><p>R\u00e1dio, novela, pista e palco. Ouve o sinal que j\u00e1 existe nesta p\u00e1gina.</p><button type="button" data-open-existing-house="/radio-80s.html">OUVIR 80s NESTA P\u00c1GINA</button></section>';
  }
  function weekHtml(week) {
    if (!week.length) return '<p class="journey-empty">A edi\u00e7\u00e3o da semana est\u00e1 sendo composta.</p>';
    const cover = week[0];
    const companions = week.slice(1, 3);
    const rest = week.slice(3);
    return '<section class="journey-cover fd-week"><header><span class="fd-week__kicker">MR. NOMAD \u00b7 ESTA SEMANA</span><h1>A edi\u00e7\u00e3o autoral.</h1><em class="fd-sign">Every Song Is A Destination</em></header><div class="journey-cover__grid">' + card(cover, "journey-story journey-story--cover", true) + '<div class="journey-companions">' + companions.map((item) => card(item, "journey-story journey-story--companion")).join("") + "</div></div></section>" + (rest.length ? '<div class="journey-rest">' + rest.map((item, i) => card(item, slotFor(item, i))).join("") + "</div>" : "") + territory();
  }
  async function boot() {
    const packs = await Promise.all([
      readFeed("/data/editorial-priority-feed.json"),
      readFeed("/data/editorial-manual-feed.json")
    ]);
    const pool = dedupe(packs[0].concat(packs[1]));
    const nomad = pool.filter(isNomad);
    const week = (nomad.length ? nomad : pool).slice(0, 10);
    const feed = $("#pp-feed");
    if (feed) feed.innerHTML = weekHtml(week);
    const after = $("#pp-after");
    if (after) after.innerHTML = '<nav class="fd-paths" aria-label="Continuar"><a href="noticias.html">Not\u00edcias</a><a href="editorial.html">Arquivo</a><a href="radio.html">R\u00e1dio 24H</a></nav>';
    window.PASSPORT_FEED_ITEMS = week;
    window.PASSPORT_HOME_PHOTO_GAPS = week.filter((x) => !usablePhoto(x)).map((x) => ({title: x.title, url: x.url, src: x.image && x.image.src}));
    document.dispatchEvent(new CustomEvent("passport:journey-ready", {detail: {count: week.length}}));
  }
  window.PassportPortal = {refresh: boot};
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, {once: true});
  else boot();
})();
