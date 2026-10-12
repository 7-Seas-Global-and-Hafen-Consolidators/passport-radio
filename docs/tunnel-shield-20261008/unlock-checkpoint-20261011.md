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
