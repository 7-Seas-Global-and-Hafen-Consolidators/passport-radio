#!/usr/bin/env python3
"""Official Passport circulation: share a matter vs follow the house."""
from __future__ import annotations

import html as html_lib
from urllib.parse import quote

TELEGRAM_OFFICIAL = "https://t.me/+pXv3uwqOY8lkZGZk"
WHATSAPP_OFFICIAL = "https://whatsapp.com/channel/0029Vb8OD91BfxoBCBG36F0k"
SITE = "https://passportradio.online"


def share_links(canonical: str, title: str) -> dict[str, str]:
    url = canonical or ""
    text = f"{title} — {url}" if title else url
    return {
        "whatsapp": f"https://wa.me/?text={quote(text)}",
        "telegram": f"https://t.me/share/url?url={quote(url)}&text={quote(title or url)}",
        "copy": url,
    }


def share_html(canonical: str, title: str) -> str:
    links = share_links(canonical, title)
    esc_copy = html_lib.escape(canonical or "", quote=True)
    return (
        '<aside class="blog-share" aria-label="Compartilhar esta matéria">'
        "<span>Compartilhar</span>"
        f'<a href="{links["whatsapp"]}" target="_blank" rel="noopener">WhatsApp</a>'
        f'<a href="{links["telegram"]}" target="_blank" rel="noopener">Telegram</a>'
        f'<button type="button" data-copy-link="{esc_copy}">Copiar link</button>'
        "</aside>"
    )


def follow_html(compact: bool = False) -> str:
    kicker = "Siga a Passport" if compact else "Volte quando a próxima história sair"
    lead = (
        "Os canais levam de volta para a matéria, o arquivo e a rádio. "
        "Não substituem o acervo."
    )
    return (
        f'<aside class="blog-follow" aria-label="Canais oficiais da Passport Radio">'
        f"<span>{kicker}</span>"
        f"<p>{lead}</p>"
        '<p class="blog-follow__row">'
        f'<a class="blog-follow__tg" href="{TELEGRAM_OFFICIAL}" target="_blank" rel="noopener">Telegram oficial</a>'
        f'<a class="blog-follow__wa" href="{WHATSAPP_OFFICIAL}" target="_blank" rel="noopener">Passport Radio Channel</a>'
        '<a class="blog-follow__radio" href="/radio.html">Ouvir na Passport</a>'
        "</p>"
        "</aside>"
    )
