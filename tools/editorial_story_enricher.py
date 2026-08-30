#!/usr/bin/env python3
"""Passport Newsroom™ downstream enrichment.

Runs AFTER Editorial Engine publication. It never reads or mutates RSS/Tunnel
configuration, players, streams or radio pages. For recent generated editorial
pages it adds semantic SEO metadata plus a context-matched YouTube embed and
its thumbnail as visual media. Failure is fail-open: the original article stays
untouched when a relevant video cannot be resolved.
"""
from __future__ import annotations

import argparse
import html
import json
from pathlib import Path
import re
from urllib.parse import quote_plus
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
MARKER = "PASSPORT_NEWSROOM_ENRICHED_V1"
UA = "Mozilla/5.0 PassportNewsroom/1.0 (+https://www.passportradio.online/)"


def clean(v):
    return re.sub(r"\s+", " ", html.unescape(str(v or ""))).strip()


def search_youtube(query: str, timeout: int = 15) -> str:
    url = "https://www.youtube.com/results?search_query=" + quote_plus(query)
    req = Request(url, headers={"User-Agent": UA, "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8"})
    try:
        with urlopen(req, timeout=timeout) as r:
            body = r.read(2_500_000).decode("utf-8", "replace")
    except Exception:
        return ""
    ids = re.findall(r'"videoId":"([A-Za-z0-9_-]{11})"', body)
    return ids[0] if ids else ""


def keywords_for(item: dict) -> list[str]:
    vals = []
    vals.extend(item.get("entities") or [])
    vals.append(item.get("category") or "")
    vals.extend(re.findall(r"[A-Za-zÀ-ÿ0-9][A-Za-zÀ-ÿ0-9'’.-]{2,}", item.get("title") or ""))
    vals.extend(["Passport Radio", "música", "notícias de música"])
    out = []
    seen = set()
    for v in vals:
        v = clean(v)
        k = v.casefold()
        if not v or k in seen:
            continue
        seen.add(k); out.append(v)
    return out[:24]


def enrich_page(path: Path, item: dict) -> bool:
    text = path.read_text("utf-8")
    if MARKER in text:
        return False
    title = clean(item.get("title"))
    entities = [clean(x) for x in (item.get("entities") or []) if clean(x)]
    query = " ".join(([title] + entities[:3] + ["official music video"]))
    video_id = search_youtube(query)
    if not video_id:
        return False

    thumb = f"https://i.ytimg.com/vi/{video_id}/maxresdefault.jpg"
    embed = f"https://www.youtube-nocookie.com/embed/{video_id}"
    watch = f"https://www.youtube.com/watch?v={video_id}"
    kws = keywords_for(item)
    kw_meta = html.escape(", ".join(kws), quote=True)

    # Replace generic social image with the context-matched video thumbnail.
    text = re.sub(r'(<meta property="og:image" content=")[^"]+("\s*/?>)', rf'\1{thumb}\2', text, count=1)
    text = re.sub(r'(<meta name="twitter:image" content=")[^"]+("\s*/?>)', rf'\1{thumb}\2', text, count=1)

    head_extra = (
        f'\n<meta name="keywords" content="{kw_meta}">'
        f'\n<meta property="article:section" content="{html.escape(clean(item.get("category") or "music"), quote=True)}">'
        f'\n<meta property="og:video" content="{embed}">'
        f'\n<meta property="og:video:type" content="text/html">'
        f'\n<!-- {MARKER} -->\n'
    )
    text = text.replace("</head>", head_extra + "</head>", 1)

    block = f'''\n<section class="pe-newsroom-media" aria-label="Vídeo relacionado">
  <figure>
    <img src="{thumb}" alt="Vídeo relacionado a {html.escape(title, quote=True)}" loading="lazy" decoding="async">
    <figcaption>Passport Radio · vídeo relacionado ao acontecimento desta matéria.</figcaption>
  </figure>
  <div class="pe-newsroom-video">
    <iframe src="{embed}" title="{html.escape(title, quote=True)} — vídeo relacionado" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
  </div>
  <p class="pe-newsroom-video-link"><a href="{watch}" rel="noopener noreferrer">ABRIR NO YOUTUBE →</a></p>
</section>\n'''
    # Put media inside the story, immediately before the editorial closing.
    needle = '<div class="pe-closing"><small>PASSPORT RADIO · EDITORIAL</small>'
    if needle not in text:
        return False
    text = text.replace(needle, block + needle, 1)

    css = '''\n<style>
.pe-newsroom-media{margin:54px 0;border-top:1px solid rgba(0,0,0,.14);padding-top:32px}.pe-newsroom-media figure{margin:0 0 22px}.pe-newsroom-media img{display:block;width:100%;height:auto}.pe-newsroom-media figcaption{margin-top:8px;font-size:.72rem;opacity:.62}.pe-newsroom-video{position:relative;width:100%;aspect-ratio:16/9;background:#000}.pe-newsroom-video iframe{position:absolute;inset:0;width:100%;height:100%;border:0}.pe-newsroom-video-link{font-size:.72rem;font-weight:800;letter-spacing:.06em}
</style>\n'''
    text = text.replace("</head>", css + "</head>", 1)
    path.write_text(text, "utf-8")
    return True


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--feed", default="data/editorial-feed.json")
    ap.add_argument("--limit", type=int, default=40)
    args = ap.parse_args()
    feed = json.loads((ROOT / args.feed).read_text("utf-8"))
    items = feed if isinstance(feed, list) else feed.get("items", [])
    changed = []
    for item in items[: max(1, args.limit)]:
        url = str(item.get("url") or "")
        if not url.startswith("/editorial/") or not url.endswith(".html"):
            continue
        path = ROOT / url.lstrip("/")
        if path.exists() and enrich_page(path, item):
            changed.append(url)
    print(json.dumps({"status":"ok","enriched":len(changed),"pages":changed}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
