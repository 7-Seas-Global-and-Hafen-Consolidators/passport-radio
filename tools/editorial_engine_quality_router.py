#!/usr/bin/env python3
"""Passport Editorial Engine™ — zero-cost local quality routing layer.

This wrapper keeps the Constitution, Fact Pack, multiprovider cascade and
quality gate authoritative. It specializes the no-key local fallback, aligns the
Ollama structured schema with each editorial format and gives one corrective
retry to drafts that are structurally repairable without weakening any gate.
"""
from __future__ import annotations

import copy
import json
import os
from pathlib import Path
import re
import sys
from typing import Any

import editorial_engine_free as free

engine = free.engine

_PLACEHOLDER_VALUES = {
    "artistas/bandas/albuns centrais",
    "artistas/bandas/álbuns centrais",
    "termos de busca",
}
_routing_stats = {
    "local_only": False,
    "routed_to_flash": 0,
    "preserved_live_signal": 0,
    "metadata_placeholders_removed": 0,
    "draft_candidates": 0,
    "generation_responses": 0,
    "reprocess_attempts": 0,
    "reprocess_successes": 0,
    "reprocess_failures": 0,
}


def _norm(value: Any) -> str:
    text = str(value or "").lower().strip()
    return re.sub(r"\s+", " ", text)


def _external_free_configured() -> bool:
    return any(
        os.environ.get(name, "").strip()
        for name in ("GROQ_API_KEY", "GEMINI_API_KEY", "OPENROUTER_API_KEY")
    )


def _local_only() -> bool:
    return not _external_free_configured()


def _routed_candidate(candidate: dict[str, Any], config: dict[str, Any]) -> dict[str, Any]:
    routed = copy.deepcopy(candidate)
    if not _local_only():
        return routed

    _routing_stats["local_only"] = True
    original = str(routed.get("recommended_format") or "STORY").upper()
    if original == "LIVE_SIGNAL":
        _routing_stats["preserved_live_signal"] += 1
        return routed

    local_format = str(config.get("local_zero_key_format", "FLASH") or "FLASH").upper()
    if local_format not in {"FLASH", "STORY", "MR_NOMAD", "LIVE_SIGNAL"}:
        local_format = "FLASH"
    routed["recommended_format"] = local_format
    routed["_original_recommended_format"] = original
    if isinstance(routed.get("_fact_pack"), dict):
        routed["_fact_pack"] = copy.deepcopy(routed["_fact_pack"])
        routed["_fact_pack"]["recommended_format"] = local_format
    if local_format == "FLASH" and original != "FLASH":
        _routing_stats["routed_to_flash"] += 1
    return routed


def _clean_generated_metadata(article: dict[str, Any]) -> dict[str, Any]:
    """Remove exact schema-example echoes from non-factual metadata only.

    This never repairs article prose or facts. Any prose/schema echo remains for
    the authoritative quality gate to reject or reprocess.
    """
    cleaned = copy.deepcopy(article)
    removed = 0
    for key in ("entities", "keywords"):
        values = cleaned.get(key) or []
        if not isinstance(values, list):
            continue
        kept = []
        for value in values:
            if _norm(value) in _PLACEHOLDER_VALUES:
                removed += 1
                continue
            kept.append(value)
        cleaned[key] = kept
    _routing_stats["metadata_placeholders_removed"] += removed
    return cleaned


# The provider schema must never allow a shape that the production validator
# rejects. The original launcher remains the source of truth for provenance IDs;
# this wrapper only tightens section count according to the active format.
_base_structured_output_schema = free._structured_output_schema


def _format_aware_schema(candidate: dict[str, Any]) -> dict[str, Any]:
    schema = _base_structured_output_schema(candidate)
    fmt = str(candidate.get("recommended_format") or "STORY").upper()
    max_sections = int(engine.base.FORMAT_MAX_SECTIONS.get(fmt, 5))
    schema["properties"]["sections"]["maxItems"] = max_sections
    return schema


free._structured_output_schema = _format_aware_schema


# The old detector could let heavily-English copy pass merely because a few
# accented Portuguese words appeared. Keep the same cheap marker strategy, but
# decide on the language balance rather than an accent escape hatch.
def _robust_overwhelmingly_english(text: str) -> bool:
    toks = engine.quality_gate.words(text)
    if len(toks) < 45:
        return False
    pt, en, _accents = engine.quality_gate._language_counts(text)
    return en >= 18 and en >= max(18, int(pt * 1.6))


engine.quality_gate.looks_overwhelmingly_english = _robust_overwhelmingly_english


_base_build_prompt = engine.build_prompt


def _quality_routed_prompt(candidate: dict[str, Any], source_text: str, config: dict[str, Any]):
    instructions, input_text = _base_build_prompt(candidate, source_text, config)
    fmt = str(candidate.get("recommended_format") or "STORY").upper()
    if _local_only():
        minimum = int((config.get("minimum_words") or {}).get(fmt, 300))
        target_low = minimum + int(config.get("local_zero_key_target_margin_words", 40))
        target_high = target_low + int(config.get("local_zero_key_target_window_words", 100))
        max_sections = int(engine.base.FORMAT_MAX_SECTIONS.get(fmt, 5))
        instructions = (
            "REGRA LOCAL ABSOLUTA: todo texto editorial público deve ser escrito exclusivamente em português brasileiro. "
            "Nomes próprios podem manter grafia original, mas frases, títulos, subtítulos, deck e fechamento não podem sair em inglês. "
            "Os arrays entities e keywords devem conter valores reais ou ficar vazios; nunca copie exemplos do esquema JSON. "
            f"No formato {fmt}, produza aproximadamente {target_low} a {target_high} palavras úteis, sem inventar fatos, "
            f"usando no máximo {max_sections} seções. "
            "O título deve ser editorialmente novo e estruturalmente diferente da manchete de descoberta. "
            "Prefira precisão e completude a enchimento artificial. "
            + instructions
        )
        input_text += (
            "\nMODO LOCAL ZERO-KEY: compactação editorial autorizada somente pela troca de formato; "
            "nenhum gate factual, de provenance, idioma, anti-cópia ou estrutura foi relaxado."
        )

    corrections = candidate.get("_editorial_correction")
    if isinstance(corrections, list) and corrections:
        notes = "; ".join(str(x) for x in corrections)[:1800]
        instructions = (
            "REPROCESSAMENTO ÚNICO: corrija o rascunho anterior sem acrescentar fatos novos. "
            "Reescreva somente o necessário para satisfazer os erros abaixo. "
            "Se faltou comprimento, desenvolva apenas fatos já autorizados pelos fact_refs; "
            "se o título ficou próximo da descoberta, crie outro enquadramento; "
            "se o idioma falhou, reescreva TODOS os campos públicos em pt-BR; "
            "se a estrutura falhou, respeite rigorosamente o limite de seções. "
            f"ERROS A CORRIGIR: {notes}. "
            + instructions
        )
    return instructions, input_text


engine.build_prompt = _quality_routed_prompt
_original_call = free.call_free_multiprovider


def _draft_diagnosis(article: dict[str, Any], candidate: dict[str, Any], config: dict[str, Any]) -> tuple[list[str], dict[str, Any]]:
    safe = engine.safe_article(copy.deepcopy(article), candidate)
    production_errors = engine.validate_article(safe, candidate, config)
    pack = candidate.get("_fact_pack") if isinstance(candidate.get("_fact_pack"), dict) else {"facts": []}
    gate_result = engine.quality_gate.evaluate(safe, pack, config)
    return production_errors, gate_result


def _needs_one_retry(production_errors: list[str], gate_result: dict[str, Any], config: dict[str, Any]) -> bool:
    limit = max(0, min(1, int(config.get("local_zero_key_retry_limit", 1))))
    if limit < 1:
        return False
    if str(gate_result.get("decision")) == "WOULD_REJECT":
        return False
    return bool(production_errors) or str(gate_result.get("decision")) == "WOULD_REPROCESS"


def call_quality_routed(candidate: dict[str, Any], source_text: str, config: dict[str, Any]):
    routed = _routed_candidate(candidate, config)
    first = _clean_generated_metadata(_original_call(routed, source_text, config))
    _routing_stats["draft_candidates"] += 1
    _routing_stats["generation_responses"] += 1

    production_errors, gate_result = _draft_diagnosis(first, routed, config)
    if not _needs_one_retry(production_errors, gate_result, config):
        return first

    reasons = list(production_errors)
    reasons.extend(str(x) for x in (gate_result.get("reasons") or []))
    retry_candidate = copy.deepcopy(routed)
    retry_candidate["_editorial_correction"] = list(dict.fromkeys(reasons))[:12]
    _routing_stats["reprocess_attempts"] += 1

    try:
        repaired = _clean_generated_metadata(_original_call(retry_candidate, source_text, config))
        _routing_stats["generation_responses"] += 1
    except Exception:
        _routing_stats["reprocess_failures"] += 1
        return first

    repaired_errors, repaired_gate = _draft_diagnosis(repaired, retry_candidate, config)
    if not repaired_errors and str(repaired_gate.get("decision")) == "WOULD_PUBLISH":
        _routing_stats["reprocess_successes"] += 1
    else:
        _routing_stats["reprocess_failures"] += 1
    return repaired


def provider_runtime_snapshot() -> dict[str, Any]:
    snap = free.provider_runtime_snapshot() or {}
    snap["quality_router"] = copy.deepcopy(_routing_stats)
    return snap


def _report_path_from_argv() -> Path:
    default = engine.ROOT / "build/editorial-engine"
    try:
        idx = sys.argv.index("--output-dir")
        return Path(sys.argv[idx + 1]) / "engine-report.json"
    except Exception:
        return default / "engine-report.json"


def _annotate_report() -> None:
    """Make GENERATED != APPROVED != PUBLISHED explicit in the artifact report."""
    path = _report_path_from_argv()
    if not path.exists():
        return
    try:
        report = json.loads(path.read_text("utf-8"))
    except Exception:
        return
    report["version"] = max(3, int(report.get("version", 0) or 0))
    report["drafted"] = int(_routing_stats["draft_candidates"])
    report["generation_responses"] = int(_routing_stats["generation_responses"])
    report["reprocessed"] = int(_routing_stats["reprocess_attempts"])
    report["reprocess_successes"] = int(_routing_stats["reprocess_successes"])
    report["published"] = len(report.get("generated") or [])
    path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", "utf-8")


def main() -> int:
    rc = engine.main()
    _annotate_report()
    return rc


engine.call_openai = call_quality_routed
engine.provider_runtime_snapshot = provider_runtime_snapshot

if __name__ == "__main__":
    raise SystemExit(main())
