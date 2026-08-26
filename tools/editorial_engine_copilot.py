#!/usr/bin/env python3
"""Copilot-backed launcher for Passport Editorial Engine™ Global.

Uses GitHub Copilot CLI with a personal fine-grained token supplied by the
workflow. The base engine now owns the approved 1,200-signal capacity,
800/day public hard stop, 10-story maximum batch, 24-hour pacing, multilingual
source fetch and the native Mr. Nomad renderer. This launcher only supplies the
multilingual editorial prompt and Copilot generator.
"""
from __future__ import annotations

import os
import subprocess

import editorial_engine as engine


NITRO_HARD_CAP = engine.RESERVOIR_HARD_CAP


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
            "dê contexto local, musical e histórico com o mesmo rigor editorial."
        )
        language = str(candidate.get("language") or "não informado")
        axes = ", ".join(str(x) for x in (candidate.get("categories") or [])[:12])
        input_text += f"\nIDIOMA DO SINAL: {language}\nEIXOS INTERNOS DO RADAR: {axes or 'music'}"
        return instructions, input_text

    engine.build_prompt = build_prompt_global


def call_copilot(candidate, source_text, config):
    instructions, input_text = engine.build_prompt(candidate, source_text, config)
    prompt = instructions + "\n\n" + input_text
    cmd = ["copilot", "-p", prompt, "-s", "--no-ask-user"]
    model = os.environ.get("PASSPORT_EDITORIAL_MODEL", "").strip()
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


install_global_prompt()
engine.call_openai = call_copilot
# The base engine uses this variable only as a readiness gate before invoking
# the pluggable generator. The launcher replaces the generator with Copilot.
os.environ.setdefault("OPENAI_API_KEY", "passport-copilot-launcher")

if __name__ == "__main__":
    raise SystemExit(engine.main())
