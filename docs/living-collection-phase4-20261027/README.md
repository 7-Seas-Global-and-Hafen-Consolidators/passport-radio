# Living Collection™ — Fase 4

Base consolidada: `f96f5868fc57f3ed5ef132666ea7ba012b260c35`, após o merge da #576 pelo proprietário. Branch: `feat/living-collection-phase4-20261027`. Referência editorial: https://www.rollingstone.com/.

## Entrega e inventário

| Ala existente | Entradas preservadas |
|---|---:|
| K-Pop & Música Coreana | 22 rádios |
| Soul, Black Music & Reggae | 48 rádios |
| Brasil: MPB, Samba & Sertanejo | 10 rádios |
| Jazz, Clássica & Ambientes | 11 rádios |
| Ao Vivo, Programas & Especiais | 42 rádios |
| Continuous Signals™ e Projetos Próprios | 6 rádios + 11 acessos a coleções/trilhas |
| **Total desta fase** | **150** |

O catálogo global permanece com **401 rádios e 11 seletores**. Nenhum registro, nome, ID, ordem, categoria, configuração ou mecanismo de reprodução foi alterado. Todas as entradas continuam expostas. As 42 entradas de Ao Vivo continuam acionando rádios; os onze acessos especiais continuam selecionando suas coleções/trilhas pelo mecanismo original.

O mesmo componente Living Collection™ foi ampliado às seis alas: quatro colunas no desktop, três no tablet, duas no celular, miniaturas de 68 × 68 px, nomes completos, ondas vermelhas, cartões brancos e acionamento pelo cartão inteiro. Não há outra grade sobreposta, filtros ocultadores ou segundo player.

## Arte e movimento

- **K-pop:** palco com LED e refletores em movimento suave.
- **Soul:** baixo sunburst, com vibração localizada das quatro cordas.
- **Brasil:** violão, cavaquinho e pandeiro; cordas, pele e platinelas com movimentos independentes.
- **Jazz:** piano de cauda vermelho, com sequência discreta nas teclas.
- **Ao Vivo:** palco montado e vazio, microfone central, instrumentos, amplificadores e fachos de luz móveis.
- **Projetos:** antena parabólica com pulsos discretos de recepção.

Os seis equipamentos são composições originais de aparência fotográfica, preparadas como WebP com transparência. O movimento é implementado em CSS e usa o observador de visibilidade já existente, sem alterar seu código. As estruturas permanecem estáveis; não produzem som. Movimento reduzido é respeitado; fora da tela, a animação pausa. Nenhum GIF foi introduzido.

As **150 capas individuais** combinam fotografias autênticas, imagens originais das novelas, uma cena autêntica de Beavis and Butt-Head e o disco dourado criado para esta coleção. Arquivos locais de 512 × 512, perfil sRGB, todos abaixo de 100 KB. Nenhum arquivo ou imagem se repete entre as entradas desta fase. As seis pranchas foram conferidas visualmente.

A curadoria contempla The Warning com as três integrantes, Accept em foto oficial de 2026, Pink Floyd na reunião de 2005, Queen com os quatro integrantes clássicos, The Cars com os cinco integrantes, Queensrÿche com a formação clássica em registro de 1991, os festivais corretos, Nirvana no MTV Unplugged e registros reais de premiações de 2025/2026. As nove novelas conservam suas identidades originais. Nenhuma pessoa fictícia foi apresentada como artista.

[Manifesto das 150 capas e procedência](artwork-manifest.json). A procedência não aparece nos cartões. [Produção dos equipamentos e conjunto de prompts](equipment-generation.json).

## Verificação executada

- **29/29 testes unitários aprovados**, sem falhas nem skips. Após os últimos recortes e a fotografia da orquestra, a verificação direcionada das 150 imagens passou novamente.
- **42 verificações responsivas:** seis alas em 1920, 1440, 1024, 768, 430, 390 e 360 px. Quantidade, nomes, associação, dimensões, carregamento, legibilidade, bordas e ausência de colisão/rolagem horizontal aprovados nos contextos testados.
- **Reprodução real decodificada em desktop e emulação móvel com toque:** K-Pop Select™, Rihanna™, Samba de Raiz™, Lounge Select™, Music Awards 2026™ e Metal. As doze tentativas confirmaram reprodução, sem necessidade de alternativas.
- Play/pause, volume 0,4, troca entre rádios e **Home → Notícias → Home** confirmados com **um único áudio ativo**, o mesmo elemento conectado e tempo avançando.
- Os onze seletores de coleções/trilhas foram acionados nos dois contextos; família, índice e estado selecionado permaneceram os originais.
- As seis animações foram verificadas nos dois contextos. Imagens-base estáveis, partes animadas mudando, áudio avançando durante a captura, pausa fora da área visível e redução de movimento. Os três quadros reais de cada equipamento têm diferenças visuais efetivas.
- World Dial™, globo, Dance, esfera, Rock e Pop anteriores preservados. O teste de comparação confirma que suas imagens e documentação não foram alteradas. Os motores, dados de rádio, Home editorial, Notícias, vídeos, navegação e rodapé permanecem idênticos à base.

Chromium real foi utilizado. Celular/tablet foram emulados por viewport e toque; não foi usado aparelho físico. O áudio não foi simulado. A validação de reprodução foi por amostras, não uma auditoria de todas as 401 transmissões. Fontes institucionais existentes no próprio repositório foram carregadas localmente no ambiente de captura; isso não altera o produto. Publicidade/telemetria ficaram bloqueadas apenas no navegador isolado de teste.

[Log unitário](evidence/unit-tests.txt) · [Imagens finais](evidence/artwork-validation.txt) · [Desktop — resumo da execução concluída](evidence/results-desktop.json) · [Móvel — relatório completo](evidence/results-mobile.json) · [Verificação consolidada](evidence/verification.json).

## Capturas reais e pranchas

| Ala | Desktop | Tablet | Mobile | Prancha | Movimento real |
|---|---|---|---|---|---|
| K-pop | [1440](evidence/kpop-1440.webp) | [768](evidence/kpop-768.webp) | [390](evidence/kpop-390.webp) | [22 capas](evidence/contact-sheet-11.webp) | [Quadros](evidence/kpop-motion-sequence.webp) |
| Soul | [1440](evidence/soul-1440.webp) | [768](evidence/soul-768.webp) | [390](evidence/soul-390.webp) | [48 capas](evidence/contact-sheet-4.webp) | [Quadros](evidence/soul-motion-sequence.webp) |
| Brasil | [1440](evidence/brasil-1440.webp) | [768](evidence/brasil-768.webp) | [390](evidence/brasil-390.webp) | [10 capas](evidence/contact-sheet-5.webp) | [Quadros](evidence/brasil-motion-sequence.webp) |
| Jazz | [1440](evidence/jazz-1440.webp) | [768](evidence/jazz-768.webp) | [390](evidence/jazz-390.webp) | [11 capas](evidence/contact-sheet-6.webp) | [Quadros](evidence/jazz-motion-sequence.webp) |
| Ao Vivo | [1440](evidence/live-1440.webp) | [768](evidence/live-768.webp) | [390](evidence/live-390.webp) | [42 capas](evidence/contact-sheet-7.webp) | [Quadros](evidence/live-motion-sequence.webp) |
| Projetos | [1440](evidence/signals-1440.webp) | [768](evidence/signals-768.webp) | [390](evidence/signals-390.webp) | [17 capas](evidence/contact-sheet-9.webp) | [Quadros](evidence/signals-motion-sequence.webp) |

[Seis cabeçalhos desktop](evidence/headers-desktop.webp) · [Seis cabeçalhos mobile](evidence/headers-mobile.webp). Há também capturas individuais de cada cabeçalho nas três larguras. São recortes dos pixels de capturas completas da página real, sem reconstrução da interface. As sequências de movimento contêm quadros capturados no navegador, sem interpolação ou GIF.

## Arquivos e preservação

Produção: `js/passport-radio-grid.js`, `css/passport-radio-grid.css` e 156 novos WebPs locais: 150 capas e seis equipamentos. `js/passport-living-performance.js` é reutilizado sem alteração. Os demais arquivos são testes, manifestos e evidências desta fase. Os testes históricos receberam somente a expectativa da extensão autorizada da apresentação; nenhum workflow ou guard foi desativado.

Reprodução dos testes: `node --test tests/passport_40_inventory.test.cjs tests/passport_kpop_replacement.test.cjs`. Navegador: `node tests/passport_40_living_phase4_browser.cjs` e o mesmo comando com `--mobile`, com Playwright/Chromium fora da aplicação. `--capture-only` exporta imagens separadamente e não substitui os resultados dos testes executados.

**Sem merge, sem publicação, sem alteração direta da main ou infraestrutura.** A PR é entregue para revisão do Mr. Nomad.
