#!/usr/bin/env python3
"""Read-only legacy Blog triage. Never deletes or modifies source files."""
import json, re, html, pathlib, collections, hashlib
ROOT = pathlib.Path(__file__).resolve().parents[2]
VAULT = ROOT / "_cofre/blog-legacy-2026"
OUT = VAULT / "triagem"
OUT.mkdir(parents=True, exist_ok=True)
PATTERNS = [
    r"^O que .+ deixa no ar agora$",
    r"\be o giro que recoloca\b",
    r"\brecoloca .+ no centro\b",
    r"\be a faixa que entrou\b",
]
def clean(s):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]*>", " ", s or ""))).strip()
def classify(path):
    s = path.read_text(encoding="utf-8", errors="replace")
    title_match = re.search(r"<title[^>]*>(.*?)</title>", s, re.I | re.S)
    title = clean(title_match.group(1)) if title_match else ""
    article = re.search(r"<article\b[^>]*>(.*?)</article>", s, re.I | re.S)
    content = article.group(1) if article else ""
    paragraphs = [clean(p) for p in re.findall(r"<p\b[^>]*>(.*?)</p>", content, re.I | re.S)]
    paragraphs = [p for p in paragraphs if len(p) >= 35]
    body = " ".join(paragraphs)
    matches = [p for p in PATTERNS if re.search(p, title, re.I)]
    source_urls = re.findall(r'href=["\'](https?://[^"\']+)["\']', content, re.I)
    image_refs = re.findall(r'<img\b[^>]*\bsrc=["\']([^"\']+)', content, re.I)
    duplicate_paras = len(paragraphs) - len(set(paragraphs))
    reasons = []
    if matches: reasons.append("titulo_padrao_bot")
    if article and len(body.split()) < 90: reasons.append("corpo_curto")
    if article and duplicate_paras > 1: reasons.append("paragrafos_repetidos")
    if not article: reasons.append("sem_article_detectavel")
    if not title: reasons.append("sem_title")
    # Conservative: never assert an item is good or trash based on a single clue.
    if article and matches and len(body.split()) < 90:
        bucket = "lixo-radioativo"
    elif article and len(body.split()) >= 350 and not matches and duplicate_paras == 0:
        bucket = "ouro-candidato"
    else:
        bucket = "revisao-manual"
    return {"path": str(path.relative_to(ROOT)), "title": title, "bucket": bucket,
            "reasons": reasons, "words_in_article_paragraphs": len(body.split()),
            "paragraphs": len(paragraphs), "duplicate_paragraphs": duplicate_paras,
            "external_links_count": len(source_urls), "image_refs_count": len(image_refs),
            "sha256": hashlib.sha256(path.read_bytes()).hexdigest()}
def main():
    files = sorted((VAULT / "blog").rglob("*.html")) + sorted((VAULT / "historias").rglob("*.html"))
    counts = collections.Counter()
    handles = {k: (OUT / (k + ".jsonl")).open("w", encoding="utf-8") for k in
               ("ouro-candidato", "lixo-radioativo", "revisao-manual")}
    try:
        for p in files:
            try: record = classify(p)
            except Exception as e:
                record = {"path": str(p.relative_to(ROOT)), "bucket": "revisao-manual", "error": str(e)}
            counts[record["bucket"]] += 1
            handles[record["bucket"]].write(json.dumps(record, ensure_ascii=False) + "\n")
    finally:
        for f in handles.values(): f.close()
    report = {"status": "heuristic_triage_not_editorial_verification",
              "source": "_cofre/blog-legacy-2026",
              "html_files_examined": len(files), "buckets": dict(counts),
              "note": "ouro-candidato is not validated journalism; lixo-radioativo is a strong template candidate, not approved for deletion. All original sources preserved."}
    (OUT / "relatorio.json").write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False))
if __name__ == "__main__": main()
