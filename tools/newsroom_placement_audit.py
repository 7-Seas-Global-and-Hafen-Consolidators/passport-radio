#!/usr/bin/env python3
"""Passport Newsroom placement audit engine.

This module validates *decisions* before any media composition is allowed.
It does not render or modify article HTML.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from difflib import SequenceMatcher
import hashlib
import json
import re
import uuid
from pathlib import Path

AUDIT_VERSION = "1.0"
POSITIONAL_DEIXIS = re.compile(
    r"\b(?:abaixo|acima|a seguir|logo abaixo|logo acima|neste v[ií]deo|no v[ií]deo abaixo|no v[ií]deo acima|"
    r"below|above|following video|video below|video above)\b",
    re.I,
)
CONCRETE_TOKEN = re.compile(r"(?:\b(?:19|20)\d{2}\b|\b[A-ZÁÉÍÓÚÂÊÔÃÕÇ][\wÁÉÍÓÚÂÊÔÃÕÇáéíóúâêôãõç'’-]{2,}\b)")

MEDIA_STATES = {
    "PROPOSED", "VALIDATED", "REVIEWABLE", "APPROVED",
    "REANCHOR_REQUIRED", "REJECTED",
}
ARTICLE_STATES = {"ASSEMBLY_CHECK", "CONFLICT", "CORPUS_CHECK"}
CORPUS_STATES = {"CORPUS_CHECK", "BRIDGE_REWRITE", "CORPUS_REVIEW_REQUIRED", "COMPOSED"}

REASON_SINK = {
    "MEDIA_INCOMPLETE": "PROPOSED",
    "ANCHOR_NOT_FOUND": "REANCHOR_REQUIRED",
    "ANCHOR_STALE": "REANCHOR_REQUIRED",
    "ANCHOR_CHANGED": "REANCHOR_REQUIRED",
    "DEIXIS_POSITIONAL": "REANCHOR_REQUIRED",
    "PROVENANCE_INSUFFICIENT": "REJECTED",
    "TEMPORALITY_UNKNOWN_EVIDENCE": "REANCHOR_REQUIRED",
    "ACCESSIBILITY_MISSING": "REANCHOR_REQUIRED",
    "FORM_MISMATCH": "REANCHOR_REQUIRED",
    "RUNNERS_UP_MISSING": "PROPOSED",
    "REPORT_INCOMPLETE": "PROPOSED",
    "ASSEMBLY_RHYTHM_CONFLICT": "CONFLICT",
    "ASSEMBLY_NOMAD_LIMIT": "CONFLICT",
    "ASSEMBLY_DANGLING_POINTER": "CONFLICT",
    "CORPUS_BRIDGE_DUPLICATE": "BRIDGE_REWRITE",
    "CORPUS_FINGERPRINT_FLAG": "CORPUS_REVIEW_REQUIRED",
    "GATE_STALE": "REJECTED",
}


def utcnow() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def sha256_text(value: str) -> str:
    return hashlib.sha256((value or "").encode("utf-8")).hexdigest()


def norm(value: str) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip().casefold()


def word_count(value: str) -> int:
    return len(re.findall(r"\S+", value or ""))


def event(scope: str, article_id: str, previous_state: str, new_state: str,
          transition: str, reason_code: str, *, media_id: str | None = None,
          payload: dict | None = None, actor: dict | None = None,
          override: dict | None = None) -> dict:
    return {
        "audit_version": AUDIT_VERSION,
        "event_id": str(uuid.uuid4()),
        "timestamp": utcnow(),
        "article_id": article_id,
        "scope": scope,
        "media_id": media_id,
        "previous_state": previous_state,
        "new_state": new_state,
        "transition": transition,
        "reason_code": reason_code,
        "payload": payload or {},
        "actor": actor or {"type": "system", "name": "newsroom-placement-audit"},
        "override": override,
    }


class AuditLog:
    """Append-only JSONL audit log."""
    def __init__(self, path: str | Path | None = None):
        self.path = Path(path) if path else None
        self.events: list[dict] = []

    def append(self, row: dict) -> dict:
        self.events.append(row)
        if self.path:
            self.path.parent.mkdir(parents=True, exist_ok=True)
            with self.path.open("a", encoding="utf-8") as fh:
                fh.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")
        return row


def _fail(article_id: str, media_id: str, previous: str, reason: str, detail: str,
          log: AuditLog | None = None) -> dict:
    sink = REASON_SINK[reason]
    transition = "G1_FAIL" if previous == "PROPOSED" else "G4_INVALIDATED"
    row = event("media", article_id, previous, sink, transition, reason,
                media_id=media_id, payload={"detail": detail})
    if log: log.append(row)
    return {"ok": False, "state": sink, "reason_code": reason, "detail": detail, "event": row}


def _required(proposal: dict, dotted: str):
    cur = proposal
    for part in dotted.split("."):
        if not isinstance(cur, dict) or part not in cur:
            return None
        cur = cur[part]
    return cur


def _caption_complete(proposal: dict) -> bool:
    caption = str(_required(proposal, "placement.caption") or "").strip()
    provenance = str(_required(proposal, "provenance.source") or "").strip()
    why = str(_required(proposal, "placement.placement_reason") or "").strip()
    return bool(caption and provenance and why)


def _accessibility_ok(proposal: dict) -> bool:
    media_class = str(_required(proposal, "placement.media_class") or "").casefold()
    a11y = proposal.get("accessibility") or {}
    if media_class == "image":
        return bool(str(a11y.get("alt") or "").strip())
    if media_class in {"video", "music_video", "audio", "performance", "interview"}:
        if a11y.get("transcript_available") is True:
            return bool(str(a11y.get("transcript") or a11y.get("description") or "").strip())
        return bool(str(a11y.get("description") or "").strip())
    return True


def _runners_up_ok(proposal: dict) -> bool:
    runners = proposal.get("runners_up") or []
    if len(runners) < 2 or len(runners) > 3:
        return False
    return all(str(r.get("media_id") or "").strip() and str(r.get("reason_rejected") or "").strip() for r in runners)


def validate_media(proposal: dict, article_text: str, *, log: AuditLog | None = None) -> dict:
    """G1: fail-closed machine checks for one media placement."""
    article_id = str(proposal.get("article_id") or "")
    media_id = str(proposal.get("media_id") or "")
    required = [
        "article_id", "article_revision", "media_id",
        "gate.reference", "gate.score", "gate.confidence",
        "placement.anchor_text", "placement.anchor_section", "placement.media_role",
        "placement.media_class", "placement.weight", "placement.placement_reason",
        "placement.form_ladder_note", "placement.caption",
        "provenance.source", "provenance.temporality",
    ]
    missing = [key for key in required if _required(proposal, key) in (None, "")]
    if missing:
        return _fail(article_id, media_id, "PROPOSED", "MEDIA_INCOMPLETE", f"missing={','.join(missing)}", log)
    if not _runners_up_ok(proposal):
        return _fail(article_id, media_id, "PROPOSED", "RUNNERS_UP_MISSING", "requires 2-3 rejected alternatives with reasons", log)

    anchor = str(proposal["placement"]["anchor_text"])
    if anchor not in article_text:
        return _fail(article_id, media_id, "PROPOSED", "ANCHOR_NOT_FOUND", "anchor_text does not resolve in final article text", log)
    expected_anchor_hash = proposal["placement"].get("anchor_hash")
    resolved_hash = sha256_text(anchor)
    if expected_anchor_hash and expected_anchor_hash != resolved_hash:
        return _fail(article_id, media_id, "PROPOSED", "ANCHOR_CHANGED", "anchor hash no longer matches", log)

    bridge = str(proposal.get("nomad_bridge") or "")
    caption = str(proposal["placement"].get("caption") or "")
    if POSITIONAL_DEIXIS.search(bridge) or POSITIONAL_DEIXIS.search(caption):
        return _fail(article_id, media_id, "PROPOSED", "DEIXIS_POSITIONAL", "bridge/caption contains positional deixis", log)

    if not _caption_complete(proposal):
        return _fail(article_id, media_id, "PROPOSED", "PROVENANCE_INSUFFICIENT", "caption lacks contextual provenance", log)

    temporality = str(proposal["provenance"].get("temporality") or "").casefold()
    role = str(proposal["placement"].get("media_role") or "").casefold()
    if temporality == "unknown" and role == "evidence":
        return _fail(article_id, media_id, "PROPOSED", "TEMPORALITY_UNKNOWN_EVIDENCE", "unknown-date media cannot be temporal evidence", log)
    if temporality == "historical":
        if not proposal["provenance"].get("year") or not str(proposal["provenance"].get("context") or "").strip():
            return _fail(article_id, media_id, "PROPOSED", "PROVENANCE_INSUFFICIENT", "historical media requires year and context", log)

    if not _accessibility_ok(proposal):
        return _fail(article_id, media_id, "PROPOSED", "ACCESSIBILITY_MISSING", "required alt/description/transcript missing", log)

    playback = proposal.get("playback") or {}
    if playback.get("autoplay") is True or playback.get("reciprocal_interlock") is not True:
        return _fail(article_id, media_id, "PROPOSED", "FORM_MISMATCH", "autoplay forbidden and reciprocal interlock required for inline AV", log)

    guards = {
        "removal_test": "human_required" if proposal.get("removal_test") is False else "pass",
        "deixis_scan": "pass",
        "anchor_integrity": {"status": "pass", "anchor_hash": resolved_hash, "resolved_text": anchor,
                             "article_revision": proposal["article_revision"]},
        "provenance": "pass",
        "accessibility": "pass",
        "form_compatibility": "pass",
    }
    row = event("media", article_id, "PROPOSED", "VALIDATED", "G1_PASS", "MEDIA_G1_COMPLETE",
                media_id=media_id, payload={"guards": guards})
    if log: log.append(row)
    return {"ok": True, "state": "VALIDATED", "guards": guards, "event": row}


def _concrete(value: str) -> bool:
    return bool(CONCRETE_TOKEN.search(value or ""))


def build_review_report(proposal: dict, *, log: AuditLog | None = None) -> dict:
    """G2: render the four whys from structured fields, never free text."""
    article_id, media_id = proposal["article_id"], proposal["media_id"]
    runners = proposal.get("runners_up") or []
    r0 = runners[0]
    gate = proposal["gate"]
    place = proposal["placement"]
    why_this = f"Essa mídia porque {media_id} passou {gate['reference']} com confiança {gate['confidence']}; {r0['media_id']} perdeu por {r0['reason_rejected']}."
    why_here = f"Neste ponto porque a âncora ‘{place['anchor_text']}’ em {place['anchor_section']} contém a promessa editorial registrada."
    why_form = f"Nesta forma porque {place['media_class']} serve {place['media_role']}: {place['form_ladder_note']}."
    rejected = "; ".join(f"{r['media_id']}: {r['reason_rejected']}" for r in runners[:3])
    why_not = f"Não outra porque {rejected}; formas leves: {place['form_ladder_note']}."
    report = {"why_this": why_this, "why_here": why_here, "why_this_form": why_form, "why_not_another": why_not}

    bad = [k for k, value in report.items() if not value.strip() or word_count(value) > 25 or not _concrete(value)]
    if bad:
        row = event("media", article_id, "VALIDATED", "PROPOSED", "G2_FAIL", "REPORT_INCOMPLETE",
                    media_id=media_id, payload={"invalid_sentences": bad, "report": report})
        if log: log.append(row)
        return {"ok": False, "state": "PROPOSED", "reason_code": "REPORT_INCOMPLETE", "report": report, "event": row}

    row = event("media", article_id, "VALIDATED", "REVIEWABLE", "G2_PASS", "REPORT_COMPLETE",
                media_id=media_id, payload={"review_summary": report})
    if log: log.append(row)
    return {"ok": True, "state": "REVIEWABLE", "report": report, "event": row}


def human_review(proposal: dict, decision: str, *, reason: str = "", log: AuditLog | None = None,
                 actor: str = "human-reviewer") -> dict:
    """G3: explicit human approval/rejection/reanchor; overrides are never silent."""
    decision = decision.upper()
    sinks = {"APPROVE": ("APPROVED", "HUMAN_APPROVED"), "REJECT": ("REJECTED", "HUMAN_REJECTED"),
             "REANCHOR": ("REANCHOR_REQUIRED", "HUMAN_REANCHOR")}
    if decision not in sinks:
        raise ValueError("decision must be APPROVE, REJECT or REANCHOR")
    state, code = sinks[decision]
    row = event("media", proposal["article_id"], "REVIEWABLE", state, "G3_HUMAN", code,
                media_id=proposal["media_id"], payload={"reason": reason}, actor={"type": "human", "name": actor})
    if log: log.append(row)
    return {"ok": state == "APPROVED", "state": state, "event": row}


def staleness_check(proposal: dict, article_text: str, current_article_revision: str,
                    current_gate_reference: str, *, log: AuditLog | None = None) -> dict:
    """G4: an approval is valid only while both anchor and gate remain unchanged."""
    aid, mid = proposal["article_id"], proposal["media_id"]
    if current_gate_reference != proposal["gate"]["reference"]:
        return _fail(aid, mid, "APPROVED", "GATE_STALE", "gate reference changed or died", log)
    anchor = proposal["placement"]["anchor_text"]
    if anchor not in article_text:
        return _fail(aid, mid, "APPROVED", "ANCHOR_STALE", "approved anchor no longer resolves", log)
    if current_article_revision != proposal["article_revision"]:
        return _fail(aid, mid, "APPROVED", "ANCHOR_CHANGED", "article revision changed after approval", log)
    row = event("media", aid, "APPROVED", "APPROVED", "G4_PASS", "MEDIA_APPROVAL_FRESH", media_id=mid,
                payload={"article_revision": current_article_revision, "anchor_hash": sha256_text(anchor),
                         "gate_reference": current_gate_reference})
    if log: log.append(row)
    return {"ok": True, "state": "APPROVED", "event": row}


def article_assembly_check(article: dict, approved_media: list[dict], *, min_heavy_text_distance: int = 300,
                           log: AuditLog | None = None) -> dict:
    """Article layer: validate the ensemble, not only individually good pieces."""
    aid = article["article_id"]
    text = str(article.get("text_without_media") or "")
    if POSITIONAL_DEIXIS.search(text):
        row = event("article", aid, "ASSEMBLY_CHECK", "CONFLICT", "ASSEMBLY_FAIL", "ASSEMBLY_DANGLING_POINTER")
        if log: log.append(row)
        return {"ok": False, "state": "CONFLICT", "reason_code": "ASSEMBLY_DANGLING_POINTER", "event": row}

    bridges = [m for m in approved_media if str(m.get("nomad_bridge") or "").strip()]
    if len(bridges) > 2:
        demote = min(bridges, key=lambda m: float(m["gate"].get("confidence", 0)))
        row = event("article", aid, "ASSEMBLY_CHECK", "CONFLICT", "ASSEMBLY_FAIL", "ASSEMBLY_NOMAD_LIMIT",
                    payload={"demote_media_id": demote["media_id"], "action": "caption_only"})
        if log: log.append(row)
        return {"ok": False, "state": "CONFLICT", "reason_code": "ASSEMBLY_NOMAD_LIMIT", "demote": demote["media_id"], "event": row}

    heavy = sorted([m for m in approved_media if m["placement"].get("weight") == "heavy"],
                   key=lambda m: int(m["placement"].get("anchor_offset", 0)))
    lead_boundary = int(article.get("lead_boundary", 0))
    for m in heavy:
        if int(m["placement"].get("anchor_offset", 0)) < lead_boundary:
            row = event("article", aid, "ASSEMBLY_CHECK", "CONFLICT", "ASSEMBLY_FAIL", "ASSEMBLY_RHYTHM_CONFLICT",
                        payload={"demote_media_id": m["media_id"], "reason": "heavy_before_lead"})
            if log: log.append(row)
            return {"ok": False, "state": "CONFLICT", "reason_code": "ASSEMBLY_RHYTHM_CONFLICT", "demote": m["media_id"], "event": row}
    for a, b in zip(heavy, heavy[1:]):
        distance = int(b["placement"].get("anchor_offset", 0)) - int(a["placement"].get("anchor_offset", 0))
        if distance < min_heavy_text_distance:
            demote = min((a, b), key=lambda m: float(m["gate"].get("confidence", 0)))
            row = event("article", aid, "ASSEMBLY_CHECK", "CONFLICT", "ASSEMBLY_FAIL", "ASSEMBLY_RHYTHM_CONFLICT",
                        payload={"demote_media_id": demote["media_id"], "text_distance": distance})
            if log: log.append(row)
            return {"ok": False, "state": "CONFLICT", "reason_code": "ASSEMBLY_RHYTHM_CONFLICT", "demote": demote["media_id"], "event": row}

    fingerprint = [(m["placement"].get("anchor_section"), m["placement"].get("media_class"), m["placement"].get("weight")) for m in approved_media]
    row = event("article", aid, "ASSEMBLY_CHECK", "CORPUS_CHECK", "ASSEMBLY_PASS", "ASSEMBLY_PASS",
                payload={"approved_media_count": len(approved_media), "nomad_bridge_count": len(bridges), "fingerprint": fingerprint})
    if log: log.append(row)
    return {"ok": True, "state": "CORPUS_CHECK", "fingerprint": fingerprint, "event": row}


def _fingerprint_string(fp) -> str:
    return "|".join("/".join(str(x or "") for x in item) for item in fp)


def corpus_check(article_id: str, approved_media: list[dict], fingerprint: list,
                 corpus_records: list[dict], *, similarity_threshold: float = .85,
                 log: AuditLog | None = None) -> dict:
    """Corpus layer: flag bridge repetition and structural sameness; never silent."""
    current_bridges = {norm(m.get("nomad_bridge")) for m in approved_media if norm(m.get("nomad_bridge"))}
    for record in corpus_records:
        prior = {norm(x) for x in record.get("nomad_bridges", []) if norm(x)}
        duplicates = sorted(current_bridges & prior)
        if duplicates:
            row = event("corpus", article_id, "CORPUS_CHECK", "BRIDGE_REWRITE", "CORPUS_FAIL", "CORPUS_BRIDGE_DUPLICATE",
                        payload={"duplicates": duplicates, "article": record.get("article_id")})
            if log: log.append(row)
            return {"ok": False, "state": "BRIDGE_REWRITE", "reason_code": "CORPUS_BRIDGE_DUPLICATE", "event": row}

    current = _fingerprint_string(fingerprint)
    best = (0.0, None)
    for record in corpus_records:
        score = SequenceMatcher(None, current, _fingerprint_string(record.get("fingerprint") or [])).ratio()
        if score > best[0]: best = (score, record.get("article_id"))
    if best[0] >= similarity_threshold:
        row = event("corpus", article_id, "CORPUS_CHECK", "CORPUS_REVIEW_REQUIRED", "CORPUS_FLAG", "CORPUS_FINGERPRINT_FLAG",
                    payload={"similarity": round(best[0], 4), "similar_article": best[1], "threshold": similarity_threshold})
        if log: log.append(row)
        return {"ok": False, "state": "CORPUS_REVIEW_REQUIRED", "reason_code": "CORPUS_FINGERPRINT_FLAG", "event": row}

    row = event("corpus", article_id, "CORPUS_CHECK", "COMPOSED", "CORPUS_PASS", "CORPUS_PASS",
                payload={"fingerprint": fingerprint, "max_similarity": round(best[0], 4)})
    if log: log.append(row)
    return {"ok": True, "state": "COMPOSED", "event": row}


def composition_token(article_audit_id: str, corpus_result: dict) -> str:
    """The future composer may only accept a token minted after CORPUS_PASS."""
    if not corpus_result.get("ok") or corpus_result.get("state") != "COMPOSED" or corpus_result["event"].get("reason_code") != "CORPUS_PASS":
        raise PermissionError("composition blocked: valid CORPUS_PASS required")
    return sha256_text(f"{article_audit_id}:{corpus_result['event']['event_id']}:CORPUS_PASS")
