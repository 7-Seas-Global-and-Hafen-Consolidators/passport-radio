#!/usr/bin/env python3
"""Passport Blog Tunnel™ — media resolver.

Detects images and platform video embeds from source HTML, stores reusable
library records, and never downloads video files. Absence of media does not
block a story. Live performance videos are preferred when the page actually
contains a suitable embed or link.
"""
from __future__ import annotations

import hashlib
import html
import re
from html.parser import HTMLParser
from typing import Any
from urllib.parse import parse_qs, urljoin, urlparse

try:
    import newsroom_editorial_confidence as media_confidence
except Exception:  # pragma: no cover - optional mill helper
    media_confidence = None

SKIP_IMAGE = re.compile(
    r"(sprite|logo|icon|pixel|tracking|1x1|spacer|badge|avatar|favicon|gravatar|"
    r"advert|adservice|doubleclick|facebook\.com/tr|googletag)",
    re.I,
)
YOUTUBE_ID = re.compile(
    r"(?:youtube(?:-nocookie)?\.com/(?:embed/|shorts/|watch\?.*?v=)|youtu\.be/)([A-Za-z0-9_-]{11})",
    re.I,
)
VIMEO_ID = re.compile(r"vimeo\.com/(?:video/)?(\d+)", re.I)
LIVE_HINT = re.compile(
    r"\b(live|ao vivo|concert|concerto|full show|live at|performance|stadium|arena)\b",
    re.I,
)
OUTLET_NEEDLES = ("whiplash", "metal hammer", "metal-hammer", "loudersound")


def clean(value: Any) -> str:
    return re.sub(r"\s+", " ", html.unescape(str(value or ""))).strip()


def media_id(kind: str, url: str) -> str:
    digest = hashlib.sha256((url or "").strip().lower().encode("utf-8")).hexdigest()[:16]
    return f"{kind}:{digest}"


def _abs(url: str, base: str) -> str:
    url = clean(url)
    if not url or url.startswith("data:"):
        return ""
    if url.startswith("//"):
        url = "https:" + url
    if base and not url.startswith(("http://", "https://")):
        url = urljoin(base, url)
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"}:
        return ""
    return url


def youtube_id(url: str) -> str:
    match = YOUTUBE_ID.search(url or "")
    if match:
        return match.group(1)
    parsed = urlparse(url or "")
    if "youtube" in (parsed.netloc or "").lower():
        return (parse_qs(parsed.query).get("v") or [""])[0]
    return ""


def vimeo_id(url: str) -> str:
    match = VIMEO_ID.search(url or "")
    return match.group(1) if match else ""


class _MediaParser(HTMLParser):
    def __init__(self, base: str) -> None:
        super().__init__(convert_charrefs=True)
        self.base = base
        self.skip = 0
        self.in_caption = 0
        self.og_image = ""
        self.images: list[dict[str, str]] = []
        self.embeds: list[dict[str, str]] = []
        self._pending_img: dict[str, str] | None = None
        self._caption: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        tag = tag.lower()
        data = {str(k).lower(): (v or "") for k, v in attrs}
        if tag in {"script", "style", "noscript", "svg", "nav", "footer", "form"}:
            self.skip += 1
            return
        if self.skip:
            return
        if tag == "meta":
            prop = (data.get("property") or data.get("name") or "").lower()
            if prop in {"og:image", "og:image:url", "twitter:image", "twitter:image:src"} and not self.og_image:
                self.og_image = _abs(data.get("content", ""), self.base)
            return
        if tag == "img":
            src = _abs(data.get("src") or data.get("data-src") or data.get("data-lazy-src"), self.base)
            if src and not SKIP_IMAGE.search(src):
                self._pending_img = {
                    "url": src,
                    "alt": clean(data.get("alt")),
                    "credit": "",
                }
                self.images.append(self._pending_img)
            return
        if tag in {"figcaption", "small"}:
            self.in_caption += 1
            return
        if tag == "iframe":
            src = _abs(data.get("src"), self.base)
            if src:
                self.embeds.append({"url": src, "title": clean(data.get("title"))})
            return
        if tag == "a":
            href = _abs(data.get("href"), self.base)
            if href and (youtube_id(href) or vimeo_id(href)):
                self.embeds.append({"url": href, "title": clean(data.get("title"))})

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        if tag in {"script", "style", "noscript", "svg", "nav", "footer", "form"} and self.skip:
            self.skip -= 1
        if tag in {"figcaption", "small"} and self.in_caption:
            self.in_caption -= 1
            caption = clean(" ".join(self._caption))
            self._caption = []
            if caption and self._pending_img and not self._pending_img.get("credit"):
                self._pending_img["credit"] = caption[:240]

    def handle_data(self, data: str) -> None:
        if self.skip:
            return
        if self.in_caption:
            self._caption.append(data)


def _public_credit(raw: str) -> str:
    text = clean(raw)
    if not text:
        return ""
    low = text.lower()
    for needle in OUTLET_NEEDLES:
        if needle in low:
            return ""
    text = re.sub(r"^(foto|photo|bild|image|crédito|credito|credit)\s*[:|-]\s*", "", text, flags=re.I)
    return text[:160]


def _public_alt(raw: str, fallback: str) -> str:
    text = clean(raw)
    low = text.lower()
    for needle in OUTLET_NEEDLES:
        if needle in low:
            return clean(fallback)[:160]
    return (text or clean(fallback))[:160]


def _video_record(url: str, title: str, source_url: str) -> dict[str, Any] | None:
    yid = youtube_id(url)
    vid = vimeo_id(url)
    if yid:
        platform = "youtube"
        embed = f"https://www.youtube-nocookie.com/embed/{yid}"
        watch = f"https://www.youtube.com/watch?v={yid}"
        ident = yid
    elif vid:
        platform = "vimeo"
        embed = f"https://player.vimeo.com/video/{vid}"
        watch = f"https://vimeo.com/{vid}"
        ident = vid
    else:
        return None
    live = bool(LIVE_HINT.search(f"{title} {url}"))
    return {
        "id": media_id("video", watch),
        "kind": "video",
        "platform": platform,
        "platform_id": ident,
        "url": watch,
        "embed_url": embed,
        "title": title,
        "source_page": source_url,
        "live_performance": live,
        "download": False,
        "hosted_copy": False,
    }


def _score_video(record: dict[str, Any], article: dict[str, Any]) -> float:
    score = 0.35
    if record.get("live_performance"):
        score += 0.40
    if media_confidence is not None:
        try:
            verdict = media_confidence.evaluate(
                {
                    "title": record.get("title") or "",
                    "channel": record.get("platform") or "",
                    "published_at": "",
                    "description": "",
                },
                {
                    "title": article.get("title") or "",
                    "deck": article.get("deck") or "",
                    "published_at": article.get("published") or article.get("published_at") or "",
                    "entities": article.get("entities") or [],
                    "_article_context": article.get("description") or "",
                },
            )
            score = max(score, float(verdict.get("confidence") or 0) * 0.01 + float(verdict.get("media_priority") or 0) * 0.1)
            if verdict.get("media_class") in {"live", "concert", "performance"}:
                record["live_performance"] = True
                score += 0.2
        except Exception:
            pass
    return score


def resolve_media(html_text: str, source_url: str, article: dict[str, Any] | None = None) -> dict[str, Any]:
    article = article or {}
    parser = _MediaParser(source_url)
    try:
        parser.feed(html_text or "")
    except Exception:
        pass
    photos: list[dict[str, Any]] = []
    seen: set[str] = set()
    ordered = []
    if parser.og_image:
        ordered.append({"url": parser.og_image, "alt": clean(article.get("title")), "credit": ""})
    ordered.extend(parser.images)
    for img in ordered:
        url = img.get("url") or ""
        if not url or url in seen or SKIP_IMAGE.search(url):
            continue
        seen.add(url)
        photos.append({
            "id": media_id("photo", url),
            "kind": "photo",
            "url": url,
            "alt": _public_alt(img.get("alt") or "", article.get("title") or ""),
            "credit": _public_credit(img.get("credit") or ""),
            "source_page": source_url,
            "origin_url": url,
        })
    videos: list[dict[str, Any]] = []
    seen_v: set[str] = set()
    for emb in parser.embeds:
        record = _video_record(emb.get("url") or "", emb.get("title") or "", source_url)
        if not record or record["id"] in seen_v:
            continue
        seen_v.add(record["id"])
        record["score"] = _score_video(record, article)
        videos.append(record)
    videos.sort(key=lambda x: (x.get("live_performance"), x.get("score") or 0), reverse=True)
    return {
        "photos": photos[:8],
        "videos": videos[:4],
        "hero_photo": photos[0] if photos else None,
        "hero_video": videos[0] if videos else None,
    }


def upsert_library(library: dict[str, Any], records: list[dict[str, Any]], entities: list[str]) -> dict[str, Any]:
    items = list(library.get("items") or [])
    by_id = {str(x.get("id")): x for x in items if isinstance(x, dict) and x.get("id")}
    for record in records:
        if not isinstance(record, dict) or not record.get("id"):
            continue
        current = by_id.get(record["id"]) or dict(record)
        linked = list(current.get("entities") or [])
        for ent in entities:
            name = clean(ent)
            if name and name not in linked:
                linked.append(name)
        current.update({k: v for k, v in record.items() if k != "entities"})
        current["entities"] = linked[:16]
        by_id[record["id"]] = current
    library["items"] = list(by_id.values())
    return library


def library_payload(resolved: dict[str, Any]) -> list[dict[str, Any]]:
    rows = []
    rows.extend(resolved.get("photos") or [])
    rows.extend(resolved.get("videos") or [])
    return rows
