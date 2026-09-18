# Passport Global Blog Tunnel™ V1

Private discovery + public Blog writing. The mill is reused; the destination is new.

## Sources (entire houses, not a demo)

- Whiplash.Net — RSS `feeds/news.xml`, sitemaps (`sitemap.xml`, `ultimas`, `00`, `37`, `38`, códigos CDs/shows, índices), HTML indexes (`ultimas`, temas). Parte dos sitemaps/HTML 403 no Cloudflare; o que responde entra no acervo. RSS continua a espinha viva do contínuo.
- Metal Hammer Germany — RSS (`/feed/`, `/news/feed/`, `/reviews/feed/` + `paged`), WordPress REST (`posts`, `reviews`), sitemap index (posts, news, reviews, concerts, festivals, tours). Artist/genre sitemaps não viram matéria.

Black Sabbath / Back to the Beginning é **caso de teste**, não allowlist.

## Duas camadas de fila

1. `data/blog-queue/*.jsonl.gz` — acervo completo (Whiplash + Metal Hammer). Sem teto de 100.000. Descoberta escreve aqui.
2. `data/blog-tunnel-queue.json` — janela quente (`hot_window`, default 400). `generate` só olha essa janela.
3. `data/blog-tunnel-cursor.json` — checkpoint da drenagem histórica.

`discover` e `generate` reabastecem a janela a partir do acervo. O cursor só avança o que já está na janela, foi publicado/rejeitado/skipped, ou é hub. O que não couber permanece no acervo e entra no run seguinte. Publicação continua capped (`--max-generate`).


## Pipeline

`discover` (superfície elegível → acervo gzip + janela quente)
→ Fact Pack / merge / entidades / mídia
→ redação original PT-BR
→ quality gate
→ `/blog/YYYY/MM/DD/slug.html`
→ arquivo do Blog + sitemap + knowledge graph

Capa humana de `blog.html` permanece humana.

## Caps

- Descoberta preenche o acervo. Não está limitada a duas histórias.
- Geração default: `--max-generate 2`.
- `--mode backfill` é a mesma máquina, caps maiores, mesmo acervo.

## Never

- `noticias.html`, Home, old editorial feed
- `<audio>`, players, radio houses, World Dial
- Promoções, Anuncie, Loja, cookies/privacy
- Menção pública a Whiplash ou Metal Hammer
- Assinatura automática Mr. Nomad
- Funk/pancadão orgânico

## Commands

```
python tools/editorial_blog_tunnel.py archive-stats
python tools/editorial_blog_tunnel.py discover --mode continuous
python tools/editorial_blog_tunnel.py generate --max-generate 2 --apply
python tools/editorial_blog_tunnel.py discover --mode backfill
```

Public author is always Passport Radio.
