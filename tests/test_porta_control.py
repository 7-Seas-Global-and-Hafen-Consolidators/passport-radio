#!/usr/bin/env python3
"""Contratos da porta: um controle, estado honesto, mill sem boilerplate."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOOR = (ROOT / "js/passport-musical-door.js").read_text(encoding="utf-8")
MILL = (ROOT / "tools/whiplash_materialize.py").read_text(encoding="utf-8")
PART = (ROOT / "participe.html").read_text(encoding="utf-8")
NEWS = (ROOT / "noticias.html").read_text(encoding="utf-8")


def fail(msg: str) -> None:
    raise SystemExit(msg)


if 'paint(name, note, "NO AR")' in DOOR or 'paint(item.name, item.note, "NO AR")' in DOOR:
    fail("porta ainda pinta NO AR sem evento playing")
resume = DOOR.split("function resume()", 1)[1].split("document.addEventListener", 1)[0]
if "playUrl(" in resume or ".play()" in resume:
    fail("resume não pode autotocar: seleção não é áudio")
if "TOQUE PARA CONTINUAR" not in DOOR:
    fail("estado de autoplay bloqueado ausente")
if "addEventListener(\"playing\"" not in DOOR:
    fail("TOCANDO não está ligado ao evento playing")
if "#1a1a2e" in DOOR:
    fail("porta não pode voltar para a faixa escura")
for phrase in (
    "A capa é vitrine",
    "O arquivo é a cidade",
    "JSON invisível",
    'artist = "A cena"',
):
    if phrase in MILL:
        fail("mill ainda gera: " + phrase)
for phrase in ("servidor estático", "usina automática", "sitemap", "JSON"):
    if phrase.lower() in PART.lower():
        fail("participe vaza infra: " + phrase)
if "wa.me/5500000000000" in PART:
    fail("whatsapp falso")
if "abre o seu e-mail" not in PART.lower() and "abre o seu e-mail" not in PART:
    fail("mailto precisa dizer que abre o e-mail")
if "usina automática" in NEWS.lower():
    fail("noticias ainda fala de usina")
if "whatsapp.com/channel/0029Vb8OD91BfxoBCBG36F0k" not in PART:
    fail("canal oficial ausente")
print("OK porta, mill e linguagem pública")
