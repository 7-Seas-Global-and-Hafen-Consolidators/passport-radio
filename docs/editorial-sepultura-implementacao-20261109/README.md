# Andreas Kisser, Giulia e a despedida do Sepultura

Implementação para aprovação de Mr. Nomad. A [PR #597](https://github.com/7-Seas-Global-and-Hafen-Consolidators/passport-radio/pull/597) reúne a SPEC, o manuscrito e os anexos. A base da execução é `main` em `cbd86d0b7393cdfed8974564facf43ec2dd85875`.

## Recuperação

O GitHub conservava a PR documental e as quatro fotografias. A branch local, os arquivos preparados e as capturas vistos antes da interrupção não estavam no checkout restaurado. A busca nas referências, no histórico local, no stash e nos objetos sem referência não encontrou a implementação. A entrega foi reconstruída na branch separada `feat/sepultura-editorial-20261109`, a partir da SPEC, do manuscrito, da última ordem, dos anexos e do modelo Paula Toller. Os resultados abaixo são da execução atual.

## Arquivos de produto

- `editorial/2026/11/09/andreas-kisser-giulia-sepultura-despedida.html` contém a matéria integral, os metadados, as quatro figuras e os dois vídeos nos capítulos 5 e 6. A abertura usa “A menina fofinha é” conforme a ordem final.
- `data/editorial-manual-feed.json` recebe um item. A capa de Andreas com Giulia bebê é também a foto do card.
- `js/passport-news.js` monta cada nova grade uma vez. Isso repõe os cards quando a navegação existente traz o leitor de volta a Notícias dentro do mesmo documento.
- `images/editorial/2026/11/09/andreas-kisser-giulia-sepultura-despedida/` contém as quatro fotos fornecidas pelo proprietário, convertidas para WebP nas dimensões originais.

O artigo usa a composição e o CSS editorial existentes, com o cabeçalho, menu e rodapé compartilhados. A navegação usa o encaixe institucional existente. O sumário mantém o documento aberto e foca o capítulo escolhido. O diff de produto se limita aos sete arquivos acima.

## Verificação

- Conferência literal de 518 parágrafos em ordem, 12 títulos e âncoras, quatro fotos com texto alternativo e dimensões, vídeos nos capítulos corretos, links de participação, canonical, Open Graph, Twitter Card, Article JSON-LD e equivalência do feed anterior após retirar o novo item. `node --check` e `git diff --check` passaram.
- Chromium em 1440×900, 1280×800, 1024×768, 768×1024, 390×844, 375×812 e 320×640. Busca encontrou um card, clique abriu o artigo, os 12 saltos focaram os respectivos capítulos, as quatro fotos decodificaram e os dois frames ficaram em 16:9. Confirmados capitular vermelha, logo, rodapé e ausência de rolagem horizontal.
- Home → Notícias → matéria → capítulo 5 → Notícias → Blog preservou o mesmo documento, a mesma estação e o mesmo elemento de áudio. Um único áudio ativo avançou durante todo o percurso. O navegador recebeu um MP3 de teste pela rota de rede da estação.
- A tentativa com o sinal real no Chromium parou em `ERR_CERT_AUTHORITY_INVALID`, com validação TLS ativa. Os dois endereços dos embeds responderam HTTP 200. A reprodução dos vídeos dentro do navegador segue sem confirmação.
- As quatro fotos têm legendas descritivas. Créditos autorais e condições de uso seguem pendentes de confirmação para eventual publicação.

[Resultados do Chromium](resultados.json)

| Tela | Notícias antes | Notícias depois | Paula Toller | Matéria |
|---|---|---|---|---|
| Desktop | [1440](evidencias/noticias-antes-1440.jpg) | [1440](evidencias/noticias-depois-1440.jpg) | [1440](evidencias/paula-1440.jpg) | [1440](evidencias/materia-1440.jpg) |
| Tablet | [768](evidencias/noticias-antes-768.jpg) | [768](evidencias/noticias-depois-768.jpg) | [768](evidencias/paula-768.jpg) | [768](evidencias/materia-768.jpg) |
| Mobile | [390](evidencias/noticias-antes-390.jpg) | [390](evidencias/noticias-depois-390.jpg) | [390](evidencias/paula-390.jpg) | [390](evidencias/materia-390.jpg) |

As capturas de Notícias antes usam o feed e o leitor de `main`. O modelo Paula Toller é a referência do repositório. Os recursos externos ficaram bloqueados durante os testes de layout.
