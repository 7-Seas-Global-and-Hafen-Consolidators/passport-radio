# Correção da prévia — campos ausentes — 05/11/2026

Endereço mantido: https://passport-pr589-comments-preview.mr-nomad.chatgpt.site/

## O que foi encontrado e corrigido

A prévia anterior tinha uma entrada com redirecionamento e não continha campos no HTML. Ela dependia de um script externo que só criava o formulário quando location.pathname correspondia a uma rota editorial terminada em .html. Na raiz ou numa rota sem essa extensão, a condição retorna antes de criar os campos. Essa dependência está confirmada no código; a URL final e o motivo exato do comportamento observado no Firefox de Mr. Nomad não foram capturados nesta sessão. Não atribuímos um defeito ao Firefox sem reprodução.

A entrada agora contém Apelido, Comentário e ENVIAR diretamente no HTML. O CSS e a lógica de envio estão no mesmo documento, eliminando a dependência dos arquivos externos para montar os campos. Não há mais redirecionamento na entrada, nem condição de rota para mostrar o formulário. A matéria é identificada explicitamente pelo caminho canônico original. O bloqueio de cliques durante envio, validação de origem da confirmação Google e repetição com o mesmo ID foram preservados. Existe alternativa criptográfica para UUID quando randomUUID não estiver disponível no endereço HTTP de teste local.

Somente a prévia foi adaptada: js/passport-blog-comments.js e css/passport-blog-comments.css do repositório continuam intactos. A prévia deixou de ser uma cópia literal do montador de produção; é uma página de teste independente com o mesmo destino de moderação.

## Provas e limites

- HTML verificado nas entradas raiz e editorial: nickname, comment, article, requestId e exatamente um botão presentes.
- JavaScript passou em node --check.
- Chrome via navegador disponível: campos visíveis e habilitados diretamente em /, sem redirecionamento. [Captura](corrected-fields.jpg).
- Envio real: ID 5f116c08-fdc1-4532-b23b-0d35dfcb4874; uma linha PENDENTE, aviso ENVIADO e uma mensagem encontrada no Gmail pelo ID.
- A confirmação na tela expirou tanto no primeiro envio quanto na repetição com o mesmo ID. Após a repetição continuava uma única linha na planilha. Não há prova de confirmação visual bem-sucedida nesta rodada.
- Firefox e Edge continuam indisponíveis na sessão. Portanto não se declara validação real em Firefox nem conclusão integral do envio com confirmação nesse navegador.
- A prévia publicada exige acesso com a conta ChatGPT proprietária. O navegador de inspeção mostrou a tela de login, sem sessão autenticada. A captura é da cópia local preparada, não de uma sessão autenticada na hospedagem.

[HTML corrigido hospedado](preview-form.html) · [Resultado do envio](corrected-preview-results.json)

Hospedagem da prévia: atualização succeeded; commit de origem 55e94909d2ae4d4b8c694da223cda5b36f4b697d. A audiência privada foi preservada. Main, site oficial e todos os sistemas de áudio permaneceram intactos. Sem merge ou publicação oficial.
