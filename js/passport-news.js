/* Notícias: leitor de feeds existentes, sem alterar RSS ou Engine. */
(() => {
  "use strict";
  const grid = document.querySelector("#news-grid");
  const search = document.querySelector("#news-search");
  const count = document.querySelector("#news-count");
  const more = document.querySelector("#news-more");
  if (!grid) return;
  let all = [], shown = 0, term = "";
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => {
    if (c === "&") return "&" + "amp;";
    if (c === "<") return "&" + "lt;";
    if (c === ">") return "&" + "gt;";
    if (c === '"') return "&" + "quot;";
    return "&#39;";
  });
  const PRIVATE = /^(localhost|127\.|10\.|192\.168\.|169\.254\.|0\.|::1|\[::1\])/i;
  const PRIVATE_172 = /^172\.(1[6-9]|2\d|3[0-1])\./;
  const TLD = /\.[a-z]{2,}$/i;
  const safe = (v) => {
    const s = String(v || "").trim();
    if (!s) return "#";
    if (/^(mailto:|tel:)/i.test(s)) return esc(s);
    if (/^[\/?#.]/.test(s) && !/^\/\//.test(s) && !/^https?:/i.test(s)) return esc(s);
    try {
      const u = new URL(s);
      if (!/^https?:$/i.test(u.protocol)) return "#";
      const host = u.hostname.toLowerCase();
      if (PRIVATE.test(host) || PRIVATE_172.test(host)) return "#";
      if (!TLD.test(host)) return "#";
      return esc(s);
    } catch (_) {
      return "#";
    }
  };
  const BRAND_LOGO = /passport-radio-definitive/i;
  const WM = "https://commons.wikimedia.org/wiki/Special:FilePath/";
  const RECOVER = [
    {re:/dolly\s*parton/i, src:WM+"Young-Dolly-Parton_(higher_quality_scan).jpg", alt:"Dolly Parton, 1977"},
    {re:/the\s*mission|wayne\s*hussey/i, src:WM+"The_mission_wayne_hussey.jpg", alt:"Wayne Hussey, The Mission"},
    {re:/ratos\s*de\s*por/i, src:WM+"W2603_Hellfest2016_RatosDePorao_8151.jpg", alt:"Ratos de Porao no Hellfest 2016"},
    {re:/secos/i, src:WM+"Ney_Matogrosso_-_Singer_Composer_(3858541561).jpg", alt:"Ney Matogrosso"},
    {re:/joelho\s*de\s*porco|tico\s*terpins/i, src:WM+"Tico_Terpins_and_Janete_Guper_wedding_(143716150).jpg", alt:"Tico Terpins"}
  ];
  const DIRTY_IMG = /encrypted-tbn|gstatic\.com\/images|img\.youtube\.com|whiplash\.net\/images/i;
  const recover = (item) => {
    const t = (item.title || "") + " " + ((item.entities || []).join(" "));
    return RECOVER.find((r) => r.re.test(t)) || null;
  };
  function usablePhoto(item) {
    const rec = recover(item);
    if (rec) return {src: rec.src, alt: rec.alt, approved: true};
    const im = item && item.image;
    if (!im || !im.src || im.approved === false) return null;
    if (BRAND_LOGO.test(im.src)) return null;
    if (/img\.youtube\.com\//i.test(im.src)) return null;
    if (DIRTY_IMG.test(im.src)) return null;
    return im;
  }
  const verbete = (item) =>
    '<div class="journey-media journey-media--verbete" aria-hidden="true"><span>' +
    esc(String(item.category || item.format || "verbete").replace(/_/g, " ")) +
    ' · verbete</span><b>' + esc((item.entities || []).slice(0, 3).join(" · ") || String(item.title).slice(0, 60)) +
    "</b></div>";
  const stamp = (v) => {
    const d = new Date(v);
    return Number.isNaN(d) ? "" : new Intl.DateTimeFormat("pt-BR", {dateStyle: "medium"}).format(d);
  };
  const paint = () => {
    const filtered = all.filter((x) => (x.title + " " + (x.deck || "") + " " + (x.category || "")).toLowerCase().includes(term));
    grid.innerHTML = filtered.slice(0, shown).map((x) => {
      const photo = usablePhoto(x);
      const im = photo
        ? `<img src="${esc(photo.src)}" alt="${esc(photo.alt || "")}" loading="lazy">`
        : verbete(x);
      return `<article class="news-card">${im}<span class="journey-kicker">${esc(String(x.category || x.format || "Notícias").replace(/_/g, " "))}</span><h2><a href="${safe(x.url)}">${esc(x.title)}</a></h2>${x.deck ? `<p>${esc(x.deck)}</p>` : ""}<time>${esc(stamp(x.published_at))}</time></article>`;
    }).join("");
    if (count) count.textContent = filtered.length + " notícia" + (filtered.length === 1 ? "" : "s");
    if (more) more.hidden = shown >= filtered.length;
  };
  Promise.all(["/data/editorial-feed.json", "/data/editorial-manual-feed.json"].map((u) => fetch(u, {cache: "no-store"}).then((r) => r.ok ? r.json() : ({items: []}))))
    .then(([rss, manual]) => {
      const seen = new Set();
      all = [...(rss.items || []), ...(manual.items || [])].filter((x) => x?.url && !seen.has(x.url) && (seen.add(x.url), true))
        .sort((a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0));
      shown = 12;
      paint();
    })
    .catch(() => { grid.innerHTML = '<p class="journey-empty">As notícias estão sendo atualizadas.</p>'; });
  search?.addEventListener("input", () => { term = search.value.trim().toLowerCase(); shown = 12; paint(); });
  more?.addEventListener("click", () => { shown += 12; paint(); });
  window.__passportSafe = safe;
})();
