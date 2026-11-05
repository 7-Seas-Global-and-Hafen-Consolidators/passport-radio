# Separação de comentários: Blog × Notícias — 05/11/2026

Prévia completa atualizada: https://passport-pr589-comments-preview.mr-nomad.chatgpt.site/

Abra no Firefox, entre com a conta ChatGPT proprietária e teste os dois caminhos:

1. Blog → matéria Kurt Cobain/Beatles: Apelido, Comentário e ENVIAR presentes.
2. Notícias → buscar “Kurt Cobain” → mesma matéria: sem formulário do Blog.

## Correção

Código: 98cecdb8bcbd86effe40b2db94b3c0d8fcc9f337, branch feat/blog-comments-google-20261104.

As capas compartilham matérias em /editorial/...; liberar comentários apenas pela extensão .html misturava as duas áreas. Agora /blog/w/... permanece elegível. Os links editoriais dentro do Blog recebem passport-area=blog, preservando o contexto no endereço e no recarregamento. Os links de Notícias e a entrada editorial canônica não recebem esse contexto e não montam o formulário. O caminho enviado ao Google continua canônico, sem a marca de contexto. Uma montagem fora do Blog também remove eventual formulário que tenha restado no main.

Arquivos de produção alterados nesta rodada: somente js/passport-blog-comments.js (elegibilidade) e js/passport-blog-shell.js (links do Blog). Não foram modificados conteúdo editorial, HTML das matérias, CSS, fotografias, vídeos, Apps Script ou motores de áudio. O envio, o recibo, a proteção contra repetição e a moderação existentes foram preservados.

## Provas reais da implementação local

Navegador disponível: Chrome. A prévia privada remota foi atualizada com sucesso; o teste remoto autenticado e o Firefox não foram executados nesta sessão. O link é entregue ao proprietário para aprovação no Firefox.

| Entrada | Formulários do Blog |
|---|---:|
| Matéria aberta pela grade de Notícias | 0 |
| Mesma matéria aberta pela capa do Blog | 1 |
| Capa Notícias após leitura no Blog | 0 |
| Entrada direta da matéria de Notícias | 0 |

A comparação do texto de article e das listas ordenadas de imagens/iframes entre as entradas de Notícias e Blog foi idêntica. A diferença é o formulário e o contexto de navegação.

Envio real pelo Blog com clique duplo: confirmação “Comentário recebido para moderação.”, campos limpos, uma linha PENDENTE e uma notificação Gmail. ID: 841887f2-d46a-4f12-b8ea-f2e12102e4b2. Nenhum comentário foi publicado.

Hits permaneceu com uma reprodução ativa e a mesma URL de stream em todos os pontos observados: 21,530 s na matéria de Notícias; 90,260 s na entrada do Blog; 160,663 s após o envio; 300,455 s no retorno à Home.

[Blog com confirmação](pr589-blog-comments-only.jpg) · [Fim da notícia sem formulário](pr589-news-no-comments.jpg) · [Resultados](blog-news-separation.json)

Na transição adicional de volta à capa Notícias, a grade não reapareceu na segunda montagem durante o teste. Essa navegação existente não foi alterada nesta correção; a ausência do formulário foi confirmada na capa e a entrada direta da notícia foi conferida em outra aba. Não se declara um segundo clique bem-sucedido na grade nessa etapa.

## Verificações

- Teste de escopo executado: capa Blog/Notícias excluídas; editorial canônico e contexto news excluídos; contexto Blog e /blog/w aceitos.
- Sintaxe JavaScript dos dois módulos e dos testes verificada.
- Regressões de navegador preparadas para exigir contexto Blog e conferir exclusão de Notícias; o arquivo browser.cjs não foi executado por CLI nesta sessão. A validação real foi feita pelo navegador disponível, conforme acima.
- [Passport CI aprovado no código](https://github.com/7-Seas-Global-and-Hafen-Consolidators/passport-radio/actions/runs/42056418159).
- [Materialize aprovado no código](https://github.com/7-Seas-Global-and-Hafen-Consolidators/passport-radio/actions/runs/42056418141).
- Build da prévia e verificação do módulo de hospedagem passaram.

Origem da prévia hospedada: c91f3483999c1c20171709f6736d60befd9a89f4; atualização privada succeeded. Mesmo endereço e mesma audiência proprietária. Main do Passport Radio intacta. Sem merge, publicação oficial ou alteração dos sistemas de áudio.
