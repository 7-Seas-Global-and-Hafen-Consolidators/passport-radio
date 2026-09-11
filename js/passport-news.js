/* Notícias: leitor de feeds existentes, sem alterar RSS ou Engine. */
(() => {
  "use strict";
  const grid = document.querySelector("#news-grid");
  const search = document.querySelector("#news-search");
  const count = document.querySelector("#news-count");
  const more = document.querySelector("#news-more");
  if (!grid) return;
  let all = [], shown = 0, term = "";
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const safe = (v) => /^(?:[/?#.]|https?:)/i.test(String(v || "")) ? esc(v) : "#";
  const stamp = (v) => {
    const d = new Date(v);
    return Number.isNaN(d) ? "" : new Intl.DateTimeFormat("pt-BR", {dateStyle: "medium"}).format(d);
  };
  const paint = () => {
    const filtered = all.filter((x) => (x.title + " " + (x.deck || "") + " " + (x.category || "")).toLowerCase().includes(term));
    grid.innerHTML = filtered.slice(0, shown).map((x) => {
      const im = x.image && x.image.src && x.image.approved !== false
        ? `<img src="${esc(x.image.src)}" alt="" loading="lazy">` : "";
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
})();
