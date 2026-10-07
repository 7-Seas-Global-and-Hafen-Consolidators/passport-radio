# ORDEM ÚNICA — DESAFIOS PASSPORT — 43 JOGOS

## ALVO
Implementar a evolução de `/jogos.html` para **DESAFIOS PASSPORT**, incorporando os **43 jogos garimpados** e preservando integralmente o que já funciona.

## FONTE PERSISTIDA — NÃO PEDIR AO USUÁRIO DE NOVO
A matéria-prima recuperada desta coleta está nesta mesma branch:
`docs/desafios-passport-43/source/`

Essa pasta contém os dumps brutos persistidos dos quizzes coletados (um arquivo pode conter mais de um jogo/mecânica). Leia a pasta inteira antes de implementar. Não dependa de anexos do ChatGPT e não peça ao usuário para reenviar o material.

## ESTADO EXISTENTE A PRESERVAR
A implementação anterior de Jogos veio da PR #510, já mergeada. A rota pública continua `/jogos.html`.
Preservar os jogos atuais e sua infraestrutura útil; evoluir, não destruir.

## REGRA RADIOATIVA — ÁUDIO
**NÃO IMPLEMENTAR CONTINUIDADE NOVA. NÃO ALTERAR A CONTINUIDADE EXISTENTE.**

Reutilizar `/js/passport-audio-continuity.js` **sem modificação**.
Não tocar em:
- streams/endpoints;
- player universal;
- bus;
- mutex;
- interlock;
- seleção da estação;
- volume;
- transporte;
- lógica de play/pause;
- reconexão;
- autoplay.

Não criar outro `<audio>`, player, iframe de rádio, bus, mutex, storage de estação ou mecanismo paralelo.

Comportamento obrigatório:
- entrou em Jogos com um bebê tocando -> o mesmo bebê continua tocando;
- abriu desafio -> continua o mesmo áudio/transporte;
- respondeu/avançou/recomeçou -> áudio intocado;
- voltou ao portal/trocou de desafio -> áudio intocado;
- entrou pausado -> permanece pausado;
- nenhuma navegação dos desafios pode disparar play, pause, troca de src, reload ou nova conexão.

Os desafios **consomem a infraestrutura existente; não são donos dela**.

## ARQUITETURA — NÃO VIRAR ZONA
Não criar 43 sistemas independentes nem 43 cópias do mesmo JavaScript.

Estrutura desejada:
- `/jogos.html` — portal DESAFIOS PASSPORT;
- um motor reutilizável para execução dos desafios;
- catálogo/dados separados do código;
- CSS próprio dos desafios;
- assets próprios em diretório organizado.

Pode adaptar a estrutura aos padrões reais do repositório após auditoria, mantendo o princípio: **um motor, muitos jogos, dados declarativos**.

Cada desafio deve ter ID estável, slug, título, tipo, descrição, dados/perguntas, assets quando houver, regras de pontuação/gabarito e resultado quando houver.

## TIPOS DE DESAFIO QUE O MOTOR PRECISA SUPORTAR
A fonte contém mecânicas diferentes. NÃO force tudo no mesmo molde visual.

Suportar, conforme cada jogo real:
1. trivia de múltipla escolha com resposta correta;
2. verdadeiro/falso;
3. perguntas com explicação pós-resposta;
4. identificação visual por foto/recorte;
5. reconhecer artista/banda por cabelo, barba, silhueta ou detalhe;
6. reconhecer logo de banda;
7. reconhecer capa/fragmento de álbum;
8. comparar álbuns / qual veio primeiro;
9. reconhecer videoclipe por um frame;
10. perguntas históricas por década/festival/artista;
11. completar/identificar música a partir de trecho/frase;
12. desafios de letras;
13. desafios por emojis;
14. Rock or Not / escolha entre opções;
15. personalidade sem certo/errado;
16. personalidade com pesos por alternativa e perfis finais;
17. resultado associado a gênero, artista, comportamento, idade musical ou bebê/stream quando a fonte exigir.

## FOTOS E ASSETS
Nem todo desafio possui imagem.

- pergunta sem foto -> renderizar corretamente sem reservar buraco vazio;
- pergunta com foto -> renderizar a imagem vinculada àquela pergunta;
- pergunta baseada na imagem -> a imagem é parte obrigatória da mecânica;
- resultado com imagem -> suportar imagem no resultado;
- não inventar imagem para perguntas originalmente textuais;
- não transformar tudo em card com foto só por uniformidade;
- organizar assets localmente; evitar dependência estrutural de hotlink de terceiros na implementação final;
- preservar associação imagem/pergunta durante a migração.

## LETRAS / FRASES / TEXTO
Há jogos em que o próprio texto é a mecânica: completar frase, identificar música por trecho, letras, citações, emojis etc.
Não converter isso em trivia genérica nem apagar a diferença entre os formatos.
Preservar a lógica de cada desafio e apresentar em português.

## IDIOMA
Interface final: **português do Brasil**.
Traduzir/adaptar títulos, instruções, perguntas, alternativas, feedbacks e resultados necessários à experiência.
Nomes próprios, bandas, discos e músicas permanecem com seus nomes oficiais.

## IDENTIDADE PASSPORT
Não copiar a pele visual da RADIO BOB.
Usar a identidade congelada Passport:
- branco #FFFFFF;
- preto #111111;
- vermelho #C41E3A;
- Bodoni Moda;
- Instrument Sans;
- Source Serif 4.

Sem cinza institucional decorativo, dourado, cobre, azul decorativo, Route 66, jukebox, cassete ou estética de viagem.

Título da área: **DESAFIOS PASSPORT**.

## PORTAL / ORGANIZAÇÃO
Os 43 desafios precisam ser encontráveis sem virar uma tripa interminável.
Organizar por famílias funcionais (ex.: conhecimento, visual, personalidade, memória/letras), usando a classificação real encontrada na fonte.
Adicionar busca/filtro apenas se isso melhorar o acervo sem quebrar mobile.
O portal deve deixar claro o tipo de desafio e permitir entrar/sair/trocar de jogo sem perder o estado de áudio.

## ESTADO DOS JOGOS
Progresso do desafio pode usar armazenamento próprio dos jogos.
Esse storage NÃO pode armazenar nem alterar estado de rádio.
Namespace próprio para jogos.
Recomeçar um desafio afeta somente aquele desafio.

## ACESSIBILIDADE / MOBILE
- teclado;
- foco visível;
- labels/aria onde necessário;
- feedback não dependente só de cor;
- imagens com alt adequado à mecânica sem entregar a resposta;
- dialog/overlay com foco correto se utilizado;
- mobile real, sem scroll horizontal;
- botões/alvos tocáveis;
- imagens responsivas.

## NÃO FAZER
- não mexer em rádio/streams/player/continuidade;
- não criar autoplay;
- não duplicar infraestrutura de áudio;
- não reescrever Home/Notícias/Arquivo/Loja/Agenda;
- não remover os jogos atuais sem migração funcional;
- não criar 43 HTMLs duplicados com lógica copiada;
- não colocar todas as perguntas dentro de `jogos.html`;
- não inventar perguntas, respostas ou resultados quando a fonte não sustentar;
- não forçar foto onde não existe;
- não apagar foto onde ela faz parte da pergunta;
- não misturar código de rádio com código de jogos;
- não fazer merge.

## QA OBRIGATÓRIO
Testar desktop + mobile e, no mínimo:
- abrir portal;
- iniciar cada família de mecânica;
- responder correta/incorreta;
- perguntas sem foto;
- perguntas com foto;
- visual por recorte/capa/logo/frame;
- frase/letra;
- personalidade e cálculo de resultado;
- reiniciar;
- trocar de desafio;
- voltar ao portal;
- persistência do progresso dos jogos;
- acessibilidade básica;
- ausência de erros de console.

### QA RADIOATIVO
Com uma estação já tocando, navegar por várias transições entre portal/desafios e confirmar que seleção/estado/transporte permanecem preservados pela infraestrutura existente, **sem modificar o arquivo de continuidade para fazer o teste passar**.
Repetir com áudio pausado.

## ENTREGA
Trabalhar nesta branch:
`feat/desafios-passport-43-20261007`

Antes de codificar:
1. ler toda `docs/desafios-passport-43/source/`;
2. auditar `/jogos.html`, CSS/JS/dados atuais e a integração existente com `passport-audio-continuity.js`;
3. inventariar os 43 jogos e classificá-los por mecânica;
4. então implementar.

Ao terminar:
- commit/push nesta branch;
- abrir PR para revisão;
- **NÃO MERGEAR**;
- entregar lista de arquivos alterados, inventário final dos 43 desafios, evidências de QA desktop/mobile e QA de continuidade;
- registrar checkpoint em `docs/desafios-passport-43/completion/`.


# CORREÇÃO DE CHECKPOINT — OBRIGATÓRIA

A auditoria anterior que concluiu que os dados dos desafios estavam ausentes partiu da pasta errada. **NÃO registrar corpus incompleto e NÃO encerrar a tarefa por esse diagnóstico.**

Fontes corretas recuperadas dos anexos do garimpo foram persistidas em:

`docs/desafios-passport-43/source-correct/`

Leia **source-correct/** antes de qualquer implementação. A pasta antiga `source/` está contaminada por arquivos editoriais e não deve ser usada como autoridade para dizer que os quizzes não existem.

Os arquivos em `source-correct/` são matéria-prima bruta recuperada; podem conter páginas completas, índices e sobreposição entre dumps. Faça deduplicação por conteúdo/título/mecânica durante o inventário. Não invente perguntas para completar número.

Preserve a regra radioativa já definida nesta ordem: não alterar `passport-audio-continuity.js`, player, streams, bus, mutex, interlock ou transporte.


# CORREÇÃO FINAL DO CORPUS — CHECKPOINT REPARADO EM 2026-10-07

## AUTORIDADE DO CORPUS
O bloqueio anterior foi um erro de aquisição/checkpoint, não ausência do material. A coleta manual do Mr. Nomad contém **43 desafios identificados**. A implementação NÃO pode reduzir esse corpus aos poucos dumps que por acaso já estejam em `source/` ou `source-correct/`.

A autoridade operacional passa a ser:
1. este inventário consolidado;
2. os dumps brutos recuperados e persistidos;
3. as imagens/associações presentes nesses dumps;
4. a mecânica observada durante o garimpo.

Um dump pode conter mais de um desafio. Dumps duplicados não contam como jogos novos. Não usar quantidade de arquivos como quantidade de desafios.

## INVENTÁRIO CONSOLIDADO — 43 DESAFIOS
O corpus precisa fechar em **43 IDs estáveis**, preservando as diferenças de mecânica. Famílias e exemplos efetivamente observados no garimpo incluem:

### Conhecimento / história / cenas
- Wacken Open Air;
- MTV Unplugged;
- décadas do rock, incluindo anos 70 e anos 90;
- história do rock'n'roll;
- fatos e curiosidades de bandas e artistas;
- verdadeiro/falso (ex.: Tony Iommi);
- qual banda / qual artista / formações (ex.: Keith Richards);
- qual álbum veio antes / cronologia.

### Identificação visual
- barba de rockstar;
- cabelo de rockstar;
- silhueta / integrante / formação;
- logos de bandas;
- capas e fragmentos de álbuns;
- frames de videoclipes;
- imagens/recortes para reconhecer artista, banda, disco ou música.

### Música / memória textual
- reconhecer música por trecho/frase;
- completar/identificar letras;
- letras e versos;
- emojis;
- reconhecer música/obra a partir de pista textual.

### Personalidade / perfil
- Rock or Not?;
- quanto punk existe em você?;
- descubra sua idade musical;
- onde você gosta de ouvir música?;
- comportamento em shows/quarentena e escolhas sem certo/errado;
- resultados por perfil, gênero, artista, comportamento ou idade musical quando o dump sustentar o cálculo.

O inventário detalhado de cada ID deve ser completado a partir dos dumps persistidos **sem inventar conteúdo ausente**, porém a contagem-alvo de produto continua sendo 43 desafios, e não “6 quizzes completos”.

## MECÂNICAS NÃO HOMOGÊNEAS
NÃO transformar os 43 em um quiz genérico. O motor deve renderizar por tipo:
- múltipla escolha;
- verdadeiro/falso;
- escolha de perfil sem gabarito;
- perfil ponderado;
- pergunta somente textual;
- pergunta com foto;
- pergunta em que a própria imagem é a pista;
- capa/logo/frame/recorte;
- letra/frase;
- resultado textual;
- resultado com imagem.

Pergunta sem foto não reserva espaço vazio. Pergunta com foto preserva a associação exata. O alt não pode entregar a resposta.

## PORTUGUÊS
Toda interface e todo conteúdo de experiência devem ficar em português do Brasil. Nomes oficiais de artistas, bandas, discos e músicas não são traduzidos. O objetivo é **adaptar a mecânica e o conhecimento para DESAFIOS PASSPORT**, não copiar a redação/pele da fonte.

## DIRETRIZ DE ORIGINALIDADE
Não copiar perguntas literalmente quando puderem ser reescritas sem perder o fato/mecânica. Reescrever em português Passport, preservando fatos, gabaritos e associações visuais sustentadas pela fonte. Não copiar marca, CSS, layout ou identidade RADIO BOB.

## ÁUDIO — TRAVA ABSOLUTA
Esta correção NÃO autoriza nenhuma alteração em áudio. Continuam proibidas mudanças em:
`/js/passport-audio-continuity.js`, streams, endpoints, player universal, bus, mutex, interlock, seleção de estação, volume, transporte, play/pause, reconexão e autoplay.

DESAFIOS PASSPORT deve funcionar por renderização interna/estado do motor, sem navegação que recrie o documento para avançar pergunta. O áudio existente é apenas herdado e permanece intocado.

## CRITÉRIO DE NÃO BLOQUEIO
Não voltar ao usuário dizendo que “os 43 não estão presentes” apenas porque a pasta persistida tem menos arquivos. Antes disso:
- deduplicar dumps;
- procurar múltiplas mecânicas no mesmo dump;
- confrontar este inventário;
- registrar exatamente quais IDs têm conteúdo integral, parcial e asset associado.

Só um item comprovadamente sem corpo suficiente pode ser marcado como `fonte-parcial`; isso NÃO autoriza inventar pergunta nem reduzir silenciosamente o corpus.

## ENTREGA PARA A IMPLEMENTAÇÃO
Antes de alterar `jogos.html`, gerar em `docs/desafios-passport-43/completion/`:
- `INVENTARIO-43.md`: 43 linhas/IDs, título Passport, família, tipo, quantidade de perguntas recuperadas, com/sem imagem, origem do dump e status;
- `MAPA-ASSETS.md`: imagem -> desafio -> pergunta/resultado;
- `CHECKPOINT-AQUISICAO.md`: deduplicação e lacunas reais.

Depois implementar **um motor + catálogo declarativo**, mantendo a rota `/jogos.html`, a identidade Passport e os jogos atuais migrados/preservados. Não mergear.
