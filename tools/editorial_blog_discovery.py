#!/usr/bin/env python3
"""Passport Global Blog Tunnel™ — continuous discovery.

Connects entire editorial surfaces of Whiplash.Net and Metal Hammer Germany.
Discovery is separated from generation: every eligible URL is queued.
Publication cap lives in the generator, not here.

Adapters (used when the source actually exposes them):
  RSS/Atom + pagination, sitemap index/urlset, WordPress REST, HTML indexes.

Modes:
  continuous — recent window; default production path.
  backfill   — historical crawl with per-run caps; same machine, not a rewrite.

This module never writes noticias.html, Home, radio, or the old editorial feed.
"""
from __future__ import annotations

import datetime as dt
import hashlib
import html
import json
import re
import ssl
import time
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor, as_completed
from html.parser import HTMLParser
from typing import Any
from urllib.parse import parse_qsl, urlencode, urljoin, urlparse, urlunparse
from urllib.request import Request, urlopen

USER_AGENT = "PassportBlogTunnel/1.0 (+https://passportradio.online/)"
ACCEPT_LANG = "pt-BR,pt;q=1.0,de;q=0.9,en;q=0.8"
MAX_BYTES = 2_500_000
DEFAULT_TIMEOUT = 16
ALLOWED_DOMAINS = {"whiplash.net", "metal-hammer.de"}
SKIP_PATH_EXACT = {
    "/", "/news/", "/reviews/", "/konzerte/", "/festivals/", "/videos/",
    "/artists/", "/genres/", "/genre/", "/page/",
}
SKIP_PATH_PARTS = (
    "/tag/", "/tags/", "/author/", "/authors/", "/search", "/login",
    "/register/", "/shop/", "/store/", "/cart/", "/privacy", "/terms",
    "/cookies", "/account/", "/wp-admin", "/wp-login", "/feed/", "/rss/",
    "/comments/", "/amp/",
)
SKIP_EXTENSIONS = (
    ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".mp3", ".mp4",
    ".pdf", ".zip", ".css", ".js",
)
INDEX_SITEMAP_HINTS = ("artists-sitemap", "genres-sitemap", "genre-sitemap", "geo-sitemap")
EDITORIAL_SITEMAP_HINTS = (
    "post-sitemap", "news-sitemap", "reviews-sitemap",
    "asmb_concert-sitemap", "asmb_festival-sitemap", "asmb_tour-sitemap",
    "video-sitemap", "sitemap_ultimas", "sitemap_195", "sitemap.xml",
)
BRASIL_FUNK = re.compile(
    r"pancad[aã]o|baile funk|funk ostenta|funk carioca|funk melody|funk conscient|batid[aã]o",
    re.I,
)


def clean(value: Any) -> str:
    return re.sub(r"\s+", " ", html.unescape(str(value or ""))).strip()


def domain_of(url: str) -> str:
    return urlparse(url or "").netloc.lower().removeprefix("www.")


def allowed_url(url: str) -> bool:
    return domain_of(url) in ALLOWED_DOMAINS


def normalize_url(url: str) -> str:
    parsed = urlparse((url or "").strip())
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        return ""
    path = parsed.path or "/"
    if path != "/" and path.endswith("/"):
        path = path.rstrip("/")
    query = urlencode([(k, v) for k, v in parse_qsl(parsed.query, keep_blank_values=True)
                       if not k.lower().startswith(("utm_", "fbclid", "gclid", "mc_"))])
    return urlunparse((parsed.scheme, parsed.netloc.lower(), path, "", query, ""))


def _local(tag: str) -> str:
    return str(tag or "").rsplit("}", 1)[-1].lower()


def classify_format(url: str, title: str = "") -> str:
    path = urlparse(url or "").path.lower()
    blob = f"{path} {title}".lower()
    if any(x in path for x in ("/materias/entrevistas", "/interview")):
        return "interview"
    if any(x in path for x in ("/materias/cds", "/materias/dvds", "/reviews/")):
        return "review"
    if any(x in path for x in ("/materias/shows", "/konzerte/", "/asmb_concert")):
        return "show"
    if "festival" in path or "asmb_festival" in path:
        return "festival"
    if "asmb_tour" in path or "/tour" in path:
        return "tour"
    if any(x in path for x in ("/materias/curiosidades", "/materias/especial")):
        return "special"
    if "/materias/news" in path or "/news" in blob:
        return "news"
    if "/video" in path:
        return "video"
    if any(x in blob for x in ("entrevista", "interview")):
        return "interview"
    if any(x in blob for x in ("review", "resenha", "album")):
        return "review"
    return "story"


def is_editorial_url(url: str) -> bool:
    url = normalize_url(url)
    if not url or not allowed_url(url):
        return False
    parsed = urlparse(url)
    path = parsed.path or "/"
    low = path.lower()
    if low in SKIP_PATH_EXACT or low.rstrip("/") in {p.rstrip("/") for p in SKIP_PATH_EXACT}:
        return False
    if any(part in low for part in SKIP_PATH_PARTS):
        return False
    if any(low.endswith(ext) for ext in SKIP_EXTENSIONS):
        return False
    slug = low.strip("/").split("/")[-1] if low.strip("/") else ""
    if len(slug) < 4:
        return False
    if low.startswith("/artists/") or low.startswith("/genres/") or low.startswith("/genre/"):
        return False
    return True


def parse_datetime(value: str) -> dt.datetime | None:
    text = clean(value)
    if not text:
        return None
    text = text.replace("Z", "+00:00")
    try:
        parsed = dt.datetime.fromisoformat(text)
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=dt.timezone.utc)
        return parsed.astimezone(dt.timezone.utc)
    except Exception:
        pass
    for fmt in (
        "%a, %d %b %Y %H:%M:%S %z",
        "%a, %d %b %Y %H:%M:%S %Z",
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d",
        "%d.%m.%Y",
    ):
        try:
            parsed = dt.datetime.strptime(text[:32], fmt)
            if parsed.tzinfo is None:
                parsed = parsed.replace(tzinfo=dt.timezone.utc)
            return parsed.astimezone(dt.timezone.utc)
        except Exception:
            continue
    return None


class _LinkParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.links: list[tuple[str, str]] = []
        self._href = ""
        self._text: list[str] = []
        self._in_a = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag.lower() != "a":
            return
        data = {k.lower(): (v or "") for k, v in attrs}
        href = data.get("href") or ""
        if href:
            self._href = href
            self._text = []
            self._in_a = True

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() == "a" and self._in_a:
            self.links.append((self._href, clean(" ".join(self._text))))
            self._in_a = False
            self._href = ""

    def handle_data(self, data: str) -> None:
        if self._in_a:
            self._text.append(data)


def fetch_bytes(url: str, accept: str = "*/*", timeout: int = DEFAULT_TIMEOUT) -> tuple[bytes, str, int, dict[str, str]]:
    req = Request(url, headers={
        "User-Agent": USER_AGENT,
        "Accept": accept,
        "Accept-Language": ACCEPT_LANG,
        "Cache-Control": "no-cache",
    })
    ctx = ssl.create_default_context()
    with urlopen(req, timeout=timeout, context=ctx) as resp:
        raw = resp.read(MAX_BYTES + 1)
        if len(raw) > MAX_BYTES:
            raw = raw[:MAX_BYTES]
        headers = {k.lower(): v for k, v in resp.headers.items()}
        return raw, resp.geturl(), int(resp.status), headers


def fetch_text(url: str, accept: str = "*/*", timeout: int = DEFAULT_TIMEOUT) -> tuple[str, str, int, dict[str, str]]:
    raw, final, status, headers = fetch_bytes(url, accept=accept, timeout=timeout)
    charset = "utf-8"
    ctype = headers.get("content-type", "")
    match = re.search(r"charset=([^\s;]+)", ctype, flags=re.I)
    if match:
        charset = match.group(1).strip().strip('"')
    return raw.decode(charset, errors="replace"), final, status, headers


def _item(
    url: str,
    title: str,
    *,
    description: str = "",
    published: str = "",
    source: str = "",
    method: str = "",
    entities: list[str] | None = None,
    extra: dict[str, Any] | None = None,
) -> dict[str, Any] | None:
    url = normalize_url(url)
    title = clean(title)
    if not url or not is_editorial_url(url) or len(title) < 8:
        return None
    fmt = classify_format(url, title)
    row = {
        "title": title,
        "description": clean(description)[:700],
        "url": url,
        "published": published,
        "primary_category": "music",
        "format_hint": fmt,
        "entities": [clean(x) for x in (entities or []) if clean(x)][:12],
        "origins": [{
            "url": url,
            "source": source,
            "method": method,
            "format": fmt,
            "published": published,
        }],
        "total_score": 10,
    }
    if extra:
        row.update(extra)
    return row


def parse_rss(payload: bytes, feed_url: str, source_name: str) -> list[dict[str, Any]]:
    try:
        root = ET.fromstring(payload)
    except ET.ParseError as exc:
        raise ValueError(f"invalid feed XML: {exc}") from exc
    entries = [x for x in root.iter() if _local(x.tag) in {"item", "entry"}]
    out: list[dict[str, Any]] = []
    seen: set[str] = set()
    for entry in entries:
        title = ""
        link = ""
        desc = ""
        published = ""
        entities: list[str] = []
        for child in list(entry):
            name = _local(child.tag)
            text = clean("".join(child.itertext()))
            if name == "title" and not title:
                title = text
            elif name == "link":
                href = (child.attrib.get("href") or text).strip()
                rel = (child.attrib.get("rel") or "alternate").lower()
                if href and rel in {"", "alternate"}:
                    link = href
                elif href and not link:
                    link = href
            elif name == "guid" and text.startswith("http") and not link:
                link = text
            elif name in {"description", "summary", "encoded"} and not desc:
                desc = re.sub(r"<[^>]+>", " ", text)
            elif name in {"pubdate", "published", "updated", "date"} and not published:
                published = text
            elif name == "category" and text and text not in entities:
                entities.append(text)
        abs_link = urljoin(feed_url, link)
        item = _item(
            abs_link, title, description=desc, published=published,
            source=source_name, method="rss", entities=entities,
        )
        if item and item["url"] not in seen:
            seen.add(item["url"])
            out.append(item)
    return out


def rss_next_url(payload: bytes, feed_url: str, page: int) -> str:
    try:
        root = ET.fromstring(payload)
    except ET.ParseError:
        root = None
    if root is not None:
        for child in root.iter():
            if _local(child.tag) == "link" and (child.attrib.get("rel") or "").lower() == "next":
                href = (child.attrib.get("href") or "").strip()
                if href:
                    return urljoin(feed_url, href)
    parsed = urlparse(feed_url)
    qs = dict(parse_qsl(parsed.query, keep_blank_values=True))
    if "paged" in qs or parsed.path.rstrip("/").endswith("/feed"):
        qs["paged"] = str(page + 1)
        return urlunparse(parsed._replace(query=urlencode(qs)))
    return ""


def parse_sitemap(payload: bytes) -> tuple[list[str], list[dict[str, str]]]:
    try:
        root = ET.fromstring(payload)
    except ET.ParseError as exc:
        raise ValueError(f"invalid sitemap XML: {exc}") from exc
    indexes: list[str] = []
    urls: list[dict[str, str]] = []
    for node in root.iter():
        name = _local(node.tag)
        if name == "sitemap":
            loc = ""
            for child in list(node):
                if _local(child.tag) == "loc":
                    loc = clean("".join(child.itertext()))
            if loc:
                indexes.append(loc)
        elif name == "url":
            row = {"loc": "", "lastmod": ""}
            for child in list(node):
                child_name = _local(child.tag)
                text = clean("".join(child.itertext()))
                if child_name == "loc":
                    row["loc"] = text
                elif child_name == "lastmod":
                    row["lastmod"] = text
            if row["loc"]:
                urls.append(row)
        elif name == "loc" and node.text and _local(getattr(node, "tag", "")):
            pass
    if not indexes and not urls:
        for node in root.iter():
            if _local(node.tag) == "loc":
                loc = clean("".join(node.itertext()))
                if loc.endswith(".xml"):
                    indexes.append(loc)
                elif loc:
                    urls.append({"loc": loc, "lastmod": ""})
    return indexes, urls


def parse_rest_posts(payload: bytes, source_name: str) -> list[dict[str, Any]]:
    data = json.loads(payload.decode("utf-8", errors="replace"))
    if isinstance(data, dict):
        data = data.get("items") or data.get("posts") or []
    if not isinstance(data, list):
        return []
    out: list[dict[str, Any]] = []
    for row in data:
        if not isinstance(row, dict):
            continue
        title_obj = row.get("title") or {}
        title = title_obj.get("rendered") if isinstance(title_obj, dict) else title_obj
        excerpt_obj = row.get("excerpt") or {}
        excerpt = excerpt_obj.get("rendered") if isinstance(excerpt_obj, dict) else excerpt_obj
        link = str(row.get("link") or row.get("guid") or "")
        published = str(row.get("date_gmt") or row.get("date") or row.get("modified") or "")
        item = _item(
            link,
            re.sub(r"<[^>]+>", " ", str(title or "")),
            description=re.sub(r"<[^>]+>", " ", str(excerpt or "")),
            published=published,
            source=source_name,
            method="rest",
            extra={"rest_id": row.get("id"), "rest_type": row.get("type") or "post"},
        )
        if item:
            out.append(item)
    return out


def parse_html_index(payload: str, page_url: str, source_name: str, domain: str) -> list[dict[str, Any]]:
    parser = _LinkParser()
    try:
        parser.feed(payload)
    except Exception:
        return []
    out: list[dict[str, Any]] = []
    seen: set[str] = set()
    for href, text in parser.links:
        abs_url = normalize_url(urljoin(page_url, href))
        if not abs_url or domain_of(abs_url) != domain:
            continue
        item = _item(abs_url, text or abs_url.rsplit("/", 1)[-1], source=source_name, method="html_index")
        if item and item["url"] not in seen:
            seen.add(item["url"])
            out.append(item)
    return out


def _within_window(published: str, lastmod: str, cutoff: dt.datetime | None) -> bool:
    if cutoff is None:
        return True
    for raw in (published, lastmod):
        parsed = parse_datetime(raw)
        if parsed is not None:
            return parsed >= cutoff
    return True


def _looks_index_sitemap(url: str) -> bool:
    low = url.lower()
    return any(hint in low for hint in INDEX_SITEMAP_HINTS)


def _looks_editorial_sitemap(url: str) -> bool:
    low = url.lower()
    if _looks_index_sitemap(url):
        return False
    if any(hint in low for hint in EDITORIAL_SITEMAP_HINTS):
        return True
    return low.endswith("sitemap.xml") or "sitemap" in low


class SourceAdapter:
    def __init__(self, source: dict[str, Any], *, mode: str, max_age_hours: int, caps: dict[str, int]) -> None:
        self.source = source
        self.name = str(source.get("name") or source.get("domain") or "source")
        self.domain = str(source.get("domain") or "").lower().removeprefix("www.")
        self.mode = mode
        self.max_age_hours = max_age_hours
        self.caps = caps
        self.cutoff = None
        if mode == "continuous" and max_age_hours > 0:
            self.cutoff = dt.datetime.now(dt.timezone.utc) - dt.timedelta(hours=max_age_hours)

    def health_base(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "domain": self.domain,
            "ok": False,
            "methods": [],
            "discovered": 0,
            "error": "",
            "failures": [],
        }

    def discover(self) -> tuple[list[dict[str, Any]], dict[str, Any]]:
        health = self.health_base()
        items: list[dict[str, Any]] = []
        seen: set[str] = set()

        def take(batch: list[dict[str, Any]], method: str) -> None:
            kept = 0
            for item in batch:
                url = item.get("url") or ""
                if not url:
                    continue
                if not _within_window(str(item.get("published") or ""), "", self.cutoff) and method in {"rss", "rest"}:
                    if self.mode == "continuous":
                        continue
                if url in seen:
                    existing = next((x for x in items if x.get("url") == url), None)
                    if existing is not None:
                        for origin in item.get("origins") or []:
                            if origin not in (existing.get("origins") or []):
                                existing.setdefault("origins", []).append(origin)
                        for ent in item.get("entities") or []:
                            if ent not in existing.setdefault("entities", []):
                                existing["entities"].append(ent)
                        if item.get("description") and not existing.get("description"):
                            existing["description"] = item["description"]
                    kept += 1
                    continue
                seen.add(url)
                items.append(item)
                kept += 1
            if kept:
                health["methods"].append(method)
            health["discovered"] = len(items)

        try:
            take(self._from_rss(), "rss")
        except Exception as exc:
            health["failures"].append({"method": "rss", "error": f"{type(exc).__name__}: {exc}"[:240]})
        try:
            take(self._from_rest(), "rest")
        except Exception as exc:
            health["failures"].append({"method": "rest", "error": f"{type(exc).__name__}: {exc}"[:240]})
        try:
            take(self._from_sitemaps(), "sitemap")
        except Exception as exc:
            health["failures"].append({"method": "sitemap", "error": f"{type(exc).__name__}: {exc}"[:240]})
        try:
            take(self._from_html_indexes(), "html_index")
        except Exception as exc:
            health["failures"].append({"method": "html_index", "error": f"{type(exc).__name__}: {exc}"[:240]})

        cap = int(self.caps.get("max_items_per_source", 2500))
        if len(items) > cap:
            items = items[:cap]
        health["discovered"] = len(items)
        health["ok"] = bool(items) or not health["failures"]
        if items:
            health["ok"] = True
            health["error"] = ""
        elif health["failures"]:
            health["error"] = "; ".join(f["error"] for f in health["failures"][:3])
        return items, health

    def _from_rss(self) -> list[dict[str, Any]]:
        feeds = list(self.source.get("feed_urls") or [])
        pagination = str(self.source.get("rss_pagination") or "")
        pages = int(self.caps.get("rss_pages", 8 if self.mode == "continuous" else 40))
        out: list[dict[str, Any]] = []
        seen: set[str] = set()
        for feed in feeds:
            url = feed
            for page in range(1, max(1, pages) + 1):
                try:
                    raw, final, _, _ = fetch_bytes(url, accept="application/rss+xml,application/atom+xml,application/xml,text/xml;q=0.9,*/*;q=0.4")
                except Exception:
                    break
                batch = parse_rss(raw, final, self.name)
                fresh = 0
                for item in batch:
                    if item["url"] in seen:
                        continue
                    seen.add(item["url"])
                    out.append(item)
                    fresh += 1
                if not batch or (self.mode == "continuous" and fresh == 0 and page > 1):
                    break
                nxt = rss_next_url(raw, url, page)
                if pagination == "paged" and not nxt:
                    parsed = urlparse(feed)
                    qs = dict(parse_qsl(parsed.query, keep_blank_values=True))
                    qs["paged"] = str(page + 1)
                    nxt = urlunparse(parsed._replace(query=urlencode(qs)))
                if not nxt or nxt == url:
                    break
                url = nxt
                time.sleep(0.05)
        return out

    def _from_rest(self) -> list[dict[str, Any]]:
        endpoints = list(self.source.get("rest_urls") or [])
        if not endpoints:
            return []
        pages = int(self.caps.get("rest_pages_per_type", 6 if self.mode == "continuous" else 25))
        per_page = min(100, int(self.caps.get("rest_per_page", 100)))
        out: list[dict[str, Any]] = []
        seen: set[str] = set()
        after = ""
        if self.mode == "continuous" and self.cutoff is not None:
            after = self.cutoff.strftime("%Y-%m-%dT%H:%M:%S")
        for endpoint in endpoints:
            for page in range(1, max(1, pages) + 1):
                parsed = urlparse(endpoint)
                qs = dict(parse_qsl(parsed.query, keep_blank_values=True))
                qs.update({"per_page": str(per_page), "page": str(page), "orderby": "date", "order": "desc"})
                if after:
                    qs["after"] = after
                url = urlunparse(parsed._replace(query=urlencode(qs)))
                try:
                    raw, _, _, headers = fetch_bytes(url, accept="application/json")
                except Exception as exc:
                    if page == 1:
                        raise RuntimeError(f"rest {endpoint}: {type(exc).__name__}: {exc}") from exc
                    break
                batch = parse_rest_posts(raw, self.name)
                if not batch:
                    break
                for item in batch:
                    if item["url"] not in seen:
                        seen.add(item["url"])
                        out.append(item)
                total_pages = int(headers.get("x-wp-totalpages") or "0") or 0
                if page >= total_pages > 0:
                    break
                if self.mode == "continuous" and after and not batch:
                    break
                time.sleep(0.05)
        return out

    def _from_sitemaps(self) -> list[dict[str, Any]]:
        seeds = list(self.source.get("sitemaps") or [])
        if not seeds:
            return []
        files_cap = int(self.caps.get("sitemap_files", 6 if self.mode == "continuous" else 40))
        urls_cap = int(self.caps.get("sitemap_urls_per_file", 400 if self.mode == "continuous" else 2000))
        to_fetch: list[str] = []
        seen_files: set[str] = set()
        for seed in seeds:
            if seed in seen_files:
                continue
            seen_files.add(seed)
            try:
                raw, final, _, _ = fetch_bytes(seed, accept="application/xml,text/xml,*/*;q=0.8")
            except Exception as exc:
                health_note = f"sitemap_seed:{type(exc).__name__}"
                continue
            indexes, urls = parse_sitemap(raw)
            if indexes:
                for loc in indexes:
                    if _looks_index_sitemap(loc):
                        continue
                    if self.mode == "continuous" and not _looks_editorial_sitemap(loc):
                        continue
                    if loc not in seen_files:
                        to_fetch.append(loc)
            else:
                to_fetch.append(final)
            if len(to_fetch) >= files_cap:
                break
        to_fetch = to_fetch[:files_cap]
        out: list[dict[str, Any]] = []
        seen: set[str] = set()

        def load_file(url: str) -> list[dict[str, Any]]:
            raw, _, _, _ = fetch_bytes(url, accept="application/xml,text/xml,*/*;q=0.8")
            _, rows = parse_sitemap(raw)
            batch: list[dict[str, Any]] = []
            for row in rows[:urls_cap]:
                loc = row.get("loc") or ""
                lastmod = row.get("lastmod") or ""
                if self.mode == "continuous" and not _within_window("", lastmod, self.cutoff):
                    # Keep rows without lastmod; drop only those older than window.
                    if lastmod:
                        continue
                title_guess = clean(urlparse(loc).path.rstrip("/").split("/")[-1].replace("-", " "))
                item = _item(loc, title_guess or loc, published=lastmod, source=self.name, method="sitemap")
                if item:
                    batch.append(item)
            return batch

        workers = min(8, max(1, len(to_fetch)))
        if not to_fetch:
            return []
        with ThreadPoolExecutor(max_workers=workers) as pool:
            futs = {pool.submit(load_file, url): url for url in to_fetch}
            for fut in as_completed(futs):
                try:
                    batch = fut.result()
                except Exception:
                    continue
                for item in batch:
                    if item["url"] not in seen:
                        seen.add(item["url"])
                        out.append(item)
        return out

    def _from_html_indexes(self) -> list[dict[str, Any]]:
        indexes = list(self.source.get("index_urls") or [])
        if not indexes:
            return []
        pages = int(self.caps.get("html_index_pages", 2 if self.mode == "continuous" else 12))
        out: list[dict[str, Any]] = []
        seen: set[str] = set()
        for index in indexes:
            url = index
            for page in range(1, max(1, pages) + 1):
                try:
                    text, final, _, _ = fetch_text(url, accept="text/html,application/xhtml+xml;q=0.9,*/*;q=0.5")
                except Exception:
                    break
                batch = parse_html_index(text, final, self.name, self.domain)
                fresh = 0
                for item in batch:
                    if item["url"] in seen:
                        continue
                    seen.add(item["url"])
                    out.append(item)
                    fresh += 1
                if not batch:
                    break
                if page >= pages:
                    break
                # Common pagination: /page/N/ or ?page=N
                if "/page/" in url:
                    url = re.sub(r"/page/\d+/?$", f"/page/{page + 1}/", url)
                else:
                    parsed = urlparse(index)
                    if parsed.path.endswith(".html"):
                        break
                    url = url.rstrip("/") + f"/page/{page + 1}/"
                time.sleep(0.05)
                if fresh == 0:
                    break
        return out


def load_sources(path_text: str | bytes | dict[str, Any]) -> list[dict[str, Any]]:
    if isinstance(path_text, dict):
        data = path_text
    else:
        data = json.loads(path_text if isinstance(path_text, str) else path_text.decode("utf-8"))
    return [s for s in (data.get("sources") or []) if isinstance(s, dict) and s.get("domain")]


def cluster_id_for(urls: list[str], title: str) -> str:
    key = "|".join(sorted(u.strip().lower() for u in urls if u)) or clean(title).lower()
    return "CLU_" + hashlib.sha256(key.encode("utf-8")).hexdigest()[:20].upper()


def is_blocked_scope(title: str, description: str = "") -> bool:
    return bool(BRASIL_FUNK.search(f"{title} {description}"))


def discover_sources(
    sources: list[dict[str, Any]],
    *,
    mode: str = "continuous",
    max_age_hours: int = 168,
    workers: int = 2,
    caps: dict[str, int] | None = None,
) -> dict[str, Any]:
    mode = "backfill" if mode == "backfill" else "continuous"
    caps = caps or {}
    health: list[dict[str, Any]] = []
    items: list[dict[str, Any]] = []
    adapters = [SourceAdapter(src, mode=mode, max_age_hours=max_age_hours, caps=caps) for src in sources]
    with ThreadPoolExecutor(max_workers=max(1, min(workers, len(adapters) or 1))) as pool:
        futs = {pool.submit(adapter.discover): adapter for adapter in adapters}
        for fut in as_completed(futs):
            adapter = futs[fut]
            try:
                batch, row = fut.result()
            except Exception as exc:
                row = adapter.health_base()
                row["error"] = f"{type(exc).__name__}: {exc}"[:240]
                batch = []
            health.append(row)
            items.extend(batch)
    # Merge same URL across methods/sources
    by_url: dict[str, dict[str, Any]] = {}
    for item in items:
        url = item.get("url") or ""
        if not url:
            continue
        if url not in by_url:
            by_url[url] = item
            continue
        existing = by_url[url]
        for origin in item.get("origins") or []:
            if origin not in (existing.get("origins") or []):
                existing.setdefault("origins", []).append(origin)
        if item.get("title") and len(item["title"]) > len(existing.get("title") or ""):
            existing["title"] = item["title"]
        if item.get("description") and not existing.get("description"):
            existing["description"] = item["description"]
        for ent in item.get("entities") or []:
            if ent not in existing.setdefault("entities", []):
                existing["entities"].append(ent)
    merged = list(by_url.values())
    generated_at = dt.datetime.now(dt.timezone.utc).isoformat()
    return {
        "generated_at": generated_at,
        "mode": mode,
        "max_age_hours": max_age_hours,
        "source_health": health,
        "discovered_url_count": len(merged),
        "items": merged,
    }
