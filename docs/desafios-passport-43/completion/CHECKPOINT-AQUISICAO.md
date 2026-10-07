# Aquisição e deduplicação — checkpoint corrigido

Branch: `feat/desafios-passport-43-20261007`. Base: `8122e83318423a922ddf5b7b5d06e7cf3fb8fa1c`.

A ordem corrigida foi lida integralmente. Todos os bytes dos quatro packs source-correct foram lidos; todos os objetos WP Quiz e todos os payloads Nuxt inline foram decodificados. O parser busca múltiplos jogos dentro de cada dump. Os dumps antigos são apenas uma fonte suplementar de payloads válidos; suas matérias editoriais não são jogos.

Deduplicação: ID nativo, título/path, IDs das perguntas e URL/associação de assets. pack-01 contém seis jogos, não um. Os demais packs contêm múltiplas páginas Nuxt, com duas páginas repetidas. Os teasers de notícias, streams e navegação foram excluídos do corpus de quizzes. Fontes, tamanhos e SHA-256 em source-audit.json.

43 posições inventariadas antes da implementação: 11 payloads nativos recuperados, 186 perguntas; 24 identidades/mecânicas parciais e oito posições cuja identidade individual não foi enumerada no checkpoint. As lacunas estão identificadas em INVENTARIO-43.md; nenhuma pergunta, resposta ou peso será inventado. A implementação seguirá com os dados comprovados e os itens fonte-parcial declarados, sem reduzir silenciosamente a contagem-alvo.

Assets serão baixados somente dos URLs associados às perguntas/resultados recuperados. Nenhuma página/quiz nova foi consultada externamente. O checkpoint assets.json é salvo após cada arquivo efetivamente gravado. Tiles de marca RADIO BOB são registrados como resultado original, mas não copiados para a experiência Passport.

Antes de alterar runtime: inventário, mapa de assets e este checkpoint serão persistidos na branch. Próxima etapa: motor compartilhado, dados PT-BR e migração funcional dos três mosaicos existentes. Continuidade, player e infraestrutura de rádio permanecem intocados.
