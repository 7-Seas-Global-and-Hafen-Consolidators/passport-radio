# Lambrini Girls — correção de composição editorial

A PR #581 foi encontrada fechada e mergeada. Base desta correção: `fc0365a714352b67edc56d5dbc882688d9c4ed00`. Nova branch: `fix/lambrini-composicao-paula-20261030`. Nenhuma alteração direta de main, merge ou publicação.

## O que mudou

Comparação das reportagens completas da Paula Toller e das Lambrini Girls, incluindo capítulos, multimídia e encerramento. A coluna uniforme da primeira versão foi substituída pela composição da referência interna: passagens centrais de leitura, pares de cartões com borda neutra e filete vermelho, respiro de 24 px e títulos de 27 px dentro dos cartões. São cinco pares, totalizando dez cartões; a abertura, o show e os três capítulos finais mantêm composições próprias. As 15 seções originais, seus 14 H2 e um H3 permanecem na mesma sequência.

Os cartões têm duas colunas acima de 800 px e uma coluna até 800 px, como os cartões da Paula. O encerramento retorna à coluna de 760 px para evitar um cartão quase vazio ao lado de um capítulo extenso. O bloco do Rockpalast combina chamada, apresentação e vídeo 16:9; no celular, volta à ordem vertical original. Sem paginação, ocultação ou controles novos.

Bodoni Moda 700, Source Serif 4 e Instrument Sans locais permanecem efetivamente carregadas. Corpo: 20 px em desktop, 19 px em tablet, 18 px em mobile e 17,5 px abaixo de 374 px; entrelinha 1,7. Nenhum conteúdo foi reduzido para encurtar a página.

**Produção: somente o HTML da Lambrini e `css/passport-editorial-pilot.css`.** O novo CSS continua carregado apenas por esta matéria. Paula foi aberta como referência e não foi editada. Não foram adicionadas imagens: a Lambrini tem uma fotografia e um vídeo originais, enquanto Paula possui seis capas e seis vídeos. Não foram inventadas capas para imitar a quantidade de materiais da outra reportagem.

## Verificações executadas

- 4/4 testes de integridade: narrativa integral normalizada, todos os títulos e ordem, fotografia e atributos originais, iframe e atributos/identificador, links, metadados, scripts e rodapé.
- 29/29 testes existentes de inventário e preservação, sem desativar verificações.
- Chromium 145 real: 1440, 1024, 768, 390, 360 e 320 px. Zero rolagem horizontal; nenhum descendente de main fora da largura; 15 capítulos e cinco pares; imagem carregada na proporção natural; vídeo 16:9; mesmo masthead, links e rodapé, sem duplicações.
- Três famílias tipográficas confirmadas por `document.fonts.load/check`.
- Áudio real em desktop e emulação móvel/touch de 390 px: Home → Notícias → Lambrini → Notícias. Mesmo elemento conectado, tempo e bytes decodificados avançando, sem pausa e um único áudio ativo. Não foi usado aparelho físico nem testadas todas as rádios.
- `git diff --check` sem erros. Nenhum arquivo de áudio, catálogo, script compartilhado, fotografia, outra reportagem ou infraestrutura alterado.

| Largura | Altura anterior do main | Altura corrigida |
|---|---:|---:|
| 1440 px | 6765 px | 5444 px |
| 1024 px | 6518 px | 5567 px |
| 768 px | 6536 px | 6820 px |
| 390 px | 9333 px | 10136 px |
| 360 px | 9980 px | 10726 px |
| 320 px | 10965 px | 12134 px |

Em telas estreitas, os limites e espaçamentos dos cartões aumentam a altura, preservando fonte e conteúdo. Em desktop, o miolo fica mais compacto por meio das duas colunas.

## Capturas reais e comparação interna

| Evidência | Desktop 1440 | Tablet 768 | Mobile 390 |
|---|---|---|---|
| Paula × Lambrini: capítulo interno | [1440](paula-x-lambrini-1440.webp) | [768](paula-x-lambrini-768.webp) | [390](paula-x-lambrini-390.webp) |
| Lambrini completa | [1440](lambrini-1440-full.webp) | [768](lambrini-768-full.webp) | [390](lambrini-390-full.webp) |
| Paula completa | [1440](paula-1440-full.webp) | [768](paula-768-full.webp) | [390](paula-390-full.webp) |
| Capítulos Lambrini | [1440](lambrini-1440-internal.webp) | [768](lambrini-768-internal.webp) | [390](lambrini-390-internal.webp) |
| Seis discos Paula | [1440](paula-1440-internal.webp) | [768](paula-768-internal.webp) | [390](paula-390-internal.webp) |
| Abertura Lambrini | [1440](lambrini-1440-opening.webp) | [768](lambrini-768-opening.webp) | [390](lambrini-390-opening.webp) |
| Show Lambrini | [1440](lambrini-1440-live.webp) | [768](lambrini-768-live.webp) | [390](lambrini-390-live.webp) |
| Capítulos posteriores Lambrini | [1440](lambrini-1440-later.webp) | [768](lambrini-768-later.webp) | [390](lambrini-390-later.webp) |
| Rodapé Lambrini | [1440](lambrini-1440-ending.webp) | [768](lambrini-768-ending.webp) | [390](lambrini-390-ending.webp) |

Antes da correção: [página completa 1440](before-1440-full.webp) · [capítulo interno](before-1440-internal.webp).

As pranchas contêm recortes de capturas reais, colocados lado a lado e identificados; não são imagens conceituais. As capturas completas da Paula que excedem o limite de altura do WebP foram reduzidas proporcionalmente para 16.000 px, sem excluir trechos. As capturas de capítulos preservam a conferência detalhada.

## Limitações registradas

O navegador registrou quatro mensagens `A network error occurred.` durante a execução; estão preservadas em `browser-results.json`. As verificações de layout, fontes e continuidade de áudio passaram, mas isso não constitui aprovação irrestrita dos recursos externos. O vídeo do Rockpalast foi preservado e dimensionado; não foi reproduzido integralmente. Recursos externos de vídeo podem aparecer como painel preto nas capturas. Nenhum URL ou mecanismo foi trocado para contornar isso.

A fixture serve fontes institucionais locais para solicitações legadas do Google Fonts e bloqueia recursos externos fora do percurso de teste. As fontes do piloto carregam diretamente do CSS local de produção. A transmissão de áudio foi real, não simulada. Nenhum endereço interno de transmissão foi incluído nas evidências ou nesta documentação.

Resultados: [navegador](browser-results.json) · [4 testes de integridade](unit-tests.txt) · [29 testes existentes](preservation-tests.txt).
