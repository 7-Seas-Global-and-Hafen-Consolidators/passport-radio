#!/usr/bin/env python3
"""Synthetic Golden Corpus for Passport Editorial Constitution™ quality gate."""
from __future__ import annotations
import copy
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
english_with_accents = english_text + " A edição também menciona música, ação, álbum, coração e público."

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
    ("english_with_accents_escape", article([{"text":english_with_accents,"fact_refs":["F_TITLE"]}], title="Iron Maiden Announces Another Concert In Brazil", closing="The band remains on the road."), PACK, "WOULD_REPROCESS", True),
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

# Structured provenance contract stays mandatory and the schema must agree with
# the production format's maximum section count.
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
assert schema["properties"]["sections"]["maxItems"] == 5
flash_schema = free._structured_output_schema({"recommended_format":"FLASH","_fact_pack":{"facts":FACTS}})
assert flash_schema["properties"]["sections"]["maxItems"] == 3

# Local-only specialization is deterministic and never relaxes the gate.
engine_cfg=json.loads((ROOT / "data/editorial-engine.json").read_text("utf-8"))
assert engine_cfg["version"] >= 10
assert engine_cfg["local_zero_key_format"] == "FLASH"
assert engine_cfg["local_zero_key_force_batch"] == 2
assert engine_cfg["local_zero_key_retry_limit"] == 1
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

# One corrective retry is allowed for repairable drafts. It must not recurse and
# it must keep the exact same Fact Pack/provenance contract.
def generated(title, body):
    return {
        "title":title,
        "deck":"A agenda ganha um novo capítulo para o público brasileiro.",
        "kicker":"PASSPORT RADIO",
        "format":"FLASH",
        "category":"metal",
        "meta_description":"Uma atualização factual da agenda do Iron Maiden no Brasil.",
        "entities":["Iron Maiden","Brasil"],
        "keywords":["Iron Maiden","Brasil"],
        "sections":[{"heading":"Uma nova etapa","paragraphs":[{"text":body,"fact_refs":["F_TITLE"]}]}],
        "closing":"A Passport acompanha os próximos movimentos confirmados da agenda.",
    }

retry_candidate={
    "title":"Iron Maiden confirma apresentação no Brasil",
    "description":"A banda confirmou nova apresentação no Brasil.",
    "primary_category":"metal",
    "recommended_format":"FLASH",
    "_fact_pack":{"event_id":"EVT_TEST","story_angle_id":"ANG_TEST","facts":copy.deepcopy(FACTS)},
    "_event_id":"EVT_TEST",
    "_story_angle_id":"ANG_TEST",
}
first_body="Iron Maiden confirma nova apresentação no Brasil e recoloca o país em sua agenda internacional."
second_body=(
    "Iron Maiden volta a colocar o Brasil em sua agenda de apresentações, abrindo uma nova etapa de contato com o público local. "
    "A confirmação reorganiza o calendário da banda e dá aos fãs brasileiros um novo ponto de referência para acompanhar os próximos anúncios oficiais. "
    "O movimento também reforça a presença do grupo no circuito internacional sem exigir qualquer informação além do fato já confirmado. "
    "Para a Passport, o ponto central é simples: existe um novo compromisso brasileiro no horizonte e qualquer detalhe adicional deve esperar confirmação factual antes de entrar na narrativa."
)
responses=[
    generated("Iron Maiden confirma apresentação no Brasil", first_body),
    generated("Uma nova escala brasileira entra na rota do Iron Maiden", second_body),
]
original_call=router._original_call
base_attempts=router._routing_stats["reprocess_attempts"]
base_successes=router._routing_stats["reprocess_successes"]
try:
    def fake_call(candidate, source_text, config):
        return copy.deepcopy(responses.pop(0))
    router._original_call=fake_call
    retry_cfg=copy.deepcopy(engine_cfg)
    retry_cfg["minimum_words"]["FLASH"]=50
    result=router.call_quality_routed(retry_candidate, "", retry_cfg)
    assert result["title"] == "Uma nova escala brasileira entra na rota do Iron Maiden"
    assert router._routing_stats["reprocess_attempts"] == base_attempts + 1
    assert router._routing_stats["reprocess_successes"] == base_successes + 1
    assert not responses
finally:
    router._original_call=original_call

print(json.dumps({
    "rows":rows,
    "metrics":metrics,
    "structured_output_fact_ids":refs_schema["items"]["enum"],
    "local_router":"FLASH",
    "flash_max_sections":flash_schema["properties"]["sections"]["maxItems"],
    "single_retry":True,
}, ensure_ascii=False, indent=2))
assert metrics["critical_false_accept"] == 0, metrics
assert metrics["false_accept"] == 0, metrics
assert metrics["correct"] == len(rows), metrics
