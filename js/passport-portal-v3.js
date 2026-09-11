/* PASSPORT HOME compositor four-doors r9. Grid 12: 7+5 / 8+4 / 4+4+4 / 7+5. RSS off Home. Max 10 Nomad. No audio. */
(() => {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({"&":"&","<":"<",">":">","\"":""","'":"&#39;"}[c]));
  const safeHref = (v) => /^(?:[/?#.]|https?:|mailto:|tel:)/i.test(String(v || "").trim()) ? esc(String(v).trim()) : "#";
  const BRAND_LOGO = /passport-radio-definitive/i;
  const WM = "https://commons.wikimedia.org/wiki/Special:FilePath/";
  const RECOVER = [
    {re:/dolly\s*parton/i, src:WM+"Young-Dolly-Parton_(higher_quality_scan).jpg", alt:"Dolly Parton, 1977 — RCA / public domain", credit:"Wikimedia Commons · RCA publicity 1977 · PD-US"},
    {re:/the\s*mission|wayne\s*hussey/i, src:WM+"The_mission_wayne_hussey.jpg", alt:"Wayne Hussey, The Mission — Mera Luna 2004", credit:"Wikimedia Commons · Stefan Füsers"},
    {re:/ratos\s*de\s*por/i, src:WM+"W2603_Hellfest2016_RatosDePorao_8151.jpg", alt:"Ratos de Porão no Hellfest 2016", credit:"Wikimedia Commons · Llann Wé² · CC BY-SA 4.0"},
    {re:/secos/i, src:WM+"Ney_Matogrosso_-_Singer_Composer_(3858541561).jpg", alt:"Ney Matogrosso, voz da formação clássica do Secos & Molhados", credit:"Wikimedia Commons · Carlos Ebert · CC BY 2.0"},
    {re:/joelho\s*de\s*porco|tico\s*terpins/i, src:WM+"Tico_Terpins_and_Janete_Guper_wedding_(143716151).jpg", alt:"Tico Terpins, fundador do Joelho de Porco", credit:"Wikimedia Commons · Carlos Ebert · CC BY 2.0"}
  ];
  function recover(item) {
    const t = (item.title || "") + " " + ((item.entities || []).join(" "));
    return RECOVER.find((row) => row.re.test(t)) || null;
  }
  function usablePhoto(item) {
    const rec = recover(item);
    if (rec) return {src:rec.src, alt:rec.alt, focalPoint:"50% 32%", credit:rec.credit, approved:true};
    const im = item && item.image;
    if (!im || !im.src || im.approved === false) return null;
    if (BRAND_LOGO.test(im.src)) return null;
    return im;
  }
  function picture(item, eager) {
    const im = usablePhoto(item);
    if (!im) return "";
    const load = eager ? 'fetchpriority="high" loading="eager"' : 'loading="lazy" decoding="async"';
    return '<figure class="journey-media"><img src="' + esc(im.src) + '" alt="' + esc(im.alt || item.title || "") + '" ' + load + ' style="object-position:' + esc(im.focalPoint || "50% 40%") + '"></figure>';
  }
  function verbete(item) {
    const cat = esc(String(item.category || item.format || "verbete").replace(/_/g, " "));
    const entities = (item.entities || []).slice(0, 3).join(" · ");
    const deck = item.deck ? esc(String(item.deck).slice(0, 120)) : "";
    return '<div class="journey-media journey-media--verbete" aria-hidden="true"><span>' + cat + "</span><b>" + esc(entities || String(item.title).slice(0, 60)) + "</b>" + (deck ? "<small>" + deck + "</small>" : "") + "</div>";
  }
  const kicker = (item) => '<span class="journey-kicker">' + esc(String(item.category || item.format || "Mr. Nomad").replace(/_/g, " ")) + "</span>";
  const meta = (item) => '<span class="journey-meta">' + esc(String(item.published_at || "").slice(0, 10)) + (item.author ? " · <b>" + esc(item.author) + "</b>" : "") + "</span>";
  function card(item, cls, eager) {
    const hasPhoto = !!usablePhoto(item);
    const extra = hasPhoto ? "" : " journey-story--nophoto";
    const media = hasPhoto ? picture(item, eager) : verbete(item);
    return '<article class="' + cls + extra + '">' + media + '<div class="journey-story__copy">' + kicker(item) + '<h3><a href="' + safeHref(item.url) + '">' + esc(item.title) + "</a></h3>" + (item.deck ? "<p>" + esc(item.deck) + "</p>" : "") + meta(item) + "</div></article>";
  }
  const SLOTS = ["s-row-l", "s-tile s-span5", "s-row-r", "s-tile s-span4", "s-tile s-span4", "s-tile s-span4", "s-tile s-span4"];
  function slotFor(i) {
    return "journey-story " + (SLOTS[i] || "s-tile s-span4");
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
  function tailPair() {
    return '<section class="s-terr" data-open-existing-house="/radio-80s.html"><div><span class="fd-week__kicker fd-sign--over-ink">DÉCADA</span><em class="fd-sign fd-sign--over-ink">o sinal que já mora aqui</em><h2>Anos 80</h2><p>Rádio, novela, pista e palco. Ouve o 80s nesta página.</p></div><button type="button" data-open-existing-house="/radio-80s.html">OUVIR 80s AQUI</button></section>' +
      '<aside class="s-fofo" id="ajude"><img src="/images/fofonete-home.jpg" alt="Fofonete da Passport Radio" loading="lazy"><div class="s-fofo__body"><span class="fd-week__kicker fd-sign--over-ink">FOFONETE</span><em class="fd-sign fd-sign--over-ink">a casa no ar</em><h2>Eu fiz as contas de novo.</h2><p>Quem lê, ouve, compra e ajuda segura esta edição.</p><a href="https://www.asaas.com/c/shpb8gbiswnw4t2n" target="_blank" rel="noopener">AJUDE A PASSPORT</a></div></aside>';
  }
  function weekHtml(week) {
    if (!week.length) return '<p class="journey-empty">A edição da semana está sendo composta.</p>';
    const cover = week[0];
    const companions = week.slice(1, 3);
    const rest = week.slice(3);
    const coverBlock =
      '<section class="journey-cover fd-week">' +
        '<span class="fd-seal" aria-hidden="true">ROUTE 66<br><b>EVERY SONG<br>IS A DESTINATION</b></span>' +
        '<header><span class="fd-week__kicker">MR. NOMAD · ESTA SEMANA</span><h1>A edição autoral.</h1><em class="fd-sign">Every Song Is A Destination</em></header>' +
        '<div class="journey-cover__grid">' +
          card(cover, "journey-story journey-story--cover", true) +
          '<div class="journey-companions">' + companions.map((item) => card(item, "journey-story journey-story--companion")).join("") + "</div>" +
        "</div></section>";
    const line1 = rest.slice(0, 2);
    const line2 = rest.slice(2, 4);
    const line3 = rest.slice(4, 7);
    function row(items, offset) {
      if (!items.length) return "";
      return '<div class="journey-rest">' + items.map((item, i) => card(item, slotFor(offset + i))).join("") + "</div>";
    }
    const line4 = '<div class="journey-rest">' + tailPair() + "</div>";
    return coverBlock + row(line1, 0) + row(line2, 2) + row(line3, 4) + line4;
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
    if (after) after.innerHTML = '<nav class="fd-paths--bottom" aria-label="Continuar"><a href="noticias.html">NOTÍCIAS</a><a href="editorial.html">ARQUIVO</a><a href="radio.html">RÁDIO 24H</a><a href="promocoes.html">PROMOÇÕES</a></nav>';
    window.PASSPORT_FEED_ITEMS = week;
    window.PASSPORT_HOME_PHOTO_GAPS = week.filter((x) => !usablePhoto(x)).map((x) => ({title: x.title, url: x.url}));
    document.dispatchEvent(new CustomEvent("passport:journey-ready", {detail: {count: week.length}}));
  }
  window.PassportPortal = {refresh: boot};
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, {once: true});
  else boot();
})();
