import json
from pathlib import Path

cfg = json.loads(Path('data/radio-territories.json').read_text('utf-8'))
assert cfg.get('version') == 3, 'unexpected territory registry version'
territories = cfg.get('territories', [])
assert len(territories) == 10, f'expected 10 territories, got {len(territories)}'

seen_ids = set()
for item in territories:
    territory_id = item['id']
    assert territory_id not in seen_ids, f'duplicate territory id: {territory_id}'
    seen_ids.add(territory_id)

    path = Path(item['page'].lstrip('/'))
    assert path.is_file(), f'missing {path}'
    text = path.read_text('utf-8')
    assert f'<html lang="{item["lang"]}"' in text, f'wrong lang: {path}'
    if item.get('dir'):
        assert f'dir="{item["dir"]}"' in text, f'wrong dir: {path}'
    assert item['local_name'] in text, f'missing native name: {path}'
    canonical = f'https://www.passportradio.online{item["page"]}'
    assert f'<link rel="canonical" href="{canonical}">' in text, f'wrong canonical: {path}'
    assert item['stream_enabled'] is False, f'stream must remain disabled: {territory_id}'

print(f'OK native radio territories: {len(territories)}')
