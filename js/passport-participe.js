/* The page's submission contacts are explicit, unlike the global channel links. */
(() => {
  "use strict";
  if (!document.body.classList.contains("passport-participe-paper")) return;
  document.querySelectorAll("a[data-participe-contact]").forEach(link => {
    const href = link.getAttribute("href");
    const restore = () => { if (link.getAttribute("href") !== href) link.setAttribute("href", href); };
    new MutationObserver(restore).observe(link, { attributes: true, attributeFilter: ["href"] });
  });
})();
