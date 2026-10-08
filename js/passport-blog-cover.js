/* Showcase metadata only. Audio and navigation remain under their existing owners. */
(() => {
  'use strict';
  if (!document.body.classList.contains('blog-resurrection')) return;
  document.querySelectorAll('[data-word-count]').forEach(card => {
    const words = Number(card.dataset.wordCount);
    const target = card.querySelector('[data-reading-time]');
    if (!target || !Number.isSafeInteger(words) || words <= 0) return;
    const minutes = Math.ceil(words / 200);
    target.textContent = `🕒 Leitura: ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
  });
  fetch('/data/blog-catalog-meta.json').then(response => {
    if (!response.ok) throw Error('catalog metadata');
    return response.json();
  }).then(meta => {
    if (!Number.isSafeInteger(meta.count) || meta.count < 1) return;
    document.querySelectorAll('[data-blog-count]').forEach(node => {
      node.textContent = meta.count.toLocaleString('pt-BR');
    });
  }).catch(() => {}); // Keep the verified static count if metadata is unavailable.
})();
