(() => {
  const P = window.PassportGlobalSignals;
  const app = document.getElementById('app');
  const id = new URLSearchParams(location.search).get('id') || '';
  if (!P || !app) return;

  const stamp = (value) => {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? '' : new Intl.DateTimeFormat('pt-BR', { dateStyle:'long', timeStyle:'short' }).format(d);
  };

  const sameSceneScore = (base, candidate) => {
    let score = 0;
    if (P.fold(base.region) && P.fold(base.region) === P.fold(candidate.region)) score += 3;
    if (P.fold(base.genre) && P.fold(base.genre) === P.fold(candidate.genre)) score += 3;
    const a = new Set(P.fold(`${base.title} ${base.summary}`).split(/\s+/).filter(x => x.length > 4));
    const b = new Set(P.fold(`${candidate.title} ${candidate.summary}`).split(/\s+/).filter(x => x.length > 4));
    a.forEach(token => { if (b.has(token)) score += 1; });
    return score;
  };

  const show = (item, all = []) => {
    if (!item) {
      app.innerHTML = '<section class="signal-empty"><strong>Este Signal não passou pela validação editorial.</strong><a href="/#passport-editorial-home">← Voltar ao Global Wire</a></section>';
      return;
    }

    document.title = `${P.decode(item.title)} | Passport Signal`;
    const related = all
      .filter((x) => x.id !== item.id && P.safePT(x.title, '', 'pt') && P.musicRelevant(x))
      .map(x => ({ item:x, score:sameSceneScore(item, x) }))
      .sort((a,b) => b.score - a.score || (new Date(b.item.date).getTime()||0) - (new Date(a.item.date).getTime()||0))
      .slice(0, 3)
      .map(x => x.item);
    const summary = P.decode(item.summary || '');
    const region = P.decode(item.region || 'Global');
    const genre = P.decode(item.genre || 'Música');
    const why = `Sinal musical validado em português e classificado pelo Radar Editorial Mundial em ${genre} · ${region}.`;

    app.innerHTML = `
      <section class="signal-head">
        <div class="kicker"><span>PASSPORT SIGNAL · RADAR</span><span>${P.esc(region)}</span></div>
        <span class="signal-status">RADAR</span>
        <h1>${P.esc(item.title)}</h1>
        ${summary ? `<p class="deck">${P.esc(summary)}</p>` : ''}
        <div class="meta">
          <span>${P.esc(genre)}</span><span>PT-BR</span>${item.date ? `<span>${P.esc(stamp(item.date))}</span>` : ''}
        </div>
      </section>

      <article class="signal-brief">
        <div class="brief-label">O QUE ACONTECEU</div>
        <p class="brief-copy">${summary ? P.esc(summary) : 'O Radar Editorial Mundial detectou esta atualização musical. Novos dados podem ampliar ou substituir este brief conforme o sinal evolui.'}</p>

        <div class="signal-context">
          <div><small>REGIÃO</small><strong>${P.esc(region)}</strong></div>
          <div><small>GÊNERO</small><strong>${P.esc(genre)}</strong></div>
          <div><small>FORMATO</small><strong>Passport Signal</strong></div>
          <div><small>STATUS</small><strong>Radar</strong></div>
        </div>

        <div class="signal-why">
          <small>POR QUE ESTÁ NO RADAR</small>
          <p>${P.esc(why)}</p>
        </div>

        <div class="signal-actions">
          <a class="signal-btn signal-btn--red" href="/#passport-editorial-home">VER GLOBAL WIRE →</a>
          <a class="signal-btn" href="/editorial.html">ABRIR EDITORIAL →</a>
        </div>
      </article>

      <section class="related-signals" aria-label="Signals relacionados">
        <div class="related-signals__head"><div><small>CONTINUE NO RADAR</small><br><strong>Signals da mesma cena ou território.</strong></div></div>
        ${related.length ? `<div class="related-signals__grid">${related.map((x) => `
          <a class="rel" href="/signal.html?id=${encodeURIComponent(x.id)}">
            <small>${P.esc(x.region || 'GLOBAL')} · ${P.esc(x.genre || 'MÚSICA')}</small>
            <strong>${P.esc(x.title)}</strong>
          </a>`).join('')}</div>` : '<div class="rail-empty">Novos Signals relacionados ainda estão entrando no Radar.</div>'}
      </section>`;
  };

  const stored = P.readStored();
  const cached = stored.find((x) => String(x.id) === String(id));
  if (cached) show(cached, stored);

  P.loadRaw().then(async (r) => {
    const target = r.items.find((x) => String(x.id) === String(id));
    if (!target) { if (!cached) show(null, stored); return; }

    const main = await P.translate(target);
    if (!main) { if (!cached) show(null, stored); return; }

    const candidates = r.items.filter((x) => x.id !== target.id).slice(0, 24);
    const translated = await Promise.allSettled(candidates.map(P.translate));
    const related = translated
      .filter((x) => x.status === 'fulfilled' && x.value)
      .map((x) => x.value)
      .filter((x) => P.safePT(x.title, '', 'pt') && P.musicRelevant(x))
      .slice(0, 16);

    const all = [main, ...related];
    P.remember(all);
    show(main, all);
  }).catch(() => { if (!cached) show(null, stored); });
})();
