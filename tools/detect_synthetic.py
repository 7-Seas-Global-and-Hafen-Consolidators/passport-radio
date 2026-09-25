#!/usr/bin/env python3
"""Classifica amostras do blog. Não apaga, não reescreve, não noindex."""
from __future__ import annotations

import json
import random
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "reports" / "audit-phase0.json"

MILL = [
    re.compile(p, re.I)
    for p in (
        r"permanece no Blog Passport Radio",
        r"a capa é vitrine",
        r"o arquivo é a cidade",
        r"url estável",
        r"json invisível",
        r"sem biografia inflada",
        r"o pacote sustenta",
        r"abre uma porta de história",
        r"continuar no mapa depois da capa",
    )
]


def classify(text: str, path: str) -> str:
    hits = sum(1 for p in MILL if p.search(text))
    words = len(text.split())
    if "/arquivo/" in path.replace("\\", "/"):
        return "INDEX"
    if hits >= 2 and words < 300:
        return "SYNTHETIC_BOILERPLATE"
    if hits >= 1 and words >= 500:
        return "POSSIBLY_CONTAMINATED"
    if hits >= 1:
        return "POSSIBLY_CONTAMINATED"
    if "/blog/e/" in path.replace("\\", "/"):
        return "ENTITY_HUB"
    if words > 400:
        return "REAL_ARTICLE"
    return "UNKNOWN"


def sample(directory: Path, n: int, seed: int) -> list[Path]:
    files = [p for p in directory.glob("*.html")]
    rng = random.Random(seed)
    if len(files) <= n:
        return files
    return rng.sample(files, n)


def main() -> None:
    buckets = Counter()
    samples = {k: [] for k in (
        "REAL_ARTICLE", "ENTITY_HUB", "INDEX", "SYNTHETIC_BOILERPLATE",
        "POSSIBLY_CONTAMINATED", "UNKNOWN",
    )}
    examined = 0
    for folder, n in ((ROOT / "blog" / "w", 400), (ROOT / "blog" / "e", 200)):
        if not folder.is_dir():
            continue
        for path in sample(folder, n, 467):
            text = path.read_text(encoding="utf-8", errors="ignore")
            kind = classify(text, str(path.relative_to(ROOT)))
            buckets[kind] += 1
            examined += 1
            if len(samples[kind]) < 8:
                samples[kind].append(str(path.relative_to(ROOT)))
    w_count = sum(1 for _ in (ROOT / "blog" / "w").glob("*.html")) if (ROOT / "blog" / "w").is_dir() else 0
    e_count = sum(1 for _ in (ROOT / "blog" / "e").glob("*.html")) if (ROOT / "blog" / "e").is_dir() else 0
    report = {
        "mode": "dry-run-sample",
        "mutated": False,
        "deleted": False,
        "blog_w_files": w_count,
        "blog_e_files": e_count,
        "examined": examined,
        "by_class_in_sample": dict(buckets),
        "sample_paths": samples,
        "note": "UNKNOWN e POSSIBLY_CONTAMINATED não são lixo. Nenhuma URL foi removida.",
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"examined": examined, "by_class": dict(buckets), "w": w_count, "e": e_count}, ensure_ascii=False))


if __name__ == "__main__":
    main()
