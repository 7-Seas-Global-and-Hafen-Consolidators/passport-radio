# World Dial™ — Living Collection™

PR de trabalho: **#574** · branch `feat/living-collection-world-dial-20261027`.
Correção artística continuada sobre `a607f91421d037df15285401d4625bdac06e46e8`, sem reconstruir o piloto.

## 42 rádios, 42 capas

As 42 miniaturas agora são composições musicais originais e individualizadas. A ordem, os IDs e os nomes vêm do inventário existente. Cada ID aponta para seu próprio arquivo local `images/radio/living-collection/<id>.webp`, sem capa genérica de reserva e sem dependência externa de imagens.

O [manifesto](artwork-manifest.json) registra, para cada rádio, ID, nome oficial, caminho, tema musical/cultural e confirmação de identidade artística individual. Também registra dimensões, perfil de cor, peso e integridade dos arquivos.

- **42/42 arquivos WebP**, 512×512, RGB com perfil sRGB incorporado.
- Exportação em qualidade 86; maior arquivo: **86.058 bytes**; conjunto completo: **2.048.658 bytes**.
- Miniaturas exibidas em 68×68, `object-fit:cover`, raio de **8 px**.
- Composições diferentes em tema, enquadramento e conteúdo; nenhuma repetição de planeta, bandeira ou pagode. Não são capas de álbuns ou retratos atribuídos a artistas reais.
- As imagens não exibem créditos, logotipos, marcas d'água ou textos promocionais. Nenhum crédito ou procedência de imagem foi adicionado à interface.
- Mapeamento de apresentação derivado dos IDs; inventário não alterado. Os arquivos genéricos rejeitados foram retirados.

[Prancha com as 42 capas e nomes reais](evidence/artwork-contact-sheet.webp)

## Piloto preservado

Catálogo máximo 1320 px; grade 4/3/2; gaps 16/14 px; cartões brancos, mínimo 100 px, raio 12 px e borda #E5E5E5. Nomes completos em Instrument Sans 14 px, ondas vermelhas de 16 px, título em Bodoni Moda e descrição em Source Serif 4.

A ordem de imagem, texto e ondas agora permanece consistente em todos os alfabetos. Apenas o bloco de texto usa sua direção nativa; o árabe e o hebraico não invertem a composição do cartão.

**Globo preservado byte a byte**, incluindo `js/passport-living-earth.js`, textura Blue Marble e prova anterior de rotação completa. Mantidos 130/90 px, rotação de aproximadamente 40 s, órbita discreta, redução de movimento e suspensão fora da área visível. Nenhum código do globo foi refeito.

**401 rádios e 11 seletores preservados**, incluindo 42 World Dial. Nenhum ID, nome, categoria, stream, posição, rota, handler, player, Bus, mutex, interlock ou mecanismo de continuidade alterado. Demais categorias, Home editorial, Notícias, navegação e rodapé preservados.

## Testes executados

`node --test tests/passport_40_inventory.test.cjs tests/passport_kpop_replacement.test.cjs`

**13/13 aprovados, sem skips locais.** Conferidos correspondência integral das 42 artes, unicidade visual e de arquivos, WebP real, 512×512, perfil incorporado, limite de peso, integridade e preservação do inventário/globo/motores. Os testes entram no workflow existente; nenhum workflow ou guarda foi alterado.

Rodada de navegador em **320, 375, 390, 768, 1024 e 1440 px**: nomes, imagens carregadas, 42 caminhos individuais, medidas, direção e ordem visual, cartões sem corte, todas as rádios expostas e ausência de rolagem horizontal aprovados. Todas as 42 composições foram inspecionadas visualmente na prancha.

Áudio real, sem simulação:

- Dynamic 101 no desktop: tempo **2,104 → 4,169 s**, bytes decodificados **4.851 → 38.409**; globo avançou **17,99°** no mesmo intervalo.
- Mobile emulado: **1,010 → 3,132 s**, **13.737 → 47.929 bytes**, globo avançou **18,45°**.
- Play/pause, retomada, volume 0,4 e Home → Notícias → Home: mesmo elemento de áudio conectado e tocando, um único áudio ativo.
- Outra rádio existente também reproduziu áudio real na troca pelo cartão: **31.974 bytes decodificados**, um único sinal.
- Zero exceções de página. Mobile significa emulação Chromium; aparelho físico e Safari/iOS não testados.

A prova anterior de 365,69° em aproximadamente 40,6 s continua em [rotação real](evidence/earth-rotation-real.gif); não foi recriada nesta correção artística.

## Evidências atualizadas

[Desktop](evidence/preview-desktop.png) · [Celular](evidence/preview-mobile.png) · [42 cartões desktop](evidence/world-dial-1440.png) · [42 cartões mobile](evidence/world-dial-390.png) · [Prancha de 42 capas](evidence/artwork-contact-sheet.webp)

[Resultados desktop](evidence/artwork-results-desktop.json) · [Resultados mobile](evidence/artwork-results-mobile.json)

Sem merge, publicação, alteração de main ou infraestrutura.
