# Sitemaps Passport Radio

PR específica, branch `feat/sitemap-expansion-20261014`, base `3ea94d6bf684d741d903ac983f70b3a37af4f81e`. Nenhum merge ou mudança de conteúdo, catálogo, Loja, Supabase, rádio/player/stream ou layout.

## URLs geradas

| Arquivo | URLs |
| --- | ---: |
| `sitemap.xml` | 61 |
| `sitemap-blog.xml` | 23.163 |
| `sitemap-loja.xml` | 892 |
| `sitemap-agenda.xml` | 1 |
| `sitemap-radios.xml` | 28 |
| `sitemap-bandas.xml` | 3.295 |
| `sitemap-podcasts.xml` | 1 |
| `sitemap-jogos.xml` | 1 |
| `sitemap-shows.xml` | 694 |
| **Total único** | **28.136** |

## Mapeamento real

- 28.181 HTMLs rastreados no Git; 37 são áreas privadas/técnicas ou previews (docs, privado, build, protótipo app e páginas de conta/checkout/pedido/teste). Os 28.144 candidatos públicos tiveram o head lido. Oito foram excluídos por higiene técnica, individualmente em `exclusions.json`.
- `blog/e/*.html`: 3.292 páginas de artistas. O mapa de bandas também contém o índice A–Z `/blog/arquivo/letras.html` e os hubs existentes de bandas/artistas.
- Loja: 882 páginas reais em `loja/p/*.html` e 10 páginas públicas legadas em `produto/*.html`; os 933 registros do catálogo permanecem intactos. Não foram criadas páginas para registros sem HTML.
- Inventário `data/passport-radio-inventory.json`: 401 rádios e 11 seletores de programas. Não há diretório público `radio/*.html`; existem páginas `radio-*.html`. Âncoras e parâmetros de seleção não são páginas novas. Seus hubs/páginas canônicas são listados uma vez, sem streams externos.
- Podcasts e Broadcast: catálogo incorporado em `radio.html`, sem páginas individuais `podcast/*.html`. `radio.html` fica somente no mapa podcasts, evitando duplicação com o mapa principal.
- Desafios: 45 jogos no catálogo desafios + 3 jogos no catálogo original, apresentados em `jogos.html`; não há páginas individuais `jogos/*.html`. O hub fica no mapa jogos.
- Shows: 694 páginas reais `agenda/*.html` com `MusicEvent`, também presentes no catálogo da Agenda; ficam no mapa shows. O hub `agenda.html` fica somente no mapa agenda. Nenhuma rota `/shows/` foi inventada.

## Regra técnica e evidências

O gerador lê o head de CADA candidato: meta robots/googlebot, link canonical e meta refresh. `noindex`, redirects e canonical não próprio são excluídos com URL, motivo e alvo registrados. Cada alvo existente passa pela sua própria checagem; apenas o destino indexável entra. Não há filtro por qualidade/relevância. Comentários e strings de scripts não são confundidos com metas.

As origens `www` e sem `www` do mesmo projeto são normalizadas para `https://passportradio.online`: HEAD real em `www/jogos.html` confirmou301 para o domínio oficial, que respondeu200. Não há alteração das declarações canonical do conteúdo.

XML foi analisado pelo parser padrão do Python. Verificados domínio, namespace, arquivos de destino, limites50.000 URLs/50MB, ausência de duplicatas e áreas privadas/previews. O teste de transporte HEAD local consulta cada URL sobre os arquivos exatos de publicação; isso é evidência local, não uma alegação de rastreamento HTTP de28mil URLs na produção. As três páginas públicas representativas e o hub jogos responderam200 em produção. Sitemaps novos entram em produção apenas após aprovação/merge/publicação.

Dos 27,343 endereços antigos com arquivo público existente, 27,343 continuam incluídos. Os 0 demais estão individualmente no log como noindex/redirect/canonical; nenhuma página indexável foi perdida. O destino final de cada trampolim/alias existente foi mantido.

`lastmod` usa somente dados explícitos de modificação no HTML/frontmatter ou `updated_at` do evento. Sem data conhecida, o campo é omitido; a data do checkout Git não é inventada como atualização editorial.

## Rodar e manter

```sh
node scripts/generate-sitemaps.mjs
python3 scripts/validate-sitemaps.py --http
```

Checagem sem regravar: `node scripts/generate-sitemaps.mjs --check`. Teste isolado do gerador: `node --test scripts/generate-sitemaps.test.mjs`.

O workflow EXISTENTE `.github/workflows/pages.yml` regenera os nove arquivos e valida XML/HTTP no artefato `_site` após o Jekyll e antes do upload Pages. Cada publicação na main, independentemente de ser nova matéria, produto, rádio, show ou desafio, passa por esse passo. Não há cron editorial, crawler, aquisição, novo serviço, permissão de escrita ou commit automático. PR valida/builda; o deploy existente continua restrito à main.

## Google Search Console — após publicação aprovada

- https://passportradio.online/sitemap.xml
- https://passportradio.online/sitemap-blog.xml
- https://passportradio.online/sitemap-loja.xml
- https://passportradio.online/sitemap-agenda.xml
- https://passportradio.online/sitemap-radios.xml
- https://passportradio.online/sitemap-bandas.xml
- https://passportradio.online/sitemap-podcasts.xml
- https://passportradio.online/sitemap-jogos.xml
- https://passportradio.online/sitemap-shows.xml

`robots.txt` mantém as regras existentes e declara esses nove sitemaps. Nenhuma aprovação de indexação pelo Google é prometida.
