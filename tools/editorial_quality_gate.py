#!/usr/bin/env python3
"""Passport Editorial Constitution™ — local quality/grounding gate.

The gate is deterministic, zero-cost and intentionally conservative. It never
tries to prove semantics perfectly; it verifies structural integrity, declared
provenance, obvious factual-risk signals and public pt-BR output before a story
is eligible to publish.
"""
from __future__ import annotations

from difflib import SequenceMatcher
import re
import unicodedata
from typing import Any

TERMINAL_PUNCTUATION = (".", "!", "?", "”", '"', "’", "'")
PT_MARKERS = {
    "a","ao","aos","as","com","como","da","das","de","do","dos","e","ela","ele",
    "em","entre","essa","esse","esta","este","foi","foram","mais","na","nas","no","nos",
    "o","os","para","pela","pelas","pelo","pelos","por","que","se","sem","ser","sua","seu",
    "tambem","tem","uma","um","vai","comeca","chega","banda","album","show","turne"
}
EN_MARKERS = {
    "a","an","and","are","as","at","be","been","by","for","from","has","have","in","is",
    "it","its","of","on","or","that","the","their","this","to","was","were","will","with",
    "album","band","show","tour","new","release","debut","featuring","announced","set"
}
SCHEMA_ECHOES = (
    "artistas/bandas/álbuns centrais",
    "artistas/bandas/albuns centrais",
    "parágrafo editorial",
    "paragrafo editorial",
    "subtítulo:",
    "subtitulo:",
    "título editorial novo",
    "titulo editorial novo",
    "resumo de 1-2 frases",
    "termos de busca",
)
GENERIC_SECTION_HEADINGS = {
    "subtitulo", "titulo", "heading", "section", "secao", "paragrafo", "texto"
}
# Deliberately excludes one/um/uma because those words are too common in normal
# prose. These mappings are only used when a nearby factual unit is present.
NUMBER_WORDS = {
    "dois": 2, "duas": 2, "two": 2,
    "tres": 3, "three": 3,
    "quatro": 4, "four": 4,
    "cinco": 5, "five": 5,
    "seis": 6, "six": 6,
    "sete": 7, "seven": 7,
    "oito": 8, "eight": 8,
    "nove": 9, "nine": 9,
    "dez": 10, "ten": 10,
    "onze": 11, "eleven": 11,
    "doze": 12, "twelve": 12,
    "treze": 13, "thirteen": 13,
    "quatorze": 14, "catorze": 14, "fourteen": 14,
    "quinze": 15, "fifteen": 15,
    "dezesseis": 16, "sixteen": 16,
    "dezessete": 17, "seventeen": 17,
    "dezoito": 18, "eighteen": 18,
    "dezenove": 19, "nineteen": 19,
    "vinte": 20, "twenty": 20,
}
QUANTITY_UNITS = {
    "lp": "record_count", "lps": "record_count",
    "disco": "record_count", "discos": "record_count",
    "vinil": "record_count", "vinis": "record_count",
    "vinyl": "record_count", "vinyls": "record_count",
    "record": "record_count", "records": "record_count",
    "pagina": "page_count", "paginas": "page_count",
    "page": "page_count", "pages": "page_count",
    "faixa": "track_count", "faixas": "track_count",
    "track": "track_count", "tracks": "track_count",
    "song": "track_count", "songs": "track_count",
    "musica": "track_count", "musicas": "track_count",
    "impressao": "print_count", "impressoes": "print_count",
    "print": "print_count", "prints": "print_count",
}


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
    for section in article.get("sections") or []:
        if isinstance(section, dict):
            parts.append(str(section.get("heading") or ""))
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


def _quantity_mentions(text: str) -> set[tuple[int, str]]:
    """Extract explicit small/large quantities only when tied to factual units.

    This catches cross-language claims such as `sete LPs` versus source evidence
    saying `four-LP`, without treating ordinary prose like `uma nova etapa` as a
    numeric fact. A unit may appear up to four tokens after the number to cover
    forms such as `two collectible art prints`.
    """
    toks = words(text)
    out: set[tuple[int, str]] = set()
    for idx, tok in enumerate(toks):
        number: int | None = None
        if tok.isdigit():
            try:
                number = int(tok)
            except Exception:
                number = None
        elif tok in NUMBER_WORDS:
            number = NUMBER_WORDS[tok]
        if number is None:
            continue
        for look in toks[idx + 1: idx + 6]:
            unit = QUANTITY_UNITS.get(look)
            if unit:
                out.add((number, unit))
                break
    return out


def _language_counts(text: str) -> tuple[int, int, int]:
    toks = words(text)
    pt = sum(1 for t in toks if t in PT_MARKERS)
    en = sum(1 for t in toks if t in EN_MARKERS)
    accents = sum((text or "").lower().count(ch) for ch in "áàâãéêíóôõúç")
    return pt, en, accents


def looks_overwhelmingly_english(text: str) -> bool:
    toks = words(text)
    if len(toks) < 45:
        return False
    pt, en, accents = _language_counts(text)
    return en >= 14 and en >= max(14, pt * 2) and accents <= 2


def _quoted_fragments(text: str) -> list[str]:
    patterns = [r'[“"]([^”"]{18,})[”"]', r"‘([^’]{18,})’"]
    out: list[str] = []
    for pattern in patterns:
        out.extend(m.group(1).strip() for m in re.finditer(pattern, text or ""))
    return [q for q in out if len(words(q)) >= 4]


def _quote_supported(quote: str, refs: list[str], facts: dict[str, dict[str, Any]]) -> bool:
    nq = norm(quote)
    if not nq:
        return True
    for ref in refs:
        fact = facts.get(ref)
        if not fact:
            continue
        evidence = norm(str(fact.get("evidence") or ""))
        value = norm(str(fact.get("value") or ""))
        if nq in evidence or nq in value:
            return True
    return False


def _near_duplicate_paragraphs(
    paragraphs: list[dict[str, Any]], min_words: int, threshold: float
) -> tuple[list[str], float]:
    hits: list[str] = []
    maximum = 0.0
    for left in range(len(paragraphs)):
        a = paragraphs[left]["text"]
        if len(words(a)) < min_words:
            continue
        for right in range(left + 1, len(paragraphs)):
            b = paragraphs[right]["text"]
            if len(words(b)) < min_words:
                continue
            ratio = SequenceMatcher(None, norm(a), norm(b), autojunk=False).ratio()
            maximum = max(maximum, ratio)
            if ratio >= threshold:
                hits.append(f"p{left + 1}-p{right + 1}:{ratio:.2f}")
    return hits, maximum


def evaluate(article: dict[str, Any], fact_pack: dict[str, Any], config: dict[str, Any] | None = None) -> dict[str, Any]:
    config = config or {}
    qcfg = config.get("quality_gate", {}) if isinstance(config, dict) else {}
    copy_window = int(qcfg.get("anti_copy_window_words", 40))
    require_refs = bool(qcfg.get("require_fact_refs", True))
    require_ptbr = bool(qcfg.get("require_ptbr", True))
    repetition_threshold = float(qcfg.get("max_paragraph_similarity", 0.82))
    repetition_min_words = int(qcfg.get("min_words_for_similarity", 28))

    facts = {str(f.get("fact_id")): f for f in fact_pack.get("facts", []) if f.get("fact_id")}
    paragraphs = paragraph_objects(article)
    text = public_text(article)
    low = norm(text)
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

    if require_ptbr and looks_overwhelmingly_english(text):
        reprocess.append("public_language_not_ptbr")

    if any(norm(marker) in low for marker in SCHEMA_ECHOES):
        reprocess.append("schema_placeholder_echo")

    generic_headings = 0
    for section in article.get("sections") or []:
        if not isinstance(section, dict):
            continue
        heading = norm(str(section.get("heading") or ""))
        if heading in GENERIC_SECTION_HEADINGS:
            generic_headings += 1
    if generic_headings:
        reprocess.append(f"generic_section_headings:{generic_headings}")

    duplicate_pairs, max_paragraph_similarity = _near_duplicate_paragraphs(
        paragraphs, repetition_min_words, repetition_threshold
    )
    if duplicate_pairs:
        reprocess.append(f"near_duplicate_paragraphs:{'|'.join(duplicate_pairs[:6])}")

    entities = [norm(str(x)) for x in (article.get("entities") or []) if str(x).strip()]
    if any("artistas/bandas/albuns centrais" in e for e in entities):
        reprocess.append("placeholder_entities")

    refs_seen: set[str] = set()
    missing_ref_paragraphs = 0
    valid_ref_paragraphs = 0
    unsupported_quantity_count = 0
    for idx, p in enumerate(paragraphs, 1):
        refs = p["fact_refs"]
        if not refs:
            missing_ref_paragraphs += 1
        valid_here = 0
        for ref in refs:
            refs_seen.add(ref)
            if ref not in facts:
                reject.append(f"unknown_fact_ref:{ref}")
                continue
            fact = facts[ref]
            if fact.get("status") in {"CONFLICTED", "INFERRED"} or not fact.get("allowed_for_generation", True):
                reject.append(f"disallowed_fact_ref:{ref}")
                continue
            valid_here += 1
        if valid_here:
            valid_ref_paragraphs += 1

        nums = _numeric_tokens(p["text"])
        supported_nums: set[str] = set()
        supported_quantities: set[tuple[int, str]] = set()
        if refs:
            for ref in refs:
                fact = facts.get(ref)
                if fact:
                    fact_value = str(fact.get("value") or "")
                    fact_evidence = str(fact.get("evidence") or "")
                    supported_nums |= _numeric_tokens(fact_value)
                    supported_nums |= _numeric_tokens(fact_evidence)
                    supported_quantities |= _quantity_mentions(fact_value)
                    supported_quantities |= _quantity_mentions(fact_evidence)

        if nums and refs:
            unsupported = {n for n in nums if n not in supported_nums}
            risky = {n for n in unsupported if len(n.replace(".", "").replace(",", "")) >= 3}
            if risky:
                reprocess.append(f"unverified_numbers:p{idx}:{','.join(sorted(risky))}")

        paragraph_quantities = _quantity_mentions(p["text"])
        if paragraph_quantities and refs:
            unsupported_quantities = sorted(paragraph_quantities - supported_quantities)
            if unsupported_quantities:
                unsupported_quantity_count += len(unsupported_quantities)
                rendered = ",".join(f"{number}:{unit}" for number, unit in unsupported_quantities)
                reprocess.append(f"unverified_quantities:p{idx}:{rendered}")

        for quote in _quoted_fragments(p["text"]):
            if not _quote_supported(quote, refs, facts):
                reprocess.append(f"unverified_literal_quote:p{idx}")
                break

    if require_refs and paragraphs and missing_ref_paragraphs:
        reprocess.append(f"paragraphs_without_fact_refs:{missing_ref_paragraphs}")

    allowed_critical = {
        fid for fid, fact in facts.items()
        if fact.get("critical") and fact.get("allowed_for_generation", True)
        and fact.get("status") not in {"CONFLICTED", "INFERRED"}
    }
    if allowed_critical and not (allowed_critical & refs_seen):
        reprocess.append("no_critical_fact_ref")

    for fact in facts.values():
        evidence = str(fact.get("evidence") or "")
        if evidence and _contains_long_copy(text, evidence, copy_window):
            reject.append(f"verbatim_copy:{fact.get('fact_id')}")
            break

    reject = list(dict.fromkeys(reject))
    reprocess = list(dict.fromkeys(reprocess))
    warnings = list(dict.fromkeys(warnings))

    if reject:
        decision = "WOULD_REJECT"
    elif reprocess:
        decision = "WOULD_REPROCESS"
    else:
        decision = "WOULD_PUBLISH"

    pt_count, en_count, accent_count = _language_counts(text)
    return {
        "decision": decision,
        "reasons": reject + reprocess,
        "warnings": warnings,
        "metrics": {
            "paragraphs": len(paragraphs),
            "paragraphs_with_refs": valid_ref_paragraphs,
            "fact_refs": len(refs_seen),
            "known_facts": len(facts),
            "critical_facts": len(allowed_critical),
            "pt_markers": pt_count,
            "en_markers": en_count,
            "pt_accents": accent_count,
            "generic_headings": generic_headings,
            "near_duplicate_pairs": len(duplicate_pairs),
            "max_paragraph_similarity": round(max_paragraph_similarity, 4),
            "unsupported_quantities": unsupported_quantity_count,
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
