#!/usr/bin/env python3
"""Bridge Passport Newsroom selection decisions into placement-audit proposals.

This module does not render or mutate article HTML. It converts a successful
media gate decision into a structured PROPOSED placement and can advance it
through machine validation (G1) and the generated four-why report (G2).
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path

from newsroom_placement_audit import AuditLog, build_review_report, sha256_text, validate_media

ROOT = Path(__file__).resolve().parents[1]


def _clean(value) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def _norm(value) -> str:
    return re.sub(r"[^a-z0-9]+", " ", _clean(value).casefold()).strip()


def _tokens(value) -> set[str]:
    return {x for x in _norm(value).split() if len(x) >= 3}


def _selected_candidate(decision: dict) -> dict:
    selected = str(decision.get("selected_video") or "")
    for candidate in decision.get("candidates") or []:
        if str(candidate.get("video_id") or "") == selected:
            return candidate
    return {}


def _candidate_rejection_reason(candidate: dict, selected: dict) -> str:
    vetoes = [str(x) for x in candidate.get("vetoes") or [] if str(x)]
    if vetoes:
        return "+".join(vetoes[:2])
    if float(candidate.get("confidence") or 0) < float(selected.get("confidence") or 0):
        return "lower_confidence"
    if float(candidate.get("media_priority") or 0) < float(selected.get("media_priority") or 0):
        return "lower_editorial_form_priority"
    if float(candidate.get("event_specificity") or 0) < float(selected.get("event_specificity") or 0):
        return "lower_event_specificity"
    return "not_selected_by_gate"


def _runners_up(decision: dict, selected: dict) -> list[dict]:
    candidates = [c for c in (decision.get("candidates") or []) if c.get("video_id") and c.get("video_id") != selected.get("video_id")]
    candidates.sort(key=lambda c: (float(c.get("confidence") or 0), float(c.get("score") or 0)), reverse=True)
    return [
        {
            "media_id": f"youtube:{c['video_id']}",
            "score": float(c.get("score") or 0),
            "confidence": float(c.get("confidence") or 0),
            "reason_rejected": _candidate_rejection_reason(c, selected),
        }
        for c in candidates[:3]
    ]


def _sentences(article_text: str) -> list[tuple[int, str]]:
    out = []
    for m in re.finditer(r"[^\n.!?]+(?:[.!?]+|$)", article_text or ""):
        sentence = _clean(m.group(0))
        if len(sentence) >= 24:
            out.append((m.start(), sentence))
    return out


def _anchor(article_text: str, item: dict, decision: dict, selected: dict) -> tuple[int, str]:
    named = [_clean(x) for x in (decision.get("media_terms") or item.get("_media_terms") or []) if _clean(x)]
    wanted = set()
    for value in named + [selected.get("title"), item.get("title"), item.get("deck")]:
        wanted |= _tokens(value)
    best = (-1.0, 0, "")
    for offset, sentence in _sentences(article_text):
        st = _tokens(sentence)
        overlap = len(st & wanted)
        named_hits = sum(1 for term in named if _norm(term) and _norm(term) in _norm(sentence))
        media_words = sum(1 for word in ("video", "videoclipe", "performance", "entrevista", "show", "ao vivo", "live", "clipe") if word in _norm(sentence))
        score = overlap + named_hits * 4 + media_words * 2
        if score > best[0]:
            best = (score, offset, sentence)
    if best[2]:
        return best[1], best[2]
    fallback = _clean(article_text)[:260]
    return 0, fallback


def _temporality(candidate: dict) -> tuple[str, int | None, str]:
    klass = str(candidate.get("temporal_class") or "")
    year = candidate.get("video_year")
    if klass in {"current_window", "near_context"}:
        return "current", year, klass
    if klass == "historical_archive":
        return "historical", year, klass
    return "unknown", year, klass or "date_unknown"


def _form_note(media_class: str, anchor: str) -> str:
    if media_class == "music_video":
        return "vídeo é necessário porque movimento, execução e performance são parte do objeto editorial"
    if media_class in {"performance", "interview", "video"}:
        return "vídeo é necessário porque fala, movimento ou execução são parte do objeto editorial"
    return "forma audiovisual preserva o contexto temporal e a execução que uma imagem isolada não demonstra"


def _caption(selected: dict, item: dict, temporality: str, year: int | None) -> str:
    title = _clean(selected.get("title")) or _clean(item.get("title"))
    channel = _clean(selected.get("channel")) or "fonte não identificada"
    time = f"{year}" if year else ("data não confirmada" if temporality == "unknown" else temporality)
    return f"{title} — registro de {channel}; {time}, ligado diretamente a {_clean(item.get('title'))}."


def _gate_reference(decision: dict) -> str:
    raw = json.dumps({
        "query": decision.get("query"),
        "selected_video": decision.get("selected_video"),
        "thresholds": decision.get("thresholds"),
        "score": decision.get("score"),
        "confidence": decision.get("confidence"),
    }, ensure_ascii=False, sort_keys=True)
    return "media-gate:" + hashlib.sha256(raw.encode("utf-8")).hexdigest()[:16]


def build_proposal(item: dict, decision: dict, article_text: str, *, article_id: str | None = None, article_revision: str | None = None) -> dict:
    """Convert one successful selection-gate result into a fail-closed proposal."""
    selected = _selected_candidate(decision)
    selected_video = str(decision.get("selected_video") or "")
    if not selected_video or not selected:
        raise ValueError("selection decision has no resolvable selected_video")

    aid = article_id or str(item.get("url") or item.get("id") or "article")
    revision = article_revision or sha256_text(article_text)
    offset, anchor = _anchor(article_text, item, decision, selected)
    temporality, year, temporal_context = _temporality(selected)
    media_class = str(selected.get("media_class") or decision.get("media_class") or "video")
    role = "illustration" if temporality == "unknown" else "evidence"
    source = _clean(selected.get("channel"))
    runners = _runners_up(decision, selected)
    caption = _caption(selected, item, temporality, year)

    return {
        "article_id": aid,
        "article_revision": revision,
        "media_id": f"youtube:{selected_video}",
        "gate": {
            "reference": _gate_reference(decision),
            "score": float(selected.get("score") or decision.get("score") or 0),
            "confidence": float(selected.get("confidence") or decision.get("confidence") or 0),
            "authority": float(selected.get("authority") or 0),
            "temporality": temporality,
            "media_class": media_class,
        },
        "placement": {
            "anchor_text": anchor,
            "anchor_section": "body",
            "anchor_hash": sha256_text(anchor),
            "anchor_offset": offset,
            "media_role": role,
            "media_class": media_class,
            "weight": "heavy",
            "placement_reason": "a âncora concentra a obra/evento que o gate vinculou à mídia selecionada",
            "form_ladder_note": _form_note(media_class, anchor),
            "caption": caption,
        },
        "provenance": {
            "source": source,
            "temporality": temporality,
            "year": year,
            "context": temporal_context,
        },
        "runners_up": runners,
        "accessibility": {
            "alt": "",
            "transcript_available": False,
            "description": f"Vídeo {_clean(selected.get('title'))}, publicado pelo canal {source}.",
        },
        "playback": {"autoplay": False, "reciprocal_interlock": True},
        "nomad_bridge": "",
        "removal_test": True,
        "selection_snapshot": {
            "query": decision.get("query"),
            "reason_selected": decision.get("reason_selected"),
            "thresholds": decision.get("thresholds"),
            "selected_video": selected_video,
        },
    }


def advance_to_reviewable(item: dict, decision: dict, article_text: str, *, article_id: str | None = None,
                          article_revision: str | None = None, log: AuditLog | None = None) -> dict:
    proposal = build_proposal(item, decision, article_text, article_id=article_id, article_revision=article_revision)
    g1 = validate_media(proposal, article_text, log=log)
    if not g1.get("ok"):
        return {"ok": False, "state": g1.get("state"), "proposal": proposal, "g1": g1, "g2": None}
    g2 = build_review_report(proposal, log=log)
    return {"ok": bool(g2.get("ok")), "state": g2.get("state"), "proposal": proposal, "g1": g1, "g2": g2}


def run_manifest(path: Path, run_id: str) -> int:
    manifest = json.loads(path.read_text("utf-8"))
    if manifest.get("composition_enabled") is not False:
        raise SystemExit("composition must remain disabled in placement-link canary")
    log = AuditLog(ROOT / "build" / "newsroom-audit" / f"{run_id}-placement-link.jsonl")
    results = []
    for case in manifest.get("cases") or []:
        result = advance_to_reviewable(case["item"], case["decision"], case["article_text"], article_id=case["article_id"], log=log)
        observed = result["state"]
        expected = case["expected_state"]
        results.append({"id": case["id"], "observed": observed, "expected": expected, "ok": observed == expected})
    failed = [x for x in results if not x["ok"]]
    print(json.dumps({"status": "ok" if not failed else "failed", "cases": len(results), "passed": len(results)-len(failed), "failed": len(failed), "results": results}, ensure_ascii=False))
    return 0 if not failed else 1


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--manifest", required=True)
    ap.add_argument("--run-id", default="local")
    args = ap.parse_args()
    return run_manifest(ROOT / args.manifest, args.run_id)


if __name__ == "__main__":
    raise SystemExit(main())
