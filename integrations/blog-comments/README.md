# Comentários do Blog — preparação

O formulário usa as cores e fontes Passport. Aparece em matérias de `/blog/w/` e páginas editoriais datadas somente quando abertas no contexto do Blog (`?passport-area=blog`). Notícias sem esse contexto não recebem formulário nem lista pública. A capa, os comentários históricos e os motores de áudio ficam fora da alteração. A branch está ligada ao endereço Google fornecido pelo proprietário.

## Configuração original

1. Na conta **passportradio.online@gmail.com**, abrir [Apps Script](https://script.google.com/home), criar um projeto e colar [Code.gs](Code.gs). Executar **prepararPlanilha** uma vez e autorizar Google Sheets e envio de e-mail. A função cria uma planilha privada e mostra o link no registro de execução. Manter o acesso geral como **Restrito**.
2. No mesmo projeto, usar **Implantar → Nova implantação → Aplicativo da Web**. Selecionar **Executar como eu** e **Quem pode acessar → Qualquer pessoa**. Copiar o endereço terminado em `/exec`. Essa etapa disponibiliza um ponto público de recebimento, por isso depende da ordem de ativação.
3. A Work preenche `endpoint` em `js/passport-blog-comments.js` em branch de revisão. Antes da publicação do Blog, testar com sessão anônima em ambiente de teste, usando a origem definida em `SITE`, e confirmar o registro, o aviso no Gmail e a permanência da rádio durante a navegação. O código aceita confirmação do Google vinculada ao identificador aleatório do envio e só confirma ao leitor após gravação.

O acesso ao Gmail pelo ChatGPT é distinto da autorização do Apps Script. O conector disponível confirma a conta, mas não cria nem implanta projetos Apps Script. O proprietário já executou a configuração e disponibilizou o endereço /exec usado nesta branch.

## Moderação

A aba **Moderação** recebe ID, data, URL da matéria, apelido, comentário, estado e situação do aviso. O estado inicial é **PENDENTE**. Mr. Nomad muda para **APROVADO** ou **REJEITADO**. Nesta Etapa 1, APROVADO disponibiliza automaticamente apelido, comentário integral e data na matéria correspondente do Blog. PENDENTE e REJEITADO não entram na resposta pública. A alteração de APROVADO para REJEITADO retira o comentário na próxima leitura. A página consulta a cada 30 segundos enquanto aberta e ao voltar à aba. Não é necessário rebuild ou nova ação da Work para cada aprovação.

O aviso leva apenas a URL e o ID. Se a cota de e-mail acabar ou o aviso falhar, a linha fica na planilha com a situação correspondente. Os textos de visitantes entram como texto literal na planilha. Não há campo de e-mail ou registro de IP no código. A planilha permanece privada. O Apps Script retorna apenas ID, apelido, texto e data de linhas APROVADO da URL solicitada; não retorna colunas de moderação, Gmail ou identificação da planilha.

## Testes locais

```sh
node --test integrations/blog-comments/receiver.test.cjs integrations/blog-comments/approved.test.cjs
COMMENTS_CHROME=/caminho/do/chrome node integrations/blog-comments/browser.cjs
```

Os testes simulam os serviços Google. O teste de navegador usa Playwright com Chromium e verifica os dois caminhos de artigo, o envio sem abrir outra página e a confirmação. A preservação do elemento de áudio foi verificada no teste isolado. O teste real está registrado abaixo.

## Aceite em 04/11/2026

Chromium sem sessão Google, usando a página pública com os quatro recursos da PR substituídos apenas no navegador de teste. O formulário enviou ao Apps Script real. A primeira espera de 20 segundos expirou, embora a linha e a mensagem tivessem sido gravadas. A repetição com o mesmo ID e espera de 60 segundos exibiu **Comentário recebido para moderação**. A alteração de tempo de espera foi incorporada à branch.

- ID técnico: `f7d39d8a-f4da-42b1-b38d-d140dc773005`. A linha consultada no Sheets está **PENDENTE**, com aviso **ENVIADO**. O Gmail da Passport recebeu a notificação com o mesmo ID. O comentário está identificado como teste e não deve ser publicado.
- Hits em Home → Blog → matéria de Kurt Cobain → envio → Home. Mesmo documento, mesmo elemento de áudio, mesma fonte, volume 0,8 e apenas um áudio ativo. Tempo de reprodução avançou de 1,02 s para 23,69 s na repetição com confirmação.
- Testes locais do receptor e Chromium com resposta simulada passaram após configurar o endereço. Os testes simulados substituem o destino para evitar gravações reais.

## Ativação da leitura automática — Etapa 1

O /exec existente foi consultado em 05/11/2026 e respondeu **Script function not found: doGet**. O recebimento existente não prova disponibilidade da leitura.

No projeto Apps Script já associado à planilha, atualizar Code.gs com a versão desta PR e salvar. Em **Implantar → Gerenciar implantações → Editar**, selecionar **Nova versão** para a implantação existente e atualizar, preservando o mesmo /exec, a propriedade COMMENTS_SHEET_ID, a conta executora e o acesso anônimo já configurados. Não executar prepararPlanilha novamente, não criar outra planilha e não publicar a planilha.

Após essa atualização, a consulta anônima /exec?article=/blog/w/000001-led-zeppelin.html deve retornar JSON com type passport-approved-comments. A resposta com callback é JSONP, permitindo leitura no Firefox e outros navegadores sem expor a planilha ou depender de CORS. Callbacks e caminhos aceitos são restritos; texto é escapado na resposta e exibido por textContent.

Validar com linhas de teste identificadas: PENDENTE não aparece; APROVADO aparece somente na matéria da URL registrada, com apelido, texto integral e data; REJEITADO desaparece na próxima atualização. Esta mudança não altera doPost, confirmação, prevenção de duplicação ou notificações.
