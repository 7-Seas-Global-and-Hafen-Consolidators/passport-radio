#!/usr/bin/env python3
"""Passport Editorial Constitution™ — deterministic Fact Pack builder.

External source material is untrusted data. This module converts a candidate and
sanitized source text into a compact, auditable fact pack before any LLM prompt.
It intentionally avoids pretending that regex/NLP can fully understand journalism:
facts are evidence snippets with explicit provenance and conservative statuses.
"""
from __future__ import annotations

import datetime as dt
import hashlib
import html
import json
import re
import unicodedata
from typing import Any
from urllib.parse import urlparse

STOPWORDS = {
    "a","o","as","os","e","de","da","do","das","dos","em","na","no","nas","nos",
    "para","por","com","um","uma","the","an","and","of","in","on","for","to","with",
    "from","is","are","was","were","new","news","novo","nova","this","that","after",
    "before","sobre","como","que","se","sua","seu","ao","aos"
}
EVENT_TERMS = {
    "tour","turne","turnê","show","concert","festival","album","álbum","single","song",
    "musica","música","launch","release","lança","lanca","lançamento","anuncia","anunciou",
    "announces","announced","returns","return","retorna","volta","reunion","reunião",
    "dies","dead","death","morre","morreu","tribute","homenagem","interview","entrevista",
    "video","vídeo","live","ao","vivo","tickets","ingressos"
}
INJECTION_PATTERNS = (
    "ignore previous", "ignore all previous", "system prompt", "developer message",
    "reveal instructions", "reveal prompt", "follow these instructions",
    "disregard previous", "jailbreak", "assistant:", "system:", "developer:"
)
MONTHS = {
    "january":1,"jan":1,"janeiro":1,
    "february":2,"feb":2,"fevereiro":2,
    "march":3,"mar":3,"março":3,"marco":3,
    "april":4,"apr":4,"abril":4,
    "may":5,"maio":5,
    "june":6,"jun":6,"junho":6,
    "july":7,"jul":7,"julho":7,
    "august":8,"aug":8,"agosto":8,
    "september":9,"sep":9,"setembro":9,
    "october":10,"oct":10,"outubro":10,
    "november":11,"nov":11,"novembro":11,
    "december":12,"dec":12,"dezembro":12,
}

def clean(value: Any) -> str:
    return re.sub(r"\s+", " ", html.unescape(str(value or ""))).strip()

def norm_ascii(value: str) -> str:
    value = unicodedata.normalize("NFKD", value or "")
    value = "".join(ch for ch in value if not unicodedata.combining(ch))
    return value.lower()

def word_tokens(value: str) -> list[str]:
    words = re.findall(r"[^\W_]+", unicodedata.normalize("NFKC", value or "").lower(), flags=re.UNICODE)
    return [w for w in words if len(w) >= 2 and w not in STOPWORDS]

def digest(value: str, size: int = 24) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()[:size]

def source_id(url: str) -> str:
    normalized = (url or "").strip().lower()
    return "S" + digest(normalized, 16).upper()

def sanitize_external_text(value: str, max_chars: int = 7000) -> tuple[str, list[str]]:
    """Source Firewall for visible extracted text.

    The HTML parser already removes script/style/noscript/svg/nav/footer/form.
    This layer removes control characters, obvious instruction injection and
    oversized source payloads. It never treats source text as instructions.
    """
    text = str(value or "")
    reasons: list[str] = []
    text = "".join(ch for ch in text if ch in "\n\t" or ord(ch) >= 32)
    low = norm_ascii(text)
    for pattern in INJECTION_PATTERNS:
        if pattern in low:
            reasons.append(f"injection_pattern:{pattern}")
    safe_lines = []
    for line in text.splitlines():
        line_clean = clean(line)
        if not line_clean:
            continue
        line_low = norm_ascii(line_clean)
        if any(pattern in line_low for pattern in INJECTION_PATTERNS):
            continue
        safe_lines.append(line_clean)
    sanitized = "\n".join(safe_lines)
    if len(sanitized) > max_chars:
        sanitized = sanitized[:max_chars]
        reasons.append("source_truncated")
    return sanitized, reasons

def _published_year(candidate: dict[str, Any], editorial_day: str) -> str:
    raw = clean(candidate.get("published"))
    m = re.search(r"\b(19|20)\d{2}\b", raw)
    if m:
        return m.group(0)
    return editorial_day[:4]

def _event_type(title: str, category: str) -> str:
    low = norm_ascii(title)
    mapping = (
        ("death", ("dies","dead","death","morre","morreu","falec")),
        ("reunion", ("reunion","reuniao","retorna","returns","return","volta")),
        ("tour", ("tour","turne","show","concert","festival","ingresso","ticket")),
        ("album", ("album","álbum","record","disco","lp")),
        ("single", ("single","song","musica","música","track","faixa")),
        ("live", (" live ","ao vivo")),
        ("archive", ("anniversary","aniversario","aniversário","history","historia","história","legacy","legado")),
    )
    padded = f" {low} "
    for kind, needles in mapping:
        if any(n in padded for n in needles):
            return kind
    return norm_ascii(category or "music").replace(" ", "_")[:32] or "music"

def deterministic_ids(candidate: dict[str, Any], editorial_day: str) -> tuple[str, str]:
    title = clean(candidate.get("title"))
    category = clean(candidate.get("primary_category") or "music")
    toks = [norm_ascii(t) for t in word_tokens(title)]
    event_terms_ascii = {norm_ascii(x) for x in EVENT_TERMS}
    subject = [t for t in toks if t not in event_terms_ascii and not re.fullmatch(r"\d+", t)]
    subject_key = " ".join(subject[:6] or toks[:6] or ["unknown"])
    event_type = _event_type(title, category)
    year = _published_year(candidate, editorial_day)
    event_id = "EVT_" + digest(f"{category}|{event_type}|{subject_key}|{year}", 20)
    angle_basis = " ".join(sorted(set(toks))) or norm_ascii(title)
    story_angle_id = "ANG_" + digest(f"{event_id}|{angle_basis}", 20)
    return event_id, story_angle_id

def _sentence_candidates(text: str) -> list[str]:
    if not text:
        return []
    chunks = re.split(r"(?<=[.!?])\s+|\n+", text)
    out: list[str] = []
    seen: set[str] = set()
    for chunk in chunks:
        sentence = clean(chunk)
        if len(sentence) < 45 or len(sentence) > 520:
            continue
        normalized = norm_ascii(sentence)
        if normalized in seen:
            continue
        if any(pattern in normalized for pattern in INJECTION_PATTERNS):
            continue
        alpha = sum(ch.isalpha() for ch in sentence)
        if alpha < max(20, int(len(sentence) * 0.35)):
            continue
        seen.add(normalized)
        out.append(sentence)
    return out

def _fact(fact_type: str, value: str, evidence: str, source_ids: list[str], status: str = "SUPPORTED",
          critical: bool = False, allowed: bool = True) -> dict[str, Any]:
    identity = f"{fact_type}|{norm_ascii(value)}|{'|'.join(sorted(source_ids))}"
    return {
        "fact_id": "F" + digest(identity, 14).upper(),
        "type": fact_type,
        "value": clean(value)[:520],
        "evidence": clean(evidence)[:520],
        "source_ids": source_ids,
        "status": status,
        "critical": bool(critical),
        "allowed_for_generation": bool(allowed),
    }

def _extract_date_facts(text: str, sid: str) -> list[dict[str, Any]]:
    facts: list[dict[str, Any]] = []
    for m in re.finditer(r"\b((?:19|20)\d{2})[-/](0?[1-9]|1[0-2])[-/](0?[1-9]|[12]\d|3[01])\b", text):
        raw = m.group(0)
        try:
            dt.date(int(m.group(1)), int(m.group(2)), int(m.group(3)))
        except ValueError:
            continue
        facts.append(_fact("date", raw, raw, [sid], critical=True))
    month_pat = "|".join(sorted(MONTHS, key=len, reverse=True))
    for m in re.finditer(rf"\b([0-3]?\d)\s+(?:de\s+)?({month_pat})(?:\s+(?:de\s+)?((?:19|20)\d{{2}}))?\b", norm_ascii(text), flags=re.I):
        day = int(m.group(1))
        month = MONTHS[norm_ascii(m.group(2))]
        year = int(m.group(3)) if m.group(3) else 2000
        try:
            dt.date(year, month, day)
        except ValueError:
            continue
        raw = m.group(0)
        facts.append(_fact("date", raw, raw, [sid], critical=True))
    return facts

def build_fact_pack(candidate: dict[str, Any], source_text: str, editorial_day: str,
                    max_source_chars: int = 7000) -> dict[str, Any]:
    event_id, story_angle_id = deterministic_ids(candidate, editorial_day)
    primary_url = clean(candidate.get("url"))
    primary_sid = source_id(primary_url)
    origins_raw = candidate.get("origins") or []
    provenance: list[dict[str, Any]] = []
    seen_sids: set[str] = set()

    def add_origin(url: str, name: str = "", published: str = "") -> None:
        sid = source_id(url)
        if sid in seen_sids:
            return
        seen_sids.add(sid)
        provenance.append({
            "source_id": sid,
            "url": clean(url),
            "source_name": clean(name),
            "published": clean(published),
            "domain": urlparse(url).netloc.lower().removeprefix("www.") if url else "",
        })

    add_origin(primary_url, clean(candidate.get("source_name")), clean(candidate.get("published")))
    for origin in origins_raw:
        if isinstance(origin, dict):
            add_origin(str(origin.get("url") or ""), str(origin.get("source") or ""), str(origin.get("published") or ""))

    sanitized_source, firewall_flags = sanitize_external_text(source_text, max_chars=max_source_chars)
    facts: list[dict[str, Any]] = []

    title = clean(candidate.get("title"))
    desc = clean(candidate.get("description"))
    published = clean(candidate.get("published"))
    if title:
        facts.append(_fact("signal_title", title, title, [primary_sid], status="DIRECT", critical=True))
    if desc:
        facts.append(_fact("signal_summary", desc, desc, [primary_sid], critical=True))
    if published:
        facts.append(_fact("signal_date", published, published, [primary_sid], critical=False))

    for sentence in _sentence_candidates(sanitized_source)[:14]:
        facts.append(_fact("source_statement", sentence, sentence, [primary_sid]))

    for date_fact in _extract_date_facts(f"{title}\n{desc}\n{sanitized_source}", primary_sid):
        if all(f["fact_id"] != date_fact["fact_id"] for f in facts):
            facts.append(date_fact)

    return {
        "version": 1,
        "editorial_day": editorial_day,
        "event_id": event_id,
        "story_angle_id": story_angle_id,
        "primary_category": clean(candidate.get("primary_category") or "music"),
        "recommended_format": clean(candidate.get("recommended_format") or "STORY").upper(),
        "source_count": len(provenance),
        "origin_count": len(origins_raw) or 1,
        "scores": {
            "trend": int(candidate.get("trend_score") or 0),
            "passport": int(candidate.get("passport_score") or 0),
            "archive": int(candidate.get("archive_score") or 0),
            "total": int(candidate.get("total_score") or 0),
        },
        "firewall_flags": firewall_flags,
        "facts": facts,
        "provenance": provenance,
    }

def generation_view(fact_pack: dict[str, Any]) -> dict[str, Any]:
    """Return the only view allowed into the LLM prompt: no URLs/source names."""
    return {
        "version": fact_pack.get("version", 1),
        "editorial_day": fact_pack.get("editorial_day"),
        "event_id": fact_pack.get("event_id"),
        "story_angle_id": fact_pack.get("story_angle_id"),
        "primary_category": fact_pack.get("primary_category"),
        "recommended_format": fact_pack.get("recommended_format"),
        "source_count": fact_pack.get("source_count", 0),
        "scores": fact_pack.get("scores", {}),
        "facts": [
            {
                "fact_id": f.get("fact_id"),
                "type": f.get("type"),
                "value": f.get("value"),
                "status": f.get("status"),
                "critical": bool(f.get("critical")),
            }
            for f in fact_pack.get("facts", [])
            if f.get("allowed_for_generation") and f.get("status") not in {"CONFLICTED", "INFERRED"}
        ],
    }

def dump_generation_view(fact_pack: dict[str, Any]) -> str:
    return json.dumps(generation_view(fact_pack), ensure_ascii=False, separators=(",", ":"))
