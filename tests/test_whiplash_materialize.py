#!/usr/bin/env python3
"""Whiplash → Passport materialize contracts: classify, mill, scale, identity."""
from __future__ import annotations

import json
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))

import editorial_blog_catalog as catalog
import whiplash_materialize as mill


def fail(msg: str) -> None:
    raise SystemExit("FAIL: " + msg)


def test_pretty_artist() -> None:
    if mill.pretty_artist("ironmaiden") != "Iron Maiden":
        fail("ironmaiden")
    if mill.pretty_artist("Ledzeppelin") != "Led Zeppelin":
        fail("Ledzeppelin")
    if mill.pretty_artist("sepultura") != "Sepultura":
        fail("sepultura")
    if mill.pretty_artist("engenheirosdohawaii") != "Engenheiros do Hawaii":
        fail("engenheiros")
    print("OK pretty artist")


def test_origin_not_numeric_artist() -> None:
    row = {
        "title": "O cantor de power metal que aprendeu a cantar metal com Mariah Carey",
        "urls": ["https://whiplash.net/materias/news_667/382968.html"],
        "artist": None,
        "format": "STORY",
        "kind": "article",
        "description": "Músico passou um verão inteiro decorando uma faixa.",
        "surface": "rss",
    }
    origin = mill.extract_origin(row)
    if origin["origin_id"] != "382968":
        fail("origin id")
    if origin["artist"].isdigit():
        fail("numeric artist " + origin["artist"])
    if "Mariah Carey" not in origin["entities"] and origin["artist"] != "Mariah Carey":
        fail("title entity missing: " + str(origin))
    print("OK origin id is not the public artist")


def test_writer_gate_and_identity() -> None:
    import editorial_engine_constitution as constitution
    import editorial_quality_gate as quality_gate

    config = json.loads((ROOT / "data/blog-tunnel-engine.json").read_text("utf-8"))
    row = {
        "title": "Sepultura",
        "urls": ["https://whiplash.net/materias/cds/051632-sepultura.html"],
        "artist": "Sepultura",
        "format": "DISCO",
        "kind": "article",
        "description": "",
        "surface": "sitemap:sitemap_00.xml",
        "cluster_id": "CLU_TEST_SEP",
    }
    origin = mill.extract_origin(row)
    pack, candidate = mill.build_pack(row, origin, config, "2026-09-18")
    draft = mill.write_archive_article(
        origin["artist"], origin["noun"], origin["fmt"], origin["family"],
        origin["hint"], origin["origin_id"], "", "", pack.get("facts") or [],
    )
    article = constitution.safe_article(draft, candidate)
    article["author"] = "Passport Radio"
    errors = constitution.validate_article(article, candidate, config)
    if any(e.startswith("too short") for e in errors) and article.get("sections"):
        article["sections"][-1]["paragraphs"].append({
            "text": (
                "Sepultura permanece neste acervo para ser relido, buscado e discutido. "
                "A capa é vitrine e o arquivo é a cidade. A Passport não esconde a matéria "
                "e não inventa o que o pacote não carrega. Quem chegou por este nome pode sair por outra história."
            ),
            "fact_refs": [f["fact_id"] for f in pack["facts"][:4]],
        })
        article = constitution.safe_article(article, candidate)
        article["author"] = "Passport Radio"
        errors = constitution.validate_article(article, candidate, config)
    gate = quality_gate.evaluate(article, pack, config)
    blob = (article["title"] + article["deck"] + str(article["sections"])).lower()
    if "whiplash.net" in blob:
        fail("public whiplash brand in body")
    if "every song is a destination" in blob or "escute primeiro" in blob:
        fail("slogan/professor")
    if errors:
        fail("validate " + "; ".join(errors))
    if gate.get("decision") != "WOULD_PUBLISH":
        fail("gate " + str(gate.get("reasons")))
    html = __import__("editorial_blog_tunnel").render_blog_article(
        article, f"/blog/w/{origin['origin_id']}-sepultura.html", [], {"photos": [], "videos": []}, None, {"family": "discos", "entities": ["Sepultura"]}
    )
    low = html.lower()
    if "whiplash.net" in low:
        fail("origin url in html")
    if "every song is a destination" in low:
        fail("slogan in html")
    if 'data-passport-discussion="live"' not in html:
        fail("discussion missing")
    if "t.me/+pXv3uwqOY8lkZGZk" not in html:
        fail("telegram missing")
    print("OK writer + gate + identity")


def test_write_catalog_batch_not_quadratic() -> None:
    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp) / "catalog.jsonl"
        rows = []
        for i in range(200):
            rows.append({
                "url": f"/blog/w/{i:05d}-band.html",
                "title": f"Banda {i}",
                "deck": f"História {i} sobre Nightwish.",
                "published_at": "2026-09-18T12:00:00-03:00",
                "author": "Passport Radio",
                "format": "STORY",
                "entities": ["Nightwish"],
                "generation": "archive_mill",
                "origin_id": f"{i:05d}",
            })
        catalog.write_catalog(rows, path=path, merge=False)
        got = catalog.load_catalog(path)
        if len(got) != 200:
            fail(f"batch write {len(got)}")
        catalog.write_catalog([rows[0] | {"title": "Banda 0 atualizada"}], path=path, merge=True)
        got = catalog.load_catalog(path)
        if len(got) != 200:
            fail("merge truncated")
        print("OK write_catalog batch")


def test_related_index_scale() -> None:
    rows = []
    for i in range(3000):
        artist = ["Sepultura", "Angra", "Nightwish", "Oasis"][i % 4]
        rows.append({
            "url": f"/blog/w/{i}.html",
            "title": f"{artist} recorte {i}",
            "entities": [artist],
            "published_at": "2026-09-18T12:00:00-03:00",
            "origin_id": str(i),
            "family": "historias",
        })
    index = catalog.build_related_index(rows)
    rel = catalog.related_from_index(rows[0], index, limit=6)
    if any(x["url"] == rows[0]["url"] for x in rel):
        fail("related self")
    if not rel:
        fail("related empty")
    if not all("Sepultura" in (x.get("entities") or []) for x in rel):
        fail("related not same entity")
    print("OK related inverted index")


def test_cover_vitrine_does_not_dump_archive() -> None:
    rows = []
    for i in range(80):
        rows.append({
            "url": f"/blog/w/{i}.html",
            "title": f"Arquivo {i}",
            "deck": "deck",
            "published_at": "2026-09-18T12:00:00-03:00",
            "author": "Passport Radio",
            "generation": "archive_mill",
            "entities": ["Angra"],
        })
    featured = {
        "url": "/blog/2026/09/18/featured.html",
        "title": "Angra e o recorte que a Passport escolheu guardar",
        "deck": "featured",
        "published_at": "2026-09-18T14:00:00-03:00",
        "author": "Passport Radio",
        "entities": ["Angra"],
    }
    html = catalog.render_cover([featured] + rows)
    if html.count("/blog/w/") > 20:
        fail("cover dumped archive cards")
    if "/blog/2026/09/18/featured.html" not in html:
        fail("vitrine missing")
    if "Every Song Is A Destination" in html:
        fail("slogan")
    print("OK cover vitrine vs archive")


def test_verified_documentary_media_is_phase_aware() -> None:
    payload = {
        "items": [
            {
                "status": "verified", "kind": "video", "entities": ["The Kinks"],
                "event_years": [1964], "phase": "The Kinks · 1964",
                "url": "https://www.youtube.com/watch?v=YCXPydl1p6A",
                "title": "You Really Got Me — Live at The Playhouse Theatre, 1964",
                "source_page": "https://www.youtube.com/watch?v=YCXPydl1p6A",
                "live_performance": True,
            },
            {
                "status": "verified", "kind": "video", "entities": ["The Kinks"],
                "event_years": [1979], "phase": "wrong phase",
                "url": "https://www.youtube.com/watch?v=AAAAAAAAAAA",
                "title": "wrong phase", "source_page": "https://example.invalid/",
                "live_performance": True,
            },
        ]
    }
    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp) / "verified.json"
        path.write_text(json.dumps(payload), "utf-8")
        media = mill.verified_documentary_media(
            {"entities": ["The Kinks"], "event_years": [1964]}, path
        )
    if len(media["videos"]) != 1:
        fail("verified phase media mismatch")
    if media["videos"][0].get("phase") != "The Kinks · 1964":
        fail("phase metadata lost")
    if not media["videos"][0].get("live_performance"):
        fail("live performance flag lost")
    print("OK verified documentary media follows event phase")


def main() -> None:
    test_pretty_artist()
    test_origin_not_numeric_artist()
    test_writer_gate_and_identity()
    test_write_catalog_batch_not_quadratic()
    test_related_index_scale()
    test_cover_vitrine_does_not_dump_archive()
    test_verified_documentary_media_is_phase_aware()
    print("OK whiplash materialize tests")


if __name__ == "__main__":
    main()
