# Prévia completa — Home, Blog, matéria e comentário — 05/11/2026

Endereço privado: https://passport-pr589-comments-preview.mr-nomad.chatgpt.site/

Abra a entrada, use Continue with ChatGPT com a conta proprietária, escolha uma rádio e clique Blog. Na capa do Blog, abra a matéria Kurt Cobain/Beatles, preencha Apelido e Comentário e pressione ENVIAR. A confirmação esperada é “Comentário recebido para moderação.” Depois volte à Home pela navegação institucional.

## Entrega

A página isolada foi substituída pela Home, Blog e matéria integrais. HTML do Blog e da matéria veio da PR 589 no HEAD 98d9b5b9b4b52962891c90edd05bedc65c10b8ce. A Home e os recursos locais vieram do checkout 5d9d3a53058918fb66e778e56f19efaf551302bf, cujo código de produção permanece igual nos commits posteriores de evidências. Foram conferidos 258 scripts/estilos idênticos ao checkout, incluindo os motores, sem alterações. A única adaptação no script de comentários pertence à hospedagem de prévia.

Mídias e dados públicos usam os endereços originais do domínio oficial. Outros documentos existentes são consultados pelo servidor da prévia. Links institucionais absolutos são mantidos dentro da origem de prévia para permitir o percurso contínuo. Não há novo layout ou motor de áudio.

## Causa real da confirmação expirada

O Apps Script implantado devolve um HTML com window.top.postMessage(..., "https://passportradio.online"). O código Code.gs e uma resposta real do endpoint confirmaram esse destino fixo. Um documento em outra origem recebe o registro e o e-mail, mas não recebe aquela mensagem.

A hospedagem da prévia agora encaminha o POST ao mesmo Apps Script e lê seu recibo real. Somente um recibo do tipo passport-comment, com ID exatamente igual e received booleano, é devolvido ao navegador. HTTP 200 sem recibo válido NÃO confirma sucesso. O código Google, a planilha e o Blog oficial não foram modificados. Na origem oficial, o formulário da PR mantém seu envio direto original; na prévia, o transporte da confirmação usa essa ponte de mesma origem. Isso é uma adaptação da hospedagem, não uma simulação de recebimento.

## Validação real

Navegador disponível: Chrome, desktop 1348 px. Firefox e Edge não estão disponíveis nesta sessão, portanto não se atribuem testes a eles. A revisão percorreu a implementação local da mesma versão preparada e hospedada. A hospedagem privada foi confirmada como succeeded; a sessão de inspeção não dispõe de login ChatGPT para repetir o percurso dentro da URL privada remota. O proprietário pode abrir o endereço no Firefox e entrar com sua conta.

- Home → Blog → matéria → envio → Home por links reais.
- Formulário integrado à matéria completa, com cabeçalho, navegação, conteúdo, fotografias, vídeos existentes e rodapé.
- Clique duplo em ENVIAR; confirmação visível e campos limpos.
- Comentário 74dcda53-1b79-42ef-867b-01829fb6f6e7: exatamente uma linha PENDENTE e uma notificação Gmail.
- Repetição explícita pelo mesmo receptor de prévia, com o mesmo ID: recibo received=true; continuou uma linha e uma mensagem Gmail após a repetição.
- Hits real: uma reprodução ativa, mesma identificação e mesma URL de stream em todos os pontos; tempo avançando de 20,838 s para 133,351 s. A continuidade foi comprovada pela observação do áudio, sem substituir respostas ou criar áudio de teste.
- Parser testado com resposta real Google e casos de sucesso, recusa, ID diferente e envelope ausente. Build e verificação do módulo Worker passaram.

[Home](pr589-full-home.jpg) · [Blog](pr589-full-blog.jpg) · [Matéria](pr589-full-article.jpg) · [Confirmação](pr589-full-received.jpg) · [Resultados](complete-preview-results.json)

As capturas anteriores sem mídias, realizadas durante ajustes do servidor local, não são as provas finais. As provas acima foram feitas após corrigir o carregamento no ambiente de revisão.

## Hospedagem e escopo

Origem da hospedagem: 9b41e50a4c0d9fd00a7538a9be9b0f9242c61265. Atualização privada succeeded, preservando a audiência proprietária. Não houve publicação no domínio oficial, merge ou alteração da main do Passport Radio.

Nesta rodada, a PR recebe somente ferramentas de prévia e provas. Nenhum arquivo existente de produção ou sistema de áudio foi alterado. As ferramentas de geração ficam em integrations/blog-comments/preview; o pacote completo da hospedagem, com suas cópias verificadas, está versionado no repositório próprio da prévia.
