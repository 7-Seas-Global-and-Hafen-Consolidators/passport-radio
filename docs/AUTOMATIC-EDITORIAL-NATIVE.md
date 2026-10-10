# Matérias automáticas nativas — 2026-10-10

Base pública d2e69e1ff71dcecd08cab22ab0edfc57db64d380; base privada c94279c0730f4b6d2abd6708d3eb780c194f853e (PR 2 mergeada).

A referência é editorial/2026/10/07/soundgarden-outshined-power-to-the-people.html. A geometria do conteúdo e as classes reutilizam passport-participe-paper.css. O cabeçalho, as rádios e o rodapé são os componentes reais do App institucional atual, resolvido a partir de index.html. Não existe cópia de player ou de catálogo. passport-legal-footer.js fornece o apoio já existente; pagamentos são os componentes do App.

Entrada via Home/Arquivo: passport-persist-nav.js importa somente main e mantém o mesmo documento, o mesmo nó de áudio e o mutex existente. Entrada direta: passport-automatic-editorial.js monta o mesmo App com PassportInstitutionalHost, PassportEditorialRoute e PassportInitialEditorial; a navegação subsequente utiliza o mesmo outlet. Este bootstrap não seleciona emissora nem chama play. Sem estado anterior não inicia áudio. Recarregar a aba ou entrar em uma nova aba permanece um novo documento e não permite continuidade física do transporte anterior; não se promete continuidade nesses casos.

O arquivo Badmotorfinger permanece no mesmo caminho/canonical. Texto substantivo, título, subtítulo, autoria, data e imagem preservados. Hash do texto e referência da foto: tests/fixtures/automatic-editorial-preservation.json. Nenhuma imagem foi trocada e nenhum vídeo sem autorização foi acrescentado.

No privado apenas o renderer foi extraído para radar/editorial_page.py. Fontes, cotas 25+25, Gemini/prompts, Fact Packs, deduplicação, publicador por PR/build, cron e workflows legados ficam intactos. Os checkpoints históricos não foram reescritos. Não houve aquisição, geração ou publicação de teste.

Validação direcionada: 5 testes de renderer (incluindo Metal Hammer e TMDQA), 3 testes públicos de apresentação/preservação, compilação Python e sintaxe JavaScript. O workflow Native editorial browser valida a proposta em Chromium contra os streams reais: intercepta apenas os quatro arquivos alterados, não publica nada; verifica identidade do nó de áudio, avanço temporal, documento preservado, mutex Hits→MPB, entrada direta sem autoplay, desktop e celular. Evidências e screenshots ficam no artifact do workflow. O build obrigatório permanece inalterado em suas proteções.

A validação manual no navegador de produção comprovou Hits em Arquivo (23,124457 s) e Badmotorfinger (29,362458 e 142,940588 s), readyState 4; MPB foi a única emissora ativa após escolha explícita (21,787977 s), e continuou na Home (22,154751 s), readyState 4. Esta evidência comprova o contrato existente; a proposta recebe validação separada no workflow da PR.

Ordem de integração: merge público após build + browser aprovados, depois merge privado. Não integrar o renderer privado antes dos assets públicos, pois as páginas futuras dependem deles. Nenhum merge foi executado nesta operação.

