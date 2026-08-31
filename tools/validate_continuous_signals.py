from pathlib import Path

p = Path('js/passport-live.js')
text = p.read_text(encoding='utf-8')
required = [
    'https://stations.radio-host.com/proxy/metalmanialive/stream',
    'https://stations.radio-host.com/proxy/unpluggedlive/stream',
    'https://stations.radio-host.com/proxy/livejam/stream',
    'function startLive',
    'function installArchiveInterlock',
    'RECONECTANDO',
]
missing = [item for item in required if item not in text]
if missing:
    raise SystemExit('Continuous Signals contract missing: ' + ', '.join(missing))
print('Continuous Signals contract OK')
