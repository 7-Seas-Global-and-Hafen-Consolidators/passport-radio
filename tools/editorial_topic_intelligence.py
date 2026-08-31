#!/usr/bin/env python3
"""Passport Editorial Graph™ — topic intelligence, phase 1.

Pure enrichment layer for Editorial Tunnel output. It does not crawl, publish,
change RSS limits, or touch site/player code. It turns already-grouped signals
into topic intelligence: entity/topic hints, multi-source heat and a recommended
editorial action.
"""
from __future__ import annotations

import re
import unicodedata
from typing import Any, Iterable

ACTION_SIGNAL = "SIGNAL"
ACTION_ANSWER = "ANSWER"
ACTION_STORY = "STORY"
ACTION_DOSSIER = "DOSSIER"
ACTION_UPDATE = "UPDATE"

QUESTION_CUES = (
    "why ", "how ", "who ", "what happened", "which ", "when ",
    "por que ", "porque ", "como ", "quem ", "o que aconteceu", "qual ", "quando ",
)
ARCHIVE_CUES = (
    "history", "story behind", "legacy", "anniversary", "making of", "years ago",
    "história", "historia", "por trás", "legado", "aniversário", "aniversario", "anos",
)
EVENT_CUES = (
    "announces", "announced", "reveals", "returns", "reunion", "tour", "festival",
    "single", "album", "dies", "death", "tribute", "confirms", "launches",
    "anuncia", "anunciou", "revela", "revelou", "retorna", "volta", "turnê", "turne",
    "morre", "morreu", "homenagem", "confirma", "confirmou", "lança", "lanca",
)
NOISE = {
    "the", "a", "an", "and", "or", "of", "in", "on", "for", "to", "with", "from",
    "o", "a", "os", "as", "um", "uma", "de", "da", "do", "das", "dos", "em", "no",
    "na", "nos", "nas", "por", "para", "com", "e", "que", "se", "new", "novo", "nova",
}


def _fold(text: str) -> str:
    text = unicodedata.normalize("NFKD", text or "")
    return "".join(ch for ch in text if not unicodedata.combining(ch)).lower()


def _tokens(text: str) -> list[str]:
    return [x for x in re.findall(r"[^\W_]+", _fold(text), flags=re.UNICODE) if len(x) > 1 and x not in NOISE]


def topic_key(title: str) -> str:
    """Stable, conservative topic hint from the most informative title tokens."""
    tokens = _tokens(title)
    if not tokens:
        return "music"
    # Preserve order; the first meaningful words usually contain the named entity.
    return "-".join(tokens[:5])[:96]


def entity_hint(title: str) -> str:
    """Extract a cautious display hint without pretending to do full NER."""
    clean = re.sub(r"\s+", " ", title or "").strip()
    if not clean:
        return ""
    # Text before common editorial separators is generally the subject/entity.
    head = re.split(r"\s+[—–:-]\s+|\s+\|\s+", clean, maxsplit=1)[0].strip()
    words = head.split()
    if len(words) > 8:
        words = words[:8]
    return " ".join(words)[:120]


def source_count(item: Any) -> int:
    origins = getattr(item, "origins", None) or []
    domains = set()
    for origin in origins:
        if isinstance(origin, dict):
            domains.add(str(origin.get("source") or origin.get("url") or "").strip().lower())
    return max(1, len({x for x in domains if x}))


def hot_score(item: Any) -> int:
    """Heat = existing editorial score + independent-source confirmation + freshness."""
    base_score = int(getattr(item, "total_score", 0) or 0)
    sources = source_count(item)
    age = getattr(item, "age_hours", None)
    corroboration = min(18, max(0, sources - 1) * 6)
    freshness = 8 if age is not None and age <= 12 else 4 if age is not None and age <= 36 else 0
    return max(0, min(100, base_score + corroboration + freshness))


def recommended_action(item: Any) -> str:
    blob = _fold(f"{getattr(item, 'title', '')} {getattr(item, 'description', '')}")
    heat = hot_score(item)
    archive = int(getattr(item, "archive_score", 0) or 0)
    trend = int(getattr(item, "trend_score", 0) or 0)
    covered = bool(getattr(item, "already_covered", False))
    sources = source_count(item)

    if covered and (sources >= 2 or heat >= 82):
        return ACTION_UPDATE
    if any(cue in blob for cue in QUESTION_CUES):
        return ACTION_ANSWER
    if archive >= 72 or any(cue in blob for cue in ARCHIVE_CUES):
        return ACTION_DOSSIER if sources >= 2 and heat >= 78 else ACTION_STORY
    if trend >= 78 or any(cue in blob for cue in EVENT_CUES):
        return ACTION_SIGNAL
    return ACTION_STORY


def enrich_dict(item: Any, payload: dict[str, Any]) -> dict[str, Any]:
    """Add private routing metadata to a Tunnel JSON item."""
    out = dict(payload)
    out["topic_key"] = topic_key(str(getattr(item, "title", "")))
    out["entity_hint"] = entity_hint(str(getattr(item, "title", "")))
    out["source_count"] = source_count(item)
    out["hot_score"] = hot_score(item)
    out["editorial_action"] = recommended_action(item)
    return out


def rank_key(item: Any) -> tuple[int, int, int, int]:
    return (
        hot_score(item),
        source_count(item),
        int(getattr(item, "passport_score", 0) or 0),
        int(getattr(item, "trend_score", 0) or 0),
    )
