import json
from pathlib import Path
from urllib.parse import parse_qs, urlsplit

cfg = json.loads(Path('data/radio-territories.json').read_text('utf-8'))
assert cfg.get('version') == 4, 'unexpected territory registry version'
territories = cfg.get('territories', [])
assert len(territories) == 12, f'expected 12 territories, got {len(territories)}'

world_player = Path('radio-mundo-player.html')
world_player_js = Path('js/world-radio-player.js').read_text('utf-8')
seen_ids = set()
for item in territories:
    territory_id = item['id']
    assert territory_id not in seen_ids, f'duplicate territory id: {territory_id}'
    seen_ids.add(territory_id)
    assert item['stream_enabled'] is False, f'stream must remain disabled: {territory_id}'

    page = urlsplit(item['page'])
    path = Path(page.path.lstrip('/'))
    assert path.is_file(), f'missing {path}'

    if page.query:
        assert path == world_player, f'unexpected shared player route: {item["page"]}'
        station = parse_qs(page.query).get('station', [''])[0]
        assert station, f'missing station query: {item["page"]}'
        assert f"id:'{station}'" in world_player_js, f'missing World Dial station: {station}'
        continue

    text = path.read_text('utf-8')
    assert f'<html lang="{item["lang"]}"' in text, f'wrong lang: {path}'
    if item.get('dir'):
        assert f'dir="{item["dir"]}"' in text, f'wrong dir: {path}'
    assert item['local_name'] in text, f'missing native name: {path}'
    canonical = f'https://www.passportradio.online{page.path}'
    assert f'<link rel="canonical" href="{canonical}">' in text, f'wrong canonical: {path}'

for item in cfg.get('editorial_only', []):
    path = Path(urlsplit(item['page']).path.lstrip('/'))
    assert path.is_file(), f'missing editorial-only page: {path}'
    assert item.get('status') == 'editorial-only', f'wrong editorial-only status: {item.get("id")}'

print(f'OK native radio territories: {len(territories)} active + {len(cfg.get("editorial_only", []))} editorial-only')
