#!/usr/bin/env python3
"""Passport Editorial Constitution™ — local quality/grounding gate.

The production switch starts in SHADOW mode. Existing editorial gates still decide
publication while this module records WOULD_PUBLISH / WOULD_REPROCESS / WOULD_REJECT.
"""
from __future__ import annotations

import re
import unicodedata
from typing import Any

TERMINAL_PUNCTUATION = (".", "!", "?", "”", '"', "’", "'")

def norm(value: str) -> str:
    value = unicodedata.normalize("NFKD", value or "")
    value = "".join(ch for ch in value if not unicodedata.combining(ch))
    return re.sub(r"\s+", " ", value.lower()).strip()

def words(value: str) -> list[str]:
    return re.findall(r"[^\W_]+", norm(value), flags=re.UNICODE)

def paragraph_objects(article: dict[str, Any]) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for section in article.get("sections") or []:
        if not isinstance(section, dict):
            continue
        for p in section.get("paragraphs") or []:
            if isinstance(p, dict):
                text = str(p.get("text") or "").strip()
                refs = [str(x) for x in (p.get("fact_refs") or []) if str(x).strip()]
            else:
                text = str(p or "").strip()
                refs = []
            if text:
                out.append({"text": text, "fact_refs": refs})
    return out

def public_text(article: dict[str, Any]) -> str:
    parts = [
        str(article.get("title") or ""),
        str(article.get("deck") or ""),
        str(article.get("meta_description") or ""),
    ]
    for p in paragraph_objects(article):
        parts.append(p["text"])
    parts.append(str(article.get("closing") or ""))
    return "\n".join(x for x in parts if x)

def _contains_long_copy(text: str, evidence: str, window: int) -> bool:
    tw = words(text)
    ew = words(evidence)
    if len(ew) < window or len(tw) < window:
        return False
    target = {" ".join(tw[i:i+window]) for i in range(0, len(tw)-window+1)}
    return any(" ".join(ew[i:i+window]) in target for i in range(0, len(ew)-window+1))

def _numeric_tokens(text: str) -> set[str]:
    return set(re.findall(r"\b\d+(?:[.,]\d+)?\b", text or ""))

def evaluate(article: dict[str, Any], fact_pack: dict[str, Any], config: dict[str, Any] | None = None) -> dict[str, Any]:
    config = config or {}
    qcfg = config.get("quality_gate", {}) if isinstance(config, dict) else {}
    copy_window = int(qcfg.get("anti_copy_window_words", 40))
    require_refs = bool(qcfg.get("require_fact_refs", True))

    facts = {str(f.get("fact_id")): f for f in fact_pack.get("facts", []) if f.get("fact_id")}
    paragraphs = paragraph_objects(article)
    text = public_text(article)
    reject: list[str] = []
    reprocess: list[str] = []
    warnings: list[str] = []

    if not paragraphs:
        reject.append("no_editorial_paragraphs")
    if text and text.rstrip().endswith("..."):
        reprocess.append("truncated_ellipsis")
    last_body = paragraphs[-1]["text"] if paragraphs else ""
    if last_body and not last_body.rstrip().endswith(TERMINAL_PUNCTUATION):
        reprocess.append("truncated_last_paragraph")

    refs_seen: set[str] = set()
    missing_ref_paragraphs = 0
    for p in paragraphs:
        refs = p["fact_refs"]
        if not refs:
            missing_ref_paragraphs += 1
        for ref in refs:
            refs_seen.add(ref)
            if ref not in facts:
                reject.append(f"unknown_fact_ref:{ref}")
                continue
            fact = facts[ref]
            if fact.get("status") in {"CONFLICTED", "INFERRED"} or not fact.get("allowed_for_generation", True):
                reject.append(f"disallowed_fact_ref:{ref}")
    if require_refs and paragraphs and missing_ref_paragraphs:
        reprocess.append(f"paragraphs_without_fact_refs:{missing_ref_paragraphs}")

    allowed_critical = {
        fid for fid, fact in facts.items()
        if fact.get("critical") and fact.get("allowed_for_generation", True)
        and fact.get("status") not in {"CONFLICTED", "INFERRED"}
    }
    if allowed_critical and refs_seen and not (allowed_critical & refs_seen):
        reprocess.append("no_critical_fact_ref")

    for fact in facts.values():
        evidence = str(fact.get("evidence") or "")
        if evidence and _contains_long_copy(text, evidence, copy_window):
            reject.append(f"verbatim_copy:{fact.get('fact_id')}")
            break

    for idx, p in enumerate(paragraphs, 1):
        nums = _numeric_tokens(p["text"])
        if not nums or not p["fact_refs"]:
            continue
        supported_nums: set[str] = set()
        for ref in p["fact_refs"]:
            fact = facts.get(ref)
            if fact:
                supported_nums |= _numeric_tokens(str(fact.get("value") or ""))
                supported_nums |= _numeric_tokens(str(fact.get("evidence") or ""))
        unsupported = {n for n in nums if n not in supported_nums}
        risky = {n for n in unsupported if len(n.replace(".", "").replace(",", "")) >= 3}
        if risky:
            warnings.append(f"unverified_numbers:p{idx}:{','.join(sorted(risky))}")

    if reject:
        decision = "WOULD_REJECT"
    elif reprocess:
        decision = "WOULD_REPROCESS"
    else:
        decision = "WOULD_PUBLISH"

    return {
        "decision": decision,
        "reasons": reject + reprocess,
        "warnings": warnings,
        "metrics": {
            "paragraphs": len(paragraphs),
            "paragraphs_with_refs": len(paragraphs) - missing_ref_paragraphs,
            "fact_refs": len(refs_seen),
            "known_facts": len(facts),
            "critical_facts": len(allowed_critical),
        },
    }

def golden_metrics(results: list[dict[str, Any]]) -> dict[str, int]:
    metrics = {
        "correct": 0,
        "critical_false_accept": 0,
        "false_accept": 0,
        "false_reject": 0,
        "wrong_reprocess": 0,
        "total": len(results),
    }
    for row in results:
        expected = row["expected"]
        actual = row["actual"]
        critical = bool(row.get("critical"))
        if expected == actual:
            metrics["correct"] += 1
        elif actual == "WOULD_PUBLISH" and expected in {"WOULD_REJECT", "WOULD_REPROCESS"}:
            metrics["critical_false_accept" if critical else "false_accept"] += 1
        elif expected == "WOULD_PUBLISH" and actual != "WOULD_PUBLISH":
            metrics["false_reject"] += 1
        elif actual == "WOULD_REPROCESS" and expected != "WOULD_REPROCESS":
            metrics["wrong_reprocess"] += 1
        else:
            metrics["false_reject"] += 1
    return metrics
