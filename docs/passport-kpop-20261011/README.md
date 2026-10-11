# PR #545 — 177 rádios cadastradas

Branch: `feat/passport-kpop-26-20261011`. Retomada do SHA `fa8900d15c79a6d4bdc1e00e6c7c3ae0a840aaf5`; implementação salva em `1d72a77c6d3e1b57488bee6ea34eb2806a9fe813`. Sem merge.

## Estado real

154 rádios anteriormente comprovadas preservadas por ID, nome, stream e índice. Foram acrescentados os 23 registros coreanos: total 177 rádios e 11 seletores de projetos, 188 cartões. A família K-POP & MÚSICA COREANA está imediatamente após POP, DÉCADAS & NOSTALGIA, na ordem aprovada e com as mesmas classes/CSS.

O patch MSE está ativo somente para os 23 registros novos; usa HLS.js já existente, o mesmo elemento de áudio e o mesmo caminho do player universal. K-Pop Hits usa `/v3/streams/public/manifest.m3u8`, conforme o player original. Nenhum stream antigo, Bus, mutex, player universal, continuidade, CSS, Home editorial ou TV foi alterado.

**23/23 reproduziram no serviço original em Cloud Chrome, por cliques reais e observações HTMLMediaElement (readyState 4). Isso não comprova reprodução na Passport. Reprodução dos 23 na Passport: NÃO COMPROVADA.** Evidências individuais em `KOREAN_ORIGINAL_BROWSER_RESULTS.json`; respostas 403 anteriores e demais resultados permanecem preservados. Não há classificação de fora do ar.

## Validação

- Cinco testes focados de preservação: PASSOU, local e CI.
- Build da implementação: [PASSOU](https://github.com/7-Seas-Global-and-Hafen-Consolidators/passport-radio/actions/runs/38149165608).
- [Rodada hospedada](https://github.com/7-Seas-Global-and-Hafen-Consolidators/passport-radio/actions/runs/38149165571): iniciada antes da ordem final; resultado pendente ao fechamento. Não tratar execução em andamento como aprovação.
- Layout de 188 cartões nas oito larguras: evidência experimental anterior reaproveitada em `KOREAN_MSE_INITIAL_RESULTS.json`, sem alteração do CSS.
- Interlock e continuidade dos canais anteriores: evidências anteriores preservadas. Para os novos coreanos, NÃO COMPROVADOS enquanto a reprodução na Passport não for confirmada.
- Chrome local não iniciou: sandbox negou socket de ProcessSingleton; nenhuma proteção foi desativada.

## Preview

[Home com 177 rádios](https://passport-kpop-preview-20261011.mr-nomad.chatgpt.site). Publicação privada concluída, preservando acesso do proprietário. Fonte Sites `eee79e3b6bb6a1e399f8bb56c286f39472aba2f2`; deployment `appgdep_6acba45114d08191b457d545bd987e29`. O navegador cloud encontrou tela de autenticação; não houve mudança de audiência ou coleta de credenciais.

## Próximo ponto

Conferir a reprodução na Passport pelo preview autenticado. Por ordem final do proprietário, não iniciar novas pesquisas, aquisições ou rodadas de testes. Os 177 registros permanecem salvos. A missão funcional dos 23 não é declarada concluída.

Os endereços técnicos e a relação individual permanecem em `candidates.json`. O SHA final é o HEAD da mesma PR, evitando referência circular no próprio commit.

## Production follow-up — 2026-10-11

PR #545 is already merged. The official Home still contains 177 radios. A bounded Passport test of K-Pop Hits attached MediaSource but decoded no audio. A controlled comparison of the same signed init MP4 returned 200 (764 bytes) without Referer, 200 with Passport Origin only, and 403 with Passport Referer (with or without Origin). This isolates a referer-sensitive CDN access restriction for this resource. No request headers were falsified or suppressed to evade denial. No provider allowlist configuration is available. The other 22 have not been retested or declared functional. All source evidence and the 154 previous records remain unchanged. See PASSPORT_ACCESS_RESTRICTION.json. Next step: provider-authorized cross-site access or an officially permitted public endpoint, followed by individual Passport decoding validation. No runtime change, new branch, new PR, or merge was performed.
