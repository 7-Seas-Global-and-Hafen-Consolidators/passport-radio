/* PASSPORT HOME v6 — dono dos 7 ambientes fora de #pp-feed.
   Não escreve em #pp-feed. Não toca no motor de áudio. */
(() => {
  "use strict";
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&", "<": "<", ">": ">", '"': """, "'": "&#39;" }[c]));
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

  function studio() {
    const units = [
      ["80s Tunnel™", "6 canais · pop · rock · R&B · hair bands · country", "24 HOURS"],
      ["Soul Tunnel™", "Soul dos 80s até agora", "24 HOURS"],
      ["MPB Tunnel™", "MPB · samba · soul brasileiro", "24 HOURS"],
      ["Passport Hits Tunnel™", "Pop · Top 40", "24 HOURS"],
      ["50s & 60s Tunnel™", "Rock ’n’ roll · doo-wop", "24 HOURS"],
      ["Jovem Guarda™", "Iê-iê-iê brasileiro", "24 HOURS"],
      ["Flash House Tunnel™", "Eurodance · house · italo", "24 HOURS"],
      ["Rock Brasil Tunnel™", "Rock nacional · 80s · 90s · 2000s", "24 HOURS"]
    ].map(([b, s, t]) => `<a class="pp-rack__u" href="radio.html#passportTunnels"><b>${esc(b)}</b><span>${esc(s)}</span><small>${esc(t)}</small></a>`).join("");
    return env("pp-env--estudio", "ESTÚDIO PASSPORT · SINAL", "O estúdio está no ar.", "radio.html", "ABRIR CONSOLE →",
      `<div class="pp-rack">${units}</div><a class="pp-env__cta" href="radio.html">ENTRAR NO ESTÚDIO 24H →</a>`);
  }
  function stage() {
    const cards = [
      ["LIVE & RARE™", "Rock Meets Classic ft. Joe Lynn Turner & Dee Snider", "Wacken Open Air · 2015", "/images/passport-radio-definitive.jpg"],
      ["UNDERGROUND AUDIO TUNNEL", "Playlists raras em rotação contínua", "Acervo Passport", "https://img.youtube.com/vi/HaMEzljVtA4/sddefault.jpg"],
      ["LIVE JAM", "Sessões ao vivo", "Continuous Signals™", "https://img.youtube.com/vi/w_1jWR76qCY/sddefault.jpg"]
    ].map(([b, s, t, src]) => `<a class="pp-stage-card" href="radio.html#passportTunnels">${imgBlock(src, s)}<div class="pp-stage-card__b"><b>${esc(b)}</b><strong>${esc(s)}</strong><span>${esc(t)}</span></div></a>`).join("");
    return env("pp-env--palco", "PALCO · PERFORMANCE", "A história sobe no palco.", "radio.html#passportTunnels", "LIVE & RARE™ →", `<div class="pp-stage-grid">${cards}</div>`);
  }
  function nomad() {
    const items = (window.PASSPORT_FEED_ITEMS || []).filter((it) => it.format === "MR_NOMAD" || /mr\.?\s*nomad/i.test(it.author || "")).slice(0, 3);
    if (!items.length) return "";
    const cards = items.map((it) => {
      const im = it.image && it.image.src ? imgBlock(it.image.src, it.image.alt, it.image.credit) : "";
      let when = "";
      try { when = new Date(it.published_at).toLocaleDateString("pt-BR"); } catch (e) { when = ""; }
      return `<article class="pp-nomad-card">${im}<span class="rv6-kicker">DOSSIÊ</span><h3><a href="${href(it.url)}">${esc(it.title)}</a></h3><p>${esc((it.deck || "").slice(0, 160))}</p><span class="rv6-meta">por <b>Mr. Nomad</b>${when ? " · " + esc(when) : ""}</span></article>`;
    }).join("");
    return `<section class="pp-env pp-env--nomad" aria-label="Mr. Nomad"><div class="pp-env__in"><div class="pp-nomad-head"><span class="pp-nomad-seal">MN</span><div><h2>Mr. Nomad</h2><p>Dossiês de gente, instrumento e memória.</p></div></div><div class="pp-nomad-grid">${cards}</div></div></section>`;
  }
  function archive() {
    const doors = [["70", "anos-70/", "Prog, glam, punk, disco."], ["80", "anos-80/", "New wave, thrash, synthpop e o rádio."], ["90", "anos-90/", "Grunge, britpop, eurodance."]]
      .map(([d, u, p]) => `<a class="pp-door" href="${u}"><div class="pp-door__c"><b>ARQUIVO ${d}</b><strong>19${d}</strong><p>${esc(p)}</p><span>ENTRAR →</span></div></a>`).join("");
    return env("pp-env--arquivo", "PATRIMÔNIO EDITORIAL", "O arquivo da música.", "destinos.html", "TODO O ARQUIVO →", `<div class="pp-doors">${doors}</div>`);
  }
  async function agora() {
    let camps = [];
    try { const r = await fetch("/data/promocoes.json", { cache: "no-store" }); if (r.ok) camps = ((await r.json()).campaigns || []); } catch (e) {}
    if (!camps.length) return "";
    const cards = camps.slice(0, 8).map((p) => {
      const im = p.prize_image ? imgBlock(p.prize_image, p.title) : `<div class="rv6-media" data-img="none"></div>`;
      const win = p.status === "RESULTADO" && p.winner ? `<div class="pp-winner">${esc(p.winner)}</div>` : "";
      return `<a class="pp-agora-card" href="${href(p.detail_url || p.product_url || "promocoes.html")}">${im}<div class="pp-agora-card__b"><b>${esc(p.status || "AGORA")} · ${esc(p.type || "")}</b><strong>${esc(p.title)}</strong><span>${esc(p.prize || "")}</span>${win}</div></a>`;
    }).join("");
    return env("pp-env--agora", "PASSPORT AGORA", "Acontecendo agora.", "promocoes.html", "VER PROMOÇÕES →", `<div class="pp-agora-rail">${cards}</div>`);
  }
  async function shop() {
    let prods = []; let cap = {};
    try { const r = await fetch("/data/store_inventory.json", { cache: "no-store" }); if (r.ok) { const data = await r.json(); prods = data.products || []; cap = data.technical_capacity || {}; } } catch (e) {}
    if (!prods.length) return "";
    const payLine = cap.cartao_max_installments ? ("Cartão até " + cap.cartao_max_installments + "x via Asaas") : "PIX, cartão e boleto via Asaas";
    const cards = prods.slice(0, 10).map((p) => `<a class="pp-product" href="loja.html?product=${esc(p.id)}&sku=${esc(p.sku || p.id)}">${p.image ? imgBlock(p.image, p.name) : `<div class="rv6-media" data-img="none"></div>`}<b>${esc(p.category || "LOJA")}</b><strong>${esc(p.name)}</strong><span class="pp-price">${money(p.price)}</span><span class="pp-installments">${esc(payLine)}</span></a>`).join("");
    return env("pp-env--loja", "PASSPORT STORE", "Comércio da casa.", "loja.html", "LOJA COMPLETA →", `<div class="pp-shop-grid">${cards}</div>`);
  }
  function recirc() {
    const doors = [
      ["LEITURA", "Últimas histórias", "editorial.html"],
      ["MEMÓRIA", "Arquivo & décadas", "destinos.html"],
      ["SINAL", "Rádio 24H", "radio.html"],
      ["MUNDO", "World Dial™", "radio-mundo.html"],
      ["PRESENTE", "Promoções", "promocoes.html"],
      ["CASA", "Store & Apoio", "loja.html"]
    ].map(([b, s, u]) => `<a href="${u}"><b>${esc(b)}</b><strong>${esc(s)}</strong></a>`).join("");
    return env("pp-env--recirc", "CONTINUE NA PASSPORT", "A viagem não termina aqui.", "", "", `<div class="pp-recirc-grid">${doors}</div>`);
  }
  async function boot() {
    if (!document.getElementById("feed")) return;
    const html = studio() + stage() + nomad() + archive() + await agora() + await shop() + recirc();
    const wrap = document.querySelector(".pp-wrap");
    if (wrap) wrap.insertAdjacentHTML("afterend", html);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
