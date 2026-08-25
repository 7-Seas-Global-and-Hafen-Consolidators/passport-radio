#!/usr/bin/env python3
"""
Passport Editorial Tunnel™
---------------------------
Private editorial discovery/ranking pipeline for Passport Radio.

What it does:
- visits configured music outlets/sections;
- discovers recent article URLs from their public landing pages;
- fetches article metadata only (headline, summary, date, author, image);
- deduplicates the same story appearing in multiple places;
- filters stories already covered by Passport HTML;
- scores trend / Passport fit / archive value;
- selects a balanced Top 20 editorial queue;
- writes JSON + Markdown outputs for GitHub Actions artifacts.

It does NOT publish or alter Passport pages.
"""

from __future__ import annotations

import argparse
import concurrent.futures as futures
import dataclasses
import datetime as dt
import html
from html.parser import HTMLParser
import json
import math
import os
from pathlib import Path
import re
import ssl
import sys
import time
from difflib import SequenceMatcher
from typing import Any, Iterable
from urllib.parse import urljoin, urlparse, urlunparse
from urllib.request import Request, urlopen

USER_AGENT = "PassportEditorialTunnel/1.0 (+https://www.passportradio.online/)"
MAX_BYTES = 2_500_000
DEFAULT_TIMEOUT = 12
STOPWORDS = {
    "a","an","and","are","as","at","be","been","but","by","de","da","das","do","dos",
    "e","em","for","from","in","is","it","la","le","na","nas","no","nos","o","of","on",
    "or","os","para","por","que","the","to","um","uma","with","you","your","se","sua",
    "seu","sobre","com","como","ao","aos","this","that","after","before","new","news"
}
REJECT_PATH_PARTS = (
    "/tag/","/tags/","/author/","/authors/","/category/","/categories/","/search",
    "/about","/contact","/privacy","/terms","/cookies","/newsletter","/subscribe",
    "/account","/login","/register","/shop","/store","/cart","/advert","/jobs",
    "/sitemap","/feed","/rss","/amp/"
)
REJECT_EXTENSIONS = (
    ".jpg",".jpeg",".png",".gif",".webp",".svg",".mp3",".wav",".flac",".mp4",
    ".mov",".avi",".pdf",".zip",".xml",".json",".css",".js"
)

TREND_WORDS = {
    "announces": 12, "announce": 10, "announced": 10, "reveals": 11, "reveal": 9,
    "returns": 12, "return": 9, "reunion": 15, "tour": 10, "festival": 8,
    "single": 7, "album": 8, "new song": 10, "new music": 10, "live": 5,
    "dies": 18, "dead": 18, "death": 16, "tribute": 9, "exclusive": 7,
    "confirms": 10, "confirmed": 9, "breaks silence": 12, "first": 5,
    "anuncia": 12, "anunciou": 10, "revela": 11, "revelou": 10, "retorna": 12,
    "volta": 10, "turnê": 10, "turne": 10, "festival": 8, "single": 7,
    "álbum": 8, "album": 8, "morre": 18, "morreu": 18, "homenagem": 9,
    "confirma": 10, "confirmou": 9, "lança": 9, "lanca": 9, "lançamento": 9,
}
ARCHIVE_WORDS = {
    "anniversary": 18, "years ago": 15, "history": 18, "story behind": 20,
    "behind the": 13, "influence": 18, "inspired": 16, "legacy": 18, "remember": 14,
    "classic": 8, "making of": 20, "oral history": 22, "archive": 18,
    "anos": 10, "aniversário": 18, "aniversario": 18, "história": 18, "historia": 18,
    "por trás": 20, "influência": 18, "influencia": 18, "inspirou": 16,
    "legado": 18, "relembre": 14, "clássico": 8, "classico": 8, "bastidores": 18,
}
NEGATIVE_WORDS = {
    "horoscope": 30, "lottery": 30, "recipe": 30, "fashion": 18, "beauty": 18,
    "celebrity": 12, "streaming deal": 10, "sponsored": 40, "shopping": 30,
    "horóscopo": 30, "horoscopo": 30, "receita": 30, "moda": 15, "beleza": 15,
    "patrocinado": 40, "compras": 25,
}
CATEGORY_KEYWORDS = {
    "metal": (
        "metal","maiden","priest","sabbath","ozzy","slayer","megadeth","metallica",
        "sepultura","death metal","black metal","power metal","thrash","doom"
    ),
    "classic_rock": (
        "classic rock","zeppelin","deep purple","ac/dc","queen","stones","beatles","who",
        "aerosmith","fleetwood","pink floyd","rush","scorpions","van halen"
    ),
    "prog": ("prog","progressive","genesis","yes","marillion","porcupine","dream theater","tool"),
    "alternative_gothic": (
        "goth","gothic","alternative","post-punk","the cure","siouxsie","bauhaus",
        "depeche mode","new order","evanescence","within temptation","nightwish","trip-hop",
        "portishead","massive attack","industrial"
    ),
    "pop_poprock": (
        "pop","pop rock","duran duran","tears for fears","paramore","coldplay","u2",
        "miley","lady gaga","dua lipa","billie eilish","madonna","prince","george michael"
    ),
    "indie": ("indie","shoegaze","britpop","alternative rock","indie rock"),
    "soul": ("soul","r&b","motown","funk","james brown","aretha","stevie wonder","marvin gaye"),
    "brasil": (
        "brasil","brasileir","mpb","rock nacional","pitty","sepultura","angra","titãs","titas",
        "paralamas","legião","legiao","rita lee","raul seixas","mutantes"
    ),
    "instruments": (
        "guitar","guitarra","bass","baixo","drum","bateria","keyboard","teclado","amp",
        "amplifier","pedal","fender","gibson","ibanez","marshall"
    ),
    "live_industry": ("concert","show","festival","tour","venue","tickets","live","turnê","turne"),
    "legacy_archive": (
        "anniversary","history","legacy","classic","archive","making of","anos","história",
        "historia","aniversário","aniversario","legado","relembre"
    ),
}

CATEGORY_QUOTAS = {
    "metal": 4,
    "classic_rock": 3,
    "alternative_gothic": 3,
    "pop_poprock": 3,
    "brasil": 2,
    "prog": 1,
    "indie": 1,
    "soul": 1,
    "instruments": 1,
    "legacy_archive": 1,
}


@dataclasses.dataclass
class Article:
    title: str
    url: str
    source_name: str
    source_domain: str
    source_priority: int
    source_categories: list[str]
    language: str = ""
    description: str = ""
    author: str = ""
    image: str = ""
    published: str = ""
    discovered_at: str = ""
    age_hours: float | None = None
    primary_category: str = ""
    categories: list[str] = dataclasses.field(default_factory=list)
    trend_score: int = 0
    passport_score: int = 0
    archive_score: int = 0
    total_score: int = 0
    origins: list[dict[str, str]] = dataclasses.field(default_factory=list)
    already_covered: bool = False


class LandingParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.links: list[tuple[str, str]] = []
        self._href: str | None = None
        self._buf: list[str] = []
        self._skip_depth = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_d = dict(attrs)
        if tag in {"script", "style", "noscript"}:
            self._skip_depth += 1
            return
        if tag == "a" and self._skip_depth == 0:
            self._href = attrs_d.get("href")
            self._buf = []

    def handle_endtag(self, tag: str) -> None:
        if tag in {"script", "style", "noscript"} and self._skip_depth:
            self._skip_depth -= 1
            return
        if tag == "a" and self._href is not None:
            text = clean_text(" ".join(self._buf))
            self.links.append((self._href, text))
            self._href = None
            self._buf = []

    def handle_data(self, data: str) -> None:
        if self._href is not None and self._skip_depth == 0:
            self._buf.append(data)


class MetaParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.meta: dict[str, str] = {}
        self.canonical = ""
        self.title_text = ""
        self._in_title = False
        self._title_buf: list[str] = []
        self._json_ld_depth = 0
        self._json_buf: list[str] = []
        self.json_ld: list[Any] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_d = {str(k).lower(): (v or "") for k, v in attrs}
        tag = tag.lower()
        if tag == "meta":
            key = (attrs_d.get("property") or attrs_d.get("name") or "").lower().strip()
            content = clean_text(attrs_d.get("content", ""))
            if key and content and key not in self.meta:
                self.meta[key] = content
        elif tag == "link":
            rel = attrs_d.get("rel", "").lower()
            if "canonical" in rel and attrs_d.get("href"):
                self.canonical = attrs_d["href"].strip()
        elif tag == "title":
            self._in_title = True
            self._title_buf = []
        elif tag == "script" and "application/ld+json" in attrs_d.get("type", "").lower():
            self._json_ld_depth += 1
            self._json_buf = []

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        if tag == "title" and self._in_title:
            self.title_text = clean_text(" ".join(self._title_buf))
            self._in_title = False
        elif tag == "script" and self._json_ld_depth:
            self._json_ld_depth -= 1
            raw = "".join(self._json_buf).strip()
            if raw:
                try:
                    self.json_ld.append(json.loads(raw))
                except Exception:
                    pass
            self._json_buf = []

    def handle_data(self, data: str) -> None:
        if self._in_title:
            self._title_buf.append(data)
        if self._json_ld_depth:
            self._json_buf.append(data)


def clean_text(value: str) -> str:
    value = html.unescape(value or "")
    value = re.sub(r"\s+", " ", value).strip()
    return value


def normalize_url(url: str) -> str:
    try:
        p = urlparse(url)
        scheme = "https" if p.scheme in {"http", "https"} else p.scheme
        host = p.netloc.lower()
        if host.startswith("www."):
            host = host[4:]
        path = re.sub(r"/{2,}", "/", p.path or "/")
        if path != "/" and path.endswith("/"):
            path = path[:-1]
        return urlunparse((scheme, host, path, "", "", ""))
    except Exception:
        return url


def same_site(candidate: str, domain: str) -> bool:
    host = urlparse(candidate).netloc.lower().split(":")[0]
    domain = domain.lower()
    if domain.startswith("www."):
        domain = domain[4:]
    if host.startswith("www."):
        host = host[4:]
    return host == domain or host.endswith("." + domain)


def is_articleish(url: str, text: str) -> bool:
    p = urlparse(url)
    if p.scheme not in {"http", "https"}:
        return False
    path = (p.path or "/").lower()
    if path in {"", "/"}:
        return False
    if any(path.endswith(ext) for ext in REJECT_EXTENSIONS):
        return False
    if any(part in path for part in REJECT_PATH_PARTS):
        return False
    if len(clean_text(text)) < 18:
        return False
    slug = path.strip("/").split("/")[-1]
    if len(slug) < 8:
        return False
    return True


def fetch_html(url: str, timeout: int = DEFAULT_TIMEOUT) -> tuple[str, str]:
    req = Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "text/html,application/xhtml+xml;q=0.9,*/*;q=0.5",
            "Accept-Language": "en-US,en;q=0.8,pt-BR;q=0.7,pt;q=0.6",
            "Cache-Control": "no-cache",
        },
    )
    context = ssl.create_default_context()
    with urlopen(req, timeout=timeout, context=context) as resp:
        content_type = (resp.headers.get("Content-Type") or "").lower()
        if "text/html" not in content_type and "application/xhtml+xml" not in content_type:
            raise ValueError(f"non-html content-type: {content_type}")
        data = resp.read(MAX_BYTES + 1)
        if len(data) > MAX_BYTES:
            data = data[:MAX_BYTES]
        charset = resp.headers.get_content_charset() or "utf-8"
        text = data.decode(charset, errors="replace")
        return text, resp.geturl()


def discover_links(source: dict[str, Any], per_source: int) -> tuple[list[tuple[str, str]], dict[str, Any]]:
    url = source["url"]
    health: dict[str, Any] = {
        "name": source["name"],
        "url": url,
        "ok": False,
        "discovered": 0,
        "error": "",
    }
    try:
        body, final_url = fetch_html(url)
        parser = LandingParser()
        parser.feed(body)
        seen: set[str] = set()
        out: list[tuple[str, str]] = []
        domain = source["domain"]
        for href, text in parser.links:
            absolute = urljoin(final_url, href)
            normalized = normalize_url(absolute)
            if normalized in seen:
                continue
            if not same_site(normalized, domain):
                continue
            if not is_articleish(normalized, text):
                continue
            seen.add(normalized)
            out.append((normalized, text))
            if len(out) >= per_source:
                break
        health.update(ok=True, discovered=len(out))
        return out, health
    except Exception as exc:
        health["error"] = f"{type(exc).__name__}: {exc}"[:240]
        return [], health


def walk_json_ld(node: Any) -> Iterable[dict[str, Any]]:
    if isinstance(node, dict):
        yield node
        for value in node.values():
            yield from walk_json_ld(value)
    elif isinstance(node, list):
        for item in node:
            yield from walk_json_ld(item)


def first_json_article(json_ld: list[Any]) -> dict[str, Any]:
    preferred = {"newsarticle", "article", "reportagenewsarticle", "blogposting", "review"}
    fallback: dict[str, Any] = {}
    for root in json_ld:
        for node in walk_json_ld(root):
            typ = node.get("@type")
            types = [typ] if isinstance(typ, str) else (typ or [])
            types = {str(x).lower() for x in types if x}
            if types & preferred:
                return node
            if not fallback and ("headline" in node or "datePublished" in node):
                fallback = node
    return fallback


def author_name(value: Any) -> str:
    if isinstance(value, str):
        return clean_text(value)
    if isinstance(value, dict):
        return clean_text(value.get("name", ""))
    if isinstance(value, list):
        names = [author_name(x) for x in value]
        return ", ".join(x for x in names if x)[:200]
    return ""


def parse_published(value: str) -> dt.datetime | None:
    value = clean_text(value)
    if not value:
        return None
    value = value.replace("Z", "+00:00")
    try:
        parsed = dt.datetime.fromisoformat(value)
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=dt.timezone.utc)
        return parsed.astimezone(dt.timezone.utc)
    except Exception:
        pass
    m = re.search(r"\b(20\d{2})[-/](\d{1,2})[-/](\d{1,2})\b", value)
    if m:
        try:
            return dt.datetime(int(m.group(1)), int(m.group(2)), int(m.group(3)), tzinfo=dt.timezone.utc)
        except Exception:
            return None
    return None


def fetch_article(source: dict[str, Any], url: str, anchor_text: str, now: dt.datetime) -> Article | None:
    try:
        body, final_url = fetch_html(url)
        parser = MetaParser()
        parser.feed(body)
        j = first_json_article(parser.json_ld)

        title = clean_text(
            parser.meta.get("og:title")
            or parser.meta.get("twitter:title")
            or j.get("headline", "")
            or parser.title_text
            or anchor_text
        )
        if not title or len(title) < 12:
            return None

        description = clean_text(
            parser.meta.get("og:description")
            or parser.meta.get("description")
            or parser.meta.get("twitter:description")
            or j.get("description", "")
        )[:700]

        published_raw = clean_text(
            parser.meta.get("article:published_time")
            or parser.meta.get("date")
            or parser.meta.get("datepublished")
            or j.get("datePublished", "")
            or j.get("dateCreated", "")
        )
        published_dt = parse_published(published_raw)
        age_hours: float | None = None
        if published_dt:
            age_hours = max(0.0, (now - published_dt).total_seconds() / 3600.0)

        image = clean_text(
            parser.meta.get("og:image")
            or parser.meta.get("twitter:image")
            or (j.get("image", "") if isinstance(j.get("image"), str) else "")
        )
        author = clean_text(
            parser.meta.get("author")
            or parser.meta.get("article:author")
            or author_name(j.get("author"))
        )
        canonical = parser.canonical or parser.meta.get("og:url") or final_url
        canonical = normalize_url(urljoin(final_url, canonical))

        return Article(
            title=title,
            url=canonical,
            source_name=source["name"],
            source_domain=source["domain"],
            source_priority=int(source.get("priority", 50)),
            source_categories=list(source.get("categories", [])),
            language=source.get("language", ""),
            description=description,
            author=author,
            image=image,
            published=published_dt.isoformat() if published_dt else "",
            discovered_at=now.isoformat(),
            age_hours=round(age_hours, 2) if age_hours is not None else None,
        )
    except Exception:
        return None


def tokenize(text: str) -> set[str]:
    words = re.findall(r"[a-z0-9À-ÿ']+", text.lower())
    return {w for w in words if len(w) > 2 and w not in STOPWORDS}


def title_similarity(a: str, b: str) -> float:
    ta, tb = tokenize(a), tokenize(b)
    if not ta or not tb:
        return 0.0
    jaccard = len(ta & tb) / len(ta | tb)
    seq = SequenceMatcher(None, " ".join(sorted(ta)), " ".join(sorted(tb))).ratio()
    return max(jaccard, seq * 0.9)


def load_existing_titles(root: Path) -> list[str]:
    titles: list[str] = []
    title_re = re.compile(r"<title[^>]*>(.*?)</title>", re.I | re.S)
    h1_re = re.compile(r"<h1[^>]*>(.*?)</h1>", re.I | re.S)
    tag_re = re.compile(r"<[^>]+>")
    for path in root.rglob("*.html"):
        if any(part.startswith(".") for part in path.parts):
            continue
        try:
            raw = path.read_text("utf-8", errors="ignore")[:150_000]
        except Exception:
            continue
        for regex in (title_re, h1_re):
            m = regex.search(raw)
            if m:
                title = clean_text(tag_re.sub(" ", m.group(1)))
                if len(title) > 10:
                    titles.append(title)
    return titles


def score_article(article: Article, now: dt.datetime, max_age_hours: int) -> None:
    blob = f"{article.title} {article.description}".lower()

    cats: list[str] = []
    for c in article.source_categories:
        if c not in cats:
            cats.append(c)
    for cat, kws in CATEGORY_KEYWORDS.items():
        if any(kw in blob for kw in kws) and cat not in cats:
            cats.append(cat)
    if not cats:
        cats = ["rock"]
    article.categories = cats

    primary = cats[0]
    for c in ("metal","alternative_gothic","classic_rock","prog","pop_poprock","brasil","soul","instruments","indie"):
        if c in cats and any(kw in blob for kw in CATEGORY_KEYWORDS[c]):
            primary = c
            break
    article.primary_category = primary

    if article.age_hours is None:
        recency = 42
    else:
        recency = int(max(5, 100 - 2.35 * article.age_hours))
        if article.age_hours > max_age_hours:
            recency = 0
    trend_boost = sum(weight for word, weight in TREND_WORDS.items() if word in blob)
    article.trend_score = max(0, min(100, recency + min(28, trend_boost)))

    genre_hits = 0
    for cat in article.categories:
        if cat in {"metal","classic_rock","prog","alternative_gothic","pop_poprock","indie","soul","brasil","instruments"}:
            genre_hits += 1
    negative = sum(weight for word, weight in NEGATIVE_WORDS.items() if word in blob)
    passport = int(article.source_priority * 0.72 + min(28, genre_hits * 7) - negative)
    if len(article.description) > 80:
        passport += 5
    article.passport_score = max(0, min(100, passport))

    archive_boost = sum(weight for word, weight in ARCHIVE_WORDS.items() if word in blob)
    archive_base = 30
    if "legacy_archive" in article.categories:
        archive_base += 22
    if any(c in article.categories for c in ("classic_rock","prog","alternative_gothic")):
        archive_base += 10
    article.archive_score = max(0, min(100, archive_base + min(48, archive_boost)))

    total = (
        article.trend_score * 0.38
        + article.passport_score * 0.42
        + article.archive_score * 0.20
    )
    total += min(6, max(0, len(article.categories) - 1) * 1.5)
    article.total_score = int(max(0, min(100, round(total))))


def merge_duplicates(articles: list[Article]) -> list[Article]:
    ordered = sorted(articles, key=lambda a: (a.total_score, a.source_priority), reverse=True)
    clusters: list[Article] = []
    for item in ordered:
        match: Article | None = None
        for existing in clusters:
            if title_similarity(item.title, existing.title) >= 0.62:
                match = existing
                break
        origin = {
            "source": item.source_name,
            "url": item.url,
            "published": item.published,
        }
        if match:
            if not match.origins:
                match.origins.append({
                    "source": match.source_name,
                    "url": match.url,
                    "published": match.published,
                })
            if all(x["url"] != item.url for x in match.origins):
                match.origins.append(origin)
            match.total_score = min(100, match.total_score + min(8, 2 * len(match.origins)))
        else:
            item.origins = [origin]
            clusters.append(item)
    return clusters


def already_covered(article: Article, existing_titles: list[str]) -> bool:
    for title in existing_titles:
        if title_similarity(article.title, title) >= 0.78:
            return True
    return False


def choose_daily(articles: list[Article], limit: int) -> list[Article]:
    pool = [a for a in articles if not a.already_covered and a.total_score >= 35]
    pool.sort(key=lambda a: (a.total_score, a.passport_score, a.trend_score), reverse=True)

    selected: list[Article] = []
    used_urls: set[str] = set()
    source_count: dict[str, int] = {}
    category_count: dict[str, int] = {}

    for category, quota in CATEGORY_QUOTAS.items():
        for item in pool:
            if len(selected) >= limit or category_count.get(category, 0) >= quota:
                break
            if item.url in used_urls or category not in item.categories:
                continue
            if source_count.get(item.source_name, 0) >= 3:
                continue
            selected.append(item)
            used_urls.add(item.url)
            source_count[item.source_name] = source_count.get(item.source_name, 0) + 1
            category_count[category] = category_count.get(category, 0) + 1

    for item in pool:
        if len(selected) >= limit:
            break
        if item.url in used_urls:
            continue
        if source_count.get(item.source_name, 0) >= 3:
            continue
        selected.append(item)
        used_urls.add(item.url)
        source_count[item.source_name] = source_count.get(item.source_name, 0) + 1
        category_count[item.primary_category] = category_count.get(item.primary_category, 0) + 1

    return selected[:limit]


def recommended_format(a: Article) -> str:
    blob = f"{a.title} {a.description}".lower()
    if a.archive_score >= 72 and a.total_score >= 68:
        return "MR_NOMAD"
    if "live" in blob or "concert" in blob or "show" in blob or "ao vivo" in blob:
        return "LIVE_SIGNAL"
    if a.trend_score >= 82:
        return "FLASH"
    return "STORY"


def article_to_dict(a: Article, include_internal: bool = True) -> dict[str, Any]:
    data = dataclasses.asdict(a)
    data["recommended_format"] = recommended_format(a)
    if not include_internal:
        for key in ("source_name","source_domain","source_priority","language","author","origins"):
            data.pop(key, None)
    return data


def write_markdown(path: Path, selected: list[Article], health: list[dict[str, Any]], now: dt.datetime) -> None:
    lines = [
        "# PASSPORT EDITORIAL TUNNEL™",
        "",
        f"Gerado em **{now.astimezone().strftime('%d/%m/%Y %H:%M %Z')}**.",
        "",
        f"**Fila selecionada: {len(selected)} pautas.**",
        "",
        "> Documento interno de pauta. Nada aqui é publicado automaticamente no site.",
        "",
    ]
    for idx, item in enumerate(selected, 1):
        flags = " · ".join(item.categories[:4])
        origins = len(item.origins)
        age = "data não detectada" if item.age_hours is None else f"{item.age_hours:.0f}h"
        lines.extend([
            f"## {idx:02d} · {item.title}",
            "",
            f"**Score {item.total_score}/100** · Trend {item.trend_score} · Passport {item.passport_score} · Archive {item.archive_score}",
            "",
            f"**Eixo:** {flags or item.primary_category} · **idade:** {age} · **ocorrências agrupadas:** {origins}",
            "",
            f"{item.description or '_Sem resumo detectado._'}",
            "",
        ])
    ok = sum(1 for h in health if h.get("ok"))
    lines.extend([
        "---",
        "",
        f"Fontes de entrada respondendo nesta execução: **{ok}/{len(health)}**.",
        "",
        "Falhas de origem não interrompem o túnel; elas ficam registradas no JSON de diagnóstico.",
        "",
    ])
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines), "utf-8")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--sources", default="data/editorial-sources.json")
    ap.add_argument("--output-dir", default="build/editorial-tunnel")
    ap.add_argument("--daily-limit", type=int, default=20)
    ap.add_argument("--per-source", type=int, default=4)
    ap.add_argument("--max-age-hours", type=int, default=48)
    ap.add_argument("--workers", type=int, default=8)
    args = ap.parse_args()

    now = dt.datetime.now(dt.timezone.utc)
    root = Path.cwd()
    config = json.loads(Path(args.sources).read_text("utf-8"))
    sources = config["sources"]
    per_source = max(1, min(10, args.per_source))
    max_age = max(12, min(168, args.max_age_hours))

    discovered: list[tuple[dict[str, Any], str, str]] = []
    health: list[dict[str, Any]] = []
    for source in sources:
        links, status = discover_links(source, per_source)
        health.append(status)
        for url, anchor in links:
            discovered.append((source, url, anchor))

    articles: list[Article] = []
    with futures.ThreadPoolExecutor(max_workers=max(1, min(16, args.workers))) as executor:
        jobs = [
            executor.submit(fetch_article, source, url, anchor, now)
            for source, url, anchor in discovered
        ]
        for job in futures.as_completed(jobs):
            item = job.result()
            if item:
                articles.append(item)

    existing_titles = load_existing_titles(root)
    for item in articles:
        score_article(item, now, max_age)
        if item.age_hours is not None and item.age_hours > max_age:
            item.total_score = 0
        item.already_covered = already_covered(item, existing_titles)

    clustered = merge_duplicates([a for a in articles if a.total_score > 0])
    clustered.sort(key=lambda a: (a.total_score, a.passport_score), reverse=True)
    selected = choose_daily(clustered, max(1, min(50, args.daily_limit)))

    out = Path(args.output_dir)
    out.mkdir(parents=True, exist_ok=True)

    radar_payload = {
        "generated_at": now.isoformat(),
        "source_count": len(sources),
        "source_health": health,
        "discovered_url_count": len(discovered),
        "article_metadata_count": len(articles),
        "cluster_count": len(clustered),
        "already_covered_count": sum(1 for a in clustered if a.already_covered),
        "items": [article_to_dict(a) for a in clustered[:120]],
    }
    daily_payload = {
        "generated_at": now.isoformat(),
        "target": args.daily_limit,
        "selected": [article_to_dict(a) for a in selected],
    }

    (out / "editorial-radar.json").write_text(
        json.dumps(radar_payload, ensure_ascii=False, indent=2), "utf-8"
    )
    (out / "editorial-daily.json").write_text(
        json.dumps(daily_payload, ensure_ascii=False, indent=2), "utf-8"
    )
    write_markdown(out / "editorial-queue.md", selected, health, now)

    summary = {
        "sources": len(sources),
        "healthy_sources": sum(1 for h in health if h.get("ok")),
        "discovered": len(discovered),
        "articles": len(articles),
        "clusters": len(clustered),
        "selected": len(selected),
    }
    print(json.dumps(summary, ensure_ascii=False))
    if len(selected) < min(8, args.daily_limit):
        print("warning: low editorial yield; inspect source_health in editorial-radar.json", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
