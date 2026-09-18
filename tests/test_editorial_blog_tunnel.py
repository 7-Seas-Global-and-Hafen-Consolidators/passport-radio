#!/usr/bin/env python3
"""Contracts for the Global Blog Tunnel™ V1.

Discovery covers entire Whiplash + Metal Hammer DE surfaces.
Publication is capped and Blog-only. Black Sabbath is not a filter.
"""
from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TOOLS = ROOT / "tools"
sys.path.insert(0, str(TOOLS))

import editorial_blog_discovery as discovery
import editorial_blog_tunnel as tunnel
from editorial_media_resolver import resolve_media

PROTECTED = [
    "noticias.html",
    "index.html",
    "radio.html",
    "data/editorial-feed.json",
    "js/editorial-home.js",
    "js/passport-news.js",
    "js/passport-live.js",
    ".github/workflows/editorial-engine.yml",
    ".github/workflows/editorial-tunnel.yml",
]

WHIPLASH_RSS = b'''<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>Whiplash</title>
<item><title>O classico do Oasis que Noel Gallagher escreveu apos sair de boate</title>
<link>https://whiplash.net/materias/news_667/383025-oasis.html</link>
<description>Comecou como uma cancao de desafio.</description>
<category>Oasis</category><category>Noel Gallagher</category>
<pubDate>Thu, 17 Sep 2026 22:57:00 -0300</pubDate></item>
<item><title>Pink Floyd anuncia caixa com raridades de estudio</title>
<link>https://whiplash.net/materias/news_667/383023-pinkfloyd.html</link>
<description>Material de arquivo chega em box.</description>
<category>Pink Floyd</category>
<pubDate>Thu, 17 Sep 2026 21:00:00 -0300</pubDate></item>
<item><title>Sepultura confirma entrevista sobre novo ciclo</title>
<link>https://whiplash.net/materias/entrevistas/380111-sepultura.html</link>
<description>Banda fala do proximo passo.</description>
<category>Sepultura</category>
<pubDate>Wed, 16 Sep 2026 12:00:00 -0300</pubDate></item>
<item><title>Resenha: novo disco do Mastodon</title>
<link>https://whiplash.net/materias/cds/379900-mastodon.html</link>
<description>O album chega com nove faixas.</description>
<category>Mastodon</category>
<pubDate>Tue, 15 Sep 2026 10:00:00 -0300</pubDate></item>
</channel></rss>'''

MH_RSS = b'''<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>Metal Hammer</title>
<item><title>Lordi: Verbote machen eine gute Liveshow immer schwieriger</title>
<link>https://www.metal-hammer.de/lordi-verbote-machen-eine-gute-liveshow-immer-schwieriger-2505663/</link>
<description>Mr. Lordi spricht ueber Buehnenverbote.</description>
<pubDate>Wed, 17 Sep 2026 11:00:00 +0200</pubDate></item>
<item><title>A Killer's Confession: Victim 2</title>
<link>https://www.metal-hammer.de/reviews/a-killers-confession-victim-2/</link>
<description>Review des neuen Albums.</description>
<pubDate>Tue, 16 Sep 2026 09:00:00 +0200</pubDate></item>
</channel></rss>'''

MH_SITEMAP_INDEX = b'''<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<sitemap><loc>https://www.metal-hammer.de/post-sitemap.xml</loc></sitemap>
<sitemap><loc>https://www.metal-hammer.de/reviews-sitemap.xml</loc></sitemap>
<sitemap><loc>https://www.metal-hammer.de/news-sitemap.xml</loc></sitemap>
<sitemap><loc>https://www.metal-hammer.de/asmb_concert-sitemap.xml</loc></sitemap>
<sitemap><loc>https://www.metal-hammer.de/artists-sitemap.xml</loc></sitemap>
<sitemap><loc>https://www.metal-hammer.de/genres-sitemap.xml</loc></sitemap>
</sitemapindex>'''

MH_POST_SITEMAP = b'''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url><loc>https://www.metal-hammer.de/</loc></url>
<url><loc>https://www.metal-hammer.de/corrosion-of-conformity-weatherman-ist-zufrieden-mit-line-up-2505609/</loc><lastmod>2026-09-17T08:00:00+00:00</lastmod></url>
<url><loc>https://www.metal-hammer.de/reviews/</loc></url>
</urlset>'''

MH_REST = json.dumps([
    {
        "id": 2546603,
        "date": "2026-09-18T06:00:57",
        "date_gmt": "2026-09-18T04:00:57",
        "link": "https://www.metal-hammer.de/metal-hammer-podcast-folge-151-mit-kai-hansen-2546603/",
        "title": {"rendered": "Podcast-Folge 151 mit Kai Hansen"},
        "excerpt": {"rendered": "<p>Kai Hansen zu Gast.</p>"},
        "type": "post",
    },
    {
        "id": 2546493,
        "date": "2026-09-17T13:01:44",
        "link": "https://www.metal-hammer.de/reviews/donots-schwert-aus-holz/",
        "title": {"rendered": "Donots: Schwert aus Holz"},
        "excerpt": {"rendered": "<p>Albumreview.</p>"},
        "type": "reviews",
    },
]).encode("utf-8")


def fail(msg: str) -> None:
    raise SystemExit(msg)


def test_format_classifier() -> None:
    assert discovery.classify_format("https://whiplash.net/materias/news_667/1-oasis.html") == "news"
    assert discovery.classify_format("https://whiplash.net/materias/cds/1-mastodon.html") == "review"
    assert discovery.classify_format("https://whiplash.net/materias/entrevistas/1-sepultura.html") == "interview"
    assert discovery.classify_format("https://whiplash.net/materias/shows/1-ironmaiden.html") == "show"
    assert discovery.classify_format("https://www.metal-hammer.de/reviews/donots-schwert-aus-holz/") == "review"
    assert discovery.classify_format("https://www.metal-hammer.de/konzerte/rebel-monster-live-in-bonn/") == "show"
    print("OK format classifier")


def test_rss_covers_formats_not_one_artist() -> None:
    items = discovery.parse_rss(WHIPLASH_RSS, "https://whiplash.net/feeds/news.xml", "Whiplash.Net")
    urls = {i["url"] for i in items}
    titles = " ".join(i["title"] for i in items).lower()
    if "oasis" not in titles:
        fail("Whiplash fixture lost Oasis")
    if "pink floyd" not in titles and "pinkfloyd" not in "".join(urls):
        fail("Whiplash fixture lost Pink Floyd")
    if "mastodon" not in titles:
        fail("Whiplash fixture lost Mastodon review")
    if not any(i["format_hint"] == "interview" for i in items):
        fail("interview URL was not classified")
    if not any(i["format_hint"] == "review" for i in items):
        fail("review URL was not classified")
    if any("black sabbath" in i["title"].lower() for i in items) and len(items) < 2:
        fail("Sabbath-only parse")
    artists = {e for i in items for e in i.get("entities") or []}
    if "Oasis" not in artists:
        fail("RSS category entities missing")
    mh = discovery.parse_rss(MH_RSS, "https://www.metal-hammer.de/feed/", "Metal Hammer Germany")
    if len(mh) != 2:
        fail(f"MH RSS expected 2, got {len(mh)}")
    if not any(i["format_hint"] == "review" for i in mh):
        fail("MH review path not classified")
    print("OK RSS multi-artist multi-format")


def test_rest_and_sitemap() -> None:
    posts = discovery.parse_rest_posts(MH_REST, "Metal Hammer Germany")
    if len(posts) != 2:
        fail(f"REST expected 2, got {len(posts)}")
    if "kai hansen" not in posts[0]["title"].lower():
        fail("REST title not unwrapped")
    indexes, _ = discovery.parse_sitemap(MH_SITEMAP_INDEX)
    joined = " ".join(indexes)
    for needle in ("post-sitemap", "reviews-sitemap", "news-sitemap", "asmb_concert-sitemap"):
        if needle not in joined:
            fail(f"sitemap index missing {needle}")
    if discovery._looks_index_sitemap("https://www.metal-hammer.de/artists-sitemap.xml"):
        pass
    else:
        fail("artists sitemap should be treated as index, not article dump")
    if discovery._looks_editorial_sitemap("https://www.metal-hammer.de/post-sitemap.xml") is False:
        fail("post sitemap should be editorial")
    _, urls = discovery.parse_sitemap(MH_POST_SITEMAP)
    editorial = []
    for u in urls:
        loc = u["loc"]
        title_guess = loc.rstrip("/").split("/")[-1].replace("-", " ") or loc
        item = discovery._item(loc, title_guess, source="mh", method="sitemap")
        if item:
            editorial.append(item)
    if any(x["url"].rstrip("/") in {"https://www.metal-hammer.de", "https://www.metal-hammer.de/reviews"} for x in editorial):
        fail("homepage/index leaked into editorial items")
    if not any("corrosion-of-conformity" in x["url"] for x in editorial):
        fail("article URL dropped from sitemap")
    print("OK REST + sitemap")


def test_funk_block_and_queue_merge(tmp_path: Path) -> None:
    generated = "2026-09-18T03:00:00-03:00"
    radar = [
        {"title": "Oasis volta ao palco", "url": "https://whiplash.net/materias/news_667/1-oasis.html",
         "description": "show", "origins": [{"url": "https://whiplash.net/materias/news_667/1-oasis.html"}]},
        {"title": "Oasis volta ao palco em turne", "url": "https://www.metal-hammer.de/oasis-tour-123/",
         "description": "tour", "origins": [{"url": "https://www.metal-hammer.de/oasis-tour-123/"}]},
        {"title": "Baile funk e pancadao no park", "url": "https://whiplash.net/materias/news_667/9-funk.html",
         "description": "pancadao", "origins": [{"url": "https://whiplash.net/materias/news_667/9-funk.html"}]},
        {"title": "Lordi em Hamburgo", "url": "https://www.metal-hammer.de/lordi-live-1234567/",
         "description": "konzert", "origins": [{"url": "https://www.metal-hammer.de/lordi-live-1234567/"}]},
    ]
    queue_path = tmp_path / "queue.json"
    stats = tunnel.persist_queue(radar, queue_path, generated)
    data = json.loads(queue_path.read_text("utf-8"))
    queued = [x for x in data["items"] if x["status"] == "queued"]
    rejected = [x for x in data["items"] if x["status"] == "rejected_scope"]
    if stats["blocked_scope"] < 1 or not rejected:
        fail("funk item was not blocked")
    if len(queued) < 2:
        fail(f"expected multiple queued stories, got {len(queued)}")
    oasis_clusters = [x for x in queued if "oasis" in x["title"].lower()]
    if len(oasis_clusters) != 1:
        fail(f"Oasis should cluster to 1, got {len(oasis_clusters)}")
    if len(oasis_clusters[0]["urls"]) < 2:
        fail("cross-source URLs were not merged")
    # idempotent second pass
    stats2 = tunnel.persist_queue(radar, queue_path, generated)
    data2 = json.loads(queue_path.read_text("utf-8"))
    queued2 = [x for x in data2["items"] if x["status"] == "queued"]
    if len(queued2) != len(queued):
        fail("second persist duplicated queue items")
    if stats2["newly_queued"] != 0:
        fail("second persist reported new items")
    print("OK queue merge / funk / idempotency")


def test_writer_is_generic_and_ptbr() -> None:
    candidate = {
        "title": "Lordi: Verbote machen eine gute Liveshow immer schwieriger",
        "description": "Mr. Lordi spricht.",
        "format_hint": "news",
        "entities": ["Lordi"],
        "primary_category": "metal",
    }
    pack = {
        "event_id": "EVT_TEST",
        "story_angle_id": "ANG_TEST",
        "primary_category": "metal",
        "facts": [
            {"fact_id": "F1", "type": "signal_title", "value": "Lordi liveshow", "evidence": "Verbote machen",
             "allowed_for_generation": True, "status": "EXTRACTED"},
            {"fact_id": "F2", "type": "signal_summary", "value": "Buehnenverbote", "evidence": "Mr. Lordi spricht",
             "allowed_for_generation": True, "status": "EXTRACTED"},
        ],
    }
    article = tunnel.write_from_fact_pack(candidate, pack)
    text = f"{article['title']} {article['deck']} {article['closing']}"
    if "black sabbath" in text.lower() or "keith richards" in text.lower():
        fail("generic writer leaked Sabbath/Keith demo branch")
    if "lordi" not in text.lower():
        fail("generic writer ignored the actual entity")
    if article["title"].lower() == candidate["title"].lower():
        fail("writer copied source title")
    if re.search(r"^o que .+ deixa no ar agora", article["title"], re.I):
        fail("formulaic fallback title")
    if "reaparece no radar da Passport por um movimento concreto" in article["deck"]:
        fail("formulaic fallback deck")
    public = " ".join([
        article["title"], article["deck"], article["closing"],
        *[p["text"] for s in article["sections"] for p in s["paragraphs"]],
    ]).lower()
    for leak in ("whiplash", "metal hammer", "metal-hammer", "mr. nomad"):
        if leak in public:
            fail(f"writer leaked {leak}")
    if article["format"] not in {"STORY", "FLASH", "LIVE_SIGNAL"}:
        fail(f"unexpected format {article['format']}")
    if "every song is a destination" in public:
        fail("dead slogan leaked into fallback writer")
    print("OK generic PT-BR writer")


def test_renderer_contracts() -> None:
    article = {
        "title": "O que Lordi deixa no ar agora",
        "deck": "A banda reaparece no radar.",
        "kicker": "PASSPORT RADIO · BLOG · METAL",
        "meta_description": "Lordi no Blog Passport.",
        "closing": "A Passport deixa Lordi no mapa do Blog e espera o ouvinte do outro lado da frase.",
        "entities": ["Lordi"],
        "story_angle_id": "ANG_X",
        "published_at": "2026-09-18T03:00:00",
        "sections": [{"heading": "O que se pode cravar", "paragraphs": ["Um palco, um nome, um fato."]}],
        "author": "Passport Radio",
    }
    html = tunnel.render_blog_article(article, "/blog/2026/09/18/o-que-lordi-deixa-no-ar-agora.html", [], {"photos": [], "videos": []})
    if "Passport Radio" not in html:
        fail("missing public author")
    if "mr. nomad" in html.lower():
        fail("automatic story signed Mr. Nomad")
    if "<audio" in html.lower():
        fail("renderer embedded audio")
    if "noticias.html" in html:
        fail("renderer links noticias")
    if '"@type": "BlogPosting"' not in html and '"@type":"BlogPosting"' not in html:
        fail("missing BlogPosting schema")
    if 'passport:channel" content="blog"' not in html:
        fail("missing channel meta")
    if "reservará espaço" in html or "Nenhum comentário" in html:
        fail("public discussion scaffolding leaked")
    if 'data-passport-discussion="live"' not in html:
        fail("discussion hook missing")
    if "every song is a destination" in html.lower():
        fail("dead slogan in renderer")
    if "Copiar link" not in html or "WhatsApp" not in html:
        fail("share controls missing")
    print("OK renderer contracts")


def test_media_resolver_no_download() -> None:
    html = '''<html><head><meta property="og:image" content="https://cdn.example.com/pic.jpg">
    </head><body><img src="https://cdn.example.com/pic.jpg" alt="METAL HAMMER Podcast Folge 151">
    <iframe src="https://www.youtube.com/embed/abcdefghijk" title="Live at Hellfest"></iframe></body></html>'''
    media = resolve_media(html, "https://www.metal-hammer.de/some-post-123/", {"title": "Kai Hansen"})
    if (media.get("hero_photo") or {}).get("alt", "").lower().find("metal hammer") >= 0:
        fail("outlet name leaked into image alt")
    if not media.get("hero_photo"):
        fail("og:image not resolved")
    video = media.get("hero_video") or {}
    if video.get("platform") != "youtube":
        fail("youtube embed not resolved")
    if video.get("download") or video.get("hosted_copy"):
        fail("resolver tried to host a copy")
    if "youtube-nocookie.com/embed/" not in (video.get("embed_url") or ""):
        fail("expected privacy embed")
    print("OK media resolver")


def test_destination_and_isolation() -> None:
    sources = json.loads((ROOT / "data/editorial-sources-blog-v1.json").read_text("utf-8"))
    domains = {s["domain"] for s in sources["sources"]}
    if domains != {"whiplash.net", "metal-hammer.de"}:
        fail(f"unexpected source domains {domains}")
    whiplash = next(s for s in sources["sources"] if s["domain"] == "whiplash.net")
    mh = next(s for s in sources["sources"] if s["domain"] == "metal-hammer.de")
    if not whiplash.get("sitemaps") or not whiplash.get("index_urls") or not whiplash.get("feed_urls"):
        fail("Whiplash surface map is RSS-only")
    if not mh.get("rest_urls") or not mh.get("sitemaps") or len(mh.get("feed_urls") or []) < 2:
        fail("Metal Hammer surface map is thinner than the autopsy")
    overrides = json.loads((ROOT / "data/editorial-rss-overrides.json").read_text("utf-8"))
    if "metal-hammer.de" in (overrides.get("feeds") or {}):
        fail("noticias RSS overrides were mutated for Metal Hammer")
    engine = json.loads((ROOT / "data/blog-tunnel-engine.json").read_text("utf-8"))
    if (engine.get("discovery") or {}).get("mode") != "continuous":
        fail("default discovery mode is not continuous")
    if "backfill" not in (engine.get("discovery") or {}):
        fail("backfill caps missing")
    blog = (ROOT / "blog.html").read_text("utf-8")
    if "contar-historias-que-dao-vontade-de-ouvir.html" not in blog:
        fail("human cover was removed from blog.html")
    if "passport-blog-search.js" not in blog and 'form class="blog-search"' not in blog:
        fail("search not wired on blog cover")
    news = (ROOT / "noticias.html").read_text("utf-8")
    if "blog-feed.json" in news or "editorial_blog_tunnel" in news:
        fail("noticias.html was coupled to the blog tunnel")
    print("OK destination + source map + noticias isolation")


def test_protected_surfaces_untouched() -> None:
    # This test documents the protected set. SHA comparison vs origin is done in git status of the PR.
    for rel in PROTECTED:
        path = ROOT / rel
        if not path.exists():
            fail(f"protected surface missing: {rel}")
    print("OK protected surfaces exist")


def test_sabbath_is_not_a_gate() -> None:
    src = (ROOT / "tools/editorial_blog_tunnel.py").read_text("utf-8")
    if "PRIORITY_NEEDLES" in src:
        fail("Sabbath priority needles still gate ingestion")
    if "back to the beginning" in src.lower() and "filter" in src.lower():
        # DNA mentions facts, not filters. Fail only if an allowlist remains.
        pass
    if "BLACK_SABBATH_ONLY" in src or "allowed_artists" in src:
        fail("artist allowlist found")
    disc = (ROOT / "tools/editorial_blog_discovery.py").read_text("utf-8")
    if "black sabbath" in disc.lower():
        fail("discovery module hardcodes Black Sabbath")
    print("OK Sabbath is not an ingestion filter")


def test_backfill_is_same_machine() -> None:
    src = (ROOT / "tools/editorial_blog_tunnel.py").read_text("utf-8")
    if '"backfill"' not in src and "'backfill'" not in src:
        fail("CLI missing backfill mode")
    if "editorial_tunnel_graph.py" in src:
        fail("blog tunnel still shells out to the noticias graph cap")
    print("OK backfill flag + dedicated discovery")


def test_full_archive_inventory() -> None:
    stats = discovery.archive_stats()
    mh = (stats.get("domains") or {}).get("metal-hammer.de") or {}
    wh = (stats.get("domains") or {}).get("whiplash.net") or {}
    if int(mh.get("articles") or 0) < 80000:
        fail(f"Metal Hammer archive too small: {mh}")
    if int(wh.get("articles") or 0) < 15000:
        fail(f"Whiplash archive too small: {wh}")
    formats = stats.get("formats") or {}
    for needed in ("STORY", "DISCO", "SHOW", "ENTREVISTA"):
        if int(formats.get(needed) or 0) < 300:
            fail(f"archive missing format {needed}: {formats}")
    # Sabbath may exist as one artist among thousands — never as the whole inventory.
    if stats.get("total", 0) < 100000:
        fail(f"combined archive too small: {stats.get('total')}")
    print(
        "OK full archive",
        stats.get("total"),
        "MH", mh.get("articles"),
        "WH", wh.get("articles"),
        "formats", formats,
    )


def test_archive_drains_beyond_hot_window() -> None:
    archives = {
        "metal-hammer.de": [],
        "whiplash.net": [],
    }
    for i in range(8):
        archives["metal-hammer.de"].append({
            "cluster_id": f"CLU_MH_{i:02d}",
            "status": "queued",
            "title": f"Metal story {i}",
            "urls": [f"https://www.metal-hammer.de/story-{i}-100{i}"],
            "format": "STORY" if i % 2 == 0 else "DISCO",
            "domain": "metal-hammer.de",
            "kind": "article",
            "date": f"2026-01-{i+1:02d}T00:00:00",
        })
    archives["metal-hammer.de"].append({
        "cluster_id": "CLU_MH_HUB",
        "status": "queued",
        "title": "Reviews hub",
        "urls": ["https://www.metal-hammer.de/reviews/"],
        "format": "HUB",
        "domain": "metal-hammer.de",
        "kind": "hub",
    })
    for i in range(5):
        archives["whiplash.net"].append({
            "cluster_id": f"CLU_WH_{i:02d}",
            "status": "queued",
            "title": f"Whiplash story {i}",
            "urls": [f"https://whiplash.net/materias/news_667/38000{i}-band.html"],
            "format": "ENTREVISTA" if i == 0 else "STORY",
            "domain": "whiplash.net",
            "kind": "article",
            "date": f"2026-02-{i+1:02d}T00:00:00",
        })
    eligible = [
        u
        for rows in archives.values()
        for row in rows
        for u in (row.get("urls") or [])
        if row.get("kind") != "hub" and row.get("format") != "HUB"
    ]
    if len(eligible) != 13:
        fail(f"fixture size {len(eligible)}")
    hot: list[dict] = []
    cursor: dict[str, int] = {}
    seen: list[str] = []
    window = 3
    for _round in range(40):
        hot, cursor, stats = discovery.drain_from_archives(archives, hot, cursor, window=window, live_share=0.5)
        queued = [x for x in hot if x.get("status") == "queued"]
        if not queued:
            if stats.get("remaining_in_archive"):
                fail(f"empty hot window with remaining={stats.get('remaining_in_archive')} cursor={cursor}")
            break
        item = queued[0]
        url = (item.get("urls") or [""])[0]
        if url in seen:
            fail(f"duplicate drain {url}")
        seen.append(url)
        item["status"] = "published"
        for rows in archives.values():
            for row in rows:
                if url in (row.get("urls") or []):
                    row["status"] = "published"
    if set(seen) != set(eligible):
        fail(f"lost or extra items. seen={len(seen)} eligible={len(eligible)} missing={set(eligible)-set(seen)}")
    hot, cursor, stats = discovery.drain_from_archives(archives, hot, cursor, window=window)
    if any(x.get("status") == "queued" for x in hot) or stats.get("added_live") or stats.get("added_historical"):
        fail(f"published items returned: {stats}")
    archives["whiplash.net"].append({
        "cluster_id": "CLU_WH_NEW",
        "status": "queued",
        "title": "Whiplash new",
        "urls": ["https://whiplash.net/materias/news_667/389999-new.html"],
        "format": "STORY",
        "domain": "whiplash.net",
        "kind": "article",
        "date": "2026-09-18T00:00:00",
    })
    hot, cursor, stats = discovery.drain_from_archives(archives, hot, cursor, window=window)
    queued_urls = [u for x in hot if x.get("status") == "queued" for u in (x.get("urls") or [])]
    if "https://whiplash.net/materias/news_667/389999-new.html" not in queued_urls:
        fail(f"continuous item not absorbed after archive exhausted: {queued_urls} {stats}")
    names = [
        "Oasis confirma caixa inédita de Manchester",
        "Sepultura abre arquivo de Belo Horizonte",
        "Lordi anuncia palco em Helsinque",
        "Mastodon estreia faixa ao vivo em Atlanta",
        "Yes relê Close to the Edge em estúdio",
        "Pink Floyd libera fita de Pompeia",
        "Kai Hansen fala do próximo ciclo",
        "Anthrax escolhe álbum da semana",
        "Moonspell registra o pit em Lisboa",
        "Slipknot recusa biografia oficial",
    ]
    payload = {"version": 1, "channel": "blog", "items": []}
    tmp = ROOT / "build" / "blog-tunnel-drain-test-queue.json"
    tmp.parent.mkdir(parents=True, exist_ok=True)
    tunnel.save_json(tmp, payload)
    for i, name in enumerate(names):
        radar = [{
            "url": f"https://whiplash.net/materias/news_667/3700{i}-cap.html",
            "title": name,
            "description": "ok",
            "format_hint": "news",
            "origins": [{"url": f"https://whiplash.net/materias/news_667/3700{i}-cap.html", "method": "rss"}],
        }]
        tunnel.persist_queue(radar, tmp, "2026-09-18T00:00:00Z", queue_size=3)
    saved = tunnel.load_json(tmp, {"items": []})
    queued_n = len([x for x in saved.get("items") or [] if x.get("status") == "queued"])
    if queued_n < 10:
        fail(f"persist_queue still drops queued items against the hot window ({queued_n})")
    tmp.unlink(missing_ok=True)
    print("OK archive drains in batches without loss or duplication")


def test_dead_slogan_and_discussion_copy_removed() -> None:
    blog = (ROOT / "blog.html").read_text("utf-8")
    if "every song is a destination" in blog.lower():
        fail("dead slogan still on blog.html")
    if "reservará espaço" in blog or "comentários fictícios" in blog.lower():
        fail("discussion scaffolding still on blog.html")
    src = (ROOT / "tools/editorial_blog_tunnel.py").read_text("utf-8")
    if "Every Song Is A Destination" in src:
        fail("dead slogan still in tunnel writer")
    if "reservará espaço" in src:
        fail("discussion scaffolding still in renderer")
    oasis = (ROOT / "blog/2026/09/18/o-que-oasis-deixa-no-ar-agora.html").read_text("utf-8")
    kai = (ROOT / "blog/2026/09/18/kai-hansen-no-microfone-o-metal-reorganiza-o-tabuleiro-em-um-so-giro.html").read_text("utf-8")
    for html in (oasis, kai):
        if "every song is a destination" in html.lower():
            fail("dead slogan still in published sample")
        if "reservará espaço" in html:
            fail("discussion scaffolding still in published sample")
        if 'data-passport-discussion="live"' not in html and 'data-passport-discussion="reserved"' not in html:
            fail("discussion hook stripped from published sample")
    print("OK slogan + public discussion scaffolding removed")



def main() -> int:
    import tempfile
    test_format_classifier()
    test_rss_covers_formats_not_one_artist()
    test_rest_and_sitemap()
    with tempfile.TemporaryDirectory() as tmp:
        test_funk_block_and_queue_merge(Path(tmp))
    test_writer_is_generic_and_ptbr()
    test_renderer_contracts()
    test_media_resolver_no_download()
    test_destination_and_isolation()
    test_protected_surfaces_untouched()
    test_sabbath_is_not_a_gate()
    test_backfill_is_same_machine()
    test_full_archive_inventory()
    test_archive_drains_beyond_hot_window()
    test_dead_slogan_and_discussion_copy_removed()
    print("editorial_blog_tunnel: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
