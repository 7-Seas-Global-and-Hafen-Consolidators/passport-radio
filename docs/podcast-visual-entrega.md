# Podcast & Broadcast — vitrine visual

Branch: `feat/podcast-broadcast-visual-20261005`.
Base main: `b1ec8f36df6c8bef8038aacf87dbac214da6fd66`, após merge da PR #511.

## Alteração

Apenas a apresentação das coleções mudou. Capas locais existentes, títulos e datas existentes passam a compor cards editoriais. Podcast: 12 itens por página visual; Broadcast: 6. Desktop 1440: três colunas. Mobile 390: duas. Navegação anterior/próxima e páginas numeradas, sem outra URL, aba ou janela. Seleção destacada em vermelho. Paginar não seleciona, recarrega ou interrompe o item em reprodução.

Os cards de podcast continuam chamando `select()` do player nativo existente. Broadcast continua utilizando `select()` e a criação de iframe existente, sob demanda, com `youtube-nocookie` e `autoplay=0`. Nenhum player novo, motor novo ou catálogo novo.

Arquivos de implementação: `radio.html` (somente versões de cache dos três assets), `css/passport-podcast-paper.css`, `js/passport-podcast-player.js`, `js/passport-broadcast-catalog.js`.

Masthead, navegação, footer, pagamentos e fontes existentes permaneceram. Paleta #FFFFFF/#111111/#C41E3A. Referência de densidade: VÍDEOS, sem copiar sua arquitetura de reprodução.

## Integridade

Comparação byte a byte dos dois JSONs incorporados com a base: idênticos. **47/47 podcasts, 11/11 Broadcasts**, IDs únicos, mesma ordem, nomes, descrições, datas, mídia, URLs, imagens, metadados internos. `integrity.json` registra SHA-256. O restante de `radio.html` é idêntico, exceto os três sufixos de cache. Nenhum arquivo de rádio, radio-*, stream, Bus, interlock, engine, player universal, World Dial ou workflow alterado.

## QA

Chromium, desktop 1440 e mobile 390:

- seleção de todos os 58 itens em ambos os tamanhos; título/capa e endpoint do item selecionado correspondem aos dados existentes;
- Podcast anterior/próximo; Broadcast troca entre itens e desmontagem do iframe anterior;
- paginação numérica, anterior/próxima, primeira página bloqueia recuo; URL permanece `/radio.html`, uma única aba;
- áudio no **mesmo elemento nativo existente**, com fixture WAV de transporte: play/pause e avanço de tempo; controles de seek, volume, velocidade também verificados em teste controlado;
- 11/11 iframes criados pelo mecanismo existente com URL exata e `autoplay=0`, títulos públicos sem origem;
- nenhum texto de fonte/origem, link de aquisição ou contador técnico foi reintroduzido pelos componentes Passport;
- cores e fontes existentes verificadas, nenhum overflow e nenhuma exceção JavaScript nova;
- todas as capas selecionadas decodificaram; nenhuma origem de imagem mudou;
- `node --check` nos dois JS e `git diff --check`: PASS.

## Limitações explícitas

A reprodução remota efetiva dos serviços externos não foi confirmada nesta rodada. QA de áudio nativo usou fixture de transporte; QA de Broadcast comprova seleção/iframe/URL/autoplay, não streaming externo. Nenhum endpoint foi alterado para contornar isso.

As imagens originais preservadas podem conter nomes/logos embutidos pelo produtor (por exemplo Music Makes Us ou tiny desk). Não foi adicionada identificação de fonte na interface Passport. Esses pixels já pertencem às capas existentes; removê-los exigiria editar/substituir mídia, proibido por esta ordem.

Screenshots da própria branch usam os assets locais existentes e as mesmas três famílias tipográficas. A captura não usa a fixture de áudio para substituir duração editorial: mantém o estado selecionado com a duração original do catálogo.

## Evidência

- [Desktop 1440](podcast-visual-evidencias/podcast-1440.png)
- [Mobile 390](podcast-visual-evidencias/podcast-390.png)
- [QA](podcast-visual-evidencias/qa.json)
- [Integridade](podcast-visual-evidencias/integrity.json)

Sem merge. Parada na PR para revisão visual.
