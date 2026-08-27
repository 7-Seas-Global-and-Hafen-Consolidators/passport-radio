#!/usr/bin/env python3
"""Zero-cost multiprovider launcher for Passport Editorial Constitution™.

Provider cascade per story:
1. Groq free-tier
2. Gemini free-tier
3. OpenRouter free router
4. Local Ollama on the GitHub Actions runner (no API key)

Phase 2 makes the local fallback use Ollama structured outputs with a dynamic JSON
schema whose paragraph fact_refs can reference only generation-safe Fact Pack IDs.
Unconfigured external providers are skipped rather than counted as failed calls.
"""
from __future__ import annotations

import copy
import json
import os
import socket
import sys
import urllib.error
import urllib.parse
import urllib.request

import editorial_engine_constitution as engine

_generation_calls_used = 0
_disabled_providers: set[str] = set()
_provider_failures: dict[str, int] = {}
_runtime: dict = {
    "providers": {},
    "generation_calls_used": 0,
    "generation_budget_exhausted": False,
}

engine.MAX_BATCH_HARD_CAP = 12


def _timeout(config: dict, name: str, default: int) -> int:
    configured = config.get("provider_timeouts", {}) if isinstance(config, dict) else {}
    try:
        return max(5, int(configured.get(name, default)))
    except Exception:
        return default


def _runtime_provider(name: str) -> dict:
    return _runtime["providers"].setdefault(name, {
        "attempts": 0,
        "successes": 0,
        "failures": 0,
        "skips": 0,
        "disabled": False,
        "last_error": "",
    })


def _record_success(name: str) -> None:
    row = _runtime_provider(name)
    row["successes"] += 1
    row["last_error"] = ""


def _record_failure(name: str, exc: Exception) -> str:
    detail = str(exc).replace("\n", " ")[-700:]
    row = _runtime_provider(name)
    row["failures"] += 1
    row["last_error"] = detail
    _provider_failures[name] = _provider_failures.get(name, 0) + 1

    low = detail.lower()
    immediate = "http 401" in low or "http 403" in low
    transient = "http 429" in low or "http 5" in low or "timed out" in low or "timeout" in low or "network error" in low
    if immediate or (transient and _provider_failures[name] >= 2):
        _disabled_providers.add(name)
        row["disabled"] = True
    return detail


def _provider_configured(name: str) -> bool:
    if name == "groq-free":
        return bool(os.environ.get("GROQ_API_KEY", "").strip())
    if name == "gemini-free":
        return bool(os.environ.get("GEMINI_API_KEY", "").strip())
    if name == "openrouter-free":
        return bool(os.environ.get("OPENROUTER_API_KEY", "").strip())
    return True


def provider_runtime_snapshot() -> dict:
    snap = copy.deepcopy(_runtime)
    snap["disabled_providers"] = sorted(_disabled_providers)
    return snap


def install_full_story_prompt() -> None:
    original_build_prompt = engine.build_prompt

    def build_prompt_global(candidate, source_text, config):
        instructions, input_text = original_build_prompt(candidate, source_text, config)
        fmt = str(candidate.get("recommended_format") or "STORY").upper()
        explicit_minimum = int((config.get("minimum_words") or {}).get(fmt, 850))
        instructions += (
            " A saída pública é obrigatoriamente português brasileiro natural e consistente. "
            "Preserve a grafia oficial de artistas, bandas, músicas, álbuns, festivais, gravadoras e locais. "
            "Produza abertura, desenvolvimento, contexto e fechamento apenas quando sustentados pelos fact_refs. "
            "Evite mistura gratuita de idiomas, frases genéricas, enchimento e repetição. "
            f"Para este formato, tente atingir pelo menos {explicit_minimum} palavras úteis sem inventar fatos. "
            "Se o Fact Pack não sustentar profundidade suficiente, prefira precisão a enchimento. "
            "Cada parágrafo DEVE conter ao menos um fact_ref válido do FACT_PACK. "
            "Responda somente com o JSON solicitado."
        )
        input_text += (
            f"\nMÍNIMO EDITORIAL DE REFERÊNCIA: {explicit_minimum} palavras"
            "\nIDIOMA FINAL OBRIGATÓRIO: pt-BR"
            "\nFACT_REFS SÃO OBRIGATÓRIOS E NÃO PODEM SER VAZIOS EM CADA PARÁGRAFO."
        )
        return instructions, input_text

    engine.build_prompt = build_prompt_global


def _post_json(url: str, payload: dict, headers: dict, timeout: int) -> dict:
    data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    request = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")[-1200:]
        raise RuntimeError(f"HTTP {exc.code}: {body}") from exc
    except (urllib.error.URLError, TimeoutError, socket.timeout) as exc:
        reason = getattr(exc, "reason", exc)
        raise RuntimeError(f"network error: {reason}") from exc


def _groq(prompt: str, config: dict) -> dict:
    key = os.environ.get("GROQ_API_KEY", "").strip()
    if not key:
        raise RuntimeError("GROQ_API_KEY unavailable")
    model = os.environ.get("PASSPORT_GROQ_MODEL", "openai/gpt-oss-120b").strip()
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.25,
        "max_completion_tokens": int(config.get("max_output_tokens", 9000)),
        "response_format": {"type": "json_object"},
    }
    data = _post_json(
        "https://api.groq.com/openai/v1/chat/completions",
        payload,
        {"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        _timeout(config, "groq", 30),
    )
    return engine.parse_json_text(data["choices"][0]["message"]["content"])


def _gemini(prompt: str, config: dict) -> dict:
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not key:
        raise RuntimeError("GEMINI_API_KEY unavailable")
    model = os.environ.get("PASSPORT_GEMINI_MODEL", "gemini-2.5-flash-lite").strip()
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{urllib.parse.quote(model, safe='')}:generateContent"
    payload = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.25,
            "maxOutputTokens": int(config.get("max_output_tokens", 9000)),
            "responseMimeType": "application/json",
        },
    }
    data = _post_json(
        url,
        payload,
        {"x-goog-api-key": key, "Content-Type": "application/json"},
        _timeout(config, "gemini", 45),
    )
    parts = data["candidates"][0]["content"]["parts"]
    return engine.parse_json_text("".join(str(part.get("text", "")) for part in parts))


def _openrouter_free(prompt: str, config: dict) -> dict:
    key = os.environ.get("OPENROUTER_API_KEY", "").strip()
    if not key:
        raise RuntimeError("OPENROUTER_API_KEY unavailable")
    model = os.environ.get("PASSPORT_OPENROUTER_MODEL", "openrouter/free").strip()
    if model != "openrouter/free" and not model.endswith(":free"):
        raise RuntimeError("OpenRouter paid model rejected: only openrouter/free or :free models are allowed")
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.25,
        "max_tokens": int(config.get("max_output_tokens", 9000)),
    }
    data = _post_json(
        "https://openrouter.ai/api/v1/chat/completions",
        payload,
        {
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://www.passportradio.online/",
            "X-Title": "Passport Radio Editorial Engine",
        },
        _timeout(config, "openrouter", 60),
    )
    return engine.parse_json_text(data["choices"][0]["message"]["content"])


def _safe_fact_ids(candidate: dict) -> list[str]:
    pack = candidate.get("_fact_pack") if isinstance(candidate, dict) else None
    facts = pack.get("facts", []) if isinstance(pack, dict) else []
    ids: list[str] = []
    for fact in facts:
        if not isinstance(fact, dict):
            continue
        fid = str(fact.get("fact_id") or "").strip()
        if not fid:
            continue
        if not fact.get("allowed_for_generation", True):
            continue
        if str(fact.get("status") or "").upper() in {"CONFLICTED", "INFERRED"}:
            continue
        ids.append(fid)
    return sorted(set(ids))


def _structured_output_schema(candidate: dict) -> dict:
    """Build the Ollama JSON schema from the current private Fact Pack.

    Paragraph provenance is structural: each paragraph must expose at least one
    fact_ref and each ref must be one of the generation-safe IDs in this pack.
    """
    valid_ids = _safe_fact_ids(candidate)
    if not valid_ids:
        raise RuntimeError("structured_output_schema has no generation-safe fact ids")
    fmt = str(candidate.get("recommended_format") or "STORY").upper()
    return {
        "type": "object",
        "additionalProperties": False,
        "properties": {
            "title": {"type": "string", "minLength": 5},
            "deck": {"type": "string", "minLength": 10},
            "kicker": {"type": "string"},
            "format": {"type": "string", "enum": [fmt]},
            "category": {"type": "string", "minLength": 2},
            "meta_description": {"type": "string", "minLength": 10},
            "entities": {"type": "array", "items": {"type": "string"}, "maxItems": 16},
            "keywords": {"type": "array", "items": {"type": "string"}, "maxItems": 16},
            "sections": {
                "type": "array",
                "minItems": 1,
                "maxItems": 6,
                "items": {
                    "type": "object",
                    "additionalProperties": False,
                    "properties": {
                        "heading": {"type": "string", "minLength": 2},
                        "paragraphs": {
                            "type": "array",
                            "minItems": 1,
                            "items": {
                                "type": "object",
                                "additionalProperties": False,
                                "properties": {
                                    "text": {"type": "string", "minLength": 21},
                                    "fact_refs": {
                                        "type": "array",
                                        "minItems": 1,
                                        "maxItems": 12,
                                        "items": {"type": "string", "enum": valid_ids},
                                    },
                                },
                                "required": ["text", "fact_refs"],
                            },
                        },
                    },
                    "required": ["heading", "paragraphs"],
                },
            },
            "closing": {"type": "string", "minLength": 5},
        },
        "required": [
            "title", "deck", "kicker", "format", "category", "meta_description",
            "entities", "keywords", "sections", "closing",
        ],
    }


def _ollama_local(prompt: str, config: dict, candidate: dict) -> dict:
    """Use an open-weight model running locally on the Actions runner; no key/billing."""
    endpoint = os.environ.get("PASSPORT_OLLAMA_URL", "http://127.0.0.1:11434/api/chat").strip()
    model = os.environ.get("PASSPORT_OLLAMA_MODEL", "qwen2.5:1.5b-instruct").strip()
    if not endpoint.startswith("http://127.0.0.1:") and not endpoint.startswith("http://localhost:"):
        raise RuntimeError("Ollama endpoint rejected: local loopback only")
    schema = _structured_output_schema(candidate)
    payload = {
        "model": model,
        "stream": False,
        "format": schema,
        "keep_alive": "15m",
        "messages": [{"role": "user", "content": prompt}],
        "options": {
            "temperature": 0,
            "num_predict": 3600,
            "num_ctx": 8192,
            "repeat_penalty": 1.08,
        },
    }
    timeout = int(os.environ.get("PASSPORT_OLLAMA_TIMEOUT", _timeout(config, "ollama", 330)))
    data = _post_json(endpoint, payload, {"Content-Type": "application/json"}, timeout)
    text = str((data.get("message") or {}).get("content") or "")
    if not text:
        raise RuntimeError("Ollama returned empty content")
    return engine.parse_json_text(text)


def call_free_multiprovider(candidate, source_text, config):
    global _generation_calls_used
    budget = max(1, min(12, int(config.get("generation_call_budget_per_run", 12))))
    if _generation_calls_used >= budget:
        _runtime["generation_budget_exhausted"] = True
        raise RuntimeError("generation_budget_exhausted")
    _generation_calls_used += 1
    _runtime["generation_calls_used"] = _generation_calls_used

    instructions, input_text = engine.build_prompt(candidate, source_text, config)
    full_prompt = instructions + "\n\n" + input_text
    failures = []

    providers = (
        ("groq-free", _groq),
        ("gemini-free", _gemini),
        ("openrouter-free", _openrouter_free),
        ("ollama-local-zero-key", lambda prompt, cfg: _ollama_local(prompt, cfg, candidate)),
    )
    for name, provider in providers:
        row = _runtime_provider(name)
        if not _provider_configured(name):
            row["skips"] += 1
            row["last_error"] = "not_configured"
            print(f"FREE_PROVIDER_SKIP provider={name} reason=not_configured", file=sys.stderr)
            continue
        if name in _disabled_providers:
            row["skips"] += 1
            print(f"FREE_PROVIDER_SKIP provider={name} reason=circuit_breaker", file=sys.stderr)
            continue
        row["attempts"] += 1
        try:
            result = provider(full_prompt, config)
            _record_success(name)
            print(f"FREE_PROVIDER_OK provider={name}", file=sys.stderr)
            return result
        except Exception as exc:
            detail = _record_failure(name, exc)
            failures.append(f"{name}: {detail}")
            print(f"FREE_PROVIDER_FAIL provider={name} detail={detail}", file=sys.stderr)

    if not failures:
        raise RuntimeError("all_free_providers_unavailable")
    raise RuntimeError("all_free_providers_exhausted | " + " | ".join(failures))


install_full_story_prompt()
engine.call_openai = call_free_multiprovider
engine.provider_runtime_snapshot = provider_runtime_snapshot
os.environ["OPENAI_API_KEY"] = "passport-zero-cost-multiprovider"

if __name__ == "__main__":
    raise SystemExit(engine.main())
