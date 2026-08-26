#!/usr/bin/env python3
"""Quota-economy launcher for Passport Editorial Engine™ Global.

The worldwide Radar/Tunnel may keep up to 1,200 selected signals. Public operation
is intentionally small and quality-first: six publication opportunities per day,
one article maximum per Engine run and one Copilot generation call maximum per run.

Generation uses GitHub Copilot CLI with model `auto`, allowing Copilot to select a
model actually available to the account. There is no OpenAI API paid fallback and
no second Copilot retry lane. If the single generation call fails, the run reports
the failure and waits for the next paced window instead of burning more quota.

No backend changes the editorial firewall, deduplication, PT-BR renderer or native
Mr. Nomad signature.
"""
from __future__ import annotations

import os
import subprocess

import editorial_engine as engine


NITRO_HARD_CAP = engine.RESERVOIR_HARD_CAP
COPILOT_MODEL = os.environ.get("PASSPORT_EDITORIAL_MODEL", "").strip() or "auto"
GENERATION_CALL_BUDGET = 1
_generation_calls_used = 0


def install_global_prompt() -> None:
    """Tell the generator how to treat multilingual worldwide discovery."""
    original_build_prompt = engine.build_prompt

    def build_prompt_global(candidate, source_text, config):
        instructions, input_text = original_build_prompt(candidate, source_text, config)
        instructions += (
            " O material de apoio pode estar em qualquer idioma ou alfabeto. "
            "Compreenda e reconstrua os fatos em português do Brasil sem tradução literal, "
            "preservando grafia oficial de artistas, bandas, álbuns, locais e nomes próprios. "
            "Não trate cenas fora do eixo EUA-Reino Unido-Brasil como curiosidade exótica: "
            "dê contexto local, musical e histórico com o mesmo rigor editorial. "
            "Esta é uma seleção de apenas seis publicações por dia entre um radar global amplo: "
            "trate a pauta como peça editorial de alto valor, sem enchimento, repetição ou texto genérico."
        )
        language = str(candidate.get("language") or "não informado")
        axes = ", ".join(str(x) for x in (candidate.get("categories") or [])[:12])
        input_text += f"\nIDIOMA DO SINAL: {language}\nEIXOS INTERNOS DO RADAR: {axes or 'music'}"
        return instructions, input_text

    engine.build_prompt = build_prompt_global


def call_copilot(candidate, source_text, config):
    instructions, input_text = engine.build_prompt(candidate, source_text, config)
    prompt = instructions + "\n\n" + input_text
    cmd = [
        "copilot",
        "-p",
        prompt,
        "-s",
        "--no-ask-user",
        "--model",
        COPILOT_MODEL,
    ]

    env = os.environ.copy()
    token = (
        env.get("COPILOT_GITHUB_TOKEN", "").strip()
        or env.get("GH_TOKEN", "").strip()
        or env.get("GITHUB_TOKEN", "").strip()
    )
    if not token:
        raise RuntimeError("Copilot authentication token is not available")

    env["COPILOT_GITHUB_TOKEN"] = token
    env["GH_TOKEN"] = token
    env["GITHUB_TOKEN"] = token

    proc = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        env=env,
        timeout=int(config.get("api_timeout_seconds", 180)),
    )
    if proc.returncode != 0:
        detail = (proc.stderr or proc.stdout or "Copilot CLI failed").strip()
        raise RuntimeError(detail[-1200:])
    return engine.parse_json_text(proc.stdout)


def call_quota_economy(candidate, source_text, config):
    """Spend at most one Copilot generation request in an Engine process."""
    global _generation_calls_used

    configured_budget = int(config.get("generation_call_budget_per_run", 1))
    if configured_budget != GENERATION_CALL_BUDGET:
        raise RuntimeError(
            f"invalid generation_call_budget_per_run={configured_budget}; operational budget is 1"
        )
    if _generation_calls_used >= GENERATION_CALL_BUDGET:
        raise RuntimeError("quota_economy_generation_budget_exhausted")

    _generation_calls_used += 1
    try:
        return call_copilot(candidate, source_text, config)
    except Exception as exc:
        raise RuntimeError(f"copilot_auto={type(exc).__name__}: {str(exc)[-900:]}") from exc


install_global_prompt()
engine.call_openai = call_quota_economy

# The base engine uses OPENAI_API_KEY only as a readiness gate before invoking
# engine.call_openai. The launcher replaces that generator with Copilot above;
# this placeholder never authenticates to or calls the OpenAI API.
os.environ["OPENAI_API_KEY"] = "passport-copilot-quota-economy"

if __name__ == "__main__":
    raise SystemExit(engine.main())
