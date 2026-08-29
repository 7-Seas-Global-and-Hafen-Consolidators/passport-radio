import json
from pathlib import Path

cfg=json.loads(Path('data/radio-territories.json').read_text('utf-8'))
assert cfg.get('version') == 1
for item in cfg['territories']:
    path=Path(item['page'].lstrip('/'))
    assert path.is_file(), f'missing {path}'
    text=path.read_text('utf-8')
    assert f'<html lang="{item["lang"]}"' in text, f'wrong lang: {path}'
    assert item['local_name'] in text, f'missing native name: {path}'
    assert '<link rel="canonical"' in text, f'missing canonical: {path}'
    assert item['stream_enabled'] is False, f'stream must remain disabled: {item["id"]}'
print(f'OK native radio territories: {len(cfg["territories"])}')
