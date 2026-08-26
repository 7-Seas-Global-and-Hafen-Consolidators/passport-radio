#!/usr/bin/env python3
"""Resilient launcher for Passport Editorial Engine™ Global.

The base engine owns the approved 1,200-signal reservoir, 800/day public hard
stop, 10-story maximum batch, 24-hour pacing, multilingual factual fetch and
native Mr. Nomad renderer. This launcher supplies the worldwide PT-BR prompt
and a generation failover chain:

1. OpenAI Responses API when OPENAI_API_KEY is configured.
2. GitHub Copilot CLI using the configured/default model.
3. GitHub Copilot CLI using GPT-5 mini as the quota-emergency fallback.

No backend changes the editorial firewall, deduplication or publication caps.
"""
from __future__ import annotations

import os
import subprocess

import editorial_engine as engine


NITRO_HARD_CAP = engine.RESERVOIR_HARD_CAP
BASE_OPENAI_CALL = engine.call_openai
REAL_OPENAI_KEY = os.environ.get("OPENAI_API_KEY", "").strip()
COPILOT_EMERGENCY_MODEL = (
    os.environ.get("PASSPORT_COPILOT_FALLBACK_MODEL", "").strip() or "gpt-5-mini"
)


def install_global_prompt() -> None:
    """Tell every generator how to treat multilingual worldwide discovery."""
    original_build_prompt = engine.build_prompt

    def build_prompt_global(candidate, source_text, config):
        instructions, input_text = original_build_prompt(candidate, source_text, config)
        instructions += (
            " O material de apoio pode estar em qualquer idioma ou alfabeto. "
            "Compreenda e reconstrua os fatos em português do Brasil sem tradução literal, "
            "preservando grafia oficial de artistas, bandas, álbuns, locais e nomes próprios. "
            "Não trate cenas fora do eixo EUA-Reino Unido-Brasil como curiosidade exótica: "
            "dê contexto local, musical e histórico com o mesmo rigor editorial."
        )
        language = str(candidate.get("language") or "não informado")
        axes = ", ".join(str(x) for x in (candidate.get("categories") or [])[:12])
        input_text += f"\nIDIOMA DO SINAL: {language}\nEIXOS INTERNOS DO RADAR: {axes or 'music'}"
        return instructions, input_text

    engine.build_prompt = build_prompt_global


def call_copilot(candidate, source_text, config, model_override: str = ""):
    instructions, input_text = engine.build_prompt(candidate, source_text, config)
    prompt = instructions + "\n\n" + input_text
    cmd = ["copilot", "-p", prompt, "-s", "--no-ask-user"]
    model = model_override.strip() or os.environ.get("PASSPORT_EDITORIAL_MODEL", "").strip()
    if model:
        cmd.extend(["--model", model])

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


def call_resilient(candidate, source_text, config):
    """Generate with automatic backend failover without weakening validation."""
    errors: list[str] = []

    if REAL_OPENAI_KEY:
        try:
            return BASE_OPENAI_CALL(candidate, source_text, config)
        except Exception as exc:  # the next backend may still be healthy
            errors.append(f"openai_api={type(exc).__name__}: {str(exc)[-700:]}")
    else:
        errors.append("openai_api=OPENAI_API_KEY not configured")

    configured_model = os.environ.get("PASSPORT_EDITORIAL_MODEL", "").strip()
    try:
        return call_copilot(candidate, source_text, config)
    except Exception as exc:
        primary_error = f"copilot_primary={type(exc).__name__}: {str(exc)[-700:]}"
        errors.append(primary_error)

    # GitHub documents that included Copilot models can remain available after
    # a legacy premium-request quota is exhausted. GPT-5 mini is supported by
    # Copilot CLI and is deliberately used only as the emergency lane.
    if configured_model.lower() != COPILOT_EMERGENCY_MODEL.lower():
        try:
            return call_copilot(
                candidate,
                source_text,
                config,
                model_override=COPILOT_EMERGENCY_MODEL,
            )
        except Exception as exc:
            errors.append(
                f"copilot_{COPILOT_EMERGENCY_MODEL}={type(exc).__name__}: {str(exc)[-700:]}"
            )

    raise RuntimeError("All editorial generation backends failed | " + " | ".join(errors))


install_global_prompt()
engine.call_openai = call_resilient
# The base engine uses OPENAI_API_KEY only as a readiness gate before calling
# the pluggable generator. GitHub Actions materializes an unset secret as an
# empty environment variable, so replace both missing and blank values with a
# harmless placeholder. REAL_OPENAI_KEY was captured above and still controls
# whether the real OpenAI API is attempted.
if not os.environ.get("OPENAI_API_KEY", "").strip():
    os.environ["OPENAI_API_KEY"] = "passport-resilient-launcher"

if __name__ == "__main__":
    raise SystemExit(engine.main())
