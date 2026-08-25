# Passport Editorial Tunnel™

Backend editorial discovery system for Passport Radio.

## Goal

Continuously scan a broad music-news surface, collapse duplicate coverage, and produce a large ranked editorial reservoir for the Passport Editorial Engine™.

The tunnel is deliberately invisible to the public Passport experience. Source names, URLs, authors and crawler diagnostics stay in the internal Action artifact. Public articles are rendered only by the Passport editorial layer.

## Coverage

The current source map spans 50 entry points across:

- metal / hard rock
- classic rock
- progressive
- gothic / alternative / post-punk
- indie
- pop / pop-rock
- soul / R&B
- Brazilian music outlets
- instruments / musician press
- tours / live industry
- legacy / archive material

The source map lives in `data/editorial-sources.json`.

## How it works

`tools/editorial_tunnel.py`:

1. visits each configured landing page;
2. discovers article-like URLs;
3. fetches article metadata;
4. classifies each signal by editorial axis;
5. scores `trend`, `passport` and `archive` value;
6. filters stories already covered by existing Passport HTML;
7. merges duplicate stories detected across outlets;
8. applies category/source diversity;
9. ranks a reservoir of up to **260 signals per run**.

The crawler itself does not publish or modify Passport pages.

## Output

Every run writes:

- `editorial-radar.json` — diagnostic/ranking packet, including internal origins;
- `editorial-daily.json` — the ranked reservoir consumed by the Editorial Engine;
- `editorial-queue.md` — a source-free run summary.

These files are uploaded as a GitHub Actions artifact and are not committed into the live site.

## Schedule

`.github/workflows/editorial-tunnel.yml` runs every two hours and can also be triggered manually from GitHub Actions.

Current excavation parameters:

- reservoir: 260
- up to 8 links per configured entry point
- freshness window: 72 hours
- 16 fetch workers

## Publishing gate

The Tunnel never publishes. The downstream Passport Editorial Engine™ owns writing, a second anti-duplication pass, public-source firewall, HTML generation, feed integration, sitemap updates and the selected publication mode.
