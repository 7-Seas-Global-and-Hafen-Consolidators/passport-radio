#!/usr/bin/env python3
"""Regression tests for the real Passport Radio false-accept observed on run #67."""
from __future__ import annotations

import copy
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str((ROOT / "tools").resolve()))

import editorial_quality_gate as gate
import editorial_engine_quality_router as router

CFG = json.loads((ROOT / "data/editorial-engine.json").read_text("utf-8"))
assert CFG["version"] >= 12

BOX_FACT = {
    "fact_id": "F_BOX",
    "type": "source_statement",
    "value": "four-LP deluxe set",
    "evidence": "The deluxe edition is a four-LP set with a 60-page book and two art prints.",
    "source_ids": ["S1"],
    "status": "SUPPORTED",
    "critical": True,
    "allowed_for_generation": True,
}
TITLE_FACT = {
    "fact_id": "F_TITLE",
    "type": "signal_title",
    "value": "Beyoncé announces a deluxe anniversary edition",
    "evidence": "Beyoncé announces a deluxe anniversary edition.",
    "source_ids": ["S1"],
    "status": "DIRECT",
    "critical": True,
    "allowed_for_generation": True,
}
PACK = {"facts": [BOX_FACT, TITLE_FACT]}


def make_article(paragraphs, heading="Uma edição de aniversário", title="Beyoncé prepara edição especial de aniversário"):
    return {
        "title": title,
        "deck": "A edição de aniversário reúne material físico e conteúdo adicional confirmado.",
        "meta_description": "A edição especial ganha novos detalhes de lançamento.",
        "entities": ["Beyoncé"],
        "sections": [{"heading": heading, "paragraphs": paragraphs}],
        "closing": "A Passport acompanha somente os detalhes confirmados para a edição especial.",
    }


# 1) Regression of the exact factual class observed in production: four-LP must
# never become sete-LP while still carrying the same Fact Pack provenance.
quantity_bad = make_article([
    {
        "text": "A edição especial reúne sete LPs e amplia a apresentação física do projeto para os colecionadores.",
        "fact_refs": ["F_BOX"],
    }
])
quantity_result = gate.evaluate(quantity_bad, PACK, CFG)
assert quantity_result["decision"] == "WOULD_REPROCESS", quantity_result
assert any(reason.startswith("unverified_quantities:") for reason in quantity_result["reasons"]), quantity_result

# Positive control: cross-language equivalent quantity is allowed.
quantity_good = make_article([
    {
        "text": "A edição especial reúne quatro LPs, além do livro e das impressões descritos no material confirmado.",
        "fact_refs": ["F_BOX"],
    }
])
quantity_good_result = gate.evaluate(quantity_good, PACK, CFG)
assert not any(reason.startswith("unverified_quantities:") for reason in quantity_good_result["reasons"]), quantity_good_result

# 2) Long near-duplicate filler must not pass merely because every paragraph has
# a valid fact_ref. This mirrors the repeated-body failure from run #67.
p1 = (
    "A edição de aniversário reúne o conjunto físico confirmado e recoloca o projeto no centro da conversa entre colecionadores. "
    "O pacote combina os discos, o livro e as impressões de arte descritos no anúncio, sem acrescentar detalhes além do material disponível. "
    "A proposta editorial da Passport é registrar o que foi confirmado e separar informação factual de expectativa promocional."
)
p2 = (
    "A edição de aniversário reúne o conjunto físico confirmado e recoloca o projeto no centro da conversa entre colecionadores. "
    "O pacote combina os discos, o livro e as impressões de arte descritos no anúncio, sem acrescentar detalhes além do material disponível. "
    "A proposta editorial da Passport é registrar o que foi confirmado e separar informação factual de expectativa promocional para o público."
)
repeat_bad = make_article([
    {"text": p1, "fact_refs": ["F_BOX", "F_TITLE"]},
    {"text": p2, "fact_refs": ["F_BOX", "F_TITLE"]},
])
repeat_result = gate.evaluate(repeat_bad, PACK, CFG)
assert repeat_result["decision"] == "WOULD_REPROCESS", repeat_result
assert any(reason.startswith("near_duplicate_paragraphs:") for reason in repeat_result["reasons"]), repeat_result

# Positive control: repeating the artist/fact context alone must not trigger the
# near-duplicate guard when the paragraphs actually carry different information.
distinct = make_article([
    {
        "text": "Beyoncé volta ao catálogo de aniversário com uma edição física apresentada como um conjunto de quatro LPs. O dado central aqui é a configuração do box, que define o formato material do lançamento sem exigir interpretação adicional.",
        "fact_refs": ["F_BOX"],
    },
    {
        "text": "Beyoncé também aparece no anúncio como o nome central da edição comemorativa. Para a Passport, essa informação serve apenas para identificar o evento editorial e não autoriza inferências sobre turnê, vendas, produção ou recepção comercial.",
        "fact_refs": ["F_TITLE"],
    },
])
distinct_result = gate.evaluate(distinct, PACK, CFG)
assert not any(reason.startswith("near_duplicate_paragraphs:") for reason in distinct_result["reasons"]), distinct_result

# 3) Generic headings are repairable once, never publishable as-is.
heading_bad = make_article([
    {"text": "A edição especial foi anunciada e mantém os detalhes factuais do conjunto físico confirmado.", "fact_refs": ["F_BOX"]}
], heading="Subtítulo")
heading_result = gate.evaluate(heading_bad, PACK, CFG)
assert heading_result["decision"] == "WOULD_REPROCESS", heading_result
assert "generic_section_headings:1" in heading_result["reasons"], heading_result

# 4) The router may retry a repairable heading exactly once. If the second draft
# still contains a generic heading, it remains non-publishable and no recursive
# retry is allowed.
def generated_generic():
    return {
        "title": "Uma edição de aniversário volta ao catálogo de Beyoncé",
        "deck": "A edição comemorativa reúne os elementos físicos confirmados no anúncio.",
        "kicker": "PASSPORT RADIO",
        "format": "FLASH",
        "category": "legacy_archive",
        "meta_description": "Uma atualização factual sobre a edição comemorativa.",
        "entities": ["Beyoncé"],
        "keywords": ["Beyoncé"],
        "sections": [{
            "heading": "Subtítulo",
            "paragraphs": [{
                "text": "A edição comemorativa retorna ao catálogo com os elementos físicos descritos no anúncio original, mantendo o foco apenas no conjunto confirmado e sem introduzir previsões ou detalhes externos ao Fact Pack.",
                "fact_refs": ["F_BOX"],
            }],
        }],
        "closing": "A Passport mantém o registro restrito aos detalhes confirmados para essa edição.",
    }

candidate = {
    "title": "Beyoncé announces a deluxe anniversary edition",
    "description": "The deluxe edition is a four-LP set.",
    "primary_category": "legacy_archive",
    "recommended_format": "FLASH",
    "_fact_pack": {"event_id": "EVT_REG", "story_angle_id": "ANG_REG", "facts": copy.deepcopy(PACK["facts"])},
    "_event_id": "EVT_REG",
    "_story_angle_id": "ANG_REG",
}

original_call = router._original_call
base_attempts = router._routing_stats["reprocess_attempts"]
responses = [generated_generic(), generated_generic()]
try:
    def fake_call(_candidate, _source_text, _config):
        return copy.deepcopy(responses.pop(0))

    router._original_call = fake_call
    retry_cfg = copy.deepcopy(CFG)
    retry_cfg["minimum_words"]["FLASH"] = 20
    result = router.call_quality_routed(candidate, "", retry_cfg)
    assert router._routing_stats["reprocess_attempts"] == base_attempts + 1
    assert not responses, "the router must consume exactly first draft + one retry"
    _errors, second_gate = router._draft_diagnosis(result, router._routed_candidate(candidate, retry_cfg), retry_cfg)
    assert second_gate["decision"] == "WOULD_REPROCESS", second_gate
    assert "generic_section_headings:1" in second_gate["reasons"], second_gate
finally:
    router._original_call = original_call

# Known adversarial limitation is documented separately and must not be confused
# with a solved deterministic guardrail.
known = json.loads((ROOT / "tests/editorial-known-failures.json").read_text("utf-8"))
assert any(row.get("id") == "unsupported-claims-despite-valid-paragraph-refs" and row.get("status") == "KNOWN_UNRESOLVED" for row in known)

print(json.dumps({
    "false_accept_regressions": "PASS",
    "quantity_guard": quantity_result["reasons"],
    "near_duplicate_guard": repeat_result["reasons"],
    "generic_heading_guard": heading_result["reasons"],
    "known_adversarial_failures": len(known),
}, ensure_ascii=False, indent=2))
