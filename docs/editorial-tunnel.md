# Passport Editorial Tunnel™

Backend editorial discovery system for Passport Radio.

## Goal

Continuously scan a broad music-news surface, collapse duplicate coverage, and produce a balanced **Top 20 daily editorial queue** without publishing anything automatically.

The tunnel is deliberately invisible to the public Passport experience. Source names, URLs, authors and crawler diagnostics stay in the internal Action artifact. Public articles remain Passport / Mr. Nomad editorial pieces.

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
2. discovers a small set of article-like URLs;
3. fetches article metadata only;
4. classifies each signal by editorial axis;
5. scores `trend`, `passport` and `archive` value;
6. filters stories already covered by existing Passport HTML;
7. merges duplicate stories detected across outlets;
8. applies category quotas and source diversity;
9. selects up to 20 items.

The crawler does **not** copy full article bodies and does not modify the Passport website.

## Output

Every run writes:

- `editorial-radar.json` — full diagnostic/ranking packet, including internal origins;
- `editorial-daily.json` — the selected Top 20;
- `editorial-queue.md` — a source-free run summary.

These files are uploaded as a GitHub Actions artifact and are not committed into the live site.

## Schedule

`.github/workflows/editorial-tunnel.yml` runs every two hours and can also be triggered manually from GitHub Actions.

## Publishing gate

Nothing from the tunnel is auto-published. A selected signal still needs Passport editorial treatment before any HTML is created or added to the Home.

That keeps the discovery engine aggressive while the public voice remains controlled.
