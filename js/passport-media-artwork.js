/* System playback identity only. Transport, actions and audio ownership stay untouched. */
(() => {
  'use strict';
  if (window !== window.top || window.PassportMediaArtwork) return;
  const artwork = [192, 512].map(size => ({
    src: new URL(`/images/brand/passport-radio-media-${size}-20261102.png`, location.origin).href,
    sizes: `${size}x${size}`,
    type: 'image/png'
  }));

  function identify() {
    if (!('mediaSession' in navigator) || typeof MediaMetadata !== 'function') return;
    try {
      const current = navigator.mediaSession.metadata;
      if (!current) {
        navigator.mediaSession.metadata = new MediaMetadata({artwork});
      } else if (current.artwork.length !== artwork.length ||
                 current.artwork.some((item, i) => item.src !== artwork[i].src || item.sizes !== artwork[i].sizes || item.type !== artwork[i].type)) {
        // Preserve existing title, artist and album. Only the station image changes.
        current.artwork = artwork;
      }
    } catch (_) { /* A browser without artwork support keeps its native playback behavior. */ }
  }

  // Explicit, versioned icons also replace a browser's previously cached identity.
  for (const rel of ['icon', 'apple-touch-icon']) {
    let icon = document.querySelector(`link[rel="${rel}"]`);
    if (!icon) { icon = document.createElement('link'); icon.rel = rel; document.head.append(icon); }
    icon.href = artwork[0].src;
    icon.type = 'image/png';
    icon.sizes = '192x192';
  }
  window.PassportMediaArtwork = Object.freeze({identify});
  identify();
  window.addEventListener('passport:audio-state', identify);
  document.addEventListener('playing', identify, true);
})();
