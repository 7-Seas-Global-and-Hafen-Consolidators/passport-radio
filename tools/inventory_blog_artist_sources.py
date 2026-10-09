#!/usr/bin/env python3
"""Reconcile supplied source indexes; never acquire or manufacture profiles."""
import argparse
import hashlib
import html
import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/blog-global-artists-3000-20261008'


def fold(value):
    return re.sub('[^a-z0-9]', '', unicodedata.normalize('NFD', value).encode('ascii', 'ignore').decode().lower())


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--whiplash', type=Path, required=True)
    parser.add_argument('--metalhammer', type=Path, required=True)
    args = parser.parse_args()
    supplied = args.whiplash.read_bytes()
    digest = hashlib.sha256(supplied).hexdigest()
    target = OUT / 'artists-3000-inventory.json'
    if target.exists() and json.loads(target.read_text()).get('source_sha256') == digest:
        print('Same source already persisted; inventory reused')
        return
    source = supplied.decode('utf-8')
    names = {}
    # The supplied index identifies artists by strong labels; the other link
    # in each row is a count. Numeric artist names must not be discarded.
    for url, label in re.findall(r'<a[^>]+href="(/bandas/[^\"]+\.html)"[^>]*>\s*<strong>(.*?)</strong>\s*</a>', source, re.S):
        names.setdefault(url, html.unescape(re.sub('<[^>]+>', '', label)).strip())
    assert len(names) >= 3000
    existing = {}
    for url, label in re.findall(r'<a[^>]+href="(/blog/e/[^\"]+)"[^>]*>(.*?)</a>', (ROOT / 'blog/arquivo/letras.html').read_text(), re.S):
        name = html.unescape(re.sub('<[^>]+>', '', re.sub('<small.*?</small>', '', label, flags=re.S))).strip()
        existing.setdefault(fold(name), {'name': name, 'url': url})
    records = []
    for position, (url, name) in enumerate(list(names.items())[:3000], 1):
        old = existing.get(fold(name))
        records.append({'position': position, 'name': name, 'reference_url': 'https://whiplash.net' + url, 'existing_url': old['url'] if old else None, 'status': 'PENDING_FACTUAL_PROFILE_AND_AUTHORIZED_MEDIA', 'photo': None, 'validated_official_video': None, 'original_editorial_profile': None, 'completed': False})
    OUT.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps({'target': 3000, 'source_sha256': digest, 'source_unique_destinations': len(names), 'records': records}, ensure_ascii=False, indent=2) + '\n')
    patterns = [r'continua encontrável', r'que permanece no Blog', r'que o acervo escolheu guardar', r'a porta que o arquivo não deixa fechar', r'A história de .+ que a Passport recoloca no mapa', r'Passport guarda .+ por um']
    counts = dict.fromkeys(patterns, 0)
    flagged = total = 0
    for line in (ROOT / 'data/blog-catalog.jsonl').open():
        row = json.loads(line)
        total += 1
        bad = False
        for pattern in patterns:
            if re.search(pattern, row.get('title', ''), re.I):
                counts[pattern] += 1
                bad = True
        flagged += bad
    mh = args.metalhammer.read_bytes()
    report = {'source_sha256': digest, 'source_unique_destinations': len(names), 'metalhammer_source_sha256': hashlib.sha256(mh).hexdigest(), 'metalhammer_img_elements': len(re.findall(rb'<img\b', mh)), 'target_inventory': len(records), 'matched_existing_destinations': sum(bool(r['existing_url']) for r in records), 'unmatched_source_candidates': sum(not r['existing_url'] for r in records), 'certified_complete_profiles': 0, 'historical_records_preserved': total, 'titles_flagged_by_explicit_patterns': flagged, 'pattern_counts': counts, 'classification_note': 'Lexical audit, not a factual verdict or authorization to delete or rewrite. Sources are indexes, not 3000 complete licensed profiles. No source article copied; no author reassigned.'}
    (OUT / 'source-and-quality-audit.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(report, ensure_ascii=False))


if __name__ == '__main__':
    main()
