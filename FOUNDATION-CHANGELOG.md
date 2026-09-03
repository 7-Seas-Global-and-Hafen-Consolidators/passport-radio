# Passport global foundation — 2026-09-03

Scope: contacts, Telegram, cookie consent and legal pages only.

Canonical channels currently preserved from the existing repository:
- WhatsApp: +48 732 099 369
- Telegram: +44 7594 716370
- E-mail: passport@passportradio.online

Added:
- `js/passport-site-foundation.js`
- `js/passport-legal-foundation.js`
- privacy, cookie and terms pages
- isolated preview page

Corrected:
- `js/home-support.js` no longer rewrites the repository's canonical WhatsApp to the conflicting +55 number.

Protected and intentionally untouched:
- Passport Archive player
- Passport Live player
- Live & Rare
- Metal / Unplugged / Live Jam
- 80s / Soul / MPB tunnels
- Editorial Engine and Editorial Tunnel
- native radio workflow

Before merge, global HTML integration must be reviewed separately so the foundation is not coupled to protected audio code.
