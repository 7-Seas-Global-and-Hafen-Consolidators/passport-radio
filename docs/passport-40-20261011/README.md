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
