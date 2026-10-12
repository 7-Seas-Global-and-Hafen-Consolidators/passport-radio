# Passport Store — checkpoint 2026-10-12

Initial main: `6003ab7f02ce984864a0bcf51e9c07fe60e32aa3`. PR #553 was already merged (historical head `702da02d47d41881ff2bdeedf29c05ac695f85d0`); its backend scaffold is preserved and extended. No open continuation PR existed, so this operation uses the single branch `feat/passport-store-shipping-checkout-20261012`.

Qwen's complete 441-line specification and supplied checkout/Correios references were read. Its shipping service, route, origin grouping, persistent quote, database and payment contracts were adapted to the actual Node backend. Legacy SOAP, invented dimensions and fallback tariffs were replaced by documented Correios CWS price/prazo calls. No catalog prices, images or SKUs were edited.

## Implemented
- Existing catalog/search and 24-item pagination retained; existing cart upgraded with quantity, removal, photos and authoritative quote totals.
- Correios authentication and configured service intersection across verified supplier/origin packages; persisted 15-minute quotes; unavailable service/invalid CEP/missing shipping data fail explicitly.
- SQLite shipping profiles, quotes, orders and tracking fields. Import accepts verified shipping data only.
- Three-column responsive address/delivery/payment/review checkout; Passport typography/colors; HTTPS/payment notices and Google Safe Browsing status link. Let's Encrypt/Cloudflare slots remain hidden until actual provider usage is verified.
- Checkout Pro preference for card/Caixa/account/boleto and dedicated Pix payment (validated CPF, provider ticket, method-specific discount), backend price/quantity/quote validation and recotation, idempotency, authenticated order status, signed webhook and provider-confirmed payment state/amount/currency/account validation. Payments default disabled. No real payment, quote, purchase or charge was created.
- Dedicated narrow CI and browser evidence using mocked providers only. Radios, Home, shared audio/Bus/interlock, Clips, editorial pages, Podcast and Broadcast untouched.

## Validation
13 focused backend tests passed (11 initial checks plus dedicated Pix and Correios homologation contracts). First round identified a SQLite INSERT placeholder count error; it was corrected and only the three affected tests rerun successfully. Syntax checks passed. Browser run 38312257415 passed catalog, pagination, cart and quote UI, then exposed a missing quote repaint on checkout navigation. It was corrected with payment-radio restoration; run 38312519662 passed the affected checkout and mobile/search checks. Run 38312817739 on code SHA `0d0ecec1fd0deae3e18c1592326078b671d681d5` passed all 13 backend checks and the affected CPF/payment persistence/checkout, search and 390px mobile evidence. No further browser rounds are needed for documentation/workflow cleanup. Screenshot quotes are simulated fixtures, never real Correios tariffs.

## External blockers / activation
1. All 933 preserved catalog records lack verified weight/height/width/length/origin ZIP. Supply real supplier shipping profiles (including capacity), then import with `backend/import-shipping-profiles.mjs` into the private runtime database.
2. Correios CWS username/API key/posting card and contract-authorized service codes are absent. Configure backend environment and confirm real price/prazo responses; no tariffs or origins were invented.
3. Railway rejected creation of an isolated Store project: trial expired, plan required. Existing Global Signals infrastructure was not touched. Provision a Store-only Node 24 service and persistent database volume; configure public API origin/CORS and store-runtime API URL. No commercial backend is currently deployed.
4. Owner-supplied Mercado Pago credentials stored only as secret environment values in the owner-private Store preview project. They were not committed, printed or exposed to browser code. A read-only provider identity request returned HTTP 403/non-JSON; recognition is unconfirmed, not a demonstrated diagnosis of the credential. Sandbox TEST credentials/accounts, provider identity and webhook secret/URL still need verification before enabling real payments. No live preference was created.
5. Private preview is static UI, API unavailable until backend activation. It must not imply that selling or real shipping is operational. Production domain/deploy untouched. No merge authorized or performed.

Exact configuration names and deployment instructions: `backend/.env.example`; physical profile import: `backend/import-shipping-profiles.mjs`. Do not enable STORE_PAYMENTS_ENABLED until the backend, real quote, provider identity, webhook and appropriate payment tests are verified.

## Delivery evidence
Private UI preview: https://passport-store-checkout-preview.mr-nomad.chatgpt.site/loja.html and /checkout.html (backend inactive, no live tariffs/payments). PR #554 is the single continuation of merged #553. Initial catalog/cart screenshots: run 38312257415; final checkout/mobile screenshots and JSON: https://github.com/7-Seas-Global-and-Hafen-Consolidators/passport-radio/actions/runs/38312817739/artifacts/11775735962 . Unit results are mocked contract validation, not provider acceptance.

The temporary affected-test resume flag was removed after successful checkout evidence; future UI changes run the complete focused browser test. Existing CI/protections are unchanged. Scope comparison against initial main confirmed only Store frontend/backend, its runtime config, ignore entries, tests, dedicated workflow and checkpoint changed; inventory chunks and all protected systems remained identical.

## Files changed
- `.gitignore`
- `loja.html`
- `checkout.html`
- `js/passport-store-v6.js`
- `js/passport-store-search.js`
- `js/passport-store-commercial.js`
- `css/passport-store-commercial.css`
- `data/store-runtime.json`
- `.github/workflows/passport-store-checkout.yml`
- `tests/passport_store_backend.test.mjs`
- `tests/passport_store_browser.cjs`
- `docs/store-checkout-20261012/checkpoint.md`
- `backend/import-shipping-profiles.mjs`
- `backend/Dockerfile`
- `backend/server.mjs`
- `backend/.env.example`
- `backend/src/database/sqlite.mjs`
- `backend/src/routes/shipping.mjs`
- `backend/src/routes/checkout.mjs`
- `backend/src/services/catalog.mjs`
- `backend/src/services/errors.mjs`
- `backend/src/services/mpService.mjs`
- `backend/src/services/shippingProvider.mjs`
- `docs/store-checkout-20261012/test-results.json`
