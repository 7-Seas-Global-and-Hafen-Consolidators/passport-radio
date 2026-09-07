/* PASSPORT PORTAL v3.8 — writer ÚNICO de #pp-feed.
   v3.8: contrato de fotografia (src/alt/focalPoint/credit/fit/srcset),
   variantes reais de silhueta (lead/duo/row/list/cluster),
   knowledge graph via entities[], band recirculação com labels obrigatórios,
   estados none/error, LCP correto, zero shells vazios.
   Motor de rádio: NÃO TOCA. */
(() => {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const safeHref = (v) => { const h = String(v == null ? "" : v).trim(); if (!h) return "#"; if (/^(?:[/?#.]|https?:|mailto:|tel:)/i.test(h)) return esc(h); return "#"; };

  const FEEDS = ["/data/editorial-manual-feed.json", "/data/editorial-feed.json"];

  /* Mapa legacy de imagem (preserva patrimônio pré-contrato). */
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

  /* CONTRATO DE FOTOGRAFIA — resolução determinística.
     1) item.image.src + approved!==false  => imagem editorial
     2) legacy por slug                     => patrimônio
     3) nada                                => data-img="none" (composição, não erro) */
  function resolveImage(item) {
    const im = item && item.image;
    if (im && im.src && im.approved !== false) {
      return { src: im.src, alt: im.alt || item.title || "", fp: im.focalPoint || "50% 40%", credit: im.credit || "", fit: im.fit || "cover", srcset: im.srcset || null };
    }
    const slug = String(item && (item.slug || item.url || item.title || "")).toLowerCase();
    for (const [k, u] of LEGACY_IMG) if (slug && (slug.includes(k) || k.includes(slug))) return { src: u, alt: item.title || "", fp: "50% 40%", credit: "", fit: "cover", srcset: null };
    return null;
  }
  function fpVars(fp) {
    if (fp && typeof fp === "object") return `--fp-x:${Math.round((fp.x || .5) * 100)}%;--fp-y:${Math.round((fp.y || .4) * 100)}%`;
    const m = String(fp || "").match(/(\d+(?:\.\d+)?)%\s*[,\s]\s*(\d+(?:\.\d+)?)%/);
    return m ? `--fp-x:${m[1]}%;--fp-y:${m[2]}%` : "--fp-x:50%;--fp-y:40%";
  }
  /* renderer de mídia: eager+high só no lead (LCP), lazy no resto, onerror => error state */
  function media(img, ratio, lcp) {
    if (!img) return "";
    const cls = "rv6-media" + (img.fit === "contain" ? " rv6-contain" : "");
    const load = lcp ? 'fetchpriority="high" loading="eager"' : 'loading="lazy" decoding="async"';
    const srcset = img.srcset ? ` srcset="${esc(img.srcset)}" sizes="(max-width:960px) 100vw, 66vw"` : "";
    const credit = img.credit ? `<span class="rv6-credit">${esc(img.credit)}</span>` : "";
    return `<div class="${cls}" style="${fpVars(img.fp)}" data-credit="${esc(img.credit || "PASSPORT")}"><img src="${esc(img.src)}" alt="${esc(img.alt)}" ${load} ${srcset} onerror="this.parentNode.setAttribute('data-img','error')">${credit}</div>`;
  }
  const kicker = (t) => `<span class="rv6-kicker">${esc(String(t || "").replace(/_/g, " "))}</span>`;
  const stamp = (d) => { try { return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }); } catch (e) { return ""; } };
  const meta = (it) => `<span class="rv6-meta">${esc(stamp(it.published_at))}${it.author ? ` · <b>${esc(it.author)}</b>` : ""}</span>`;
  /* knowledge graph: entities[] => busca real do arquivo (zero 404) */
  function rel(it) {
    const ents = Array.isArray(it.entities) ? it.entities.slice(0, 6) : [];
    if (!ents.length) return "";
    return `<nav class="rv6-rel" aria-label="Conexões">${ents.map((e) => `<a href="destinos.html?q=${encodeURIComponent(e)}">${esc(e)}</a>`).join("")}</nav>`;
  }
  const isNomad = (it) => it.format === "MR_NOMAD" || /mr\.?\s*nomad/i.test(it.author || "");

  function leadHTML(it, img) {
    return `<article class="rv6-lead" ${img ? "" : 'data-img="none"'}>${media(img, "16/9", true)}${kicker(it.category)}<h2><a href="${safeHref(it.url)}">${esc(it.title)}</a></h2><p class="rv6-deck">${esc(it.deck || "")}</p>${meta(it)}${rel(it)}</article>`;
  }
  function duoHTML(it, img) {
    return `<a href="${safeHref(it.url)}" ${img ? "" : 'data-img="none"'}>${media(img)}${kicker(it.category)}<h3>${esc(it.title)}</h3><p>${esc((it.deck || "").slice(0, 120))}</p></a>`;
  }
  function rowHTML(it, img) {
    return `<a class="rv6-row" href="${safeHref(it.url)}" ${img ? "" : 'data-img="none"'}>${media(img)}<span>${kicker(it.category)}<h3>${esc(it.title)}</h3><p>${esc((it.deck || "").slice(0, 140))}</p>${meta(it)}</span></a>`;
  }
  function listHTML(it) {
    return `<a href="${safeHref(it.url)}">${kicker(it.category)}<h4>${esc(it.title)}</h4>${meta(it)}</a>`;
  }

  async function loadFeed() {
    for (const u of FEEDS) {
      try { const r = await fetch(u, { cache: "no-store" }); if (!r.ok) continue; const d = await r.json(); const items = Array.isArray(d) ? d : (d.items || []); if (items.length) return items; } catch (e) { /* próximo */ }
    }
    return [];
  }

  function render(items) {
    const host = $("#pp-feed"); if (!host) return;
    if (!items.length) { host.innerHTML = `<p class="rv6-meta">O arquivo está acordando. Tente em instantes.</p>`; return; }
    let h = "", i = 0;
    /* 1 LEAD dominante */
    h += leadHTML(items[i], resolveImage(items[i])); i += 1;
    /* 2 DUO médio */
    if (items.length - i >= 2) { h += `<div class="rv6-duo">${duoHTML(items[i], resolveImage(items[i]))}${duoHTML(items[i + 1], resolveImage(items[i + 1]))}</div>`; i += 2; }
    /* ruptura de sinal dentro da redação */
    h += `<div class="rv6-band" role="complementary" aria-label="Passport no ar"><i></i><b>PASSPORT ON AIR · 24H</b><span>Continuous Signals™ · Live & Rare™ · Tunnels™</span><a href="radio.html">OUVIR →</a></div>`;
    /* 4 ROWS densos (Whiplash mechanics) */
    const rows = items.slice(i, i + 4); i += rows.length;
    h += rows.map((it) => rowHTML(it, resolveImage(it))).join("");
    /* CLUSTER dossiê (1+4) */
    const cl = items.slice(i, i + 5); i += cl.length;
    if (cl.length) {
      const [m, ...side] = cl; const mi = resolveImage(m);
      h += `<section class="rv6-cluster"><div class="rv6-cluster__head"><h2>Dossiê · ${esc(String(m.category || "especial").replace(/_/g, " "))}</h2><a href="destinos.html">ARQUIVO →</a></div><div class="rv6-cluster__grid"><a class="rv6-cluster__main" href="${safeHref(m.url)}" ${mi ? "" : 'data-img="none"'}>${media(mi)}<h3>${esc(m.title)}</h3>${meta(m)}</a><div class="rv6-cluster__side">${side.map((s) => `<a href="${safeHref(s.url)}">${esc(s.title)}</a>`).join("")}</div></div></section>`;
    }
    /* LIST compacta 2col — o volume permanece */
    const rest = items.slice(i, i + 24); i += rest.length;
    if (rest.length) h += `<div class="rv6-list">${rest.map(listHTML).join("")}</div>`;
    /* sobra longa vira rows esparsos para não virar parede de texto */
    const tail = items.slice(i);
    h += tail.map((it, n) => (n % 5 === 0 ? rowHTML(it, resolveImage(it)) : listHTML(it))).join("");
    host.innerHTML = h;
    /* rails úteis (mesmo writer, alvos próprios) */
    const fill = (sel, arr) => { const el = $(sel); if (el) el.innerHTML = arr.map((it) => `<li><a href="${safeHref(it.url)}">${esc(it.title)}</a></li>`).join(""); };
    fill("#pp-reco", items.slice(0, 6));
    fill("#pp-missed", items.slice(6, 12));
    fill("#pp-today", items.slice(12, 18));
    const tags = $("#pp-assuntos");
    if (tags) {
      const c = {}; items.forEach((it) => { const k = it.category || "geral"; c[k] = (c[k] || 0) + 1; });
      tags.innerHTML = Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k]) => `<a href="destinos.html?q=${encodeURIComponent(k)}">${esc(k.replace(/_/g, " "))}</a>`).join("");
    }
    /* expõe para home-v6 (Nomad band) sem criar segundo writer de #pp-feed */
    window.PASSPORT_FEED_ITEMS = items;
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => loadFeed().then(render));
  else loadFeed().then(render);
})();