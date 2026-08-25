#!/usr/bin/env python3
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = '<script src="/js/passport-amazon-affiliate.js?v=202608251849" defer></script>'
MARKER = 'passport-amazon-affiliate.js'
SCRIPT_RE = re.compile(
    r'<script\s+src=["\']/js/passport-amazon-affiliate\.js(?:\?v=[^"\']*)?["\']\s+defer></script>',
    re.IGNORECASE,
)

# Protected standalone player surfaces: do not touch the babies.
EXCLUDED = {
    ROOT / 'passport-player.html',
    ROOT / 'passport-player-v2.html',
    ROOT / 'player-preview.html',
}

SKIP_PARTS = {'.git', 'node_modules', 'build', '.venv', 'venv'}


def should_skip(path: Path) -> bool:
    if path in EXCLUDED:
        return True
    return any(part in SKIP_PARTS for part in path.parts)


def inject(path: Path) -> bool:
    text = path.read_text(encoding='utf-8', errors='strict')

    # Existing pages: refresh the version so the commercial layer is fetched
    # immediately instead of waiting on a previously cached script URL.
    if MARKER in text:
        updated = SCRIPT_RE.sub(SCRIPT, text)
        if updated != text:
            path.write_text(updated, encoding='utf-8')
            return True
        return False

    lower = text.lower()
    idx = lower.rfind('</body>')
    if idx < 0:
        return False
    updated = text[:idx] + SCRIPT + '\n' + text[idx:]
    path.write_text(updated, encoding='utf-8')
    return True


def main() -> int:
    changed = []
    for path in sorted(ROOT.rglob('*.html')):
        if should_skip(path):
            continue
        try:
            if inject(path):
                changed.append(path.relative_to(ROOT).as_posix())
        except UnicodeDecodeError:
            continue

    print(f'Commercial affiliate layer injection/refresh: {len(changed)} HTML file(s) updated.')
    for item in changed[:100]:
        print(f'  + {item}')
    if len(changed) > 100:
        print(f'  ... +{len(changed) - 100} more')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
