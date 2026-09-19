(() => {
  "use strict";

  const MANIFEST = "/data/blog-search/manifest.json";
  const PER_PAGE = 20;
  let cache = null;

  const fold = (value) => String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

  function params() {
    const q = new URLSearchParams(location.search);
    return { q: q.get("q") || "", p: Math.max(1, parseInt(q.get("p") || "1", 10) || 1) };
  }

  function card(item) {
    const img = item.image
      ? `<span class="blog-card__media"><img src="${esc(item.image)}" alt="${esc(item.title)}" loading="lazy" width="640" height="360"></span>`
      : "";
    const ents = (item.entities || []).slice(0, 4).map((n) => esc(n)).join(" · ");
    return `<a class="blog-card" href="${esc(item.url)}">${img}<span class="blog-card__eyebrow">${esc(item.family || item.format || "BLOG")}</span><h2>${esc(item.title)}</h2><p>${esc(item.deck || "")}</p><span class="blog-card__meta">${esc(item.author || "Passport Radio")} · ${esc(item.date || "")}${ents ? " · " + ents : ""}</span></a>`;
  }

  function esc(value) {
    const d = document.createElement("div");
    d.textContent = String(value || "");
    return d.innerHTML;
  }

  function scoreItem(item, tokens) {
    const hay = item.norm || fold([item.title, item.deck, item.body, item.author, (item.entities || []).join(" "), item.country, item.year, item.decade, item.historical_period, (item.event_years || []).join(" "), (item.decades_covered || []).join(" ")].join(" "));
    const title = fold(item.title);
    const ents = fold((item.entities || []).join(" "));
    const author = fold(item.author);
    const country = fold(item.country);
    const hist = fold([item.historical_period, (item.event_years || []).join(" "), (item.decades_covered || []).join(" ")].join(" "));
    let score = 0;
    for (const token of tokens) {
      if (title.includes(token)) score += 8;
      else if (ents.includes(token)) score += 6;
      else if (author.includes(token)) score += 6;
      else if (country.includes(token)) score += 6;
      else if (hist.includes(token)) score += 5;
      else if (hay.includes(token)) score += 3;
      else return 0;
    }
    const phrase = tokens.join(" ");
    if (phrase && title.includes(phrase)) score += 10;
    return score;
  }

  async function loadIndex() {
    if (cache) return cache;
    const manifest = await fetch(MANIFEST, { credentials: "same-origin" }).then((r) => r.json());
    const shards = await Promise.all((manifest.shards || []).map((s) =>
      fetch(s.file, { credentials: "same-origin" }).then((r) => r.json()).catch(() => ({ items: [] }))
    ));
    cache = [];
    shards.forEach((s) => { cache = cache.concat(s.items || []); });
    return cache;
  }

  function renderResults(root, query, page) {
    const tokens = fold(query).split(" ").filter(Boolean);
    if (!tokens.length) {
      root.innerHTML = '<p class="blog-empty">Digite um artista, disco, país, década ou tema.</p>';
      return;
    }
    loadIndex().then((items) => {
      const ranked = items.map((item) => ({ item, score: scoreItem(item, tokens) }))
        .filter((row) => row.score > 0)
        .sort((a, b) => b.score - a.score || String(b.item.date).localeCompare(String(a.item.date)));
      const total = ranked.length;
      const pages = Math.max(1, Math.ceil(total / PER_PAGE));
      const safePage = Math.min(page, pages);
      const slice = ranked.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);
      if (!total) {
        root.innerHTML = `<p class="blog-empty">Nenhuma história encontrada para “${esc(query)}”.</p>`;
        return;
      }
      const pager = pages > 1
        ? `<nav class="blog-pager" aria-label="Paginação da busca">${safePage > 1 ? `<a href="/blog/busca.html?q=${encodeURIComponent(query)}&p=${safePage - 1}">Anterior</a>` : ""}<span>${safePage} / ${pages}</span>${safePage < pages ? `<a href="/blog/busca.html?q=${encodeURIComponent(query)}&p=${safePage + 1}">Próxima</a>` : ""}</nav>`
        : "";
      root.innerHTML = `<p class="blog-search-count">${total} resultado${total === 1 ? "" : "s"} para “${esc(query)}”</p><div class="blog-grid">${slice.map((row) => card(row.item)).join("")}</div>${pager}`;
    }).catch(() => {
      root.innerHTML = '<p class="blog-empty">Não foi possível carregar o índice de busca agora.</p>';
    });
  }

  function bindForms() {
    document.querySelectorAll("form.blog-search").forEach((form) => {
      form.addEventListener("submit", (ev) => {
        const input = form.querySelector('input[name="q"]');
        const value = (input && input.value || "").trim();
        if (!value) {
          ev.preventDefault();
          if (input) input.focus();
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindForms();
    const root = document.querySelector("[data-search-root]");
    const state = params();
    const input = document.getElementById("blog-q");
    if (input && state.q) input.value = state.q;
    if (root) renderResults(root, state.q, state.p);
  });
})();
