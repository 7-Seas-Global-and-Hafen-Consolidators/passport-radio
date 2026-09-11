/* PASSPORT PORTAL v4 — único writer do rio editorial da Home. */
(() => {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const safeHref = (v) => /^(?:[/?#.]|https?:|mailto:|tel:)/i.test(String(v || "").trim()) ? esc(String(v).trim()) : "#";
  const FEEDS = ["/data/editorial-priority-feed.json", "/data/editorial-manual-feed.json", "/data/editorial-feed.json"];
  const state = (v) => { document.documentElement.dataset.portalState = v; };

  function picture(item, eager = false) {
    const im = item && item.image;
    if (!im || !im.src || im.approved === false) return "";
    const load = eager ? 'fetchpriority="high" loading="eager"' : 'loading="lazy" decoding="async"';
    return `<figure class="journey-media"><img src="${esc(im.src)}" alt="${esc(im.alt || item.title || "")}" ${load} style="object-position:${esc(im.focalPoint || "50% 40%")}" onerror="this.closest('figure').remove()">${im.credit ? `<figcaption>${esc(im.credit)}</figcaption>` : ""}</figure>`;
  }
  const kicker = (item) => `<span class="journey-kicker">${esc(String(item.category || item.format || "Passport").replace(/_/g, " "))}</span>`;
  const meta = (item) => `<span class="journey-meta">${esc(String(item.published_at || "").slice(0, 10))}${item.author ? ` · <b>${esc(item.author)}</b>` : ""}</span>`;
  const card = (item, cls = "journey-story") => `<article class="${cls}">${picture(item)}<div class="journey-story__copy">${kicker(item)}<h3><a href="${safeHref(item.url)}">${esc(item.title)}</a></h3>${item.deck ? `<p>${esc(item.deck)}</p>` : ""}${meta(item)}</div></article>`;

  async function loadAll() {
    const out = []; const seen = new Set();
    const results = await Promise.allSettled(FEEDS.map((url) => fetch(url, {cache:"no-store"}).then((r) => {
      if (!r.ok) throw new Error(url + " -> " + r.status);
      return r.json();
    })));
    results.forEach((result, index) => {
      if (result.status !== "fulfilled") {
        console.warn("[portal-v4] fonte:", FEEDS[index], result.reason);
        return;
      }
      const data = result.value;
      const items = Array.isArray(data) ? data : (Array.isArray(data.items) ? data.items : []);
      items.forEach((item) => {
        const key = String(item.url || item.title || "").split("?")[0].trim();
        if (!key || seen.has(key)) return;
        seen.add(key); out.push(item);
      });
    });
    return out;
  }

  function wave(items, title, cls = "") {
    if (!items.length) return "";
    const [lead, ...rest] = items;
    return `<section class="journey-wave ${cls}"><header class="journey-head"><span>PASSAPORTE EDITORIAL</span><h2>${esc(title)}</h2></header><div class="journey-wave__grid">${card(lead, "journey-story journey-story--wide")}<div class="journey-wave__list">${rest.map((item) => card(item, "journey-story journey-story--row")).join("")}</div></div></section>`;
  }

  function territory(id, eyebrow, title, copy, house, archive) {
    return `<section class="journey-territory journey-territory--${id}"><div><span>${esc(eyebrow)}</span><h2>${esc(title)}</h2><p>${esc(copy)}</p><nav><a href="#passport-casas" data-open-existing-house="${esc(house)}">OUVIR NESTA PÁGINA →</a>${archive ? `<a href="${safeHref(archive)}">ABRIR ARQUIVO →</a>` : ""}</nav></div></section>`;
  }

  function musicians(items) {
    if (!items.length) return "";
    return `<section class="journey-musicians"><header class="journey-head"><span>QUEM ESTAVA TOCANDO?</span><h2>O caminho dos músicos.</h2></header><div>${items.map((item) => {
      const names = (item.entities || []).filter((name) => !/^mr\.?\s*nomad$/i.test(name)).slice(0, 4);
      return `<a href="${safeHref(item.url)}">${kicker(item)}<strong>${esc(item.title)}</strong><small>${esc(names.join(" · "))}</small></a>`;
    }).join("")}</div></section>`;
  }

  function fofonetes() {
    return `<section class="journey-fofonetes"><img src="/images/fofonete-home.jpg" alt="Fofonete da Passport Radio" loading="lazy"><div><span>FOFONETES™ · CAMPANHA DA CASA</span><h2>Eu fiz as contas de novo.</h2><p>A Passport fica no ar com quem lê, ouve, compra e ajuda.</p><button type="button" data-open-fofonete>CONHECER A FOFONETE →</button></div></section>`;
  }

  function counter(items) {
    const count = items.length;
    return `<section class="journey-counter"><strong>${count}</strong><span>histórias publicadas e organizadas nesta Home</span><a href="editorial.html">ABRIR O ARQUIVO COMPLETO →</a></section>`;
  }

  function render(items) {
    const root = $("#pp-feed");
    if (!root) return;
    if (!items.length) {
      state("empty"); root.innerHTML = '<p class="journey-empty">O arquivo está acordando…</p>'; return;
    }
    state("ok:" + items.length);
    const pool = items.slice();
    const cover = pool.shift();
    const companions = pool.splice(0, 2);
    const first = pool.splice(0, 12);
    const second = pool.splice(0, 14);
    const musicianIndexes = [];
    pool.forEach((item, index) => {
      if (musicianIndexes.length < 6 && Array.isArray(item.entities) && item.entities.length >= 3) musicianIndexes.push(index);
    });
    const musicianSet = new Set(musicianIndexes);
    const musicianItems = pool.filter((_, index) => musicianSet.has(index));
    let remainder = pool.filter((_, index) => !musicianSet.has(index));
    const third = remainder.splice(0, 14);
    const brazil = remainder.filter((item) => /brasil|brazilian|mpb/i.test(String(item.category || ""))).slice(0, 8);
    const brazilUrls = new Set(brazil.map((item) => item.url));
    remainder = remainder.filter((item) => !brazilUrls.has(item.url));

    root.innerHTML = `
      <section class="journey-cover">
        <header><span>MR. NOMAD APRESENTA</span><h1>Música com história.<br>Rádio com memória.</h1></header>
        <div class="journey-cover__grid">${card(cover, "journey-story journey-story--cover")}<div>${companions.map((item) => card(item, "journey-story journey-story--companion")).join("")}</div></div>
      </section>
      ${wave(first, "Agora na Passport.", "journey-wave--first")}
      ${wave(second, "História, notícia e memória.")}
      ${territory("80s", "TERRITÓRIO 80s™", "Você não lembrava dessa música. Até ela começar a tocar.", "Rádio, novela, TV, danceteria, cinema e palco.", "/radio-80s.html", "/anos-80-bandas-musicas-rock-new-wave.html")}
      ${musicians(musicianItems)}
      ${territory("live", "LIVE & RARE™", "O show acabou. O registro não.", "Performances, raridades e arquivos que ainda respiram.", "/radio-live-rare.html", "")}
      ${wave(third, "Mais histórias para ouvir e ler.")}
      ${fofonetes()}
      ${territory("brasil", "DO BRASIL · ROCK BRASIL™", "Nomes, instrumentos e histórias que o Brasil não pode esquecer.", "Do palco brasileiro para o arquivo vivo da Passport.", "/radio-rock-brasil.html", "")}
      ${wave(brazil, "Do Brasil, com nome e instrumento.", "journey-wave--brazil")}
      ${wave(remainder, "Matérias e memória: o rio continua.", "journey-wave--archive")}
      ${counter(items)}
    `;
    window.PASSPORT_FEED_ITEMS = items;
    document.dispatchEvent(new CustomEvent("passport:journey-ready", {detail:{count:items.length}}));
  }

  async function boot() {
    try { render(await loadAll()); }
    catch (error) {
      state("error");
      const root = $("#pp-feed");
      if (root) root.innerHTML = `<p class="journey-empty">Falha no rio: ${esc(error.message || error)}</p>`;
    }
  }
  window.PassportPortal = {refresh:boot};
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, {once:true});
  else boot();
})();
