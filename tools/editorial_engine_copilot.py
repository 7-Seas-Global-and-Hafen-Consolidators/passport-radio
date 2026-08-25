#!/usr/bin/env python3
"""Copilot-backed launcher for Passport Editorial Engine™.

Uses GitHub Copilot CLI with a personal fine-grained token supplied by the
workflow. The launcher intentionally normalizes all GitHub auth environment
variables inside the Copilot subprocess to the same personal token so GitHub
CLI user validation cannot accidentally fall back to the GitHub Actions app
token (which returns "Resource not accessible by integration" for /user).
"""
from __future__ import annotations

import os
import subprocess
import sys

import editorial_engine as engine


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

    # Copilot CLI prefers COPILOT_GITHUB_TOKEN, while some of its GitHub CLI
    # validation paths consult GH_TOKEN/GITHUB_TOKEN. Keep all three aligned
    # to the personal PAT for this subprocess only. The workflow's normal
    # github.token remains untouched for checkout, artifact access and pushes.
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


engine.call_openai = call_copilot
# The base engine uses this variable only as a readiness gate before invoking
# the pluggable generator. The launcher replaces the generator with Copilot.
os.environ.setdefault("OPENAI_API_KEY", "passport-copilot-launcher")

if __name__ == "__main__":
    raise SystemExit(engine.main())
