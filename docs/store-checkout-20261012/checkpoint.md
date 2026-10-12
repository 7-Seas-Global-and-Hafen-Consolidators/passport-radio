# Passport Store — checkpoint 2026-10-12

Initial main: `6003ab7f02ce984864a0bcf51e9c07fe60e32aa3`. PR #553 was already merged (historical head `702da02d47d41881ff2bdeedf29c05ac695f85d0`); its backend scaffold is preserved and extended. No open continuation PR existed, so this operation uses the single branch `feat/passport-store-shipping-checkout-20261012`.

Qwen's complete 441-line specification and supplied checkout/Correios references were read. Its shipping service, route, origin grouping, persistent quote, database and payment contracts were adapted to the actual Node backend. Legacy SOAP, invented dimensions and fallback tariffs were replaced by documented Correios CWS price/prazo calls. No catalog prices, images or SKUs were edited.

## Implemented
- Existing catalog/search and 24-item pagination retained; existing cart upgraded with quantity, removal, photos and authoritative quote totals.
- Correios authentication and configured service intersection across verified supplier/origin packages; persisted 15-minute quotes; unavailable service/invalid CEP/missing shipping data fail explicitly.
- SQLite shipping profiles, quotes, orders and tracking fields. Import accepts verified shipping data only.
- Three-column responsive address/delivery/payment/review checkout; Passport typography/colors; HTTPS/payment notices and Google Safe Browsing status link. Let's Encrypt/Cloudflare slots remain hidden until actual provider usage is verified.
- Checkout Pro preference, backend price/quantity/quote validation and recotation, idempotency, authenticated order status, signed webhook and provider-confirmed payment state/amount/currency/account validation. Payments default disabled. No real payment, quote, purchase or charge was created.
- Dedicated narrow CI and browser evidence using mocked providers only. Radios, Home, shared audio/Bus/interlock, Clips, editorial pages, Podcast and Broadcast untouched.

## Validation
11 focused backend tests passed. First round identified a SQLite INSERT placeholder count error; it was corrected and only the three affected tests rerun successfully. Syntax checks passed. Browser evidence pending the branch CI run; screenshot quotes will be explicitly marked simulated, never represented as real Correios tariffs.

## External blockers / activation
1. All 933 preserved catalog records lack verified weight/height/width/length/origin ZIP. Supply real supplier shipping profiles (including capacity), then import with `backend/import-shipping-profiles.mjs` into the private runtime database.
2. Correios CWS username/API key/posting card and contract-authorized service codes are absent. Configure backend environment and confirm real price/prazo responses; no tariffs or origins were invented.
3. Railway rejected creation of an isolated Store project: trial expired, plan required. Existing Global Signals infrastructure was not touched. Provision a Store-only Node 24 service and persistent database volume; configure public API origin/CORS and store-runtime API URL. No commercial backend is currently deployed.
4. Owner-supplied Mercado Pago credentials stored only as secret environment values in the owner-private Store preview project. They were not committed, printed or exposed to browser code. A read-only provider identity request returned HTTP 403/non-JSON; recognition is unconfirmed, not a demonstrated diagnosis of the credential. Sandbox TEST credentials/accounts, provider identity and webhook secret/URL still need verification before enabling real payments. No live preference was created.
5. Private preview is static UI, API unavailable until backend activation. It must not imply that selling or real shipping is operational. Production domain/deploy untouched. No merge authorized or performed.

Exact configuration names and deployment instructions: `backend/.env.example`; physical profile import: `backend/import-shipping-profiles.mjs`. Do not enable STORE_PAYMENTS_ENABLED until the backend, real quote, provider identity, webhook and appropriate payment tests are verified.
