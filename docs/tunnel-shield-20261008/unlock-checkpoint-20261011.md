# Destravamento do cofre — 11/10/2026

Estado: IMPLEMENTAÇÃO PREPARADA; autenticação de máquina PENDENTE DE CONFIGURAÇÃO ADMINISTRATIVA. Sem merge.

## Estado inicial e continuidade

- Main de partida: `117eecf9e9a2d759a92d5f5c0d68aebf6b893502`.
- Branch única: `fix/vault-unlock-20261011`; buscas por cofre, vault e destravamento não localizaram correção equivalente. As branches de arquivo/triagem encontradas têm outro escopo.
- Checkpoint original `docs/tunnel-shield-20261008/checkpoint.md` lido e preservado.
- #526 efetivamente mergeada em 08/10/2026 19:44:40 UTC; merge `b82a93a0b1a723dbe1b9f3b187db71e97c1a58e4`. O texto original descreve uma proposta anterior ao merge.
- Ambos os repositórios acessíveis pelo conector; metadados confirmam público `passport-radio` e privado `passport-radio-internal`.
- O acesso do conector NÃO é autenticação disponível no runner. Instalação do conector encontrada; nenhuma chave dela foi solicitada, extraída ou reutilizada.
- Nenhum inventário, preservação dos 93 arquivos, varredura histórica ou teste anterior foi repetido.

## Evidências disponíveis

Horários abaixo em UTC. URLs usam o repositório público.

| Execução / workflow | Job / etapa | Resultado e evidência |
| --- | --- | --- |
| [35478536578](https://github.com/7-Seas-Global-and-Hafen-Consolidators/passport-radio/actions/runs/35478536578), 20/09 00:20:57, Passport Global Blog Tunnel™ (`editorial-blog-tunnel.yml`) | Job 105991964550, Discover entire sources · generate a cap into the Blog; etapa Commit Blog queue / sample (never merge) | Falha: `GH013: Repository rule violations found for refs/heads/main`; `Changes must be made through a pull request`; push recusado; saída 1 às 00:24:17. O log registra 215 itens de metal-hammer.de e alteração da fila dessa fonte; descoberta havia passado. |
| [35480698279](https://github.com/7-Seas-Global-and-Hafen-Consolidators/passport-radio/actions/runs/35480698279), 20/09 01:10:28, Passport Editorial Tunnel Global — 1200 (`editorial-tunnel.yml`) | Job 105997840292, Excavate worldwide editorial signals; etapa Run Worldwide Editorial Graph Tunnel | Cancelado. Job 01:10:31–01:55:46; log às 01:55:44: `The operation was canceled.` Duração compatível com timeout de 45 minutos é INFERÊNCIA; o log consultado não identifica quem cancelou nem erro individual de fonte. |
| [35409092211](https://github.com/7-Seas-Global-and-Hafen-Consolidators/passport-radio/actions/runs/35409092211), 19/09 00:21:45, Passport Editorial Tunnel Global — 1200 | Job 105804881569; Run Worldwide Editorial Graph Tunnel | Sucesso; log: 164 fontes, 144 saudáveis, 1172 selecionados. Esses números são evidência histórica, não uma nova aquisição. Consulta de artefatos retorna lista vazia; saúde individual não recuperável por esse pacote expirado. |

Consultadas execuções recentes do repositório, falhas da main e execuções por evento schedule/workflow_dispatch/push. Endpoints específicos `actions/workflows/.../runs` foram recusados pelo conector (HTTP 400, endpoint não permitido); utilizada coleção `actions/runs` com filtros. A amostra recente consultada não contém novas falhas editoriais relacionadas às três fontes. Não se afirma ausência universal de execuções não consultadas.

**Metal Hammer:** a falha comprovada é de publicação do antigo Blog Tunnel, categoria configuração/proteção do GitHub, não autenticação do cofre ou aquisição demonstradamente quebrada. Louder não tem falha individual identificada nos logs consultados. Não foi aplicado ajuste especulativo de RSS, URL, timeout ou crawler.

**TMDQA:** configurado como Tenho Mais Discos Que Amigos / tenhomaisdiscosqueamigos.com. Nenhum erro individual demonstrável localizado nos logs consultados. Causa específica DESCONHECIDA; nenhuma correção de fonte inventada. TMDQA não foi tratado como Whiplash.

**Ligação causal:** falha GH013 e cancelamento são anteriores à #526. Na main atual, o Blog Tunnel já é aviso manual aposentado sem aquisição/publicação. Não reativado ou modificado. Não há evidência de falha causada pelo cofre.

## Dependência e implementação

Os workflows existentes ainda usam os motores públicos. O checkpoint anterior registra que nenhum dos 29 caminhos retirados era dependência de execução. A leitura dirigida dos workflows editorial-tunnel, editorial-engine e editorial-global-validation e dos launchers confirma uso de caminhos públicos; não se criou dependência privada obrigatória nem se removeu motor público.

Adicionado somente `.github/workflows/passport-vault-read.yml`: verificação manual, sem checkout, com GITHUB_TOKEN sem permissões e execução restrita à main. GitHub App gera token restrito a `passport-radio-internal` e Contents: read; revogação no pós-job habilitada. O token expira em uma hora segundo a documentação oficial. Nenhum PAT estático ou credencial de rádio/comercial é usado.

Consulta apenas metadados de privacidade e o arquivo operacional preservado `vault/tools/editorial_tunnel_graph.py`, fixado no commit privado `556a29885d4caec4cf1baff4b0811838486044d7`, blob `8dc7f811a0a07c37aed0b28ce90d4ad2c7604ce8`. Hash do blob coincide com o motor público observado. Validação em memória; nenhum arquivo privado é escrito, importado, executado, enviado a artifacts ou impresso. Redirects de rede recusados; erros exibem apenas status HTTP ou mensagem constante.

Limite técnico explícito: Contents: read é permissão do repositório, não ACL por arquivo. A requisição fica limitada ao único caminho fixo no workflow; essa limitação de código não é apresentada como restrição de autorização por caminho. Nenhuma credencial com permissão adicional é necessária. O workflow prepara e verifica a fronteira autenticada; NÃO certifica migração dos motores ou uso privado pela aquisição existente.

Referências técnicas: [token de instalação](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-an-installation-access-token-for-a-github-app), [Contents API](https://docs.github.com/en/rest/repos/contents), [action fixada e inspecionada](https://github.com/actions/create-github-app-token/tree/bcd2ba49218906704ab6c1aa796996da409d3eb1).

## Única etapa administrativa pendente

Disponibilizar uma credencial de GitHub App dedicada ao cofre (existente sob controle do proprietário, ou criar/instalar se não existir), instalada SOMENTE em `passport-radio-internal`, Contents: read e Metadata: read implícito, sem demais permissões, webhooks ou acesso comercial. No ambiente `passport-vault-read` do repositório público, configurar variável `PASSPORT_VAULT_APP_CLIENT_ID` e secret `PASSPORT_VAULT_APP_PRIVATE_KEY`; restringir o ambiente à main. Não enviar a chave em conversa, código ou relatório.

As ferramentas disponíveis não oferecem criação/configuração desses segredos ou da App. A existência de segredos não pôde ser inspecionada; não se afirma que estejam ausentes.

Após revisão e eventual merge realizado EXCLUSIVAMENTE pelo proprietário, executar manualmente Passport vault authenticated read verification na main. Esse teste lê apenas o GitHub; não adquire fontes nem publica matérias. Falha deve permanecer falha; registrar URL e resultado real no checkpoint. Até isso ocorrer: autenticação real, permissão efetiva do token e localização da dependência pelo runner = PENDENTES. Nenhuma execução artificial foi criada.

## Testes novos executados

- YAML e sintaxe Python embutida: PASS.
- Contrato de gatilho exclusivamente manual/main, ambiente dedicado, ausência de checkout/upload e escopo de token: PASS.
- Fixture do blob já público: sucesso com hash exato; rejeição de repositório público, caminho divergente, SHA divergente, bytes adulterados e base64 inválido: PASS.
- Recusa de redirects, limite de duas consultas fixas, saída sem conteúdo/token e rejeição de credencial ausente: PASS.
- Autenticação real no Actions: PENDENTE DE CONFIGURAÇÃO ADMINISTRATIVA, não executada.
- Nenhum teste histórico, suíte geral, aquisição, publicação ou processamento de acervo executado.

## Alterações e preservação

Arquivos da PR: `.github/workflows/passport-vault-read.yml` e este checkpoint. Todos os arquivos preexistentes preservados. Zero escrita no cofre privado. Engine, túnel, validação global, filas, deduplicação, limites, acervo, cron/heartbeat e gatilhos preexistentes inalterados; schedule do editorial-engine continua desabilitado. Rádios, player, Bus, mutex/interlock, Podcast, Broadcast, vídeos, Clips TV, loja, pagamentos e páginas públicas intocados.

Cofre permanece privado no estado inicial verificado; esta implementação não altera visibilidade. Nenhuma credencial foi obtida ou gravada. Uma branch, uma PR; sem merge, force-push ou alteração de proteções.

## Publicação incremental — diagnóstico dirigido de 12/10/2026

Esta seção atualiza a conclusão anterior sobre disponibilidade de erros específicos: a execução relevante está no repositório PRIVADO, não no histórico do publicador público aposentado.

- Execução [38180198221](https://github.com/7-Seas-Global-and-Hafen-Consolidators/passport-radio-internal/actions/runs/38180198221), job 114590930110, etapa Publicação incremental recorrente — até cinco por ciclo; 11/10/2026 22:23:11 UTC.
- Traceback exato: automatic_tunnel.publish_persisted → approved_release.publish → finish_public_pr → open_or_reuse_pr → GitHub.call.
- Operação negada: `POST https://api.github.com/repos/7-Seas-Global-and-Hafen-Consolidators/passport-radio/pulls`, em `radar/approved_release.py`, linha 131 no log. NÃO é o GET de busca/reutilização de PR. Resposta: `403 Resource not accessible by personal access token`.
- Autenticação: `secrets.PASSPORT_APPROVED_PUBLISH_TOKEN` do workflow privado `editorial-two-sources.yml`, passado à variável homônima e enviado como Bearer por requests.Session. Nenhum valor foi solicitado, exposto ou substituído. Esse caminho não emite token de GitHub App e não usa o GITHUB_TOKEN para essa chamada.
- Repositório-alvo no código confirmado correto. Leitura anterior de refs e consultas de PR não comprova seleção/aprovação do repositório no PAT: recursos públicos podem ser legíveis sem essa autorização.
- Causa comprovada: o PAT não recebeu autorização efetiva para CRIAR PR nesse repositório. O campo administrativo exato responsável (Pull requests sem write, repository selection ou aprovação/política da organização) NÃO pôde ser consultado. Não se apresenta uma dessas hipóteses como fato.
- A API oficial exige Pull requests: write para criar e atualizar PRs: https://docs.github.com/en/rest/pulls/pulls#create-a-pull-request.
- Correção administrativa exata pendente: o administrador deve identificar, em sua própria gestão de tokens, o PAT que abastece PASSPORT_APPROVED_PUBLISH_TOKEN; conferir resource owner `7-Seas-Global-and-Hafen-Consolidators`, seleção do repositório `passport-radio`, Repository permissions → Pull requests → Read and write e aprovação efetiva da organização. Ajustar SOMENTE o campo divergente comprovado. Se o PAT for substituído, atualizar o secret de mesmo nome no cofre, sem publicar seu valor. Preservar permissões existentes necessárias e não conceder acesso a outros repositórios. Não há instalação de App a autorizar nesse caminho atual.
- As ferramentas disponíveis não expõem inspeção/alteração dessa configuração de PAT ou dos segredos. A etapa administrativa foi parada, conforme a ordem do proprietário. Alterar `permissions:` no YAML ou o App de leitura do cofre da #549 não altera os privilégios desse PAT; nenhum ajuste ineficaz foi aplicado.
- Teste controlado: NÃO EXECUTADO / PENDENTE DA CONFIGURAÇÃO ADMINISTRATIVA. O conector tem outra autenticação; usá-lo como teste do PAT do publicador seria evidência falsa. Nenhum workflow, publicação, aquisição, reprocessamento ou PR de publicação foi disparado.
- Próximo teste único após a correção: usar a MESMA credencial do publicador em uma atualização sem mudança de título de uma PR de trabalho existente e aberta (a #549, se ainda aberta), via PATCH /pulls/549. Isso verifica a autorização de escrita em PRs, exigida também pelo POST, sem criar PR, fazer merge ou chamar o publicador. Não declarar que a criação POST foi executada: ela não possui dry-run documentado. O teste deve registrar apenas endpoint/status, sem cabeçalhos de autenticação, payload privado ou segredo. A eventual retomada/publicação não faz parte desse teste.
- Arquivo alterado nesta continuação: somente este checkpoint na branch já existente `fix/vault-unlock-20261011`; PR #549 atualizada, nenhuma nova PR. Pacote aprovado, SHA-256, preflight READY, privacidade, cron, proteções, motores e todos os sistemas protegidos preservados.

## Token atualizado pelo proprietário — 11/10/2026 22:42 BRT

- Fato novo aceito: proprietário atualizou Passport Radio Publisher, incluindo Pull requests: Read and write e Contents: Read and write e acesso aos repositórios da organização. A ausência anterior dessas permissões não foi investigada novamente.
- Conferência única do workflow privado: PASSPORT_APPROVED_PUBLISH_TOKEN continua referenciando secrets.PASSPORT_APPROVED_PUBLISH_TOKEN. O nome de exibição do PAT não é fornecido ao workflow; a correspondência com Passport Radio Publisher não pôde ser certificada pela referência do secret. Nenhuma divergência de valor foi demonstrada e nenhum segredo foi solicitado ou lido.
- TESTE: BLOQUEADO ANTES DA EXECUÇÃO. As ferramentas disponíveis não oferecem execução isolada no runner com esse secret. Só oferecem reexecução do job completo; o job chama --publish-pending/--automatic e não isola o POST /pulls do restante do publicador, que também contém merge. Reexecutá-lo excederia a autorização desta ordem. Nenhuma reexecução feita.
- ERRO 403: NÃO REAVALIADO após a atualização administrativa; não declarado resolvido nem persistente sem nova resposta da API.
- PUBLICAÇÃO: desbloqueio ainda NÃO CERTIFICADO.
- Pendência exata: disponibilizar um caminho de teste isolado dentro do runner privado que use o secret já configurado e faça somente a operação de PR autorizada, com pacote persistido aprovado e sem geração, coleta, publicação ou merge. A #549 permanece exclusivamente PR de manutenção e NÃO será usada como PR editorial ou alvo do teste. O plano anterior de testar atualizando o título da #549 fica substituído por esta ordem.
- Somente este checkpoint atualizado na branch existente; sem nova branch/PR, alteração de workflow, cron, permissões ou proteções. Uma verificação de referência; zero testes de execução e zero operações de publicação.
