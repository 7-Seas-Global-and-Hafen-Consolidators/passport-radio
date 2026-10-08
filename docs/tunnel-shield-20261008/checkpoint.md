# Blindagem operacional dos túneis — 2026-10-08

Estado: proposta de remoção, sem merge. A main pública e o site ainda expõem as versões existentes. O histórico Git continuará acessível após uma PR comum.

Base pública: `5f54ff966116d680ee0b40b16e4e3fb63a11f2ea`.

## Inventário e preservação

- 30.528 arquivos classificados estruturalmente; 1.550 arquivos de conteúdo inspecionados para dependências e padrões de credenciais.
- 93 arquivos preservados no cofre privado com SHA de blob Git idêntico: 7 reutilizados e 86 novos.
- 29 remoções propostas. Nenhum HTML, CSS, JavaScript, catálogo, workflow público, player, rádio ou checkpoint Podcast/Broadcast alterado.
- Inventário individual completo em 31 partes e cópias exatas sob `vault/`, no repositório privado `passport-radio-internal`.
- Workflows arquivados em `vault/.github/workflows/`, sem execução no cofre.

## Remoções propostas

- `FOUNDATION-CHANGELOG.md`
- `PASSPORT-FEATURES-NOTES.md`
- `foundation-audit.json`
- `foundation-contact-map.json`
- `foundation-integration-plan.json`
- `foundation-next-step.txt`
- `foundation-no-audio-touch.txt`
- `foundation-protected-systems.json`
- `foundation-readme.txt`
- `foundation-review-note.md`
- `foundation-rollback.md`
- `foundation-rollout.md`
- `foundation-scope.txt`
- `foundation-smoke-test.md`
- `foundation-status.json`
- `docs/editorial-blog-tunnel.md`
- `docs/editorial-engine.md`
- `docs/editorial-full-story-operation.md`
- `docs/editorial-tunnel.md`
- `docs/whatsapp-channel-bridge.md`
- `reports/blog-publication-report.json`
- `reports/discussion-contribution-report.json`
- `reports/media-documentary-coverage.json`
- `reports/passport-current-inventory.json`
- `reports/search-archive-report.json`
- `reports/visual-audit-report.json`
- `supabase/functions/passport-media-kit/deno.json`
- `supabase/functions/passport-media-kit/index.ts`
- `supabase/passport_media_kit.sql`

## Componentes públicos protegidos

- `js/181fm-tunnel.js` — hash preservado `9920cb2e45caf5a22c8049715321c862ab2e9a43`
- `js/50s-60s-tunnel.js` — hash preservado `3b419aac60abd4e445400a9f30851f1ce7d60cae`
- `js/br-rock-tunnel.js` — hash preservado `896aa6fecb1284cc41c465dc05a97058aeb9b002`
- `js/flash-house-tunnel.js` — hash preservado `621e89eebaf4d74043ae705edaa1bcbde036d9e6`
- `js/globo-de-ouro-tunnel.js` — hash preservado `86f661d3d4913aededeb98d9db46520190abe6ee`
- `js/jovem-guarda-tunnel.js` — hash preservado `92e95f4859ae9511a62e5f639a2b70a3fb52486e`
- `js/mpb-tunnel.js` — hash preservado `3369a5c723915f069c7ecbe5788bd154ee111ff9`
- `js/nostalgia-passport-tunnel.js` — hash preservado `a861714e91889fe08aa91e055c67d81c67c82200`
- `js/novelas-tunnel.js` — hash preservado `035470e2fd303e8529c7cb3a95166cd9da654dc1`
- `js/passport-hits-tunnel.js` — hash preservado `5d9a1a69f467616f7c272fc1c4df4765663058ac`
- `js/passport-rock-tunnel.js` — hash preservado `48b4585a3d8f0a99cfbd4a43fd7463560f2babca`
- `js/radio-tunnels-ui.js` — hash preservado `23039a89eef20ef10d34f3e9243dacb469b3ffd2`
- `js/soul-central-tunnel.js` — hash preservado `06245f9206709e6ae75275379f349647dc7c0634`
- `js/total-soul-tunnel.js` — hash preservado `93c7fda86ed0a9b2522fc948b805e664a2623acd`
- `js/tunnel-player.js` — hash preservado `7e179c1b2def925fc23aa2daf4ac3749d89d66a1`
- `js/tunnel-playlists.js` — hash preservado `470078568df6e982e75e3d692a36fe21ee396100`
- `js/world-disco-deutschland-tunnel.js` — hash preservado `2a5c0226df91d7097568798b2976ddd11dc258f5`
- `js/world-tunnel-reggae.js` — hash preservado `9018a2fd6a022ece236a37c84ed96f9dbd3cb919`

Permanecem públicos todos os demais componentes de execução: páginas, scripts do navegador, assets, catálogos e dados consumidos pelo site; workflows, motores e entradas operacionais exigidos por imports e contratos de CI. Nenhuma dependência de execução encontrada aponta para os 29 arquivos retirados.

## QA

- Sintaxe Python: 37 arquivos válidos.
- YAML: 17 workflows válidos e inalterados.
- JavaScript: 138/139 arquivos válidos; `js/passport-home-v6.js` apresenta erro de sintaxe preexistente na main e foi preservado.
- Todos os 18 JavaScripts protegidos: hashes exatos.
- Contratos editoriais, apoio, media kit, inteligência editorial, fallback RSS, constituição, regressão de falsas aceitações, publicação, auditoria/proposta de placement e media golden: passaram.
- 14 etapas iniciais do build.yml passaram; contratos comerciais e Blog Tunnel passaram após materialização dos fixtures necessários.
- Teste Loja: 5/6 casos passaram; comparação histórica de todas as páginas não certificada devido à materialização local parcial. Nenhuma página ou entrada comercial é alterada nesta PR.
- Zero referências novas de execução aos caminhos removidos.
- Build Jekyll completo não executado: Ruby/Bundler/Jekyll ausentes no ambiente. Configuração de publicação preservada.

## Segurança e pendências

Nenhum padrão de alta confiança de chave privada, token GitHub, chave AWS ou service role literal foi encontrado no conteúdo inspecionado. Chaves publicáveis do navegador não são tratadas como segredo. Valores sensíveis não são reproduzidos neste documento.

- Public main and published site unchanged until merge and deployment; no files yet claimed hidden.
- Public Git history retains all prior copies; no history rewritten.
- Workflow/import/test-bound operational engines remain public: private cross-repository checkout requires an authenticated architecture, not present in existing workflows. No failing checkout or new automation introduced.
- Full Jekyll build unavailable locally: Ruby/Bundler/Jekyll not installed.
- Full Loja historic fixture hash check cannot be certified in partial local materialization; no commercial file changed.
- Current-main js/passport-home-v6.js contains existing syntax error; untouched.
- Credential scan covered materialized current source, not every historical Git blob. No matching high-confidence credential pattern found.

O cofre confirma integridade e preservação; não transforma em privado um arquivo que permanece público. A migração de motores ainda ligados à CI permanece explicitamente pendente, evitando interromper workflows ou reativar automações.
