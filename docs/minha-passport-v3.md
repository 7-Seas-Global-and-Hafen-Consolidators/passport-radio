# Minha Passport v3

Fluxo: entrar/criar conta -> confirmação por e-mail -> Minha Passport autenticada -> perfil -> favoritos/votos reais -> recuperação de senha -> sair.

A página permanece `minha-passport.html`; não há migração desnecessária para `/conta/`.

Dados de membro são lidos via RLS das tabelas `profiles`, `favorites` e `votes` para o `user.id` autenticado.
