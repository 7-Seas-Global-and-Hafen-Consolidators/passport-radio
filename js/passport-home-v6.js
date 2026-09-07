/* PASSPORT HOME v6 — dono dos 7 ambientes fora de #pp-feed.
   Lê dados reais (promocoes.json, store_inventory.json, window.PASSPORT_FEED_ITEMS).
   Não escreve em #pp-feed. Não toca no motor de áudio. */
(() => {
  "use strict";
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const href = (v) => { const h = String(v || "").trim(); return /^(?:[/?#.]|https?:)/i.test(h) ? esc(h) : "#"; };
  const money = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const imgBlock = (src, alt, credit) => src
    ? `<div class="rv6-media"><img src="${esc(src)}" alt="${esc(alt || "")}" loading="lazy" decoding="async" onerror="this.parentNode.setAttribute('data-img','error')">${credit ? `<span class="rv6-credit">${esc(credit)}</span>` : ""}</div>`
    : "";
  const env = (cls, kickerTxt, title, linkHref, linkTxt, inner) => `
    <section class="pp-env ${cls}" aria-label="${esc(title)}"><div class="pp-env__in">
      <div class="pp-env__head"><div><span class="pp-env__kicker">${esc(kickerTxt)}</span><h2>${esc(title)}</h2></div>
      ${linkHref ? `<a href="${href(linkHref)}">${esc(linkTxt || "VER →")}</a>` : ""}</div>${inner}
    </div></section>`;

  /* ESTÚDIO — sinais reais auditados em radio.html */
  function studio() {
    const units = [
      ["80s Tunnel™", "6 canais · pop · rock · R&B · hair bands · country", "24 HOURS"],
      ["Soul Tunnel™", "Soul dos 80s até agora · sinal direto do Reino Unido", "24 HOURS"],
      ["MPB Tunnel™", "MPB · samba · soul brasileiro · bossa · novas gerações", "24 HOURS"],
      ["Passport Hits Tunnel™", "Pop · Top 40 em rotação contínua", "24 HOURS"],
      ["50s & 60s Tunnel™", "Rock ’n’ roll · doo-wop · golden era", "24 HOURS"],
      ["Jovem Guarda™", "Iê-iê-iê brasileiro · Studio Souto", "24 HOURS"],
      ["Flash House Tunnel™", "Eurodance · house · italo · hi-NRG · freestyle", "24 HOURS"],
      ["Rock Brasil Tunnel™", "Rock nacional · 80s · 90s · 2000s", "24 HOURS"]
    ].map(([b, s, t]) => `<a class="pp-rack__u" href="radio.html#passportTunnels"><b>${esc(b)}</b><span>${esc(s)}</span><small>${esc(t)}</small></a>`).join("");
    return env("pp-env--estudio", "ESTÚDIO PASSPORT · SINAL", "O estúdio está no ar.", "radio.html", "ABRIR CONSOLE →",
      `<div class="pp-rack">${units}</div><a class="pp-env__cta" href="radio.html">ENTRAR NO ESTÚDIO 24H →</a>`);
  }
  /* PALCO — performance; fotos via contrato quando existirem */
  function stage() {
    const cards = [
      ["LIVE & RARE™", "Rock Meets Classic ft. Joe Lynn Turner & Dee Snider", "Wacken Open Air · 2015", 1],
      ["UNDERGROUND AUDIO TUNNEL", "Playlists raras em rotação contínua", "Acervo Passport", 0],
      ["LIVE JAM", "Sessões ao vivo · sinal contínuo", "Continuous Signals™", 0]
    ].map(([b, s, t, hero]) => `<a class="pp-stage-card${hero ? " pp-stage-card--hero" : ""}" href="radio.html#passportTunnels"><div class="rv6-media" data-img="none"></div><div class="pp-stage-card__b"><b>${esc(b)}</b><strong>${esc(s)}</strong><span>${esc(t)}</span></div></a>`).join("");
    return env("pp-env--palco", "PALCO · PERFORMANCE", "A história sobe no palco.", "radio.html#passportTunnels", "LIVE & RARE™ →",
      `<div class="pp-stage-grid">${cards}</div>`);
  }
  /* MR. NOMAD — dossiê a partir de format:"MR_NOMAD" do feed */
  function nomad() {
    const items = (window.PASSPORT_FEED_ITEMS || []).filter((it) => it.format === "MR_NOMAD" || /mr\.?\s*nomad/i.test(it.author || "")).slice(0, 3);
    if (!items.length) return "";
    const cards = items.map((it) => {
      const im = it.image && it.image.src ? imgBlock(it.image.src, it.image.alt, it.image.credit) : "";
      let when = "";
      try { when = new Date(it.published_at).toLocaleDateString("pt-BR"); } catch (e) { when = ""; }
      return `<article class="pp-nomad-card" ${im ? "" : 'data-img="none"'}>${im}<span class="rv6-kicker">DOSSIÊ · ${esc(String(it.category || "").replace(/_/g, " "))}</span><h3><a href="${href(it.url)}">${esc(it.title)}</a></h3><p>${esc((it.deck || "").slice(0, 160))}</p><span class="rv6-meta">por <b>Mr. Nomad</b>${when ? " · " + esc(when) : ""}</span></article>`;
    }).join("");
    return `<section class="pp-env pp-env--nomad" aria-label="Mr. Nomad"><div class="pp-env__in">
      <div class="pp-nomad-head"><span class="pp-nomad-seal">MN</span><div><h2>Mr. Nomad</h2><p>Autoria editorial itinerante · dossiês de gente, instrumento e memória.</p></div></div>
      <div class="pp-nomad-grid">${cards}</div>
    </div></section>`;
  }
    /* ARQUIVO — portas de tempo com rotas reais */
  function archive() {
    const doors = [["70", "anos-70/", "Prog, glam, punk, disco: a década que eletrificou a linguagem."], ["80", "anos-80/", "New wave, thrash, synthpop e o rádio que mudava o dia."], ["90", "anos-90/", "Grunge, britpop, eurodance: a década da fragmentação."]]
      .map(([d, u, p]) => `<a class="pp-door pp-door--${d}" data-decade="${d}" href="${u}"><div class="pp-door__c"><b>ARQUIVO ${d}</b><strong>19${d}</strong><p>${esc(p)}</p><span>ENTRAR →</span></div></a>`).join("");
    return env("pp-env--arquivo", "PATRIMÔNIO EDITORIAL", "O arquivo da música.", "destinos.html", "TODO O ARQUIVO →", `<div class="pp-doors">${doors}</div>`);
  }
  /* PASSPORT AGORA — promoções reais */
  async function agora() {
    let camps = [];
    try { const r = await fetch("/data/promocoes.json", { cache: "no-store" }); if (r.ok) camps = ((await r.json()).campaigns || []); } catch (e) {}
    try {
      const rs = await fetch("/data/store_inventory.json", { cache: "no-store" });
      if (rs.ok) {
        const inv = await rs.json();
        const have = new Set(camps.map((c) => String(c.product_id || "")));
        (inv.products || []).forEach((prod) => {
          if (have.has(String(prod.id))) return;
          camps.push({
            id: "STORE-" + prod.id,
            status: "A SEGUIR",
            type: "STORE",
            title: prod.name,
            prize: prod.name,
            prize_image: prod.image || "",
            product_id: prod.id,
            product_url: "loja.html?product=" + prod.id + "&sku=" + (prod.sku || prod.id)
          });
        });
      }
    } catch (e) {}
    if (!camps.length) return "";
    const cards = camps.slice(0, 12).map((p) => {
      const im = p.prize_image ? imgBlock(p.prize_image, p.title) : `<div class="rv6-media" data-img="none"></div>`;
      const win = p.status === "RESULTADO" && p.winner ? `<div class="pp-winner">🏆 ${esc(p.winner)}</div>` : "";
      return `<a class="pp-agora-card" data-status="${esc(p.status)}" href="${href(p.detail_url || p.product_url || "promocoes.html")}">${im}<div class="pp-agora-card__b"><b>${esc(p.status)} · ${esc(p.type)}</b><strong>${esc(p.title)}</strong><span>${esc(p.prize || "")}</span>${win}</div><span class="pp-btn pp-btn--red">${p.status === "AGORA" ? "PARTICIPAR →" : p.status === "RESULTADO" ? "VER RESULTADO →" : "A SEGUIR →"}</span></a>`;
    }).join("");
    return env("pp-env--agora", "PASSPORT AGORA · URGÊNCIA", "Acontecendo agora.", "promocoes.html", "AGORA · A SEGUIR · RESULTADOS →", `<div class="pp-agora-rail">${cards}</div>`);
  }
  /* LOJA band — produtos reais, preço e parcela legíveis */
  async function shop() {
    let prods = [];
    let cap = {};
    try {
      const r = await fetch("/data/store_inventory.json", { cache: "no-store" });
      if (r.ok) {
        const data = await r.json();
        prods = data.products || [];
        cap = data.technical_capacity || {};
      }
    } catch (e) {}
    if (!prods.length) return "";
    const payBits = [];
    if (cap.cartao_max_installments) payBits.push("Cartão até " + cap.cartao_max_installments + "x via Asaas");
    if (cap.boleto_max_installments) payBits.push("Boleto até " + cap.boleto_max_installments + "x via Asaas");
    const payLine = payBits.length ? payBits.join(" · ") : "Pagamento via Asaas · PIX, cartão e boleto";
    const cards = prods.map((p) => {
      const has = !!p.image;
      const mono = esc((p.category || p.name || "PP").slice(0, 2).toUpperCase());
      return `<a class="pp-product" ${has ? "" : 'data-img="none"'} data-mono="${mono}" href="loja.html?product=${esc(p.id)}&sku=${esc(p.sku || p.id)}">${has ? imgBlock(p.image, p.name) : `<div class="rv6-media"></div>`}<b>${esc(p.category || "LOJA")}</b><strong>${esc(p.name)}</strong><span class="pp-price">${money(p.price)}</span><span class="pp-installments">${esc(payLine)}</span><span class="pp-btn pp-btn--ink">VER PRODUTO →</span></a>`;
    }).join("");
    return env("pp-env--loja", "PASSPORT STORE", "Comércio da casa.", "loja.html", "LOJA COMPLETA →", `<div class="pp-shop-grid">${cards}</div>`);
  }
  /* RECIRCULAÇÃO — 6 portas reais, labels obrigatórios (fim dos chips brancos) */
  function recirc() {
    const doors = [
      ["LEITURA", "Últimas histórias", "O river completo da redação", "editorial.html"],
      ["MEMÓRIA", "Arquivo & décadas", "70 · 80 · 90 e dossiês", "destinos.html"],
      ["SINAL", "Rádio 24H", "Estúdio, Tunnels, Continuous Signals", "radio.html"],
      ["MUNDO", "World Dial™", "Estações de outros países", "radio-mundo.html"],
      ["PRESENTE", "Promoções", "AGORA · A SEGUIR · RESULTADOS", "promocoes.html"],
      ["CASA", "Store & Apoio", "Produtos e sustentação", "loja.html"]
    ].map(([b, s, t, u]) => `<a href="${u}"><b>${esc(b)}</b><strong>${esc(s)}</strong><span>${esc(t)}</span></a>`).join("");
    return env("pp-env--recirc", "CONTINUE NA PASSPORT", "A viagem não termina aqui.", "", "", `<div class="pp-recirc-grid">${doors}</div>`);
  }

  async function boot() {
    const feed = document.getElementById("feed"); if (!feed) return;
    const wait = new Promise((res) => { let n = 0; const t = setInterval(() => { if (window.PASSPORT_FEED_ITEMS || ++n > 40) { clearInterval(t); res(); } }, 50); });
    await wait;
    const html = studio() + stage() + nomad() + archive() + await agora() + await shop() + recirc();
    const wrap = document.querySelector(".pp-wrap");
    if (wrap) wrap.insertAdjacentHTML("afterend", html);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();