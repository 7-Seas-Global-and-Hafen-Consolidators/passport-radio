# Passport Global Blog Tunnel™ V1

Private discovery + public Blog writing. The mill is reused; the destination is new.

## Sources (entire houses, not a demo)

- Whiplash.Net — RSS `feeds/news.xml`, sitemaps, HTML indexes (`ultimas`, temas). HTML/sitemaps may 403 behind Cloudflare; RSS remains the live spine and the other adapters stay wired for when they answer.
- Metal Hammer Germany — RSS (`/feed/`, `/news/feed/`, `/reviews/feed/` + `paged`), WordPress REST (`/wp-json/wp/v2/posts`, `/reviews`), sitemap index (posts, news, reviews, concerts, festivals, tours). Artist/genre sitemaps are not ingested as articles.

Black Sabbath / Back to the Beginning is a **test case**, not an allowlist.

## Pipeline

`discover` (entire eligible surface → persistent queue)
→ Fact Pack / merge / entities / media resolver
→ original PT-BR (xAI, then mill provider, then fact-pack writer)
→ quality gate
→ `/blog/YYYY/MM/DD/slug.html`
→ `data/blog-feed.json` archive cards
→ sitemap
→ knowledge graph in place

Human cover of `blog.html` stays human. The tunnel never replaces it.

## Caps

- Discovery fills the queue. It is not limited to two stories.
- Generation default is `--max-generate 2`.
- `--mode backfill` walks further (REST pages, sitemaps, indexes) into the **same queue**. It does not dump the live site.

## Never

- `noticias.html`, Home, old editorial feed
- `<audio>`, players, radio houses, World Dial
- Promoções, Anuncie, Loja, cookies/privacy
- Public mention of Whiplash or Metal Hammer
- Automatic byline Mr. Nomad
- Funk/pancadão organic copy

## Commands

```
python tools/editorial_blog_tunnel.py discover --mode continuous
python tools/editorial_blog_tunnel.py generate --max-generate 2 --apply
python tools/editorial_blog_tunnel.py discover --mode backfill
```

Public author is always Passport Radio.
