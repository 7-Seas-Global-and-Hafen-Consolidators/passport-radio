# Passport Editorial Engine™

The Editorial Engine is the writing, anti-duplication and publishing layer that sits after the Passport Editorial Tunnel™.

## Operating target

- normal target: **70 public articles/day**
- hard technical capacity: **200 public articles/day**
- schedule: every 20 minutes, 24 hours/day
- max normal batch: 6 articles per run
- all public authorship/publishing identity: **Passport Radio**

The target can be changed per manual workflow run, but the code refuses any value above 200/day.

## Pipeline

1. The Editorial Tunnel builds a large ranked reservoir from the configured music-news surface.
2. The Engine reads the latest reservoir.
3. Existing Passport coverage and the compact publication ledger are checked.
4. Candidate topics are rejected when their source URL was already used or when title/event similarity indicates a repeated story.
5. The Engine fetches factual context only for the selected candidate.
6. A model produces a new Portuguese-language Passport article.
7. Public leakage validation rejects source names/URLs/attribution patterns and headlines too close to the discovery headline.
8. Valid articles are rendered with Passport templates, Passport schema authorship and Passport OG metadata.
9. The public feed and sitemap are updated.
10. Related Passport stories are connected automatically by category/entities.

## Anti-repeat controls

The publication ledger stores compact Passport-side metadata:

- Passport title
- published URL/date
- category/format
- key entities
- event key
- title fingerprint
- hash of the discovery URL

The public feed does not contain discovery URLs, source names or outside authors.

The Engine performs similarity checks before and after generation. The post-generation check is the final gate.

## Public-source firewall

Generated public pages use:

- author: `Passport Radio`
- publisher: `Passport Radio`
- Passport local logo as social image
- no discovery image URL
- no discovery URL
- no outside journalist byline
- no source/reference block

A text gate rejects attribution/source patterns before an article can be written to the site.

## Modes

`stage`
: Generates an Action artifact only. Nothing is committed.

`pr`
: Default rollout mode. Valid batches accumulate on `automation/editorial-staging` and a single rolling PR is kept open. This is designed for calibration without dozens of PRs per day.

`direct`
: Valid batches commit straight to `main`. This is the full automatic publication mode.

The scheduled workflow defaults to `pr` unless the repository variable `PASSPORT_EDITORIAL_MODE` changes it.

## Model/API

The Engine uses the OpenAI Responses API and expects `OPENAI_API_KEY` as a GitHub Actions secret. If the secret is absent, the workflow exits safely with `awaiting_openai_api_key`; it does not create or publish articles.

Default model: `gpt-5.6-luna`. It can be overridden with repository variable `PASSPORT_EDITORIAL_MODEL`.

## Site integration

Generated pages live under:

`/editorial/YYYY/MM/DD/slug.html`

The public hub is:

`/editorial.html`

On the first applied batch, the Engine installs the small `/js/editorial-home.js` hook into `index.html`. It only adds the Editorial 24H feed module and does not replace or modify the existing radio/player engines.

## Protected areas

The Engine does not edit:

- `radio.html`
- Live & Rare™
- 50s & 60s Tunnel™
- 80s Tunnel™
- Soul Tunnel™ / Total Soul
- MPB Tunnel™
- Passport Hits
- Continuous Signals™
- player interlock/pop-out scripts

Its write surface during publication is limited to generated `/editorial/` pages, `data/editorial-feed.json`, `data/editorial-published.json`, `sitemap.xml` and the one-time Home script hook.
