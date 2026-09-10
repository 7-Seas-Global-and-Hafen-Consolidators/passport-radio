/* Editorial Engine compatibility hook.
   The Engine requires this URL in index.html. Home composition belongs to
   passport-portal-v3.js; this hook owns no editorial markup or audio. It keeps
   the pre-existing discovery and density contracts wired into Home. */
(() => {
  "use strict";
  document.documentElement.dataset.editorialHook = "ready";

  const load = (src) => new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

  (async () => {
    try {
      await load("/js/passport-phase1-discovery.js?v=20260830");
      await load("/js/passport-phase2-home.js?v=20260830");
    } catch (error) {
      console.error("Passport Home contracts", error);
    }
  })();
})();
