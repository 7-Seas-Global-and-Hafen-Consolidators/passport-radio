#!/usr/bin/env python3
from __future__ import annotations

import datetime as dt
from pathlib import Path
import sys

sys.path.insert(0, str((Path(__file__).resolve().parents[1] / "tools").resolve()))

import editorial_tunnel_resilient as rss

SOURCE = {
    "name": "Example Music",
    "url": "https://example.com/music/",
    "domain": "example.com",
    "categories": ["rock", "north_america"],
    "priority": 80,
    "language": "en",
}

RSS = b'''<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>Example</title>
<item><title>Band Announces A Completely New Album Today</title><link>https://example.com/music/band-announces-new-album</link><description><![CDATA[<p>Public summary from the feed.</p>]]></description><pubDate>Wed, 27 Aug 2026 18:00:00 GMT</pubDate><author>Editor</author></item>
<item><title>Another Artist Returns With A New Single</title><link>https://example.com/music/another-artist-returns</link><description>Second summary.</description><pubDate>Wed, 27 Aug 2026 17:00:00 GMT</pubDate></item>
</channel></rss>'''

ATOM = b'''<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom"><title>Example Atom</title>
<entry><title>Festival Reveals Its New Headliner For 2026</title><link rel="alternate" href="https://example.com/music/festival-reveals-headliner"/><summary>Atom summary.</summary><updated>2026-08-27T16:00:00Z</updated><author><name>Atom Editor</name></author></entry>
</feed>'''


def main() -> int:
    rss._FEED_CACHE.clear()
    links = rss.parse_feed(SOURCE, RSS, "https://example.com/feed/", 20)
    assert len(links) == 2, links
    assert links[0][0] == "https://example.com/music/band-announces-new-album", links

    now = dt.datetime(2026, 8, 27, 20, 0, tzinfo=dt.timezone.utc)
    article = rss._article_from_feed_cache(SOURCE, links[0][0], links[0][1], now)
    assert article is not None
    assert article.description == "Public summary from the feed.", article
    assert article.published.startswith("2026-08-27T18:00:00"), article.published
    assert article.age_hours == 2.0, article.age_hours

    atom_links = rss.parse_feed(SOURCE, ATOM, "https://example.com/atom.xml", 20)
    assert len(atom_links) == 1, atom_links

    original_discover = rss.ORIGINAL_DISCOVER_LINKS
    original_fetch = rss._fetch_feed_document
    original_overrides = dict(rss.RSS_OVERRIDES)
    try:
        rss.RSS_OVERRIDES["example.com"] = ["https://example.com/feed/"]
        rss.ORIGINAL_DISCOVER_LINKS = lambda source, per_source: ([], {
            "name": source["name"],
            "url": source["url"],
            "ok": False,
            "discovered": 0,
            "error": "HTTPError: 403",
        })
        rss._fetch_feed_document = lambda url, timeout=rss.RSS_TIMEOUT: (RSS, url)
        recovered, health = rss.discover_links_resilient(SOURCE, 20)
        assert len(recovered) == 2, recovered
        assert health["ok"] is True and health["method"] == "rss", health
        assert health["preferred_rss"] is True, health
    finally:
        rss.ORIGINAL_DISCOVER_LINKS = original_discover
        rss._fetch_feed_document = original_fetch
        rss.RSS_OVERRIDES.clear()
        rss.RSS_OVERRIDES.update(original_overrides)

    candidates = rss.feed_candidates(SOURCE, include_configured=False)
    assert "https://example.com/music/feed/" in candidates, candidates
    assert "https://example.com/feed/" in candidates, candidates
    print("editorial_rss_fallback: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
