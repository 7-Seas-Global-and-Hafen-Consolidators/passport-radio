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

## Continuation — owner's commercial presentation order
Resume HEAD: `6822f6e2148aec3173f4a0d3c87d86cfd2c08bdc`; same PR #554 / branch. Supplied four screenshots and order-result HTML were read as presentation/behavior references; proprietary code, customer information, Fatum identity and payment processor were not copied.

- Store card purchase actions align; photos retain original URLs and contain sizing; separate Pix/card/boleto lines. Existing search, categories, 24-item pagination and catalog retained.
- Existing product templates are enhanced centrally through their existing Store script; no hundreds-of-pages rewrite. Real recorded variations only, persistent cart, product delivery query and official existing Store masthead/footer.
- Cart includes reference, real photo, variant, quantity, subtotal, continue-shopping and checkout actions.
- Checkout responsibility moved to its own controller; commercial graphics have their own presentation module; product integration has its own module. Three-area desktop, two-column tablet, stacked mobile, compact editable address.
- Mandatory account creation/login enforced server-side. Passwords use unique salt/scrypt; expiring sessions stored as hashes and sent as HttpOnly Secure cookies. Trusted Origin required for account mutations. No password or session token enters public artifacts.
- CPF and numeric/alphanumeric CNPJ check digits, buyer type, legal name/responsible, phone and account email validated server-side. Check-digit validation is not a verification of legal identity. Reference: Receita/Serpro manual-dv-cnpj.pdf. Pix sends the corresponding CPF/CNPJ type to the existing provider; real provider acceptance remains unverified.
- CAIXA removed as autonomous checkout method. Payment choices depend on backend/provider availability, also checked before checkout; existing Pix-specific discount and idempotency preserved. Original official payment graphics reused at readable sizes. Safe Browsing link targets Passport; no certification claim or Fatum badge copied; unverified Let's Encrypt/Cloudflare claims omitted.
- New `pedido.html` displays actual backend order ID/date/items/address/shipping/total/method and provider-backed status. Pending does not mean approved. Cart only clears after confirmed APPROVED and exact snapshot match.
- Test-only fixture was produced by the real backend using temporary SQLite and mocked providers, not by inserting fake products. Its synthetic order ID and explicit isolated marker are recorded in preview-fixture.json. Private preview's normal APIs remain unavailable; a separately labeled isolated test path will exercise the preserved test record without production transactions.

Validation: changed backend contracts passed 13 existing focused checks; two new account/CPF/CNPJ/ownership checks passed. Browser round pending scoped CI. External CWS/physical-profile/hosting/payment environment blockers from the previous checkpoint remain; no fresh credential test or acquisition was performed. No production change or merge.

Scoped CI run 38320088296 passed all 15 backend tests and catalog/product/cart presentation, then exposed native browser validation hiding the mandatory-account message. `novalidate` now lets the controller enforce account first; individual fields and backend validations remain mandatory. Affected checkout run 38320233755 passed identification, compact address, payment/pending order and 1440/850/390px evidence.

The general CI Loja contract failed on an outdated VM missing CustomEvent and literal assertions freezing the retired cart/payment presentation. Its environment and assertions were updated for event dispatch and authorized graphic presentation/controller delegation; hashes of all catalog data and original product pages, all 37 pages/order/destinations/images/prices, boundary navigation, all categories, early/late search, and non-store ownership remain checked. Only affected assertions were rerun locally. No existing CI was disabled.

The private test path uses isolated storage keys; normal preview and production APIs are not replaced by simulated providers. Test fields/quotes/account/order are explicitly labeled, and no real payment endpoint is called by that preview.

## Final verified delivery — continuation
Application HEAD: `a6f96b268b50f39a987daa75ee4f34df6aaecf78`. General CI 38321781027 and functional Store CI 38321781093 passed. The last capture-only commit 50f0077404489befba13f9809a695c1dfc12fe00 also passed general CI 38322684939 and Store CI 38322684926. 15 backend tests and all 6 historical preservation/pagination tests passed. Desktop/tablet/mobile at 1440/850/390px were verified. Double submit generated one request; pending payment preserved cart. The submitted snapshot is captured before the request, so later cart changes cannot be cleared by an earlier order.

The final capture round reused approved functional tests and only decoded existing images before 11 fresh screenshots; review thumbnails were confirmed loaded. No original image bytes/URLs were changed, no download/conversion/acquisition pipeline was run, no real quote/payment was created. The temporary resume flag was removed; future affected UI/fixture changes execute the full focused browser test. Required CI is preserved.

Existing owner-private preview updated successfully: application source pinned to a6f96b268b50f39a987daa75ee4f34df6aaecf78, Sites source commit 31a96e027307bd8dca80b12e01b260c80ee2d9d3, deployment appgdep_6acd6cc9335c8191821f0dc75a25c359. Normal /api endpoints remain inactive. Explicit /__preview paths show an isolated-test banner, synthetic account/buyer/tariffs, separate storage keys, and the backend-generated test order. No production service or domain was changed.

Preview links:
- Loja: https://passport-store-checkout-preview.mr-nomad.chatgpt.site/loja.html
- Product: https://passport-store-checkout-preview.mr-nomad.chatgpt.site/loja/p/5770202.html
- Test cart: https://passport-store-checkout-preview.mr-nomad.chatgpt.site/__preview/loja.html#pp-store-cart
- Test checkout: https://passport-store-checkout-preview.mr-nomad.chatgpt.site/__preview/checkout.html?reset=1
- Test pending order: https://passport-store-checkout-preview.mr-nomad.chatgpt.site/__preview/pedido.html?order=cead6068-00ac-45d8-877c-d2d5ea2ce1f7

Evidence: https://github.com/7-Seas-Global-and-Hafen-Consolidators/passport-radio/actions/runs/38322684926/artifacts/11779586506 . Eleven screenshots and combined results saved in Passport-Store-evidencias-20261012.zip. JSON evidence persists alongside this checkpoint.

Exact external activation work remains: provision dedicated Node 24 backend/persistent SQLite hosting (existing Railway trial blocker); serve API on the same origin/site as the Store and configure allowed origins; import verified supplier parcel profiles; configure CWS/posting card/contract service codes; verify Mercado Pago acceptance in an appropriate test environment and configure signed webhook. Supplied MP credentials remain private; no new token/PAT test was performed. STORE_PAYMENTS_ENABLED remains false until this validation. No invented measurements, tariffs, payment acceptance or identity certification.

Scope comparison: original catalog data and all product HTML bytes unchanged; no radio/player/Bus/interlock/mutex/Home/Blog/Clips/Podcast/Broadcast changes. No merge.

## Files changed in this continuation (23)
- `.github/workflows/passport-store-checkout.yml`
- `backend/server.mjs`
- `backend/src/database/sqlite.mjs`
- `backend/src/routes/account.mjs`
- `backend/src/routes/checkout.mjs`
- `backend/src/services/mpService.mjs`
- `checkout.html`
- `css/passport-store-commercial.css`
- `docs/store-checkout-20261012/checkpoint.md`
- `docs/store-checkout-20261012/preview-fixture.json`
- `docs/store-checkout-20261012/test-results.json`
- `js/passport-store-checkout.js`
- `js/passport-store-commercial.js`
- `js/passport-store-presentation.js`
- `js/passport-store-product.js`
- `js/passport-store-search.js`
- `js/passport-store-v6.js`
- `loja.html`
- `pedido.html`
- `tests/passport_store_backend.test.mjs`
- `tests/passport_store_browser.cjs`
- `tests/store_pagination.test.cjs`
- `tests/store_preview_fixture.mjs`
