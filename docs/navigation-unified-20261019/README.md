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
