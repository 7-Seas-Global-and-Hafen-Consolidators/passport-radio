/* Arquivo: memória Nomad + manuais. Não altera o Engine. */
(() => {
  "use strict";
  const grid = document.querySelector("#archive-grid");
  const search = document.querySelector("#archive-search");
  const count = document.querySelector("#archive-count");
  const more = document.querySelector("#archive-more");
  if (!grid) return;
  let all = [], shown = 0, term = "";
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const safe = (v) => /^(?:[/?#.]|https?:)/i.test(String(v || "")) ? esc(v) : "#";
  const stamp = (v) => {
    const d = new Date(v);
    return Number.isNaN(d) ? "" : new Intl.DateTimeFormat("pt-BR", {dateStyle: "medium"}).format(d);
  };
  const paint = () => {
    const list = all.filter((x) => (x.title + " " + (x.deck || "") + " " + (x.category || "")).toLowerCase().includes(term));
    grid.innerHTML = list.slice(0, shown).map((x) => {
      const im = x.image && x.image.src && x.image.approved !== false
        ? `<figure class="journey-media"><img src="${esc(x.image.src)}" alt="${esc(x.image.alt || x.title)}" loading="lazy"></figure>` : "";
      return `<article class="arch-card">${im}<span class="journey-kicker">${esc(String(x.category || "Arquivo").replace(/_/g, " "))}</span><h2><a href="${safe(x.url)}">${esc(x.title)}</a></h2>${x.deck ? `<p>${esc(x.deck)}</p>` : ""}<time>${esc(stamp(x.published_at))}</time></article>`;
    }).join("");
    if (count) count.textContent = list.length + " história" + (list.length === 1 ? "" : "s");
    if (more) more.hidden = shown >= list.length;
  };
  Promise.all(["/data/editorial-priority-feed.json", "/data/editorial-manual-feed.json"].map((u) => fetch(u, {cache: "no-store"}).then((r) => r.ok ? r.json() : ({items: []}))))
    .then((ds) => {
      const seen = new Set();
      all = ds.flatMap((x) => x.items || []).filter((x) => x?.url && !seen.has(x.url) && (seen.add(x.url), true))
        .sort((a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0));
      shown = 15;
      paint();
    })
    .catch(() => { grid.innerHTML = '<p class="journey-empty">O arquivo está sendo atualizado.</p>'; });
  search?.addEventListener("input", () => { term = search.value.toLowerCase().trim(); shown = 15; paint(); });
  more?.addEventListener("click", () => { shown += 15; paint(); });
})();
