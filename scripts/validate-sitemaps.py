#!/usr/bin/env python3
"""Validate only the nine sitemap outputs, with Python's built-in XML parser."""
from pathlib import Path
from urllib.parse import urlsplit, unquote
import xml.etree.ElementTree as ET
import re
import argparse
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parent.parent)
parser.add_argument('--http', action='store_true')
args = parser.parse_args()
ROOT = args.root.resolve()
FILES = ['sitemap.xml', 'sitemap-blog.xml', 'sitemap-loja.xml', 'sitemap-agenda.xml', 'sitemap-radios.xml', 'sitemap-bandas.xml', 'sitemap-podcasts.xml', 'sitemap-jogos.xml', 'sitemap-shows.xml']
NS = '{http://www.sitemaps.org/schemas/sitemap/0.9}'
seen = set()
for name in FILES:
    root = ET.parse(ROOT / name).getroot()
    assert root.tag == NS + 'urlset', name
    entries = root.findall(NS + 'url')
    assert len(entries) <= 50000 and (ROOT / name).stat().st_size <= 50 * 1024 * 1024
    for entry in entries:
        loc = entry.findtext(NS + 'loc')
        u = urlsplit(loc)
        assert u.scheme == 'https' and u.netloc == 'passportradio.online', loc
        assert not u.query and not u.fragment and loc not in seen, loc
        assert not re.search(r'/(?:docs|privado|private|api|admin|__preview)(?:/|$)|/(?:foundation-preview|player-preview|adapter-lab|index-95x)\.html|/(?:checkout|pedido|minha-passport)\.html', u.path, re.I), loc
        relative = unquote(u.path).lstrip('/')
        target = ROOT / (relative + 'index.html' if not relative or relative.endswith('/') else relative)
        assert target.is_file(), loc
        seen.add(loc)
    print(f'{name}: {len(entries)} URLs; XML válido')
print(f'Total: {len(seen)} URLs únicas; domínio, arquivos, limites e exclusões válidos')

# Optional transport verification against the exact local publication files.
# No production crawl, stream request, browser, external service, or content mutation.
if args.http:
    import functools
    import threading
    import concurrent.futures
    import urllib.request
    from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
    class Quiet(SimpleHTTPRequestHandler):
        def log_message(self, *args):
            pass
    server = ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=str(ROOT)))
    server.daemon_threads = True
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    def head(loc):
        relative = urlsplit(loc).path
        opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
        with opener.open(urllib.request.Request(f'http://127.0.0.1:{server.server_port}' + relative, method='HEAD'), timeout=30) as response:
            if response.status != 200:
                raise AssertionError(f'{loc}: HTTP {response.status}')
        return 1
    try:
        with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
            count = sum(pool.map(head, sorted(seen)))
        print(f'HTTP HEAD: {count}/{len(seen)} responderam 200 nos arquivos locais de publicação')
    finally:
        server.shutdown()
        server.server_close()
