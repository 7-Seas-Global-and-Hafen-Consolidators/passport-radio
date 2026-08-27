#!/usr/bin/env python3
"""Zero-cost multiprovider launcher for Passport Editorial Engine™ Full Story.

Provider cascade per story:
1. Groq free-tier key/model
2. Gemini free-tier key/model
3. OpenRouter free router
4. Local Ollama model on the GitHub Actions runner (no API key)

The shared editorial engine, Tunnel queue, publication gates and pacing remain unchanged.
"""
from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

import editorial_engine as engine

NITRO_HARD_CAP = 700
_generation_calls_used = 0

engine.MAX_BATCH_HARD_CAP = 12


def install_full_story_prompt() -> None:
    original_build_prompt = engine.build_prompt

    def build_prompt_global(candidate, source_text, config):
        instructions, input_text = original_build_prompt(candidate, source_text, config)
        fmt = str(candidate.get("recommended_format") or "STORY").upper()
        explicit_minimum = {
            "FLASH": 500,
            "STORY": 950,
            "MR_NOMAD": 1250,
            "LIVE_SIGNAL": 620,
        }.get(fmt, 950)
        instructions += (
            " A saída pública é obrigatoriamente português brasileiro natural e consistente. "
            "O material de apoio pode estar em qualquer idioma ou alfabeto: compreenda os fatos e reescreva-os em pt-BR, sem tradução literal. "
            "Preserve a grafia oficial de artistas, bandas, músicas, álbuns, festivais, gravadoras, locais e demais nomes próprios. "
            "Use prioritariamente o corpo factual extraído da página original quando disponível; o resumo RSS é apenas fallback. "
            "Produza uma matéria completa, substancial, com abertura, desenvolvimento, contexto e fechamento, sem copiar frases da origem e sem inventar fatos. "
            "Se um detalhe não puder ser sustentado pelo material disponível, omita-o. "
            "Evite mistura gratuita de idiomas, frases genéricas, enchimento e repetição. "
            f"Para este formato, escreva no mínimo {explicit_minimum} palavras de texto editorial útil. "
            "Distribua o conteúdo em seções com parágrafos substanciais; não responda com resumo curto. "
            "Crie um título editorial novo e estruturalmente diferente do título do sinal de descoberta. "
            "Responda somente com o JSON solicitado pelo schema editorial, sem markdown ao redor."
        )
        language = str(candidate.get("language") or "não informado")
        axes = ", ".join(str(x) for x in (candidate.get("categories") or [])[:12])
        body_state = "corpo extraído disponível" if len(source_text or "") >= 700 else "corpo limitado; usar apenas fatos sustentáveis"
        input_text += (
            f"\nIDIOMA DO SINAL: {language}"
            f"\nEIXOS INTERNOS: {axes or 'music'}"
            f"\nESTADO DO CORPO: {body_state}"
            f"\nMÍNIMO EDITORIAL DESTA RESPOSTA: {explicit_minimum} palavras"
            "\nIDIOMA FINAL OBRIGATÓRIO: pt-BR"
            "\nIMPORTANTE: o título final não pode repetir nem apenas traduzir o título de entrada."
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
    except urllib.error.URLError as exc:
        raise RuntimeError(f"network error: {exc.reason}") from exc


def _groq(prompt: str, config: dict) -> dict:
    key = os.environ.get("GROQ_API_KEY", "").strip()
    if not key:
        raise RuntimeError("GROQ_API_KEY unavailable")
    model = os.environ.get("PASSPORT_GROQ_MODEL", "openai/gpt-oss-120b").strip()
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.35,
        "max_completion_tokens": int(config.get("max_output_tokens", 9000)),
        "response_format": {"type": "json_object"},
    }
    data = _post_json(
        "https://api.groq.com/openai/v1/chat/completions",
        payload,
        {"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        int(config.get("api_timeout_seconds", 240)),
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
            "temperature": 0.35,
            "maxOutputTokens": int(config.get("max_output_tokens", 9000)),
            "responseMimeType": "application/json",
        },
    }
    data = _post_json(
        url,
        payload,
        {"x-goog-api-key": key, "Content-Type": "application/json"},
        int(config.get("api_timeout_seconds", 240)),
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
        "temperature": 0.35,
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
        int(config.get("api_timeout_seconds", 240)),
    )
    return engine.parse_json_text(data["choices"][0]["message"]["content"])


def _ollama_local(prompt: str, config: dict) -> dict:
    """Use an open-weight model running locally on the Actions runner; no key/billing."""
    endpoint = os.environ.get("PASSPORT_OLLAMA_URL", "http://127.0.0.1:11434/api/chat").strip()
    model = os.environ.get("PASSPORT_OLLAMA_MODEL", "qwen2.5:1.5b-instruct").strip()
    if not endpoint.startswith("http://127.0.0.1:") and not endpoint.startswith("http://localhost:"):
        raise RuntimeError("Ollama endpoint rejected: local loopback only")
    payload = {
        "model": model,
        "stream": False,
        "format": "json",
        "keep_alive": "15m",
        "messages": [{"role": "user", "content": prompt}],
        "options": {
            "temperature": 0.25,
            "num_predict": 3600,
            "num_ctx": 8192,
            "repeat_penalty": 1.08,
        },
    }
    timeout = max(240, min(360, int(config.get("api_timeout_seconds", 240)) + 60))
    data = _post_json(endpoint, payload, {"Content-Type": "application/json"}, timeout)
    text = str((data.get("message") or {}).get("content") or "")
    if not text:
        raise RuntimeError("Ollama returned empty content")
    return engine.parse_json_text(text)


def call_free_multiprovider(candidate, source_text, config):
    global _generation_calls_used
    budget = max(1, min(12, int(config.get("generation_call_budget_per_run", 12))))
    if _generation_calls_used >= budget:
        raise RuntimeError("generation_budget_exhausted")
    _generation_calls_used += 1

    instructions, input_text = engine.build_prompt(candidate, source_text, config)
    full_prompt = instructions + "\n\n" + input_text
    failures = []

    providers = (
        ("groq-free", _groq, full_prompt),
        ("gemini-free", _gemini, full_prompt),
        ("openrouter-free", _openrouter_free, full_prompt),
    )
    for name, provider, prompt in providers:
        try:
            result = provider(prompt, config)
            print(f"FREE_PROVIDER_OK provider={name}", file=sys.stderr)
            return result
        except Exception as exc:
            detail = str(exc).replace("\n", " ")[-700:]
            failures.append(f"{name}: {detail}")
            print(f"FREE_PROVIDER_FAIL provider={name} detail={detail}", file=sys.stderr)

    # CPU inference needs a compact factual context to avoid long prefill/runaway output.
    compact_source = (source_text or "")[:7000]
    local_instructions, local_input = engine.build_prompt(candidate, compact_source, config)
    local_prompt = local_instructions + "\n\n" + local_input
    try:
        result = _ollama_local(local_prompt, config)
        print("FREE_PROVIDER_OK provider=ollama-local-zero-key", file=sys.stderr)
        return result
    except Exception as exc:
        detail = str(exc).replace("\n", " ")[-700:]
        failures.append(f"ollama-local-zero-key: {detail}")
        print(f"FREE_PROVIDER_FAIL provider=ollama-local-zero-key detail={detail}", file=sys.stderr)

    raise RuntimeError("all_free_providers_exhausted | " + " | ".join(failures))


install_full_story_prompt()
engine.call_openai = call_free_multiprovider
os.environ["OPENAI_API_KEY"] = "passport-zero-cost-multiprovider"

if __name__ == "__main__":
    raise SystemExit(engine.main())
