#!/usr/bin/env python3
"""Synthetic Golden Corpus for Passport Editorial Constitution™ quality gate."""
from __future__ import annotations
import json
import os
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str((ROOT / "tools").resolve()))
import editorial_quality_gate as gate
import editorial_engine_free as free
import editorial_engine_quality_router as router

FACTS = [
    {"fact_id":"F_TITLE","type":"signal_title","value":"Iron Maiden anuncia show no Brasil","evidence":"Iron Maiden announces a concert in Brazil","source_ids":["S1"],"status":"DIRECT","critical":True,"allowed_for_generation":True},
    {"fact_id":"F_DATE","type":"date","value":"12 de outubro de 2026","evidence":"tickets on sale 12 October 2026","source_ids":["S1"],"status":"SUPPORTED","critical":True,"allowed_for_generation":True},
    {"fact_id":"F_CONFLICT","type":"date","value":"13 de outubro de 2026","evidence":"another date","source_ids":["S2"],"status":"CONFLICTED","critical":True,"allowed_for_generation":False},
]
PACK = {"facts": FACTS}


def article(paragraphs, closing="A agenda recoloca a banda no radar brasileiro.", title="Iron Maiden prepara novo encontro com o público brasileiro", entities=None, heading="O anúncio"):
    return {
        "title": title,
        "deck":"A banda volta ao Brasil com uma nova data no calendário.",
        "meta_description":"Iron Maiden confirma novo compromisso no Brasil.",
        "entities": entities if entities is not None else ["Iron Maiden", "Brasil"],
        "sections":[{"heading":heading,"paragraphs":paragraphs}],
        "closing":closing,
    }


long_evidence = " ".join(f"palavra{i}" for i in range(1, 46))
copy_pack = {"facts":[{"fact_id":"F_COPY","type":"source_statement","value":long_evidence,"evidence":long_evidence,"source_ids":["S1"],"status":"SUPPORTED","critical":True,"allowed_for_generation":True}]}
english_text = (
    "The band has announced a new concert in Brazil and the show will bring the group back to the country. "
    "The announcement is part of the new tour and the group has said the event will be a major stop on the schedule. "
    "The concert is set to happen after the current run of shows and the band will continue with the tour across the region. "
    "This is the latest update from the group and the new date is expected to attract fans from across the country."
)

cases = [
    ("good", article([{"text":"Iron Maiden volta ao Brasil em uma nova etapa de sua agenda de shows.","fact_refs":["F_TITLE"]}]), PACK, "WOULD_PUBLISH", False),
    ("missing_refs", article(["Iron Maiden volta ao Brasil em uma nova etapa de sua agenda de shows."]), PACK, "WOULD_REPROCESS", False),
    ("unknown_ref", article([{"text":"Iron Maiden volta ao Brasil em uma nova etapa de sua agenda de shows.","fact_refs":["F_DOES_NOT_EXIST"]}]), PACK, "WOULD_REJECT", True),
    ("disallowed_ref", article([{"text":"A data alternativa aparece como 13 de outubro de 2026.","fact_refs":["F_CONFLICT"]}]), PACK, "WOULD_REJECT", True),
    ("truncated", article([{"text":"Iron Maiden volta ao Brasil em uma nova etapa de sua agenda","fact_refs":["F_TITLE"]}], closing="Fecho."), PACK, "WOULD_REPROCESS", False),
    ("no_paragraphs", article([]), PACK, "WOULD_REJECT", True),
    ("verbatim_copy", article([{"text":long_evidence + ".","fact_refs":["F_COPY"]}]), copy_pack, "WOULD_REJECT", True),
    ("short_noncopy", article([{"text":"palavra1 palavra2 palavra3 palavra4 palavra5 fecham o contexto sem reproduzir a origem.","fact_refs":["F_COPY"]}]), copy_pack, "WOULD_PUBLISH", False),
    ("english_public_copy", article([{"text":english_text,"fact_refs":["F_TITLE"]}], title="Iron Maiden Announces A New Concert In Brazil", closing="The band remains on the road."), PACK, "WOULD_REPROCESS", True),
    ("schema_placeholder", article([{"text":"Iron Maiden volta ao Brasil em uma nova etapa de sua agenda de shows.","fact_refs":["F_TITLE"]}], entities=["artistas/bandas/álbuns centrais"], heading="Subtítulo: O anúncio"), PACK, "WOULD_REPROCESS", True),
    ("unsupported_number", article([{"text":"Iron Maiden volta ao Brasil e tocará diante de 90000 pessoas.","fact_refs":["F_TITLE"]}]), PACK, "WOULD_REPROCESS", True),
]

cfg={"quality_gate":{"require_fact_refs":True,"require_ptbr":True,"anti_copy_window_words":40}}
rows=[]
for name, art, pack, expected, critical in cases:
    result=gate.evaluate(art, pack, cfg)
    actual=result["decision"]
    rows.append({"name":name,"expected":expected,"actual":actual,"critical":critical,"reasons":result.get("reasons",[])})
metrics=gate.golden_metrics(rows)

# Structured provenance contract from Phase 2 stays mandatory.
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

# Local-only specialization is deterministic and never relaxes the gate.
engine_cfg=json.loads((ROOT / "data/editorial-engine.json").read_text("utf-8"))
assert engine_cfg["version"] >= 9
assert engine_cfg["local_zero_key_format"] == "FLASH"
assert engine_cfg["local_zero_key_force_batch"] == 2
assert engine_cfg["minimum_words"]["FLASH"] == 300

saved={name:os.environ.get(name) for name in ("GROQ_API_KEY","GEMINI_API_KEY","OPENROUTER_API_KEY")}
try:
    for name in saved:
        os.environ.pop(name, None)
    original={"recommended_format":"MR_NOMAD","_fact_pack":{"recommended_format":"MR_NOMAD","facts":FACTS}}
    routed=router._routed_candidate(original, engine_cfg)
    assert original["recommended_format"] == "MR_NOMAD"
    assert routed["recommended_format"] == "FLASH"
    assert routed["_fact_pack"]["recommended_format"] == "FLASH"
finally:
    for name,value in saved.items():
        if value is None:
            os.environ.pop(name, None)
        else:
            os.environ[name]=value

cleaned=router._clean_generated_metadata({
    "entities":["artistas/bandas/álbuns centrais","Iron Maiden"],
    "keywords":["termos de busca","heavy metal"],
})
assert cleaned["entities"] == ["Iron Maiden"]
assert cleaned["keywords"] == ["heavy metal"]

print(json.dumps({"rows":rows,"metrics":metrics,"structured_output_fact_ids":refs_schema["items"]["enum"],"local_router":"FLASH"}, ensure_ascii=False, indent=2))
assert metrics["critical_false_accept"] == 0, metrics
assert metrics["false_accept"] == 0, metrics
assert metrics["correct"] == len(rows), metrics
