#!/usr/bin/env python3
"""Passport Editorial Engine™ — zero-cost local quality routing layer.

This wrapper keeps the existing Constitution, Fact Pack, multiprovider cascade and
quality gate intact. It only specializes the no-key local fallback: when no
external free provider is configured, the small local model is asked for the
compact FLASH format instead of being forced to imitate long-form MR_NOMAD/STORY
output it cannot reliably sustain. Quality gates remain authoritative.
"""
from __future__ import annotations

import copy
import os
import re
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


_base_build_prompt = engine.build_prompt


def _quality_routed_prompt(candidate: dict[str, Any], source_text: str, config: dict[str, Any]):
    instructions, input_text = _base_build_prompt(candidate, source_text, config)
    if _local_only():
        instructions = (
            "REGRA LOCAL ABSOLUTA: todo texto editorial público deve ser escrito exclusivamente em português brasileiro. "
            "Nomes próprios podem manter grafia original, mas frases, títulos, subtítulos, deck e fechamento não podem sair em inglês. "
            "Os arrays entities e keywords devem conter valores reais ou ficar vazios; nunca copie exemplos do esquema JSON. "
            "Prefira uma matéria FLASH factual, compacta e completa a tentar alongar artificialmente o texto. "
            + instructions
        )
        input_text += (
            "\nMODO LOCAL ZERO-KEY: compactação editorial autorizada somente pela troca de formato; "
            "nenhum gate factual, de provenance, idioma, anti-cópia ou estrutura foi relaxado."
        )
    return instructions, input_text


engine.build_prompt = _quality_routed_prompt
_original_call = free.call_free_multiprovider


def call_quality_routed(candidate: dict[str, Any], source_text: str, config: dict[str, Any]):
    routed = _routed_candidate(candidate, config)
    result = _original_call(routed, source_text, config)
    return _clean_generated_metadata(result)


def provider_runtime_snapshot() -> dict[str, Any]:
    snap = free.provider_runtime_snapshot() or {}
    snap["quality_router"] = copy.deepcopy(_routing_stats)
    return snap


engine.call_openai = call_quality_routed
engine.provider_runtime_snapshot = provider_runtime_snapshot

if __name__ == "__main__":
    raise SystemExit(engine.main())
