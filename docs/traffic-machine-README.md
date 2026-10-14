# Máquina de tráfego automático
Branch: feat/traffic-machine-20261014

## SEO
Run `node scripts/seo-injector.mjs --dry-run` to preview counts, then `node scripts/seo-injector.mjs` to inject schema and related links into existing HTML. Commit generated changes separately. The script skips existing schemas of the same type and is idempotent.

## Telegram
Set repository secrets `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`. Workflow triggers on main pushes affecting blog/editorial/sitemap. State is tracked in `data/telegram-sent.json`. First execution initializes historical URLs without sending them. Workflow commits state updates. Avoid concurrent publication changes while bot commits state.

## Bands
`/analise.html?banda=Nome%20Da%20Banda` provides a shareable branded page. The current Participe page accepts submissions via email, not a form. Do not claim a submission was received automatically. The page is noindex.

## Verification
Run `node --check scripts/seo-injector.mjs`, `node --check scripts/disparar-telegram.mjs`, and the SEO dry run. No Telegram messages can be sent without configured secrets. Do not merge without owner review.
