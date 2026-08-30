#!/usr/bin/env python3
"""Passport Newsroom™ downstream media confidence gate.

Runs AFTER Editorial Engine publication. RSS/Tunnel configuration, radio, players,
streams, Home and audio systems are outside this module's scope.

Media policy: precision over coverage. YouTube discovery evaluates multiple
candidates, records an internal audit decision and mutates an article only when
one candidate clears conservative identity/relevance/authority gates. NO_VIDEO
is a successful outcome and leaves the original article byte-for-byte intact.
"""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
import html
import json
from pathlib import Path
import re
import unicodedata
from urllib.parse import quote_plus
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
MARKER_VERSION = "3.0"
BLOCK_START = "<!-- PASSPORT_NEWSROOM_MEDIA_START:v3 -->"
BLOCK_END = "<!-- PASSPORT_NEWSROOM_MEDIA_END -->"
UA = "Mozilla/5.0 PassportNewsroom/3.0 (+https://www.passportradio.online/)"
MAX_CANDIDATES = 8
CONFIDENCE_THRESHOLD = 0.80
SCORE_THRESHOLD = 0.68
AMBIGUITY_MARGIN = 0.12

HARD_VETO_PATTERNS = {
    "reaction": r"\breact(?:ion|s|ing)?\b",
    "fan_edit": r"\bfan[ -]?edit\b|\bfancam\b",
    "ai_cover": r"\bai[ -]?cover\b|\bdeepfake\b",
    "tribute": r"\btribute\b|\btributo\b",
    "tutorial": r"\btutorial\b|\blesson\b|\bkaraoke\b|\btab(?:s)?\b",
    "sped_or_slowed": r"\bsped[ -]?up\b|\bslowed(?:\s*\+\s*reverb)?\b",
}
SOFT_PENALTY_PATTERNS = {
    "cover": r"\bcover\b",
    "review": r"\breview\b|\banalysis\b",
    "compilation": r"\bcompilation\b|\bgreatest hits\b|\bbest of\b",
    "lyrics": r"\blyric(?:s)?\b",
    "full_album": r"\bfull album\b",
}
AUTHORITY_HINTS = ("official", "vevo", "records", "recordings", "music", "festival", "npr", "kexp", "bbc")


def clean(v):
    return re.sub(r"\s+", " ", html.unescape(str(v or ""))).strip()


def norm(v: str) -> str:
    value = unicodedata.normalize("NFKD", clean(v)).encode("ascii", "ignore").decode("ascii").casefold()
    return re.sub(r"[^a-z0-9]+", " ", value).strip()


def tokens(v: str) -> set[str]:
    return {x for x in norm(v).split() if len(x) >= 3}


def fetch_json(url: str, timeout: int = 12) -> dict | None:
    req = Request(url, headers={"User-Agent": UA, "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8"})
    try:
        with urlopen(req, timeout=timeout) as r:
            if getattr(r, "status", 200) != 200:
                return None
            return json.loads(r.read(500_000).decode("utf-8", "replace"))
    except Exception:
        return None


def fetch_bytes_ok(url: str, timeout: int = 10) -> bool:
    req = Request(url, headers={"User-Agent": UA, "Range": "bytes=0-2047"})
    try:
        with urlopen(req, timeout=timeout) as r:
            ctype = str(r.headers.get("Content-Type") or "").lower()
            data = r.read(2048)
            return getattr(r, "status", 200) in (200, 206) and ctype.startswith("image/") and len(data) > 200
    except Exception:
        return False


def search_youtube_candidates(query: str, timeout: int = 15) -> list[str]:
    url = "https://www.youtube.com/results?search_query=" + quote_plus(query)
    req = Request(url, headers={"User-Agent": UA, "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8"})
    try:
        with urlopen(req, timeout=timeout) as r:
            body = r.read(2_500_000).decode("utf-8", "replace")
    except Exception:
        return []
    out = []
    seen = set()
    for video_id in re.findall(r'"videoId":"([A-Za-z0-9_-]{11})"', body):
        if video_id in seen:
            continue
        seen.add(video_id)
        out.append(video_id)
        if len(out) >= MAX_CANDIDATES:
            break
    return out


def youtube_metadata(video_id: str) -> dict | None:
    watch = f"https://www.youtube.com/watch?v={video_id}"
    data = fetch_json("https://www.youtube.com/oembed?format=json&url=" + quote_plus(watch))
    if not data or not clean(data.get("title")) or not clean(data.get("author_name")):
        return None
    return {
        "video_id": video_id,
        "title": clean(data.get("title")),
        "channel": clean(data.get("author_name")),
        "thumbnail_url": clean(data.get("thumbnail_url")),
    }


def primary_entity(item: dict) -> str:
    entities = [clean(x) for x in (item.get("entities") or []) if clean(x)]
    return entities[0] if entities else ""


def build_query(item: dict) -> str:
    entity = primary_entity(item)
    entities = [clean(x) for x in (item.get("entities") or []) if clean(x)]
    # Avoid feeding the full journalistic headline into discovery when entities exist.
    if entity:
        return " ".join([entity] + entities[1:3])
    return clean(item.get("title"))


def evaluate_candidate(meta: dict, item: dict) -> dict:
    title = meta["title"]
    channel = meta["channel"]
    joined = f"{title} {channel}"
    joined_norm = norm(joined)
    entity = primary_entity(item)
    entity_norm = norm(entity)
    article_title = clean(item.get("title"))
    article_tokens = tokens(article_title)
    video_tokens = tokens(title)

    vetoes = [name for name, pattern in HARD_VETO_PATTERNS.items() if re.search(pattern, joined_norm, re.I)]
    penalties = [name for name, pattern in SOFT_PENALTY_PATTERNS.items() if re.search(pattern, joined_norm, re.I)]

    identity = 0.0
    if entity_norm and entity_norm in norm(title):
        identity = 1.0
    elif entity_norm and entity_norm in norm(channel):
        identity = 0.92
    elif entity_norm:
        et = tokens(entity)
        identity = len(et & tokens(joined)) / max(1, len(et))

    overlap = len(article_tokens & video_tokens) / max(1, min(len(article_tokens), 8))
    relevance = min(1.0, overlap * 1.6)

    channel_norm = norm(channel)
    authority = 0.0
    if entity_norm and (entity_norm == channel_norm or entity_norm in channel_norm):
        authority = 1.0
    elif any(h in channel_norm for h in AUTHORITY_HINTS):
        authority = 0.72
    elif identity >= 0.92:
        authority = 0.55

    positive = []
    if identity >= 0.90:
        positive.append("strong_identity")
    if authority >= 0.72:
        positive.append("authority_signal")
    if relevance >= 0.35:
        positive.append("topic_overlap")

    score = 0.55 * identity + 0.30 * authority + 0.15 * relevance
    score -= 0.12 * len(penalties)
    score = max(0.0, min(1.0, score))

    # Confidence is deliberately stricter than textual score.
    completeness = 1.0 if title and channel else 0.6
    confidence = score * completeness
    if identity < 0.90:
        confidence *= 0.55
    if authority < 0.55:
        confidence *= 0.65
    if penalties:
        confidence *= max(0.35, 1.0 - 0.18 * len(penalties))
    if vetoes:
        confidence = 0.0

    return {
        **meta,
        "identity": round(identity, 4),
        "authority": round(authority, 4),
        "relevance": round(relevance, 4),
        "score": round(score, 4),
        "confidence": round(max(0.0, min(1.0, confidence)), 4),
        "positive_matches": positive,
        "penalties": penalties,
        "vetoes": vetoes,
    }


def choose_video(item: dict) -> dict:
    query = build_query(item)
    decision = {"query": query, "candidates": [], "selected_video": None, "score": 0.0, "confidence": 0.0,
                "positive_matches": [], "penalties": [], "reason_selected": "", "reason_rejected": ""}
    if not primary_entity(item):
        decision["reason_rejected"] = "missing_specific_entity"
        return decision

    ids = search_youtube_candidates(query)
    if not ids:
        decision["reason_rejected"] = "no_candidates"
        return decision

    evaluated = []
    for video_id in ids:
        meta = youtube_metadata(video_id)
        if not meta:
            evaluated.append({"video_id": video_id, "vetoes": ["oembed_unavailable"], "score": 0.0, "confidence": 0.0})
            continue
        evaluated.append(evaluate_candidate(meta, item))
    decision["candidates"] = evaluated

    viable = [c for c in evaluated if not c.get("vetoes")]
    viable.sort(key=lambda c: (c.get("confidence", 0), c.get("score", 0)), reverse=True)
    if not viable:
        decision["reason_rejected"] = "all_candidates_vetoed"
        return decision

    top = viable[0]
    runner = viable[1] if len(viable) > 1 else None
    margin = top["confidence"] - (runner["confidence"] if runner else 0.0)
    decision.update({"score": top["score"], "confidence": top["confidence"],
                     "positive_matches": top.get("positive_matches", []), "penalties": top.get("penalties", [])})

    if top["score"] < SCORE_THRESHOLD:
        decision["reason_rejected"] = "score_below_threshold"
        return decision
    if top["confidence"] < CONFIDENCE_THRESHOLD:
        decision["reason_rejected"] = "confidence_below_threshold"
        return decision
    if runner and margin < AMBIGUITY_MARGIN:
        decision["reason_rejected"] = "ambiguous_top_candidates"
        return decision

    # Validate a real thumbnail before accepting the media candidate. We do not
    # replace article OG/Twitter imagery in this safety operation.
    thumb = top.get("thumbnail_url") or f"https://i.ytimg.com/vi/{top['video_id']}/hqdefault.jpg"
    if not fetch_bytes_ok(thumb):
        decision["reason_rejected"] = "thumbnail_unavailable"
        return decision

    decision["selected_video"] = top["video_id"]
    decision["reason_selected"] = "high_confidence_candidate"
    return decision


def audit_path(run_id: str) -> Path:
    p = ROOT / "build" / "newsroom-audit"
    p.mkdir(parents=True, exist_ok=True)
    return p / f"{run_id}.jsonl"


def append_audit(run_id: str, item: dict, url: str, decision: dict, outcome: str):
    payload = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "run_id": run_id,
        "marker_version": MARKER_VERSION,
        "article": url,
        "title": clean(item.get("title")),
        "entities": [clean(x) for x in (item.get("entities") or []) if clean(x)],
        "query": decision.get("query"),
        "candidates": decision.get("candidates", []),
        "selected_video": decision.get("selected_video"),
        "score": decision.get("score"),
        "confidence": decision.get("confidence"),
        "positive_matches": decision.get("positive_matches", []),
        "penalties": decision.get("penalties", []),
        "reason_selected": decision.get("reason_selected", ""),
        "reason_rejected": decision.get("reason_rejected", ""),
        "outcome": outcome,
    }
    with audit_path(run_id).open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(payload, ensure_ascii=False) + "\n")


def enrich_page(path: Path, item: dict, run_id: str, dry_run: bool = False) -> tuple[bool, str]:
    original = path.read_text("utf-8")
    url = "/" + str(path.relative_to(ROOT)).replace("\\", "/")
    if BLOCK_START in original or "PASSPORT_NEWSROOM_ENRICHED_V2" in original:
        append_audit(run_id, item, url, {"query": "", "reason_rejected": "already_enriched"}, "SKIP")
        return False, "SKIP"

    decision = choose_video(item)
    video_id = decision.get("selected_video")
    if not video_id:
        append_audit(run_id, item, url, decision, "NO_VIDEO")
        return False, "NO_VIDEO"

    embed = f"https://www.youtube-nocookie.com/embed/{video_id}"
    title = clean(item.get("title"))
    block = f'''\n{BLOCK_START}
<section class="pe-newsroom-media" data-passport-newsroom-version="{MARKER_VERSION}" data-passport-video="{video_id}" aria-label="Arquivo audiovisual Passport Radio">
  <div class="pe-newsroom-archive-label">ARQUIVO PASSPORT RADIO</div>
  <div class="pe-newsroom-video">
    <iframe src="{embed}" title="{html.escape(title, quote=True)} — Arquivo Passport Radio" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
  </div>
</section>
{BLOCK_END}\n'''
    needle = '<div class="pe-closing"><small>PASSPORT RADIO · EDITORIAL</small>'
    if needle not in original:
        decision["selected_video"] = None
        decision["reason_selected"] = ""
        decision["reason_rejected"] = "closing_anchor_missing"
        append_audit(run_id, item, url, decision, "NO_VIDEO")
        return False, "NO_VIDEO"

    css = '''\n<style data-passport-newsroom-css="v3">
.pe-newsroom-media{margin:54px 0;border-top:1px solid rgba(0,0,0,.14);padding-top:32px}.pe-newsroom-archive-label{margin:0 0 14px;font-size:.68rem;font-weight:900;letter-spacing:.14em;opacity:.62}.pe-newsroom-video{position:relative;width:100%;aspect-ratio:16/9;background:#000}.pe-newsroom-video iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
</style>\n'''
    candidate = original.replace(needle, block + needle, 1)
    if 'data-passport-newsroom-css="v3"' not in candidate:
        candidate = candidate.replace("</head>", css + "</head>", 1)

    if candidate == original or BLOCK_START not in candidate:
        decision["selected_video"] = None
        decision["reason_selected"] = ""
        decision["reason_rejected"] = "atomic_composition_failed"
        append_audit(run_id, item, url, decision, "NO_VIDEO")
        return False, "NO_VIDEO"

    append_audit(run_id, item, url, decision, "DRY_RUN_EMBED" if dry_run else "EMBED")
    if dry_run:
        return False, "DRY_RUN_EMBED"
    path.write_text(candidate, "utf-8")
    return True, "EMBED"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--feed", default="data/editorial-feed.json")
    ap.add_argument("--limit", type=int, default=5)
    ap.add_argument("--run-id", default="local")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()
    feed = json.loads((ROOT / args.feed).read_text("utf-8"))
    items = feed if isinstance(feed, list) else feed.get("items", [])
    changed, no_video, skipped, dry_embed = [], [], [], []
    for item in items[: max(1, args.limit)]:
        url = str(item.get("url") or "")
        if not url.startswith("/editorial/") or not url.endswith(".html"):
            continue
        path = ROOT / url.lstrip("/")
        if not path.exists():
            continue
        did_change, outcome = enrich_page(path, item, args.run_id, args.dry_run)
        if did_change:
            changed.append(url)
        elif outcome == "NO_VIDEO":
            no_video.append(url)
        elif outcome == "SKIP":
            skipped.append(url)
        elif outcome == "DRY_RUN_EMBED":
            dry_embed.append(url)
    print(json.dumps({"status": "ok", "mode": "dry-run" if args.dry_run else "canary", "limit": args.limit,
                      "enriched": len(changed), "pages": changed, "no_video": no_video,
                      "dry_run_embed": dry_embed, "skipped": skipped,
                      "audit": str(audit_path(args.run_id).relative_to(ROOT))}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
