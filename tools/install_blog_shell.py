#!/usr/bin/env python3
"""Install one shared presentation hook, preserving every historical byte.

No acquisition, generation, publication or media processing.
Re-running skips files that already carry the exact hook.
"""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HOOK = '<script src="/js/passport-blog-shell.js?v=20261008-global" data-passport-blog-shell defer></script>\n'


def install():
    rows = []
    for path in [ROOT / 'blog.html', *sorted((ROOT / 'blog').rglob('*.html'))]:
        original = path.read_bytes()
        if b'data-passport-blog-shell' in original:
            continue
        if b'</head>' not in original:
            raise ValueError(f'No closing head: {path}')
        changed = original.replace(b'</head>', HOOK.encode() + b'</head>', 1)
        assert changed.replace(HOOK.encode(), b'', 1) == original
        path.write_bytes(changed)
        rows.append({'path': str(path.relative_to(ROOT)), 'original_sha256': hashlib.sha256(original).hexdigest(), 'with_hook_sha256': hashlib.sha256(changed).hexdigest()})
    output = ROOT / 'docs/blog-global-artists-3000-20261008'
    output.mkdir(parents=True, exist_ok=True)
    target = output / 'presentation-hook-manifest.json'
    if rows:
        target.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + '\n')
    print(f'{len(rows)} hooks installed; all original bytes recoverable exactly')


if __name__ == '__main__':
    install()
