# Fase 1½ — sete matérias da Home

Branch: `feat/editorial-home-seven-phase15-20261102`. Base de `main`: `e4152f766784acc0e8a02ee27821d0e6ff2dd428`. Referência: PR #584 mergeada (`a4ec7840e0c898ccdfcf6e5b4dec6db244b06093`). O HEAD da entrega está na PR.

As sete páginas usam a geometria, tipografia e os quatro modelos do compositor aprovado. A composição foi produzida pelo próprio `passport-editorial-recovery.js`, sem alterar o compositor, seus estilos ou o catálogo das 37. O HTML final fica salvo em cada matéria. Texto integral, links e vídeos originais preservados; a única correção textual é a legenda de Dusty Hill, antes identificada como o trio.

Dave também foi recomposto: abertura original preservada; Taylor Momsen, Foo Fighters, Brian Johnson/Angus Young e Angus recebem fotografias distintas associadas à narrativa. Os dois vídeos originais continuam incorporados, sem troca de IDs ou URLs.

## Comparação e capturas

Aberturas nas seis larguras; páginas completas e detalhes de capítulos/vídeos em 1440, 768 e 390 px. Antes: aberturas em desktop, tablet e celular, mais página completa desktop. As capturas `video-layout` isolam a geometria bloqueando a rede externa; a reprodução real foi testada separadamente e está documentada abaixo.

| Matéria / modelo | Antes 1440 | Depois 1440 | Tablet 768 | Celular 390 | Página completa |
|---|---|---|---|---|---|
| 1. The Mission nasceu no corredor de saída do Sisters of Mercy. / C | [antes](captures/01-1440-before-opening.webp) | [depois](captures/01-1440-after-opening.webp) | [tablet](captures/01-768-after-opening.webp) | [mobile](captures/01-390-after-opening.webp) | [completa](captures/01-1440-after-full.webp) |
| 2. Três pessoas na plateia. Trinta anos depois, Sharon den Adel quer mudar tudo outra vez. / A | [antes](captures/02-1440-before-opening.webp) | [depois](captures/02-1440-after-opening.webp) | [tablet](captures/02-768-after-opening.webp) | [mobile](captures/02-390-after-opening.webp) | [completa](captures/02-1440-after-full.webp) |
| 3. FRANK BEARD. THE HEARTBEAT OF ZZ TOP. / C | [antes](captures/03-1440-before-opening.webp) | [depois](captures/03-1440-after-opening.webp) | [tablet](captures/03-768-after-opening.webp) | [mobile](captures/03-390-after-opening.webp) | [completa](captures/03-1440-after-full.webp) |
| 4. ROGER TAYLOR. NÃO VIVE DO PASSADO. / A | [antes](captures/04-1440-before-opening.webp) | [depois](captures/04-1440-after-opening.webp) | [tablet](captures/04-768-after-opening.webp) | [mobile](captures/04-390-after-opening.webp) | [completa](captures/04-1440-after-full.webp) |
| 5. Greta Van Fleet anuncia novo álbum e lança “Saw You Stand” / D | [antes](captures/05-1440-before-opening.webp) | [depois](captures/05-1440-after-opening.webp) | [tablet](captures/05-768-after-opening.webp) | [mobile](captures/05-390-after-opening.webp) | [completa](captures/05-1440-after-full.webp) |
| 6. WHITE METAL. ISSO É MÚSICA CRISTÃ? / B | [antes](captures/06-1440-before-opening.webp) | [depois](captures/06-1440-after-opening.webp) | [tablet](captures/06-768-after-opening.webp) | [mobile](captures/06-390-after-opening.webp) | [completa](captures/06-1440-after-full.webp) |
| 7. Dave Grohl sobe ao palco com AC/DC para tocar “Highway to Hell” — e vira o garoto de 11 anos outra vez / D | [antes](captures/07-1440-before-opening.webp) | [depois](captures/07-1440-after-opening.webp) | [tablet](captures/07-768-after-opening.webp) | [mobile](captures/07-390-after-opening.webp) | [completa](captures/07-1440-after-full.webp) |

## Fotografias

25 arquivos fotográficos novos, além dos arquivos existentes reaproveitados. Nenhuma fotografia se repete dentro da mesma matéria: conferência por conteúdo e inspeção do [contato fotográfico](photographs-contact.webp). Nenhuma imagem externa é necessária para carregar as fotos. Fontes incluem imprensa musical, fotógrafos de apresentações, materiais oficiais de artistas/fabricantes e Wikimedia. Não foram escolhidas versões com marcas d’água ou logotipos sobrepostos de terceiros.

O [manifesto por matéria e capítulo](photo-video-manifest.json) registra imagens mantidas, acrescentadas e substituídas, procedência, crédito e motivo. A capa da Melody Maker e as duas ilustrações narradas no texto de The Mission permanecem identificadas como documentos/ilustrações originais. Os dois anúncios Passport preservados em Roger/White Metal são elementos da matéria original, não fotografias de artistas.

## Validação

- **42/42** verificações de página/largura: sem transbordamento, imagens quebradas ou IDs duplicados; fontes locais aprovadas carregadas; uma navegação e um rodapé oficiais; vídeos em 16:9.
- **7/7** verificações de preservação: texto, IDs, links e atributos originais dos vídeos.
- **14/14** percursos Home → matéria → Home com áudio real, em 1440 e 390 px: mesmo documento e elemento de áudio, tempo avançando, uma reprodução ativa. Dave é visitado primeiro pelo destaque real da Home.
- **6/6** verificações do teste nativo existente: apresentação desktop/mobile, navegação, continuidade, ausência de autoplay e troca explícita Hits → MPB com exclusão mútua.
- **7/7** testes Python existentes (`test_automatic_editorial.py` e `test_lambrini_editorial_pilot.py`).
- `git diff --check`: aprovado.

### Reprodução dos vídeos: pendência explícita

**18 vídeos originais preservados e incorporados; reprodução não confirmada neste ambiente.** O teste abriu os players reais e clicou no centro do iframe. Dez responderam “This video is unavailable”; oito abriram o player e seus títulos, mas não decodificaram quadros de vídeo antes do limite. Não é possível concluir, apenas por este ambiente, se a indisponibilidade será igual na navegação do proprietário. Nenhum vídeo foi substituído.

O [resultado individual dos 18 vídeos](video-results.json) contém URL, resposta do player, estado do elemento de vídeo e quadros decodificados. As capturas `captures/video-*.png` mostram a resposta real. Essa pendência impede declarar a reprodução dos 18 como aprovada.

## Escopo e preservação

Produção: exatamente sete HTML, um CSS exclusivo dessas páginas e a inclusão dos cinco caminhos HTML da raiz na lista de rotas da navegação persistente. Essa inclusão permite a continuidade que foi testada; o código de transporte não mudou. Home, compositor e estilos compartilhados, catálogo anterior e as outras 36 matérias aprovadas permanecem idênticos. Motores, streams, túneis, bus, mutex, interlock, player e controles de áudio não foram modificados. [Prova de preservação e lista dos arquivos](scope-preservation.json).

Sem merge e sem publicação. Entrega para aprovação visual do Mr. Nomad, com a pendência de reprodução do provedor registrada.

## Reprodução das verificações

Os testes usam Playwright (`CODEX_PRIMARY_RUNTIME_NODE_MODULES` ou dependência `playwright`) e Chrome em `EDITORIAL_CHROME`. O teste de layout também usa `sharp`; os utilitários Python usam BeautifulSoup.

```sh
node tests/editorial_home_seven_browser.cjs --capture
node tests/editorial_home_seven_audio.cjs
node tests/editorial_home_seven_video.cjs
node tests/automatic_editorial_browser.cjs
python -m unittest discover -s tests -p test_automatic_editorial.py
python -m unittest discover -s tests -p test_lambrini_editorial_pilot.py
```

Para recompor: `tools/editorial_home_seven_normalize.py`, `tools/editorial_home_seven_build.cjs`, `tools/editorial_home_seven_credits.py` e `tools/editorial_home_seven_manifest.py`, nessa ordem. O inventário preserva o conteúdo original para comparar. Os arquivos de mídia selecionados já estão versionados.

CI do commit 46b8435: Passport CI, Native editorial browser e Materialize official Passport channels aprovados. Ajuste fotográfico final de Dave verificado novamente nas seis larguras, sem falhas.
