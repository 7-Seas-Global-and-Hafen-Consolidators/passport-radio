/* PASSPORT STORE v6.hotfix — catálogo integral, sem concatenação, sem copy inventada. */
(() => {
  "use strict";
  const ASAAS = "https://www.asaas.com/c/shpb8gbiswnw4t2n";
  const WA = "https://wa.me/message/NZS7ZW4QHQVBG1";
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  let PRODUCTS = [];
  let CAP = { cartao_max_installments: null, boleto_max_installments: null };

  function payLine() {
    const bits = [];
    if (CAP.cartao_max_installments) bits.push("Cartão até " + CAP.cartao_max_installments + "x via Asaas");
    if (CAP.boleto_max_installments) bits.push("Boleto até " + CAP.boleto_max_installments + "x via Asaas");
    if (!bits.length) return "Pagamento via Asaas · PIX, cartão e boleto";
    return bits.join(" · ");
  }

  function labelCat(p) {
    return String(p.category || "LOJA");
  }
  function labelName(p) {
    const name = String(p.name || "").trim();
    const cat = String(p.category || "").trim();
    if (cat && name.toLowerCase().startsWith(cat.toLowerCase())) return name;
    return name;
  }

  function card(p) {
    const has = !!p.image;
    const cat = labelCat(p);
    const name = labelName(p);
    return `<a class="pp-product" ${has ? "" : 'data-img="none"'} data-mono="${esc(cat.slice(0, 2).toUpperCase())}" data-id="${esc(p.id)}" href="loja.html?product=${esc(p.id)}&sku=${esc(p.sku || p.id)}">${has ? `<div class="rv6-media"><img src="${esc(p.image)}" alt="${esc(name)}" loading="lazy" decoding="async" onerror="this.parentNode.setAttribute('data-img','error')"></div>` : `<div class="rv6-media"></div>`}<b>${esc(cat)}</b><strong>${esc(name)}</strong><span class="pp-price">${money(p.price)}</span><span class="pp-installments">${esc(payLine())}</span><span class="pp-btn pp-btn--ink">VER PRODUTO →</span></a>`;
  }

  function detail(p) {
    const has = !!p.image;
    const cat = labelCat(p);
    const name = labelName(p);
    return `<section class="pp-product-detail" id="pp-detail" aria-label="${esc(name)}">
      ${has ? `<div class="rv6-media"><img src="${esc(p.image)}" alt="${esc(name)}" fetchpriority="high" onerror="this.parentNode.setAttribute('data-img','error')"></div>` : `<div class="rv6-media" data-img="none" data-mono="${esc(cat.slice(0, 2).toUpperCase())}"></div>`}
      <div><span class="pp-env__kicker" style="color:var(--pp-red)">PASSPORT STORE · ${esc(cat)}</span>
      <h2>${esc(name)}</h2>
      <span class="pp-price">${money(p.price)}</span>
      <div class="pp-installments">${esc(payLine())}</div>
      <ul><li>Produto oficial Passport Radio${p.sku ? ` · SKU ${esc(p.sku)}` : ""}</li><li>Estoque: ${p.in_stock ? "disponível" : "sob consulta"}</li><li>Pagamento processado por Asaas (PIX, cartão, boleto)</li></ul>
      <div class="pp-store-ctas"><a class="pp-btn pp-btn--red" href="${ASAAS}" target="_blank" rel="noopener">COMPRAR / APOIAR →</a><a class="pp-btn pp-btn--ghost" href="${WA}" target="_blank" rel="noopener">PEDIR VIA WHATSAPP</a></div>
      </div></section>`;
  }

  function chips() {
    const cats = [...new Set(PRODUCTS.map((p) => p.category).filter(Boolean))];
    return `<div class="pp-store-bar"><div class="pp-store-bar__in"><button type="button" class="pp-chip" aria-pressed="true" data-cat="">TUDO</button>${cats.map((c) => `<button type="button" class="pp-chip" aria-pressed="false" data-cat="${esc(c)}">${esc(c.toUpperCase())}</button>`).join("")}</div></div>`;
  }

  function paint(list) {
    const g = document.getElementById("pp-store-grid");
    if (g) g.innerHTML = list.map(card).join("");
  }

  async function boot() {
    const grid = document.getElementById("pp-store-grid");
    if (!grid) return;
    try {
      const r = await fetch("/data/store_inventory.json", { cache: "no-store" });
      if (r.ok) {
        const data = await r.json();
        PRODUCTS = Array.isArray(data.products) ? data.products : [];
        CAP = Object.assign(CAP, data.technical_capacity || {});
      }
    } catch (e) {}
    if (!PRODUCTS.length) {
      grid.innerHTML = `<p class="rv6-meta">Loja em manutenção de vitrine. Tente em instantes.</p>`;
      return;
    }
    if (!document.querySelector(".pp-store-bar")) grid.insertAdjacentHTML("beforebegin", chips());
    const params = new URLSearchParams(location.search);
    const pid = params.get("product");
    const sel = PRODUCTS.find((p) => String(p.id) === String(pid) || String(p.sku) === String(params.get("sku") || ""));
    const old = document.getElementById("pp-detail");
    if (old) old.remove();
    if (sel) grid.insertAdjacentHTML("beforebegin", detail(sel));
    paint(PRODUCTS);
    document.querySelector(".pp-store-bar")?.addEventListener("click", (e) => {
      const b = e.target.closest(".pp-chip");
      if (!b) return;
      document.querySelectorAll(".pp-chip").forEach((c) => c.setAttribute("aria-pressed", "false"));
      b.setAttribute("aria-pressed", "true");
      const cat = b.dataset.cat;
      paint(cat ? PRODUCTS.filter((p) => p.category === cat) : PRODUCTS);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();