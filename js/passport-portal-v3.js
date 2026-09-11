/* Home compositor. No audio. No RSS dump. Max 10 Nomad + 4 news teaser. */
(() => {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const safeHref = (v) => /^(?:[/?#.]|https?:|mailto:|tel:)/i.test(String(v || "").trim()) ? esc(String(v).trim()) : "#";

  function picture(item, eager) {
    const im = item && item.image;
    if (!im || !im.src || im.approved === false) return "";
    const load = eager ? 'fetchpriority="high" loading="eager"' : 'loading="lazy" decoding="async"';
    return `<figure class="journey-media"><img src="${esc(im.src)}" alt="${esc(im.alt || item.title || "")}" ${load} style="object-position:${esc(im.focalPoint || "50% 40%")}" onerror="this.closest('figure').remove()"></figure>`;
  }
  const kicker = (item) => `<span class="journey-kicker">${esc(String(item.category || item.format || "Mr. Nomad").replace(/_/g, " "))}</span>`;
  const meta = (item) => `<span class="journey-meta">${esc(String(item.published_at || "").slice(0, 10))}${item.author ? ` · <b>${esc(item.author)}</b>` : ""}</span>`;
  const card = (item, cls, eager) => `<article class="${cls}">${picture(item, eager)}<div class="journey-story__copy">${kicker(item)}<h3><a href="${safeHref(item.url)}">${esc(item.title)}</a></h3>${item.deck ? `<p>${esc(item.deck)}</p>` : ""}${meta(item)}</div></article>`;

  function isNomad(item) {
    return /nomad|MR_NOMAD|autoral/i.test(`${item.author || ""} ${item.format || ""} ${item.category || ""}`);
  }

  async function readFeed(url) {
    try {
      const r = await fetch(url, {cache: "no-store"});
      if (!r.ok) return [];
      const data = await r.json();
      return Array.isArray(data) ? data : (data.items || []);
    } catch (_) { return []; }
  }

  function dedupe(items) {
    const seen = new Set(); const out = [];
    items.forEach((item) => {
      const key = String(item.url || item.title || "").split("?")[0].trim();
      if (!key || seen.has(key)) return;
      seen.add(key); out.push(item);
    });
    return out;
  }

  function territory() {
    return `<section class="fd-territory" data-open-existing-house="/radio-80s.html">
      <span class="fd-week__kicker">TERRITÓRIO</span>
      <h2>Anos 80</h2>
      <p>Rádio, novela, pista e palco — a década como destino musical. Ouve o sinal que já existe nesta página.</p>
      <button type="button" data-open-existing-house="/radio-80s.html">OUVIR 80s NESTA PÁGINA</button>
    </section>`;
  }

  function newsTeaser(items) {
    const four = items.slice(0, 4);
    if (!four.length) return "";
    return `<section class="fd-wire">
      <header><span class="fd-week__kicker">CIRCULAÇÃO</span><h2>Quatro notícias</h2><a href="noticias.html">VER TODAS</a></header>
      <div class="fd-wire__list">${four.map((x) => `<article><span>${esc(String(x.category || "Notícia").replace(/_/g," "))}</span><h3><a href="${safeHref(x.url)}">${esc(x.title)}</a></h3></article>`).join("")}</div>
    </section>`;
  }

  function balcony() {
    return `<section class="fd-balcony">
      <a href="editorial.html#loja"><b>Loja</b><span>Produto da casa</span></a>
      <a href="promocoes.html#anuncie"><b>Anuncie</b><span>Mídia para marcas</span></a>
      <a href="https://www.asaas.com/c/shpb8gbiswnw4t2n" target="_blank" rel="noopener"><b>Ajude</b><span>PIX · boleto · cartão</span></a>
    </section>
    <nav class="fd-paths"><a href="editorial.html">Arquivo</a><a href="radio.html">Rádio 24H</a><a href="noticias.html">Notícias</a></nav>`;
  }

  function weekHtml(week) {
    if (!week.length) return `<p class="journey-empty">A edição da semana está sendo composta.</p>`;
    const cover = week[0];
    const companions = week.slice(1, 3);
    const rest = week.slice(3);
    return `<section class="journey-cover fd-week">
      <header><span class="fd-week__kicker">MR. NOMAD · ESTA SEMANA</span><h1>A edição autoral.</h1></header>
      <div class="journey-cover__grid">${card(cover, "journey-story journey-story--cover", true)}
        <div class="journey-companions">${companions.map((item) => card(item, "journey-story journey-story--companion")).join("")}</div>
      </div>
    </section>
    ${rest.length ? `<div class="journey-rest">${rest.map((item, i) => card(item, "journey-story" + (i === 0 ? " journey-story--wide" : ""))).join("")}</div>` : ""}
    ${territory()}`;
  }

  async function boot() {
    const [priority, manual, rss] = await Promise.all([
      readFeed("/data/editorial-priority-feed.json"),
      readFeed("/data/editorial-manual-feed.json"),
      readFeed("/data/editorial-feed.json")
    ]);
    const pool = dedupe([...priority, ...manual]);
    const nomad = pool.filter(isNomad);
    const week = (nomad.length ? nomad : pool).slice(0, 10);
    const feed = $("#pp-feed");
    if (feed) feed.innerHTML = weekHtml(week);
    const after = $("#pp-after");
    if (after) after.innerHTML = newsTeaser(dedupe(rss)) + balcony();
    window.PASSPORT_FEED_ITEMS = week;
    document.dispatchEvent(new CustomEvent("passport:journey-ready", {detail: {count: week.length}}));
  }
  window.PassportPortal = {refresh: boot};
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, {once: true});
  else boot();
})();
