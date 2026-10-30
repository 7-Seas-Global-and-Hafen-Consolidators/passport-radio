# Fase 2 — Lambrini Girls: piloto editorial

Base atualizada: `674a1fe6092eaf34ac01db09c7d465d1f00821a3`, já contendo a PR #580 mesclada. Branch exclusiva: `feat/fase2-lambrini-editorial-20261030`. Nenhuma expansão para outras matérias, merge ou publicação.

## Implementação

Somente dois arquivos de produção: a matéria `editorial/2026/10/22/lambrini-girls-no-refunds-the-basement-spilt.html` e o novo `css/passport-editorial-pilot.css`, carregado exclusivamente por ela e restrito à classe `.passport-editorial-pilot`.

- Abertura: retorno a Notícias, categoria PUNK, manchete original, resumo integral, autoria/data de publicação e a mesma fotografia horizontal. A fotografia foi apenas reposicionada, sem recorte, deformação ou alteração do arquivo.
- Leitura em coluna de até 760 px, dentro de uma área editorial de até 1200 px. Os 198 parágrafos fragmentados foram reunidos em 28 blocos, mantendo todas as palavras, formatações de ênfase e sua ordem.
- Os 14 H2 e o H3 continuam na ordem original, organizados em 15 seções, incluindo a abertura. Divisórias discretas, uma frase original destacada e um painel branco para a apresentação do Rockpalast, sem sombras decorativas.
- Manchete: Bodoni Moda 700, 56 px desktop / 42 px tablet / 34 px mobile (32 px nas telas mais estreitas). Corpo: Source Serif 4, 20 / 19 / 18 px (17,5 px abaixo de 374 px), entrelinha 1,7. Instrument Sans 600 nas identificações.
- As três fontes vêm dos arquivos locais já existentes no projeto, por aliases exclusivos do piloto. Não dependem de um carregamento remoto para a nova apresentação.
- O controle de apoio existente foi colocado no fluxo ao final da página, mantendo seu botão e comportamento, para não cobrir o texto. Nenhum motor ou script compartilhado foi modificado.
- Masthead da Fase 1, nove redes, destinos da navegação, rodapé e pagamentos preservados. Notícias foi indicada como seção atual apenas nesta matéria.

Referência interna: Paula Toller, na versão atual da base. Referência externa: [reportagem da Rolling Stone Brasil](https://rollingstone.com.br/musica/billy-corgan-do-smashing-pumpkins-diz-que-respeita-olivia-rodrigo-ela-nao-tem-medo/), consultada no HTML/CSS: Publico Banner Web nos títulos e entrelinha de 1,2. Foram aplicados o contraste, a hierarquia e a organização editorial usando as famílias institucionais Passport.

## Validação efetivamente executada

- **4/4 testes novos:** texto integral e ordem dos títulos; fotografia/vídeo/links/metadados; footer/scripts/masthead; aplicação exclusiva ao piloto.
- **29/29 testes existentes** de preservação de inventário, rádios, Living Collection™ e K-Pop. Nenhuma expectativa histórica modificada ou verificação desativada.
- Chromium real em **1440, 1024, 768, 390, 360 e 320 px**: zero rolagem horizontal, títulos dentro da tela, imagem carregada com proporção natural 1000:606, vídeo 16:9, único rodapé universal e masthead inalterado. Capturas finais conferidas em 1440/768/390, incluindo o apoio no fluxo e o banner de cookies dispensado pelo botão existente.
- As três famílias tipográficas do piloto foram efetivamente carregadas e verificadas pela API `document.fonts`, a partir dos recursos locais reais.
- **Áudio real em desktop e emulação mobile/touch:** Home → Notícias → Lambrini Girls → Notícias, mesmo elemento conectado, tempo e bytes decodificados avançando e apenas um áudio ativo. Não foi usado aparelho físico nem testada individualmente a reprodução dos 401 sinais.
- O iframe do Rockpalast carregou o título “Lambrini Girls – Full Show, live | 2025 | Rockpalast”, do WDR Rockpalast. URL, identificador, atributos e ordem preservados; sem autoplay. Não foi executada a reprodução integral do show.
- Zero erros JavaScript nos percursos registrados. Nenhuma alteração em scripts, inventários, streams, imagens, fontes, outras páginas ou CSS compartilhado.

### Altura do conteúdo principal, mantendo a matéria completa

| Largura | Antes | Depois | Corpo |
|---|---:|---:|---:|
| 1440 | 11.546 px | 6.765 px | 20 px |
| 1024 | 11.141 px | 6.518 px | 19 px |
| 768 | 11.109 px | 6.536 px | 19 px |
| 390 | 13.321 px | 9.333 px | 18 px |
| 360 | 13.911 px | 9.980 px | 17,5 px |
| 320 | 14.708 px | 10.965 px | 17,5 px |

Redução aproximada de 41% no desktop e 30% no celular de 390 px, sem cortes editoriais nem redução indiscriminada da fonte.

## Capturas reais

| Área | Desktop 1440 | Tablet 768 | Mobile 390 |
|---|---|---|---|
| Abertura completa | [ver](after-opening-1440.webp) | [ver](after-opening-768.webp) | [ver](after-opening-390.webp) |
| Trecho de leitura em escala real | [ver](after-reading-1440.webp) | [ver](after-reading-768.webp) | [ver](after-reading-390.webp) |
| Corpo completo | [ver](after-body-1440.webp) | [ver](after-body-768.webp) | [ver](after-body-390.webp) |
| Show incorporado | [ver](after-media-1440.webp) | [ver](after-media-768.webp) | [ver](after-media-390.webp) |
| Encerramento | [ver](after-ending-1440.webp) | [ver](after-ending-768.webp) | [ver](after-ending-390.webp) |
| Rodapé | [ver](after-footer-1440.webp) | [ver](after-footer-768.webp) | [ver](after-footer-390.webp) |

Comparações: [ANTES × DEPOIS desktop](comparison-1440.webp) · [ANTES × DEPOIS mobile](comparison-390.webp).

Reportagem inteira: [desktop](after-full-1440.webp) · [mobile](after-full-390.webp). As versões anteriores também estão preservadas nos arquivos `before-*`.

Relatórios: [navegador, fontes e áudio](browser-results.json), [4 testes novos](unit-tests.txt), [29 testes existentes](existing-preservation-tests.txt) e [coordenadas das capturas](capture-boxes.json).

As imagens são capturas do navegador exportadas para WebP. A abertura e os trechos de leitura foram recortados pelas coordenadas reais do DOM de capturas completas, sem reconstrução de conteúdo; as pranchas comparativas apenas colocam as duas capturas lado a lado, na mesma escala. O carregamento Google Fonts preexistente recebeu fontes institucionais locais na fixture de teste; as novas famílias locais do piloto foram carregadas diretamente do CSS de produção. Recursos externos fora do escopo foram bloqueados no teste. Nenhum áudio foi simulado.
