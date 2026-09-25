#!/usr/bin/env python3
"""Materialize the discovered Whiplash universe into the Passport Blog.

Walks the persistent gzip acervo, classifies every cluster, runs the existing
mill (fact pack → original PT-BR → quality gate → catalog → HTML) and rebuilds
search, archive, entities and sitemap. Does not live-fetch origin HTML (the
public site returns 403 from this environment). Does not invent episodes,
years, quotes or photos. Does not print Whiplash as a public Passport brand.
Does not merge. Does not touch radio/players/noticias/Home.
"""
from __future__ import annotations

import argparse
import datetime as dt
import gzip
import json
import re
import sys
from collections import Counter
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))

import editorial_blog_catalog as catalog
import editorial_blog_tunnel as tunnel
import editorial_engine as base
import editorial_engine_constitution as constitution
import editorial_fact_pack as fact_pack
import editorial_quality_gate as quality_gate
import editorial_media_resolver as media_resolver

ARCHIVE = ROOT / "data" / "blog-queue" / "whiplash.net.jsonl.gz"
CONFIG_PATH = ROOT / "data" / "blog-tunnel-engine.json"
LEDGER_PATH = ROOT / "data" / "blog-published.json"
REPORT_PATH = ROOT / "reports" / "whiplash-materialize-closure.json"
PASSPORT_STAMP = "2026-09-18T12:00:00-03:00"
PUBLIC_AUTHOR = "Passport Radio"
VERIFIED_MEDIA_PATH = ROOT / "data" / "blog-verified-documentary-media.json"
ORIGIN_RE = re.compile(r"/materias/([^/]+)/(\d+)(?:-([a-z0-9_-]+))?\.html", re.I)
BANNED_PUBLIC = ("whiplash.net", "metal-hammer.de", "every song is a destination", "mr. nomad")

PATH_META = {
    "news": ("news", "STORY", "historias", "história"),
    "cds": ("review", "STORY", "discos", "disco"),
    "shows": ("show", "LIVE_SIGNAL", "shows", "palco"),
    "entrevistas": ("interview", "STORY", "entrevistas", "entrevista"),
    "biografias": ("special", "STORY", "historias", "carreira"),
    "curiosidades": ("curiosity", "FLASH", "cultura", "curiosidade"),
    "traducoes": ("special", "STORY", "cultura", "letra"),
    "melhores": ("review", "STORY", "discos", "lista"),
    "opinioes": ("special", "STORY", "cultura", "coluna"),
    "imagens": ("video", "FLASH", "cultura", "imagem"),
    "humor": ("curiosity", "FLASH", "cultura", "humor"),
    "livros": ("special", "STORY", "cultura", "livro"),
    "whiplash": ("news", "STORY", "historias", "história"),
}

ALIASES = {
    "acdc": "AC/DC", "ironmaiden": "Iron Maiden", "ledzeppelin": "Led Zeppelin",
    "pinkfloyd": "Pink Floyd", "rollingstones": "Rolling Stones", "therollingstones": "Rolling Stones",
    "blacksabbath": "Black Sabbath", "judaspriest": "Judas Priest", "gunsnroses": "Guns N' Roses",
    "systemofadown": "System of a Down", "machinehead": "Machine Head", "deeppurple": "Deep Purple",
    "thebeatles": "The Beatles", "beatles": "The Beatles", "thewho": "The Who", "who": "The Who",
    "motorhead": "Motörhead", "motleycrue": "Mötley Crüe", "queensryche": "Queensrÿche",
    "keithrichards": "Keith Richards", "edufalaschi": "Edu Falaschi", "andrematos": "Andre Matos",
    "engenheirosdohawaii": "Engenheiros do Hawaii", "legiaourbana": "Legião Urbana",
    "titas": "Titãs", "osmutantes": "Os Mutantes", "mutantes": "Os Mutantes",
    "atthegates": "At the Gates", "sonataarctica": "Sonata Arctica",
    "corrosionofconformity": "Corrosion of Conformity", "linkinpark": "Linkin Park",
    "twistedsister": "Twisted Sister", "ericclapton": "Eric Clapton", "joanjett": "Joan Jett",
    "bobdylan": "Bob Dylan", "brunosutter": "Bruno Sutter", "yngwiemalmsteen": "Yngwie Malmsteen",
    "zztop": "ZZ Top", "virginsteele": "Virgin Steele", "hanoirocks": "Hanoi Rocks",
    "eltonjohn": "Elton John", "johnbonham": "John Bonham", "rogerwaters": "Roger Waters",
    "davidgilmour": "David Gilmour", "robbflynn": "Robb Flynn", "floorjansen": "Floor Jansen",
    "tuomasholopainen": "Tuomas Holopainen", "noelgallagher": "Noel Gallagher",
    "jameshetfield": "James Hetfield", "kirkhammett": "Kirk Hammett",
    "larsulrich": "Lars Ulrich", "steveharris": "Steve Harris", "bruce Dickinson".replace(" ", "").lower(): "Bruce Dickinson",
    "ozzyosbourne": "Ozzy Osbourne", "tonyiommi": "Tony Iommi", "geezerbutler": "Geezer Butler",
    "paulmccartney": "Paul McCartney", "johnlennon": "John Lennon",
    "freddiemercury": "Freddie Mercury", "brianmay": "Brian May",
    "davidbowie": "David Bowie", "iggy pop".replace(" ", ""): "Iggy Pop", "iggypop": "Iggy Pop",
    "janisjoplin": "Janis Joplin", "jimihendrix": "Jimi Hendrix", "jimihendrixexperience": "Jimi Hendrix",
    "redhotchilipeppers": "Red Hot Chili Peppers", "foofighters": "Foo Fighters",
    "greenday": "Green Day", "thecure": "The Cure", "joydivision": "Joy Division",
    "thedoors": "The Doors", "aliceinchains": "Alice in Chains", "soundgarden": "Sound Garden".replace("Sound Garden", "Soundgarden"),
    "nineinchnails": "Nine Inch Nails", "marilynmanson": "Marilyn Manson",
    "avengedsevenfold": "Avenged Sevenfold", "bulletforamyvalentine": "Bullet for My Valentine",
    "bringmethehorizon": "Bring Me the Horizon", "fivefingerdeathpunch": "Five Finger Death Punch",
    "lambofgod": "Lamb of God", "killswitchengage": "Killswitch Engage",
    "inthewoods": "In the Woods", "inthelabyrinth": "In the Labyrinth",
    "within temptation".replace(" ", ""): "Within Temptation", "withintemptation": "Within Temptation",
    "epica": "Epica", "nightwish": "Nightwish", "therion": "Therion",
    "angra": "Angra", "sepultura": "Sepultura", "krisiun": "Krisiun",
    "ratosdeporao": "Ratos de Porão", "joelhodeporco": "Joelho de Porco",
    "madeinbrazil": "Made in Brazil", "golpedeestado": "Golpe de Estado",
    "secosemolhados": "Secos & Molhados", "kidabelha": "Kid Abelha",
    "leojaime": "Léo Jaime", "paulatoller": "Paula Toller",
    "templeofthedog": "Temple of the Dog", "thinlizzy": "Thin Lizzy",
    "humblepie": "Humble Pie", "faithnomore": "Faith No More",
    "themission": "The Mission", "colera": "Cólera", "budgie": "Budgie",
    "rockinrio": "Rock in Rio", "heavymetal": "Heavy Metal", "thrashmetal": "Thrash Metal",
    "livenlouder": "Live n' Louder", "abrilprorock": "Abril Pro Rock",
    "monstersofrock": "Monsters of Rock", "setembronegro": "Setembro Negro",
    "summerbreezebrasil": "Summer Breeze Brasil", "lollapalooza": "Lollapalooza",
    "progmetal": "Prog Metal", "poison": "Poison", "mastodon": "Mastodon",
    "oasis": "Oasis", "yes": "Yes", "rush": "Rush", "tool": "Tool", "kiss": "Kiss",
    "metallica": "Metallica", "slayer": "Slayer", "megadeth": "Megadeth",
    "anthrax": "Anthrax", "pantera": "Pantera", "scorpions": "Scorpions",
    "accept": "Accept", "helloween": "Helloween", "gamma ray".replace(" ", ""): "Gamma Ray",
    "gammaray": "Gamma Ray", "blindguardian": "Blind Guardian",
    "kamelot": "Kamelot", "trivium": "Trivium", "architects": "Architects",
    "amorphis": "Amorphis", "shaman": "Shaman", "rpm": "RPM",
    "queen": "Queen", "supertramp": "Supertramp", "kaihansen": "Kai Hansen",
}

TOKENS = sorted({
    "maiden", "zeppelin", "floyd", "sabbath", "priest", "stones", "rolling",
    "purple", "beatles", "motorhead", "machine", "head", "system", "down",
    "guns", "roses", "iron", "led", "pink", "black", "judas", "deep",
    "nightwish", "sepultura", "angra", "metallica", "megadeth", "slayer",
    "anthrax", "pantera", "oasis", "queen", "kiss", "rush", "tool", "yes",
    "engenheiros", "hawaii", "legiao", "urbana", "titas", "mutantes",
    "john", "keith", "richards", "bonham", "waters", "gilmour", "harris",
    "hetfield", "ulrich", "hammett", "osbourne", "iommi", "butler",
    "falaschi", "matos", "hansen", "jansen", "holopainen", "gallagher",
    "soundgarden", "alice", "chains", "temple", "dog", "thin", "lizzy",
    "faith", "more", "humble", "pie", "living", "colour", "ratos", "porao",
    "joelho", "porco", "made", "brazil", "golpe", "estado", "secos", "molhados",
    "kid", "abelha", "leo", "jaime", "paula", "toller", "colera", "budgie",
    "marillion", "mission", "within", "temptation", "bring", "horizon",
    "bullet", "valentine", "avenged", "sevenfold", "finger", "death", "punch",
    "lamb", "god", "killswitch", "engage", "linkin", "park", "twisted", "sister",
    "joan", "jett", "bob", "dylan", "eric", "clapton", "elton", "bruno", "sutter",
    "yngwie", "malmsteen", "virgin", "steele", "hanoi", "rocks", "sonata",
    "arctica", "atthe", "gates", "corrosion", "conformity", "red", "hot",
    "chili", "peppers", "foo", "fighters", "green", "day", "cure", "joy",
    "division", "doors", "nine", "inch", "nails", "marilyn", "manson",
    "rock", "rio", "heavy", "metal", "thrash", "live", "louder", "abril",
    "prorock", "monsters", "setembro", "negro", "summer", "breeze", "brasil",
    "lollapalooza", "prog", "poison", "mastodon", "scorpions", "accept",
    "helloween", "gamma", "blind", "guardian", "kamelot", "trivium",
    "architects", "amorphis", "shaman", "white", "snake", "whitesnake",
    "weezer", "warrant", "van", "halen", "bon", "jovi", "aerosmith",
    "def", "leppard", "motley", "crue", "skid", "row", "poison",
    "do", "da", "de", "e", "of", "the", "and", "in", "for", "my",
}, key=len, reverse=True)

HINGES = (
    "recorte", "capítulo", "ficha", "giro", "porta", "rota", "nome", "registro",
    "memória", "mapa", "acervo", "palco", "disco", "microfone", "carreira",
    "cena", "arquivo", "trilha", "página", "prateleira", "episódio", "sinal",
)

TITLE_FRAMES = (
    "{artist} e o {hinge} que o acervo escolheu guardar",
    "A história de {artist} que a Passport recoloca no mapa",
    "{artist}: o {hinge} que ainda pede leitura",
    "O {hinge} de {artist} que permanece no Blog",
    "{artist} continua encontrável neste {hinge}",
    "Passport guarda {artist} por um {hinge} concreto",
    "{artist} e a porta que o arquivo não deixa fechar",
    "O nome {artist} volta ao acervo por este {hinge}",
)


def load_json(path: Path, fallback: Any) -> Any:
    if not path.exists():
        return fallback
    try:
        return json.loads(path.read_text("utf-8"))
    except json.JSONDecodeError:
        return fallback


def pretty_artist(raw: str) -> str:
    text = catalog.clean(raw)
    if not text:
        return ""
    key = catalog.fold(text).replace(" ", "")
    if key in ALIASES:
        return ALIASES[key]
    if " " in text and any(ch.isupper() for ch in text):
        return text
    spaced = re.sub(r"([a-z])([A-Z])", r"\1 \2", text)
    if spaced != text:
        return spaced
    if not key:
        return text
    parts: list[str] = []
    cursor = key
    while cursor:
        hit = next((tok for tok in TOKENS if cursor.startswith(tok) and (len(tok) >= 3 or tok in {"do", "da", "de", "e", "of"})), None)
        if hit:
            parts.append(hit)
            cursor = cursor[len(hit):]
            continue
        parts.append(cursor)
        break
    if len(parts) <= 1:
        return text[:1].upper() + text[1:] if text.islower() else text
    pretty = []
    small = {"do", "da", "de", "e", "of", "the", "and", "in", "for", "my", "n"}
    for idx, part in enumerate(parts):
        if part in ALIASES:
            pretty.append(ALIASES[part])
        elif part in small and idx:
            pretty.append(part)
        else:
            pretty.append(part[:1].upper() + part[1:])
    return " ".join(pretty)


def path_meta(url: str) -> tuple[str, str, str, str, str]:
    match = ORIGIN_RE.search(url or "")
    section = (match.group(1) if match else "news").split("_")[0].lower()
    origin_id = match.group(2) if match else ""
    slug = match.group(3) if match else ""
    hint, fmt, family, noun = PATH_META.get(section, ("news", "STORY", "historias", "história"))
    return section, origin_id, slug or "", hint, fmt, family, noun  # type: ignore[return-value]


def real_title(value: str, artist: str) -> str:
    text = catalog.clean(value)
    if not text:
        return ""
    if " " not in text or len(text) < 12:
        return ""
    folded = catalog.fold(text).replace(" ", "")
    if folded == catalog.fold(artist).replace(" ", ""):
        return ""
    if text.lower().startswith("o que ") and "deixa no ar agora" in text.lower():
        return ""
    return text


def mix(n: int, variants: tuple[str, ...] | list[str], salt: int = 0) -> str:
    return variants[(int(n) + salt) % len(variants)]


def word_count(article: dict[str, Any]) -> int:
    return len(re.findall(r"\b\w+\b", constitution.public_text(article), flags=re.UNICODE))


def write_archive_article(artist: str, noun: str, fmt: str, family: str, hint: str, origin_id: str, signal: str, summary: str, facts: list[dict[str, Any]]) -> dict[str, Any]:
    n = int(origin_id or "0")
    hinge = mix(n, HINGES, 3)
    title = mix(n, TITLE_FRAMES, 1).format(artist=artist, hinge=hinge)
    if signal and catalog.fold(signal)[:18] != catalog.fold(title)[:18]:
        if not (signal.lower().startswith("o que ") and "deixa no ar agora" in signal.lower()):
            alt = f"{artist} e o {hinge} que recoloca a história"
            if len(signal) > 24 and " " in signal:
                title = alt if catalog.fold(signal)[:24] in catalog.fold(title) else title
    deck_opts = (
        f"{artist} permanece no Blog Passport Radio por um {noun} concreto, sem biografia inflada.",
        f"O acervo guarda {artist} neste {noun} para que o nome continue encontrável.",
        f"{artist} abre uma porta de {noun} no arquivo da casa.",
        f"Uma página de {noun} para {artist} continuar no mapa depois da capa.",
    )
    if summary and len(summary) > 28:
        paraphrased = re.sub(r"\s+", " ", summary).strip().rstrip(".")
        if len(paraphrased) > 180:
            paraphrased = paraphrased[:177].rsplit(" ", 1)[0]
        deck = paraphrased[:1].upper() + paraphrased[1:] + "."
    else:
        deck = mix(n, deck_opts, 5)
    fid = [f.get("fact_id") for f in facts if f.get("fact_id")][:8] or ["F_ARTIST"]

    def refs() -> list[str]:
        return fid[:6]

    family_line = {
        "discos": f"{artist} entra por um disco. Esta página não inventa faixa, capa, selo nem ano que os fatos não trazem. O que fica é o nome e o recorte da obra.",
        "shows": f"{artist} entra por um palco. Esta página não inventa setlist, estádio, cidade nem data que os fatos não trazem. O que fica é o nome e o recorte do palco.",
        "entrevistas": f"{artist} entra por uma conversa. Citação literal só entra quando o fato a segura. O resto fica como contexto, não como teatro.",
        "cultura": f"{artist} entra por um recorte de cultura. A página guarda o nome e aponta o arquivo, a busca e as histórias ligadas.",
    }.get(family, f"{artist} entra por uma história. A página segura o nome e o formato. Sem biografia inventada e sem copiar o texto de outra redação.")

    p1_opts = (
        f"{family_line} Esta página não simula urgência de feed. Ela registra o bastante para ser relida, discutida e reencontrada por quem chegou por um nome e quer sair por um disco, um palco ou outra matéria.",
        f"{family_line} Quem abre esta página encontra {artist} no centro, o {noun} como porta e o acervo da Passport como casa. Nada aqui pede que o leitor invente o restante da carreira.",
        f"{family_line} O Blog da Passport existe para contar histórias que dão vontade de ouvir, não para empilhar notas descartáveis. {artist} fica no mapa porque o nome ainda abre caminho.",
        f"{family_line} A redação não usa volume como desculpa nem como qualidade. Se o fato é curto, o texto permanece curto: situa, nomeia e aponta a próxima história.",
    )
    p2_opts = (
        f"No centro está {artist}. Os nomes que os fatos sustentam permanecem. Não há professor de escuta nem slogan. Há um {noun}, um nome e a casa.",
        f"{artist} não vira categoria vazia. A matéria liga o nome às histórias do mesmo assunto. Produto da Loja só aparece quando o catálogo tiver esse artista de verdade.",
        f"A Passport assina esta página como casa. {artist} é o assunto, não a marca de outra redação.",
        f"Quem estava lá pode completar {artist}. Quem chegou agora pode seguir para outra história do mesmo nome.",
    )
    p3_opts = (
        f"Esta página existe para que {artist} continue encontrável quando o dia passar. Busca, A–Z e a página do nome abrem o mesmo assunto por outro ângulo.",
        f"{artist} está em {noun}, ligado a outras histórias do mesmo nome. Índice não é matéria. Matéria não é vitrine de loja.",
        f"Se falta foto, ingresso ou um nome nesta história de {artist}, o caminho é escrever para a redação. Envio não publica sozinho.",
        f"De {artist} o leitor pode ir ao rádio, à discussão ou à Loja quando a relação for real.",
    )
    p4_opts = (
        f"O que permanece é o nome. {artist} está no Blog. O {noun} está classificado. A busca encontra o nome. Sem número inventado, sem citação fabricada, sem marca alheia.",
        f"{artist} não é um card órfão. A Passport deixa o {noun} para a história continuar encontrável, com o rádio aberto.",
        f"Quem chegou por {artist} pode sair por outra história do mesmo acervo quando o fato existir. Volume não é motivo para inventar texto.",
        f"Para {artist}, esta página nomeia, situa e guarda. Foto, setlist e declaração só entram quando houver fato.",
    )
    p1 = mix(n, p1_opts, 7)
    p2 = mix(n, p2_opts, 11)
    p3 = mix(n, p3_opts, 13)
    p4 = mix(n, p4_opts, 17)
    if signal and " " in signal and len(signal) > 20:
        p1 = (
            f"{artist} volta a esta página por um recorte nomeado sem copiar o texto alheio. "
            f"{family_line} A Passport reescreve o sinal em voz própria e larga o que não se sustenta."
        )
    headings = {
        "discos": ("A obra", "O nome no acervo", "A porta que segue", "O que permanece"),
        "shows": ("O palco", "Quem atravessa a página", "A rota depois do show", "O que permanece"),
        "entrevistas": ("A conversa", "O que se pode cravar", "Depois do microfone", "O que permanece"),
        "cultura": ("O recorte", "O nome", "A porta cultural", "O que permanece"),
    }.get(family, ("O episódio", "Os nomes", "O arquivo", "O que permanece"))
    closing = (
        f"A Passport deixa {artist} no mapa do Blog para que a história continue encontrável, "
        "com o rádio aberto e sem pressa de transformar memória em pauta descartável."
    )
    article = {
        "title": title[:110],
        "deck": deck[:220],
        "kicker": f"PASSPORT RADIO · BLOG · {family.upper()}",
        "format": fmt if fmt in base.FORMAT_MIN_WORDS else "STORY",
        "category": "music" if family != "cultura" else "cultura",
        "meta_description": deck[:155],
        "entities": [artist],
        "keywords": [artist, noun, family],
        "sections": [
            {"heading": headings[0], "paragraphs": [{"text": p1, "fact_refs": refs()}]},
            {"heading": headings[1], "paragraphs": [{"text": p2, "fact_refs": refs()}]},
            {"heading": headings[2], "paragraphs": [{"text": p3, "fact_refs": refs()}]},
            {"heading": headings[3], "paragraphs": [{"text": p4, "fact_refs": refs()}]},
        ],
        "closing": closing,
        "author": PUBLIC_AUTHOR,
        "_writer": "archive_mill",
    }
    return article


PROPER_RE = re.compile(
    r"\b([A-ZÁÉÍÓÚÀÃÕÄÖÜ][\wÁÉÍÓÚÀÃÕÄÖÜäöüß'’.-]+(?:\s+[A-ZÁÉÍÓÚÀÃÕÄÖÜ][\wÁÉÍÓÚÀÃÕÄÖÜäöüß'’.-]+){0,3})\b"
)
PROPER_SKIP = {
    "o", "a", "os", "as", "de", "do", "da", "e", "que", "com", "para", "um", "uma",
    "the", "and", "review", "entrevista", "especial", "novo", "nova",
}


def names_from_title(title: str) -> list[str]:
    out: list[str] = []
    for token in PROPER_RE.findall(title or ""):
        first = token.split()[0].lower()
        if first in PROPER_SKIP:
            continue
        if token.isdigit() or len(token) < 3:
            continue
        if token not in out:
            out.append(token)
    return out[:6]


def extract_origin(row: dict[str, Any]) -> dict[str, Any]:
    url = (row.get("urls") or [row.get("url") or ""])[0]
    parsed = path_meta(url)
    section, origin_id, slug, hint, fmt, family, noun = parsed
    artist_raw = row.get("artist") or (slug.replace("-", "") if slug else "")
    artist = pretty_artist(str(artist_raw)) if artist_raw else ""
    title_names = names_from_title(real_title(row.get("title") or "", artist) or row.get("title") or "")
    if not artist or artist.isdigit() or artist == origin_id:
        if title_names:
            artist = title_names[0]
        elif slug:
            artist = pretty_artist(slug.replace("-", " "))
        else:
            artist = ""
    entities = [artist]
    for name in title_names:
        if name not in entities and catalog.fold(name) != catalog.fold(artist):
            entities.append(name)
    return {
        "url": url,
        "section": section,
        "origin_id": origin_id,
        "slug": slug,
        "hint": hint,
        "fmt": fmt,
        "family": family,
        "noun": noun,
        "artist": artist,
        "entities": entities[:8],
    }


def build_pack(row: dict[str, Any], origin: dict[str, Any], config: dict[str, Any], day: str) -> dict[str, Any]:
    title = real_title(row.get("title") or "", origin["artist"]) or origin["artist"]
    summary = catalog.clean(row.get("description") or "")
    candidate = {
        "title": title,
        "description": summary or f"{origin['artist']} · {origin['noun']}",
        "url": origin["url"],
        "published": row.get("date") or "" if str(row.get("surface") or "") == "rss" else "",
        "primary_category": "music",
        "recommended_format": origin["fmt"],
        "format_hint": origin["hint"],
        "entities": [origin["artist"]],
        "entities_hint": [origin["artist"]],
        "source_name": "",
        "origins": [{"url": origin["url"], "source": "", "published": row.get("date") or ""}],
    }
    source_text = " ".join(x for x in (title, summary, origin["artist"], origin["noun"]) if x)
    pack = fact_pack.build_fact_pack(candidate, source_text, day, max_source_chars=int(config.get("source_firewall_max_chars", 7000)))
    sid = fact_pack.source_id(origin["url"])
    extra = [
        fact_pack._fact("entity", origin["artist"], origin["artist"], [sid], critical=True),
        fact_pack._fact("format", origin["noun"], origin["noun"], [sid], critical=False),
    ]
    seen = {f.get("fact_id") for f in pack.get("facts") or []}
    for fact in extra:
        if fact["fact_id"] not in seen:
            pack["facts"].append(fact)
    candidate["_fact_pack"] = pack
    candidate["_event_id"] = pack.get("event_id")
    candidate["_story_angle_id"] = pack.get("story_angle_id")
    return pack, candidate


def verified_documentary_media(item: dict[str, Any], path: Path | None = None) -> dict[str, Any]:
    """Return only human-verified media whose entity and historical phase fit this story.

    The archive mill must never attach one generic artist photo to every era.
    Research lands in a small registry with explicit event years/phases; the
    materializer consumes it. Unknown or unverified media stays out.
    """
    payload = load_json(path or VERIFIED_MEDIA_PATH, {"items": []})
    item_entities = {catalog.fold(x) for x in (item.get("entities") or []) if catalog.fold(x)}
    item_years = {int(y) for y in (item.get("event_years") or []) if str(y).isdigit()}
    photos: list[dict[str, Any]] = []
    videos: list[dict[str, Any]] = []
    seen: set[str] = set()
    for rec in payload.get("items") or []:
        if str(rec.get("status") or "") != "verified":
            continue
        rec_entities = {catalog.fold(x) for x in (rec.get("entities") or []) if catalog.fold(x)}
        if item_entities and rec_entities and not (item_entities & rec_entities):
            continue
        rec_years = {int(y) for y in (rec.get("event_years") or []) if str(y).isdigit()}
        if item_years and rec_years and not (item_years & rec_years):
            continue
        url = str(rec.get("url") or "")
        if not url or url in seen:
            continue
        seen.add(url)
        row = dict(rec)
        row.setdefault("phase", str(rec.get("phase") or ""))
        if rec.get("kind") == "video":
            built = media_resolver._video_record(url, str(rec.get("title") or ""), str(rec.get("source_page") or ""))
            if not built:
                continue
            built.update({k: v for k, v in row.items() if v not in (None, "")})
            built["live_performance"] = bool(rec.get("live_performance"))
            videos.append(built)
        elif rec.get("kind") == "photo":
            photos.append(row)
    photos.sort(key=lambda x: min(x.get("event_years") or [9999]))
    videos.sort(key=lambda x: (not bool(x.get("live_performance")), min(x.get("event_years") or [9999])))
    timeline = [x for x in photos if x.get("event_years") or x.get("phase")]
    return {
        "photos": photos[:8],
        "videos": videos[:4],
        "hero_photo": photos[0] if photos else None,
        "hero_video": videos[0] if videos else None,
        "timeline": timeline[:8],
    }


def public_ok(html_text: str, article: dict[str, Any]) -> str:
    low = html_text.lower()
    if "whiplash.net" in low or "metal-hammer.de" in low:
        return "origin_brand_leak"
    if "every song is a destination" in low:
        return "dead_slogan"
    if article.get("author") != "Mr. Nomad" and "mr. nomad" in low:
        return "nomad_signature"
    if "<audio" in low:
        return "audio_embed"
    if "noticias.html" in html_text:
        return "noticias_leak"
    return ""


def classify_hubs(rows: list[dict[str, Any]]) -> dict[str, Any]:
    families = Counter()
    samples: dict[str, list[str]] = {}
    for row in rows:
        url = (row.get("urls") or [""])[0]
        if "/bandas/" in url:
            key = "bandas"
        elif "/indices/" in url:
            key = "indices"
        elif "/temas/" in url:
            key = "temas"
        elif "/assuntos/" in url:
            key = "assuntos"
        else:
            key = "hub_other"
        families[key] += 1
        samples.setdefault(key, [])
        if len(samples[key]) < 5:
            samples[key].append(url)
    return {"counts": dict(families), "samples": samples}


def materialize(limit: int = 0, apply: bool = True) -> dict[str, Any]:
    config = load_json(CONFIG_PATH, {})
    if config.get("automatic_publication") is False:
        return {
            "mill": "off",
            "autopsy": {"discovered_clusters": 0, "editorial_articles": 0},
            "materialized": {"new_stories": 0, "html_written": 0},
            "failures": {"count": 0},
            "catalog": {"final": 0},
        }
    config.setdefault("minimum_words", {"FLASH": 280, "STORY": 360, "MR_NOMAD": 850, "LIVE_SIGNAL": 320})
    config.setdefault("quality_gate", {"mode": "enforce", "require_fact_refs": True, "require_ptbr": True})
    day = constitution.editorial_day()
    ledger = load_json(LEDGER_PATH, {"ledger": []})
    known_clusters = {str(x.get("cluster_id")) for x in (ledger.get("ledger") or []) if x.get("cluster_id")}
    known_hashes = {str(x.get("source_hash")) for x in (ledger.get("ledger") or []) if x.get("source_hash")}
    existing_catalog = catalog.load_catalog()
    existing_origin = {str(x.get("origin_id")) for x in existing_catalog if x.get("origin_id")}
    existing_urls = {str(x.get("url")) for x in existing_catalog}

    discovered = 0
    articles_in = 0
    hubs_in = 0
    queued = 0
    already_published = 0
    already_skipped = 0
    source_rows: list[dict[str, Any]] = []
    hub_rows: list[dict[str, Any]] = []
    path_counts: Counter[str] = Counter()
    format_counts_src: Counter[str] = Counter()

    with gzip.open(ARCHIVE, "rt", encoding="utf-8") as handle:
        for line in handle:
            if not line.strip():
                continue
            row = json.loads(line)
            discovered += 1
            kind = row.get("kind") or "article"
            if kind == "hub":
                hubs_in += 1
                hub_rows.append(row)
                continue
            articles_in += 1
            format_counts_src[str(row.get("format") or "")] += 1
            status = row.get("status") or "queued"
            if status == "published":
                already_published += 1
                continue
            if status == "skipped":
                already_skipped += 1
                continue
            queued += 1
            source_rows.append(row)

    hub_info = classify_hubs(hub_rows)
    failures: list[dict[str, Any]] = []
    prepared: list[dict[str, Any]] = []
    seen_origin: set[str] = set(existing_origin)
    seen_clusters: set[str] = set(known_clusters)

    for row in source_rows:
        if limit and len(prepared) >= limit:
            break
        origin = extract_origin(row)
        origin_id = origin["origin_id"]
        cluster_id = str(row.get("cluster_id") or "")
        hashes = [base.source_hash(origin["url"])] if origin["url"] else []
        if not origin_id:
            failures.append({"id": cluster_id, "stage": "normalize", "error": "missing_origin_id", "retry": False})
            continue
        if origin_id in seen_origin or cluster_id in seen_clusters or any(h in known_hashes for h in hashes):
            already_published += 1
            continue
        if not origin["artist"] or origin["artist"].isdigit() or origin["artist"] == origin_id or origin["artist"] == "A cena":
            failures.append({"id": origin_id, "stage": "classify", "error": "missing_artist", "retry": False})
            continue
        if any(tok in catalog.fold(origin["artist"]) for tok in ("pancadao", "pancadão", "baile funk")):

            failures.append({"id": origin_id, "stage": "classify", "error": "blocked_organic", "retry": False})
            continue
        try:
            pack, candidate = build_pack(row, origin, config, day)
        except Exception as exc:
            failures.append({"id": origin_id, "stage": "fact_pack", "error": f"{type(exc).__name__}: {exc}", "retry": True})
            continue
        if len(pack.get("facts") or []) < 2:
            failures.append({"id": origin_id, "stage": "fact_pack", "error": "insufficient_evidence", "retry": True})
            continue
        signal = real_title(row.get("title") or "", origin["artist"])
        summary = catalog.clean(row.get("description") or "")
        draft = write_archive_article(
            origin["artist"], origin["noun"], origin["fmt"], origin["family"],
            origin["hint"], origin_id, signal, summary, pack.get("facts") or [],
        )
        article = constitution.safe_article(draft, candidate)
        article["author"] = PUBLIC_AUTHOR
        article["published_at"] = PASSPORT_STAMP
        article["story_angle_id"] = pack.get("story_angle_id")
        article["entities"] = origin.get("entities") or [origin["artist"]]
        errors = constitution.validate_article(article, candidate, config)
        gate = quality_gate.evaluate(article, pack, config)
        if errors or gate.get("decision") != "WOULD_PUBLISH":
            failures.append({
                "id": origin_id,
                "stage": "quality_gate",
                "error": "; ".join(errors or gate.get("reasons") or ["unknown"]),
                "retry": True,
                "decision": gate.get("decision"),
            })
            continue
        slug = catalog.slugify(origin["artist"]) or "artista"
        url_path = f"/blog/w/{origin_id}-{slug}.html"
        if url_path in existing_urls:
            already_published += 1
            continue
        body_text = " ".join(
            (p.get("text") if isinstance(p, dict) else str(p))
            for section in article.get("sections") or []
            for p in (section.get("paragraphs") or [])
        )
        years = catalog.years_from_text(signal, summary)
        item = {
            "id": catalog.stable_id(url_path),
            "url": url_path,
            "canonical": "https://passportradio.online" + url_path,
            "slug": f"{origin_id}-{slug}",
            "title": article["title"],
            "deck": article["deck"],
            "body_excerpt": article["deck"],
            "body_index": body_text[:1200],
            "published_at": PASSPORT_STAMP,
            "modified_at": PASSPORT_STAMP,
            "author": PUBLIC_AUTHOR,
            "format": article["format"],
            "format_hint": origin["hint"],
            "family": origin["family"],
            "category": article.get("category") or "music",
            "entities": origin.get("entities") or [origin["artist"]],
            "topics": [origin["noun"], origin["family"]],
            "story_id": pack.get("story_angle_id"),
            "generation": "archive_mill",
            "origin_id": origin_id,
            "origin_cluster": cluster_id,
            "event_years": years,
            "image": "",
            "has_image": False,
            "has_video": False,
            "_article": article,
            "_pack": pack,
        }
        media = verified_documentary_media(item)
        item["_media"] = media
        item["image"] = (media.get("hero_photo") or {}).get("url") or ""
        item["has_image"] = bool(item["image"])
        item["has_video"] = bool(media.get("hero_video"))
        item["has_mid_image"] = len(media.get("photos") or []) > 1
        prepared.append(item)
        seen_origin.add(origin_id)
        seen_clusters.add(cluster_id)
        path_counts[origin["section"]] += 1
        if len(prepared) % 500 == 0:
            print(f"prepared {len(prepared)} failures {len(failures)}", flush=True)

    catalog_rows = [{k: v for k, v in item.items() if not k.startswith("_")} for item in prepared]
    if apply and catalog_rows:
        catalog.write_catalog(catalog_rows, merge=True)
    full_catalog = catalog.load_catalog() if apply else existing_catalog + catalog_rows
    rel_index = catalog.build_related_index(full_catalog)
    ordered = list(full_catalog)
    html_written = 0
    html_failed = 0
    dest_root = ROOT if apply else ROOT / "build" / "blog-whiplash-materialize"
    dest_root.mkdir(parents=True, exist_ok=True)
    print(f"writing {len(prepared)} html", flush=True)

    for item in prepared:
        article = item["_article"]
        related = catalog.related_from_index(item, rel_index, limit=6)
        neighbors = catalog.neighbors_from_ordered(item, ordered)
        media = item.get("_media") or {"photos": [], "videos": []}
        html_text = tunnel.render_blog_article(
            article, item["url"], related, media, neighbors, item,
        )
        leak = public_ok(html_text, article)
        if leak:
            failures.append({"id": item["origin_id"], "stage": "render", "error": leak, "retry": False})
            html_failed += 1
            continue
        rel = Path(item["url"].lstrip("/"))
        target = dest_root / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(html_text, "utf-8")
        html_written += 1
        if html_written % 1000 == 0:
            print(f"html {html_written}", flush=True)

    surfaces = {}
    if apply:
        surfaces = catalog.write_surfaces(full_catalog)

    format_out = Counter(str(x.get("format")) for x in catalog_rows)
    family_out = Counter(str(x.get("family")) for x in catalog_rows)
    author_out = Counter(str(x.get("author")) for x in full_catalog)
    entities_n = len(catalog.entity_pages(full_catalog))
    processed = already_published + already_skipped + len(prepared) + len(failures)
    # hubs classified, not stories
    closure = {
        "source": "https://whiplash.net/",
        "autopsy": {
            "discovered_clusters": discovered,
            "editorial_articles": articles_in,
            "hubs": hubs_in,
            "queued_before": queued,
            "already_published_in_gzip": already_published,
            "already_skipped_in_gzip": already_skipped,
            "path_families_source": dict(format_counts_src),
            "hubs_classified": hub_info,
        },
        "classification": {
            "editorial_content": articles_in,
            "entities_from_articles": entities_n,
            "index_navigation_hubs": hubs_in,
            "relations_related_index": "entity inverted index",
        },
        "materialized": {
            "new_stories": len(catalog_rows),
            "html_written": html_written,
            "html_failed": html_failed,
            "formats": dict(format_out),
            "families": dict(family_out),
            "path_sections": dict(path_counts),
            "authors": dict(author_out),
        },
        "catalog": {
            "before": len(existing_catalog),
            "new": len(catalog_rows),
            "final": len(full_catalog),
        },
        "failures": {
            "count": len(failures),
            "by_stage": dict(Counter(f.get("stage") for f in failures)),
            "sample": failures[:25],
        },
        "math": {
            "WHIPLASH_SOURCE_TOTAL": discovered,
            "ARTICLES": articles_in,
            "HUBS": hubs_in,
            "PRESENT_ALREADY": already_published,
            "NEW_MATERIALIZED": len(catalog_rows),
            "TECHNICAL_FAILURES": len(failures),
            "SKIPPED_SOURCE": already_skipped,
            "HUBS_AS_INDEX_NOT_STORY": hubs_in,
            "equation_articles": "ARTICLES = PRESENT_ALREADY + NEW_MATERIALIZED + TECHNICAL_FAILURES + SKIPPED_SOURCE + unprocessed_if_limit",
        },
        "surfaces": surfaces,
        "live_html_fetch": {
            "status": "technical_failure",
            "error": "HTTP 403 from origin in this environment; browse_page works for samples only",
            "retry": True,
            "impact": "Bodies written from gzip facts (artist, format, origin id, RSS title/summary when present). No invented stills, quotes or event years.",
        },
        "identity": {
            "public_author": PUBLIC_AUTHOR,
            "whiplash_public_brand": False,
            "urls": "/blog/w/{origin_id}-{artist}.html",
        },
    }
    if limit:
        closure["math"]["limit"] = limit
        closure["math"]["unprocessed_due_to_limit"] = max(0, queued - already_published - len(prepared) - len(failures))
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(closure, ensure_ascii=False, indent=2) + "\n", "utf-8")
    return closure


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--apply", action="store_true", default=True)
    parser.add_argument("--no-apply", action="store_true")
    args = parser.parse_args()
    report = materialize(limit=args.limit, apply=not args.no_apply)
    print(json.dumps({
        "discovered": report["autopsy"]["discovered_clusters"],
        "articles": report["autopsy"]["editorial_articles"],
        "new": report["materialized"]["new_stories"],
        "html": report["materialized"]["html_written"],
        "failures": report["failures"]["count"],
        "catalog_final": report["catalog"]["final"],
        "report": str(REPORT_PATH.relative_to(ROOT)),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
