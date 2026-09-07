/* PASSPORT PORTAL v3.6 — river owner único de #pp-feed
   Correções PR-ready:
   - commercial: 10 dias / 5 marcas
   - data-format nos renderers
   - shells [data-river] vazios NÃO entram na river
   - secondary grid sem style inline
   - removeAttribute aria-hidden só em módulos preenchidos
*/
(() => {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const esc = (s) =>
    String(s == null ? "" : s).replace(
      /[&<>"']/g,
      (c) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
  const safeHref = (value) => {
    const href = String(value == null ? "" : value).trim();
    if (!href) return "#";
    if (/^(?:[/?#.]|https?:|mailto:|tel:)/i.test(href)) return esc(href);
    return "#";
  };

  const FEEDS = [
    "/data/editorial-manual-feed.json",
    "/data/editorial-feed.json"
  ];

  const IMG = [
    ["rhapsody-of-fire", "/images/rhapsody-of-fire/Rhapsody-3-madrid.jpg"],
    ["therion-miskolc", "/images/therion-miskolc/maxresdefault32.jpg"],
    ["1986-musicas", "/images/1986/attachment-social-image-366-2026-08-10-09-04-20.webp"],
    ["eye-of-the-tiger", "/images/rocky_3_metro_goldwyn_mayer.webp"],
    ["frank-beard", "/images/frank-beard-zz-top-01.jpg"],
    ["sharon-den-adel", "/images/sharon-den-adel-within-temptation-2026.webp"],
    ["ritchie-blackmore", "/images/ritchie-blackmore-deep-purple-reunion-2026.webp"],
    ["scorpions-hurricane", "/images/scorpions-hurricane-graphic-novel.webp"],
    ["roger-taylor", "/images/roger-taylor/rogertayloriseeaug2026_638.webp"],
    ["hoobastank", "/images/hoobastank/hoobastankjune2026_638.webp"],
    ["anos-80-volume-2", "/images/1986/attachment-social-image-366-2026-08-10-09-04-20.webp"]
  ];

  const imgFor = (it) => {
    if (it.image && !/passport-radio-definitive/i.test(it.image)) return it.image;
    if (it.og_image) return it.og_image;
    const u = (it.url || "").toLowerCase();
    for (const [k, v] of IMG) if (u.includes(k)) return v;
    return null;
  };

  const cat = (it) =>
    String(it.category || "PASSPORT").replace(/_/g, " ").toUpperCase();
  const dat = (it) => {
    try {
      return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit"
      }).format(new Date(it.published_at));
    } catch (_) {
      return "";
    }
  };
  const ageD = (it) => {
    const t = new Date(it.published_at).getTime();
    return Number.isFinite(t)
      ? Math.floor((Date.now() - t) / 86400000)
      : 9999;
  };
  const heat = (it) =>
    (it.format === "MR_NOMAD" ? 3 : it.format === "STORY" ? 2 : 0) +
    Math.min((it.entities || []).length, 6) * 0.5 -
    Math.min(Math.max(ageD(it), 0), 60) * 0.05;

  const fmt = (it) => String(it.format || "").toUpperCase();

  const leadHTML = (it) => {
    const im = imgFor(it);
    const f = fmt(it);
    return (
      `<article class="rv-lead"${f ? ` data-format="${esc(f)}"` : ""}>` +
      (im
        ? `<img class="rv-img" src="${esc(im)}" alt="" loading="eager" width="760" height="428">`
        : "") +
      `<span class="rv-k">${esc(cat(it))} · ${esc(dat(it))}</span>` +
      `<h2><a href="${safeHref(it.url)}">${esc(it.title)}</a></h2>` +
      (it.deck ? `<p>${esc(it.deck)}</p>` : "") +
      `</article>`
    );
  };

  const photoHTML = (it) => {
    const im = imgFor(it);
    const f = fmt(it);
    if (!im) return compactHTML(it);
    return (
      `<article class="rv-item rv-item--photo"${f ? ` data-format="${esc(f)}"` : ""}>` +
      `<a href="${safeHref(it.url)}"><img src="${esc(im)}" alt="" loading="lazy" width="150" height="110"></a>` +
      `<div><span class="rv-k">${esc(cat(it))} · ${esc(dat(it))}</span>` +
      `<h3><a href="${safeHref(it.url)}">${esc(it.title)}</a></h3>` +
      (it.deck ? `<p>${esc(it.deck)}</p>` : "") +
      `</div></article>`
    );
  };

  const compactHTML = (it) => {
    const f = fmt(it);
    return (
      `<article class="rv-item"${f ? ` data-format="${esc(f)}"` : ""}>` +
      `<span class="rv-k">${esc(cat(it))} · ${esc(dat(it))}</span>` +
      `<h3><a href="${safeHref(it.url)}">${esc(it.title)}</a></h3>` +
      (it.deck ? `<p>${esc(it.deck)}</p>` : "") +
      `</article>`
    );
  };

  const secondaryHTML = (items) => {
    if (!items.length) return "";
    return (
      '<div class="rv-secondary">' +
      items
        .map((it) => {
          const im = imgFor(it);
          const f = fmt(it);
          return (
            `<article class="rv-secondary__card"${f ? ` data-format="${esc(f)}"` : ""}>` +
            (im
              ? `<img class="rv-secondary__img" src="${esc(im)}" alt="" loading="lazy" width="360" height="225">`
              : "") +
            `<span class="rv-k">${esc(cat(it))} · ${esc(dat(it))}</span>` +
            `<h3><a href="${safeHref(it.url)}">${esc(it.title)}</a></h3>` +
            (it.deck ? `<p>${esc(it.deck)}</p>` : "") +
            `</article>`
          );
        })
        .join("") +
      "</div>"
    );
  };

  const strip = (title, text, href, cta) =>
    `<section class="rv-mod rv-strip"><span class="rv-strip-dot"></span><b>${title}</b>` +
    `<span class="rv-strip-txt">${text}</span><a href="${href}">${cta} →</a></section>`;

  const routesHTML = () =>
    `<section class="rv-mod rv-routes"><b>CONTINUE NA PASSPORT</b><div>` +
    `<a href="radio.html">RÁDIO 24H</a>` +
    `<a href="destinos.html">ARQUIVOS</a>` +
    `<a href="promocoes.html">PROMOÇÕES</a>` +
    `<a href="loja.html">STORE</a>` +
    `<a href="divulgar-bandas.html">ENVIAR PAUTA</a>` +
    `<a href="#apoie">APOIAR</a></div></section>`;

  const marqueeHTML = () =>
    `<section class="rv-mod rv-marquee" aria-label="Continue circulando"><div>` +
    `<span>PASSPORT RADIO</span>` +
    `<a href="radio.html">LIVE & RARE™</a>` +
    `<a href="radio.html#passportTunnels">TUNNELS™</a>` +
    `<a href="radio-mundo.html">WORLD DIAL™</a>` +
    `<a href="promocoes.html">PROMOÇÕES</a>` +
    `<a href="loja.html">STORE</a>` +
    `<a href="#apoie">APOIAR</a>` +
    `<a href="https://t.me/m/t6seeX61ZTlk" target="_blank" rel="noopener">TELEGRAM</a>` +
    `<span>EVERY SONG IS A DESTINATION</span></div></section>`;

  /* OFICIAL: 10 dias grátis · primeiras 5 marcas */
  const commercialHTML = () =>
    strip(
      "ANUNCIE NA PASSPORT",
      "10 dias grátis · primeiras 5 marcas · depois, tabela comercial.",
      "anuncie.html",
      "VER FORMATOS"
    );

  /** Módulos reais gerados (não shells vazios do HTML) */
  const moduleRadio = () =>
    `<section class="rv-mod rv-mod-radio" data-filled="1">` +
    `<div class="rv-mod-head"><b>PASSPORT ON AIR</b><a href="radio.html">ENTRAR NO AR →</a></div>` +
    `<p class="rv-mod-copy">Continuous Signals™ · Metal · Unplugged · Live Jam · Rock Brasil · MPB · 80s · Soul · Hits · Live &amp; Rare™ · World Dial™</p>` +
    `<div class="rv-mod-actions">` +
    `<a class="rv-btn" href="radio.html">RÁDIO 24H</a>` +
    `<a class="rv-btn rv-btn--line" href="radio-mundo.html">WORLD DIAL</a>` +
    `<a class="rv-btn rv-btn--line" href="passport-player-v2.html">PLAYER V2</a>` +
    `</div></section>`;

  const moduleArchive = () =>
    `<section class="rv-mod rv-mod-archive" data-filled="1">` +
    `<div class="rv-mod-head"><b>EXPLORE O ARQUIVO</b><a href="destinos.html">TUDO →</a></div>` +
    `<div class="rv-mod-grid">` +
    `<a href="anos-70/">Anos 70</a><a href="anos-80/">Anos 80</a><a href="anos-90/">Anos 90</a>` +
    `<a href="bandas/">Bandas</a><a href="guitarristas/">Guitarristas</a>` +
    `<a href="bateristas/">Bateristas</a><a href="baixistas/">Baixistas</a>` +
    `<a href="vocalistas/">Vocalistas</a>` +
    `</div></section>`;

  const modulePromo = () =>
    `<section class="rv-mod rv-mod-promo" data-filled="1" id="rv-promo-mod">` +
    `<div class="rv-mod-head"><b>PROMOÇÕES</b><a href="promocoes.html">AGORA · A SEGUIR · RESULTADOS →</a></div>` +
    `<div class="rv-promo-body"><p class="rv-mod-copy">Carregando campanhas…</p></div>` +
    `</section>`;

  const moduleStore = () =>
    `<section class="rv-mod rv-mod-store" data-filled="1" id="rv-store-mod">` +
    `<div class="rv-mod-head"><b>PASSPORT STORE</b><a href="loja.html">ENTRAR NA LOJA →</a></div>` +
    `<div class="rv-store-body"><p class="rv-mod-copy">Carregando produtos…</p></div>` +
    `</section>`;

  /** Consome schemas reais: /data/promocoes.json (campaigns) e /data/store_inventory.json (products) */
  async function enrichPromoStoreModules() {
    const promoHost = document.getElementById("rv-promo-mod");
    const storeHost = document.getElementById("rv-store-mod");
    const legacyPromo = document.getElementById("pr-home-promos");
    if (promoHost && legacyPromo) legacyPromo.hidden = true;
    try {
      const [pr, sr] = await Promise.all([
        fetch("/data/promocoes.json", { cache: "no-store" }),
        fetch("/data/store_inventory.json", { cache: "no-store" })
      ]);
      if (promoHost && pr.ok) {
        const pd = await pr.json();
        const campaigns = pd.campaigns || [];
        const agora = campaigns.filter((c) => c.status === "AGORA");
        const next = campaigns.filter((c) => c.status === "A SEGUIR").slice(0, 2);
        const result = campaigns.filter((c) => c.status === "RESULTADO").slice(0, 1);
        const body = promoHost.querySelector(".rv-promo-body");
        if (body) {
          const card = (c) => {
            const href = esc(c.detail_url || c.product_url || "promocoes.html");
            const label =
              c.status === "AGORA"
                ? "PARTICIPAR"
                : c.status === "RESULTADO"
                  ? "VER RESULTADO"
                  : "A SEGUIR";
            const img = c.prize_image
              ? `<img class="rv-promo-img" src="${esc(c.prize_image)}" alt="" loading="lazy" width="120" height="80">`
              : "";
            const winner =
              c.status === "RESULTADO" && c.winner
                ? `<div class="rv-promo-winner">🏆 ${esc(c.winner)}</div>`
                : "";
            return (
              `<article class="rv-promo-card" data-promo-id="${esc(c.id || "")}">` +
              img +
              `<div><span class="rv-k">${esc(c.type || c.status || "PROMO")}</span>` +
              `<h3><a href="${href}">${esc(c.title || "")}</a></h3>` +
              (c.prize ? `<p>${esc(c.prize)}</p>` : "") +
              winner +
              `<a class="rv-btn" href="${href}">${label}</a></div></article>`
            );
          };
          const blocks = [];
          if (agora.length) {
            blocks.push("<b class=\"rv-sub\">AGORA</b>" + agora.map(card).join(""));
          }
          if (next.length) {
            blocks.push("<b class=\"rv-sub\">A SEGUIR</b>" + next.map(card).join(""));
          }
          if (result.length) {
            blocks.push("<b class=\"rv-sub\">RESULTADO</b>" + result.map(card).join(""));
          }
          body.innerHTML = blocks.length
            ? blocks.join("")
            : '<p class="rv-mod-copy">Nenhuma campanha no schema. <a href="promocoes.html">Ver promoções</a></p>';
        }
      } else if (promoHost) {
        const body = promoHost.querySelector(".rv-promo-body");
        if (body)
          body.innerHTML =
            '<p class="rv-mod-copy"><a class="rv-btn" href="promocoes.html">VER PROMOÇÕES</a></p>';
      }
      if (storeHost && sr.ok) {
        const sd = await sr.json();
        const products = (sd.products || []).filter((p) => p.in_stock !== false).slice(0, 4);
        const body = storeHost.querySelector(".rv-store-body");
        if (body) {
          if (!products.length) {
            body.innerHTML =
              '<p class="rv-mod-copy"><a class="rv-btn" href="loja.html">ABRIR LOJA</a></p>';
          } else {
            body.innerHTML =
              '<div class="rv-store-grid">' +
              products
                .map((p) => {
                  const href = safeHref(
                    p.url ||
                      p.detail_url ||
                      `loja.html?product=${encodeURIComponent(p.id || "")}&sku=${encodeURIComponent(p.sku || "")}`
                  );
                  const img = p.image
                    ? `<img src="${esc(p.image)}" alt="" loading="lazy" width="100" height="100">`
                    : "";
                  const price =
                    typeof p.price === "number"
                      ? p.price.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL"
                        })
                      : "";
                  return (
                    `<a class="rv-store-card" href="${href}">` +
                    img +
                    `<span>${esc(p.name || p.title || "Produto")}</span>` +
                    (price ? `<small>${price}</small>` : "") +
                    `</a>`
                  );
                })
                .join("") +
              '</div><a class="rv-btn" href="loja.html">VER LOJA COMPLETA</a>';
          }
        }
      } else if (storeHost) {
        const body = storeHost.querySelector(".rv-store-body");
        if (body)
          body.innerHTML =
            '<p class="rv-mod-copy"><a class="rv-btn" href="loja.html">ABRIR LOJA</a></p>';
      }
    } catch (_) {
      /* fallback silencioso — links nos heads permanecem */
    }
  }


  function isShellEmpty(el) {
    if (!el) return true;
    if (el.getAttribute("data-filled") === "1") return false;
    const text = (el.textContent || "").replace(/\s+/g, " ").trim();
    const hasMedia = el.querySelector("img,video,iframe,a[href]");
    // shell vazio ou só whitespace / aria-hidden placeholder
    if (!text && !hasMedia) return true;
    // se só tem classes de container sem filhos úteis
    if (el.children.length === 0 && text.length < 3) return true;
    return false;
  }

  function buildRiver(items) {
    const feed = $("#pp-feed");
    if (!feed || !items.length) return;

    // coleta data-river; descarta vazios; remove do DOM original
    const mods = [...document.querySelectorAll("[data-river]")]
      .sort((a, b) => +a.dataset.river - +b.dataset.river)
      .filter((m) => {
        const empty = isShellEmpty(m);
        if (empty) {
          m.remove(); // some do DOM, não entra na river
          return false;
        }
        m.removeAttribute("aria-hidden");
        return true;
      });

    const chunks = [leadHTML(items[0])];
    const secondary = items.slice(1, 3);
    if (secondary.length) chunks.push(secondaryHTML(secondary));

    let sincePhoto = 0;
    const start = 1 + secondary.length;
    // volume explícito: 40 itens no corpo (lead+secondary contam à parte)
    items.slice(start, start + 40).forEach((it, i) => {
      const pos = start + i;

      while (mods.length && pos >= +mods[0].dataset.river) {
        const m = mods.shift();
        chunks.push(m.outerHTML);
        m.remove();
      }

      if (pos === 5) chunks.push(routesHTML());
      if (pos === 8) chunks.push(moduleRadio());
      if (pos === 12) chunks.push(marqueeHTML());
      if (pos === 16)
        chunks.push(
          strip(
            "RÁDIO 24H",
            "Continuous Signals™ · Tunnels™ · Live & Rare™ · Rock Brasil",
            "radio.html",
            "OUVIR"
          )
        );
      if (pos === 20) chunks.push(moduleArchive());
      if (pos === 24)
        chunks.push(
          strip(
            "WORLD DIAL™",
            "Escolha um lugar. Entre pela música.",
            "radio-mundo.html",
            "SINTONIZAR"
          )
        );
      if (pos === 28) chunks.push(modulePromo());
      if (pos === 32) chunks.push(moduleStore());
      if (pos === 34)
        chunks.push(
          strip(
            "APOIAR A PASSPORT",
            "Produção independente, arquivos e rádio no ar.",
            "https://www.asaas.com/c/shpb8gbiswnw4t2n",
            "APOIAR"
          )
        );
      if (pos === 36) chunks.push(commercialHTML());

      const im = imgFor(it);
      const isFeature = fmt(it) === "MR_NOMAD" || fmt(it) === "STORY";
      if ((im && sincePhoto >= 3) || (im && isFeature && sincePhoto >= 1)) {
        chunks.push(photoHTML(it));
        sincePhoto = 0;
      } else {
        chunks.push(compactHTML(it));
        sincePhoto++;
      }
    });

    // sobra de mods preenchidos
    while (mods.length) {
      const m = mods.shift();
      chunks.push(m.outerHTML);
      m.remove();
    }

    chunks.push(
      marqueeHTML(),
      commercialHTML(),
      '<section class="rv-end"><b>CONTINUE VIAJANDO</b>' +
        '<a href="editorial.html">Últimas histórias</a>' +
        '<a href="destinos.html">Arquivo</a>' +
        '<a href="radio.html">Rádio 24H</a>' +
        '<a href="radio-mundo.html">World Dial</a>' +
        '<a href="promocoes.html">Promoções</a>' +
        '<a href="loja.html">Store</a>' +
        '<a href="#apoie">Apoiar</a></section>',
      '<a class="rv-more" href="editorial.html">VER O ARQUIVO COMPLETO →</a>'
    );

    feed.innerHTML = chunks.join("");
  }

  const fill = (id, html) => {
    const el = $("#" + id);
    if (el) el.innerHTML = html;
  };

  function loadActivity() {
    if (!document.querySelector('link[href*="passport-activity.css"]')) {
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = "/css/passport-activity.css?v=20260907r2";
      document.head.appendChild(l);
    }
    if (!document.querySelector('script[src*="passport-activity.js"]')) {
      const s = document.createElement("script");
      s.src = "/js/passport-activity.js?v=20260907r2";
      s.defer = true;
      document.body.appendChild(s);
    }
  }

  function integrateShell() {
    const actions = $(".pp-top-actions");
    if (actions && !actions.querySelector('a[href*="t.me/"]')) {
      const wa = actions.querySelector('a[href*="wa.me/"]');
      const a = document.createElement("a");
      a.href = "https://t.me/m/t6seeX61ZTlk";
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = "TELEGRAM";
      actions.insertBefore(a, wa || actions.querySelector(".pp-onair-btn"));
    }
    document.querySelectorAll("a").forEach((a) => {
      if (/20 DIAS GRÁTIS/i.test(a.textContent))
        a.textContent = a.textContent.replace(/20 DIAS GRÁTIS/gi, "10 DIAS GRÁTIS");
      if (/10 vagas/i.test(a.textContent))
        a.textContent = a.textContent.replace(/10 vagas/gi, "primeiras 5 marcas");
    });
    loadActivity();
  }

  function copyAttribution() {
    document.addEventListener("copy", (e) => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) return;
      const text = sel.toString().trim();
      if (text.length < 200) return;
      const anchor = sel.anchorNode?.parentElement;
      if (!anchor?.closest(".rv-lead,.rv-item,.rv-secondary__card")) return;
      e.clipboardData.setData(
        "text/plain",
        `${text}\n\nLeia mais em: ${location.href}`
      );
      e.preventDefault();
    });
  }

  async function boot() {
    integrateShell();
    copyAttribution();
    const results = await Promise.allSettled(
      FEEDS.map((u) =>
        fetch(u, { cache: "no-store" }).then((r) =>
          r.ok ? r.json() : { items: [] }
        )
      )
    );
    const seen = new Set();
    const items = [];
    for (const r of results) {
      if (r.status !== "fulfilled") continue;
      const arr = Array.isArray(r.value) ? r.value : r.value.items || [];
      for (const it of arr) {
        if (!it || !it.url || seen.has(it.url)) continue;
        seen.add(it.url);
        items.push(it);
      }
    }
    if (!items.length) return;
    items.sort(
      (a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0)
    );
    const tk = $("#pp-ticker");
    if (tk)
      tk.textContent = items
        .slice(0, 8)
        .map((i) => i.title)
        .join("  ·  ");
    fill(
      "pp-reco",
      [...items]
        .sort((a, b) => heat(b) - heat(a))
        .slice(0, 8)
        .map((i) => `<li><a href="${safeHref(i.url)}">${esc(i.title)}</a></li>`)
        .join("")
    );
    fill(
      "pp-missed",
      [...items]
        .filter((i) => ageD(i) > 14)
        .sort((a, b) => heat(b) - heat(a))
        .slice(0, 8)
        .map((i) => `<li><a href="${safeHref(i.url)}">${esc(i.title)}</a></li>`)
        .join("")
    );
    fill(
      "pp-today",
      [...items]
        .filter((i) => ageD(i) > 7)
        .slice(-8)
        .reverse()
        .slice(0, 5)
        .map((i) => `<li><a href="${safeHref(i.url)}">${esc(i.title)}</a></li>`)
        .join("")
    );
    const freq = {};
    items.forEach((i) =>
      (i.entities || []).forEach((e) => {
        const k = String(e).trim();
        if (k) freq[k] = (freq[k] || 0) + 1;
      })
    );
    fill(
      "pp-assuntos",
      Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 14)
        .map(
          ([k]) =>
            `<a href="destinos.html?q=${encodeURIComponent(k)}">${esc(k)}</a>`
        )
        .join("")
    );
    buildRiver(items);
    enrichPromoStoreModules();
    document.querySelectorAll(".pp-ad-slot ins.adsbygoogle").forEach(() => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (_) {}
    });
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
