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

  const RADIOS = [
    ["Metal", "/radio-continuous.html"],
    ["Unplugged", "/radio-continuous.html"],
    ["Unplugged II", "/radio-continuous.html"],
    ["Heavy Metal", "/radio-continuous.html"],
    ["Gothic Passport", "/radio-continuous.html"],
    ["Live Jam", "/radio-continuous.html"],
    ["Pop", "/radio-80s.html"],
    ["Soft", "/radio-80s.html"],
    ["Country", "/radio-80s.html"],
    ["Soft R&B", "/radio-80s.html"],
    ["R&B", "/radio-80s.html"],
    ["Hair Metal", "/radio-80s.html"],
    ["Live & Rare", "/radio-live-rare.html"],
    ["WackenTV", "/radio-live-rare.html"],
    ["BBC Music", "/radio-live-rare.html"],
    ["The Midnight Special", "/radio-live-rare.html"],
    ["Live Aid", "/radio-live-rare.html"],
    ["Rádios do Mundo", "/radio-mundo.html"],
    ["Radio Paraguay", "/radio-mundo.html"],
    ["Radio Québec", "/radio-mundo.html"],
    ["Radio Venezuela", "/radio-mundo.html"],
    ["PASSPORT MÉXICO", "/radio-mundo.html"],
    ["Radio France", "/radio-mundo.html"],
    ["Türkiye Müzik Radyosu", "/radio-mundo.html"],
    ["Українське музичне радіо", "/radio-mundo.html"],
    ["Radio Muzică Românească", "/radio-mundo.html"],
    ["Suomalainen rockradio", "/radio-mundo.html"],
    ["České rockové rádio", "/radio-mundo.html"],
    ["Lietuvos roko radijas", "/radio-mundo.html"],
    ["Ελληνικό ροκ ραδιόφωνο", "/radio-mundo.html"],
    ["Radio Italia", "/radio-mundo.html"],
    ["PASSPORT CATALUNYA", "/radio-mundo.html"],
    ["Rádio África", "/radio-mundo.html"],
    ["한국 음악 라디오", "/radio-mundo.html"],
    ["中国音乐电台", "/radio-mundo.html"],
    ["رادیو موسیقی ایران", "/radio-mundo.html"],
    ["پاکستانی موسیقی ریڈیو", "/radio-mundo.html"],
    ["רדיו מוזיקה ישראלית", "/radio-mundo.html"],
    ["パスポート日本", "/radio-mundo.html"],
    ["พาสปอร์ตประเทศไทย", "/radio-mundo.html"],
    ["ПАСПОРТ ҚАЗАҚСТАН", "/radio-mundo.html"],
    ["MPB", "/radio-mpb.html"],
    ["Jovem Guarda", "/radio-jovem-guarda.html"],
    ["Rock Brasil", "/radio-rock-brasil.html"],
    ["Hits", "/radio-hits.html"],
    ["Disco", "/radio-world-disco-deutschland.html"],
    ["Soul", "/radio-soul.html"],
    ["Flash House", "/radio-flash-house.html"],
    ["Reggae", "/radio-world-tunnel-reggae.html"],
    ["Nostalgia", "/radio-nostalgia-passport.html"],
    ["80s", "/radio-80s.html"],
    ["50s & 60s", "/radio-50s-60s.html"],
    ["Novelas", "/radio-novelas.html"],
    ["Novela 01", "/radio-novelas.html"],
    ["Novela 02", "/radio-novelas.html"],
    ["Novela 03", "/radio-novelas.html"],
    ["Novela 04", "/radio-novelas.html"],
    ["Novela 05", "/radio-novelas.html"],
    ["Novela 06", "/radio-novelas.html"],
    ["Novela 07", "/radio-novelas.html"],
    ["Novela 08", "/radio-novelas.html"],
    ["Novela 09", "/radio-novelas.html"],
    ["Globo de Ouro", "/globo-de-ouro-player.html"],
    ["Globo 01", "/globo-de-ouro-player.html"],
    ["Globo 02", "/globo-de-ouro-player.html"],
    ["Globo 03", "/globo-de-ouro-player.html"],
    ["Globo 04", "/globo-de-ouro-player.html"],
    ["Globo 05", "/globo-de-ouro-player.html"],
    ["Globo 06", "/globo-de-ouro-player.html"]
  ];

  function typedList(title, rows) {
    if (!rows.length) return "";
    return `<section class="typed-block"><h2>${esc(title)}</h2><ul class="hub-list">${rows.join("")}</ul></section>`;
  }

  function renderResults(root, query, page) {
    const tokens = fold(query).split(" ").filter(Boolean);
    if (!tokens.length) {
      root.innerHTML = '<p class="blog-empty">Digite um artista, uma matéria, uma rádio ou um produto.</p>';
      return;
    }
    const storiesPromise = loadIndex().catch(() => []);
    const bandsPromise = fetch("/data/bandas-artistas.json", { credentials: "same-origin" })
      .then((r) => r.json()).then((data) => data.entities || []).catch(() => []);
    const storePromise = fetch("/data/store-search/index.json", { credentials: "same-origin" })
      .then((r) => r.json()).then((data) => data.items || []).catch(() => []);
    Promise.all([storiesPromise, bandsPromise, storePromise]).then(([items, bands, products]) => {
      const ranked = items.map((item) => ({ item, score: scoreItem(item, tokens) }))
        .filter((row) => row.score > 0)
        .sort((a, b) => b.score - a.score || String(b.item.date).localeCompare(String(a.item.date)));
      const total = ranked.length;
      const pages = Math.max(1, Math.ceil(total / PER_PAGE) || 1);
      const safePage = Math.min(page, pages);
      const slice = ranked.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);
      const phrase = tokens.join(" ");
      const artistRows = bands.filter((row) => {
        const hay = fold((row.displayName || "") + " " + (row.slug || ""));
        return tokens.every((token) => hay.includes(token));
      }).slice(0, 12).map((row) =>
        `<li><a href="${esc(row.href)}">${esc(row.displayName)} <span>${esc(row.articleCount)} matérias</span></a></li>`
      );
      const radioRows = RADIOS.filter((row) => tokens.every((token) => fold(row[0]).includes(token) || fold(row[1]).includes(token)))
        .map((row) => `<li><a href="${esc(row[1])}">${esc(row[0])}</a></li>`);
      const productRows = products.filter((item) => item && item.publishable && item.url).filter((item) => {
        const hay = item.norm || fold([item.name, item.artist, item.category, item.type].join(" "));
        return tokens.every((token) => hay.includes(token));
      }).slice(0, 6).map((item) =>
        `<li><a href="${esc(item.url)}">${esc(item.name)}</a></li>`
      );
      const pager = pages > 1 && total
        ? `<nav class="blog-pager" aria-label="Paginação da busca">${safePage > 1 ? `<a href="/blog/busca.html?q=${encodeURIComponent(query)}&p=${safePage - 1}">Anterior</a>` : ""}<span>${safePage} / ${pages}</span>${safePage < pages ? `<a href="/blog/busca.html?q=${encodeURIComponent(query)}&p=${safePage + 1}">Próxima</a>` : ""}</nav>`
        : "";
      const storyBlock = total
        ? `<section class="typed-block"><h2>Matérias</h2><p class="blog-search-count">${total} matéria${total === 1 ? "" : "s"} para “${esc(query)}”</p><div class="blog-grid">${slice.map((row) => card(row.item)).join("")}</div>${pager}</section>`
        : "";
      const html = typedList("Artistas", artistRows) + storyBlock + typedList("Rádios", radioRows) + typedList("Produtos", productRows);
      root.innerHTML = html || `<p class="blog-empty">Nada publicado para “${esc(query)}”.</p>`;
      if (phrase && !html) return;
    }).catch(() => {
      root.innerHTML = '<p class="blog-empty">A busca não carregou agora. O acervo continua nas outras portas.</p>';
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

;(()=>{if(window.PassportPorta||document.querySelector('script[data-pg-porta]'))return;const s=document.createElement('script');s.src='/js/passport-musical-door.js?v=20260924casa';s.defer=true;s.dataset.pgPorta='1';document.head.appendChild(s);})();
