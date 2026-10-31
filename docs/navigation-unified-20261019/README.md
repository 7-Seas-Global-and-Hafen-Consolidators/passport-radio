# Navegação unificada — 19/10/2026

Base GitHub: `66c51d4ce62776667964978023c4b709283f9bfd`.
Branch: `fix/unified-navigation-20261019`.

## Correção

Reutiliza `js/passport-games-navigation.js`, já carregado pelas principais páginas. Completa os 17 destinos institucionais, normaliza os nomes e os caminhos absolutos, identifica a seção atual (inclusive nas subpastas), preserva os anchors existentes e acrescenta os ausentes. Não substitui a página, o cabeçalho nem os seus handlers.

`css/passport-navigation.css` aplica exclusivamente ao menu principal: branco/preto/vermelho, Instrument Sans, espaçamento e quebra de linhas. Não esconde itens em uma faixa horizontal. Wordmark, masthead, mídia e conteúdo ficam sob seus estilos e módulos originais.

O rodapé compartilhado recebe apenas cinco linhas de bootstrap para carregar esse mesmo módulo onde ele faltava. A marcação, os links e o funcionamento do rodapé não mudam. Produtos e hubs com apenas navegação local recebem um menu institucional depois do cabeçalho; carrinho, busca, categorias, índices e navegação local são preservados. Documentos de player/widget sem cabeçalho institucional não ganham uma navegação nova.

## Destinos existentes

| Nome | Caminho |
|---|---|
| Home | `/` |
| Notícias | `/noticias.html` |
| Agenda | `/agenda.html` |
| Arquivo | `/editorial.html` |
| Bandas & Artistas | `/bandas/index.html` |
| Blog | `/blog.html` |
| Desafios Passport | `/jogos.html` |
| Clips TV™ | `/clips-tv.html` |
| Vídeos | `/videos.html` |
| A–Z | `/blog/arquivo/letras.html` |
| Podcast & Broadcast | `/radio.html` |
| Rádio 24H | `/#passport-radio-catalog` |
| Loja | `/loja.html` |
| Participe | `/divulgar-bandas.html` |
| Promoções | `/promocoes.html` |
| Anuncie | `/anuncie.html` |
| Apoie | `/doe.html` |

Rádio 24H usa o mural real da Home, cujo ID pertence ao módulo de catálogo existente. Não cria outra página, não aciona o player e não confunde o mural com a página de Podcast & Broadcast.

## Validação objetiva

- Navegador Chromium: 15 páginas representativas, em 1440, 768 e 390 px: Home, Notícias, Agenda, Arquivo, Blog, Desafios, Clips TV, Podcast & Broadcast, Loja, Anuncie, hub de Bandas, A–Z, perfil A–Z, produto e matéria editorial em subpasta.
- Verificados os 17 destinos sem duplicações, nomes, seção atual, links inteiramente dentro do menu/viewport e ausência de overflow horizontal no menu.
- Preservados os nós de mídia/player/rádios, o main, a identidade/altura do masthead e os anchors existentes durante a aplicação do módulo.
- Verificada montagem repetida e evento editorial sem duplicação dos destinos.
- Bootstrap normal adicional em quatro modelos (Home, Agenda, artista e produto): 12 medições detalhadas em `validation.json`.
- Todos os 17 destinos apontam para arquivos existentes no Git; a âncora do mural foi conferida na implementação original.
- Sintaxe dos dois scripts e do teste, mais `git diff --check`: aprovados.

O teste isola navegação: bloqueia requisições remotas, mídia e helpers comerciais. Não é teste de reprodução sonora, pagamentos ou da hospedagem Netlify. O código de reprodução não foi modificado. Nenhum autoplay foi introduzido.

Na primeira execução, 14 páginas passaram antes de a matéria ficar sem cabeçalho porque o isolamento do teste bloqueava seu carregador original de continuidade. Esse carregador foi permitido SOMENTE no teste, sem alteração no produto; a matéria foi validada isoladamente. O teste de existência dos links também teve sua extração delimitada à tabela real de destinos para não contar um array auxiliar. Não foi repetida a suíte geral. Um navegador de QA foi usado fora do repositório; nenhuma dependência foi adicionada ao site.

Para reproduzir no ambiente de QA com Playwright disponível:

```
PASSPORT_QA_BROWSER=/caminho/do/chromium node tests/navigation/validate-navigation.cjs
```

Opcional: `PASSPORT_QA_ROUTE=/caminho.html` verifica só a rota afetada; `PASSPORT_QA_BOOTSTRAP=1` verifica o carregamento normal em quatro modelos. Sem a variável de executável, usa o Chromium configurado no Playwright.

## Netlify: aplicação posterior, exclusivamente após aprovação

Deploy manual informado pelo proprietário: `6ad646d063e3d299f50eac0a`. A cópia `/home/passportradio/Downloads/passport-netlify-limpo/passport-radio-main` não está acessível neste ambiente. Não foi presumida equivalência com o GitHub, nem foi sobrescrita essa cópia.

A correção de produção contém apenas:

1. `js/passport-games-navigation.js`
2. `css/passport-navigation.css`
3. `js/passport-universal-footer.js` — apenas o bootstrap de cinco linhas.

Após aprovação, aplicar SOMENTE o diff desses três arquivos à cópia local existente, preservando eventuais diferenças locais. Não substituir o diretório inteiro por um ZIP de main. Como o bootstrap usa uma âncora existente do mural, conferir que a cópia local conserva `passport-radio-catalog` antes da aplicação. Se o rodapé local divergir, inserir apenas o bootstrap, sem sobrescrever seu restante. Esta instrução não executa cópia nem publicação. O proprietário decide quando fazer o próximo deploy manual.

Sem merge, sem deploy, sem DNS, sem integração automática GitHub–Netlify. Nenhuma configuração de hospedagem foi alterada. As diferenças da cópia local/Netlify permanecem não verificadas, por indisponibilidade desse filesystem e por escopo.

## Resgate da duplicação — atualização na mesma PR #560

Ponto de partida: `9e63d19cb65bfad3b2a34d3fd158dbb1793d1031`. A implementação anterior deduplicava apenas os links do primeiro contêiner de cada nav; ela completava todos os menus encontrados, sem retirar cópias institucionais. Além disso, rejeitava links com hostname oficial diferente do hostname de hospedagem. Os testes anteriores consultavam só o primeiro menu, portanto não demonstravam unicidade global. Essa lacuna está corrigida no código e no teste.

Correção de produção restrita a **dois arquivos**: `js/passport-games-navigation.js` e `css/passport-navigation.css`. O bootstrap de rodapé já existente não mudou neste resgate.

- Reconhece as URLs oficiais Passport e formas equivalentes de index/pretty URLs no contexto dos links institucionais, normalizando os destinos aprovados para caminhos locais.
- Deduplica todos os anchors do menu escolhido, inclusive os que estejam fora do primeiro ul/ol/contêiner. Reutiliza o nó original e seus handlers.
- Escolhe uma navegação principal visível. Cópias institucionais são preservadas no DOM, mas ficam hidden, aria-hidden e com regra CSS de display none importante. Completar apenas navs[0] não faz isso.
- Mantém menus locais fora dessa seleção. Preserva eventuais ações locais presentes numa cópia institucional, sem clonar os seus handlers.
- Reavalia a escolha em alterações do DOM, evento editorial e resize; recupera um menu disponível quando o shell principal é substituído.

### Evidências novas

`rescue-validation.json`: rodada Chromium das mesmas 15 páginas em 1440/768/390 px, **45 verificações de layout aprovadas**. Agora o teste conta todos os menus institucionais visíveis, exige exatamente um e verifica os 17 links, indicação atual, preservação de main/masthead/nós de mídia e menus locais. Agenda e Arquivo recebem fixtures explícitas de segundo menu, outro wrapper de links e links com o hostname canônico. Inserções tardias também são verificadas. Nenhum conteúdo dessas fixtures foi inserido em arquivos públicos.

`rescue-regressions.json`: fixture sintética baseada no nav real da Agenda, comparando:

| Código | Menus visíveis | Links Home visíveis |
|---|---:|---:|
| Original da PR #560 | 2 | 3 |
| Remendo que completa somente o primeiro menu | 2 | 3 |
| Resgate | 1 | 1 |

O resgate passou nas três larguras com os 17 destinos únicos, identificação de Agenda, preservação de controles locais e handler do carrinho, inserção tardia de cópia e substituição do shell principal. Esse teste é sintético e não se apresenta como captura ou execução do HTML privado do Netlify.

Reprodução focalizada (Playwright disponível no ambiente de QA):

```
PASSPORT_QA_BROWSER=/caminho/do/chromium node tests/navigation/validate-navigation.cjs
PASSPORT_QA_BROWSER=/caminho/do/chromium node tests/navigation/rescue-regressions.cjs
```

O segundo comando lê o código original pelo Git. Se o clone não contiver esse commit, `PASSPORT_NAV_ORIGINAL=/caminho/do/original.js` aceita uma cópia exata obtida do HEAD original. Não busca nem publica nada no Netlify.

### Limite da verificação no Netlify

Os dois anexos foram visualizados. A leitura HTTP, somente GET, de `/agenda.html`, `/editorial.html` e dos dois assets no endereço informado retornou **401 Unauthorized** neste ambiente. Não foi tentado contorno de autenticação, nem alterada proteção/hospedagem. Assim, o HTML exato e o remendo publicado no deploy `6ad6600ab4ce39c8193e8601` não foram inspecionados diretamente. Não se atribui a esse deploy uma serialização específica de URLs/containers sem evidência. Os limites do algoritmo original e a insuficiência do remendo foram reproduzidos e comprovados nas regressões acima.

A implantação permanece intocada. Depois da aprovação do proprietário, aplicar somente o diff dos **dois arquivos de produção deste resgate** à cópia local otimizada. Não substituir o diretório, o HTML, o rodapé ou o restante do site. Esta entrega não efetua aplicação nem deploy.

Proteção final: a retirada das cópias usa também display none inline com prioridade important, preservando e restaurando o valor anterior ao reativar um menu. A regressão inclui uma regra concorrente de display flex important. Após esse ajuste, foram repetidos somente Agenda/Arquivo (seis layouts) e a comparação de regressão; os outros resultados da rodada de 45 foram preservados.

Segurança de publicação conferida antes de salvar: o workflow Pages no HEAD-base só recebe push na main; seu deploy exige refs/heads/main e não roda em pull_request. O filtro de PR desse workflow é restrito a sitemaps/robots/workflow, arquivos ausentes neste resgate. Nenhum workflow foi alterado ou disparado manualmente. A única referência a atualizar é fix/unified-navigation-20261019; main, GitHub Pages, Netlify, DNS e domínio permanecem intocados.
