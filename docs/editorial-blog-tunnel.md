# Passport Blog — publicação, catálogo, busca, arquivo, discussão

O Blog é uma publicação. O feed recente não é o arquivo.

- Catálogo persistente: `data/blog-catalog.jsonl` (idempotente, sem teto de 400)
- Busca: `/blog/busca.html` + shards em `data/blog-search/`
- Arquivo: `/blog/arquivo/`
- Entidades: `/blog/e/{slug}.html` só com conteúdo real
- Discussão: Conta Passport (Supabase já existente) + `supabase/blog_discussion.sql`
- IndexNow: dispara no publish se `data/indexnow.key` existir
- Slogan morto e andaime público de discussão não entram nas superfícies do Blog

```
python tools/editorial_blog_tunnel.py surfaces
python tools/editorial_blog_tunnel.py generate --max-generate 2 --apply
```
