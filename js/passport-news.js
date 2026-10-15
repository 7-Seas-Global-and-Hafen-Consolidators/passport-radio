/* Notícias: leitor de feeds existentes, sem alterar RSS ou Engine. */
(() => {
  "use strict";
  const grid = document.querySelector("#news-grid");
  const search = document.querySelector("#news-search");
  const count = document.querySelector("#news-count");
  const more = document.querySelector("#news-more");
  if (!grid) return;
  let all = [], shown = 0, term = "", month = "";
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
    if (String(item?.url || "").split("?")[0] === "/editorial/2026/08/27/the-mission-historia-integrantes-wayne-hussey-craig-adams.html") return item.image;
    const rec = recover(item);
    if (rec) return {src: rec.src, alt: rec.alt, approved: true};
    const im = item && item.image;
    if (!im || !im.src || im.approved === false) return null;
    if (BRAND_LOGO.test(im.src)) return null;
    if (/img\.youtube\.com\//i.test(im.src)) return null;
    if (DIRTY_IMG.test(im.src)) return null;
    return im;
  }
  const cssUrl = (src) => "url(\"" + String(src || "").replace(/\\/g, "\\\\").replace(/"/g, "\\\"") + "\")";
  const verbete = (item) =>
    '<div class="list-media list-media--verbete" aria-hidden="true"><span>' +
    esc(String(item.category || item.format || "verbete").replace(/_/g, " ")) +
    ' · verbete</span><b>' + esc((item.entities || []).slice(0, 3).join(" · ") || String(item.title).slice(0, 60)) +
    "</b></div>";
  const stamp = (v) => {
    const d = new Date(v);
    return Number.isNaN(d) ? "" : new Intl.DateTimeFormat("pt-BR", {dateStyle: "medium"}).format(d);
  };
  const markFit = (root) => {
    root.querySelectorAll(".list-media img").forEach((img) => {
      const apply = () => {
        const w = img.naturalWidth, h = img.naturalHeight;
        if (!w || !h) return;
        const ratio = w / h;
        const portrait = ratio < 0.88;
        const wide = ratio > 2.05;
        img.classList.toggle("is-portrait", portrait);
        img.classList.toggle("is-wide", wide);
        img.classList.toggle("is-fill", !portrait && !wide);
        const slot = img.closest(".list-media");
        if (!slot) return;
        if (portrait || wide) {
          slot.style.setProperty("--list-photo", cssUrl(img.currentSrc || img.src));
          slot.classList.add("has-backdrop");
        } else {
          slot.style.removeProperty("--list-photo");
          slot.classList.remove("has-backdrop");
        }
      };
      if (img.complete && img.naturalWidth) apply();
      else img.addEventListener("load", apply, { once: true });
      img.addEventListener("error", () => {
        const slot = img.closest(".list-media");
        img.remove();
        if (!slot) return;
        slot.classList.add("list-media--empty");
        slot.classList.remove("has-backdrop");
        if (!slot.querySelector("span")) {
          slot.insertAdjacentHTML("beforeend", "<span>foto indisponível</span>");
        }
      }, { once: true });
    });
  };
  const MONTHS = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
  const archive = document.querySelector("#news-archive");
  const monthLabel = (key) => {
    const [y, m] = String(key).split("-");
    const name = MONTHS[(parseInt(m, 10) || 1) - 1] || m;
    return name + " " + y;
  };
  const fillArchive = () => {
    if (!archive) return;
    const keys = [];
    const seenM = new Set();
    all.forEach((x) => {
      const key = String(x.published_at || "").slice(0, 7);
      if (key.length === 7 && !seenM.has(key)) { seenM.add(key); keys.push(key); }
    });
    keys.sort().reverse();
    const current = month;
    archive.innerHTML = '<option value="">Arquivo</option>' + keys.map((key) => `<option value="${esc(key)}">${esc(monthLabel(key))}</option>`).join("");
    archive.value = current;
  };
  const paint = () => {
    const filtered = all.filter((x) => {
      if (month && !String(x.published_at || "").startsWith(month)) return false;
      return (x.title + " " + (x.deck || "") + " " + (x.category || "")).toLowerCase().includes(term);
    });
    grid.innerHTML = filtered.slice(0, shown).map((x, i) => {
      const photo = usablePhoto(x);
      const im = photo
        ? `<figure class="list-media"><img src="${esc(photo.src)}" alt="${esc(photo.alt || "")}" loading="lazy" decoding="async"></figure>`
        : verbete(x);
      const who = esc(x.author || "Passport Radio");
      return `<article class="news-card list-card${i === 0 ? " news-lead" : ""}">${im}<div class="list-copy"><span class="journey-kicker">${esc(String(x.category || x.format || "Notícias").replace(/_/g, " "))}</span><h2><a href="${safe(x.url)}">${esc(x.title)}</a></h2>${x.deck ? `<p>${esc(x.deck)}</p>` : ""}<p class="news-by">${who}</p><time>${esc(stamp(x.published_at))}</time></div></article>`;
    }).join("");
    markFit(grid);
    if (count) count.textContent = filtered.length + " notícia" + (filtered.length === 1 ? "" : "s");
    if (more) more.hidden = shown >= filtered.length;
  };
  Promise.all(["/data/editorial-feed.json", "/data/editorial-manual-feed.json"].map((u) => fetch(u, {cache: "no-store"}).then((r) => r.ok ? r.json() : ({items: []}))))
    .then(([rss, manual]) => {
      const seen = new Set();
      all = [...(rss.items || []), ...(manual.items || [])].filter((x) => x?.url && !seen.has(x.url) && (seen.add(x.url), true))
        .sort((a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0));
      shown = 12;
      fillArchive();
      paint();
    })
    .catch(() => { grid.innerHTML = '<p class="journey-empty">As notícias estão sendo atualizadas.</p>'; });
  search?.addEventListener("input", () => { term = search.value.trim().toLowerCase(); shown = 12; paint(); });
  archive?.addEventListener("change", () => { month = archive.value; shown = 12; paint(); });
  more?.addEventListener("click", () => { shown += 12; paint(); });
  window.__passportSafe = safe;
})();
