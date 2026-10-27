/* Decorative photographs only. No media, playback, navigation or inventory access. */
(() => {
  'use strict';
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) entry.target.dataset.motion = entry.isIntersecting && !document.hidden ? 'running' : 'paused';
  });
  const art = [...document.querySelectorAll('.living-performance-art')];
  for (const item of art) { item.dataset.motion = 'paused'; observer.observe(item); }
  document.addEventListener('visibilitychange', () => {
    for (const item of art) {
      if (document.hidden) item.dataset.motion = 'paused';
      else { observer.unobserve(item); observer.observe(item); }
    }
  });
})();
