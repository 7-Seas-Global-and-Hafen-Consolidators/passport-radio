/* PASSPORT STORE v6 — grid premium + detalhe de produto + categorias.
   Honra deep-link ?product=ID&sku=SKU (rota de compra existente).
   Checkout: Asaas (hub oficial) + WhatsApp com produto presetado. Nada inventado. */
(() => {
  "use strict";
  const ASAAS = "https://www.asaas.com/c/shpb8gbiswnw4t2n";
  const WA = "https://wa.me/message/NZS7ZW4QHQVBG1";
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const parcel = (v) => `${money(Number(v || 0) / 12)} × 12 sem juros`;
  let PRODUCTS = [];

  function card(p) {
    const has = !!p.image;
    return `<a class="pp-product" ${has ? "" : 'data-img="none"'} data-mono="${esc((p.category || "PP").slice(0, 2).toUpperCase())}" data-id="${esc(p.id)}" href="?product=${esc(p.id)}&sku=${esc(p.sku || p.id)}">${has ? `<div class="rv6-media"><img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" decoding="async" onerror="this.parentNode.setAttribute('data-img','error')"></div>` : `<div class="rv6-media"></div>`}<b>${esc(p.category || "LOJA")}</b><strong>${esc(p.name)}</strong><span class="pp-price">${money(p.price)}</span><span class="pp-installments">${parcel(p.price)}</span><span class="pp-btn pp-btn--ink">VER PRODUTO →</span></a>`;
  }
  function detail(p) {
    const has = !!p.image;
    return `<section class="pp-product-detail" id="pp-detail" aria-label="${esc(p.name)}">
      ${has ? `<div class="rv6-media"><img src="${esc(p.image)}" alt="${esc(p.name)}" fetchpriority="high" onerror="this.parentNode.setAttribute('data-img','error')"></div>` : `<div class="rv6-media" data-img="none" data-mono="${esc((p.category || "PP").slice(0, 2).toUpperCase())}"></div>`}
      <div><span class="pp-env__kicker" style="color:var(--pp-red)">PASSPORT STORE · ${esc(p.category || "")}</span>
      <h2>${esc(p.name)}</h2>
      <span class="pp-price">${money(p.price)}</span>
      <div class="pp-installments">${parcel(p.price)} · boleto em até 180x via Asaas</div>
      <ul><li>Produto oficial Passport Radio${p.sku ? ` · SKU ${esc(p.sku)}` : ""}</li><li>Estoque: ${p.in_stock ? "disponível" : "sob consulta"}</li><li>Pagamento: PIX, cartão, boleto (Asaas)</li></ul>
      <div style="display:flex;gap:10px;flex-wrap:wrap"><a class="pp-btn pp-btn--red" href="${ASAAS}" target="_blank" rel="noopener">COMPRAR / APOIAR →</a><a class="pp-btn pp-btn--ghost" href="${WA}" target="_blank" rel="noopener">PEDIR VIA WHATSAPP</a></div>
      <div class="pp-trust-row"><span>PIX</span><span>CARTÃO</span><span>BOLETO</span><span>VISA</span><span>MASTERCARD</span><span>ELO</span><span>AMEX</span></div></div></section>`;
  }
  function chips() {
    const cats = [...new Set(PRODUCTS.map((p) => p.category).filter(Boolean))];
    return `<div class="pp-store-bar"><div class="pp-store-bar__in"><button class="pp-chip" aria-pressed="true" data-cat="">TUDO</button>${cats.map((c) => `<button class="pp-chip" aria-pressed="false" data-cat="${esc(c)}">${esc(c.toUpperCase())}</button>`).join("")}</div></div>`;
  }
  function paint(list) { const g = document.getElementById("pp-store-grid"); if (g) g.innerHTML = list.map(card).join(""); }
  async function boot() {
    const grid = document.getElementById("pp-store-grid"); if (!grid) return;
    try { const r = await fetch("/data/store_inventory.json", { cache: "no-store" }); if (r.ok) PRODUCTS = (await r.json()).products || []; } catch (e) {}
    if (!PRODUCTS.length) { grid.innerHTML = `<p class="rv6-meta">Loja em manutenção de vitrine. Tente em instantes.</p>`; return; }
    grid.insertAdjacentHTML("beforebegin", chips());
    const params = new URLSearchParams(location.search);
    const pid = params.get("product");
    const sel = PRODUCTS.find((p) => String(p.id) === String(pid));
    if (sel) grid.insertAdjacentHTML("beforebegin", detail(sel));
    paint(PRODUCTS);
    document.querySelector(".pp-store-bar")?.addEventListener("click", (e) => {
      const b = e.target.closest(".pp-chip"); if (!b) return;
      document.querySelectorAll(".pp-chip").forEach((c) => c.setAttribute("aria-pressed", "false"));
      b.setAttribute("aria-pressed", "true");
      const cat = b.dataset.cat;
      paint(cat ? PRODUCTS.filter((p) => p.category === cat) : PRODUCTS);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();