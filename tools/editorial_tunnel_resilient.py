#!/usr/bin/env python3
"""Resilient RSS/Atom fallback for the Passport Editorial Tunnel™.

The worldwide tunnel normally discovers article URLs from public landing pages.
Some publishers block generic crawlers or move section URLs while continuing to
expose public RSS/Atom feeds. This launcher keeps the existing ranking, limits,
workers and publication isolation intact, but adds a feed-first/fallback path and
uses feed metadata directly when article HTML is unavailable.
"""
from __future__ import annotations

import datetime as dt
from email.utils import parsedate_to_datetime
import html
import json
from pathlib import Path
import re
import ssl
import threading
from typing import Any
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET

# Importing the global launcher applies all worldwide scoring/selection patches
# to the base tunnel without executing base.main().
import editorial_tunnel_global  # noqa: F401
import editorial_tunnel as base

RSS_OVERRIDE_PATH = Path("data/editorial-rss-overrides.json")
RSS_TIMEOUT = 12
RSS_MAX_BYTES = 2_500_000
RSS_ACCEPT = "application/rss+xml,application/atom+xml,application/xml,text/xml;q=0.9,*/*;q=0.4"

ORIGINAL_DISCOVER_LINKS = base.discover_links
ORIGINAL_FETCH_ARTICLE = base.fetch_article

_FEED_CACHE: dict[str, dict[str, Any]] = {}
_FEED_CACHE_LOCK = threading.Lock()


def _local(tag: str) -> str:
    return str(tag or "").rsplit("}", 1)[-1].lower()


def _text(node: ET.Element | None) -> str:
    if node is None:
        return ""
    return "".join(node.itertext()).strip()


def _clean_markup(value: str) -> str:
    value = html.unescape(value or "")
    value = re.sub(r"<[^>]+>", " ", value)
    return base.clean_text(value)


def _feed_date(value: str) -> dt.datetime | None:
    value = base.clean_text(value)
    if not value:
        return None
    parsed = base.parse_published(value)
    if parsed:
        return parsed
    try:
        parsed = parsedate_to_datetime(value)
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=dt.timezone.utc)
        return parsed.astimezone(dt.timezone.utc)
    except Exception:
        return None


def _load_overrides() -> dict[str, list[str]]:
    try:
        raw = json.loads(RSS_OVERRIDE_PATH.read_text("utf-8"))
    except Exception:
        return {}
    rows = raw.get("feeds", {}) if isinstance(raw, dict) else {}
    out: dict[str, list[str]] = {}
    if not isinstance(rows, dict):
        return out
    for domain, values in rows.items():
        if isinstance(values, str):
            values = [values]
        if not isinstance(values, list):
            continue
        clean = [str(x).strip() for x in values if str(x).strip().startswith(("http://", "https://"))]
        if clean:
            out[str(domain).lower().removeprefix("www.")] = clean
    return out


RSS_OVERRIDES = _load_overrides()


def _configured_feeds(source: dict[str, Any]) -> list[str]:
    values: list[str] = []
    for key in ("feed_urls", "rss_urls", "feeds", "rss"):
        raw = source.get(key)
        if isinstance(raw, str):
            raw = [raw]
        if isinstance(raw, list):
            values.extend(str(x).strip() for x in raw if str(x).strip())
    domain = str(source.get("domain") or "").lower().removeprefix("www.")
    values.extend(RSS_OVERRIDES.get(domain, []))
    return _unique_urls(values)


def _unique_urls(values: list[str]) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for value in values:
        if not value.startswith(("http://", "https://")):
            continue
        if value in seen:
            continue
        seen.add(value)
        out.append(value)
    return out


def feed_candidates(source: dict[str, Any], include_configured: bool = True) -> list[str]:
    url = str(source.get("url") or "")
    parsed = urlparse(url)
    origin = f"{parsed.scheme or 'https'}://{parsed.netloc}" if parsed.netloc else ""
    path = (parsed.path or "/").rstrip("/")
    candidates: list[str] = []
    if include_configured:
        candidates.extend(_configured_feeds(source))
    if origin:
        if path and path != "/":
            candidates.extend([
                f"{origin}{path}/feed/",
                f"{origin}{path}/feed",
                f"{origin}{path}/rss.xml",
            ])
        candidates.extend([
            f"{origin}/feed/",
            f"{origin}/feed",
            f"{origin}/rss/",
            f"{origin}/rss.xml",
            f"{origin}/feed.xml",
            f"{origin}/atom.xml",
            f"{origin}/index.xml",
        ])
    return _unique_urls(candidates)[:12]


def _fetch_feed_document(url: str, timeout: int = RSS_TIMEOUT) -> tuple[bytes, str]:
    req = Request(
        url,
        headers={
            "User-Agent": base.USER_AGENT,
            "Accept": RSS_ACCEPT,
            "Accept-Language": base.GLOBAL_ACCEPT_LANGUAGE,
            "Cache-Control": "no-cache",
        },
    )
    context = ssl.create_default_context()
    with urlopen(req, timeout=timeout, context=context) as resp:
        data = resp.read(RSS_MAX_BYTES + 1)
        if len(data) > RSS_MAX_BYTES:
            data = data[:RSS_MAX_BYTES]
        return data, resp.geturl()


def _feed_entry_link(entry: ET.Element, feed_url: str) -> str:
    fallback = ""
    for child in list(entry):
        name = _local(child.tag)
        if name == "link":
            href = (child.attrib.get("href") or _text(child)).strip()
            rel = (child.attrib.get("rel") or "alternate").lower()
            if href and rel in {"", "alternate"}:
                return urljoin(feed_url, href)
            if href and not fallback:
                fallback = urljoin(feed_url, href)
        elif name == "guid":
            raw = _text(child)
            if raw.startswith(("http://", "https://")) and not fallback:
                fallback = raw
    return fallback


def _feed_entry_field(entry: ET.Element, names: set[str]) -> str:
    for child in entry.iter():
        if _local(child.tag) in names:
            raw = _text(child)
            if raw:
                return raw
    return ""


def _feed_entry_image(entry: ET.Element) -> str:
    for child in entry.iter():
        name = _local(child.tag)
        if name in {"thumbnail", "content", "enclosure"}:
            url = (child.attrib.get("url") or child.attrib.get("href") or "").strip()
            typ = (child.attrib.get("type") or "").lower()
            medium = (child.attrib.get("medium") or "").lower()
            if url and (name != "enclosure" or not typ or typ.startswith("image/") or medium == "image"):
                return url
    return ""


def _feed_articleish(url: str, title: str, domain: str) -> bool:
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"}:
        return False
    if not base.same_site(url, domain):
        return False
    path = (parsed.path or "/").lower()
    if path in {"", "/"}:
        return False
    if any(path.endswith(ext) for ext in base.REJECT_EXTENSIONS):
        return False
    if any(part in path for part in base.REJECT_PATH_PARTS):
        return False
    if len(base.clean_text(title)) < 12:
        return False
    return len(path.strip("/").split("/")[-1]) >= 4


def parse_feed(source: dict[str, Any], payload: bytes, feed_url: str, per_source: int) -> list[tuple[str, str]]:
    try:
        root = ET.fromstring(payload)
    except ET.ParseError as exc:
        raise ValueError(f"invalid feed XML: {exc}") from exc

    root_name = _local(root.tag)
    if root_name in {"rss", "rdf", "rdf:rdf"}:
        entries = [x for x in root.iter() if _local(x.tag) == "item"]
    elif root_name == "feed":
        entries = [x for x in root.iter() if _local(x.tag) == "entry"]
    else:
        entries = [x for x in root.iter() if _local(x.tag) in {"item", "entry"}]
    if not entries:
        raise ValueError("feed contains no item/entry elements")

    domain = str(source.get("domain") or "")
    out: list[tuple[str, str]] = []
    seen: set[str] = set()
    for entry in entries:
        title = _clean_markup(_feed_entry_field(entry, {"title"}))
        url = base.normalize_url(_feed_entry_link(entry, feed_url))
        if not url or url in seen or not _feed_articleish(url, title, domain):
            continue
        seen.add(url)
        description = _clean_markup(_feed_entry_field(entry, {"description", "summary", "content", "encoded"}))[:700]
        published_raw = _feed_entry_field(entry, {"pubdate", "published", "updated", "date"})
        author = _clean_markup(_feed_entry_field(entry, {"author", "creator"}))[:200]
        image = _feed_entry_image(entry)
        with _FEED_CACHE_LOCK:
            _FEED_CACHE[url] = {
                "title": title,
                "description": description,
                "published_raw": published_raw,
                "author": author,
                "image": image,
                "feed_url": feed_url,
            }
        out.append((url, title))
        if len(out) >= per_source:
            break
    if not out:
        raise ValueError("feed contained no usable same-site articles")
    return out


def _try_feeds(source: dict[str, Any], per_source: int, candidates: list[str]) -> tuple[list[tuple[str, str]], dict[str, Any] | None, list[str]]:
    errors: list[str] = []
    for feed_url in candidates:
        try:
            payload, final_url = _fetch_feed_document(feed_url)
            links = parse_feed(source, payload, final_url, per_source)
            status = {
                "name": source["name"],
                "url": source["url"],
                "ok": True,
                "discovered": len(links),
                "error": "",
                "method": "rss",
                "rss_url": final_url,
                "rss_attempts": len(errors) + 1,
                "fallback_used": True,
            }
            return links, status, errors
        except Exception as exc:
            errors.append(f"{feed_url} -> {type(exc).__name__}: {exc}"[:180])
    return [], None, errors


def discover_links_resilient(source: dict[str, Any], per_source: int) -> tuple[list[tuple[str, str]], dict[str, Any]]:
    preferred = _configured_feeds(source)
    if preferred:
        links, status, feed_errors = _try_feeds(source, per_source, preferred)
        if status:
            status["preferred_rss"] = True
            return links, status
    else:
        feed_errors = []

    landing_links, landing_health = ORIGINAL_DISCOVER_LINKS(source, per_source)
    if landing_health.get("ok") and landing_links:
        landing_health = dict(landing_health)
        landing_health.setdefault("method", "landing")
        landing_health.setdefault("fallback_used", False)
        return landing_links, landing_health

    preferred_set = set(preferred)
    generic = [x for x in feed_candidates(source, include_configured=False) if x not in preferred_set]
    links, status, generic_errors = _try_feeds(source, per_source, generic)
    feed_errors.extend(generic_errors)
    if status:
        status["landing_error"] = landing_health.get("error", "")
        return links, status

    failed = dict(landing_health)
    failed["method"] = "unavailable"
    failed["fallback_used"] = bool(preferred or generic)
    failed["rss_attempts"] = len(preferred) + len(generic)
    if feed_errors:
        tail = " | ".join(feed_errors[-3:])
        original = str(failed.get("error") or "landing discovery returned no usable links")
        failed["error"] = f"{original} | RSS fallback exhausted: {tail}"[:700]
    return [], failed


def _article_from_feed_cache(source: dict[str, Any], url: str, anchor_text: str, now: dt.datetime) -> base.Article | None:
    key = base.normalize_url(url)
    with _FEED_CACHE_LOCK:
        meta = dict(_FEED_CACHE.get(key) or {})
    if not meta:
        return None
    title = base.clean_text(meta.get("title") or anchor_text)
    if len(title) < 12:
        return None
    published_dt = _feed_date(str(meta.get("published_raw") or ""))
    age_hours: float | None = None
    if published_dt:
        age_hours = max(0.0, (now - published_dt).total_seconds() / 3600.0)
    return base.Article(
        title=title,
        url=key,
        source_name=source["name"],
        source_domain=source["domain"],
        source_priority=int(source.get("priority", 50)),
        source_categories=list(source.get("categories", [])),
        language=source.get("language", ""),
        description=base.clean_text(str(meta.get("description") or ""))[:700],
        author=base.clean_text(str(meta.get("author") or ""))[:200],
        image=str(meta.get("image") or ""),
        published=published_dt.isoformat() if published_dt else "",
        discovered_at=now.isoformat(),
        age_hours=round(age_hours, 2) if age_hours is not None else None,
    )


def fetch_article_resilient(source: dict[str, Any], url: str, anchor_text: str, now: dt.datetime) -> base.Article | None:
    from_feed = _article_from_feed_cache(source, url, anchor_text, now)
    if from_feed:
        return from_feed
    return ORIGINAL_FETCH_ARTICLE(source, url, anchor_text, now)


base.discover_links = discover_links_resilient
base.fetch_article = fetch_article_resilient


def main() -> int:
    return base.main()


if __name__ == "__main__":
    raise SystemExit(main())
