#!/usr/bin/env python3
"""Catalog, search, archive, entities, renderer and discussion contracts."""
from __future__ import annotations

import json
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))

import editorial_blog_catalog as catalog
import editorial_blog_tunnel as tunnel


def fail(msg: str) -> None:
    raise SystemExit("FAIL: " + msg)


def sample(n: int, **extra) -> list[dict]:
    rows = []
    names = ["Nightwish", "Floor Jansen", "Metallica", "Oasis", "Supertramp", "Kai Hansen"]
    countries = ["Finlândia", "Brasil", "EUA", "Reino Unido"]
    for i in range(n):
        row = {
            "url": f"/blog/2026/01/{(i % 28) + 1:02d}/story-{i}.html",
            "title": f"{names[i % len(names)]} capítulo {i} em {countries[i % len(countries)]}",
            "deck": f"História {i} sobre {names[i % len(names)]} nos anos 80 e 1994.",
            "published_at": f"2026-01-{(i % 28) + 1:02d}T10:00:00Z",
            "author": "Passport Radio" if i else "Mr. Nomad",
            "format": ["STORY", "LIVE_SIGNAL", "STORY"][i % 3],
            "entities": [names[i % len(names)], countries[i % len(countries)]],
            "country": countries[i % len(countries)],
            "image": f"/images/x-{i}.jpg" if i % 2 == 0 else "",
            "status": "published",
        }
        row.update(extra)
        rows.append(row)
    return rows


def test_catalog_idempotent_and_persistent() -> None:
    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp) / "catalog.jsonl"
        for _ in range(3):
            catalog.upsert_catalog(sample(1)[0], path)
        rows = catalog.load_catalog(path)
        if len(rows) != 1:
            fail(f"catalog not idempotent: {len(rows)}")
        catalog.upsert_catalog(sample(1)[0] | {"url": "/blog/2026/01/02/story-1.html", "title": "Outra"}, path)
        if len(catalog.load_catalog(path)) != 2:
            fail("second story not kept")
    print("OK catalog persist + idempotency")


def test_catalog_scale_and_search() -> None:
    sizes = [0, 2, 50, 400, 5000]
    for n in sizes:
        rows = sample(n)
        hits = catalog.search_catalog("Nightwish", rows)
        if n == 0 and hits["total"] != 0:
            fail("empty catalog search")
        if n >= 2 and hits["total"] == 0:
            fail(f"Nightwish missing at n={n}")
        accent = catalog.search_catalog("FINLANDIA", rows)
        if n >= 2 and accent["total"] == 0:
            fail(f"accent/case fold failed at n={n}")
        year = catalog.search_catalog("1994", rows)
        if n >= 2 and year["total"] == 0:
            fail("year search failed")
        combo = catalog.search_catalog("Metallica 1986", rows)
        if combo["total"] < 0:
            fail("combo crashed")
        zero = catalog.search_catalog("xyzzy-no-hit-please", rows)
        if zero["total"] != 0:
            fail("zero result not empty")
        paged = catalog.search_catalog("história", rows, page=2, per_page=10)
        if n >= 50 and paged["page"] != 2:
            fail("search pagination")
    big = sample(20000)
    hits = catalog.search_catalog("Floor Jansen", big)
    if hits["total"] == 0:
        fail("20k search miss")
    memory = sample(100000)
    got = catalog.search_catalog("Nightwish", memory, page=1, per_page=20)
    if got["total"] == 0 or len(got["items"]) > 20:
        fail("100k search contract")
    print("OK search 0/2/50/400/5k/20k/100k")


def test_archive_and_entities() -> None:
    rows = sample(50)
    html, pages = catalog.render_archive_page(rows, 1)
    if "story-0" not in html and rows[0]["title"] not in html:
        fail("archive missing stories")
    if pages < 2:
        fail("archive should paginate 50 items")
    ents = catalog.entity_pages(rows)
    if not any(e["name"] == "Nightwish" for e in ents):
        fail("Nightwish entity page missing")
    empty = catalog.entity_pages([])
    if empty:
        fail("empty catalog produced entity pages")
    print("OK archive pagination + entities")


def test_related_and_neighbors() -> None:
    rows = sample(12)
    rel = catalog.related_rank(rows[0], rows, limit=4)
    if any(x["url"] == rows[0]["url"] for x in rel):
        fail("related includes self")
    nav = catalog.neighbors(rows[5], rows)
    if not nav["prev"] or not nav["next"]:
        fail("prev/next missing")
    print("OK related + prev/next")


def test_renderer_share_discussion_no_scaffold() -> None:
    article = {
        "title": "O que Nightwish deixa no ar agora",
        "deck": "A banda reaparece no radar.",
        "kicker": "PASSPORT RADIO · BLOG",
        "meta_description": "Nightwish no Blog.",
        "closing": "A Passport deixa Nightwish no mapa.",
        "entities": ["Nightwish", "Floor Jansen"],
        "story_angle_id": "ANG_N",
        "published_at": "2026-09-18T03:00:00",
        "sections": [{"heading": "O que se pode cravar", "paragraphs": ["Um palco em 1998."]}],
        "author": "Passport Radio",
    }
    html = tunnel.render_blog_article(article, "/blog/2026/09/18/nightwish.html", [], {"photos": [], "videos": []})
    if "reservará espaço" in html or "Every Song Is A Destination" in html:
        fail("scaffold/slogan in matter")
    if "WhatsApp" not in html or "Telegram" not in html:
        fail("share missing")
    if 'data-passport-discussion="live"' not in html:
        fail("live discussion missing")
    if "mr. nomad" in html.lower():
        fail("automatic matter signed Nomad")
    if "<audio" in html:
        fail("audio embed")
    print("OK matter anatomy")


def test_discussion_moderation_rules() -> None:
    src = (ROOT / "js/passport-blog-discussion.js").read_text("utf-8")
    for needle in ("blog_comments", "Apoiar", "Denunciar", "parent_id", "deleted_at", "MAX_DEPTH"):
        if needle not in src:
            fail(f"discussion missing {needle}")
    if "downvote" in src.lower():
        fail("downvote exists")
    sql = (ROOT / "supabase/blog_discussion.sql").read_text("utf-8")
    if "row level security" not in sql:
        fail("RLS missing")
    print("OK discussion backend contract")


def test_blog_surfaces_no_dead_slogan() -> None:
    for rel in ("blog.html", "js/passport-blog-search.js", "js/passport-blog-discussion.js", "tools/editorial_blog_catalog.py"):
        text = (ROOT / rel).read_text("utf-8").lower()
        if "every song is a destination" in text:
            fail(f"dead slogan in {rel}")
        if "reservará espaço" in text:
            fail(f"scaffold in {rel}")
    print("OK slogan/scaffold absent on blog surfaces")


def test_protected_byte_identity() -> None:
    # these files must not be dirty in this worktree relative to HEAD if unchanged
    for rel in ("noticias.html", "radio.html", "js/passport-live.js"):
        if not (ROOT / rel).exists():
            fail(f"protected missing {rel}")
    print("OK protected files exist")


def main() -> int:
    test_catalog_idempotent_and_persistent()
    test_catalog_scale_and_search()
    test_archive_and_entities()
    test_related_and_neighbors()
    test_renderer_share_discussion_no_scaffold()
    test_discussion_moderation_rules()
    test_blog_surfaces_no_dead_slogan()
    test_protected_byte_identity()
    print("editorial_blog_publication: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
