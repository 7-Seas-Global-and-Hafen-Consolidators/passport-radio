# Passport — 39 rádios + Clips TV

Base real: `391191cab504ea070ce2d65513d04c71e4ddb14f`.

- Antes: 112 rádios lineares, mais 11 seletores existentes de programas/projetos (9 Novelas, Live & Rare e Globo de Ouro).
- Depois: 151 rádios lineares (112 + 39), os mesmos 11 seletores e uma TV, contabilizada separadamente.
- `before.json`: inventário anterior completo, seleção family/index, IDs existentes quando disponíveis, streams, categorias, motores, rotas, Bus, continuidade e hashes. Nos motores sem IDs individuais, `family:index` identifica o seletor existente; não inventa um ID de emissora.
- `approved-additions.json`: batismos, portas e origens técnicas aprovadas; nenhuma colisão com o catálogo anterior.
- `data/passport-radio-inventory.json`: catálogo de apresentação completo; todos os cartões usam `PassportAudioRuntime.engine.select`.

## Limites preservados

Bus, interlock, runtime compilado, player universal, motores especializados, continuidade, vídeos, podcasts e broadcasts permanecem byte a byte iguais. A única intervenção no arquivo do World player é acrescentar 39 registros à lista de estações: nenhuma linha da implementação do transporte foi alterada. Os 24 registros World anteriores mantêm conteúdo e ordem; seus índices de continuidade permanecem iguais. Os novos registros usam o transporte World existente e aparecem nas famílias musicais correspondentes na Home.

A Home oculta apenas a antiga apresentação por portas/categorias, após o catálogo completo carregar com sucesso. O editorial original e seus scripts permanecem intactos. Todos os registros ficam visíveis; o catálogo contém 162 controles, dos quais 151 são rádios e 11 programas/projetos. As duas emissoras antigas chamadas Metal são preservadas com seletores distintos; nenhum nome novo colide com um antigo.

A TV usa a transmissão HLS recuperada da investigação anterior e a mesma versão de hls.js já utilizada pelo projeto. Ela registra um peer controlável no Bus existente, sem alterar esse Bus. O iframe externo foi dispensado porque não fornece o contrato de pausa necessário ao interlock e exibiria identidade externa. Fonte e origem não são exibidas na fachada. Não há autoplay.

A continuidade real permanece dentro das rotas suportadas pelo mecanismo existente. Recargas, novas abas e navegação fora dessas rotas continuam com as limitações arquiteturais anteriores; esta operação não promete continuidade universal.

## Verificação

`node --test tests/passport_40_inventory.test.cjs`: preservação exata do inventário anterior, 39 novos mapeamentos, IDs, streams e nomes novos únicos, hashes protegidos e corpo do transporte World idêntico.

Workflow `Passport 40 — inventory and browser evidence`: Chrome hospedado, seleção dos 39 canais, cinco larguras, rádio real, player universal, continuidade editorial, TV HLS real e interlock. O teste de seleção aborta apenas requisições upstream durante a comparação das 39 URLs, evitando repetir a aquisição; reprodução real é verificada separadamente. Capturas e resultado JSON ficam no artifact `passport-40-browser-evidence`.

Nenhum merge ou publicação no domínio público é executado.

## Evidências finais

- 3 testes de inventário aprovados. Chrome: 7 verificações aprovadas no [run 38107328440](https://github.com/7-Seas-Global-and-Hafen-Consolidators/passport-radio/actions/runs/38107328440), incluindo 39 seleções, cinco larguras, continuidade real e TV real.
- A etapa restante de rádio real passou isoladamente no [run 38107573722](https://github.com/7-Seas-Global-and-Hafen-Consolidators/passport-radio/actions/runs/38107573722): Flash House Classics tocou, pausou/retomou, manteve volume 0,4 e respondeu a anterior/próxima. Os abortos registrados durante a troca explícita de canal são cancelamentos esperados.
- O código da aplicação é idêntico nos dois runs; somente o isolamento dos testes mudou. A verificação isolada evita repetir os sete casos aprovados. Nesta branch o workflow conserva esse foco; em outras branches executa a suíte completa.
- Fullscreen: capacidade do controle nativo verificada; transição de tela cheia não exercitada. Os 39 mapeamentos foram verificados por seleção real e requisição, sem alegar 39 decodificações independentes em Chrome.
- Capturas desktop e celular e JSON verificáveis nos artifacts dos runs. Build aprovado no SHA `771a218460ef4cb4f089b9d0444ab4ea70f28ccf`.
- Preview: https://passport-40-preview-20261011.mr-nomad.chatgpt.site e `/videos.html#passport-clips-tv`.
