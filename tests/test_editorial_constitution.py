#!/usr/bin/env python3
"""Synthetic Golden Corpus for Passport Editorial Constitution™ quality gate."""
from __future__ import annotations
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str((ROOT / "tools").resolve()))
import editorial_quality_gate as gate
import editorial_engine_free as free

FACTS = [
    {"fact_id":"F_TITLE","type":"signal_title","value":"Iron Maiden anuncia show no Brasil","evidence":"Iron Maiden announces a concert in Brazil","source_ids":["S1"],"status":"DIRECT","critical":True,"allowed_for_generation":True},
    {"fact_id":"F_DATE","type":"date","value":"12 de outubro de 2026","evidence":"tickets on sale 12 October 2026","source_ids":["S1"],"status":"SUPPORTED","critical":True,"allowed_for_generation":True},
    {"fact_id":"F_CONFLICT","type":"date","value":"13 de outubro de 2026","evidence":"another date","source_ids":["S2"],"status":"CONFLICTED","critical":True,"allowed_for_generation":False},
]
PACK = {"facts": FACTS}


def article(paragraphs, closing="A agenda recoloca a banda no radar brasileiro."):
    return {
        "title":"Iron Maiden prepara novo encontro com o público brasileiro",
        "deck":"A banda volta ao Brasil com uma nova data no calendário.",
        "meta_description":"Iron Maiden confirma novo compromisso no Brasil.",
        "sections":[{"heading":"O anúncio","paragraphs":paragraphs}],
        "closing":closing,
    }


long_evidence = " ".join(f"palavra{i}" for i in range(1, 46))
copy_pack = {"facts":[{"fact_id":"F_COPY","type":"source_statement","value":long_evidence,"evidence":long_evidence,"source_ids":["S1"],"status":"SUPPORTED","critical":True,"allowed_for_generation":True}]}

cases = [
    ("good", article([{"text":"Iron Maiden volta ao Brasil em uma nova etapa de sua agenda de shows.","fact_refs":["F_TITLE"]}]), PACK, "WOULD_PUBLISH", False),
    ("missing_refs", article(["Iron Maiden volta ao Brasil em uma nova etapa de sua agenda de shows."]), PACK, "WOULD_REPROCESS", False),
    ("unknown_ref", article([{"text":"Iron Maiden volta ao Brasil em uma nova etapa de sua agenda de shows.","fact_refs":["F_DOES_NOT_EXIST"]}]), PACK, "WOULD_REJECT", True),
    ("disallowed_ref", article([{"text":"A data alternativa aparece como 13 de outubro de 2026.","fact_refs":["F_CONFLICT"]}]), PACK, "WOULD_REJECT", True),
    ("truncated", article([{"text":"Iron Maiden volta ao Brasil em uma nova etapa de sua agenda","fact_refs":["F_TITLE"]}], closing="Fecho."), PACK, "WOULD_REPROCESS", False),
    ("no_paragraphs", article([]), PACK, "WOULD_REJECT", True),
    ("verbatim_copy", article([{"text":long_evidence + ".","fact_refs":["F_COPY"]}]), copy_pack, "WOULD_REJECT", True),
    ("short_noncopy", article([{"text":"palavra1 palavra2 palavra3 palavra4 palavra5 fecham o contexto sem reproduzir a origem.","fact_refs":["F_COPY"]}]), copy_pack, "WOULD_PUBLISH", False),
]

rows=[]
for name, art, pack, expected, critical in cases:
    actual=gate.evaluate(art, pack, {"quality_gate":{"require_fact_refs":True,"anti_copy_window_words":40}})["decision"]
    rows.append({"name":name,"expected":expected,"actual":actual,"critical":critical})
metrics=gate.golden_metrics(rows)

# Phase 2 contract: local Ollama structured output makes provenance structural.
schema_candidate = {
    "recommended_format": "STORY",
    "_fact_pack": {"facts": FACTS},
}
schema = free._structured_output_schema(schema_candidate)
paragraph_schema = schema["properties"]["sections"]["items"]["properties"]["paragraphs"]["items"]
refs_schema = paragraph_schema["properties"]["fact_refs"]
assert paragraph_schema["required"] == ["text", "fact_refs"]
assert refs_schema["minItems"] == 1
assert set(refs_schema["items"]["enum"]) == {"F_TITLE", "F_DATE"}
assert "F_CONFLICT" not in refs_schema["items"]["enum"]
assert schema["additionalProperties"] is False

print(json.dumps({"rows":rows,"metrics":metrics,"structured_output_fact_ids":refs_schema["items"]["enum"]}, ensure_ascii=False, indent=2))
assert metrics["critical_false_accept"] == 0, metrics
assert metrics["correct"] == len(rows), metrics
