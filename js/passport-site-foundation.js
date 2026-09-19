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
    css.textContent = '#passport-cookie-notice{position:fixed;left:18px;bottom:18px;z-index:2147483000;display:flex;align-items:center;gap:14px;max-width:min(620px,calc(100vw - 36px));margin:0;padding:13px 14px;border:1px solid rgba(196,165,116,.52);border-radius:9px;background:#0a0a09;color:#f3ead8;box-shadow:0 12px 34px rgba(0,0,0,.42);font:500 13px/1.4 "Instrument Sans",Arial,sans-serif}#passport-cookie-notice p{margin:0}#passport-cookie-notice a{color:#d8bb83;text-decoration:underline}#passport-cookie-notice button{flex:0 0 auto;border:1px solid #c4a574;border-radius:999px;background:#c4a574;color:#090807;padding:9px 12px;font:800 11px/1 "Instrument Sans",Arial,sans-serif;letter-spacing:.06em;cursor:pointer}@media(max-width:620px){#passport-cookie-notice{right:10px;bottom:10px;left:10px;max-width:none;align-items:flex-start;flex-direction:column;gap:10px}#passport-cookie-notice button{width:100%;min-height:38px}}';
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
