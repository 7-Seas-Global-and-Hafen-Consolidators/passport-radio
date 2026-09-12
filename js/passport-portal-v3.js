/* PASSPORT HOME compositor r10-mold. 5 materias. RSS off Home. No audio. */
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
  const safeHref = (v) => /^(?:[\/?#.]|https?:|mailto:|tel:)/i.test(String(v || "").trim()) ? esc(String(v).trim()) : "#";
  const BRAND_LOGO = /passport-radio-definitive/i;
  const WM = "https://commons.wikimedia.org/wiki/Special:FilePath/";
  const RECOVER = [
    {re:/dolly\s*parton/i, src:WM+"Young-Dolly-Parton_(higher_quality_scan).jpg", alt:"Dolly Parton, 1977"},
    {re:/the\s*mission|wayne\s*hussey/i, src:WM+"The_mission_wayne_hussey.jpg", alt:"Wayne Hussey, The Mission"},
    {re:/ratos\s*de\s*por/i, src:WM+"W2603_Hellfest2016_RatosDePorao_8151.jpg", alt:"Ratos de Porao no Hellfest 2016"},
    {re:/secos/i, src:WM+"Ney_Matogrosso_-_Singer_Composer_(3858541561).jpg", alt:"Ney Matogrosso"},
    {re:/joelho\s*de\s*porco|tico\s*terpins/i, src:WM+"Tico_Terpins_and_Janete_Guper_wedding_(143716150).jpg", alt:"Tico Terpins"}
  ];
  const recover = (item) => {
    const t = (item.title || "") + " " + ((item.entities || []).join(" "));
    return RECOVER.find((r) => r.re.test(t)) || null;
  };
  function usablePhoto(item) {
    const rec = recover(item);
    if (rec) return {src:rec.src, alt:rec.alt, approved:true};
    const im = item && item.image;
    if (!im || !im.src || im.approved === false) return null;
    if (BRAND_LOGO.test(im.src)) return null;
    if (/img\.youtube\.com\//i.test(im.src)) return null;
    return im;
  }
  const figure = (item) => {
    const im = usablePhoto(item);
    if (!im) return "";
    return '<figure class="journey-media"><img src="' + esc(im.src) + '" alt="' + esc(im.alt || item.title || "") + '" loading="lazy" decoding="async" onerror="this.remove()"></figure>';
  };
  const verbete = (item) =>
    '<div class="journey-media journey-media--verbete" aria-hidden="true"><span>' +
    esc(String(item.category || item.format || "verbete").replace(/_/g, " ")) +
    ' · verbete</span><b>' + esc((item.entities || []).slice(0,3).join(" · ") || String(item.title).slice(0,60)) +
    '</b></div>';
  const media = (item) => usablePhoto(item) ? figure(item) : verbete(item);
  const kicker = (item) => '<span class="p-kicker">' + esc(String(item.category || item.format || "Mr. Nomad").replace(/_/g," ")) + '</span>';
  const meta = (item) => '<span class="p-meta">' + esc(String(item.published_at || "").slice(0,10)) + (item.author ? " · " + esc(item.author) : "") + '</span>';
  const copy = (item) => '<div class="p-copy">' + kicker(item) +
    '<h3><a href="' + safeHref(item.url) + '">' + esc(item.title) + '</a></h3>' +
    (item.deck ? '<p>' + esc(item.deck) + '</p>' : '') + meta(item) + '</div>';
  const SHAPES = ["piece--capsule","piece--medal","piece--tower","piece--oval","piece--disc"];
  const piece = (item, i) => {
    const shape = SHAPES[i % SHAPES.length];
    const mediaFirst = (i % 2 === 0);
    const inner = (shape === "piece--capsule" || shape === "piece--disc")
      ? media(item) + copy(item)
      : (mediaFirst ? media(item) + copy(item) : copy(item) + media(item));
    return '<article class="piece ' + shape + (usablePhoto(item) ? "" : " is-verbete") + '">' + inner + '</article>';
  };
  const isNomad = (item) => /nomad|MR_NOMAD|autoral/i.test((item.author||"")+" "+(item.format||"")+" "+(item.category||""));
  async function readFeed(url) {
    try { const r = await fetch(url, {cache:"no-store"}); if (!r.ok) return [];
      const d = await r.json(); return Array.isArray(d) ? d : (d.items || []); } catch (e) { return []; }
  }
  function dedupe(items) {
    const seen = new Set(); const out = [];
    items.forEach((it) => { const k = String(it.url || it.title || "").split("?")[0].trim();
      if (!k || seen.has(k)) return; seen.add(k); out.push(it); });
    return out;
  }
  function clock() {
    const wd = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"], mo = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sept","Oct","Nov","Dec"];
    const tick = () => {
      const n = new Date(), p = (x) => String(x).padStart(2,"0");
      const d = $("#mc-digits"); if (d) d.textContent = p(n.getHours()) + " : " + p(n.getMinutes()) + " : " + p(n.getSeconds());
      const a = $("#mc-wd"), b = $("#mc-mo"), c = $("#mc-dy"), e = $("#mc-yr");
      if (a) a.textContent = wd[n.getDay()]; if (b) b.textContent = mo[n.getMonth()];
      if (c) c.textContent = p(n.getDate()); if (e) e.textContent = n.getFullYear();
    };
    tick(); setInterval(tick, 1000);
  }
  function mirror() {
    setInterval(() => {
      const t = $("#track"), m = $("#meta"), ot = $("#pp-onair-track"), os = $("#pp-onair-sub");
      if (t && ot && t.textContent) ot.textContent = t.textContent;
      if (m && os && m.textContent) os.textContent = m.textContent;
    }, 1500);
  }
  document.addEventListener("error", (e) => {
    const img = e.target;
    if (!img || img.tagName !== "IMG") return;
    const fig = img.closest("figure.journey-media");
    if (fig) {
      const art = fig.closest("article");
      const title = art && art.querySelector("h3") ? art.querySelector("h3").textContent.slice(0,60) : "";
      const cat = art && art.querySelector(".p-kicker") ? art.querySelector(".p-kicker").textContent : "verbete";
      fig.outerHTML = '<div class="journey-media journey-media--verbete" aria-hidden="true"><span>' + esc(cat) + ' · verbete</span><b>' + esc(title) + '</b></div>';
      if (art) art.classList.add("is-verbete"); return;
    }
    const av = img.closest(".mold-fofo"); if (av) img.style.display = "none";
  }, true);
  async function boot() {
    const packs = await Promise.all([
      readFeed("/data/editorial-priority-feed.json"),
      readFeed("/data/editorial-manual-feed.json")
    ]);
    const pool = dedupe(packs[0].concat(packs[1]));
    const nomad = pool.filter(isNomad);
    const week = (nomad.length ? nomad : pool).slice(0, 5);
    const ticker = $("#pp-ticker");
    if (ticker) {
      const items = week.length ? week : [{title:"A edicao da semana esta sendo composta.", url:"#"}];
      const half = items.map((it) => '<a href="' + safeHref(it.url) + '">' + esc(it.title) + '</a>').join("");
      ticker.innerHTML = half + half;
    }
    const vinyl = $("#pp-vinyl");
    if (vinyl) {
      vinyl.innerHTML = week.map((it) => {
        const im = usablePhoto(it);
        const disc = im
          ? '<div class="mv-disc"><img src="' + esc(im.src) + '" alt="' + esc(im.alt || it.title || "") + '" loading="lazy"></div>'
          : '<div class="mv-disc mv-disc--verbete">' + esc((it.entities || [it.title])[0].slice(0,18)) + '</div>';
        return '<a class="mv-item" href="' + safeHref(it.url) + '">' + disc + '<b>' + esc(String(it.title).slice(0,44)) + '</b><small>' + esc(String(it.published_at || "").slice(0,10)) + '</small></a>';
      }).join("");
    }
    const feed = $("#pp-feed");
    if (feed) feed.innerHTML = week.map(piece).join("") ||
      '<p class="piece" style="text-align:center;color:#9a938a">A edicao da semana esta sendo composta.</p>';
    window.PASSPORT_FEED_ITEMS = week;
    window.PASSPORT_HOME_PHOTO_GAPS = week.filter((x) => !usablePhoto(x)).map((x) => ({title:x.title, url:x.url}));
    document.dispatchEvent(new CustomEvent("passport:journey-ready", {detail:{count:week.length}}));
  }
  clock(); mirror();
  window.PassportPortal = {refresh: boot};
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, {once:true});
  else boot();
})();
