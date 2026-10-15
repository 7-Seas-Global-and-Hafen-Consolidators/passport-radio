# Passport Global — checkpoint de 15/10/2026

Estado: **implementação parcial, não pronta para merge nem produção**.
Base: `66c51d4ce62776667964978023c4b709283f9bfd`.
Branch: `feat/passport-global-five-languages-20261015`.

## Referências e arquitetura encontrada

GUIROPA: lidos integralmente translations.js, LanguageContext.jsx, LanguageSwitcher.jsx e autoTranslate.js. Possuem três idiomas e tradução de título/resumo; o endpoint público usado pela referência retornou HTTP 429 em uma única consulta. Não houve repetição ou contorno do limite. 7 SEAS: consultados src/i18n.js e src/locales/en.json. Passport contém aplicação React compilada, HTML editorial e módulo compartilhado de rodapé; não foi reconstruída.

28.182 caminhos HTML no HEAD-base (contagem de nomes no Git, sem aquisição ou reprocessamento). Isso NÃO representa cobertura traduzida.

## Implementado

- Módulos independentes de negociação dos cinco idiomas, preferência persistida, detecção en-US→en-GB, cache IndexedDB e SHA-256 do texto de origem.
- Troca atômica da página: só aplica após resolver todos os textos elegíveis; páginas incompletas permanecem inteiramente em português e PT continua ativo. Novos textos dinâmicos invalidam a cobertura da página. Preserva nós e handlers existentes, campos, identificadores e elementos de reprodução.
- Seletor 180×28 px; opções 32×28, fonte 11 px; compacto 64×28 com área de toque 64×44. Encaixe por medição do cabeçalho existente; sem alterar breakpoints. Menu 180 px, opções 44 px, Escape, setas, clique externo e foco.
- html.lang, og:locale, título/descrições e textos linguísticos de JSON-LD acompanham o idioma efetivo; links canônicos não mudam.
- Hook mínimo no rodapé compartilhado. Nenhuma página de conteúdo original foi modificada.
- Um pacote revisado da matéria Brian May/Queen de 10/10/2026: título, resumo, três subtítulos e TODOS os seis parágrafos, nos quatro idiomas de destino, além de título de documento e descrição. Inglês britânico: “rumours”, “travelling”, redação integral própria.
- Adaptador privado de build para Google Cloud Translation LLM, com destino en-GB nativo, sem segredo no navegador. CLI incremental publica os pacotes somente depois de obter os quatro idiomas. Não foi conectado a produção nem a um workflow que consuma tradução paga.

## Cobertura real e bloqueio

Apenas **uma matéria** possui pacote completo; não há cobertura integral da Home, do acervo, da Loja ou das demais páginas. O fallback impede apresentá-las traduzidas pela metade. Não foi executado backfill de 28 mil HTML.

A referência pública está limitada (429). O adaptador oficial exige projeto Google Cloud autorizado com Translation LLM habilitado e autenticação de curta duração; estes acessos não estão disponíveis nesta operação. Nenhuma credencial financeira foi reutilizada. A documentação oficial distingue en-GB da tradução NMT genérica: https://docs.cloud.google.com/translate/docs/languages e https://docs.cloud.google.com/translate/docs/translation-llm .

Próximo passo exato: disponibilizar autenticação própria do projeto de tradução autorizado; extrair os textos públicos de cada rota e conteúdo dinâmico para snapshots, revisar termos protegidos, executar o build incremental e medir cobertura completa antes de marcar a PR pronta. Não enviar chaves pela conversa. Isso não está aprovado por testes simulados do adaptador.

## Verificação e preservação

Quatro testes unitários iniciais aprovados (negociação/hash, atomicidade/tokens, contrato oficial do adaptador mockado, falha sem publicação parcial). Após correção do falso positivo francês SUIVEZ-NOUS, repetido somente o teste de tokens afetado. Teste adicional aprovado dos 13 segmentos da matéria em quatro idiomas e dos termos britânicos. Nenhuma suíte geral executada.

Evidência real de navegador em `evidence/browser.json` e capturas desktop/tablet/mobile. Primeira verificação detectou lacunas de cookies e falso positivo em francês, corrigidos antes da evidência final. Medidas verificadas 1440/850/390 px; sem rolagem horizontal. As capturas são da aplicação original, não de uma reconstrução visual.

Streams de mídia foram bloqueados somente no navegador de teste. Portanto reprodução real, continuidade sonora e todos os fluxos comerciais NÃO foram testados; os módulos correspondentes não foram alterados. Preservados catálogo, preços, SKUs, Pix, Mercado Pago, fretes, rádios, players, mutex/interlock, conteúdo original, identidade e URLs.

Sem merge. Sem deploy na Passport Radio. Preview separado e privado; backend comercial não é disponibilizado por ele.

## Entrega persistida

- PR rascunho: https://github.com/7-Seas-Global-and-Hafen-Consolidators/passport-radio/pull/559
- Commit de implementação e evidências: `bf5f9b03490324524dbd69c3cfb417240658b8f1`.
- Preview privado publicado com sucesso: https://passport-global-preview.mr-nomad.chatgpt.site
- Matéria integral: https://passport-global-preview.mr-nomad.chatgpt.site/editorial/2026/10/10/brian-may-esclarece-boatos-e-nega-ter-anunciado-o-fim-definitivo-das-turnes-do-queen-82a3ea32cb.html
- Preview usa fonte pública fixada no commit de implementação, sem proxy para APIs ou acesso ao cofre. Worker separado, sem novos segredos. Versão Sites `appgprj_6ad10ee8d5b081919761587b01285c51~appgver_893a5037b8088191ace77eed9995e22c`; resultado nativo `succeeded`. Não representa deploy no domínio Passport.
- Verificação final de navegador: en-GB/es/fr/de efetivos na matéria; menu fecha por Escape; preferência de; zero autoplay; altura do cabeçalho não muda com a presença do seletor. Foram observados nove elementos de áudio já geridos pela aplicação: isso NÃO é prova de reprodução única ou continuidade sonora, que não foram exercitadas.
- Limites restantes além do backfill: revisão de nomes protegidos no restante do acervo, estados dinâmicos de todas as páginas e navegação integral multilíngue ainda não validados. Não declarar cobertura total nem aprovação de regressão geral.

A atualização final altera somente documentação; o preview continua fixado no mesmo código de aplicação e evidências.
