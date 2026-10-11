# Passport Radio — novos canais, 11/10/2026

**Entrega parcial verificada: 151 → 154 rádios. Três adições funcionais; 23 coreanos bloqueados e fora do catálogo público. Nenhum merge.**

Branch: `feat/passport-kpop-26-20261011`
Base: `b10875a900625eb1bdfb6418233f11f4e6f06d93`
PR: https://github.com/7-Seas-Global-and-Hafen-Consolidators/passport-radio/pull/545
Prévia: https://passport-kpop-preview-20261011.mr-nomad.chatgpt.site

## Canais e resultado individual

Documentação técnica: os nomes de origem e URLs ficam separados da fachada. Os cartões e informações públicas das adições usam exclusivamente os nomes aprovados e Passport Radio.

| Nº | Nome aprovado | Resultado | Formato | URL técnica |
|---|---|---|---|---|
| 01 | K-Pop Hits™ | BLOQUEADO — H | HLS AAC-LC | https://api.seoul.fm/v3/streams/seoulfm/manifest.m3u8 |
| 02 | K-Pop Now™ | BLOQUEADO — H | HLS | https://api.seoul.fm/v3/streams/new/manifest.m3u8 |
| 03 | K-Pop Girls™ | BLOQUEADO — H | HLS | https://api.seoul.fm/v3/streams/girlpower/manifest.m3u8 |
| 04 | K-Pop Boys™ | BLOQUEADO — H | HLS | https://api.seoul.fm/v3/streams/boypower/manifest.m3u8 |
| 05 | K-Pop Classics™ | BLOQUEADO — H | HLS | https://api.seoul.fm/v3/streams/classics/manifest.m3u8 |
| 06 | K-Pop 90s™ | BLOQUEADO — H | HLS | https://api.seoul.fm/v3/streams/1990s/manifest.m3u8 |
| 07 | K-Pop 2000s™ | BLOQUEADO — H | HLS | https://api.seoul.fm/v3/streams/2000s/manifest.m3u8 |
| 08 | K-Pop 2010s™ | BLOQUEADO — H | HLS | https://api.seoul.fm/v3/streams/2010s/manifest.m3u8 |
| 09 | K-Pop 2020s™ | BLOQUEADO — H | HLS | https://api.seoul.fm/v3/streams/2020s/manifest.m3u8 |
| 10 | K-Dance™ | BLOQUEADO — H | HLS | https://api.seoul.fm/v3/streams/dance/manifest.m3u8 |
| 11 | K-Rock™ | BLOQUEADO — H | HLS | https://api.seoul.fm/v3/streams/krock/manifest.m3u8 |
| 12 | K-Indie™ | BLOQUEADO — H | HLS | https://api.seoul.fm/v3/streams/indie/manifest.m3u8 |
| 13 | K-Hip-Hop™ | BLOQUEADO — H | HLS | https://api.seoul.fm/v3/streams/hiphop/manifest.m3u8 |
| 14 | K-R&B™ | BLOQUEADO — H | HLS | https://api.seoul.fm/v3/streams/rnb/manifest.m3u8 |
| 15 | K-Ballads™ | BLOQUEADO — H | HLS | https://api.seoul.fm/v3/streams/ballad/manifest.m3u8 |
| 16 | K-Chill™ | BLOQUEADO — H | HLS | https://api.seoul.fm/v3/streams/chill/manifest.m3u8 |
| 17 | K-LoFi™ | BLOQUEADO — H | HLS | https://api.seoul.fm/v3/streams/lofi/manifest.m3u8 |
| 18 | K-City Pop™ | BLOQUEADO — H | HLS | https://api.seoul.fm/v3/streams/citypop/manifest.m3u8 |
| 19 | K-Drama OST™ | BLOQUEADO — H | HLS | https://api.seoul.fm/v3/streams/ost/manifest.m3u8 |
| 20 | K-Divas™ | BLOQUEADO — H | HLS | https://api.seoul.fm/v3/streams/divas/manifest.m3u8 |
| 21 | K-Kings™ | BLOQUEADO — H | HLS | https://api.seoul.fm/v3/streams/kings/manifest.m3u8 |
| 22 | K-Pop Japan™ | BLOQUEADO — H | HLS | https://api.seoul.fm/v3/streams/japan/manifest.m3u8 |
| 23 | K-Holidays™ | BLOQUEADO — H | HLS | https://api.seoul.fm/v3/streams/holidays/manifest.m3u8 |
| 24 | 中国流行音乐™ | ÁUDIO COMPROVADO | MP3 | https://lhttp.qtfm.cn/live/20500215/64k.mp3 |
| 25 | Sertanejo Raiz™ | ÁUDIO COMPROVADO | MP3 | https://radio2.mazagafm.com:8443/live?type=.mp3 |
| 26 | Sertanejo FM™ | ÁUDIO COMPROVADO | MP3 | https://servidor36-1.brlogic.com:7104/live?source=website |

**H — bloqueio individual dos 23 candidatos coreanos:** cada manifest e sua variante de 48 kbps respondeu HTTP 206 na rodada inicial, mas o áudio não começou em 30 segundos pelo transporte Passport existente. `INITIAL_RESULTS.json` registra a URL, resposta e erro de cada candidato. Não foram contabilizados nem deixados como cartões quebrados.

**Diagnóstico detalhado de K-Pop Hits™:** Chrome sinaliza suporte HLS nativo `maybe`; o áudio termina em `MEDIA_ERR_SRC_NOT_SUPPORTED` (código 4) / `NotSupportedError`. O navegador bloqueia o init MP4 e segmentos M4S da CDN com `net::ERR_BLOCKED_BY_ORB`. As opções públicas documentadas `bitrate=192` e `cdn=ios` também falharam. A causa ORB foi observada neste diagnóstico; não foi inventada como erro individual dos demais 22. Não se desativou ORB, CORS, TLS, DRM, autenticação ou restrição geográfica. Não se modificou o motor para forçar outro caminho. Isto descreve o ambiente hospedado de teste, não afirma que a emissora está fora do ar ou que falha no aparelho do proprietário.

## Descoberta preservada

A documentação oficial https://api.seoul.fm/v3/docs define GET /streams e os manifests como endpoints públicos sem chave. O botão Execute retornou HTTP 200, 25 encoders distintos, todos os 23 candidatos pedidos, `live: true`, bitrates 48/128/192/320 e CORS `*`. Classics, Lo-Fi e City Pop existem nessa resposta embora ausentes da seleção visual de 22 estações do site. O manifest real de Pop anuncia AAC-LC `mp4a.40.2`. Não se utilizou chave do site, sessão, endpoint administrativo ou URL assinada temporária como endereço permanente. A descoberta é evidência de endereço; a prova de funcionamento é separada.

O chinês vem do atributo público `data-wrp-play` na página fornecida; o mount `20500215` é diferente do `4804` anterior. Os sertanejos vêm do `<source>` público e da configuração `MAIN_STREAM_URL` dos respectivos sites fornecidos. Todos os três retornaram `audio/mpeg`, com bytes de áudio decodificado e avanço temporal real, inclusive após pausa/retomada. As URLs não duplicam as 151 anteriores. Os encoders coreanos possuem chaves distintas; todos os 26 endereços estão preservados em `candidates.json`, com suas fontes e validações. Não houve aquisição de imagens.

## Integração mínima

Somente três registros foram anexados ao transporte World existente, nos índices 63, 64 e 65. Os 63 anteriores permanecem iguais, e todo o corpo de reprodução depois de `const $=` é byte-idêntico à base. A Home continua selecionando pelo mesmo `PassportAudioRuntime.engine.select` e usando as mesmas classes, ícone, CSS e breakpoints; nenhum player novo.

O chinês aparece após o chinês anterior em WORLD DIAL™. Sertanejo Raiz™ aparece após Sertanejo Brasil™, e Sertanejo FM™ após Raiz. A posição da família coreana entre Pop e Soul está preparada no renderer, mas não se apresenta uma família vazia nem canais não funcionais. Ela permanece pendente da compatibilidade HLS.

`before.json` mantém todos os 151 canais e 11 seletores de projetos originais. Quatro testes verificam cada registro anterior, índices e streams, a identidade do transporte e os bytes dos arquivos protegidos. Home compilada, Bus, continuidade, player, CSS, TV e videoteca não foram alterados. O conjunto completo mantém 165 cartões: 154 rádios + 11 seletores de projetos.

## Testes e evidências

- Preservação e mapeamento: quatro testes aprovados, sem inventário antigo perdido.
- Chrome real: três MP3 reproduzidos por cliques reais nos cartões; avanço do relógio e bytes decodificados; pausa e retomada com novo avanço; uma única fonte de áudio ativa.
- Continuidade real Home → Arquivo → Home: mesmo elemento e áudio avançando, sem reinício; volume 0,4 preservado. Não se afirma continuidade universal em recargas, novas abas ou rotas fora do contrato existente.
- Anterior/próxima: seleção e nomes corretos pelo controle existente.
- Rádio nova ↔ Passport Hits™ e rádio ↔ Passport Clips TV™: interlock passou; vídeo real da TV original foi utilizado. Nenhum autoplay na entrada.
- 320/360/375/390/414/480/768/1280 px: sem overflow nem nomes cortados. CSS original: duas colunas nos menores tamanhos, três a partir de 375 px, quatro em 768 e oito em 1280. Nenhum asset de rádio adicionado; fotos e imagens antigas permanecem intactas.

Prova de reprodução e controles: https://github.com/7-Seas-Global-and-Hafen-Consolidators/passport-radio/actions/runs/38124032423 (`VERIFIED_PLAYBACK_RESULTS.json`). A retomada passou a exigir relógio avançando, em vez de apenas `paused=false`, antes da próxima seleção; diagnósticos são capturados como cópias por canal. O resultado final tem três PLAYING, quatro checks PASS e zero erros de página.

As fontes locais existentes foram incluídas no checkout de QA e na prévia, sem modificar seus arquivos. Rodada visual aprovada: https://github.com/7-Seas-Global-and-Hafen-Consolidators/passport-radio/actions/runs/38124284614 (`FINAL_LAYOUT_RESULTS.json`). Capturas reais `home-320.png`, `home-390.png` e `home-1280.png` no artifact desse run. Esta rodada recolheu as capturas finais; ela não reprocessa os streams já comprovados. O workflow evita repetição de áudio quando a revisão seguinte altera somente documentação. A configuração final normal continua testando os canais integrados e falha se algum não reproduzir.

`VALIDATED_APP_HASHES.json` permite verificar que a aplicação entregue é a mesma testada. O SHA final da documentação é o HEAD da PR acima; o checkpoint identifica separadamente o commit da aplicação validada.

## Retomada exata

Primeira pendência: compatibilidade dos 23 HLS coreanos com a resposta da CDN e o caminho nativo existente, mantendo as proteções do navegador e os motores protegidos. Reaproveitar manifests, URLs, resultados e diagnóstico. Não reiniciar descoberta, não refazer as três rádios aprovadas e não contornar controles de acesso. A Home pública não foi publicada por esta operação; depende de merge autorizado.
