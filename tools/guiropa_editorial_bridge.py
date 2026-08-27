#!/usr/bin/env python3
from __future__ import annotations

import html
import json
import os
import re
import subprocess
import sys
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
UA = "Mozilla/5.0 (compatible; GUIROPA-Bridge/2.0; +https://passportradio.online/)"


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


def call_copilot(prompt: str, token: str, model: str) -> dict:
    env = os.environ.copy()
    env["COPILOT_GITHUB_TOKEN"] = token
    env["GH_TOKEN"] = token
    env["GITHUB_TOKEN"] = token
    cmd = ["copilot", "-p", prompt, "-s", "--no-ask-user", "--model", model]
    proc = subprocess.run(cmd, capture_output=True, text=True, env=env, timeout=420)
    if proc.returncode != 0:
        detail = (proc.stderr or proc.stdout or "Copilot CLI failed").strip()
        raise RuntimeError(detail[-1400:])
    return parse_json_text(proc.stdout)


def call_provider(prompt: str) -> tuple[dict, str]:
    personal = os.environ.get("COPILOT_PERSONAL_TOKEN", "").strip()
    github_token = os.environ.get("GH_TOKEN", "").strip() or os.environ.get("GITHUB_TOKEN", "").strip()
    attempts = []
    if personal:
        attempts.extend([("passport-copilot-personal-auto", personal, "auto"), ("passport-copilot-personal-mini", personal, "gpt-5-mini")])
    if github_token and github_token != personal:
        attempts.extend([("passport-github-token-auto", github_token, "auto"), ("passport-github-token-mini", github_token, "gpt-5-mini")])
    if not attempts:
        raise RuntimeError("no Passport Copilot authentication path available")

    failures = []
    for name, token, model in attempts:
        try:
            value = call_copilot(prompt, token, model)
            print(f"BRIDGE_PROVIDER_OK provider={name}")
            return value, name
        except Exception as exc:
            detail = str(exc).replace("\n", " ")[-700:]
            failures.append(f"{name}:{detail}")
            print(f"BRIDGE_PROVIDER_FAIL provider={name} detail={detail}", file=sys.stderr)
    raise RuntimeError("all_passport_copilot_paths_failed | " + " | ".join(failures))


def validate_story(story: dict, allowed: set[str]) -> dict:
    sid = str(story.get("id") or "")
    if sid not in allowed:
        raise ValueError(f"unexpected id {sid}")
    title = str(story.get("titlePt") or "").strip()
    excerpt = str(story.get("excerptPt") or "").strip()
    body = [str(x).strip() for x in (story.get("bodyPt") or []) if str(x).strip()]
    if not title or not excerpt or len(body) < 4 or len(body) > 10:
        raise ValueError(f"incomplete story {sid}")
    words = sum(len(p.split()) for p in body)
    if words < 120 or words > 1100:
        raise ValueError(f"unsafe words {sid}:{words}")
    return {"id": sid, "titlePt": title, "excerptPt": excerpt, "bodyPt": body}


def main() -> int:
    feed = get_json(GUIROPA_FEED_URL)
    pending = [x for x in (feed.get("items") or []) if not is_ready(x)][:BATCH_SIZE]
    now = datetime.now(timezone.utc).isoformat()
    if not pending:
        OUT.write_text(json.dumps({"generatedAt": now, "provider": None, "source": "passport-radio-copilot-bridge", "stories": []}, ensure_ascii=False, indent=2) + "\n", "utf-8")
        print("GUIROPA_BRIDGE no pending stories")
        return 0

    packets = [source_packet(x) for x in pending]
    result, provider = call_provider(build_prompt(packets))
    raw = result.get("stories")
    if not isinstance(raw, list):
        raise RuntimeError("stories array missing")
    allowed = {str(x.get("id")) for x in pending}
    stories = [validate_story(x, allowed) for x in raw]
    if not stories:
        raise RuntimeError("bridge generated zero valid stories")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({"generatedAt": now, "provider": provider, "source": "passport-radio-copilot-bridge", "stories": stories}, ensure_ascii=False, indent=2) + "\n", "utf-8")
    print(f"GUIROPA_BRIDGE generated={len(stories)} provider={provider}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
