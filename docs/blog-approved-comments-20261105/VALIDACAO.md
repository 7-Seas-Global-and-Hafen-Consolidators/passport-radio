# Etapa 1 — comentários aprovados do Blog

Base: PR #589 mergeada, main 423b183dab04011c570fde016b4e57bb21c45f55. Branch: feat/blog-approved-comments-20261105.

## Implementação

Leitura anônima do Apps Script, limitada a APROVADO e URL canônica exata. Resposta contém somente ID, apelido, comentário integral e data. Cliente atualiza a cada 30 segundos e ao retornar à aba; renderiza texto literal, elimina IDs duplicados, substitui a lista e cancela leituras ao sair da matéria. PENDENTE e REJEITADO não são retornados. Rejeitar uma aprovação anterior retira o comentário na próxima leitura.

Contexto Blog preservado: /blog/w/ ou editorial com passport-area=blog. Notícias canônicas não recebem formulário nem lista de aprovados. doPost, envio, confirmação, deduplicação e Gmail preservados. Nenhum arquivo de áudio, Home, matéria, fotografia, vídeo ou navegação alterado.

## Verificações executadas

Em 05/11/2026, `node --test integrations/blog-comments/receiver.test.cjs integrations/blog-comments/approved.test.cjs`: 7 passaram, 0 falharam. Cobrem receptor existente, Gmail indisponível, deduplicação de envio, seleção de moderação e matéria, mudança PENDENTE → APROVADO → REJEITADO, campos privados ausentes, callback inválido, texto integral e escape de conteúdo. `node --check js/passport-blog-comments.js` passou.

Navegador disponível: Chrome. Prévia interna completa abriu a matéria de Kurt no contexto Blog com um formulário e a área Comentários dos leitores. A leitura real apresentou falha, coerente com o endpoint ainda sem doGet. Não confundir estes testes com validação Firefox ou aprovação real na planilha.

## Impedimento de ativação verificado

GET no /exec já fornecido pelo proprietário retornou literalmente **Script function not found: doGet**. A versão implantada não oferece leitura. A versão Code.gs desta PR acrescenta essa função, preservando o receptor. O navegador não tem sessão Google: o acesso ao Apps Script levou à página pública e depois ao login Google. Os conectores disponíveis não editam nem implantam Apps Script.

É indispensável atualizar Code.gs no projeto existente e atualizar a implantação para Nova versão, conservando o mesmo /exec e a planilha privada existente. Instruções em integrations/blog-comments/README.md. Não executar prepararPlanilha novamente.

Teste real adicional: Home → Blog → matéria de Kurt → envio → Home. Somente passport-live-audio ativo, readyState 4, fonte OnlyLive preservada. Tempos observados: Home 79,98 s; Blog 91,29 s; matéria 99,17 s; após envio 132,17 s; retorno Home 199,40 s. O formulário confirmou recebimento. Linha de teste 276bbfd6-b59b-4a61-b9b0-590f3317df87 encontrada uma vez, PENDENTE e aviso ENVIADO. Gmail retornou uma mensagem para o ID. Nenhuma linha anterior modificada.

Notícias: a mesma matéria em URL canônica sem passport-area=blog apresentou zero formulários, zero listas públicas e zero scripts de leitura Google.

Prévia privada atualizada: https://passport-pr589-comments-preview.mr-nomad.chatgpt.site — versão da prévia 031936d3d2049a8096827d02f1834285a818a1a6. Acesso do proprietário preservado; site oficial intocado. Captura do envio confirmado: ![Envio real](comment-received.jpg).

Ainda não comprovados nesta etapa: aprovação real na planilha → exibição na prévia e teste pessoal em Firefox. Esta PR permanece em rascunho enquanto essas provas faltam. Sem merge, publicação oficial ou alterações da main.
