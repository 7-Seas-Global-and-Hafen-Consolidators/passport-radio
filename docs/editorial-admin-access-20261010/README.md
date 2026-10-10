# Recuperação de acesso ao painel editorial

## Diagnóstico comprovado

Produção `/privado/blog-aberto.html` HTTP 200: oferece somente `signInWithPassword`, não restaura a fila com sessão existente, não escuta mudanças de sessão e não protege inicialização contra SDK ausente. As mensagens ficam dentro do formulário de senha, que é ocultado quando a fila abre, escondendo erros posteriores. Login e chamadas de rede não têm tratamento completo de exceções. Isso impede recuperação sem senha e permite falhas silenciosas. A causa específica observada no navegador do proprietário não foi capturada; não se inventa erro de console.

`blog-aberto` produção v6 inspecionada: valida JWT em `/auth/v1/user`, exige UUID igual ao secret `BLOG_ABERTO_ADMIN_USER_ID` e AAL2 quando existem fatores verificados. Secret administrativo presente (token inválido retorna `Sessão recusada.`, não `Identidade administrativa não configurada.`). O valor do secret não foi exposto nem modificado; sua correspondência com a conta do proprietário depende da autenticação real. Conta do e-mail administrativo existente e confirmada; nenhum fator MFA cadastrado nessa conta. SELECT da fila não é concedido a authenticated.

## Correção

Somente o painel: SDK fixado em 2.57.4; script externo; mensagens visíveis, aria-live, prevenção de cliques concorrentes e restauração automática de sessão. Login por link Supabase (`shouldCreateUser:false`) e suporte a código OTP caso o template de e-mail use código. Retorno usa a página Minha Passport já existente, com returnTo exclusivo para o painel. Não se altera Minha Passport, Auth, segredo administrativo ou RLS. O endereço digitado solicita autenticação; nunca concede autorização administrativa. `admin-session` precisa autorizar antes de `admin-list` abrir a fila. Segundo fator continua obrigatório quando cadastrado. Fila integral, anexos privados e ações manuais existentes preservados. Saída/401/403 escondem fila e limpam sua apresentação. O status agora fica fora dos formulários, continuando visível após login e falhas de ações.

## Pedido real de acesso

Um pedido de link foi enviado ao Supabase Auth para o e-mail administrativo autorizado. Resposta **HTTP 200, {}**. Isso comprova aceitação do pedido, não entrega de e-mail nem login do proprietário. Nenhum token de acesso foi lido, impresso, persistido no repositório ou usado para simular o proprietário. Links Supabase são temporários e de uso único.

## Procedimento

Após merge/deploy autorizado, abrir https://passportradio.online/privado/blog-aberto.html e clicar ENVIAR LINK DE ACESSO. Abrir o link recebido no e-mail administrativo: a página Minha Passport recebe a sessão e devolve ao painel. Se o e-mail trouxer código, preencher Confirmar código. A fila abre após `admin-session` confirmar a identidade configurada; ler/analisar/aprovar/rejeitar continuam ações manuais. Nenhuma senha nova é exigida pelo caminho de link/código.

**Pendências reais:** frontend depende do merge/deploy pelo proprietário. A leitura real da fila como proprietário só pode ser comprovada depois que ele consumir o link/código. Não se declarou acesso concluído antes disso. Se a sessão real receber `Esta sessão não autoriza o painel.`, o UUID configurado não corresponde à conta e será necessário corrigir esse secret; essa divergência não foi comprovada nem presumida.

## Testes

7 testes focados do handler: sessão restaurada carrega conteúdo integral dos três tipos; não administrador barrado; OTP não cria usuário e preserva retorno; OTP consulta autorização antes da fila; SDK/rede mostram erro; MFA permanece exigido. Respostas simuladas, nenhum material real criado/aprovado/rejeitado. HTTP real admin-list: anônimo 401, token inválido 403. Banco real: Bee Gees e QUALQUER COISA preservadas como recebida. Auth signup, Resend, cron, notificações, formulário público, players e rádios não foram alterados ou reexecutados.

Referência: https://supabase.com/docs/guides/auth/auth-email-passwordless
