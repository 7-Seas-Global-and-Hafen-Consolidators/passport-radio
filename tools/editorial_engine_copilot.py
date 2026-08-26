#!/usr/bin/env python3
"""Copilot-backed launcher for Passport Editorial Engine™ Global.

Uses GitHub Copilot CLI with a personal fine-grained token supplied by the
workflow. The worldwide runtime owns the approved 1,200-signal reservoir,
800/day public hard stop, 10-story maximum batch and 24-hour pacing. The base
engine keeps deduplication, validation, ledger/feed handling and the public
source firewall.
"""
from __future__ import annotations

import os
import subprocess

import editorial_engine as engine
import editorial_engine_global as global_runtime
import editorial_renderer_global as global_renderer


NITRO_HARD_CAP = global_runtime.RESERVOIR_HARD_CAP


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

    # Copilot CLI prefers COPILOT_GITHUB_TOKEN, while some GitHub CLI
    # validation paths consult GH_TOKEN/GITHUB_TOKEN. Keep all three aligned
    # inside this subprocess only; checkout/artifact/push continue to use the
    # workflow's normal github.token.
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
engine.render_article = global_renderer.render_article
engine.call_openai = call_copilot
# The base generator uses this variable only as a readiness gate before calling
# the pluggable generator. Production generation is handled by Copilot here.
os.environ.setdefault("OPENAI_API_KEY", "passport-copilot-launcher")

if __name__ == "__main__":
    raise SystemExit(global_runtime.main())
