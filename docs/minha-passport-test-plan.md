# Verificação Minha Passport

- usuário sem sessão: login visível
- cadastro: mensagem de confirmação permanece visível
- confirmação: retorna para `minha-passport.html?welcome=1`
- usuário com sessão: painel abre sem novo login
- perfil: `profiles.display_name`
- favoritos: consulta `favorites` por `user_id`
- votos: consulta `votes` por `user_id`
- vazio: texto útil, nunca `Em breve aqui.`
- recuperação: `?recovery=1` abre formulário de nova senha
- logout: encerra sessão e volta ao login
