/* Shared document continuity and discreet privacy link. No catalog or page content is changed. */
(() => { if (document.querySelector('script[data-passport-continuity]')) return;
  const script=document.createElement('script');script.src='/js/passport-audio-continuity.js';script.defer=true;script.dataset.passportContinuity='1';document.head.appendChild(script);
})();

(() => {
  "use strict";

  const CART_KEY = "passport-store-cart-v1";
  const INDEX = "/data/store-search/index.json";
  const MERCADO_PAGO = "https://link.mercadopago.com.br/passportradio";
  const WA = "https://whatsapp.com/channel/0029Vb8OD91BfxoBCBG36F0k";

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
    return d.innerHTML.replace(/"/g,"&quot;").replace(/'/g,"&#39;");
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
    if (window.PassportStore) window.PassportStore.renderCart();
  }

  function add(product) {
    window.PassportStore?.add(product);
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

  function paintResults(items, state, allItems) {
    const host = document.getElementById("pp-store-search-results");
    if (!host) return;
    if (document.body.classList.contains("passport-store-paper") && window.passportStoreView) {
      const active = state.q || state.entity || state.cat || state.type || state.gender;
      host.innerHTML = active && !items.length ? `<p class="pp-store-empty">Nenhum produto publicável para “${esc(state.q || state.entity || state.type)}”. O catálogo Stamp/Passport não inventa SKU para preencher buraco.</p>` : "";
      const render = (p) => `<article class="pp-product"><a class="pp-product-link" data-id="${esc(p.id)}" href="${esc(p.url || ("/loja/p/" + p.id + ".html"))}"><div class="rv6-media"><img src="${esc(p.image || "")}" alt="${esc(p.name)}" width="220" height="220" loading="lazy" onerror="this.hidden=true;this.closest('.rv6-media').dataset.img='error';"></div><b>${esc(p.category || "")}</b><strong>${esc(p.name)}</strong><span class="pp-price">${money(p.price)}</span><span class="pp-btn pp-btn--ink">VER PRODUTO →</span></a><button type="button" class="pp-btn pp-btn--red" data-add-cart="${esc(p.id)}" data-sku="${esc(p.sku||p.id)}" data-name="${esc(p.name)}" data-price="${esc(p.price)}">ADICIONAR AO CARRINHO</button></article>`;
      window.passportStoreView.search(active ? (cat) => filterItems(allItems, { ...state, cat }) : null, render, state);
      return;
    }
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
    if (document.body.classList.contains("passport-store-paper")) {
      slot.querySelectorAll(".pp-store-doors > div").forEach((group) => {
        const details = document.createElement("details"), summary = document.createElement("summary");
        summary.textContent = group.querySelector("span").textContent;
        details.append(summary);
        group.querySelectorAll("a").forEach((link) => details.append(link));
        group.replaceWith(details);
      });
    }
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
      ev.preventDefault();
      add({
        id: btn.getAttribute("data-add-cart"),
        sku: btn.getAttribute("data-sku"),
        name: btn.getAttribute("data-name"),
        price: Number(btn.getAttribute("data-price") || 0),
        pix: btn.getAttribute("data-pix") ? Number(btn.getAttribute("data-pix")) : undefined
      });
    });
    let items = [];
    try {
      const payload = await fetch(INDEX, { credentials: "same-origin" }).then((r) => r.json());
      items = payload.items || [];
    } catch (e) { items = []; }
    doors(items);
    paintResults(filterItems(items, state), state, items);
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

  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  window.addEventListener("passport-store:ready",paintCart);
})();
