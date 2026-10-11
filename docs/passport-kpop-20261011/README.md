# PR #545 — estado final da retomada coreana

**Resultado: 0/23 coreanos confirmados no navegador hospedado. As 154 rádios já comprovadas permanecem integralmente preservadas; preview funcional anterior mantido. Não se declarou que as fontes estão fora do ar.**

Referência: `c373388e196afd7b302e565b45697be5f7761f2a`. Mesma branch `feat/passport-kpop-26-20261011`, mesma PR, nenhum merge.

## Resultados individuais

| Nº | Nome público | Resultado desta retomada | Manifest adquirido |
|---|---|---|---|
| 01 | K-Pop Hits™ | Não confirmado: init e segmentos BunnyCDN HTTP 403 / HTML, inclusive cdn=ios | https://api.seoul.fm/v3/streams/seoulfm/manifest.m3u8 |
| 02 | K-Pop Now™ | Não confirmado: playlist MSE respondeu; sem áudio em 30 s; console HTTP 403 | https://api.seoul.fm/v3/streams/new/manifest.m3u8 |
| 03 | K-Pop Girls™ | Não confirmado: playlist MSE respondeu; sem áudio em 30 s; console HTTP 403 | https://api.seoul.fm/v3/streams/girlpower/manifest.m3u8 |
| 04 | K-Pop Boys™ | Não confirmado: playlist MSE respondeu; sem áudio em 30 s; console HTTP 403 | https://api.seoul.fm/v3/streams/boypower/manifest.m3u8 |
| 05 | K-Pop Classics™ | Não confirmado: playlist MSE respondeu; sem áudio em 30 s; console HTTP 403 | https://api.seoul.fm/v3/streams/classics/manifest.m3u8 |
| 06 | K-Pop 90s™ | Não confirmado: playlist MSE respondeu; sem áudio em 30 s; console HTTP 403 | https://api.seoul.fm/v3/streams/1990s/manifest.m3u8 |
| 07 | K-Pop 2000s™ | Não confirmado: playlist MSE respondeu; sem áudio em 30 s; console HTTP 403 | https://api.seoul.fm/v3/streams/2000s/manifest.m3u8 |
| 08 | K-Pop 2010s™ | Não confirmado: playlist MSE respondeu; sem áudio em 30 s; console HTTP 403 | https://api.seoul.fm/v3/streams/2010s/manifest.m3u8 |
| 09 | K-Pop 2020s™ | Não confirmado: playlist MSE respondeu; sem áudio em 30 s; console HTTP 403 | https://api.seoul.fm/v3/streams/2020s/manifest.m3u8 |
| 10 | K-Dance™ | Não confirmado: playlist MSE respondeu; sem áudio em 30 s; console HTTP 403 | https://api.seoul.fm/v3/streams/dance/manifest.m3u8 |
| 11 | K-Rock™ | Não confirmado: playlist MSE respondeu; sem áudio em 30 s; console HTTP 403 | https://api.seoul.fm/v3/streams/krock/manifest.m3u8 |
| 12 | K-Indie™ | Não confirmado: playlist MSE respondeu; sem áudio em 30 s; console HTTP 403 | https://api.seoul.fm/v3/streams/indie/manifest.m3u8 |
| 13 | K-Hip-Hop™ | Não confirmado: playlist MSE respondeu; sem áudio em 30 s; console HTTP 403 | https://api.seoul.fm/v3/streams/hiphop/manifest.m3u8 |
| 14 | K-R&B™ | Não confirmado: playlist MSE respondeu; sem áudio em 30 s; console HTTP 403 | https://api.seoul.fm/v3/streams/rnb/manifest.m3u8 |
| 15 | K-Ballads™ | Não confirmado: playlist MSE respondeu; sem áudio em 30 s; console HTTP 403 | https://api.seoul.fm/v3/streams/ballad/manifest.m3u8 |
| 16 | K-Chill™ | Não confirmado: playlist MSE respondeu; sem áudio em 30 s; console HTTP 403 | https://api.seoul.fm/v3/streams/chill/manifest.m3u8 |
| 17 | K-LoFi™ | Não confirmado: playlist MSE respondeu; sem áudio em 30 s; console HTTP 403 | https://api.seoul.fm/v3/streams/lofi/manifest.m3u8 |
| 18 | K-City Pop™ | Não confirmado: playlist MSE respondeu; sem áudio em 30 s; console HTTP 403 | https://api.seoul.fm/v3/streams/citypop/manifest.m3u8 |
| 19 | K-Drama OST™ | Não confirmado: playlist MSE respondeu; sem áudio em 30 s; console HTTP 403 | https://api.seoul.fm/v3/streams/ost/manifest.m3u8 |
| 20 | K-Divas™ | Não confirmado: playlist MSE respondeu; sem áudio em 30 s; console HTTP 403 | https://api.seoul.fm/v3/streams/divas/manifest.m3u8 |
| 21 | K-Kings™ | Não confirmado: playlist MSE respondeu; sem áudio em 30 s; console HTTP 403 | https://api.seoul.fm/v3/streams/kings/manifest.m3u8 |
| 22 | K-Pop Japan™ | Não confirmado: playlist MSE respondeu; sem áudio em 30 s; console HTTP 403 | https://api.seoul.fm/v3/streams/japan/manifest.m3u8 |
| 23 | K-Holidays™ | Não confirmado: playlist MSE respondeu; sem áudio em 30 s; console HTTP 403 | https://api.seoul.fm/v3/streams/holidays/manifest.m3u8 |
| 24 | 中国流行音乐™ | Operacional conforme evidência anterior; não reprocessado | https://lhttp.qtfm.cn/live/20500215/64k.mp3 |
| 25 | Sertanejo Raiz™ | Operacional conforme evidência anterior; não reprocessado | https://radio2.mazagafm.com:8443/live?type=.mp3 |
| 26 | Sertanejo FM™ | Operacional conforme evidência anterior; não reprocessado | https://servidor36-1.brlogic.com:7104/live?source=website |

## Diagnóstico comprovado

O player original prioriza HLS.js / MediaSource para AAC-LC em fragmented MP4. A Passport tentava HLS nativo quando `canPlayType` dizia `maybe`. Foi preparada uma preferência de transporte restrita aos 23 registros novos, reutilizando a biblioteca existente, sem alterar o player universal, Bus, mutex ou continuidade. Pop passou a usar a chave pública `public`, conforme o site original.

A rodada hospedada carregou as playlists dos 23 candidatos, mas nenhum confirmou áudio. O diagnóstico adicional foi restrito a Pop: o manifest público documentado `?bitrate=192&cdn=ios` respondeu 200 com CORS `*`; a BunnyCDN devolveu 403 e HTML no init MP4 e nos segmentos. HLS.js registrou `fragLoadError / HTTP Error 403`. A causa da regra CDN (IP, referer, token ou outra) NÃO FOI ESTABELECIDA. Esse corpo HTTP foi capturado apenas para Pop; não foi automaticamente atribuído aos outros 22.

Uma requisição HTTPS comum no workspace recebeu init MP4 e um segmento válidos, HTTP 200, CORS `*`. ffprobe identificou AAC estéreo / 44,1 kHz no init. Isso confirma que a fonte não deve ser chamada de morta; não substitui prova de reprodução na Home. Nenhum header de identidade foi falsificado, nenhuma proteção removida e nenhum proxy foi criado.

## Código, preservação e ponto de retomada

`PREPARED_KOREAN_COMPATIBILITY.patch` conserva a integração e os 23 cartões na ordem aprovada. O patch ficou INATIVO porque não houve áudio confirmado. `js/world-radio-player.js`, `data/passport-radio-inventory.json` e o runtime público foram restaurados exatamente à referência de 154 rádios. Os três novos canais anteriormente comprovados não foram coletados nem reproduzidos novamente.

Ponto exato: resolver a negativa HTTP 403 no navegador hospedado ou obter uma saída pública autorizada compatível, sem contornar a CDN; então reaplicar o patch e comprovar áudio. Não repetir descoberta, não inventar streams, não declarar disponibilidade falsa.

## Evidências

- `KOREAN_MSE_INITIAL_RESULTS.json`: 23 resultados individuais, playlists, mensagens e falhas.
- `KOREAN_CDN_DIAGNOSTIC.json`: resposta HTTP e eventos HLS.js da única amostra aprofundada.
- `KOREAN_COMPATIBILITY.json`: origem do player, codec, headers e diagnóstico.
- `INITIAL_RESULTS.json`, `DIAGNOSTIC_RESULTS.json`, `VARIANT_RESULTS.json`, `CDN_RESULTS.json`: histórico anterior preservado.
- Reprodução dos 23: https://github.com/7-Seas-Global-and-Hafen-Consolidators/passport-radio/actions/runs/38145780818 (FALHOU; nenhum áudio confirmado).
- Diagnóstico único Pop: https://github.com/7-Seas-Global-and-Hafen-Consolidators/passport-radio/actions/runs/38146843694 (execução diagnóstica concluída; não é aprovação de reprodução).
- Layout experimental: oito larguras, 188 cartões, ordem correta, sem overflow; no artefato da primeira rodada. Não representa canais funcionais.
- Cinco testes focados confirmam preservação dos 154 registros e bytes dos motores protegidos.
- Evidência funcional anterior, reaproveitada para o runtime restaurado: https://github.com/7-Seas-Global-and-Hafen-Consolidators/passport-radio/actions/runs/38124032423 .

Preview mantido: https://passport-kpop-preview-20261011.mr-nomad.chatgpt.site . Contém 154 rádios + 11 seletores de projetos. Nenhum cartão coreano foi publicado como funcional.

PR: https://github.com/7-Seas-Global-and-Hafen-Consolidators/passport-radio/pull/545 . SHA final: HEAD desta PR; o checkpoint identifica a referência e as execuções. Nenhum merge.
