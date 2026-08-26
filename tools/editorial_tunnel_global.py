#!/usr/bin/env python3
"""Worldwide launcher for Passport Editorial Tunnel™.

Expands the base tunnel without changing its source-firewall contract:
- Unicode-aware deduplication for non-Latin scripts;
- multilingual trend/archive vocabulary;
- worldwide genre taxonomy while keeping rock/metal as the editorial core;
- geographic balancing across the regions covered by the global source network;
- raises the private reservoir ceiling to 1,200 selected signals.

The base tunnel still only discovers public article metadata and never publishes.
"""
from __future__ import annotations

import math
import re
from typing import Any

import editorial_tunnel as base


GLOBAL_DAILY_RESERVOIR = 1200
GLOBAL_PER_SOURCE_CAP = 24
GLOBAL_WORKERS_CAP = 32
GLOBAL_RADAR_CAP = 2400
SOURCE_SELECTION_CAP = 16

REGION_TAGS = {
    "global", "north_america", "brasil", "latin_america", "central_america",
    "caribbean", "uk_ireland", "continental_europe", "nordics",
    "eastern_europe", "east_asia", "south_asia", "southeast_asia",
    "central_asia", "middle_east", "africa", "oceania",
}

ROCK_CORE = {
    "metal", "rock", "classic_rock", "prog", "alternative_gothic",
    "punk_hardcore", "visual_kei", "instruments", "legacy_archive",
}

GENRE_ORDER = (
    "metal", "rock", "classic_rock", "prog", "alternative_gothic",
    "punk_hardcore", "visual_kei", "indie", "kpop", "jpop",
    "cpop_mandopop", "pop_poprock", "hiphop_rap", "electronic",
    "soul", "jazz_blues", "reggae_dancehall", "latin", "afrobeats",
    "world_folk", "experimental", "instruments", "live_industry",
    "legacy_archive", "brasil",
)

# These are soft minimums. Missing/weak regional material never blocks stronger
# stories; the final fill is always score-driven.
REGION_SHARES = {
    "north_america": 0.08,
    "brasil": 0.07,
    "latin_america": 0.07,
    "central_america": 0.025,
    "caribbean": 0.035,
    "uk_ireland": 0.07,
    "continental_europe": 0.08,
    "nordics": 0.045,
    "eastern_europe": 0.055,
    "east_asia": 0.075,
    "south_asia": 0.04,
    "southeast_asia": 0.045,
    "central_asia": 0.02,
    "middle_east": 0.055,
    "africa": 0.055,
    "oceania": 0.04,
}


# Unicode-aware dedupe. The original regex is intentionally conservative for
# pt/en, but a world radar needs Cyrillic, Arabic, Hebrew, CJK and other scripts.
def tokenize_unicode(text: str) -> set[str]:
    words = re.findall(r"[^\W_]+", (text or "").lower(), flags=re.UNICODE)
    return {w for w in words if len(w) > 1 and w not in base.STOPWORDS}


base.tokenize = tokenize_unicode

# Common stopwords only reduce accidental duplicate matches. They are not used
# to translate or rewrite articles.
base.STOPWORDS.update({
    # Spanish / French / Italian / German
    "el", "los", "las", "del", "una", "uno", "con", "sin", "para", "por", "que", "y",
    "le", "les", "des", "du", "une", "avec", "sans", "pour", "sur", "et",
    "il", "lo", "gli", "della", "delle", "con", "senza", "per", "e",
    "der", "die", "das", "den", "dem", "ein", "eine", "mit", "ohne", "und", "von", "für",
    # Polish / Czech / Russian / Ukrainian / Turkish / Indonesian
    "i", "oraz", "na", "do", "z", "ze", "w", "dla", "jest",
    "a", "se", "na", "do", "pro", "je", "jsou",
    "и", "в", "на", "с", "из", "для", "что", "это",
    "і", "в", "на", "з", "із", "для", "що", "це",
    "ve", "ile", "bir", "bu", "için", "icin", "da", "de",
    "dan", "dan", "yang", "dan", "untuk", "dengan", "dari", "ini", "itu",
})

# Genre recognition is deliberately broad. Source metadata still carries a
# region/genre prior, while keywords help assign the actual article angle.
base.CATEGORY_KEYWORDS.update({
    "rock": (
        " rock ", "rock band", "rock music", "rock'n'roll", "rock and roll", "rock nacional",
        "рок", "рок-гурт", "рок-группа", "ロック", "록 밴드", "록 음악", "摇滚", "搖滾", "روك",
        "rock müzik", "rock muzik", "rockowy", "rocková", "rockove",
    ),
    "punk_hardcore": (
        "punk", "hardcore", "post-hardcore", "metalcore", "emo", "pop punk", "пънк", "панк",
        "パンク", "ハードコア", "펑크", "하드코어", "朋克", "硬核", "بانك", "هاردكور",
    ),
    "kpop": ("k-pop", "kpop", "k pop", "케이팝", "컴백", "아이돌"),
    "jpop": ("j-pop", "jpop", "j pop", "j-rock", "jrock", "j rock", "邦楽", "jポップ"),
    "cpop_mandopop": (
        "mandopop", "c-pop", "cpop", "cantopop", "华语流行", "華語流行", "国语流行", "國語流行",
        "中文流行", "粤语流行", "粵語流行",
    ),
    "hiphop_rap": (
        "hip-hop", "hip hop", "rapper", " rap ", "rapero", "rapera", "rappeur", "rapperin",
        "рэп", "реп", "хіп-хоп", "ヒップホップ", "ラップ", "힙합", "랩", "说唱", "說唱", "راب",
        "rapçi", "rapci",
    ),
    "electronic": (
        "electronic", "electronica", "electrónica", "electronica", "électronique", "elektronik",
        "techno", "house music", "deep house", "drum and bass", "dnb", "trance", "edm", "ambient",
        "電子音楽", "テクノ", "일렉트로닉", "테크노", "电子音乐", "電子音樂", "موسيقى إلكترونية",
    ),
    "jazz_blues": (
        "jazz", "blues", "джаз", "блюз", "ジャズ", "ブルース", "재즈", "블루스", "爵士", "蓝调",
        "藍調", "جاز", "بلوز",
    ),
    "reggae_dancehall": (
        "reggae", "dancehall", "dub music", "roots reggae", "ska", "راجاي", "ريغي",
    ),
    "latin": (
        "reggaeton", "reguetón", "salsa", "cumbia", "bachata", "merengue", "dembow", "música latina",
        "musica latina", "latin music", "urbano latino",
    ),
    "afrobeats": ("afrobeats", "afrobeat", "amapiano", "highlife", "afropop", "afro-pop"),
    "world_folk": (
        "folk", "traditional music", "world music", "música tradicional", "musica tradicional",
        "musique traditionnelle", "народная музыка", "народна музика", "民族音乐", "民族音樂",
        "伝統音楽", "전통 음악", "موسيقى تقليدية",
    ),
    "visual_kei": ("visual kei", "ヴィジュアル系", "v-kei"),
    "experimental": ("experimental", "avant-garde", "avant garde", "noise music", "drone", "experimental music"),
})

# Add local-language signals so freshness is not biased toward English/Portuguese.
base.TREND_WORDS.update({
    # Spanish
    "anuncia": 11, "anunció": 11, "revela": 10, "reveló": 10, "regresa": 11,
    "gira": 9, "sencillo": 7, "estrena": 9, "estreno": 8, "fallece": 18, "falleció": 18,
    # French
    "annonce": 10, "dévoile": 10, "revient": 10, "tournée": 9, "sortie": 8, "décès": 18,
    # German
    "kündigt": 10, "veröffentlicht": 9, "kehrt zurück": 11, "tournee": 9, "gestorben": 18,
    # Italian
    "annuncia": 10, "rivela": 9, "torna": 10, "singolo": 7, "pubblica": 8, "morto": 18,
    # Polish / Czech
    "ogłasza": 10, "powraca": 10, "trasa": 9, "singiel": 7, "zmarł": 18, "premiera": 8,
    "oznamuje": 10, "vrací": 10, "turné": 9, "singl": 7, "zemřel": 18, "vydává": 8,
    # Ukrainian / Russian
    "оголосив": 10, "оголосила": 10, "повертається": 10, "помер": 18, "померла": 18,
    "объявил": 10, "объявила": 10, "возвращается": 10, "умер": 18, "умерла": 18,
    # Turkish / Indonesian
    "duyurdu": 10, "geri dönüyor": 10, "turne": 9, "albüm": 8, "öldü": 18, "yayınladı": 8,
    "mengumumkan": 10, "kembali": 9, "rilis": 8, "meninggal": 18,
    # Japanese
    "発表": 10, "新曲": 9, "アルバム": 8, "ツアー": 9, "復活": 12, "死去": 18, "リリース": 8, "フェス": 7,
    # Korean
    "발표": 10, "신곡": 9, "앨범": 8, "투어": 9, "컴백": 12, "사망": 18, "발매": 8, "페스티벌": 7,
    # Chinese
    "宣布": 10, "新歌": 9, "专辑": 8, "專輯": 8, "巡演": 9, "回归": 11, "回歸": 11,
    "去世": 18, "发布": 8, "發布": 8, "音乐节": 7, "音樂節": 7,
    # Arabic / Hebrew
    "يعلن": 10, "أعلن": 10, "أعلنت": 10, "ألبوم": 8, "أغنية": 8, "جولة": 9,
    "مهرجان": 7, "عودة": 10, "وفاة": 18, "إصدار": 8,
    "הכריז": 10, "אלבום": 8, "סינגל": 7, "סיבוב הופעות": 9, "פסטיבל": 7,
})

base.ARCHIVE_WORDS.update({
    "historia": 17, "historia de": 17, "aniversario": 17, "legado": 17, "detrás de": 18,
    "histoire": 17, "anniversaire": 17, "héritage": 17,
    "geschichte": 17, "jubiläum": 17, "vermächtnis": 17,
    "storia": 17, "anniversario": 17, "eredità": 17,
    "historia zespołu": 18, "rocznica": 17, "dziedzictwo": 17,
    "історія": 18, "річниця": 17, "спадщина": 17,
    "история": 18, "годовщина": 17, "наследие": 17,
    "歴史": 18, "周年": 17, "舞台裏": 18,
    "역사": 18, "주년": 17, "비하인드": 18,
    "历史": 18, "歷史": 18, "周年": 17, "幕后": 18, "幕後": 18,
    "تاريخ": 18, "ذكرى": 17, "إرث": 18,
})


_original_score_article = base.score_article


def score_article_global(article: base.Article, now, max_age_hours: int) -> None:
    _original_score_article(article, now, max_age_hours)
    blob = f"{article.title} {article.description}".lower()

    # Pick the genre actually visible in the story when possible; region tags
    # never become the public primary category.
    keyword_hits: list[str] = []
    for cat in GENRE_ORDER:
        kws = base.CATEGORY_KEYWORDS.get(cat, ())
        if kws and any(kw in blob for kw in kws):
            keyword_hits.append(cat)
    if keyword_hits:
        article.primary_category = keyword_hits[0]
    else:
        for cat in article.source_categories:
            if cat not in REGION_TAGS and cat in GENRE_ORDER:
                article.primary_category = cat
                break

    # Passport DNA: rock/metal/alternative/instrument stories keep a real edge,
    # but geographically distinctive material also receives a modest lift.
    if any(cat in ROCK_CORE for cat in article.categories):
        article.passport_score = min(100, article.passport_score + 7)
    if any(cat in REGION_TAGS - {"global", "north_america", "uk_ireland", "brasil"} for cat in article.categories):
        article.passport_score = min(100, article.passport_score + 4)

    total = (
        article.trend_score * 0.38
        + article.passport_score * 0.42
        + article.archive_score * 0.20
    )
    total += min(6, max(0, len(article.categories) - 1) * 1.5)
    article.total_score = int(max(0, min(100, round(total))))


base.score_article = score_article_global


def choose_daily_global(articles: list[base.Article], limit: int) -> list[base.Article]:
    pool = [a for a in articles if not a.already_covered and a.total_score >= 35]
    pool.sort(key=lambda a: (a.total_score, a.passport_score, a.trend_score), reverse=True)

    selected: list[base.Article] = []
    used_urls: set[str] = set()
    source_count: dict[str, int] = {}

    def can_take(item: base.Article) -> bool:
        return item.url not in used_urls and source_count.get(item.source_name, 0) < SOURCE_SELECTION_CAP

    def take(item: base.Article) -> None:
        selected.append(item)
        used_urls.add(item.url)
        source_count[item.source_name] = source_count.get(item.source_name, 0) + 1

    # 1) Guarantee a meaningful global spread when good material exists.
    for region, share in REGION_SHARES.items():
        quota = max(1, math.ceil(limit * share))
        got = 0
        for item in pool:
            if len(selected) >= limit or got >= quota:
                break
            if region not in item.categories or not can_take(item):
                continue
            take(item)
            got += 1

    # 2) Keep at least 55% of the reservoir rooted in Passport's rock universe.
    core_target = math.ceil(limit * 0.55)
    core_now = sum(1 for item in selected if any(cat in ROCK_CORE for cat in item.categories))
    if core_now < core_target:
        for item in pool:
            if len(selected) >= limit or core_now >= core_target:
                break
            if not any(cat in ROCK_CORE for cat in item.categories) or not can_take(item):
                continue
            take(item)
            core_now += 1

    # 3) Fill the rest strictly by editorial score, without excluding any style.
    for item in pool:
        if len(selected) >= limit:
            break
        if can_take(item):
            take(item)

    return selected[:limit]


base.choose_daily = choose_daily_global


def raise_base_limits() -> None:
    """Raise only numeric clamps embedded in the base tunnel main()."""
    code = base.main.__code__
    patched: list[Any] = []
    for value in code.co_consts:
        if value == 10:
            patched.append(GLOBAL_PER_SOURCE_CAP)
        elif value == 16:
            patched.append(GLOBAL_WORKERS_CAP)
        elif value == 50:
            patched.append(GLOBAL_DAILY_RESERVOIR)
        elif value == 120:
            patched.append(GLOBAL_RADAR_CAP)
        else:
            patched.append(value)
    base.main.__code__ = code.replace(co_consts=tuple(patched))


raise_base_limits()

if __name__ == "__main__":
    raise SystemExit(base.main())
