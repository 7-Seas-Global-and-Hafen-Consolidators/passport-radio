/* PASSPORT PORTAL v3.9 — writer ÚNICO de #pp-feed.
   v3.9: prioridade editorial Passport + feed manual + RSS em uma fila deduplicada.
   Fotografia segue contrato src/alt/focalPoint/credit/fit/srcset.
   Motor de rádio: NÃO TOCA. */
(() => {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&", "<": "<", ">": ">", '"': """, "'": "&#39;" }[c]));
  const safeHref = (v) => { const h = String(v == null ? "" : v).trim(); if (!h) return "#"; if (/^(?:[/?#.]|https?:|mailto:|tel:)/i.test(h)) return esc(h); return "#"; };

  const FEEDS = ["/data/editorial-priority-feed.json", "/data/editorial-manual-feed.json", "/data/editorial-feed.json"];

  const LEGACY_IMG = [
    ["rhapsody-of-fire", "/images/rhapsody-of-fire/Rhapsody-3-madrid.jpg"],
    ["therion-miskolc", "/images/therion-miskolc/maxresdefault32.jpg"],
    ["1986-musicas", "/images/1986/attachment-social-image-366-2026-08-10-09-04-20.webp"],
    ["eye-of-the-tiger", "/images/rocky_3_metro_goldwyn_mayer.webp"],
    ["frank-beard", "/images/frank-beard-zz-top-01.jpg"],
    ["sharon-den-adel", "/images/sharon-den-adel-within-temptation-2026.webp"],
    ["ritchie-blackmore", "/images/ritchie-blackmore-deep-purple-reunion-2026.webp"],
    ["scorpions-hurricane", "/images/scorpions-hurricane-graphic-novel.webp"],
    ["polyphia", "/images/polyphia-be-not-afraid.jpg"],
    ["dolly-parton", "/images/dolly-parton-1946-2026.jpg"],
    ["secos-e-molhados", "/images/secos-e-molhados.jpg"],
    ["made-in-brazil", "/images/made-in-brazil.jpg"],
    ["joelho-de-porco", "/images/joelho-de-porco.jpg"],
    ["golpe-de-estado", "/images/golpe-de-estado.jpg"],
    ["ratos-de-porao", "/images/ratos-de-porao.jpg"],
    ["angra", "/images/angra.jpg"],
    ["colera", "/images/colera.jpg"]
  ];

  function resolveImage(item) {
    const im = item && item.image;
    if (im && im.src && im.approved !== false) return { src: im.src, alt: im.alt || item.title || "", fp: im.focalPoint || "50% 40%", credit: im.credit || "", fit: im.fit || "cover", srcset: im.srcset || null };
    const slug = String(item && (item.slug || item.url || item.title || "")).toLowerCase();
    for (const [k, u] of LEGACY_IMG) if (slug && (slug.includes(k) || k.includes(slug))) return { src: u, alt: item.title || "", fp: "50% 40%", credit: "Passport Radio", fit: "cover", srcset: null };
    return null;
  }
  function fpVars(fp) {
    if (fp && typeof fp === "object") return `--fp-x:${Math.round((fp.x || .5) * 100)}%;--fp-y:${Math.round((fp.y || .4) * 100)}%`;
    const m = String(fp || "").match(/(\d+(?:\.\d+)?)%\s*[,\s]\s*(\d+(?:\.\d+)?)%/);
    return m ? `--fp-x:${m[1]}%;--fp-y:${m[2]}%` : "--fp-x:50%;--fp-y:40%";
  }
  function media(img, ratio, lcp) {
    if (!img) return "";
    const cls = "rv6-media" + (img.fit === "contain" ? " rv6-contain" : "");
    const load = lcp ? 'fetchpriority="high" loading="eager"' : 'loading="lazy" decoding="async"';
    const srcset = img.srcset ? ` srcset="${esc(img.srcset)}" sizes="(max-width:960px) 100vw, 66vw"` : "";
    const credit = img.credit ? `<span class="rv6-credit">${esc(img.credit)}</span>` : "";
    return `<div class="${cls}" style="${fpVars(img.fp)}" data-credit="${esc(img.credit || "Passport Radio")}"><img src="${esc(img.src)}" alt="${esc(img.alt)}" ${load} ${srcset} onerror="this.parentNode.setAttribute('data-img','error')">${credit}</div>`;
  }
  const kicker = (t) => `<span class="rv6-kicker">${esc(String(t || "").replace(/_/g, " "))}</span>`;
  const stamp = (d) => { try { return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }); } catch (e) { return ""; } };
  const meta = (it) => `<span class="rv6-meta">${esc(stamp(it.published_at))}${it.author ? ` · <b>${esc(it.author)}</b>` : ""}</span>`;
  function rel(it) {
    const ents = Array.isArray(it.entities) ? it.entities.slice(0, 6) : [];
    if (!ents.length) return "";
    return `<nav class="rv6-rel" aria-label="Conexões">${ents.map((e) => `<a href="destinos.html?q=${encodeURIComponent(e)}">${esc(e)}</a>`).join("")}</nav>`;
  }
  function leadHTML(it, img) { return `<article class="rv6-lead" ${img ? "" : 'data-img="none"'}>${media(img, "16/9", true)}${kicker(it.category)}<h2><a href="${safeHref(it.url)}">${esc(it.title)}</a></h2><p class="rv6-deck">${esc(it.deck || "")}</p>${meta(it)}${rel(it)}</article>`; }
  function duoHTML(it, img) { return `<a href="${safeHref(it.url)}" ${img ? "" : 'data-img="none"'}>${media(img)}${kicker(it.category)}<h3>${esc(it.title)}</h3><p>${esc((it.deck || "").slice(0, 120))}</p></a>`; }
  function rowHTML(it, img) { return `<a class="rv6-row" href="${safeHref(it.url)}" ${img ? "" : 'data-img="none"'}>${media(img)}<span>${kicker(it.category)}<h3>${esc(it.title)}</h3><p>${esc((it.deck || "").slice(0, 140))}</p>${meta(it)}</span></a>`; }

  async function loadFeed() {
    const merged = [], seen = new Set();
    for (const u of FEEDS) {
      try {
        const r = await fetch(u, { cache: "no-store" }); if (!r.ok) continue;
        const d = await r.json(); const items = Array.isArray(d) ? d : (d.items || []);
        for (const it of items) {
          const key = String(it.url || it.title || "").trim().toLowerCase();
          if (!key || seen.has(key)) continue;
          seen.add(key); merged.push(it);
        }
      } catch (e) { /* um feed não derruba os outros */ }
    }
    return merged;
  }

  function render(items) {
    const host = $("#pp-feed"); if (!host) return;
    if (!items.length) { host.innerHTML = `<p class="rv6-meta">O arquivo está acordando. Tente em instantes.</p>`; return; }
    let h = "", i = 0;
    h += leadHTML(items[i], resolveImage(items[i])); i += 1;
    if (items.length - i >= 2) { h += `<div class="rv6-duo">${duoHTML(items[i], resolveImage(items[i]))}${duoHTML(items[i + 1], resolveImage(items[i + 1]))}</div>`; i += 2; }
    h += `<div class="rv6-band" role="complementary" aria-label="Passport no ar"><i></i><b>PASSPORT ON AIR · 24H</b><span>Continuous Signals™ · Live & Rare™ · Tunnels™</span><a href="radio.html">OUVIR →</a></div>`;
    const rest = items.slice(i);
    h += rest.map((it) => rowHTML(it, resolveImage(it))).join("");
    host.innerHTML = h;
    const fill = (sel, arr) => { const el = $(sel); if (el) el.innerHTML = arr.map((it) => `<li><a href="${safeHref(it.url)}">${esc(it.title)}</a></li>`).join(""); };
    fill("#pp-reco", items.slice(0, 6)); fill("#pp-missed", items.slice(6, 12)); fill("#pp-today", items.slice(12, 18));
    const tags = $("#pp-assuntos");
    if (tags) {
      const c = {}; items.forEach((it) => { const k = it.category || "geral"; c[k] = (c[k] || 0) + 1; });
      tags.innerHTML = Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k]) => `<a href="destinos.html?q=${encodeURIComponent(k)}">${esc(k.replace(/_/g, " "))}</a>`).join("");
    }
    window.PASSPORT_FEED_ITEMS = items;
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => loadFeed().then(render)); else loadFeed().then(render);
})();
