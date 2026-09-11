/* PASSPORT PORTAL — Home week compositor. Does not touch audio. */
(() => {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const safeHref = (v) => /^(?:[/?#.]|https?:|mailto:|tel:)/i.test(String(v || "").trim()) ? esc(String(v).trim()) : "#";
  const FEEDS = ["/data/editorial-priority-feed.json", "/data/editorial-manual-feed.json"];

  function picture(item, eager) {
    const im = item && item.image;
    if (!im || !im.src || im.approved === false) return "";
    const load = eager ? 'fetchpriority="high" loading="eager"' : 'loading="lazy" decoding="async"';
    return `<figure class="journey-media"><img src="${esc(im.src)}" alt="${esc(im.alt || item.title || "")}" ${load} style="object-position:${esc(im.focalPoint || "50% 40%")}" onerror="this.closest('figure').remove()">${im.credit ? `<figcaption>${esc(im.credit)}</figcaption>` : ""}</figure>`;
  }
  const kicker = (item) => `<span class="journey-kicker">${esc(String(item.category || item.format || "Mr. Nomad").replace(/_/g, " "))}</span>`;
  const meta = (item) => `<span class="journey-meta">${esc(String(item.published_at || "").slice(0, 10))}${item.author ? ` · <b>${esc(item.author)}</b>` : ""}</span>`;
  const card = (item, cls, eager) => `<article class="${cls}">${picture(item, eager)}<div class="journey-story__copy">${kicker(item)}<h3><a href="${safeHref(item.url)}">${esc(item.title)}</a></h3>${item.deck ? `<p>${esc(item.deck)}</p>` : ""}${meta(item)}</div></article>`;

  function isNomad(item) {
    const blob = `${item.author || ""} ${item.format || ""} ${item.category || ""}`;
    return /nomad|MR_NOMAD|autoral/i.test(blob);
  }

  async function loadWeek() {
    const out = [];
    const seen = new Set();
    const results = await Promise.allSettled(FEEDS.map((url) => fetch(url, {cache: "no-store"}).then((r) => {
      if (!r.ok) throw new Error(url + " -> " + r.status);
      return r.json();
    })));
    results.forEach((result) => {
      if (result.status !== "fulfilled") return;
      const data = result.value;
      const items = Array.isArray(data) ? data : (Array.isArray(data.items) ? data.items : []);
      items.forEach((item) => {
        const key = String(item.url || item.title || "").split("?")[0].trim();
        if (!key || seen.has(key)) return;
        seen.add(key);
        out.push(item);
      });
    });
    const nomad = out.filter(isNomad);
    return (nomad.length ? nomad : out).slice(0, 10);
  }

  function render(week) {
    const root = $("#pp-feed");
    if (!root) return;
    if (!week.length) {
      root.innerHTML = `<p class="journey-empty">A edição da semana está sendo composta.</p>`;
      return;
    }
    const cover = week[0];
    const companions = week.slice(1, 3);
    const rest = week.slice(3);
    root.innerHTML = `
      <section class="journey-cover fd-week">
        <header><span class="fd-week__kicker">MR. NOMAD · ESTA SEMANA</span>
        <h1>A edição autoral.</h1></header>
        <div class="journey-cover__grid">${card(cover, "journey-story journey-story--cover", true)}
          <div>${companions.map((item) => card(item, "journey-story journey-story--companion")).join("")}</div>
        </div>
      </section>
      ${rest.length ? `<div class="journey-rest">${rest.map((item) => card(item, "journey-story")).join("")}</div>` : ""}
    `;
    window.PASSPORT_FEED_ITEMS = week;
    document.dispatchEvent(new CustomEvent("passport:journey-ready", {detail: {count: week.length}}));
  }

  async function boot() {
    try { render(await loadWeek()); }
    catch (error) {
      const root = $("#pp-feed");
      if (root) root.innerHTML = `<p class="journey-empty">A edição da semana está sendo composta.</p>`;
    }
  }
  window.PassportPortal = {refresh: boot};
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, {once: true});
  else boot();
})();
