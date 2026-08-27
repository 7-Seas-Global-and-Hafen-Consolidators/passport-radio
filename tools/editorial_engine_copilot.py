#!/usr/bin/env python3
"""Copilot-backed launcher for Passport Editorial Engine™ Full Story.

Worldwide discovery stays multilingual. Every public story is reconstructed as
original Passport Radio journalism in Brazilian Portuguese, using the source page
body fetched by the base engine whenever it is publicly accessible. Official
proper names remain untouched. Operation target: 500/day, capacity: 700/day,
max batch: 12/run.
"""
from __future__ import annotations

import os
import subprocess

import editorial_engine as engine

NITRO_HARD_CAP = 700
COPILOT_MODEL = os.environ.get("PASSPORT_EDITORIAL_MODEL", "").strip() or "auto"
_generation_calls_used = 0


def install_full_story_prompt() -> None:
    original_build_prompt = engine.build_prompt

    def build_prompt_global(candidate, source_text, config):
        instructions, input_text = original_build_prompt(candidate, source_text, config)
        instructions += (
            " A saída pública é obrigatoriamente português brasileiro natural e consistente. "
            "O material de apoio pode estar em qualquer idioma ou alfabeto: compreenda os fatos e "
            "reescreva-os em pt-BR, sem tradução literal. Preserve a grafia oficial de artistas, "
            "bandas, músicas, álbuns, festivais, gravadoras, locais e demais nomes próprios. "
            "Use prioritariamente o corpo factual extraído da página original quando disponível; "
            "o resumo RSS é apenas fallback. Produza uma matéria completa, substancial, com abertura, "
            "desenvolvimento, contexto e fechamento, sem copiar frases da origem e sem inventar fatos. "
            "Se um detalhe não puder ser sustentado pelo material disponível ou por pesquisa verificável, omita-o. "
            "Evite mistura gratuita de idiomas, frases genéricas, enchimento e repetição."
        )
        language = str(candidate.get("language") or "não informado")
        axes = ", ".join(str(x) for x in (candidate.get("categories") or [])[:12])
        body_state = "corpo extraído disponível" if len(source_text or "") >= 700 else "corpo limitado; usar metadados e pesquisa verificável"
        input_text += f"\nIDIOMA DO SINAL: {language}\nEIXOS INTERNOS: {axes or 'music'}\nESTADO DO CORPO: {body_state}\nIDIOMA FINAL OBRIGATÓRIO: pt-BR"
        return instructions, input_text

    engine.build_prompt = build_prompt_global


def call_copilot(candidate, source_text, config):
    global _generation_calls_used
    budget = max(1, min(12, int(config.get("generation_call_budget_per_run", 12))))
    if _generation_calls_used >= budget:
        raise RuntimeError("generation_budget_exhausted")
    _generation_calls_used += 1
    instructions, input_text = engine.build_prompt(candidate, source_text, config)
    prompt = instructions + "\n\n" + input_text
    cmd = ["copilot", "-p", prompt, "-s", "--no-ask-user", "--model", COPILOT_MODEL]
    env = os.environ.copy()
    token = env.get("COPILOT_GITHUB_TOKEN", "").strip() or env.get("GH_TOKEN", "").strip() or env.get("GITHUB_TOKEN", "").strip()
    if not token:
        raise RuntimeError("Copilot authentication token is not available")
    env["COPILOT_GITHUB_TOKEN"] = token
    env["GH_TOKEN"] = token
    env["GITHUB_TOKEN"] = token
    proc = subprocess.run(cmd, capture_output=True, text=True, env=env, timeout=int(config.get("api_timeout_seconds", 240)))
    if proc.returncode != 0:
        detail = (proc.stderr or proc.stdout or "Copilot CLI failed").strip()
        raise RuntimeError(detail[-1600:])
    return engine.parse_json_text(proc.stdout)


install_full_story_prompt()
engine.call_openai = call_copilot
os.environ["OPENAI_API_KEY"] = "passport-copilot-full-story"

if __name__ == "__main__":
    raise SystemExit(engine.main())
