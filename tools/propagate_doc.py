#!/usr/bin/env python3
"""Escreve a casa Passport dentro de cada documento HTML. Não mexe em motor, preço ou moinho."""
import html
import json
import os
import re
from pathlib import Path

ROOT = Path("/workspace/passport-radio")
CSS = '<link rel="stylesheet" href="/css/passport-doc.css?v=20260925doc">'
JS = '<script src="/js/passport-doc.js?v=20260925doc" defer></script>'

def btn(data, label):
    return '<button type="button" data-pr="%s" aria-pressed="false">%s</button>' % (
        html.escape(data, quote=True), html.escape(label)
    )

def group(title, buttons):
    return '<div class="pr-group"><h2>%s</h2><div class="pr-units">%s</div></div>' % (title, "".join(buttons))

HOUSE = """<div id="pr-house">
<a class="pr-brand" href="/"><span>Passport</span><span>Radio</span></a>
<form class="pr-search" action="/blog/busca.html" method="get" role="search">
<label class="pr-sr" for="pr-q">Buscar</label>
<input id="pr-q" name="q" type="search" placeholder="Matérias, artistas, autores, rádios, agenda, loja" autocomplete="off">
<button type="submit">Buscar</button>
</form>
<div class="pr-player" id="pr-player">
<button type="button" id="pr-play" aria-label="Tocar">▶</button>
<p class="pr-now"><strong id="pr-name">Escolha uma rádio</strong> <span id="pr-state"></span></p>
<label class="pr-vol">Volume <input id="pr-volume" type="range" min="0" max="1" step="0.05" value="0.8" aria-label="Volume"></label>
<audio id="pr-audio" preload="none"></audio>
<div class="pr-yt" aria-hidden="true"><div id="pr-yt"></div></div>
</div>
<nav class="pr-babies" id="pr-babies" aria-label="Rádios">
""" + group("Música", [
    btn("metal:metal", "Metal"), btn("metal:unplugged", "Unplugged"), btn("metal:regenbogen", "Unplugged II"),
    btn("metal:metalwarriors", "Heavy Metal"), btn("metal:gothic", "Gothic Passport"), btn("metal:livejam", "Live Jam"),
]) + group("80s", [
    btn("80s:Pop", "Pop"), btn("80s:Soft", "Soft"), btn("80s:Country", "Country"),
    btn("80s:Soft R&B", "Soft R&B"), btn("80s:R&B", "R&B"), btn("80s:Hair Metal", "Hair Metal"),
]) + group("Rádios", [
    btn("mpb", "MPB"), btn("rock", "Rock Brasil"), btn("soul", "Soul"), btn("disco", "Disco"),
    btn("reggae", "Reggae"), btn("jovem", "Jovem Guarda"), btn("hits", "Hits"), btn("oldies", "50s & 60s"),
    btn("flash", "Flash House"), btn("nostalgia", "Nostalgia"),
] + [btn("novela:%d" % i, "Novelas %02d" % (i + 1)) for i in range(9)]
  + [btn("globo:%d" % i, "Globo de Ouro %02d" % (i + 1)) for i in range(6)]
  + [btn("liverare", "Live & Rare")]) + group("Américas", [
    btn("world:py", "Radio Paraguay"), btn("world:ca", "Radio Québec"),
    btn("world:ve", "Radio Venezuela"), btn("world:mx", "PASSPORT MÉXICO"),
]) + group("Europa", [
    btn("world:fr", "Radio France"), btn("world:ua", "Українське музичне радіо"),
    btn("world:ro", "Radio Muzică Românească"), btn("world:fi", "Suomalainen rockradio"),
    btn("world:cz", "České rockové rádio"), btn("world:lt", "Lietuvos roko radijas"),
    btn("world:gr", "Ελληνικό ροκ ραδιόφωνο"), btn("world:it", "Radio Italia"),
    btn("world:catalunya", "PASSPORT CATALUNYA"), btn("world:tr", "Türkiye Müzik Radyosu"),
]) + group("África", [btn("world:ea", "Rádio África")]) + group("Ásia", [
    btn("world:kr", "한국 음악 라디오"), btn("world:cn", "中国音乐电台"), btn("world:jp", "パスポート日本"),
    btn("world:th", "พาสปอร์ตประเทศไทย"), btn("world:kz", "ПАСПОРТ ҚАЗАҚСТАН"),
    btn("world:pk", "پاکستانی موسیقی ریڈیو"), btn("world:ir", "رادیو موسیقی ایران"),
    btn("world:il", "רדיו מוזיקה ישראלית"),
]) + """
</nav>
<nav class="pr-sections" id="pr-sections" aria-label="Seções">
<a href="/">Capa</a>
<a href="/noticias.html">Notícias</a>
<a href="/agenda.html">Agenda</a>
<a href="/editorial.html">Arquivo</a>
<a href="/blog/arquivo/letras.html">Bandas e artistas</a>
<a href="/blog/arquivo/autores.html">Autores</a>
<a href="/blog/busca.html">Busca</a>
<a href="/participe.html">Participar</a>
<a href="/radio.html">Ouvir</a>
<a href="/loja.html">Loja</a>
<a href="/anuncie.html">Anuncie</a>
<a href="/doe.html">Apoie</a>
<a href="/contato.html">Contato</a>
</nav>
</div>
"""

FOOT = """<footer id="pr-foot">
<nav aria-label="Rodapé">
<a href="/noticias.html">Notícias</a>
<a href="/agenda.html">Agenda</a>
<a href="/editorial.html">Arquivo</a>
<a href="/blog/arquivo/letras.html">Bandas e artistas</a>
<a href="/blog/arquivo/autores.html">Autores</a>
<a href="/blog/busca.html">Busca</a>
<a href="/participe.html">Participar</a>
<a href="/loja.html">Loja</a>
<a href="/anuncie.html">Anuncie</a>
<a href="/doe.html">Apoie</a>
<a href="/contato.html">Contato</a>
<a href="/privacidade.html">Privacidade</a>
<a href="/termos.html">Termos</a>
<a href="/cookies.html">Cookies</a>
</nav>
<p>Contar histórias que dão vontade de ouvir. A Passport Radio iniciou suas atividades em 1998. Após um período de interrupção, retomou suas operações em 2026.</p>
</footer>
"""

ARCHIVE_GRID = (
    '<div class="blog-grid pr-archive-real"><p>As matérias publicadas estão no editorial, nas bandas e na busca. '
    'Ficha de nome continua no endereço antigo e não entra aqui como matéria.</p>'
    '<p><a href="/editorial.html">Editorial</a> · <a href="/blog/arquivo/letras.html">Bandas e artistas</a> · '
    '<a href="/blog/busca.html">Busca</a> · <a href="/agenda.html">Agenda</a></p></div>'
)

SCRIPT_RE = re.compile(
    r"<script\b[^>]*\bsrc=[\"'][^\"']*(?:passport-mast|passport-musical-door)\.js[^\"']*[\"'][^>]*>\s*</script>",
    re.I,
)
MILL_P_RE = re.compile(r"<p>Se falta foto[\s\S]*?</p>", re.I)
PREV_RE = re.compile(r"<nav class=\"blog-prevnext\">[\s\S]*?</nav>", re.I)
RELATED_RE = re.compile(r"<section class=\"blog-related\">[\s\S]*?</section>", re.I)
W_LINK_RE = re.compile(r"<a\b[^>]*href=[\"']/blog/w/[^\"']*[\"'][^>]*>[\s\S]*?</a>", re.I)
GRID_RE = re.compile(r"<div class=\"blog-grid\">[\s\S]*?</div>", re.I)
INTRO_RE = re.compile(r"<p class=\"blog-intro\">[\s\S]*?</p>", re.I)
BODY_RE = re.compile(r"<body\b([^>]*)>", re.I)
CLASS_RE = re.compile(r"class\s*=\s*([\"'])(.*?)\1", re.I)

def add_class(attrs):
    match = CLASS_RE.search(attrs)
    if not match:
        return attrs + ' class="pr-doc"'
    quote, value = match.group(1), match.group(2)
    if "pr-doc" in value.split():
        return attrs
    repl = "class=%s%s pr-doc%s" % (quote, value, quote)
    return attrs[:match.start()] + repl + attrs[match.end():]

def klass_for(path):
    if "/blog/w/" in path:
        return "synthetic"
    if "/blog/e/" in path:
        return "hub"
    if "/editorial/" in path:
        return "real"
    if "/loja/" in path or "/produto/" in path:
        return "store"
    return ""

def transform(text, rel):
    text = SCRIPT_RE.sub("", text)
    text = MILL_P_RE.sub("", text)
    text = text.replace("o nome que ainda pede leitura", "Passport Radio")
    text = text.replace("%20o%20nome%20que%20ainda%20pede%20leitura", "")
    text = text.replace(": o nome que ainda pede leitura", "")
    if "/blog/w/" in rel:
        text = PREV_RE.sub("", text)
        text = RELATED_RE.sub("", text)
    else:
        text = RELATED_RE.sub(lambda m: W_LINK_RE.sub("", m.group(0)), text)
    base = os.path.basename(rel)
    if "/blog/arquivo/" in rel and (base == "index.html" or re.match(r"p\d+\.html$", base)):
        text = INTRO_RE.sub('<p class="blog-intro">O arquivo leva à matéria, ao artista e à busca.</p>', text, count=1)
        text = GRID_RE.sub(ARCHIVE_GRID, text, count=1)
    klass = klass_for(rel)
    if klass and 'name="passport:class"' not in text and "</head>" in text:
        text = text.replace("</head>", '<meta name="passport:class" content="%s">\n</head>' % klass, 1)
    if "passport-doc.css" not in text and "</head>" in text:
        text = text.replace("</head>", CSS + "\n</head>", 1)
    if 'id="pr-house"' in text:
        if "passport-doc.js" not in text and "</body>" in text.lower():
            text = re.sub(r"</body>", JS + "\n</body>", text, count=1, flags=re.I)
        return text
    match = BODY_RE.search(text)
    if not match or not re.search(r"</body>", text, re.I):
        return None
    attrs = add_class(match.group(1))
    text = text[:match.start()] + "<body" + attrs + ">" + text[match.end():]
    insert_at = match.start() + len("<body" + attrs + ">")
    text = text[:insert_at] + "\n" + HOUSE + '<div id="pr-main">\n' + text[insert_at:]
    text = re.sub(r"</body>", "</div>\n" + FOOT + "\n" + JS + "\n</body>", text, count=1, flags=re.I)
    return text

def main():
    counts = {"files": 0, "written": 0, "skipped": 0, "synthetic": 0, "hub": 0, "real": 0, "store": 0}
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in ("node_modules", ".git")]
        for name in filenames:
            if not name.endswith(".html"):
                continue
            path = Path(dirpath) / name
            rel = "/" + str(path.relative_to(ROOT)).replace(os.sep, "/")
            counts["files"] += 1
            try:
                original = path.read_text(encoding="utf-8")
            except UnicodeDecodeError:
                counts["skipped"] += 1
                continue
            updated = transform(original, rel)
            if updated is None:
                counts["skipped"] += 1
                continue
            klass = klass_for(rel)
            if klass:
                counts[klass] += 1
            if updated != original:
                path.write_text(updated, encoding="utf-8")
                counts["written"] += 1
    report = ROOT / "reports" / "doc-propagation.json"
    report.parent.mkdir(exist_ok=True)
    report.write_text(json.dumps(counts, indent=2), encoding="utf-8")
    print(json.dumps(counts))

if __name__ == "__main__":
    main()
