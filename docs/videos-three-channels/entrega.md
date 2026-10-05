# Catálogo recuperável de três canais

Base: `72c76dbbbf32e1d3b63a6dc0f84f4c463a3c3fc7`. Branch limpa: `feat/videos-three-channels-resume-20261005`. #513/#514 permanecem fechadas, sem reutilização.

| Fonte | IDs distintos revisados | Elegíveis adicionados | Excluídos internos | Já entre os 106 |
|---|---:|---:|---:|---:|
| WackenTV | 2.957 | 1.508 | 1.449 | 0 |
| Midnight Special | 1.422 | 1.301 | 121 | 0 |
| BBC recuperável | 4.394 | 4.202 | 192 | 0 |

**106 originais + 7.011 novos = 7.117 vídeos públicos únicos**, em 297 páginas no motor existente. Os 106 registros e quatro coleções originais permanecem exatamente iguais, comprovados pelo SHA-256 canônico nos testes. Nenhum vídeo existente foi removido, substituído ou alterado.

## Recuperação e deduplicação

WackenTV, Midnight Special e as 223 playlists foram reutilizados dos arquivos persistidos, sem nova aquisição. A BBC reuniu os 4.031 registros das playlists preservadas e 479 Shorts: 116 Shorts já tinham ID nesse conjunto; 363 ampliaram o conjunto, chegando a 4.394 IDs distintos. Houve gravação incremental JSONL e salvamento final completo dos Shorts.

**A aba Videos de 6.444 entradas NÃO foi percorrida novamente. Seu resultado completo não sobreviveu no checkpoint disponível. Esta PR NÃO comprova cobertura integral do canal BBC:** registros exclusivos daquela listagem perdida continuam ausentes. Não se inventou quantidade elegível para os registros perdidos.

Aparições repetidas colapsadas dentro das aquisições recuperadas do mesmo canal: Wacken 5.345, Midnight 352, BBC 700, total **6.397**. Não são vídeos removidos da vitrine. Após essa deduplicação estrutural, houve zero colisões dos novos elegíveis com os 106 originais. Contagens brutas e IDs estão nas evidências. Metadados/contexto complementares foram obtidos somente para IDs adquiridos que exigiam classificação, sempre reutilizando arquivos existentes.

## Dados internos e projeção pública

`data/passport-videos-channel-audit.json` guarda IDs, URLs e títulos originais, canais, playlists, classificação e exclusões. Evidências brutas, checkpoints e contexto estão em `source-evidence.tar.gz`. O renderizador público não solicita o inventário técnico.

A projeção pública usa os campos já consumidos pelo motor aprovado: artista, título real, data comprovada quando disponível, ID técnico, thumbnail próprio, tipo/coleção e autorização de embed. Nenhuma data de upload virou data de show. Programas completos mantêm tipo `program`; performances separadas continuam separadas. Coleções novas têm rótulos editoriais neutros, sem provider/uploader ou links de aquisição.

Nomes oficiais de intérpretes como **BBC Scottish Symphony Orchestra / BBC Singers** foram preservados quando comprovados na descrição. São identidades de músicos, não atribuição ao canal BBC Music. Identidades de eventos/programas como Wacken Open Air e Piano Room permanecem.

**Limitação visual:** thumbnails originais podem conter logos gravados nos pixels (por exemplo BBC). Não foram recortados, adulterados ou substituídos. A ausência de procedência foi validada nos campos/textos gerados pela Passport, não nos pixels das imagens originais.

## QA e testes

- **11 testes Python PASS:** comparação exata dos 106 originais, IDs únicos e contagens reconciliadas; 50 obrigatórios; Marillion 55/51 e quatro exclusões; Smashing em ordem; BABYMETAL; Chicago com embed recusado; projeção pública e thumbnails correspondentes ao ID.
- **1440/390 PASS:** busca por artista, três coleções, filtro de performance, primeira página após filtro/busca, anterior/próxima/números, última página 297, limites dos botões, até 24 cards, três colunas desktop, ausência de overflow e zero exceções JavaScript capturadas.
- Integração do player existente validada com doubles controlados de YouTube API/Bus: iframe sob demanda, `youtube-nocookie`, `autoplay=0`, único ativo e fechar. Busca/filtros/paginação não fizeram claim de áudio; reprodução intencional usou a integração existente. Isto não certifica uma transmissão de rádio real.
- **Tentativa externa real de embed BBC:** HTTP 200, porém o provedor retornou “Video player configuration error” neste ambiente. Reprodução real não certificada; resultado em `provider-check.json`. Nenhum player foi modificado para contornar a restrição.
- Screenshots reais da branch: página inicial e as três coleções, em desktop/mobile. Mobile longo foi capturado por rolagem e montagem das capturas reais para evitar o limite gráfico do Chromium; consentimento local aceito para evitar repetição do overlay fixo.

## Integridade do escopo

Somente dados, testes e evidências/documentação alterados. **ZERO alterações em HTML, CSS, JS, navegação, mecanismos de reprodução, rádio, streams, sinais, Bus, mutex, interlock, World Dial, engines ou workflows.** Home, Loja, Agenda e Editorial intactos. O inventário técnico original conserva SHA-256 `044490b512d9802bfa822d1706bafd1a1e62e664e0a5d05a570c8c5873ea3147`.

Sem merge. Esta entrega contém catálogo público integrado de verdade, não apenas um checkpoint. Limitações de recuperação BBC e reprodução externa estão explicitadas para revisão humana.
