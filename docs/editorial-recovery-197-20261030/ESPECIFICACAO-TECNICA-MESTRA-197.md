# ESPECIFICAÇÃO TÉCNICA MESTRA — RECUPERAÇÃO EDITORIAL 197/197
**PR de execução:** [#584](https://github.com/7-Seas-Global-and-Hafen-Consolidators/passport-radio/pull/584) · **Proprietário:** Mr. Nomad · **Escopo:** recuperar as 197 páginas afetadas pela [#583](https://github.com/7-Seas-Global-and-Hafen-Consolidators/passport-radio/pull/583).

> **Este documento é a tradução técnica vinculante das quatro imagens coloridas aprovadas pelo proprietário.** A vaca deve reconstruir a aparência de revista dos anexos, identificar o tipo de matéria e utilizar o respectivo miolo. Títulos, fotos, capas, depoimentos, quantidades, nomes, datas, episódios e referências fictícias existentes nos desenhos são material ilustrativo, não conteúdo para inserir nas matérias reais. **O conteúdo verdadeiro vem do HTML original de cada matéria e das fontes verificadas.**

## 0. AS QUATRO IMAGENS APROVADAS, JÁ ANEXADAS À CONVERSA DA PR

1. **Paula Toller — desenho mestre da identidade e componentes:** [abrir imagem 1024×1536](https://github.com/user-attachments/assets/271835e8-ea12-427d-b79d-fdccb465f207).
2. **Festa Ploc — página longa de coletânea, artigo por artista:** [abrir imagem 1024×1536](https://github.com/user-attachments/assets/69f1017b-1f88-41ce-9947-a2c40e89e7fe).
3. **Painel dos quatro modelos editoriais:** [abrir imagem 1536×1024](https://github.com/user-attachments/assets/b271404b-9a24-42f0-ad86-bfb8b0f07be6).
4. **BLACKPINK — matéria temática/pop com sumário, blocos de fatos e mídia:** [abrir imagem 1024×1536](https://github.com/user-attachments/assets/31ff5010-04b6-47c9-927e-36f552885823).

As quatro imagens estão nos comentários da #584. [Descrição do mapa de 12 zonas](./ORDEM-COMPLETA.md) e [modelos internos Festa Ploc](./MODELOS-INTERNOS-E-FESTA-PLOC.md) também integram a especificação.

## 1. CHECKPOINTS HISTÓRICOS EXATOS

- Paula Toller, [PR #579](https://github.com/7-Seas-Global-and-Hafen-Consolidators/passport-radio/pull/579): HEAD `4717abd1fa0dccd7e0dcf863cfc046ebd5b1ddb2`.
- Lambrini Girls, [PR #582](https://github.com/7-Seas-Global-and-Hafen-Consolidators/passport-radio/pull/582): HEAD `af8214d81368125e001261d66a351b9e2f142edf`.
- Base conjunta imediatamente antes da #583: `4139873dc89454c17116534691651f125fdf6e90`.
- #583: HEAD `fa99103188ae8551a82afbf62840954a9967e7b5`; merge `985ada373c3576c1ea5d0607cc8ccc1287db3148`.

**Execução:** inspecionar no checkout atual o HTML, CSS e renderização dos exemplos, comparar com o histórico acima, recuperar os componentes aprovados sem restaurar cegamente o repositório inteiro. A base de trabalho é a branch da #584, que já parte de `main`; os commits históricos são fonte precisa de HTML/CSS. A primeira implementação deve remover ou neutralizar **somente a transformação editorial problemática da #583** e restaurar as duas matérias canônicas. Manter todas as correções legítimas posteriores na `main` que não conflitem com a operação.

## 2. SISTEMA VISUAL OBRIGATÓRIO: MEDIDAS, CORES, FONTES

### Identidade

| Token | Valor / execução |
|---|---|
| Fundo | `#FFFFFF` |
| Texto forte | `#111111` |
| Vermelho institucional | `#C41E3A` |
| Texto de apoio | `#444444` |
| Metadados | `#666666` |
| Bordas e divisórias | `#E5E5E5` |
| Manchetes, H2, destaques | Bodoni Moda, peso 700 |
| Corpo, subtítulo narrativo | Source Serif 4, peso 400, negrito nativo 700 |
| Editoria, byline, labels, sumário, UI | Instrument Sans, peso 600 para cabeçalhos |
| Tipos locais existentes | Fontes da implementação aprovada com aliases `Passport Editorial Display`, `Passport Editorial Text`, `Passport Editorial Sans` presentes em `css/passport-editorial-pilot.css` histórico |

A serigrafia visual é **impressão editorial limpa**, fundo branco amplo, letras pretas, filetes e capitulares vermelhos, bordas cinzas quase invisíveis. Preservar o **masthead oficial realmente existente**, com suas cores e sombra já aprovadas; os desenhos de capa são guias de composição, não autorização para redesenhar o logo.

### Geometria verificada no CSS aprovado da PR #582

| CSS / elemento | Valor histórico |
|---|---|
| `.participe-content` | `max-width:1240px; padding:24px 24px 56px` |
| `.article` | `max-width:1200px; margin-inline:auto` |
| `.hero-copy` | `max-width:1080px` |
| H1 desktop | `56px/1.12`, peso 700, `letter-spacing:-.018em` |
| Dek desktop | `22px/1.55`, máximo `78ch` |
| Metadados desktop | `13px/1.5` |
| Hero histórica Lambrini | `max-width:1000px; width:100%; height:auto; object-fit:contain`, proporção original 1000:606 |
| Coluna leitura | `max-width:760px` |
| Parágrafo desktop | `20px/1.7; margin-bottom:18px` |
| H2 desktop | `32px/1.18` |
| H3 desktop | `24px/1.2` |
| Capitular | Bodoni 700, 68px, vermelho `#C41E3A` |
| Pullquote | Bodoni 700, 26px/1.25, filete à esquerda 3px vermelho |
| Grade pareada histórica | `display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:24px; margin:32px 0` |
| Cartão histórico | `padding:26px; border:1px solid #E5E5E5; border-top:3px solid #C41E3A; border-radius:4px` |
| Título no cartão | `27px/1.18` |
| Vídeo | `aspect-ratio:16/9; width:100%`; iframe preenchendo o contêiner |
| Painel multimídia | `padding:28px; border:1px solid #E5E5E5; border-top:3px solid #C41E3A` |
| Composição de texto/vídeo histórica | `grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr); gap:28px` |
| Fechamento | coluna 760px; linha superior preta 2px |

**Esses valores são referência histórica comprovada, não medidas a serem extrapoladas para peças que não existiam no CSS.** Para os componentes adicionais dos desenhos (sumários, listas numeradas, métricas, galerias) a escala detalhada abaixo é a especificação de implementação determinada nesta PR.

### Componentes novos dos desenhos — valores-alvo de implementação

- **Grid de reportagem:** largura útil até 1120px dentro de contêiner 1200px, com 24px de gap e de 18 a 24px de padding lateral em desktop; texto longo vai para corredor de até 760px e não ocupa uma coluna estreita de cartão.
- **Hero:** largura visual próxima de 1000px, alinhada ao eixo editorial; altura automática, `object-fit:contain` na fotografia principal, sem distorção e sem corte de pessoas.
- **Imagem de seção:** usar `width:100%;height:auto;display:block`, foto grande em painel com proporção de origem; grade imagem 44% + texto 56% com gap 24px em desktop; quando o texto exceder a altura da fotografia, continuá-lo na coluna de leitura completa abaixo da imagem em vez de alongar lateral estreita.
- **Capítulo individual de lista:** faixa de 100% da largura útil, filete 2px `#C41E3A` no topo, coluna de fotografia com base `minmax(0,44fr)` e coluna de texto `minmax(0,56fr)` (ou `44% 56%` ajustados pelo gap). Badge de numeração vermelha 44×44px; título de capítulo 26–30px/1.2 em Bodoni. Texto 19–20px/1.65 em Source Serif. O iframe, quando existente, fica **logo sob o contexto do artista**, em largura adequada 16:9.
- **Sumário navegável:** um bloco após a abertura em faixa editorial até 1120px, borda superior 2px vermelha; labels Instrument Sans 13–14px; âncoras `href="#..." ` para IDs permanentes dos capítulos reais; desktop duas ou três colunas de **itens curtos**; mobile uma coluna ou área recolhível acessível, com targets 44px.
- **Bloco de dados:** faixa em até três células com números grandes Bodoni 30–36px, legenda Instrument Sans 13–14px, separações sutis; mobile uma coluna. Cada dado somente se comprovado no texto/fonte real.
- **Galeria:** imagens com `object-fit:cover` em miniaturas relacionadas, proporção coerente, captions, link para ver íntegra; grade 3/2/1 desktop/tablet/mobile, sem distorção, usando apenas fotos existentes ou efetivamente pesquisadas. Carrossel somente com navegação real e acessível.
- **Cartões de notícias relacionadas:** 2 ou 3 por linha com foto real e título fiel de notícia existente, links corretos; localizados na seção de notícias relacionadas e nunca misturados no corpo histórico.
- **Citação:** filete vermelho 3px, Bodoni 24–26px, sem inventar falas; atribuição Source Serif/Instrument Sans conforme original.
- **Capítulos de leitura longa:** H2 32px e texto 20px/1.7 em coluna central 760px. Trechos podem integrar imagem grande entre parágrafos; preservar a continuidade sem limitar quantidade de palavras.
- **Filetes:** 2–3px vermelho no começo de capítulo; divisórias internas 1px `#E5E5E5`. Bordas externas 1px cinza e raio de 4px apenas nos cartões da referência.

### Responsividade explícita

| Largura | Layout |
|---|---|
| `>=1200px` (1440 testado) | H1 56px, corpo 20px, pares de cartões 2 colunas, capítulo imagem+texto 44/56, painéis 3 colunas apenas em métricas/miniaturas |
| `801–1199px` (1024 testado) | H1 42px (regra histórica aplicada em 768–1199), corpo 19px, H2 29px; pares 2 colunas com padding 24px; imagem+texto reequilibrados |
| `768–800px` (768 testado) | H1 42px, corpo 19px; **grade dos cartões passa a uma coluna** como na PR #582; blocos de imagem+texto empilhados para não esmagar |
| `481–767px` | H1 34px, corpo 18px/1.7, H2 26px; contêiner padding 18px; cartões uma coluna; galerias 1–2 colunas conforme espaço; vídeos largura total |
| `375–480px` (390 testado) | H1 34px, corpo 18px/1.7, padding 18px; cartões padding 18px; fotos em coluna única, cada vídeo responsivo 16:9 |
| `<=374px` (360 e 320 testados) | H1 32px, corpo 17.5px, padding 16px; uma coluna em tudo; tags e números sem sobreposição |

O CSS histórico usa `@media(max-width:800px)` para cartões empilhados, `@media(max-width:767px)` para tipografia móvel, `@media(max-width:480px)` para cartão compacto e `@media(max-width:374px)` para telas mínimas. Preservar esses limiares de referência. **Nunca determinar redução drástica da fonte para resolver overflow.** Usar `min-width:0`, dimensões fluidas, break-word em URLs e `max-width:100%` em mídia.

## 3. QUATRO ARQUITETURAS INTERNAS: COMO CADA REPORTAGEM APARECE

### A. BIOGRAFIA / PERFIL — Paula Toller, Lambrini e perfis de artistas

**Desenho nº 1 do painel + página-mestra colorida:**
1. Hero do artista → H1/dek/byline → fotografia grande.
2. Lead em corredor central de 760px com capitular vermelha.
3. Fase histórica inicial → conjunto de dois capítulos curtos com foto, subtítulo e texto em cartão de largura igual.
4. Retomada de narrativa em seção extensa (760px), com imagem grande da fase à esquerda e texto contextual à direita.
5. Vídeo de apresentação ao vivo em bloco de destaque 16:9, título e texto contextual.
6. Obras, parcerias, influências: capítulos intercalados, 2 a 3 miniaturas apenas para assuntos curtos, com imagens correspondentes.
7. Conclusão original completa e assinatura, rodapé.

**Preservar todos os capítulos reais e vídeos existentes da Paula e Lambrini recuperadas dos commits históricos.** A composição alterna seções de leitura e cartões: nenhuma seção longa fica presa num card de metade da página. O modelo não cria frases nem capítulos fictícios.

### B. LISTA / RANKING / COLETÂNEA — Festa Ploc, Anos 80 e artigos com muitos músicos

**Desenho nº 2 + infográfico específico Festa Ploc:**
1. Hero coletivo do evento/tema e introdução integral.
2. Sumário navegável dos artistas/capítulos da **lista real e na mesma ordem editorial** (numeração de ranking somente se original tiver ranking; em coletânea, ordinal de navegação sem atribuir posição competitiva).
3. Contexto histórico da coletânea com foto grande + texto em uma faixa de leitura.
4. Um **módulo horizontal individual por artista**:
   - filete vermelho superior de 2px;
   - número de sequência visual à esquerda, 44×44 vermelho;
   - foto autêntica do artista na coluna de 44%;
   - nome, faixa/show/ano e narrativa completa na coluna à direita;
   - vídeo 16:9 **dentro do mesmo módulo temático**, com nome e fonte/episódio;
   - se a narrativa ocupar várias linhas, texto continua abaixo em coluna confortável, sem compactar a fonte.
5. Após grupos de artistas, seção existente de contexto da Festa Ploc, festival/TV/memória/cultura, com foto temática ampla.
6. Retomar o mesmo módulo por artista até o último capítulo real; grade de miniaturas temáticas em seção adicional de contexto, não substitui capítulos completos.
7. Fechamento com legado, créditos e rodapé.

**INXS**: `editorial/2026/09/03/festa-ploc-musicas-anos-80-nostalgia-shows-ao-vivo.html`, trocar o vídeo do capítulo INXS por `https://www.youtube.com/watch?v=EdGZDcOdw1s` — **Need You Tonight (Live in Japan 1994)**.

**Altura:** reportagem pode ser comprida por ter muito conteúdo, mas deve ser uma sequência ritmada de módulos de largura editorial, não duas colunas finíssimas de texto por dezenas de telas. **Não inventar 30 artistas porque o desenho usa “30+”; usar exatamente os capítulos reais.**

### C. REPORTAGEM LONGA / DOSSIÊ — Racionais MC’s, especiais históricos, controvérsias aprofundadas

**Desenho nº 3 do painel:**
1. Hero com personagem/grupo central correto, H1, dek e lead forte.
2. Capítulo de origem/contexto longo com uma imagem documental horizontal e prosa em corredor 760px.
3. Seção de discos/obras/marcos em conjuntos de miniaturas de **capas corretas**, com título e período existentes. As capas acompanham o disco; fotografia de banda acompanha a banda; fotografias de outra pessoa permanecem no seu assunto.
4. Capítulos densos continuam em coluna de leitura, separados por filetes e títulos Bodoni. Intercalar imagens grandes entre trechos na ordem histórica.
5. Show/vídeo no próprio capítulo da apresentação, painel 16:9 com apresentação e detalhes.
6. Influência e legado com imagem contextual grande, citações reais e conclusão em coluna íntegra.
7. Créditos e rodapé.

A matéria do **Racionais 1000 Trutas, 1000 Tretas** recebe capítulos originais com fotos de integrantes, capas e apresentações identificados; as seções historiográficas podem ter centenas de palavras sem virar cartões estreitos. O desenho Racionais é referência gráfica, não texto/legenda factual.

### D. NOTÍCIA / REPORTAGEM CURTA — Taylor Swift Patient Zero, fatos pontuais

**Desenho nº 4:**
1. H1 e subtítulo, hero correto, autoria/data.
2. Lead em corredor central com corpo em Source Serif.
3. Seções de contexto do fato, imagem grande com texto complementar.
4. Vídeo da artista no bloco próprio, 16:9, com título e identificação.
5. Efeito/repercussão e conclusão curta derivada do texto real.
6. Assinatura e rodapé.

**Taylor Swift**: `editorial/2026/10/06/taylor-swift-patient-zero-brasil.html`: substituir o vídeo indicado por `https://www.youtube.com/watch?v=xmQ5SfrID94`. Respeitar extensão original; notícia curta não ganha capítulos inventados para imitar um dossiê.

### E. REPORTAGEM TEMÁTICA POP — BLACKPINK como composição do modelo de notícia/dossiê

**Imagem BLACKPINK anexa:** abertura coletiva do quarteto → lead → sumário dos capítulos **reais** → origem do grupo → faixa/clip e sua apresentação → bloco de dados verificados (1,9 bilhão só conforme o artigo real) → vídeo preservado na seção → impacto e reações documentadas → galeria com imagens das integrantes identificadas → notícias relacionadas existentes → conclusão e rodapé. **Foto coletiva na abertura; fotos individuais de Jennie, Jisoo, Rosé e Lisa apenas onde o conteúdo trata delas; imagens dos shows no capítulo certo.** A imagem ilustrativa não autoriza alterar o título, data, vídeos, artistas, fatos, métricas ou criar notícias novas.

## 4. PESQUISA FOTOGRÁFICA: ONDE, COMO E O QUE ENTRA

**Autonomia mundial para localizar fotos autênticas de qualidade, sem limitar a Wikimedia.** Pesquisar individualmente todas as associações artista/banda/ano/show/álbum/cena de cada uma das 197 matérias.

**Fontes de busca abrangentes:**
- **Oficiais:** sites do artista/banda, gravadoras, selos, agências de imprensa, EPK/press kits, festivais, teatros, casas de show, promotoras, produtoras, veículos de TV e arquivos oficiais.
- **Imprensa e crítica musical:** Rolling Stone, Rolling Stone Brasil, Billboard, NME, Kerrang!, Metal Hammer, Louder, Rock Sound, Consequence, Roadie Crew, Blabbermouth, jornais locais e internacionais, revistas especializadas em música regional, rap, pop, metal, punk, rock, sertanejo e K-pop.
- **Fotógrafos e arquivos:** portfólios de concertos, acervos de fotógrafos, museus, arquivos municipais, universidades, galerias, arquivos de festivais e emissoras; Getty Images, Reuters Pictures, AP Images, Alamy, Shutterstock Editorial, arquivos de imprensa.
- **Redes e galerias:** Instagram, Facebook, Flickr, Bandcamp, sites oficiais de fanclub com fontes primárias, portais de gravadoras, galerias de festivais e coleções históricas documentadas.
- **Mecanismos de busca:** Google Images, Bing Images, Yandex Images e buscadores regionais; pesquisar nas línguas dos artistas e dos eventos (português, inglês, espanhol, francês, alemão, japonês, coreano, turco etc.).

**Sequência de pesquisa operacional:**
1. Para cada capítulo, extrair `{artista, formação, evento, álbum, ano, local, propósito, posição_no_artigo}`.
2. Montar buscas com `nome exato + show/album + ano + cidade + live photo/press image`; abrir os resultados e obter imagem com procedência verificável, resolução adequada e autorização de uso editorial.
3. Conferir rosto, integrantes, época, cenário, instrumento, legenda, créditos e correspondência do conteúdo, comparando com a fonte original. **Imagens sem marca d'água e sem logotipo de outros sobreposto**, como Mr. Nomad determinou.
4. Registrar manifesto `artigo | seção | artista/evento | imagem local | URL de origem | autor/crédito | notas de identificação`.
5. Salvar arquivo de foto otimizado localmente, sem base64, preservando proporção, alt text verdadeiro e créditos. Evitar reutilização indevida de uma foto de outro capítulo.
6. Inserir a foto **naquele mesmo capítulo**, como hero, imagem de seção, capa de disco, foto de show ou galeria, segundo os quatro modelos acima.
7. Conferir renderizada no navegador, não apenas no nome do arquivo. Se for um disco, mostrar a capa correta; se forem dois artistas, identificar cada um; foto de Alice Cooper não vira Lemmy, foto de Tim Maia não vira Ney Matogrosso.

### Posicionamento imutável por conteúdo

- **Hero:** tema central da manchete, horizontal amplo.
- **Capítulo individual:** foto grande daquele artista alinhada ao seu texto e vídeo.
- **Fase histórica:** registro daquela época, com legenda ou identificação contextual.
- **Álbum:** capa daquele álbum sob seu título e descrição.
- **Show:** foto daquele show e embed daquele show.
- **Galeria:** imagens pertinentes e legendadas do mesmo tema, com resolução e proporções coerentes.
- **Notícias relacionadas:** cartão de notícia REAL com link da matéria correspondente, fora do fluxo narrativo.

## 5. VÍDEOS EXATOS A SUBSTITUIR, COM AS PÁGINAS

1. **Festa Ploc, INXS:** `editorial/2026/09/03/festa-ploc-musicas-anos-80-nostalgia-shows-ao-vivo.html` → `https://www.youtube.com/watch?v=EdGZDcOdw1s`.
2. **Shakira e Dua Lipa:** `editorial/2026/10/07/shakira-dua-lipa-antologia-recorde-amazon-music.html` → `https://youtu.be/4MMUV8T52h0?si=Dg8iXDRzHGteX915`.
3. **Taylor Swift:** `editorial/2026/10/06/taylor-swift-patient-zero-brasil.html` → `https://www.youtube.com/watch?v=xmQ5SfrID94`.

Preservar ordem, integridade e funcionalidade dos demais vídeos existentes; vídeos incorporados correspondem ao capítulo do artista e são apresentados como `iframe` 16:9. Retirar referência ao vídeo antigo somente nos três alvos estabelecidos.

## 6. IMPLEMENTAÇÃO NO REPOSITÓRIO: QUEM É DONO DA COMPOSIÇÃO

1. Auditar **o mecanismo de transformação editorial introduzido pela #583** e identificar como aplica wrappers, seletores, agrupamento de seções, figura/legenda, classes e CSS nas 197 páginas. Corrigir esse ponto de origem antes da renderização final, de modo que o trabalho não seja reembalado novamente como dupla coluna interminável. Preservar DOM semântico, hierarquia H1/H2/H3 e ordenação.
2. Recuperar o HTML/CSS histórico #579/#582 para as duas referências e garantir que a própria transformação global posterior não altere sua renderização. Tratar o CSS histórico `css/passport-editorial-pilot.css` como referência para tokens e classes, sem generalizar seletores exclusivos para conteúdo de tipologia diferente.
3. Atribuir para cada uma das **197 URLs** a tipologia baseada na sua estrutura real (A, B, C ou D; BLACKPINK usa componentes temáticos dentro dessa família); armazenar essa decisão no inventário de execução, com capítulo e mídia associados.
4. Implementar **componentes por tipologia** com seletores e escopos delimitados, montagem visual e estilos em arquivo editorial compartilhado, sem modificar navegação, rodapé ou motores de rádio. A ordem do conteúdo no DOM deve ser igual à ordem de leitura mesmo quando CSS monta colunas.
5. Mapeamento `capítulo→foto→vídeo` explícito; usar identificadores estáveis, preservando texto integral e URLs e atributos de mídia que não estão nas três substituições.
6. Consolidar um único diff de recuperação das 197, com checkpoints/commits na mesma branch da **PR #584**. **Sem outras PRs e sem merge**.

## 7. ACEITAÇÃO: 197/197 COM EVIDÊNCIA REAL

- Inventário numerado das 197 URLs, tipologia de cada uma, quantidade de capítulos, fotos, vídeos, estado de validação visual.
- Comparação visual **antes/depois** da Paula (#579), Lambrini (#582), Festa Ploc, BLACKPINK, Racionais e amostra das demais famílias. Gerar screenshots das páginas reais em **1440, 1024, 768, 390, 360, 320px** para cada página; capturas integrais mais amostras da abertura, interior, multimídia e fechamento.
- Conferir associação visual de cada foto com capítulo e nome correspondente, incluindo legendas/alt text; erros visíveis de identificação barram a conclusão.
- Conferir links e vídeos substituídos; imagens carregadas, proporção preservada, sem overflow horizontal, sem texto menor que o padrão para escapar de colunas.
- Testar continuidade de áudio real Home→Notícias→matéria→Notícias e entrada mobile, uma fonte ativa, preservação do player universal e dos sinais existentes.
- Guardar progresso em commits e evidências na mesma PR. A entrega só está completa com **197/197 matérias visualmente revisadas** e as referências históricas restauradas.

**DECISÃO DO PROPRIETÁRIO:** o desenho colorido aprovado na conversa da PR #584 é a referência visual; esta especificação fornece as medidas, classes, semântica, responsividade, pesquisa fotográfica, articulação de conteúdo e verificação para executar fielmente **197 de 197**. **A PR permanece aberta até aprovação explícita de Mr. Nomad; sem merge nem publicação.**
