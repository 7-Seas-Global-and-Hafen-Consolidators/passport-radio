#!/usr/bin/env python3
from pathlib import Path
import json
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
import newsroom_placement_audit as a


def proposal(media_id="youtube:official", confidence=.91, *, anchor_offset=500, bridge=""):
    anchor = "Polyphia lançou POWER IN THE BLOOD."
    return {
        "article_id": "polyphia-be-not-afraid",
        "article_revision": "rev-001",
        "media_id": media_id,
        "gate": {"reference": "gate-001", "score": .88, "confidence": confidence},
        "placement": {
            "anchor_text": anchor,
            "anchor_section": "power-in-the-blood",
            "anchor_hash": a.sha256_text(anchor),
            "anchor_offset": anchor_offset,
            "media_role": "performance",
            "media_class": "music_video",
            "weight": "heavy",
            "placement_reason": "A execução filmada é o objeto editorial.",
            "form_ladder_note": "movimento e performance exigem vídeo",
            "caption": "POWER IN THE BLOOD, vídeo oficial de Polyphia ligado a Be Not Afraid, 2026."
        },
        "provenance": {"source": "Polyphia official channel", "temporality": "current", "year": 2026, "context": "Be Not Afraid"},
        "runners_up": [
            {"media_id": "youtube:promo", "reason_rejected": "promo_clip"},
            {"media_id": "image:press", "reason_rejected": "forma não mostra performance"}
        ],
        "accessibility": {"transcript_available": False, "description": "Videoclipe oficial da banda executando POWER IN THE BLOOD."},
        "playback": {"autoplay": False, "reciprocal_interlock": True},
        "removal_test": True,
        "nomad_bridge": bridge,
    }


def main():
    manifest = json.loads((ROOT / "ops/canary/placement-audit-001.json").read_text(encoding="utf-8"))
    assert manifest["version"] == "placement-audit-001"

    text = "Lide consolidado. " + proposal()["placement"]["anchor_text"] + " Contexto posterior suficiente para a matéria."
    p = proposal()
    log = a.AuditLog()

    g1 = a.validate_media(p, text, log=log)
    assert g1["ok"] and g1["state"] == "VALIDATED", g1
    g2 = a.build_review_report(p, log=log)
    assert g2["ok"] and g2["state"] == "REVIEWABLE", g2
    g3 = a.human_review(p, "APPROVE", reason="golden positive", log=log)
    assert g3["state"] == "APPROVED", g3
    g4 = a.staleness_check(p, text, "rev-001", "gate-001", log=log)
    assert g4["ok"], g4

    stale = a.staleness_check(p, text.replace(p["placement"]["anchor_text"], "Texto reeditado."), "rev-001", "gate-001")
    assert stale["state"] == "REANCHOR_REQUIRED" and stale["reason_code"] == "ANCHOR_STALE", stale

    bad_deixis = proposal()
    bad_deixis["nomad_bridge"] = "Assista ao vídeo abaixo."
    r = a.validate_media(bad_deixis, text)
    assert r["state"] == "REANCHOR_REQUIRED" and r["reason_code"] == "DEIXIS_POSITIONAL", r

    unknown = proposal()
    unknown["provenance"]["temporality"] = "unknown"
    unknown["placement"]["media_role"] = "evidence"
    r = a.validate_media(unknown, text)
    assert r["reason_code"] == "TEMPORALITY_UNKNOWN_EVIDENCE", r

    article = {"article_id": p["article_id"], "text_without_media": text, "lead_boundary": 100}
    second = proposal("youtube:second", .82, anchor_offset=650)
    r = a.article_assembly_check(article, [p, second], min_heavy_text_distance=300)
    assert r["state"] == "CONFLICT" and r["demote"] == "youtube:second", r

    second["placement"]["anchor_offset"] = 900
    assembly = a.article_assembly_check(article, [p, second], min_heavy_text_distance=300)
    assert assembly["ok"] and assembly["state"] == "CORPUS_CHECK", assembly

    duplicate = a.corpus_check(p["article_id"], [p], assembly["fingerprint"], [{
        "article_id": "older-story", "nomad_bridges": ["É aqui que a história ganha movimento."], "fingerprint": []
    }])
    assert duplicate["state"] == "COMPOSED", duplicate

    bridged = proposal(bridge="É aqui que a história ganha movimento.")
    duplicate = a.corpus_check(p["article_id"], [bridged], assembly["fingerprint"], [{
        "article_id": "older-story", "nomad_bridges": ["É aqui que a história ganha movimento."], "fingerprint": []
    }])
    assert duplicate["state"] == "BRIDGE_REWRITE", duplicate

    similar = a.corpus_check(p["article_id"], [p], assembly["fingerprint"], [{
        "article_id": "same-shape", "nomad_bridges": [], "fingerprint": assembly["fingerprint"]
    }])
    assert similar["state"] == "CORPUS_REVIEW_REQUIRED", similar

    corpus = a.corpus_check(p["article_id"], [p], assembly["fingerprint"], [])
    token = a.composition_token("audit-001", corpus)
    assert len(token) == 64
    try:
        a.composition_token("audit-001", similar)
        raise AssertionError("composition token must fail without CORPUS_PASS")
    except PermissionError:
        pass

    assert len(log.events) >= 4
    print("newsroom_placement_audit: PASS")


if __name__ == "__main__":
    main()
