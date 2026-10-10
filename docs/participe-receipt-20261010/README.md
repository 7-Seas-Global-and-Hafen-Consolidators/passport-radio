# Participe — recebimento e avisos à redação

Base: main `50e1e548e47e79fd0dbcc511dfde845774403b9d`. PR #541, sem merge.

## Produção

A causa raiz era a fila sem consumidor: o gatilho gravava o aviso, mas nenhum serviço o entregava. A confirmação no navegador substituía a mensagem por `Recebido.`.

A migration `participe_notification_delivery` foi aplicada e a Edge Function `participe-notifications` v1 implantada. Cron privado `participe-notifications` ativo a cada minuto. Autenticação por token aleatório em Vault, validado via RPC exclusiva de service_role. Fila e RPCs continuam inacessíveis a anon/authenticated; não há endpoint público de moderação.

Execução real: **HTTP 503**, `missing_email_configuration`, faltam os secrets da Edge Function:

- `RESEND_API_KEY`: chave Resend com permissão de envio e consulta de e-mails.
- `PASSPORT_EDITORIAL_MAIL_FROM`: remetente autorizado em domínio verificado no Resend.

Nenhum serviço pago contratado; nenhuma chave registrada em código, logs ou documentação. Supabase Auth não é o provedor dos avisos editoriais.

Bee Gees `28ca543d-b917-4516-9763-fc9111f30a5b`: **pending**, `provider_id=null`, `attempts=0`. Nenhuma submissão nova; nenhum e-mail enviado. O worker verifica configuração antes de consumir a fila. Assim que os dois secrets forem configurados, o cron processará a fila existente sem reenvio do formulário.

## Entrega segura

Lote máximo 5, lock `FOR UPDATE SKIP LOCKED`, lease 2 minutos, claim UUID, backoff até uma hora. Destinatário fixo `passportradio.online@gmail.com`. Corpo em texto puro com tipo, título, pseudônimo, data, ID e painel administrativo existente que exige login/MFA. Sem texto integral, anexos ou e-mail privado do participante.

Idempotency-Key estável por submission_id. ID aceito pelo Resend é persistido antes de consultar o estado. **Aceitação não é entrega**: `sent` somente após `delivered`, `opened` ou `clicked` confirmado pelo provedor. Bounce/failed/canceled geram falha. Erros transitórios ficam pending. Pedido ambíguo sem ID após 23h exige reconciliação, sem novo envio fora da janela de idempotência de 24h. Isso prioriza ausência de duplicatas; exatamente uma entrega não pode ser garantida sem confirmação do provedor.

Estado do aviso é sincronizado com notification_status da submissão, sem modificar seu status editorial `recebida`. Aprovação continua manual. Auth, função blog-aberto, uploads e filtros não foram alterados.

## Confirmação e evidências

Mensagem integral do proprietário em painel branco/preto/vermelho, foco e scroll após resposta de gravação do servidor. Campos limpos sem apagar o painel. Cliques concorrentes bloqueados. Erro não exibe agradecimento. O frontend depende do merge/deploy desta PR.

6 testes focados do worker aprovados: configuração ausente, aceitação sem entrega, confirmação por consulta sem reenvio, bounce, janela de idempotência expirada e rate limit. Teste transacional de claims em produção retornou zero no segundo claim e foi revertido integralmente. Permissões privadas confirmadas.

Capturas e BROWSER-VALIDATION.json: navegador real, 1440 e 390 pixels, resposta de Auth e gravação simuladas; nenhuma nova conta, material ou e-mail real criado. Cadastro, confirmação e login reais já foram comprovados pelo proprietário e não foram repetidos.

Documentação do provedor: https://resend.com/docs/api-reference/emails/send-email e https://resend.com/docs/api-reference/emails/retrieve-email .
