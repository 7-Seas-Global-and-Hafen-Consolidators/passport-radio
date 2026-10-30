# OPERAÇÃO RECUPERAÇÃO EDITORIAL INTEGRAL — 197/197

**Ordem do proprietário Mr. Nomad, 30/10/2026.** Esta especificação é o mapa da obra. A PR documental guarda a ordem para execução na mesma branch/PR, sem mudanças de produção até o trabalho começar.

## Referências históricas verificadas

- **Paula Toller aprovada:** PR [#579](https://github.com/7-Seas-Global-and-Hafen-Consolidators/passport-radio/pull/579), HEAD `4717abd1fa0dccd7e0dcf863cfc046ebd5b1ddb2`.
- **Lambrini Girls aprovada:** PR [#582](https://github.com/7-Seas-Global-and-Hafen-Consolidators/passport-radio/pull/582), HEAD `af8214d81368125e001261d66a351b9e2f142edf`.
- **Estado completo aprovado antes da PR #583:** `4139873dc89454c17116534691651f125fdf6e90`, merge commit da #582.
- **Expansão que desorganizou as páginas:** PR [#583](https://github.com/7-Seas-Global-and-Hafen-Consolidators/passport-radio/pull/583), merge `985ada373c3576c1ea5d0607cc8ccc1287db3148`.
- O conjunto da #583 tem **197 páginas: 166 em editorial/ e 31 na raiz/historias, incluindo espelhos**. Recuperar **197/197**, inclusive as duas referências degradadas. Os exemplos do proprietário não reduzem o escopo.

## MAPA VISUAL — implementação obrigatória

A imagem aprovada no chat é a especificação estética mestra. Esta versão em [SVG navegável](./layout-mapa-obra.svg) materializa sua arquitetura em 12 zonas numeradas (não substitui a arte original enviada pelo proprietário).

1. **Cabeçalho:** masthead PassportRadio original do site; navegação e redes oficiais, sem alterações.
2. **Editoria:** identificação acima da manchete, com acento vermelho #C41E3A.
3. **Título + subtítulo:** H1 em Bodoni Moda, linha fina logo abaixo, hierarquia e largura de revista.
4. **Informações:** autoria, data e informações editoriais existentes, em Instrument Sans.
5. **Foto principal:** imagem horizontal grande, imediatamente abaixo do título/metadata; assunto principal correto, proporção natural e resolução boa.
6. **Abertura de texto:** parágrafos íntegros em Source Serif 4, uma coluna central confortável (até 760px), capitular vermelha no início se prevista pela referência.
7. **Capítulos em cartões pareados:** um conjunto de 2 cartões lado a lado no desktop, cada um com **filete vermelho no topo, foto DO ASSUNTO, título DO ASSUNTO e narrativa inteira DO CAPÍTULO**; equilíbrio de largura, espaço e alinhamento. No mobile, empilhados e com largura total. Cartões servem aos minicapítulos/segmentos curtos, sem comprimir narrativas longas.
8. **Seção de leitura:** retoma coluna confortável, título em Bodoni Moda e texto corrido. Pode conter **uma imagem grande ao lado ou acima**, correspondente ao trecho. Serve aos capítulos narrativos extensos.
9. **Vídeo destacado:** unidade multimídia com título, chamada contextual, vídeo 16:9 em tamanho digno e texto relacionado; vinculado ao artista e capítulo corretos.
10. **Novo conjunto de cartões:** após um bloco de leitura ou vídeo, novo conjunto com 2 cartões (ou 3 na sequência quando o material original pedir 3), fotos corretas e títulos independentes. **A cadência mostrada no mockup é: abertura → leitura → par de cartões → leitura com imagem → vídeo → conjunto de cartões → conclusão.** Repetir esse ciclo nas reportagens extensas, mantendo fluxo narrativo e ordem original, sem se transformar numa tripa contínua de duas colunas.
11. **Fechamento:** texto de conclusão na coluna de leitura, assinatura/acervo existente, chamadas oficiais.
12. **Rodapé:** o rodapé oficial Passport Radio com links, redes, pagamentos e direitos autorais, preservado.

**Composição visual:** Fundo #FFFFFF, texto #111111, acentos #C41E3A, divisórias finas. Bodoni Moda nos títulos e intertítulos; Source Serif 4 no corpo, Instrument Sans nas etiquetas, datas, navegação e controles. Leitura até 760px; imagens maiores sem deformações; respiro lateral. A proporção 16:9 é dos vídeos. Desktop (1440/1024): capítulos pareados em duas colunas; tablet (768): reorganização fluida sem esmagamento; celular (390/360/320): única coluna, fotos grandes e vídeos responsivos.

### Mapeamento artístico / posição exata

Em cada reportagem, ler o conteúdo original e construir um **mapa capítulo → artista/banda/álbum/evento → foto correta → vídeo correto** antes da inserção de qualquer imagem. A primeira imagem é do tema da manchete; imagens secundárias abrem ou acompanham os capítulos que retratam; capas ficam no bloco dos discos; fotos de shows ficam no bloco da apresentação; vídeos ficam nas seções de seus artistas. Conferir o rosto/nome/formação em cada arquivo, legenda e descrição; eliminar identidades cruzadas e repetições que causaram os erros mostrados pelo proprietário (Lemmy x Alice Cooper, Tim Maia x Ney Matogrosso, Men at Work x outros, etc.). **Preservar a narrativa integral, incluindo falas, capítulos, ordem e extensão.** A diagramação serve ao texto, sem mutilá-lo.

## Pesquisa fotográfica — liberdade geográfica e de fontes

**Buscar até encontrar material bom, não se limitar à Wikimedia.** Pesquisa individual em sites e press kits oficiais de artistas e bandas, gravadoras, promotoras, festivais e casas de shows; imprensa musical mundial (Rolling Stone, Billboard, NME, Kerrang!, Metal Hammer, Louder, Rock Sound, Consequence, Roadie Crew, Blabbermouth e acervos nacionais/regionais); arquivos históricos, museus, bibliotecas, fotógrafos de concerto e portfólios; agências de fotos (Getty, Reuters, AP, Alamy, bancos editoriais); Instagram, Facebook, Flickr, Bandcamp, plataformas sociais oficiais e registros de festivais; Google Images, Bing Images, Yandex Images, buscadores regionais e pesquisas em idiomas locais. Pesquisar **nome completo + espetáculo + ano + cidade + banda + álbum** para conferir o evento retratado. Abrir a fonte da imagem, obter a melhor resolução disponível e registrar o URL de origem, fotógrafo e associação com a matéria/capítulo em manifesto.

**As únicas restrições visuais impostas pelo proprietário à seleção são: nenhuma marca d'água e nenhum logotipo de terceiros sobreposto.** Material deve ser de boa qualidade e identificar corretamente o assunto. Manter a procedência registrada e usar arquivos com permissão de publicação editorial.

## Substituições de vídeo — arquivo e ID exatos

1. **Festa Ploc / INXS** — `editorial/2026/09/03/festa-ploc-musicas-anos-80-nostalgia-shows-ao-vivo.html`. No capítulo do INXS, substituir o vídeo existente por **INXS - Need You Tonight (Live In Japan 1994)**: https://www.youtube.com/watch?v=EdGZDcOdw1s
2. **Shakira e Dua Lipa** — `editorial/2026/10/07/shakira-dua-lipa-antologia-recorde-amazon-music.html`. Substituir o vídeo indicado pelo proprietário por https://youtu.be/4MMUV8T52h0?si=Dg8iXDRzHGteX915
3. **Taylor Swift** — `editorial/2026/10/06/taylor-swift-patient-zero-brasil.html`. Substituir o vídeo indicado pelo proprietário por https://www.youtube.com/watch?v=xmQ5SfrID94

Os demais 358 embeds/links de vídeo existentes permanecem como no texto original, com seus atributos e ordem originais, salvo correções autorizadas expressamente.

## Execução e validação

1. Criar o inventário das 197 páginas diretamente da PR #583; mapear o impacto e remover/corrigir a lógica do rollout que associou automaticamente imagens e capítulos de modo errado. Preservar o funcionamento dos geradores de matéria futura respeitando o mesmo padrão visual.
2. Recuperar a **Paula Toller #579** e a **Lambrini #582** diretamente dos commits aprovados (base `4139873`), usando **código e estilos históricos**, não capturas das páginas atualmente alteradas. Conferir antes/depois visualmente.
3. Aplicar a composição de 12 zonas a **197/197** com conferência capítulo a capítulo e imagens identificadas. Tratar conteúdo longo como leitura longa bem organizada e imagem de tamanho editorial, sem pares de colunas de texto intermináveis.
4. Substituir os três vídeos nas páginas exatas listadas. Salvar progresso em commits na **mesma PR** para que nenhum lote concluído se perca.
5. Verificar no navegador **cada uma das 197 páginas completas** em 1440, 1024, 768, 390, 360 e 320px. Inspecionar pessoalmente o tema das fotos, sua posição junto ao conteúdo, clareza e legibilidade, ausência de duplicatas erradas e reprodução dos vídeos substituídos. Testar continuidade de áudio real em desktop e mobile emulado e a preservação do sistema existente.
6. Publicar na PR evidências antes/depois e capturas reais do topo, miolo, multimídia e fechamento, inventário 197/197, manifesto das imagens com procedência, vídeos trocados e verificações. **Não fazer merge nem publicar.**

**É UMA OPERAÇÃO TOTAL, não um reparo restrito às páginas citadas nos exemplos. Toda a correção será feita nesta mesma PR.**
