#!/usr/bin/env python3
"""Append only source positions after the previously persisted 3,000 records."""
import argparse
import hashlib
import html
import json
import re
from pathlib import Path
from inventory_blog_artist_sources import fold

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/blog-global-artists-3000-20261008'


def extend(source):
    prior = json.loads((OUT / 'artists-3000-inventory.json').read_text())
    target = OUT / 'artists-9911-inventory.json'
    raw = source.read_bytes()
    digest = hashlib.sha256(raw).hexdigest()
    if digest != prior['source_sha256']:
        raise ValueError('Source differs from the persisted first-3000 checkpoint')
    if target.exists():
        result = json.loads(target.read_text())
        if result['source_sha256'] == digest and len(result['records']) == 9911:
            print('9911 inventory already persisted; reused')
            return
    records = prior['records'].copy()
    assert len(records) == 3000
    existing = {}
    for url, label in re.findall(r'<a[^>]+href="(/blog/e/[^\"]+)"[^>]*>(.*?)</a>', (ROOT / 'blog/arquivo/letras.html').read_text(), re.S):
        name = html.unescape(re.sub('<[^>]+>', '', re.sub('<small.*?</small>', '', label, flags=re.S))).strip()
        existing.setdefault(fold(name), {'name': name, 'url': url})
    seen = set()
    position = 0
    for url, label in re.findall(r'<a[^>]+href="(/bandas/[^\"]+\.html)"[^>]*>\s*<strong>(.*?)</strong>\s*</a>', raw.decode('utf-8'), re.S):
        if url in seen:
            continue
        seen.add(url)
        position += 1
        if position <= 3000:
            continue
        name = html.unescape(re.sub('<[^>]+>', '', label)).strip()
        old = existing.get(fold(name))
        records.append({'position': position, 'name': name, 'reference_url': 'https://whiplash.net' + url, 'existing_url': old['url'] if old else None, 'status': 'PENDING_FACTUAL_PROFILE_AND_AUTHORIZED_MEDIA', 'photo': None, 'validated_official_video': None, 'original_editorial_profile': None, 'completed': False})
    assert position == len(records) == 9911
    assert records[:3000] == prior['records']
    result = {'target': 9911, 'source_sha256': digest, 'source_unique_destinations': 9911, 'reused_positions': 3000, 'newly_reconciled_positions': 6911, 'records': records}
    target.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'positions': len(records), 'reused': 3000, 'appended': 6911, 'matches': sum(bool(r['existing_url']) for r in records), 'next_pending': records[0]['name'], 'last_inventory': records[-1]['name']}))


if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('--source', type=Path, required=True)
    extend(p.parse_args().source)
