(() => {
  "use strict";
  const KEY = "passport_cookie_consent_v2";
  const PASSPORT = {
    whatsapp: "https://whatsapp.com/channel/0029Vb8OD91BfxoBCBG36F0k",
    telegram: "https://t.me/+FKto2N185cs4OGU0",
    email: "passport@passportradio.online"
  };
  const hasConsent = () => { try { return localStorage.getItem(KEY) === "accepted"; } catch (_) { return false; } };
  const accept = () => {
    try { localStorage.setItem(KEY, "accepted"); } catch (_) {}
    document.documentElement.dataset.passportCookieConsent = "accepted";
    document.documentElement.dataset.passportConsent = "all";
    window.dispatchEvent(new CustomEvent("passport:consent", { detail: { choice: "all" } }));
    document.getElementById("passport-cookie-notice")?.remove();
  };
  const normalizeContacts = () => {
    document.querySelectorAll("a[href]").forEach((link) => {
      const href = link.getAttribute("href") || "";
      if (/^https?:\/\/(?:wa\.me|api\.whatsapp\.com)\//i.test(href)) link.href = PASSPORT.whatsapp;
      if (/^https?:\/\/t\.me\//i.test(href)) link.href = PASSPORT.telegram;
      if (/^mailto:/i.test(href) && /passport/i.test(href)) link.href = `mailto:${PASSPORT.email}`;
    });
  };
  const mount = () => {
    if (hasConsent() || document.getElementById("passport-cookie-notice")) return;
    const notice = document.createElement("aside");
    notice.id = "passport-cookie-notice";
    notice.setAttribute("role", "dialog");
    notice.setAttribute("aria-label", "Aviso de cookies");
    notice.innerHTML = '<p>Usamos armazenamento local e cookies necessários para o funcionamento e a sua preferência neste navegador. <a href="/privacidade.html">Saiba mais</a>.</p><button type="button">ACEITAR COOKIES</button>';
    document.body.appendChild(notice);
    notice.querySelector("button").addEventListener("click", accept);
  };
  const style = () => {
    if (document.getElementById("passport-cookie-notice-style")) return;
    const css = document.createElement("style");
    css.id = "passport-cookie-notice-style";
    css.textContent = '#passport-cookie-notice{position:fixed;left:16px;right:16px;bottom:76px;z-index:70;display:flex;align-items:center;gap:16px;max-width:720px;margin:0 auto;padding:14px 16px;border:1px solid #e4e1da;background:#fff;color:#1a2744;box-shadow:0 10px 30px rgba(26,39,68,.08);font:500 15px/1.4 "Source Sans 3",sans-serif}#passport-cookie-notice p{margin:0}#passport-cookie-notice a{color:#1b3a4b}#passport-cookie-notice button{flex:0 0 auto;width:auto;min-height:44px;border:0;background:#c4312e;color:#fff;padding:0 14px;font:700 14px/1 "Source Sans 3",sans-serif;cursor:pointer}@media(max-width:720px){#passport-cookie-notice{left:12px;right:12px;bottom:72px;flex-direction:column;align-items:stretch}}';
    document.head.appendChild(css);
  };
  const init = () => {
    normalizeContacts();
    if (hasConsent()) { document.documentElement.dataset.passportCookieConsent = "accepted"; document.documentElement.dataset.passportConsent = "all"; return; }
    style(); mount();
  };
  window.PassportCookies = Object.freeze({ accepted: hasConsent, accept });
  window.PassportSite = { contacts: PASSPORT, getConsent: () => hasConsent() ? { choice: "all" } : null, setConsent: accept };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
