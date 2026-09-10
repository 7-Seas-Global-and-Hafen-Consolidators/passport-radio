/* Editorial Engine compatibility hook.
   The Engine requires this URL in index.html. Home composition belongs to
   passport-portal-v3.js; this hook intentionally owns no markup or audio. */
(() => {
  "use strict";
  document.documentElement.dataset.editorialHook = "ready";
})();
