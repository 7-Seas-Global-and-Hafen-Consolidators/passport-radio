# Segurança

O navegador usa apenas a publishable key já pública do projeto Supabase. Nenhuma `service_role` é incluída. As leituras de perfil, favoritos e votos são limitadas pelo `user.id` autenticado e dependem das políticas RLS existentes.
