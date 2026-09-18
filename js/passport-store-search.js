(() => {
  "use strict";

  const CART_KEY = "passport-store-cart-v1";
  const INDEX = "/data/store-search/index.json";
  const ASAAS = "https://www.asaas.com/c/shpb8gbiswnw4t2n";
  const WA = "https://wa.me/message/NZS7ZW4QHQVBG1";

  const fold = (value) => String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  const money = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const esc = (value) => {
    const d = document.createElement("div");
    d.textContent = String(value || "");
    return d.innerHTML;
  };

  function params() {
    const q = new URLSearchParams(location.search);
    return {
      q: q.get("q") || "",
      entity: q.get("entity") || "",
      cat: q.get("cat") || "",
      type: q.get("type") || "",
      gender: q.get("gender") || ""
    };
  }
  function cart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); } catch (e) { return []; }
  }
  function saveCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    paintCart();
    emit("cart_update", { count: items.reduce((n, i) => n + (i.qty || 1), 0) });
  }
  function emit(name, detail) {
    try {
      window.dispatchEvent(new CustomEvent("passport-store:" + name, { detail: detail || {} }));
    } catch (e) {}
  }

  function paintCart() {
    const slot = document.getElementById("pp-store-cart");
    if (!slot) return;
    const items = cart();
    if (!items.length) {
      slot.innerHTML = '<p class="pp-cart-empty">Carrinho vazio. A Loja usa o checkout Asaas da casa; o pedido detalhado também pode ir pelo WhatsApp.</p>';
      return;
    }
    const total = items.reduce((n, i) => n + Number(i.price || 0) * Number(i.qty || 1), 0);
    slot.innerHTML = `
      <h2>Carrinho</h2>
      <ul>${items.map((i) => `<li data-id="${esc(i.id)}"><strong>${esc(i.name)}</strong> · ${money(i.price)} ×
        <button type="button" data-qty="-1" aria-label="diminuir">−</button>
        <span>${esc(i.qty)}</span>
        <button type="button" data-qty="1" aria-label="aumentar">+</button>
        <button type="button" data-remove="1">Remover</button></li>`).join("")}</ul>
      <p>Subtotal ${money(total)}</p>
      <p class="pp-cart-note">O Asaas desta casa é o checkout atual. Ele não recebe SKU automaticamente. WhatsApp leva o pedido com os itens.</p>
      <p><a class="pp-btn pp-btn--red" href="${ASAAS}" target="_blank" rel="noopener">Checkout Asaas</a>
         <a class="pp-btn pp-btn--ghost" href="${WA}?text=${encodeURIComponent("Pedido Passport Store: " + items.map((i) => i.qty + "× " + i.name).join(", "))}" target="_blank" rel="noopener">Pedir via WhatsApp</a></p>
    `;
    slot.onclick = (ev) => {
      const li = ev.target.closest("li[data-id]");
      if (!li) return;
      const id = li.getAttribute("data-id");
      let next = cart().slice();
      const row = next.find((x) => String(x.id) === id);
      if (!row) return;
      if (ev.target.closest("[data-remove]")) next = next.filter((x) => String(x.id) !== id);
      else if (ev.target.closest("[data-qty]")) {
        row.qty = Math.max(1, Number(row.qty || 1) + Number(ev.target.getAttribute("data-qty")));
      }
      saveCart(next);
    };
  }

  function add(product) {
    const items = cart();
    const found = items.find((x) => String(x.id) === String(product.id));
    if (found) found.qty = Number(found.qty || 1) + 1;
    else items.push({ id: product.id, sku: product.sku, name: product.name, price: product.price, qty: 1 });
    saveCart(items);
    emit("add_to_cart", { id: product.id });
  }

  function filterItems(items, state) {
    const tokens = fold(state.q).split(" ").filter(Boolean);
    const entity = fold(state.entity);
    const cat = fold(state.cat);
    const type = fold(state.type);
    const gender = fold(state.gender);
    return items.filter((item) => {
      if (!item.publishable) return false;
      if (cat && fold(item.category) !== cat) return false;
      if (type && fold(item.type) !== type) return false;
      if (gender && fold(item.gender) !== gender) return false;
      if (entity && fold(item.artist) !== entity && !(item.norm || "").includes(entity)) return false;
      if (!tokens.length) return true;
      const hay = item.norm || fold([item.name, item.artist, item.category, item.sku, item.type].join(" "));
      return tokens.every((t) => hay.includes(t));
    });
  }

  function paintResults(items, state) {
    const host = document.getElementById("pp-store-search-results");
    if (!host) return;
    if (!state.q && !state.entity && !state.type && !state.gender) {
      host.innerHTML = "";
      return;
    }
    if (!items.length) {
      host.innerHTML = `<p class="pp-store-empty">Nenhum produto publicável para “${esc(state.q || state.entity || state.type)}”. O catálogo Stamp/Passport não inventa SKU para preencher buraco.</p>`;
      return;
    }
    host.innerHTML = `<p>${items.length} produto${items.length === 1 ? "" : "s"}</p><div class="pp-store-grid pp-store-grid--search">${items.map((p) =>
      `<a class="pp-product" href="${esc(p.url || ("/loja/p/" + p.id + ".html"))}"><img src="${esc(p.image || "")}" alt="${esc(p.name)}" width="220" height="220" loading="lazy"><b>${esc(p.category || "")}</b><strong>${esc(p.name)}</strong><span class="pp-price">${money(p.price)}</span></a>`
    ).join("")}</div>`;
  }

  function doors(items) {
    const slot = document.getElementById("pp-store-doors");
    if (!slot) return;
    const cats = {};
    const artists = {};
    const types = {};
    items.filter((p) => p.publishable).forEach((p) => {
      if (p.category) cats[p.category] = (cats[p.category] || 0) + 1;
      if (p.artist) artists[p.artist] = (artists[p.artist] || 0) + 1;
      if (p.type) types[p.type] = (types[p.type] || 0) + 1;
    });
    const link = (href, label, n) => `<a href="${href}">${esc(label)} <small>${n}</small></a>`;
    slot.innerHTML = `
      <nav class="pp-store-doors" aria-label="Portas da Loja">
        <div><span>Tipo</span>${Object.keys(types).sort().map((k) => link("/loja.html?type=" + encodeURIComponent(k), k, types[k])).join("")}</div>
        <div><span>Artista no catálogo real</span>${Object.keys(artists).sort().slice(0, 24).map((k) => link("/loja.html?entity=" + encodeURIComponent(k), k, artists[k])).join("")}</div>
        <div><span>Categoria</span>${Object.keys(cats).sort().map((k) => link("/loja.html?cat=" + encodeURIComponent(k), k, cats[k])).join("")}</div>
      </nav>`;
  }

  async function boot() {
    const form = document.querySelector("form.pp-store-search");
    const state = params();
    if (form) {
      const input = form.querySelector('input[name="q"]');
      if (input && state.q) input.value = state.q;
      form.addEventListener("submit", () => emit("search", { q: (form.querySelector('input[name="q"]') || {}).value }));
    }
    paintCart();
    document.addEventListener("click", (ev) => {
      const btn = ev.target.closest("[data-add-cart]");
      if (!btn) return;
      add({
        id: btn.getAttribute("data-add-cart"),
        sku: btn.getAttribute("data-sku"),
        name: btn.getAttribute("data-name"),
        price: Number(btn.getAttribute("data-price") || 0)
      });
    });
    let items = [];
    try {
      const payload = await fetch(INDEX, { credentials: "same-origin" }).then((r) => r.json());
      items = payload.items || [];
    } catch (e) { items = []; }
    doors(items);
    paintResults(filterItems(items, state), state);
    const q = new URLSearchParams(location.search);
    const pid = q.get("product") || (location.pathname.match(/\/loja\/p\/([^/.]+)/) || [])[1];
    if (pid && document.getElementById("pp-store-grid")) {
      const sel = items.find((p) => String(p.id) === String(pid) || String(p.sku) === String(q.get("sku") || ""));
      if (sel && !document.querySelector("[data-add-cart]")) {
        const host = document.getElementById("pp-store-grid");
        const bar = document.createElement("p");
        bar.innerHTML = `<button type="button" class="pp-btn pp-btn--ink" data-add-cart="${esc(sel.id)}" data-sku="${esc(sel.sku)}" data-name="${esc(sel.name)}" data-price="${esc(sel.price)}">Adicionar ao carrinho</button>`;
        host.parentNode.insertBefore(bar, host);
      }
    }
    const cep = document.getElementById("pp-store-cep");
    if (cep) {
      cep.addEventListener("submit", (ev) => {
        ev.preventDefault();
        const out = document.getElementById("pp-store-cep-out");
        if (out) out.textContent = "Frete e prazo saem do checkout Asaas / WhatsApp. Esta página não inventa transportadora.";
      });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
