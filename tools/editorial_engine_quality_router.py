#!/usr/bin/env python3
"""Passport Editorial Engine™ — quality-first zero-cost routing layer.

Keeps Constitution, Fact Pack, multiprovider cascade and quality gate authoritative.
Every approved RSS-derived story receives the Passport conversational editorial
brief; facts remain limited to verified Fact Pack material.
"""
from __future__ import annotations
import copy, json, os, re, sys
from pathlib import Path
from typing import Any
import editorial_engine_free as free
engine = free.engine

_PLACEHOLDER_VALUES={"artistas/bandas/albuns centrais","artistas/bandas/álbuns centrais","termos de busca"}
_routing_stats={"local_only":False,"routed_to_flash":0,"preserved_live_signal":0,"metadata_placeholders_removed":0,"structural_envelope_candidates":0,"draft_candidates":0,"generation_responses":0,"reprocess_attempts":0,"reprocess_successes":0,"reprocess_failures":0}

def _norm(v:Any)->str:return re.sub(r"\s+"," ",str(v or "").lower().strip())
def _external_free_configured()->bool:return any(os.environ.get(n,"").strip() for n in ("GROQ_API_KEY","GEMINI_API_KEY","OPENROUTER_API_KEY"))
def _local_only()->bool:return not _external_free_configured()
def _clamp_int(v,lo,hi,d):
    try:p=int(v)
    except Exception:p=d
    return max(lo,min(hi,p))

def _routed_candidate(candidate,config):
    routed=copy.deepcopy(candidate)
    if not _local_only():return routed
    _routing_stats["local_only"]=True
    original=str(routed.get("recommended_format") or "STORY").upper()
    if original=="LIVE_SIGNAL":_routing_stats["preserved_live_signal"]+=1;return routed
    local_format=str(config.get("local_zero_key_format","FLASH") or "FLASH").upper()
    if local_format not in {"FLASH","STORY","MR_NOMAD","LIVE_SIGNAL"}:local_format="STORY"
    routed["recommended_format"]=local_format;routed["_original_recommended_format"]=original
    if isinstance(routed.get("_fact_pack"),dict):
        routed["_fact_pack"]=copy.deepcopy(routed["_fact_pack"]);routed["_fact_pack"]["recommended_format"]=local_format
    if local_format=="FLASH" and original!="FLASH":_routing_stats["routed_to_flash"]+=1
    envelope=config.get("local_zero_key_flash_envelope")
    if local_format=="FLASH" and isinstance(envelope,dict):routed["_local_structural_envelope"]=copy.deepcopy(envelope);_routing_stats["structural_envelope_candidates"]+=1
    return routed

def _clean_generated_metadata(article):
    cleaned=copy.deepcopy(article);removed=0
    for key in ("entities","keywords"):
        values=cleaned.get(key) or []
        if not isinstance(values,list):continue
        kept=[]
        for value in values:
            if _norm(value) in _PLACEHOLDER_VALUES:removed+=1;continue
            kept.append(value)
        cleaned[key]=kept
    _routing_stats["metadata_placeholders_removed"]+=removed
    return cleaned

_base_structured_output_schema=free._structured_output_schema
def _format_aware_schema(candidate):
    schema=_base_structured_output_schema(candidate);fmt=str(candidate.get("recommended_format") or "STORY").upper();max_sections=int(engine.base.FORMAT_MAX_SECTIONS.get(fmt,5));sections=schema["properties"]["sections"];sections["maxItems"]=max_sections
    envelope=candidate.get("_local_structural_envelope")
    if fmt!="FLASH" or not isinstance(envelope,dict):return schema
    mins=_clamp_int(envelope.get("min_sections"),1,max_sections,2);maxs=_clamp_int(envelope.get("max_sections"),mins,max_sections,max_sections);minp=_clamp_int(envelope.get("min_paragraphs_per_section"),1,4,2);maxp=_clamp_int(envelope.get("max_paragraphs_per_section"),minp,4,3);minc=_clamp_int(envelope.get("min_paragraph_chars"),120,1200,420);maxc=_clamp_int(envelope.get("max_paragraph_chars"),minc,1600,680)
    sections["minItems"]=mins;sections["maxItems"]=maxs;pars=sections["items"]["properties"]["paragraphs"];pars["minItems"]=minp;pars["maxItems"]=maxp;pars["items"]["properties"]["text"]["minLength"]=minc;pars["items"]["properties"]["text"]["maxLength"]=maxc
    return schema
free._structured_output_schema=_format_aware_schema

def _robust_overwhelmingly_english(text):
    toks=engine.quality_gate.words(text)
    if len(toks)<45:return False
    pt,en,_=engine.quality_gate._language_counts(text);return en>=18 and en>=max(18,int(pt*1.6))
engine.quality_gate.looks_overwhelmingly_english=_robust_overwhelmingly_english

_base_build_prompt=engine.build_prompt
PASSPORT_STORY_DNA=(
"DNA EDITORIAL PASSPORT OBRIGATÓRIO PARA TODA PAUTA RSS: escreva como quem conhece música e conversa diretamente com o leitor, nunca como release, ficha técnica ou resumo de feed. "
"Comece pelo significado do acontecimento e construa uma história: provocação ou pergunta quando natural, fato, contexto, virada, desenvolvimento e fechamento. Varie o ritmo; frases curtas podem criar impacto, mas não imite bordões nem assine como Mr. Nomad. "
"Quando os fatos autorizados sustentarem, transforme a matéria em uma pequena enciclopédia narrativa: identifique banda e artistas, nomes artísticos e nomes civis, integrantes atuais ou históricos relevantes, funções, instrumentos principais e adicionais, origem, formação, projetos paralelos, discos, músicas, turnês, festivais, cronologia e conexões com a história da música. "
"NUNCA invente um desses dados para completar a enciclopédia: só use o que estiver sustentado por fact_refs válidos. Se um detalhe não estiver verificado, omita. "
"SEO SEMÂNTICO: use naturalmente entidades e termos factuais que uma pessoa pesquisaria — artista, banda, música, álbum, gênero, subgênero, integrantes, instrumentos, ano, cidade, país, festival e evento — sem keyword stuffing e sem repetir nomes artificialmente. "
"A matéria pública é Passport Radio: não exponha veículo de descoberta, URL, genealogia da pauta ou metadados internos de provenance. "
)

def _quality_routed_prompt(candidate,source_text,config):
    instructions,input_text=_base_build_prompt(candidate,source_text,config);fmt=str(candidate.get("recommended_format") or "STORY").upper()
    instructions=PASSPORT_STORY_DNA+instructions
    input_text += "\nOBJETIVO PASSPORT: conte a história maior por trás do sinal sem ultrapassar os fatos autorizados. Faça entities e keywords funcionarem como mapa semântico real da matéria."
    if _local_only():
        minimum=int((config.get("minimum_words") or {}).get(fmt,500));target_low=minimum+int(config.get("local_zero_key_target_margin_words",40));target_high=target_low+int(config.get("local_zero_key_target_window_words",180));max_sections=int(engine.base.FORMAT_MAX_SECTIONS.get(fmt,5))
        instructions=("REGRA LOCAL ABSOLUTA: todo texto editorial público em português brasileiro. Nomes próprios mantêm grafia oficial. Arrays entities e keywords só contêm valores reais. "+f"No formato {fmt}, produza aproximadamente {target_low} a {target_high} palavras factuais úteis em até {max_sections} seções; jamais preencha espaço inventando. "+instructions)
    corrections=candidate.get("_editorial_correction")
    if isinstance(corrections,list) and corrections:
        notes="; ".join(str(x) for x in corrections)[:1800];instructions="REPROCESSAMENTO ÚNICO: corrija sem acrescentar fatos. ERROS: "+notes+". "+instructions
    return instructions,input_text
engine.build_prompt=_quality_routed_prompt
_original_call=free.call_free_multiprovider

def _draft_diagnosis(article,candidate,config):
    safe=engine.safe_article(copy.deepcopy(article),candidate);errs=engine.validate_article(safe,candidate,config);pack=candidate.get("_fact_pack") if isinstance(candidate.get("_fact_pack"),dict) else {"facts":[]};gate=engine.quality_gate.evaluate(safe,pack,config);return errs,gate

def _needs_one_retry(errs,gate,config):
    if max(0,min(1,int(config.get("local_zero_key_retry_limit",1))))<1:return False
    if str(gate.get("decision"))=="WOULD_REJECT":return False
    return bool(errs) or str(gate.get("decision"))=="WOULD_REPROCESS"

def call_quality_routed(candidate,source_text,config):
    routed=_routed_candidate(candidate,config);first=_clean_generated_metadata(_original_call(routed,source_text,config));_routing_stats["draft_candidates"]+=1;_routing_stats["generation_responses"]+=1
    errs,gate=_draft_diagnosis(first,routed,config)
    if not _needs_one_retry(errs,gate,config):return first
    reasons=list(errs)+[str(x) for x in (gate.get("reasons") or [])];retry=copy.deepcopy(routed);retry["_editorial_correction"]=list(dict.fromkeys(reasons))[:12];_routing_stats["reprocess_attempts"]+=1
    try:repaired=_clean_generated_metadata(_original_call(retry,source_text,config));_routing_stats["generation_responses"]+=1
    except Exception:_routing_stats["reprocess_failures"]+=1;return first
    re,rg=_draft_diagnosis(repaired,retry,config)
    if not re and str(rg.get("decision"))=="WOULD_PUBLISH":_routing_stats["reprocess_successes"]+=1
    else:_routing_stats["reprocess_failures"]+=1
    return repaired

def provider_runtime_snapshot():
    snap=free.provider_runtime_snapshot() or {};snap["quality_router"]=copy.deepcopy(_routing_stats);return snap

def _report_path_from_argv():
    try:i=sys.argv.index("--output-dir");return Path(sys.argv[i+1])/"engine-report.json"
    except Exception:return engine.ROOT/"build/editorial-engine/engine-report.json"
def _annotate_report():
    p=_report_path_from_argv()
    if not p.exists():return
    try:r=json.loads(p.read_text("utf-8"))
    except Exception:return
    r["version"]=max(5,int(r.get("version",0) or 0));r["drafted"]=_routing_stats["draft_candidates"];r["generation_responses"]=_routing_stats["generation_responses"];r["reprocessed"]=_routing_stats["reprocess_attempts"];r["reprocess_successes"]=_routing_stats["reprocess_successes"];r["published"]=len(r.get("generated") or []);r["passport_story_dna"]=True;p.write_text(json.dumps(r,ensure_ascii=False,indent=2)+"\n","utf-8")
def main():
    rc=engine.main();_annotate_report();return rc
engine.call_openai=call_quality_routed;engine.provider_runtime_snapshot=provider_runtime_snapshot
if __name__=="__main__":raise SystemExit(main())
