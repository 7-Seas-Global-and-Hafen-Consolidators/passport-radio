(() => {
  'use strict';
  // Presentation index. Never an analytics, visitor, impression or GA4 count.
  const config = Object.freeze({baseValue: 28000000, baseTimestamp: '2026-09-30T00:00:00-03:00', growthRate: 0.35}); // units / second
  const valueAt = (now = Date.now()) => Math.floor(config.baseValue + Math.max(0, now - Date.parse(config.baseTimestamp)) / 1000 * config.growthRate);
  const root = typeof window === 'undefined' ? globalThis : window;
  root.PassportMovement = Object.freeze({config, valueAt});
  if (typeof document === 'undefined') return;
  const node = document.getElementById('movement-index');
  if (!node) return;
  const render = () => { node.textContent = valueAt().toLocaleString('pt-BR'); };
  render();
  setInterval(render, matchMedia('(prefers-reduced-motion: reduce)').matches ? 10000 : 1000);
  document.addEventListener('visibilitychange', render);
})();
