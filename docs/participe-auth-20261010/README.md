# Participe e Minha Passport — evidências e implantação

Base: `2ed6442f47c3621588c5a38e29325680c783c18d`. PR única #540. Nenhum merge.

## Implementado

Participe incorpora os formulários da Minha Passport e o cliente Supabase existente. Entrar mantém o visitante na página; confirmação e recuperação usam a rota antiga e conservam `returnTo=/divulgar-bandas.html#manda`. Cadastro, mostrar senha, login, recuperação, logout e retorno continuam disponíveis. CSS branco/preto/vermelho com Bodoni Moda, Instrument Sans e Source Serif 4, sem regras globais que mudem Participe ou seu rodapé.

Os três tipos (`materia`, `banda`, `programa`) usam a mesma tabela privada. O servidor consulta `/auth/v1/user` com o JWT recebido, exige conta confirmada não anônima e usa o id/e-mail retornados pelo Auth. Não confia em email, user_id ou status enviados pelo navegador. Links são HTTPS validados; imagens/PDF mantêm o bucket privado existente, limite de 2 MB e verificação de assinatura/conteúdo ativo. Áudio/vídeo usam links, sem upload fictício. Aceite de autoria/direitos obrigatório.

Filtros existentes reforçados com normalização Unicode, controles de documentos, discriminação/ameaças e injeção. São barreiras preventivas, não certificação semântica de direitos autorais: o proprietário continua revisando integralmente. A aprovação repete os filtros. Comentários públicos aprovados e canais de contato/correção/denúncia mantidos.

O painel mostra texto, tipo, referências, links oficiais, anexo por URL privada de cinco minutos, motivo de rejeição e estado técnico. Somente a identidade administrativa configurada é autorizada; fatores verificados do próprio Auth exigem `aal2` quando existentes. Usuários comuns não leem nem alteram a fila por REST. Aprovação abre/reutiliza PR técnica; exige check `build`, consulta se houve merge e confere URL. A Edge Function não faz merge.

## Implantação real no Supabase

Migração aditiva aplicada ao projeto existente, preservando usuários, registros e RLS. Função `blog-aberto` versão 4 implantada. `verify_jwt=false` permanece apenas para os endpoints públicos existentes; `submit` valida JWT por Auth e todos os `admin-*` conservam autorização do proprietário. Não existe service_role no navegador.

`INTEGRATION.json`: HTTP 401 reais para submissão anônima/token inválido; HTTP 401/403 reais para administração sem sessão válida. Controles públicos HTTP 200. Cadastro habilitado, email habilitado e confirmação exigida. Teste transacional real gravou uma submissão privada ligada a conta confirmada existente e um aviso na outbox, depois fez rollback: zero registros de teste persistidos e zero e-mails enviados.

18 testes de servidor em `tests/participe_authenticated.test.cjs` usam Auth/store/GitHub isolados e comprovam os três tipos, conta/token inválidos, filtros, direitos, usuário comum recusado, MFA e aprovação/rejeição sem merge. Testes de navegador e capturas representam o HTML da branch renderizado em Chromium real, com Auth/endpoint simulados declaradamente; não comprovam entrega de e-mail ou login de conta real.

## Pendências externas exatas

1. Merge autorizado da PR #540 para publicar os formulários e o CSS. O backend já exige conta; até o merge o formulário antigo não aceita envio anônimo.
2. Fornecer um serviço de envio administrativo já autorizado e sua credencial por secret servidor para entregar os avisos a `passportradio.online@gmail.com`. A outbox privada guarda exclusivamente id, tipo, título filtrado, data e link do painel; `pending` não significa enviado. Não foi escolhido/contratado fornecedor, inventada chave nem usado recovery/signup como notificação.
3. Confirmar o callback da rota antiga na allowlist Auth e fazer um teste ponta a ponta com caixa de e-mail controlada e sessões legítimas de participante/proprietário (incluindo MFA). As ferramentas disponíveis não fornecem essas sessões nem acesso à configuração Auth/SMTP/secrets. Não houve impersonação, alteração de usuários ou bypass de confirmação.

## Preservação

Imagem Mike Marrs, manchete, header/nav, apoio e footer de Participe preservados byte a byte (teste de navegador). Scripts de Participe, rodapé universal, pagamentos, mídias, rádios/players/interlock, Home, Notícias, Loja, diretório e túneis não alterados. Nenhuma matéria pública de teste.
