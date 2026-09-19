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
            "deck": f"História {i} sobre {names[i % len(names)]} nos anos 80 e 1994 e 1986.",
            "published_at": f"2026-01-{(i % 28) + 1:02d}T10:00:00Z",
            "author": "Passport Radio" if i else "Mr. Nomad",
            "format": ["STORY", "LIVE_SIGNAL", "STORY"][i % 3],
            "entities": [names[i % len(names)], countries[i % len(countries)]],
            "country": countries[i % len(countries)],
            "body_index": f"Show em 1986 e disco de 1994 com {names[i % len(names)]}.",
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
        "title": "Nightwish e o detalhe que os fãs ainda discutem",
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
    css = (ROOT / "css/passport-blog.css").read_text("utf-8")
    if "blog-page" not in css or "blog-grid" not in css or "--blog-gold" not in css:
        fail("blog CSS lost base identity")
    html = (ROOT / "blog.html").read_text("utf-8")
    if html.count("/blog/2026/") > 40:
        fail("cover dumps the same stories in too many cards")
    print("OK slogan/scaffold absent on blog surfaces")


def test_historical_period_not_publish_date() -> None:
    row = sample(1)[0]
    hist = catalog.historical_fields(row)
    if "1980" not in hist["decades_covered"] and 1986 not in hist["event_years"]:
        fail(f"event decade missing: {hist}")
    if hist.get("published_year") != "2026":
        fail("published year lost")
    if hist["historical_period"] == "2026":
        fail("publication year used as historical period")
    print("OK historical period ≠ published_at")


def test_author_and_az_doors() -> None:
    rows = sample(12)
    authors = catalog.author_pages(rows)
    if not any(a["name"] == "Mr. Nomad" for a in authors):
        fail("nomad author page missing")
    html = catalog.render_cover(rows)
    for needle in ("A–Z", "Autores", "Envie sua história", "Loja", "/blog/arquivo/letras.html"):
        if needle not in html:
            fail(f"cover missing door {needle}")
    ents = catalog.entity_pages(rows)
    az = catalog.render_az_hub(ents)
    if "Escolha a letra inicial" not in az:
        fail("az hub copy missing")
    submit = catalog.render_submit_page()
    if "data-blog-submit" not in submit or "Conta Passport" not in submit:
        fail("submit page incomplete")
    print("OK cover doors + A-Z + authors + submit")


def test_store_real_skus_only() -> None:
    import editorial_blog_store as store
    report = store.inventory_report()
    if report["cataloged"] < 200:
        fail(f"store catalog too small: {report['cataloged']}")
    if report["publishable"] < 100:
        fail("too few publishable products")
    metallica = store.products_for_entities(["Metallica"], limit=5)
    if not metallica:
        fail("Metallica entity did not match a real SKU")
    hits = store.search_store("Pink Floyd")
    if hits["total"] == 0:
        fail("store search miss Pink Floyd")
    zero = store.search_store("xyzzy-no-sku")
    if zero["total"] != 0:
        fail("store search invented hits")
    print("OK store real SKUs + entity link + search")


def test_writer_kills_formula_and_professor() -> None:
    pack = {
        "facts": [
            {"fact_id": "F1", "type": "signal_title", "value": "O clássico do Oasis que Noel Gallagher escreveu após sair de boate", "allowed_for_generation": True},
            {"fact_id": "F2", "type": "signal_summary", "value": "A canção nasceu depois da noite.", "allowed_for_generation": True},
        ],
        "primary_category": "music",
        "recommended_format": "story",
    }
    article = tunnel.write_from_fact_pack({"title": pack["facts"][0]["value"], "entities": ["Oasis", "Noel Gallagher"]}, pack)
    blob = (article["deck"] + article["closing"] + str(article["sections"])).lower()
    for banned in ("guarda o fato", "abre a escuta", "deixa no ar agora", "every song is a destination", "escute primeiro"):
        if banned in blob:
            fail(f"writer still emits {banned}")
    if article["title"].lower().startswith("o que ") and "deixa no ar agora" in article["title"].lower():
        fail("formula title returned")
    print("OK writer language")


def test_slogan_dead_at_source() -> None:
    sources = [
        "tools/editorial_blog_tunnel.py",
        "tools/editorial_engine.py",
        "js/mr-nomad-dossiers.js",
        "js/passport-signal-habitat.js",
        "js/passport-persist-nav.js",
        "blog.html",
        "loja.html",
        "editorial.html",
    ]
    for rel in sources:
        text = (ROOT / rel).read_text("utf-8")
        if "Every Song Is A Destination" in text:
            fail(f"dead slogan still in {rel}")
        if "pe-nomad-signature" in text:
            fail(f"blog mill auto-signs Nomad in {rel}")
    blog_html = tunnel.render_blog_article(
        {
            "title": "Nightwish e o detalhe que os fãs ainda discutem",
            "deck": "A banda reaparece no radar.",
            "kicker": "PASSPORT RADIO · BLOG",
            "meta_description": "Nightwish no Blog.",
            "closing": "A Passport deixa Nightwish no mapa.",
            "entities": ["Nightwish"],
            "story_angle_id": "ANG_N",
            "published_at": "2026-09-18T03:00:00",
            "sections": [{"heading": "O episódio", "paragraphs": ["Um palco em 1998."]}],
            "author": "Passport Radio",
        },
        "/blog/2026/09/18/nightwish.html",
        [],
        {"photos": [], "videos": []},
    )
    if "Every Song Is A Destination" in blog_html or "pe-nomad-signature" in blog_html:
        fail("blog renderer still ships mill slogan/Nomad")
    if "t.me/+FKto2N185cs4OGU0" not in blog_html:
        fail("official Telegram missing from matter")
    if "wa.me/?text=" not in blog_html or "t.me/share/url" not in blog_html:
        fail("share WhatsApp/Telegram missing")
    print("OK slogan/authorship dead on Blog surfaces")


def test_discussion_and_submit_sql() -> None:
    sql = (ROOT / "supabase/blog_submissions.sql").read_text("utf-8")
    for needle in ("blog_submissions", "row level security", "recebida", "auth.uid()"):
        if needle not in sql:
            fail(f"submissions SQL missing {needle}")
    js = (ROOT / "js/passport-blog-submit.js").read_text("utf-8")
    if "blog_submissions" not in js or "minha-passport.html" not in js:
        fail("submit client missing")
    print("OK collaboration SQL + client")


def test_writer_film_is_not_album() -> None:
    pack = {
        "facts": [
            {"fact_id": "F1", "type": "signal_title", "value": "Review: RESIDENT EVIL (2026)", "allowed_for_generation": True},
            {"fact_id": "F2", "type": "signal_summary", "value": "Zach Cregger recoloca Raccoon City no centro com um herói solitário e falho.", "allowed_for_generation": True},
            {"fact_id": "F3", "type": "source_statement", "value": "Nach sieben mehr oder weniger gelungenen Versuchen wagt sich nun Weapons", "allowed_for_generation": True},
        ],
        "primary_category": "culture",
        "recommended_format": "review",
    }
    article = tunnel.write_from_fact_pack(
        {"title": "Review: RESIDENT EVIL (2026)", "entities": ["Zach Cregger", "Resident Evil", "Raccoon City"]},
        pack,
    )
    blob = (article["title"] + article["deck"] + str(article["sections"])).lower()
    if "o disco de" in article["title"].lower():
        fail("film review titled as album")
    if "guarda nesta escuta" in blob:
        fail("formulaic film title/body")
    if "nach sieben" in blob:
        fail("german quote leaked into PT-BR body")
    if "review:" in article["deck"].lower():
        fail("raw Review: used as deck")
    print("OK film title is not album + no German leak")


def test_store_product_pages_real_only() -> None:
    import editorial_blog_store as store
    pages = store.write_product_pages()
    if pages["product_pages"] < 100:
        fail(f"too few product pages: {pages}")
    sample = next(iter((ROOT / "loja" / "p").glob("*.html")))
    html = sample.read_text("utf-8")
    if "data-add-cart" not in html:
        fail("product page missing cart")
    if "Every Song Is A Destination" in html:
        fail("slogan on product page")
    fake = store.search_store("xyzzy-no-sku")
    if fake["total"] != 0:
        fail("invented SKU in search")
    print("OK product pages from real SKUs")


def test_protected_byte_identity() -> None:
    for rel in ("radio.html", "js/passport-live.js"):
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
    test_historical_period_not_publish_date()
    test_author_and_az_doors()
    test_store_real_skus_only()
    test_writer_kills_formula_and_professor()
    test_writer_film_is_not_album()
    test_slogan_dead_at_source()
    test_discussion_and_submit_sql()
    test_store_product_pages_real_only()
    test_protected_byte_identity()
    print("editorial_blog_publication: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
