#!/usr/bin/env python3
"""Persistent published catalog for the Passport Blog.

The operational feed (blog-feed.json) is a recent window.
This catalog is the memory: one canonical row per published story,
idempotent, searchable, paginated, and entity-linked.

Never writes noticias.html, Home, radio, or the old editorial feed.
"""
from __future__ import annotations

import datetime as dt
import hashlib
import html
import json
import math
import re
import unicodedata
from pathlib import Path
from typing import Any
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
SITE = "https://passportradio.online"
CHANNEL = "blog"
CATALOG_PATH = ROOT / "data" / "blog-catalog.jsonl"
META_PATH = ROOT / "data" / "blog-catalog-meta.json"
SEARCH_DIR = ROOT / "data" / "blog-search"
ENTITY_DIR = ROOT / "blog" / "e"
ARCHIVE_DIR = ROOT / "blog" / "arquivo"
COVER_URL = "/historias/contar-historias-que-dao-vontade-de-ouvir.html"
SHARD_SIZE = 4000
ARCHIVE_PAGE_SIZE = 24
ENTITY_MIN_STORIES = 1

ENTITY_STOP = {
    "passport", "radio", "blog", "music", "música", "musica", "metal", "rock",
    "filme", "film", "podcast", "news", "story", "disco", "show", "live",
    "album", "álbum", "the", "and", "und", "der", "die", "das", "von", "mit",
    "new", "nova", "novo", "entrevista", "review", "hammer", "whiplash",
    "passport radio", "metal hammer podcast", "nunca", "filme",
    "bryan", "ada", "leon", "ada wong", "leon kennedy", "weapons",
    "folge", "woche",
}

FORMAT_FAMILY = {
    "STORY": "historias",
    "FLASH": "historias",
    "MR_NOMAD": "historias",
    "news": "historias",
    "story": "historias",
    "DISCO": "discos",
    "review": "discos",
    "ENTREVISTA": "entrevistas",
    "interview": "entrevistas",
    "LIVE_SIGNAL": "shows",
    "SHOW": "shows",
    "show": "shows",
    "festival": "shows",
    "tour": "shows",
    "CULTURA": "cultura",
    "CURIOSIDADE": "cultura",
    "special": "cultura",
    "curiosity": "cultura",
    "video": "cultura",
}

FAMILY_LABEL = {
    "historias": "Histórias",
    "discos": "Discos",
    "shows": "Shows",
    "entrevistas": "Entrevistas",
    "cultura": "Cultura",
}


def esc(value: Any) -> str:
    return html.escape(str(value or ""), quote=True)


def clean(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def fold(value: Any) -> str:
    text = unicodedata.normalize("NFKD", str(value or ""))
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    return re.sub(r"[^a-z0-9]+", " ", text.lower()).strip()


def slugify(value: Any) -> str:
    text = fold(value).replace(" ", "-").strip("-")
    return re.sub(r"-{2,}", "-", text)[:80] or "item"


def stable_id(url: str) -> str:
    path = str(url or "").strip()
    digest = hashlib.sha1(path.encode("utf-8")).hexdigest()[:12]
    return f"blog-{digest}"


def decade_of(date: str) -> str:
    year = str(date or "")[:4]
    if year.isdigit():
        return str((int(year) // 10) * 10)
    return ""


YEAR_RE = re.compile(r"\b((?:19|20)\d{2})\b")
DECADE_WORD_RE = re.compile(r"anos\s+(\d0)", re.I)

COUNTRY_FOLDS = {
    "brasil", "brazil", "finlandia", "finland", "eua", "usa", "estados unidos",
    "reino unido", "inglaterra", "uk", "alemanha", "germany", "suecia", "sweden",
    "noruega", "japao", "japan", "franca", "italia", "argentina", "mexico",
    "canada", "australia", "irlanda", "gales", "pais de gales", "escocia",
    "portugal", "espanha", "holanda", "belgica", "dinamarca", "chile", "peru",
}
GENRE_FOLDS = {
    "metal", "heavy metal", "thrash", "thrash metal", "rock", "punk", "hardcore",
    "gothic", "gotico", "gótico", "jazz", "blues", "mpb", "samba", "soul",
    "prog", "progressivo", "grunge", "industrial", "hip hop", "rap",
}
BAND_FOLDS = {
    "pink floyd", "iron maiden", "led zeppelin", "rolling stones", "the rolling stones",
    "machine head", "dream theater", "guns n roses", "black sabbath", "ac dc",
    "kid abelha", "sepultura", "metallica", "mastodon", "nightwish", "oasis", "yes",
}
PERSON_HINTS = {
    "keith richards", "john bonham", "kai hansen", "noel gallagher", "zach cregger",
    "james hetfield", "robb flynn", "roger waters", "floor jansen", "steve harris",
    "david gilmour", "paula toller", "leoni", "regis tadeu",
}


def years_from_text(*parts: Any) -> list[int]:
    blob = " ".join(str(p or "") for p in parts)
    found = {int(y) for y in YEAR_RE.findall(blob)}
    for match in DECADE_WORD_RE.findall(blob):
        decade = int(match)
        found.add(2000 if decade == 0 else 1900 + decade)
    # normalize 60 → 1960 already handled; 00s stay 2000
    cleaned = []
    for year in sorted(found):
        if 1920 <= year <= 2026:
            cleaned.append(year)
    return cleaned


def historical_fields(item: dict[str, Any]) -> dict[str, Any]:
    pub = str(item.get("published_at") or "")
    pub_year = int(pub[:4]) if pub[:4].isdigit() else None
    years = years_from_text(
        item.get("title"), item.get("deck"), item.get("body_excerpt"),
        item.get("body_index"), " ".join(item.get("topics") or []),
        item.get("historical_period"),
        " ".join(str(y) for y in (item.get("event_years") or [])),
    )
    if item.get("event_years"):
        extra = []
        for raw in item.get("event_years") or []:
            try:
                extra.append(int(str(raw)[:4]))
            except ValueError:
                continue
        years = sorted(set(years) | set(extra))
    event_years = [y for y in years if pub_year is None or y != pub_year or len(years) == 1]
    if not event_years and years:
        event_years = years
    decades = sorted({str((y // 10) * 10) for y in event_years})
    if event_years:
        lo, hi = min(event_years), max(event_years)
        period = str(lo) if lo == hi else f"{lo}–{hi}"
    else:
        period = str(item.get("historical_period") or "")
    return {
        "event_years": event_years,
        "decades_covered": decades,
        "historical_period": period,
        "year": str(event_years[0] if event_years else (pub[:4] if pub else "")),
        "decade": decades[0] if decades else decade_of(pub),
        "published_year": pub[:4] if pub else "",
    }


def entity_kind(name: str, item: dict[str, Any] | None = None) -> str:
    folded = fold(name)
    if not folded:
        return "tema"
    if folded in COUNTRY_FOLDS or (item and fold(item.get("country") or "") == folded):
        return "country"
    if folded in GENRE_FOLDS or (item and fold(item.get("genre") or "") == folded):
        return "genre"
    if item and fold(item.get("author") or "") == folded:
        return "author"
    if any(token in folded for token in ("resident evil", "raccoon")):
        return "film"
    if folded in PERSON_HINTS:
        return "person"
    if folded in BAND_FOLDS:
        return "band"
    words = [w for w in str(name).split() if w]
    if len(words) >= 2 and all(w[:1].isupper() for w in words if w[:1].isalpha()):
        if any(w.lower() in {"the", "and", "&"} for w in words):
            return "band"
        return "person"
    if folded.isdigit() and len(folded) == 4:
        return "year"
    return "band"


def letter_of(name: str) -> str:
    folded = fold(name)
    if not folded:
        return "#"
    ch = folded[0]
    return ch if ch.isalpha() else "#"


def collab_cta(item: dict[str, Any]) -> dict[str, str]:
    ents = [x for x in (item.get("entities") or []) if x]
    subject = ents[0] if ents else "esta história"
    family = item.get("family") or family_of(item)
    period = item.get("historical_period") or ""
    if family == "shows":
        line = f"Você estava lá? Viu {subject} nesse palco? Tem fotos, flyers, ingressos ou um relato?"
    elif family == "discos":
        line = f"Tocou, gravou ou conviveu com {subject} nessa época? Tem capa, ficha, foto de estúdio?"
    elif family == "cultura":
        line = f"Tem um documento, still ou memória sobre {subject} que falta nesta página?"
    else:
        line = f"Você tocou com {subject}, viu um show, tem fotos, flyers, ingressos ou uma informação que falta?"
    if period:
        line += f" Esta história atravessa {period}."
    line += " Ajude a completar o acervo."
    return {
        "text": line,
        "href": f"/blog/envie-sua-historia.html?entity={quote(subject)}&format={quote(family)}",
        "label": "Envie sua história",
    }


def author_pages(catalog: list[dict[str, Any]]) -> list[dict[str, Any]]:
    buckets: dict[str, dict[str, Any]] = {}
    for item in catalog:
        name = clean(item.get("author") or "Passport Radio")
        key = fold(name) or "passport-radio"
        slot = buckets.get(key)
        if slot is None:
            slot = {"name": name, "slug": slugify(name), "kind": "author", "items": []}
            buckets[key] = slot
        slot["items"].append(item)
    pages = list(buckets.values())
    pages.sort(key=lambda x: (-len(x["items"]), x["name"]))
    return pages


def family_of(item: dict[str, Any]) -> str:
    hint = str(item.get("format_hint") or "")
    fmt = str(item.get("format") or "")
    title_hay = fold(item.get("title") or "")
    ent_hay = fold(" ".join(item.get("entities") or []))
    if any(token in title_hay or token in ent_hay for token in (
        "resident evil", "raccoon", "anime", "manga",
    )):
        return "cultura"
    if hint in {"review", "interview", "show", "festival", "tour", "special", "curiosity", "video"}:
        return FORMAT_FAMILY.get(hint) or "historias"
    return FORMAT_FAMILY.get(fmt) or FORMAT_FAMILY.get(hint) or "historias"


def load_json(path: Path, fallback: Any) -> Any:
    if not path.exists():
        return fallback
    try:
        return json.loads(path.read_text("utf-8"))
    except json.JSONDecodeError:
        return fallback


def save_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", "utf-8")


def load_catalog(path: Path | None = None) -> list[dict[str, Any]]:
    target = path or CATALOG_PATH
    if not target.exists():
        return []
    rows: list[dict[str, Any]] = []
    seen: set[str] = set()
    with target.open("r", encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if not line:
                continue
            try:
                row = json.loads(line)
            except json.JSONDecodeError:
                continue
            if not isinstance(row, dict) or not row.get("url"):
                continue
            url = str(row["url"])
            if url in seen:
                continue
            seen.add(url)
            if str(row.get("status") or "published") != "published":
                continue
            rows.append(row)
    rows.sort(key=lambda r: str(r.get("published_at") or ""), reverse=True)
    return rows


def upsert_catalog(item: dict[str, Any], path: Path | None = None) -> dict[str, Any]:
    target = path or CATALOG_PATH
    target.parent.mkdir(parents=True, exist_ok=True)
    url = str(item.get("url") or "").strip()
    if not url:
        raise ValueError("catalog row needs url")
    row = {
        "id": item.get("id") or stable_id(url),
        "url": url,
        "canonical": item.get("canonical") or (SITE + url if url.startswith("/") else url),
        "slug": item.get("slug") or slugify(item.get("title") or url),
        "title": clean(item.get("title")),
        "deck": clean(item.get("deck")),
        "body_excerpt": clean(item.get("body_excerpt") or item.get("deck"))[:400],
        "body_index": clean(item.get("body_index") or item.get("body_excerpt") or item.get("deck"))[:1200],
        "published_at": str(item.get("published_at") or "")[:32],
        "modified_at": str(item.get("modified_at") or item.get("published_at") or "")[:32],
        "author": clean(item.get("author") or "Passport Radio"),
        "format": str(item.get("format") or "STORY"),
        "format_hint": str(item.get("format_hint") or ""),
        "family": family_of(item),
        "category": str(item.get("category") or "music"),
        "image": str(item.get("image") or ""),
        "image_alt": clean(item.get("image_alt") or item.get("title")),
        "image_credit": clean(item.get("image_credit") or ""),
        "entities": [clean(x) for x in (item.get("entities") or []) if clean(x)][:16],
        "topics": [clean(x) for x in (item.get("topics") or []) if clean(x)][:12],
        "genre": clean(item.get("genre") or ""),
        "country": clean(item.get("country") or ""),
        "region": clean(item.get("region") or ""),
        "city": clean(item.get("city") or ""),
        "story_id": str(item.get("story_id") or item.get("story_angle_id") or ""),
        "channel": CHANNEL,
        "status": "published",
        "has_video": bool(item.get("has_video")),
        "has_image": bool(item.get("image") or item.get("has_image")),
        "has_mid_image": bool(item.get("has_mid_image")),
        "norm": "",
    }
    hist = historical_fields({**item, **row})
    row.update(hist)
    row["entity_kinds"] = {name: entity_kind(name, row) for name in row["entities"]}
    hay = " ".join([
        row["title"], row["deck"], row["body_excerpt"], row["body_index"], row["author"],
        row["format"], row["family"], row["genre"], row["country"],
        row["region"], row["city"], row["year"], row["decade"],
        row.get("historical_period") or "", row.get("published_year") or "",
        " ".join(str(y) for y in (row.get("event_years") or [])),
        " ".join(row.get("decades_covered") or []),
        " ".join(row["entities"]), " ".join(row["topics"]),
        " ".join(row.get("entity_kinds") or {}),
    ])
    row["norm"] = fold(hay)
    existing = load_catalog(target)
    by_url = {str(x.get("url")): x for x in existing}
    by_url[url] = row
    ordered = sorted(by_url.values(), key=lambda r: str(r.get("published_at") or ""), reverse=True)
    with target.open("w", encoding="utf-8") as handle:
        for rec in ordered:
            handle.write(json.dumps(rec, ensure_ascii=False, separators=(",", ":")) + "\n")
    meta = {
        "version": 1,
        "channel": CHANNEL,
        "updated_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        "count": len(ordered),
        "path": str(target.relative_to(ROOT)) if target.is_relative_to(ROOT) else str(target),
    }
    save_json(META_PATH if path is None else path.with_suffix(".meta.json"), meta)
    return row


def seed_from_feed(feed_path: Path | None = None) -> int:
    payload = load_json(feed_path or (ROOT / "data/blog-feed.json"), {"items": []})
    count = 0
    inaugural = {
        "url": COVER_URL,
        "title": "Contar histórias que dão vontade de ouvir.",
        "deck": "O compromisso editorial desta porta da Passport.",
        "published_at": "2026-09-15T12:00:00-03:00",
        "author": "Mr. Nomad",
        "format": "MR_NOMAD",
        "entities": ["Passport Radio"],
        "image": "/images/passport-radio-definitive.jpg",
        "story_id": "cover-nomad-inaugural",
    }
    upsert_catalog(inaugural)
    count += 1
    for item in payload.get("items") or []:
        if not item.get("url"):
            continue
        upsert_catalog(item)
        count += 1
    return count


def related_rank(seed: dict[str, Any], catalog: list[dict[str, Any]], limit: int = 6) -> list[dict[str, Any]]:
    seed_url = str(seed.get("url") or "")
    seed_ents = {fold(x) for x in (seed.get("entities") or []) if x}
    seed_family = family_of(seed)
    seed_year = str(seed.get("year") or str(seed.get("published_at") or "")[:4])
    seed_country = fold(seed.get("country") or "")
    seed_genre = fold(seed.get("genre") or "")
    scored: list[tuple[int, str, dict[str, Any]]] = []
    seen_event = fold(seed.get("title") or "")[:40]
    for item in catalog:
        url = str(item.get("url") or "")
        if not url or url == seed_url:
            continue
        title_fold = fold(item.get("title") or "")
        if seen_event and title_fold[:40] == seen_event:
            continue
        ents = {fold(x) for x in (item.get("entities") or []) if x}
        score = 12 * len(seed_ents & ents)
        if family_of(item) == seed_family:
            score += 3
        if seed_year and str(item.get("year") or "") == seed_year:
            score += 2
        seed_hist = set(str(x) for x in (seed.get("decades_covered") or []))
        item_hist = set(str(x) for x in (item.get("decades_covered") or []))
        if seed_hist and seed_hist & item_hist:
            score += 4
        if seed_country and fold(item.get("country") or "") == seed_country:
            score += 3
        if seed_genre and fold(item.get("genre") or "") == seed_genre:
            score += 2
        if str(item.get("author") or "") == str(seed.get("author") or ""):
            score += 1
        if score <= 0:
            continue
        scored.append((score, str(item.get("published_at") or ""), item))
    scored.sort(key=lambda x: (x[0], x[1]), reverse=True)
    out = []
    used_ents: set[str] = set()
    for score, _when, item in scored:
        primary = fold((item.get("entities") or [item.get("title")])[0] if item.get("entities") else item.get("title"))
        if primary in used_ents and len(out) >= 2:
            continue
        used_ents.add(primary)
        out.append(item)
        if len(out) >= limit:
            break
    return out


def neighbors(seed: dict[str, Any], catalog: list[dict[str, Any]]) -> dict[str, dict[str, Any] | None]:
    ordered = sorted(catalog, key=lambda r: str(r.get("published_at") or ""))
    urls = [str(x.get("url")) for x in ordered]
    try:
        idx = urls.index(str(seed.get("url")))
    except ValueError:
        return {"prev": None, "next": None}
    return {
        "prev": ordered[idx - 1] if idx > 0 else None,
        "next": ordered[idx + 1] if idx + 1 < len(ordered) else None,
    }


def search_catalog(query: str, catalog: list[dict[str, Any]], page: int = 1, per_page: int = 20) -> dict[str, Any]:
    tokens = [t for t in fold(query).split() if t]
    if not tokens:
        return {"query": query, "total": 0, "page": 1, "pages": 0, "items": []}
    scored: list[tuple[int, dict[str, Any]]] = []
    for item in catalog:
        hay = str(item.get("norm") or fold(" ".join([
            item.get("title") or "", item.get("deck") or "", item.get("body_index") or "",
            item.get("body_excerpt") or "", item.get("author") or "",
            item.get("country") or "", item.get("historical_period") or "",
            " ".join(str(y) for y in (item.get("event_years") or [])),
            " ".join(item.get("decades_covered") or []),
            " ".join(item.get("entities") or []),
        ])))
        title = fold(item.get("title") or "")
        ents = " ".join(fold(x) for x in (item.get("entities") or []))
        author = fold(item.get("author") or "")
        country = fold(item.get("country") or "")
        hist = fold(" ".join([
            item.get("historical_period") or "",
            " ".join(str(y) for y in (item.get("event_years") or [])),
            " ".join(item.get("decades_covered") or []),
        ]))
        body = fold(item.get("body_index") or item.get("body_excerpt") or "")
        score = 0
        miss = False
        for token in tokens:
            if token in title:
                score += 8 if title.startswith(token) or f" {token}" in f" {title}" else 5
            elif token in ents:
                score += 6
            elif token in author:
                score += 6
            elif token in country:
                score += 6
            elif token in hist:
                score += 5
            elif token in body:
                score += 4
            elif token in hay:
                score += 3
            else:
                miss = True
                break
        if miss or not score:
            continue
        phrase = " ".join(tokens)
        if phrase and phrase in title:
            score += 10
        scored.append((score, item))
    scored.sort(key=lambda x: (x[0], str(x[1].get("published_at") or "")), reverse=True)
    total = len(scored)
    pages = max(1, math.ceil(total / per_page)) if total else 0
    page = max(1, min(page, pages or 1))
    start = (page - 1) * per_page
    items = [x[1] for x in scored[start:start + per_page]]
    return {"query": query, "total": total, "page": page, "pages": pages, "items": items}


def build_search_shards(catalog: list[dict[str, Any]], dest: Path | None = None, shard_size: int = SHARD_SIZE) -> dict[str, Any]:
    dest = dest or SEARCH_DIR
    dest.mkdir(parents=True, exist_ok=True)
    for old in dest.glob("shard-*.json"):
        old.unlink()
    compact = []
    for item in catalog:
        compact.append({
            "id": item.get("id"),
            "url": item.get("url"),
            "title": item.get("title"),
            "deck": item.get("deck"),
            "date": str(item.get("published_at") or "")[:10],
            "format": item.get("format"),
            "family": item.get("family") or family_of(item),
            "author": item.get("author"),
            "image": item.get("image") or "",
            "entities": item.get("entities") or [],
            "year": item.get("year") or "",
            "decade": item.get("decade") or "",
            "country": item.get("country") or "",
            "historical_period": item.get("historical_period") or "",
            "event_years": item.get("event_years") or [],
            "decades_covered": item.get("decades_covered") or [],
            "body": (item.get("body_index") or item.get("body_excerpt") or "")[:280],
            "norm": item.get("norm") or "",
        })
    shards = []
    size = max(200, int(shard_size))
    for idx in range(0, max(1, len(compact)), size) if compact else []:
        chunk = compact[idx:idx + size]
        name = f"shard-{len(shards):02d}.json"
        save_json(dest / name, {"items": chunk})
        shards.append({"file": f"/data/blog-search/{name}", "count": len(chunk)})
    if not compact:
        save_json(dest / "shard-00.json", {"items": []})
        shards = [{"file": "/data/blog-search/shard-00.json", "count": 0}]
    manifest = {
        "version": 1,
        "updated_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        "count": len(compact),
        "shard_size": size,
        "shards": shards,
    }
    save_json(dest / "manifest.json", manifest)
    return manifest


def entity_pages(catalog: list[dict[str, Any]]) -> list[dict[str, Any]]:
    buckets: dict[str, dict[str, Any]] = {}
    for item in catalog:
        for name in item.get("entities") or []:
            folded = fold(name)
            if not folded or folded in ENTITY_STOP or len(folded) < 3:
                continue
            if " " not in folded and folded in {fold(x).replace(" ", "") for x in ENTITY_STOP}:
                continue
            key = folded.replace(" ", "")
            if key in ENTITY_STOP:
                continue
            slot = buckets.get(key)
            if slot is None:
                display = name if " " in name or name[:1].isupper() else name
                slot = {"name": display if " " in display else name, "slug": slugify(name if " " in name else name), "kind": entity_kind(name, item), "items": []}
                buckets[key] = slot
            if " " in name and len(name) > len(slot["name"]):
                slot["name"] = name
                slot["slug"] = slugify(name)
            if item not in slot["items"]:
                slot["items"].append(item)
    pages = []
    for slot in buckets.values():
        if len(slot["items"]) < ENTITY_MIN_STORIES:
            continue
        pages.append(slot)
    pages.sort(key=lambda x: (-len(x["items"]), x["name"]))
    return pages


def _card(item: dict[str, Any], extra_class: str = "") -> str:
    img = item.get("image") or ""
    media = ""
    if img:
        media = f'<span class="blog-card__media"><img src="{esc(img)}" alt="{esc(item.get("image_alt") or item.get("title"))}" loading="lazy" width="640" height="360"></span>'
    family = FAMILY_LABEL.get(item.get("family") or family_of(item), "Blog")
    date = str(item.get("published_at") or "")[:10]
    return (
        f'<a class="blog-card {extra_class}" href="{esc(item.get("url"))}">'
        f"{media}"
        f'<span class="blog-card__eyebrow">{esc(family)}</span>'
        f"<h2>{esc(item.get('title'))}</h2>"
        f"<p>{esc(item.get('deck'))}</p>"
        f'<span class="blog-card__meta">{esc(item.get("author") or "Passport Radio")} · {esc(date)}</span>'
        f"</a>"
    )


def _chrome(title: str, desc: str, canonical: str, extra_schema: dict | None = None, search_value: str = "") -> str:
    schema = {
        "@context": "https://schema.org",
        "@graph": [
            {"@type": "Organization", "name": "Passport Radio", "url": SITE, "logo": SITE + "/images/passport-radio-definitive.jpg"},
            {"@type": "WebSite", "name": "Blog Passport Radio", "url": SITE + "/blog.html",
             "potentialAction": {"@type": "SearchAction",
                                 "target": SITE + "/blog/busca.html?q={search_term_string}",
                                 "query-input": "required name=search_term_string"}},
        ],
    }
    if extra_schema:
        schema["@graph"].append(extra_schema)
    q = esc(search_value)
    return f'''<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<link rel="canonical" href="{esc(canonical)}">
<meta property="og:type" content="website"><meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}"><meta property="og:url" content="{esc(canonical)}">
<meta property="og:image" content="{SITE}/images/passport-radio-definitive.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,500;6..96,600;6..96,700&family=Instrument+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/passport-tokens-v6.css?v=20260908z">
<link rel="stylesheet" href="/css/passport-shell-v6.css?v=20260908z">
<link rel="stylesheet" href="/css/passport-four-doors.css?v=20260912f">
<link rel="stylesheet" href="/css/passport-station-skin.css?v=20260912g">
<link rel="stylesheet" href="/css/passport-blog.css?v=20260918s">
<script type="application/ld+json">{json.dumps(schema, ensure_ascii=False)}</script>
</head>
<body class="pp-body fd-body pp-station pp-blog">
<header class="pp-topbar"><div class="pp-topbar-in"><a class="pp-brand" href="/index.html"><img src="/images/passport-radio-definitive.jpg" alt="Passport Radio" width="38" height="38"><span class="pp-brand-txt"><b>PASSPORT RADIO</b></span></a>
<form class="blog-search" role="search" method="get" action="/blog/busca.html">
<label class="blog-search__label" for="blog-q">Buscar no Blog</label>
<input id="blog-q" name="q" type="search" value="{q}" placeholder="Buscar artista, disco, país, ano…" autocomplete="off">
<button type="submit" aria-label="Buscar">Buscar</button>
</form>
<nav class="pp-top-actions"><a href="/radio.html">OUVIR</a></nav></div></header>
<nav class="pp-nav" aria-label="Seções"><div class="pp-nav-in">
<a href="/index.html">HOME</a><a href="/noticias.html">NOTÍCIAS</a><a href="/editorial.html">ARQUIVO</a>
<a href="/blog.html" aria-current="page">BLOG</a><a href="/blog/arquivo/">ACERVO</a>
<a href="/radio.html">OUVIR</a>
<a href="/loja.html">LOJA</a><a href="/promocoes.html">PROMOÇÕES</a><a href="/anuncie.html">ANUNCIE</a><a href="/doe.html">DOE</a>
</div></nav>
<nav class="blog-doors" aria-label="Portas do Blog">
<a href="/blog.html">Capa</a>
<a href="/blog/busca.html">Busca</a>
<a href="/blog/arquivo/">Arquivo</a>
<a href="/blog/arquivo/letras.html">A–Z</a>
<a href="/blog/arquivo/autores.html">Autores</a>
<a href="/blog/arquivo/paises.html">Países</a>
<a href="/blog/arquivo/formatos.html">Formatos</a>
<a href="/blog/arquivo/epocas.html">Épocas</a>
<a href="/blog/arquivo/temas.html">Temas</a>
<a href="/blog/arquivo/agenda.html">Agenda do acervo</a>
<a href="/blog/envie-sua-historia.html">Envie sua história</a>
<a href="/loja.html">Loja</a>
</nav>
'''


def _footer() -> str:
    from passport_circulation import TELEGRAM_OFFICIAL, WHATSAPP_OFFICIAL, follow_html
    return (
        follow_html(compact=True)
        + '''<footer class="pp-footer" id="ajude"><div class="pp-footer-in"><div class="pp-fcol"><p>Passport Radio</p></div>
<div class="pp-fcol"><a href="/index.html">Home</a><a href="/noticias.html">Notícias</a><a href="/editorial.html">Arquivo</a><a href="/blog.html">Blog</a><a href="/blog/arquivo/">Arquivo do Blog</a><a href="/blog/envie-sua-historia.html">Envie sua história</a><a href="/loja.html">Loja</a></div>
<div class="pp-fcol"><a href="''' + TELEGRAM_OFFICIAL + '''" target="_blank" rel="noopener">Telegram oficial</a>
<a href="''' + WHATSAPP_OFFICIAL + '''" target="_blank" rel="noopener">WhatsApp oficial</a>
<a href="https://www.asaas.com/c/shpb8gbiswnw4t2n" target="_blank" rel="noopener">DOE AGORA · PIX · Boleto · Cartão</a></div></div>
<div class="pp-footer-bottom">© 2026 Passport Radio · Todos os direitos reservados. <a href="/privacidade.html">Política de Privacidade</a> · <a href="/termos.html">Termos de Uso</a> · <a href="/cookies.html">Política de Cookies</a> · <a href="/contato.html">Contato</a></div></footer>
</body></html>
'''
    )


def render_cover(catalog: list[dict[str, Any]]) -> str:
    items = [x for x in catalog if x.get("url")]
    def hero_score(item: dict[str, Any]) -> tuple:
        score = 0
        if item.get("url") != COVER_URL:
            score += 2
        if item.get("image") or item.get("has_image"):
            score += 10
        title = str(item.get("title") or "")
        if not title.startswith("O que ") and "deixa no ar agora" not in title:
            score += 6
        return (score, str(item.get("published_at") or ""))
    ranked = sorted(items, key=hero_score, reverse=True)
    shown: set[str] = set()

    def take(rows: list[dict[str, Any]], n: int) -> list[dict[str, Any]]:
        out: list[dict[str, Any]] = []
        for item in rows:
            url = str(item.get("url") or "")
            if not url or url in shown:
                continue
            shown.add(url)
            out.append(item)
            if len(out) >= n:
                break
        return out

    hero = next((x for x in ranked if x.get("url") != COVER_URL), items[0] if items else None)
    if hero:
        shown.add(str(hero.get("url")))
    rest = [x for x in ranked if hero and x.get("url") != hero.get("url")]
    secondary = take(rest, 3)
    recent = take(items, 8)
    families: dict[str, list] = {}
    for item in items:
        families.setdefault(item.get("family") or family_of(item), []).append(item)
    entities = entity_pages(items)[:16]
    decades: dict[str, int] = {}
    for item in items:
        for dec in (item.get("decades_covered") or [item.get("decade") or ""]):
            if dec:
                decades[str(dec)] = decades.get(str(dec), 0) + 1
    parts = [_chrome("Blog | Passport Radio", "Histórias musicais da Passport Radio. Busca, arquivo, artistas e discussão.", SITE + "/blog.html")]
    parts.append('<main class="blog-page">')
    parts.append('<span class="blog-kicker">PASSPORT RADIO · PUBLICAÇÃO</span>')
    parts.append("<h1>Blog</h1>")
    parts.append('<p class="blog-intro">Contar histórias que dão vontade de ouvir. Bastidores, discos, shows, artistas e as decisões que deixaram marcas na música.</p>')
    authors = author_pages(items)
    countries = sorted({clean(x.get("country")) for x in items if clean(x.get("country"))})
    letters = sorted({letter_of(ent["name"]) for ent in entity_pages(items) if letter_of(ent["name"]) != "#"})
    parts.append('<section class="blog-doors-panel" aria-label="Portas editoriais">')
    parts.append('<a href="/blog/arquivo/"><strong>Arquivo</strong><span>O acervo não some da capa</span></a>')
    parts.append('<a href="/blog/arquivo/letras.html"><strong>A–Z</strong><span>Artistas e bandas por letra</span></a>')
    parts.append('<a href="/blog/arquivo/autores.html"><strong>Autores</strong><span>Quem assina o acervo</span></a>')
    parts.append('<a href="/blog/arquivo/epocas.html"><strong>Épocas</strong><span>Década do acontecimento, não da publicação</span></a>')
    parts.append('<a href="/blog/arquivo/paises.html"><strong>Países</strong><span>Cenas e origens</span></a>')
    parts.append('<a href="/blog/arquivo/formatos.html"><strong>Formatos</strong><span>Histórias, discos, shows, entrevistas</span></a>')
    parts.append('<a href="/blog/arquivo/temas.html"><strong>Temas</strong><span>Entidades e assuntos do acervo</span></a>')
    parts.append('<a href="/blog/arquivo/agenda.html"><strong>Agenda do acervo</strong><span>O tempo da história, não só da publicação</span></a>')
    parts.append('<a href="/blog/envie-sua-historia.html"><strong>Envie sua história</strong><span>Testemunha vira acervo</span></a>')
    parts.append('<a href="/loja.html"><strong>Loja</strong><span>Produto da casa, quando houver relação</span></a>')
    parts.append("</section>")
    if hero:
        parts.append('<section class="blog-hero-split" aria-label="Destaque">')
        parts.append(_card(hero, "blog-card--hero"))
        if secondary:
            parts.append('<div class="blog-hero-split__side">')
            parts.append("".join(_card(x, "blog-card--compact") for x in secondary))
            parts.append("</div>")
        parts.append("</section>")
    if recent:
        parts.append('<section class="blog-section" id="agora"><h2>Agora no Blog</h2><div class="blog-grid">')
        parts.append("".join(_card(x) for x in recent))
        parts.append("</div></section>")
    for key in ("discos", "shows", "entrevistas", "cultura"):
        rows = families.get(key) or []
        unique = [x for x in rows if str(x.get("url") or "") not in shown]
        pool = unique if len(unique) >= 2 else (rows if len(rows) >= 2 else [])
        if len(pool) < 2:
            continue
        chosen = []
        for item in pool:
            url = str(item.get("url") or "")
            if url and url not in {c.get("url") for c in chosen}:
                chosen.append(item)
            if len(chosen) >= 6:
                break
        parts.append(f'<section class="blog-section" id="{key}"><h2>{esc(FAMILY_LABEL[key])}</h2><div class="blog-grid">')
        parts.append("".join(_card(x) for x in chosen[:6]))
        parts.append(f'</div><p class="blog-section__more"><a href="/blog/arquivo/?fam={key}">Ver {esc(FAMILY_LABEL[key]).lower()} no arquivo →</a></p></section>')
    if entities:
        parts.append('<section class="blog-section" id="artistas"><h2>Artistas & bandas</h2><div class="blog-entity-cloud">')
        for ent in entities:
            parts.append(f'<a href="/blog/e/{esc(ent["slug"])}.html">{esc(ent["name"])} <small>{len(ent["items"])}</small></a>')
        parts.append("</div>")
        if letters:
            parts.append('<p class="blog-az">')
            for ch in "abcdefghijklmnopqrstuvwxyz":
                cls = "" if ch in letters else " class=\"is-empty\""
                parts.append(f'<a href="/blog/arquivo/letra-{ch}.html"{cls}>{ch.upper()}</a>')
            parts.append("</p></section>")
        else:
            parts.append("</section>")
    if authors:
        parts.append('<section class="blog-section" id="autores"><h2>Autores</h2><div class="blog-entity-cloud">')
        for author in authors[:12]:
            parts.append(f'<a href="/blog/a/{esc(author["slug"])}.html">{esc(author["name"])} <small>{len(author["items"])}</small></a>')
        parts.append('</div><p class="blog-section__more"><a href="/blog/arquivo/autores.html">Lista completa de autores →</a></p></section>')
    if countries:
        parts.append('<section class="blog-section" id="paises"><h2>Países</h2><div class="blog-entity-cloud">')
        for name in countries:
            parts.append(f'<a href="/blog/arquivo/?pais={esc(slugify(name))}">{esc(name)}</a>')
        parts.append("</div></section>")
    if decades:
        parts.append('<section class="blog-section" id="decadas"><h2>Épocas da história</h2><div class="blog-entity-cloud">')
        for dec in sorted(decades, reverse=True):
            parts.append(f'<a href="/blog/arquivo/?dec={esc(dec)}">{esc(dec)}s <small>{decades[dec]}</small></a>')
        parts.append('<p class="blog-section__more">A data de publicação não é a época do acontecimento.</p></div></section>')
    inaugural = next((x for x in items if x.get("url") == COVER_URL), None)
    if inaugural:
        parts.append('<section class="blog-section blog-section--quiet" id="inaugural"><h2>Patrimônio</h2>')
        parts.append(_card(inaugural, "blog-card--compact"))
        parts.append("</section>")
    parts.append('<section class="blog-collab-strip" id="colabore"><h2>Você estava lá?</h2>')
    parts.append('<p>A publicação encontra leitores. As histórias encontram testemunhas. Testemunhas alimentam o acervo.</p>')
    parts.append('<p><a href="/blog/envie-sua-historia.html">Envie sua história →</a> <a href="/minha-passport.html?returnTo=/blog/envie-sua-historia.html">Conta Passport</a></p></section>')
    parts.append('<section class="blog-section" id="arquivo"><h2>Arquivo completo</h2>')
    parts.append(f'<p class="blog-archive__lead">{len(items)} históri{"a" if len(items)==1 else "as"} publicadas. O que sai da capa continua aqui.</p>')
    parts.append('<p class="blog-section__more"><a href="/blog/arquivo/">Abrir o arquivo →</a></p></section>')
    parts.append("</main>")
    parts.append('<script src="/js/passport-blog-search.js?v=20260918r" defer></script>')
    parts.append(_footer())
    return "".join(parts)


def render_search_page() -> str:
    html_out = [_chrome("Busca no Blog | Passport Radio", "Encontre histórias, artistas, discos, países e décadas no acervo do Blog Passport Radio.", SITE + "/blog/busca.html")]
    html_out.append('<main class="blog-page blog-search-page">')
    html_out.append('<span class="blog-kicker">BLOG · BUSCA</span><h1>Busca</h1>')
    html_out.append('<p class="blog-intro">Pesquise o acervo publicado. Título, artista, país, década, formato.</p>')
    html_out.append('<div id="blog-search-results" class="blog-search-results" data-search-root="1"></div>')
    html_out.append("</main>")
    html_out.append('<script src="/js/passport-blog-search.js?v=20260918r" defer></script>')
    html_out.append(_footer())
    return "".join(html_out)


def render_archive_page(catalog: list[dict[str, Any]], page: int = 1, family: str = "", decade: str = "") -> tuple[str, int]:
    rows = catalog
    if family:
        rows = [x for x in rows if (x.get("family") or family_of(x)) == family]
    if decade:
        rows = [x for x in rows if (x.get("decade") or "") == decade]
    total = len(rows)
    pages = max(1, math.ceil(total / ARCHIVE_PAGE_SIZE)) if total else 1
    page = max(1, min(page, pages))
    chunk = rows[(page - 1) * ARCHIVE_PAGE_SIZE: page * ARCHIVE_PAGE_SIZE]
    suffix = f" · página {page}" if page > 1 else ""
    canonical = SITE + "/blog/arquivo/" + ("" if page == 1 else f"p{page}.html")
    body = [_chrome(f"Arquivo do Blog{suffix} | Passport Radio", "Arquivo completo do Blog Passport Radio.", canonical)]
    body.append('<main class="blog-page">')
    body.append('<span class="blog-kicker">BLOG · ARQUIVO</span>')
    heading = FAMILY_LABEL.get(family, "Arquivo")
    body.append(f"<h1>{esc(heading)}</h1>")
    body.append(f'<p class="blog-intro">{total} históri{"a" if total==1 else "as"} neste recorte. Paginação estável, ordem cronológica inversa.</p>')
    if chunk:
        body.append('<div class="blog-grid">')
        body.append("".join(_card(x) for x in chunk))
        body.append("</div>")
    else:
        body.append('<p class="blog-empty">Ainda não há histórias neste recorte.</p>')
    if pages > 1:
        body.append('<nav class="blog-pager" aria-label="Paginação do arquivo">')
        if page > 1:
            prev = "/blog/arquivo/" if page == 2 else f"/blog/arquivo/p{page-1}.html"
            body.append(f'<a rel="prev" href="{prev}">Anterior</a>')
        body.append(f"<span>{page} / {pages}</span>")
        if page < pages:
            body.append(f'<a rel="next" href="/blog/arquivo/p{page+1}.html">Próxima</a>')
        body.append("</nav>")
    body.append("</main>")
    body.append(_footer())
    return "".join(body), pages


def render_entity_page(slot: dict[str, Any]) -> str:
    name = slot["name"]
    items = slot["items"]
    kind = slot.get("kind") or entity_kind(name, items[0] if items else None)
    canonical = SITE + f"/blog/e/{slot['slug']}.html"
    extra = {"@type": "CollectionPage", "name": name, "url": canonical, "hasPart": [{"@type": "BlogPosting", "headline": i.get("title"), "url": SITE + i.get("url")} for i in items[:30]]}
    body = [_chrome(f"{name} | Blog Passport Radio", f"Histórias da Passport sobre {name}.", canonical, extra)]
    body.append('<main class="blog-page">')
    body.append('<nav class="blog-crumbs" aria-label="Trilha"><a href="/blog.html">Blog</a> · <a href="/blog/arquivo/">Arquivo</a> · <span>{0}</span></nav>'.format(esc(name)))
    body.append(f'<span class="blog-kicker">{esc(kind.upper())}</span><h1>{esc(name)}</h1>')
    body.append(f'<p class="blog-intro">{len(items)} históri{"a" if len(items)==1 else "as"} neste acervo.</p>')
    try:
        from editorial_blog_store import products_for_entities
        products = products_for_entities([name], limit=3)
    except Exception:
        products = []
    if products:
        body.append('<section class="blog-store-rail"><span>Na Loja Passport</span><div>')
        for prod in products:
            body.append(
                f'<a href="{esc(prod["url"])}"><img src="{esc(prod["image"])}" alt="{esc(prod["name"])}" width="120" height="120" loading="lazy">'
                f'<strong>{esc(prod["name"])}</strong></a>'
            )
        body.append('</div><p>A matéria não é vitrine. O produto só aparece quando a entidade coincide com o catálogo real.</p></section>')
    cta = collab_cta({"entities": [name], "family": (items[0].get("family") if items else ""), "historical_period": (items[0].get("historical_period") if items else "")})
    body.append(f'<section class="blog-collab-strip"><h2>Você estava lá?</h2><p>{esc(cta["text"])}</p><p><a href="{esc(cta["href"])}">{esc(cta["label"])} →</a></p></section>')
    body.append('<div class="blog-grid">')
    body.append("".join(_card(x) for x in items))
    body.append("</div></main>")
    body.append(_footer())
    return "".join(body)


def render_author_page(slot: dict[str, Any]) -> str:
    name = slot["name"]
    items = slot["items"]
    canonical = SITE + f"/blog/a/{slot['slug']}.html"
    extra = {"@type": "ProfilePage", "name": name, "url": canonical}
    body = [_chrome(f"{name} | Autores Passport Radio", f"Matérias assinadas por {name}.", canonical, extra)]
    body.append('<main class="blog-page">')
    body.append(f'<nav class="blog-crumbs"><a href="/blog.html">Blog</a> · <a href="/blog/arquivo/autores.html">Autores</a> · <span>{esc(name)}</span></nav>')
    body.append(f'<span class="blog-kicker">AUTOR</span><h1>{esc(name)}</h1>')
    body.append(f'<p class="blog-intro">{len(items)} históri{"a" if len(items)==1 else "as"} publicadas neste acervo. Mr. Nomad só assina o que é de Mr. Nomad. O tunnel assina Passport Radio.</p>')
    body.append('<div class="blog-grid">')
    body.append("".join(_card(x) for x in items))
    body.append("</div></main>")
    body.append(_footer())
    return "".join(body)


def render_index_list(title: str, kicker: str, intro: str, links: list[tuple[str, str, str]], canonical_path: str) -> str:
    body = [_chrome(f"{title} | Blog Passport Radio", intro, SITE + canonical_path)]
    body.append('<main class="blog-page">')
    body.append(f'<span class="blog-kicker">{esc(kicker)}</span><h1>{esc(title)}</h1>')
    body.append(f'<p class="blog-intro">{esc(intro)}</p>')
    body.append('<div class="blog-entity-cloud">')
    for href, label, count in links:
        extra = f" <small>{esc(count)}</small>" if count else ""
        body.append(f'<a href="{esc(href)}">{esc(label)}{extra}</a>')
    body.append("</div></main>")
    body.append(_footer())
    return "".join(body)


def render_az_hub(entities: list[dict[str, Any]]) -> str:
    groups: dict[str, list] = {}
    for ent in entities:
        groups.setdefault(letter_of(ent["name"]), []).append(ent)
    body = [_chrome("A–Z | Blog Passport Radio", "Índice alfabético de artistas, bandas e pessoas no acervo.", SITE + "/blog/arquivo/letras.html")]
    body.append('<main class="blog-page"><span class="blog-kicker">ACERVO · A–Z</span><h1>Escolha a letra inicial</h1>')
    body.append('<p class="blog-intro">Porta enciclopédica do acervo publicado. Cada letra abre entidades reais, não categorias vazias.</p>')
    body.append('<p class="blog-az">')
    for ch in "abcdefghijklmnopqrstuvwxyz":
        cls = "" if ch in groups else ' class="is-empty"'
        body.append(f'<a href="/blog/arquivo/letra-{ch}.html"{cls}>{ch.upper()}</a>')
    body.append("</p>")
    for ch in sorted(groups):
        body.append(f'<section class="blog-section" id="letra-{esc(ch)}"><h2>{esc(ch.upper())}</h2><div class="blog-entity-cloud">')
        for ent in sorted(groups[ch], key=lambda x: fold(x["name"])):
            body.append(f'<a href="/blog/e/{esc(ent["slug"])}.html">{esc(ent["name"])} <small>{len(ent["items"])}</small></a>')
        body.append("</div></section>")
    body.append("</main>")
    body.append(_footer())
    return "".join(body)


def render_letter_page(letter: str, entities: list[dict[str, Any]]) -> str:
    rows = [e for e in entities if letter_of(e["name"]) == letter]
    body = [_chrome(f"Letra {letter.upper()} | Blog Passport Radio", f"Entidades com a letra {letter.upper()}.", SITE + f"/blog/arquivo/letra-{letter}.html")]
    body.append(f'<main class="blog-page"><span class="blog-kicker">A–Z</span><h1>Letra {esc(letter.upper())}</h1>')
    if not rows:
        body.append('<p class="blog-empty">Ainda não há entidades publicadas nesta letra.</p>')
    else:
        body.append('<div class="blog-entity-cloud">')
        for ent in sorted(rows, key=lambda x: fold(x["name"])):
            body.append(f'<a href="/blog/e/{esc(ent["slug"])}.html">{esc(ent["name"])} <small>{len(ent["items"])}</small></a>')
        body.append("</div>")
    body.append("</main>")
    body.append(_footer())
    return "".join(body)


def render_submit_page() -> str:
    body = [_chrome("Envie sua história | Passport Radio", "Leitor vira testemunha. Testemunha vira acervo. Conta Passport obrigatória para enviar.", SITE + "/blog/envie-sua-historia.html")]
    body.append('''<main class="blog-page blog-submit-page">
<span class="blog-kicker">COMUNIDADE · ACERVO</span>
<h1>Envie sua história</h1>
<p class="blog-intro">Não começamos caçando autores. Começamos capturando testemunhas. Você estava num show, tocou numa banda, tem um flyer, uma fita, uma foto, um nome que falta? A redação decide o destino. Envio não garante publicação.</p>
<section class="blog-submit" data-blog-submit="1">
<p class="blog-discussion__status">Carregando a Conta Passport…</p>
</section>
<p class="blog-submit-note">Pauta comercial e anúncio continuam em <a href="/anuncie.html">Anuncie</a> e <a href="/divulgar-bandas.html">Envie sua pauta</a>. Aqui o caminho é editorial: testemunha → colaborador → autor.</p>
</main>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2" defer></script>
<script src="/js/passport-blog-submit.js?v=20260918r" defer></script>
''')
    body.append(_footer())
    return "".join(body)


def render_entity_page_placeholder_keep() -> None:
    return None


def write_surfaces(catalog: list[dict[str, Any]] | None = None) -> dict[str, Any]:
    items = catalog if catalog is not None else load_catalog()
    build_search_shards(items)
    try:
        from editorial_blog_store import write_store_index
        store_meta = write_store_index()
    except Exception as exc:
        store_meta = {"error": f"{type(exc).__name__}: {exc}"}
    (ROOT / "blog.html").write_text(render_cover(items), "utf-8")
    busca = ROOT / "blog" / "busca.html"
    busca.parent.mkdir(parents=True, exist_ok=True)
    busca.write_text(render_search_page(), "utf-8")
    (ROOT / "blog" / "envie-sua-historia.html").write_text(render_submit_page(), "utf-8")
    ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)
    page1, pages = render_archive_page(items, 1)
    (ARCHIVE_DIR / "index.html").write_text(page1, "utf-8")
    for n in range(2, pages + 1):
        html_page, _ = render_archive_page(items, n)
        (ARCHIVE_DIR / f"p{n}.html").write_text(html_page, "utf-8")
    for stale in ARCHIVE_DIR.glob("p*.html"):
        num = re.sub(r"\D", "", stale.stem)
        if num.isdigit() and int(num) > pages:
            stale.unlink()
    ENTITY_DIR.mkdir(parents=True, exist_ok=True)
    wanted = set()
    entity_slots = entity_pages(items)
    for slot in entity_slots:
        path = ENTITY_DIR / f"{slot['slug']}.html"
        path.write_text(render_entity_page(slot), "utf-8")
        wanted.add(path.name)
    for stale in ENTITY_DIR.glob("*.html"):
        if stale.name not in wanted:
            stale.unlink()
    author_dir = ROOT / "blog" / "a"
    author_dir.mkdir(parents=True, exist_ok=True)
    author_slots = author_pages(items)
    wanted_authors = set()
    for slot in author_slots:
        path = author_dir / f"{slot['slug']}.html"
        path.write_text(render_author_page(slot), "utf-8")
        wanted_authors.add(path.name)
    for stale in author_dir.glob("*.html"):
        if stale.name not in wanted_authors:
            stale.unlink()
    (ARCHIVE_DIR / "letras.html").write_text(render_az_hub(entity_slots), "utf-8")
    for ch in "abcdefghijklmnopqrstuvwxyz":
        (ARCHIVE_DIR / f"letra-{ch}.html").write_text(render_letter_page(ch, entity_slots), "utf-8")
    (ARCHIVE_DIR / "autores.html").write_text(render_index_list(
        "Autores", "ACERVO · AUTORES",
        "Quem assina o acervo publicado. Mr. Nomad só aparece no que é de Mr. Nomad.",
        [(f"/blog/a/{a['slug']}.html", a["name"], str(len(a["items"]))) for a in author_slots],
        "/blog/arquivo/autores.html",
    ), "utf-8")
    country_counts: dict[str, int] = {}
    for item in items:
        name = clean(item.get("country") or "")
        if name:
            country_counts[name] = country_counts.get(name, 0) + 1
    (ARCHIVE_DIR / "paises.html").write_text(render_index_list(
        "Países", "ACERVO · PAÍSES",
        "Cenas e origens quando a matéria carrega o dado.",
        [(f"/blog/arquivo/?pais={slugify(n)}", n, str(c)) for n, c in sorted(country_counts.items())],
        "/blog/arquivo/paises.html",
    ), "utf-8")
    family_counts: dict[str, int] = {}
    for item in items:
        fam = item.get("family") or family_of(item)
        family_counts[fam] = family_counts.get(fam, 0) + 1
    (ARCHIVE_DIR / "formatos.html").write_text(render_index_list(
        "Formatos", "ACERVO · FORMATOS",
        "Histórias, discos, shows, entrevistas, cultura. Sem categoria vazia.",
        [(f"/blog/arquivo/?fam={k}", FAMILY_LABEL.get(k, k), str(v)) for k, v in family_counts.items() if v],
        "/blog/arquivo/formatos.html",
    ), "utf-8")
    decade_counts: dict[str, int] = {}
    for item in items:
        for dec in (item.get("decades_covered") or [item.get("decade") or ""]):
            if dec:
                decade_counts[str(dec)] = decade_counts.get(str(dec), 0) + 1
    (ARCHIVE_DIR / "epocas.html").write_text(render_index_list(
        "Épocas", "ACERVO · ÉPOCAS",
        "Década do acontecimento, não da data de publicação.",
        [(f"/blog/arquivo/?dec={d}", f"{d}s", str(c)) for d, c in sorted(decade_counts.items(), reverse=True)],
        "/blog/arquivo/epocas.html",
    ), "utf-8")
    (ARCHIVE_DIR / "temas.html").write_text(render_index_list(
        "Temas", "ACERVO · TEMAS",
        "Assuntos, artistas e obras que abrem outras matérias.",
        [(f"/blog/e/{s['slug']}.html", s["name"], str(len(s["items"]))) for s in entity_slots],
        "/blog/arquivo/temas.html",
    ), "utf-8")
    year_counts: dict[str, int] = {}
    for item in items:
        for year in item.get("event_years") or []:
            year_counts[str(year)] = year_counts.get(str(year), 0) + 1
        pub = str(item.get("published_at") or "")[:4]
        if pub.isdigit() and pub not in year_counts:
            year_counts[pub] = year_counts.get(pub, 0)
    (ARCHIVE_DIR / "agenda.html").write_text(render_index_list(
        "Agenda do acervo", "ACERVO · TEMPO",
        "Anos do acontecimento quando a matéria carrega o dado. Não é calendário de shows inventado.",
        [(f"/blog/arquivo/?ano={y}", y, str(c)) for y, c in sorted(year_counts.items(), reverse=True) if c],
        "/blog/arquivo/agenda.html",
    ), "utf-8")
    write_blog_sitemaps(items, entity_slots, pages, author_slots)
    return {
        "catalog": len(items),
        "archive_pages": pages,
        "entities": len(entity_slots),
        "authors": len(author_slots),
        "search_shards": max(1, math.ceil(len(items) / SHARD_SIZE) if items else 1),
        "store": store_meta,
    }


def write_blog_sitemaps(catalog: list[dict[str, Any]], entities: list[dict[str, Any]], archive_pages: int, authors: list[dict[str, Any]] | None = None) -> None:
    dest = ROOT / "sitemap-blog.xml"
    urls = [
        ("/blog.html", "daily", "1.0"),
        ("/blog/busca.html", "daily", "0.6"),
        ("/blog/arquivo/", "daily", "0.7"),
        ("/blog/arquivo/letras.html", "weekly", "0.6"),
        ("/blog/arquivo/autores.html", "weekly", "0.6"),
        ("/blog/arquivo/paises.html", "weekly", "0.5"),
        ("/blog/arquivo/formatos.html", "weekly", "0.5"),
        ("/blog/arquivo/epocas.html", "weekly", "0.5"),
        ("/blog/arquivo/temas.html", "weekly", "0.5"),
        ("/blog/arquivo/agenda.html", "weekly", "0.5"),
        ("/blog/envie-sua-historia.html", "weekly", "0.7"),
    ]
    for n in range(2, archive_pages + 1):
        urls.append((f"/blog/arquivo/p{n}.html", "weekly", "0.5"))
    for ch in "abcdefghijklmnopqrstuvwxyz":
        urls.append((f"/blog/arquivo/letra-{ch}.html", "weekly", "0.4"))
    for item in catalog:
        urls.append((item["url"], "weekly", "0.8"))
    for slot in entities:
        urls.append((f"/blog/e/{slot['slug']}.html", "weekly", "0.5"))
    for slot in authors or []:
        urls.append((f"/blog/a/{slot['slug']}.html", "weekly", "0.5"))
    chunks = [urls[i:i + 40000] for i in range(0, len(urls), 40000)] or [[]]
    if len(chunks) == 1:
        dest.write_text(_urlset(chunks[0]), "utf-8")
        index_loc = "/sitemap-blog.xml"
    else:
        members = []
        for idx, chunk in enumerate(chunks, 1):
            name = f"sitemap-blog-{idx}.xml"
            (ROOT / name).write_text(_urlset(chunk), "utf-8")
            members.append(SITE + "/" + name)
        dest.write_text(_sitemap_index(members), "utf-8")
        index_loc = "/sitemap-blog.xml"
    robots = ROOT / "robots.txt"
    text = robots.read_text("utf-8") if robots.exists() else "User-agent: *\nAllow: /\n"
    line = f"Sitemap: {SITE}{index_loc}"
    if line not in text:
        if not text.endswith("\n"):
            text += "\n"
        text += line + "\n"
        robots.write_text(text, "utf-8")


def _urlset(rows: list[tuple[str, str, str]]) -> str:
    parts = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    seen = set()
    for loc, freq, pri in rows:
        if loc in seen:
            continue
        seen.add(loc)
        abs_url = loc if str(loc).startswith("http") else SITE + loc
        parts.append(f"<url><loc>{esc(abs_url)}</loc><changefreq>{freq}</changefreq><priority>{pri}</priority></url>")
    parts.append("</urlset>")
    return "\n".join(parts) + "\n"


def _sitemap_index(locs: list[str]) -> str:
    parts = ['<?xml version="1.0" encoding="UTF-8"?>', '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for loc in locs:
        parts.append(f"<sitemap><loc>{esc(loc)}</loc></sitemap>")
    parts.append("</sitemapindex>")
    return "\n".join(parts) + "\n"


def ping_indexnow(urls: list[str]) -> dict[str, Any]:
    key_path = ROOT / "data" / "indexnow.key"
    if not key_path.exists():
        return {"status": "skipped", "reason": "no_indexnow_key"}
    key = key_path.read_text("utf-8").strip()
    if not key:
        return {"status": "skipped", "reason": "empty_key"}
    payload = {
        "host": "passportradio.online",
        "key": key,
        "keyLocation": f"{SITE}/{key}.txt",
        "urlList": [(u if u.startswith("http") else SITE + u) for u in urls[:100]],
    }
    try:
        import urllib.request
        req = urllib.request.Request(
            "https://api.indexnow.org/indexnow",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json; charset=utf-8"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=12) as resp:
            return {"status": "ok", "http": getattr(resp, "status", 200), "count": len(payload["urlList"])}
    except Exception as exc:
        return {"status": "error", "error": f"{type(exc).__name__}: {exc}"}
