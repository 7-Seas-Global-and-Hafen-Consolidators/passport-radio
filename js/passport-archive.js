/* Arquivo: memória Nomad + manuais. Não altera o Engine. */
(() => {
  "use strict";
  const grid = document.querySelector("#archive-grid");
  const search = document.querySelector("#archive-search");
  const count = document.querySelector("#archive-count");
  const more = document.querySelector("#archive-more");
  if (!grid) return;
  let all = [], shown = 0, term = "";
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => {
    if (c === "&") return "&" + "amp;";
    if (c === "<") return "&" + "lt;";
    if (c === ">") return "&" + "gt;";
    if (c === '"') return "&" + "quot;";
    return "&#39;";
  });
  const safe = (v) => /^(?:[/?#.]|https?:)/i.test(String(v || "")) ? esc(v) : "#";
  const stamp = (v) => {
    const d = new Date(v);
    return Number.isNaN(d) ? "" : new Intl.DateTimeFormat("pt-BR", {dateStyle: "medium"}).format(d);
  };
  const verbete = (item) =>
    '<div class="list-media list-media--verbete" aria-hidden="true"><span>' +
    esc(String(item.category || "Arquivo").replace(/_/g, " ")) +
    ' · verbete</span><b>' + esc((item.entities || []).slice(0, 3).join(" · ") || String(item.title || "").slice(0, 60)) +
    "</b></div>";
  const markFit = (root) => {
    root.querySelectorAll(".list-media img").forEach((img) => {
      const apply = () => {
        const w = img.naturalWidth, h = img.naturalHeight;
        if (!w || !h) return;
        img.classList.toggle("is-portrait", h > w * 1.12);
        img.classList.toggle("is-wide", w > h * 2.05);
        img.classList.toggle("is-fill", !(h > w * 1.12) && !(w > h * 2.05));
      };
      if (img.complete && img.naturalWidth) apply();
      else img.addEventListener("load", apply, { once: true });
      img.addEventListener("error", () => {
        img.hidden = true;
        img.closest(".list-media")?.classList.add("list-media--empty");
      }, { once: true });
    });
  };
  const paint = () => {
    const list = all.filter((x) => (x.title + " " + (x.deck || "") + " " + (x.category || "")).toLowerCase().includes(term));
    grid.innerHTML = list.slice(0, shown).map((x) => {
      const photo = x.image && x.image.src && x.image.approved !== false;
      const im = photo
        ? `<figure class="list-media"><img src="${esc(x.image.src)}" alt="${esc(x.image.alt || x.title)}" loading="lazy" decoding="async"></figure>`
        : verbete(x);
      return `<article class="arch-card list-card">${im}<div class="list-copy"><span class="journey-kicker">${esc(String(x.category || "Arquivo").replace(/_/g, " "))}</span><h2><a href="${safe(x.url)}">${esc(x.title)}</a></h2>${x.deck ? `<p>${esc(x.deck)}</p>` : ""}<time>${esc(stamp(x.published_at))}</time></div></article>`;
    }).join("");
    markFit(grid);
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
