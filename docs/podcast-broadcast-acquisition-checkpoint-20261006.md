# Retomada da PR #518 — operação bloqueada, não concluída

HEAD inicial confirmado: `5ef703c163f143e6f3b273a2d34e8cf0b94d3bd0`. Mesma branch; PR aberta e draft, sem merge.

BBC: 3.660 registros persistidos, último ID `M73WjackSEA`. Zero registros novos. O checkpoint recuperado não contém token de continuação. A tentativa com corte em 3.661 recebeu HTTP 502 na página 15 da API, antes de alcançar o corte. Não foi feita segunda travessia. Aquisição permanece incompleta.

Assets: o pacote recuperado contém 1.131 registros de artwork, mas nenhum WebP. As 261 capas publicadas na branch estão disponíveis. Os bytes dos outros artworks processados não estão no pacote nem no conjunto publicado; não foram recriados. O mapa dos blobs foi preservado. Evidência item a item em `podcast-broadcast-resumption-20261006.json`.

Catálogo preservado: 326 Podcasts (47 originais + 279 da integração parcial), 11 Broadcasts originais; zero novos nesta retomada. Curadoria/integracão final e QA permanecem pendentes. Os testes já aprovados não foram repetidos. Nenhuma alteração em radio.html, CSS, JS, player, streams, Bus, mutex/interlock, rádios, engines, layout ou workflows.

Checkpoints e mapa de blobs agora persistidos na própria branch em `docs/podcast-broadcast-recovery/`. Esta atualização não declara entrega final nem aquisição completa.
