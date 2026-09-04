/* =========================================================
   PASSPORT PORTAL v3 — dados / circulação / UI
   NÃO toca: áudio, tunnels, World Dial, Auth, Fofonete.
   Sem telemetria falsa: blocos editoriais reais do feed.
   ========================================================= */
(() => {
  'use strict';
  const FEED = '/data/editorial-feed.json';
  const LOGO = '/images/passport-radio-definitive.jpg';
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const fmt = v => { try { return new Intl.DateTimeFormat('pt-BR', {day:'2-digit', month:'2-digit', year:'numeric'}).format(new Date(v)); } catch(_) { return ''; } };
  const daysOld = v => Math.floor((Date.now() - new Date(v).getTime()) / 86400000);
  const thumbOf = it => it.image || it.image_url || it.thumbnail || it.og_image || LOGO;
  const catLabel = c => String(c || 'PASSPORT').replace(/_/g, ' ').toUpperCase();
  const imgTag = (it, cls) => `<img class="${cls}" src="${esc(thumbOf(it))}" alt="${esc(it.title)}" loading="lazy" onerror="this.onerror=null;this.src='${LOGO}';">`;
  const feedHTML = items => {
    let out = '';
    items.forEach((it, i) => {
      out += `<article class="pp-item"><a href="${esc(it.url)}" tabindex="-1" aria-hidden="true">${imgTag(it, 'pp-item-thumb')}</a><div><span class="pp-item-k">${esc(catLabel(it.category))}</span><h2><a href="${esc(it.url)}">${esc(it.title)}</a></h2>${it.deck ? `<p>${esc(it.deck)}</p>` : ''}<span class="pp-item-meta">${esc(it.author || 'Passport Radio')} · ${fmt(it.published_at)}</span></div></article>`;
      if (i === 5) out += `<div class="pp-feed-promo"><div><b>PROMOÇÃO · PR-0001</b><strong>Ganhe um Fone Bluetooth 5.3</strong></div><a href="promocao-fone-bluetooth.html">PARTICIPAR →</a></div>`;
      if (i === 9) out += `<div class="pp-feed-ad"><ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-7728480662290062" data-ad-slot="1000000003" data-ad-format="auto" data-full-width-responsive="true"></ins></div>`;
      if (i === 14) out += `<div class="pp-feed-radio"><i></i><div><strong>PASSPORT RADIO · 24H</strong><small>Você muda de matéria, não perde a música.</small></div><a href="radio.html">OUVIR →</a></div>`;
      if (i === 24) out += `<div class="pp-feed-ad"><ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-7728480662290062" data-ad-slot="1000000004" data-ad-format="auto" data-full-width-responsive="true"></ins></div>`;
    });
    return out;
  };
  const recoHTML = items => items.slice(0, 5).map(it => `<li><a href="${esc(it.url)}"><span class="pp-reco-t">${esc(it.title)}</span></a></li>`).join('');
  const missedHTML = items => items.slice(0, 6).map(it => `<li><a href="${esc(it.url)}">${esc(it.title)}</a></li>`).join('') || '<li><a href="destinos.html">Abrir o arquivo completo →</a></li>';
  const todayHTML = (hits, older) => { const list = hits.length ? hits : older.slice(0, 4); return list.map(it => `<li><a href="${esc(it.url)}">${esc(it.title)}</a></li>`).join('') || '<li><a href="destinos.html">Arquivo →</a></li>'; };
  const assuntosHTML = items => {
    const freq = {};
    items.forEach(it => (it.entities || []).forEach(e => { const k = norm(e); if (k) freq[k] = (freq[k] || 0) + 1; }));
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k]) => `<a href="destinos.html?q=${encodeURIComponent(k)}">${esc(k.replace(/\b\w/g, m => m.toUpperCase()))}</a>`).join('');
  };
  const pushAds = () => { document.querySelectorAll('.pp-ad-slot ins.adsbygoogle, .pp-feed-ad ins.adsbygoogle').forEach(() => { (window.adsbygoogle = window.adsbygoogle || []).push({}); }); };
  const boot = async () => {
    let items = [];
    try { const r = await fetch(FEED, { cache: 'no-store' }); if (!r.ok) return; const d = await r.json(); items = Array.isArray(d) ? d : (d.items || []); } catch(_) { return; }
    if (!items.length) return;
    items.sort((a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0));
    const tk = $('#pp-ticker'); if (tk) tk.textContent = items.slice(0, 8).map(i => i.title).join('  ·  ');
    const fd = $('#pp-feed'); if (fd) fd.innerHTML = feedHTML(items.slice(0, 40));
    const reco = [...items].sort((a, b) => { const fa = (a.format === 'MR_NOMAD' || a.format === 'STORY') ? 2 : 0; const fb = (b.format === 'MR_NOMAD' || b.format === 'STORY') ? 2 : 0; return (fb + Math.min((b.entities || []).length, 6) / 6) - (fa + Math.min((a.entities || []).length, 6) / 6); });
    const rc = $('#pp-reco'); if (rc) rc.innerHTML = recoHTML(reco);
    const ms = $('#pp-missed'); if (ms) ms.innerHTML = missedHTML(items.filter(i => daysOld(i.published_at) > 10));
    const now = new Date();
    const hits = items.filter(i => { const d = new Date(i.published_at); return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() < now.getFullYear(); });
    const td = $('#pp-today'); if (td) td.innerHTML = todayHTML(hits, items.filter(i => daysOld(i.published_at) > 20));
    const as = $('#pp-assuntos'); if (as) as.innerHTML = assuntosHTML(items);
    pushAds();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})();