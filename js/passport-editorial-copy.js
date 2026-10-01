/* One copy implementation for the existing editorial families. No audio or data access. */
(() => {
  "use strict";
  if (window.__passportEditorialCopy) return;
  if (!document.querySelector(".pe-prose") && !document.body.classList.contains("pp-article")) return;
  window.__passportEditorialCopy = true;

  const roots = ".pe-prose, .mn-prose, article.prose, main.story, body.pp-article main";
  const excluded = "input, textarea, select, button, form, [contenteditable], [role=\"textbox\"], pre, code, nav, header, footer, aside, audio, video, iframe, [role=\"button\"], [class*=\"player\"], [id*=\"player\"], #audio, .pe-live, .video-wrap, .nomad-video, .hero, .story-hero, .mn-hero, .pe-hero, .blog-collab-strip, .blog-share, .blog-listen, .blog-prevnext, .passport-discussion, .nomad-signoff, .mn-nomad";
  const element = node => node && (node.nodeType === 1 ? node : node.parentElement);

  function storyURL() {
    // Existing alias: both documents have identical main content and the same canonical.
    const aliases = { "/eye-of-the-tiger.html": "/historias/eye-of-the-tiger.html" };
    const expectedPath = aliases[location.pathname] || location.pathname;
    const candidates = [document.querySelector('link[rel="canonical"]')?.getAttribute("href"),
      document.querySelector('meta[property="og:url"]')?.getAttribute("content")];
    for (const candidate of candidates) {
      if (!candidate) continue;
      try {
        const url = new URL(candidate);
        if (url.protocol === "https:" && /^(www\.)?passportradio\.online$/.test(url.hostname) &&
            !url.username && !url.password && !url.port && !url.hash &&
            url.pathname !== "/" && url.pathname === expectedPath) return url.href;
      } catch (_) { /* Missing or invalid metadata leaves normal copy untouched. */ }
    }
    return null;
  }

  document.addEventListener("copy", event => {
    if (event.defaultPrevented || !event.clipboardData || element(event.target)?.closest(excluded) ||
        element(document.activeElement)?.closest("input, textarea, select, [contenteditable]")) return;
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount !== 1) return;
    const range = selection.getRangeAt(0);
    const start = element(range.startContainer), end = element(range.endContainer);
    const root = start?.closest(roots);
    if (!root || !root.contains(end) || start.closest(excluded) || end.closest(excluded)) return;
    // Also reject a selection that crosses a control/code/navigation block in the middle.
    if ([...root.querySelectorAll(excluded)].some(node => range.intersectsNode(node))) return;
    const text = selection.toString();
    if (!text.trim() || /^(?:https?:\/\/|www\.|mailto:|\/)[^\s]+$/i.test(text.trim())) return;
    const canonical = storyURL();
    if (!canonical) return;
    try {
      event.clipboardData.setData("text/plain", text + "\n\nLeia a matéria completa na Passport Radio:\n" + canonical);
      event.preventDefault();
    } catch (_) { /* Browser refusing clipboard access retains its native behavior. */ }
  });
})();

/* Current paper chrome: individual articles only; existing behavior is unchanged. */
(() => {
  const install = () => {
    if (!document.body.classList.contains('pp-article') || document.body.classList.contains('passport-participe-paper')) return;
    if ([...document.scripts].some(script => script.src.includes('/js/passport-editorial-paper-chrome.js'))) return;
    const script = document.createElement('script');
    script.src = '/js/passport-editorial-paper-chrome.js?v=20261001';
    document.head.appendChild(script);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, {once:true});
  else install();
})();
