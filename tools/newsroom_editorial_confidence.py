#!/usr/bin/env python3
"""Editorial confidence signals for Passport Newsroom media selection.

Pure scoring helpers: no file writes, no RSS/audio/Home concerns.
"""
from __future__ import annotations

from datetime import datetime
import html
import re
import unicodedata

STRONG_AUTHORITY_HINTS = ("official", "vevo", "records", "recordings")
RECOGNIZED_MEDIA = ("npr", "kexp", "bbc")
GENERIC_AUTHORITY_WORDS = ("music", "festival")
WHAT_TERMS = (
    "album", "single", "tour", "festival", "event", "show", "concert", "live",
    "interview", "announcement", "announces", "anuncia", "lanca", "lança", "retorno",
    "reunion", "kickoff", "hall", "fame", "rockstar", "be not afraid", "good god", "baad man",
)
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


def clean(v):
    return re.sub(r"\s+", " ", html.unescape(str(v or ""))).strip()


def norm(v: str) -> str:
    value = unicodedata.normalize("NFKD", clean(v)).encode("ascii", "ignore").decode("ascii").casefold()
    return re.sub(r"[^a-z0-9]+", " ", value).strip()


def tokens(v: str) -> set[str]:
    return {x for x in norm(v).split() if len(x) >= 3}


def entities(item: dict) -> list[str]:
    return [clean(x) for x in (item.get("entities") or []) if clean(x)]


def editorial_what(item: dict) -> list[str]:
    text = norm(" ".join([clean(item.get("title")), clean(item.get("deck"))]))
    found = [term for term in WHAT_TERMS if norm(term) in text]
    years = re.findall(r"\b(?:19|20)\d{2}\b", text)
    return list(dict.fromkeys(found + years))[:6]


def build_query(item: dict) -> str:
    who = entities(item)[:2]
    what = editorial_what(item)[:4]
    if not who:
        return clean(item.get("title"))
    return " ".join(who + what)


def _entity_match(entity: str, haystack: str) -> float:
    en = norm(entity)
    hn = norm(haystack)
    if not en:
        return 0.0
    if en in hn:
        return 1.0
    et = tokens(entity)
    return len(et & tokens(haystack)) / max(1, len(et))


def entity_evidence(item: dict, title: str, channel: str) -> dict:
    es = entities(item)
    joined = f"{title} {channel}"
    matches = [{"entity": e, "match": round(_entity_match(e, joined), 4)} for e in es[:4]]
    strong = [m for m in matches if m["match"] >= 0.90]
    central_count = min(2, len(es))
    cross_required = central_count >= 2
    cross_ok = (len(strong) >= 2) if cross_required else bool(strong)
    return {"matches": matches, "strong_count": len(strong), "cross_required": cross_required, "cross_ok": cross_ok}


def authority_evidence(item: dict, title: str, channel: str, entity_info: dict) -> tuple[float, str]:
    cn = norm(channel)
    es = entities(item)
    # Artist/band channel identity is strongest evidence.
    if any(norm(e) and (norm(e) == cn or norm(e) in cn) for e in es):
        return 1.0, "entity_channel_identity"
    # VEVO is strong only when the candidate also identifies a story entity.
    if "vevo" in cn and entity_info["strong_count"] >= 1:
        return 0.92, "vevo_with_entity"
    # A named label/records channel must be connected to a listed entity or candidate title.
    if any(h in cn for h in ("records", "recordings")) and entity_info["strong_count"] >= 1:
        return 0.86, "label_with_entity"
    if "official" in cn and entity_info["strong_count"] >= 1:
        return 0.84, "official_with_entity"
    if any(h in cn for h in RECOGNIZED_MEDIA) and entity_info["strong_count"] >= 1:
        return 0.78, "recognized_media_with_entity"
    # Generic words never create strong authority by themselves.
    if any(h in cn for h in GENERIC_AUTHORITY_WORDS):
        return (0.40, "generic_channel_word_only") if entity_info["strong_count"] else (0.20, "generic_channel_unlinked")
    if entity_info["strong_count"] >= 1:
        return 0.50, "identity_without_authority_proof"
    return 0.0, "no_authority_evidence"


def temporal_evidence(item: dict, published_at: str | None) -> tuple[float, str, int | None]:
    if not published_at:
        return 0.55, "date_unknown", None
    m = re.search(r"\b((?:19|20)\d{2})\b", published_at)
    if not m:
        return 0.55, "date_unknown", None
    video_year = int(m.group(1))
    article_raw = clean(item.get("published_at"))
    am = re.search(r"\b((?:19|20)\d{2})\b", article_raw)
    if not am:
        return 0.55, "article_date_unknown", video_year
    article_year = int(am.group(1))
    delta = article_year - video_year
    if delta <= 1 and delta >= -1:
        return 1.0, "current_window", video_year
    if delta <= 3:
        return 0.72, "near_context", video_year
    return 0.32, "historical_archive", video_year


def event_specificity(item: dict, title: str) -> tuple[float, list[str]]:
    wanted = editorial_what(item)
    tn = norm(title)
    matched = [w for w in wanted if norm(w) in tn]
    if not wanted:
        return 0.55, []
    ratio = len(matched) / len(wanted)
    return min(1.0, 0.35 + ratio), matched


def evaluate(meta: dict, item: dict, *, score_threshold: float, confidence_threshold: float) -> dict:
    title, channel = clean(meta.get("title")), clean(meta.get("channel"))
    joined_norm = norm(f"{title} {channel}")
    vetoes = [name for name, pattern in HARD_VETO_PATTERNS.items() if re.search(pattern, joined_norm, re.I)]
    penalties = [name for name, pattern in SOFT_PENALTY_PATTERNS.items() if re.search(pattern, joined_norm, re.I)]
    entity_info = entity_evidence(item, title, channel)
    identity = max([m["match"] for m in entity_info["matches"]] or [0.0])
    authority, authority_reason = authority_evidence(item, title, channel, entity_info)
    temporal, temporal_class, video_year = temporal_evidence(item, clean(meta.get("published_at")))
    specificity, what_matches = event_specificity(item, title)
    article_tokens = tokens(" ".join([clean(item.get("title")), clean(item.get("deck"))]))
    video_tokens = tokens(title)
    relevance = min(1.0, (len(article_tokens & video_tokens) / max(1, min(len(article_tokens), 10))) * 1.8)

    # Cross-entity evidence is a hard editorial requirement for multi-central-entity stories.
    if entity_info["cross_required"] and not entity_info["cross_ok"]:
        vetoes.append("multi_entity_context_missing")
    # Historical material is allowed only when the story itself supplies matching event/context evidence.
    if temporal_class == "historical_archive" and specificity < 0.70:
        vetoes.append("historical_without_event_context")

    score = 0.32 * identity + 0.23 * authority + 0.18 * relevance + 0.15 * specificity + 0.12 * temporal
    score -= 0.10 * len(penalties)
    score = max(0.0, min(1.0, score))
    confidence = score
    if authority < 0.78:
        confidence *= 0.82
    if temporal_class == "date_unknown":
        confidence *= 0.90
    if penalties:
        confidence *= max(0.45, 1.0 - 0.15 * len(penalties))
    if vetoes:
        confidence = 0.0

    positive = []
    if identity >= 0.90: positive.append("strong_identity")
    if authority >= 0.78: positive.append("authority_evidence")
    if specificity >= 0.70: positive.append("event_specificity")
    if temporal >= 0.72: positive.append("temporal_fit")
    if entity_info["cross_ok"]: positive.append("entity_context_ok")

    return {
        **meta,
        "identity": round(identity, 4), "authority": round(authority, 4),
        "authority_reason": authority_reason, "relevance": round(relevance, 4),
        "event_specificity": round(specificity, 4), "event_matches": what_matches,
        "temporal_score": round(temporal, 4), "temporal_class": temporal_class,
        "video_year": video_year, "entity_evidence": entity_info,
        "score": round(score, 4), "confidence": round(max(0.0, min(1.0, confidence)), 4),
        "positive_matches": positive, "penalties": penalties, "vetoes": list(dict.fromkeys(vetoes)),
        "thresholds": {"score": score_threshold, "confidence": confidence_threshold},
    }
