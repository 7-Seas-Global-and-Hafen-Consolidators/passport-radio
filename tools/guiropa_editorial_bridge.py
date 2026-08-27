#!/usr/bin/env python3
from __future__ import annotations

import html
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data/guiropa-editorial-bridge.json"
GUIROPA_FEED_URL = "https://raw.githubusercontent.com/7-Seas-Global-and-Hafen-Consolidators/guiropa-systems/main/client/public/data/rss-world-feed.json"
BATCH_SIZE = 12
MAX_SOURCE_CHARS = 9000
FETCH_BYTES = 220000
API_TIMEOUT = 240
MAX_OUTPUT_TOKENS = 9000
UA = "Mozilla/5.0 (compatible; GUIROPA-Bridge/1.0; +https://passportradio.online/)"


def get_json(url: str) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=40) as response:
        return json.loads(response.read().decode("utf-8"))


def strip_html(raw: str) -> str:
    raw = re.sub(r"(?is)<script.*?>.*?</script>|<style.*?>.*?</style>|<noscript.*?>.*?</noscript>", " ", raw)
    raw = re.sub(r"(?s)<[^>]+>", " ", raw)
    return re.sub(r"\s+", " ", html.unescape(raw)).strip()


def fetch_source(url: str) -> str:
    if not url:
        return ""
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "text/html,application/xhtml+xml"})
    with urllib.request.urlopen(req, timeout=18) as response:
        ctype = response.headers.get("Content-Type", "")
        if "text" not in ctype and "html" not in ctype:
            return ""
        raw = response.read(FETCH_BYTES).decode("utf-8", errors="ignore")
    return strip_html(raw)[:MAX_SOURCE_CHARS]


def is_ready(item: dict) -> bool:
    return item.get("editorialStatus") == "ready" and bool(item.get("titlePt")) and bool(item.get("excerptPt")) and isinstance(item.get("bodyPt"), list) and len(item.get("bodyPt") or []) >= 4


def source_packet(item: dict) -> dict:
    text = ""
    try:
        text = fetch_source(str(item.get("url") or ""))
    except Exception as exc:
        print(f"SOURCE_FAIL id={item.get('id')} detail={type(exc).__name__}", file=sys.stderr)
    if len(text) < 500:
        text = str(item.get("excerpt") or "")
    return {
        "id": item.get("id"),
        "source": item.get("source") or "Fonte editorial",
        "host": urlparse(str(item.get("url") or "")).netloc,
        "region": item.get("region") or "WORLD",
        "publishedAt": item.get("publishedAt"),
        "title": item.get("title") or "",
        "rssExcerpt": item.get("excerpt") or "",
        "evidence": text,
    }


def build_prompt(packets: list[dict]) -> str:
    return """Você é o editor do GUIROPA RADIO · NEWS TUNNEL™.\n\nTransforme CADA sinal abaixo em UMA MATÉRIA EDITORIAL ORIGINAL, COMPLETA E EM PORTUGUÊS DO BRASIL.\n\nREGRAS ABSOLUTAS:\n- Use somente fatos sustentados pelo pacote de evidências de cada item.\n- Não invente datas, falas, números, causas, bastidores, reações ou contexto.\n- Compreenda qualquer idioma de origem e reescreva naturalmente em pt-BR; não faça tradução literal.\n- Não reproduza a matéria-fonte integralmente nem copie frases longas.\n- Preserve nomes próprios e grafia oficial.\n- Se a evidência for curta, seja mais breve em vez de preencher lacunas.\n- Sem emojis e sem markdown.\n- Produza de 4 a 8 parágrafos por matéria.\n- O deck deve ter 1 ou 2 frases.\n- A saída deve conter somente IDs recebidos.\n- Responda exclusivamente com JSON puro e válido.\n\nFORMATO OBRIGATÓRIO:\n{\"stories\":[{\"id\":\"id original\",\"titlePt\":\"título\",\"excerptPt\":\"deck\",\"bodyPt\":[\"parágrafo 1\",\"parágrafo 2\",\"parágrafo 3\",\"parágrafo 4\"]}]}\n\nPACOTE DE EVIDÊNCIAS:\n""" + json.dumps(packets, ensure_ascii=False)


def parse_json_text(text: str) -> dict:
    value = str(text or "").strip()
    value = re.sub(r"^```(?:json)?\s*", "", value, flags=re.I)
    value = re.sub(r"\s*```$", "", value)
    try:
        return json.loads(value)
    except Exception:
        match = re.search(r"\{.*\}", value, flags=re.S)
        if not match:
            raise RuntimeError("provider did not return JSON")
        return json.loads(match.group(0))


def post_json(url: str, payload: dict, headers: dict) -> dict:
    req = urllib.request.Request(url, data=json.dumps(payload, ensure_ascii=False).encode("utf-8"), headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=API_TIMEOUT) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")[-1000:]
        raise RuntimeError(f"HTTP {exc.code}: {body}") from exc


def call_groq(prompt: str) -> dict:
    key = os.environ.get("GROQ_API_KEY", "").strip()
    if not key: raise RuntimeError("GROQ_API_KEY unavailable")
    payload = {"model": os.environ.get("GUIROPA_GROQ_MODEL", "openai/gpt-oss-120b"), "messages": [{"role": "user", "content": prompt}], "temperature": 0.35, "max_completion_tokens": MAX_OUTPUT_TOKENS, "response_format": {"type": "json_object"}}
    data = post_json("https://api.groq.com/openai/v1/chat/completions", payload, {"Authorization": f"Bearer {key}", "Content-Type": "application/json"})
    return parse_json_text(data["choices"][0]["message"]["content"])


def call_gemini(prompt: str) -> dict:
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not key: raise RuntimeError("GEMINI_API_KEY unavailable")
    model = os.environ.get("GUIROPA_GEMINI_MODEL", "gemini-2.5-flash-lite")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{urllib.parse.quote(model, safe='')}:generateContent"
    payload = {"contents": [{"role": "user", "parts": [{"text": prompt}]}], "generationConfig": {"temperature": 0.35, "maxOutputTokens": MAX_OUTPUT_TOKENS, "responseMimeType": "application/json"}}
    data = post_json(url, payload, {"x-goog-api-key": key, "Content-Type": "application/json"})
    return parse_json_text("".join(str(p.get("text", "")) for p in data["candidates"][0]["content"]["parts"]))


def call_openrouter(prompt: str) -> dict:
    key = os.environ.get("OPENROUTER_API_KEY", "").strip()
    if not key: raise RuntimeError("OPENROUTER_API_KEY unavailable")
    model = os.environ.get("GUIROPA_OPENROUTER_MODEL", "openrouter/free")
    payload = {"model": model, "messages": [{"role": "user", "content": prompt}], "temperature": 0.35, "max_tokens": MAX_OUTPUT_TOKENS}
    data = post_json("https://openrouter.ai/api/v1/chat/completions", payload, {"Authorization": f"Bearer {key}", "Content-Type": "application/json", "HTTP-Referer": "https://guiropa.world/", "X-Title": "GUIROPA Editorial Bridge"})
    return parse_json_text(data["choices"][0]["message"]["content"])


def call_provider(prompt: str) -> tuple[dict, str]:
    failures = []
    for name, fn in (("groq-free", call_groq), ("gemini-free", call_gemini), ("openrouter-free", call_openrouter)):
        try:
            value = fn(prompt)
            print(f"BRIDGE_PROVIDER_OK provider={name}")
            return value, name
        except Exception as exc:
            failures.append(f"{name}:{str(exc)[-400:]}")
            print(f"BRIDGE_PROVIDER_FAIL provider={name} detail={str(exc)[-400:]}", file=sys.stderr)
    raise RuntimeError("all_bridge_providers_exhausted | " + " | ".join(failures))


def validate_story(story: dict, allowed: set[str]) -> dict:
    sid = str(story.get("id") or "")
    if sid not in allowed: raise ValueError(f"unexpected id {sid}")
    title = str(story.get("titlePt") or "").strip(); excerpt = str(story.get("excerptPt") or "").strip(); body = story.get("bodyPt")
    if not title or not excerpt or not isinstance(body, list): raise ValueError(f"incomplete story {sid}")
    body = [str(x).strip() for x in body if str(x).strip()]
    if len(body) < 4 or len(body) > 10: raise ValueError(f"unsafe paragraphs {sid}")
    words = sum(len(p.split()) for p in body)
    if words < 120 or words > 1100: raise ValueError(f"unsafe words {sid}:{words}")
    return {"id": sid, "titlePt": title, "excerptPt": excerpt, "bodyPt": body}


def main() -> int:
    feed = get_json(GUIROPA_FEED_URL)
    pending = [x for x in (feed.get("items") or []) if not is_ready(x)][:BATCH_SIZE]
    now = datetime.now(timezone.utc).isoformat()
    if not pending:
        OUT.write_text(json.dumps({"generatedAt": now, "provider": None, "stories": []}, ensure_ascii=False, indent=2) + "\n", "utf-8")
        print("GUIROPA_BRIDGE no pending stories")
        return 0
    packets = [source_packet(x) for x in pending]
    result, provider = call_provider(build_prompt(packets))
    raw = result.get("stories")
    if not isinstance(raw, list): raise RuntimeError("stories array missing")
    allowed = {str(x.get("id")) for x in pending}
    stories = [validate_story(x, allowed) for x in raw]
    if not stories: raise RuntimeError("bridge generated zero valid stories")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({"generatedAt": now, "provider": provider, "source": "passport-radio-secret-bridge", "stories": stories}, ensure_ascii=False, indent=2) + "\n", "utf-8")
    print(f"GUIROPA_BRIDGE generated={len(stories)} provider={provider}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
