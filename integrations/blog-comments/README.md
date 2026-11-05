# Comentários do Blog — preparação

O formulário usa as cores e fontes Passport. Aparece em matérias de `/blog/w/` e páginas editoriais datadas que já carregam o compositor editorial. A capa, os comentários históricos e os motores de áudio ficam fora da alteração. A branch está ligada ao endereço Google fornecido pelo proprietário.

## Configuração original

1. Na conta **passportradio.online@gmail.com**, abrir [Apps Script](https://script.google.com/home), criar um projeto e colar [Code.gs](Code.gs). Executar **prepararPlanilha** uma vez e autorizar Google Sheets e envio de e-mail. A função cria uma planilha privada e mostra o link no registro de execução. Manter o acesso geral como **Restrito**.
2. No mesmo projeto, usar **Implantar → Nova implantação → Aplicativo da Web**. Selecionar **Executar como eu** e **Quem pode acessar → Qualquer pessoa**. Copiar o endereço terminado em `/exec`. Essa etapa disponibiliza um ponto público de recebimento, por isso depende da ordem de ativação.
3. A Work preenche `endpoint` em `js/passport-blog-comments.js` em branch de revisão. Antes da publicação do Blog, testar com sessão anônima em ambiente de teste, usando a origem definida em `SITE`, e confirmar o registro, o aviso no Gmail e a permanência da rádio durante a navegação. O código aceita confirmação do Google vinculada ao identificador aleatório do envio e só confirma ao leitor após gravação.

O acesso ao Gmail pelo ChatGPT é distinto da autorização do Apps Script. O conector disponível confirma a conta, mas não cria nem implanta projetos Apps Script. O proprietário já executou a configuração e disponibilizou o endereço /exec usado nesta branch.

## Moderação

A aba **Moderação** recebe ID, data, URL da matéria, apelido, comentário, estado e situação do aviso. O estado inicial é **PENDENTE**. Mr. Nomad muda para **APROVADO** ou **REJEITADO**. Nenhum desses estados aciona publicação. Somente mediante ordem, a Work prepara a publicação do apelido, texto revisado e data pública na matéria correspondente.

O aviso leva apenas a URL e o ID. Se a cota de e-mail acabar ou o aviso falhar, a linha fica na planilha com a situação correspondente. Os textos de visitantes entram como texto literal na planilha. Não há campo de e-mail ou registro de IP no código. A planilha não serve conteúdo para o público.

## Testes locais

```sh
node --test integrations/blog-comments/receiver.test.cjs
COMMENTS_CHROME=/caminho/do/chrome node integrations/blog-comments/browser.cjs
```

Os testes simulam os serviços Google. O teste de navegador usa Playwright com Chromium e verifica os dois caminhos de artigo, o envio sem abrir outra página e a confirmação. A preservação do elemento de áudio foi verificada no teste isolado. O teste real está registrado abaixo.

## Aceite em 04/11/2026

Chromium sem sessão Google, usando a página pública com os quatro recursos da PR substituídos apenas no navegador de teste. O formulário enviou ao Apps Script real. A primeira espera de 20 segundos expirou, embora a linha e a mensagem tivessem sido gravadas. A repetição com o mesmo ID e espera de 60 segundos exibiu **Comentário recebido para moderação**. A alteração de tempo de espera foi incorporada à branch.

- ID técnico: `f7d39d8a-f4da-42b1-b38d-d140dc773005`. A linha consultada no Sheets está **PENDENTE**, com aviso **ENVIADO**. O Gmail da Passport recebeu a notificação com o mesmo ID. O comentário está identificado como teste e não deve ser publicado.
- Hits em Home → Blog → matéria de Kurt Cobain → envio → Home. Mesmo documento, mesmo elemento de áudio, mesma fonte, volume 0,8 e apenas um áudio ativo. Tempo de reprodução avançou de 1,02 s para 23,69 s na repetição com confirmação.
- Testes locais do receptor e Chromium com resposta simulada passaram após configurar o endereço. Os testes simulados substituem o destino para evitar gravações reais.
