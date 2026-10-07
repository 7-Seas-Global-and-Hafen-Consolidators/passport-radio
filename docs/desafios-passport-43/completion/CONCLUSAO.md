# Desafios Passport — entrega para revisão

Branch: `feat/desafios-passport-43-20261007`. Base corrigida: `8122e83318423a922ddf5b7b5d06e7cf3fb8fa1c`. Checkpoint de aquisição já publicado: `4466f038671ccfd5da5d0c7266ed76160ee3f458`.

## Resultado e limites

43 posições estáveis no inventário: 11 desafios novos disponíveis (186 perguntas recuperadas), 32 posições com fonte parcial, claramente indisponíveis no portal. As posições 36–43 não possuem identidade recuperada e permanecem reservadas, sem títulos ou perguntas inventados. Não é uma entrega de 43 jogos completos. Os três mosaicos anteriores continuam disponíveis, com seus dados, 46 imagens e armazenamento existentes preservados: total de 14 desafios jogáveis.

As fontes brutas e corrigidas foram auditadas e deduplicadas. Veja `INVENTARIO-43.md`, `CHECKPOINT-AQUISICAO.md`, `source-audit.json` e `translation-provenance.json`. As mecânicas sem corpo recuperado não foram simuladas nem declaradas aprovadas em QA.

22 pistas fotográficas foram persistidas sem alteração. Seis imagens de resultados com marca RADIO BOB foram excluídas da interface e não incluídas como assets. As associações e hashes estão em `assets.json` e `MAPA-ASSETS.md`.

Um portal em `/jogos.html`, um motor em `/js/passport-games.js`, dados JSON separados e CSS limitado aos desafios. Perguntas textuais não recebem imagem; perguntas visuais conservam a pista nativa. Perfis usam os pesos recuperados e exibem empates. Respostas repetidas não somam pontos; progresso e reinício são isolados por desafio.

## QA

- `structural-qa.py`: PASS — 43 IDs; 186 IDs, alternativas, respostas, pesos e faixas conferidos contra a fonte; 22 hashes de imagens; dados e assets antigos preservados; arquivos radioativos byte a byte intactos.
- `node --check js/passport-games.js`: PASS.
- `git diff --check`: PASS.
- `browser-qa.cjs`: PASS para os 14 disponíveis, em 1440 e 390 px. Todas as 186 perguntas foram percorridas em cada largura; pontuação/perfis, explicações, respostas repetidas, reinício, persistência, mosaicos, filtros, teclado e ausência de overflow foram verificados. Sem erros JavaScript nas páginas dos desafios.
- Continuidade: MPB tocando PASS, Hits tocando PASS, MPB pausada PASS. 71 etapas por cenário: entrada no portal, quatro desafios de famílias distintas, perguntas, resultados, reinício, outro desafio e volta ao portal. Documento externo, runtime, host, elemento de áudio e fonte sobreviveram; estação/volume mantidos; zero chamadas de transporte, eventos de interrupção ou novas requisições de mídia após a seleção inicial. Em reprodução o tempo avançou; pausado permaneceu pausado.

O teste usa WAV controlado nas requisições de mídia do motor existente. Comprova sobrevivência do elemento/transporte, sem certificar recepção audível de streams externos reais. As faltas locais de ícones de pagamento da Home não afetam os desafios nem são alterações desta entrega.

## Integração da continuidade

A única integração necessária foi acrescentar `story` ao `main` de `jogos.html`, marcador já reconhecido pelo mecanismo compartilhado `passport-persist-nav.js`. Nenhum mecanismo novo: o leitor existente mantém o documento externo e seu transporte. `passport-audio-continuity.js`, `passport-persist-nav.js`, player, streams, bus, mutex/interlock, engines e demais páginas permanecem sem alteração. O código dos jogos não chama APIs de áudio nem grava estado de estação.

## Persistência

Inventário, mapa de assets e aquisição foram publicados antes da implementação. Dados finais, testes reproduzíveis, resultados e screenshots estão nesta pasta. Pendências são as 32 posições explicitamente parciais, aguardando corpo aprovado persistido; não houve novo garimpo.

Entrega na mesma branch, PR DRAFT para revisão, sem merge.
