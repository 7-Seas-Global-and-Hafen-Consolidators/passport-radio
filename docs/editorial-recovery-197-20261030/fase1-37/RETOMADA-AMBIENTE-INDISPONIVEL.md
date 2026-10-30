# Retomada após indisponibilidade do ambiente — Fase 1, 37 matérias

PR única: #584. Branch: docs/editorial-recovery-197-visual-master-20261030.
Último commit de implementação remoto confirmado: 91d59715652a6726ae0b4c041e20c8fdb27be930.
Este registro salva o estado operacional; não declara a reforma concluída nem a PR aprovada.

## Implementação já persistida no GitHub

- Inventário exato de 37 URLs e classificação individual A/B/C/D.
- Compositor de apresentação explícito, opt-in dessas 37 páginas e 383 capítulos mapeados.
- Conteúdo original conservado por movimentação dos nós, sem reescrita narrativa.
- Três substituições autorizadas de vídeo no HTML, registradas em video-changes.json.
- Fonte de preservação original e teste de navegador específicos da Fase 1.
- As outras 160 matérias e os sistemas de áudio não foram reformados.

## Trabalho local posterior, ainda NÃO persistido no GitHub

O ambiente de execução foi informado como indisponível e o exec-server desconectou durante as capturas. Não houve acesso aos arquivos para concluir o upload deste lote. Se o volume reaparecer, preservar seu conteúdo antes de qualquer checkout/reset.

Worktree: /workspace/scratch/700b71c9e9fd/passport-recovery.
HEAD local antes da desconexão: 91d59715652a6726ae0b4c041e20c8fdb27be930.

- 151 registros de apresentação fotográfica selecionados, combinando acervo existente e novas aquisições; imagens adicionais em images/editorial/recovery-phase1-20261030/.
- Procedência e créditos em docs/editorial-recovery-197-20261030/fase1-37/photo-library.json e photo-manifest.json.
- Cinco aberturas corrigidas localmente: algoritmo/smush, Rafael Bittencourt, Badmotorfinger, Festa Ploc e Anos 80 Volume 2. Registro em photo-changes.json.
- O Soundgarden histórico veio do acervo Sub Pop, fotografia Charles Peterson; não atribuir o registro à formação de 1991 nem inferir a data da captura pelo nome do arquivo.
- A miniatura do vídeo original Festa Ploc — Lua de Cristal só foi usada como documento interno de 480px, sem ampliar como hero. Fotografia Flickr com marca-d'água foi rejeitada.
- Fotos de homônimos/logotipos de Maroon, Ritchie, Europe, Extreme e Rammstein foram rejeitadas e substituídas por retratos corretos na seleção local.
- js/passport-editorial-recovery.js recebeu resolução das chaves canônicas de imagens, painéis por performance da Festa Ploc e realocação das três fotos originais de Dionne ao capítulo do show de 2026.
- data/editorial-recovery-phase1.json contém associações explícitas de capítulo/imagem; não regenerar o arquivo pelo construtor inicial, pois isso apagaria a curadoria.
- css/passport-editorial-recovery.css recebeu composição de foto/performance e ajuste de editoria duplicada.
- tests/fixtures/automatic-editorial-preservation.json recebeu somente a referência da hero correta de Badmotorfinger; o hash do texto permanece original.
- tests/editorial_recovery_phase1_audio.cjs foi criado para o percurso Home → Notícias → Lambrini → Notícias → Home; resultado ainda não recuperado.
- Capturas reais parciais em docs/editorial-recovery-197-20261030/fase1-37/captures/. Visões completas maiores que 16000px foram reduzidas para o limite do WebP; aberturas e capítulos mantêm a resolução nativa.
- Não incluir data/.blog-catalog.jsonl.I9R8nL: arquivo temporário preexistente, fora do escopo.

## Resultados efetivamente observados antes da interrupção

- Passagem inicial: 37 páginas em 1440/320, sem erros JavaScript. Problemas locais de arquivos de imagem ausentes e comparação de legenda foram corrigidos.
- Festa Ploc com a curadoria nova: teste focado em 1440/320 sem problemas de conteúdo, links, IDs, vídeos ou layout.
- Rodada final de seis larguras com capturas: páginas 1 a 4 concluídas sem problemas; rodada interrompida durante a página 5. Não declarar 222 combinações aprovadas.
- tests/test_automatic_editorial.py: 3 testes aprovados.
- Suítes Living Collection World Dial, Dance, Rock/Pop e Fase 4: testes aprovados, preservando 401 rádios e sistemas protegidos.
- Suíte K-pop: 4 testes aprovados após materializar seu fixture histórico do próprio Git.
- Suíte passport_40_inventory não concluiu: faltava docs/passport-40-20261011/approved-additions.json no checkout esparso. Restaurar o fixture do Git; não modificar o teste para encobrir a ausência.
- Navegador real, tests/automatic_editorial_browser.cjs: apresentação desktop e mobile; áudio real Hits continuou Home → Arquivo → Badmotorfinger; troca explícita Hits → MPB manteve um áudio; retorno à Home conservou o mesmo transporte e tempo crescente. Entrada mobile sem autoplay; Hits continuou da matéria à Home no mesmo elemento e documento. Logs em /tmp/recovery-native-audio.log; copiar o relatório estruturado de test-results quando o ambiente voltar.
- oEmbed dos três vídeos indicados respondeu 200 e retornou títulos correspondentes. Isso NÃO comprova reprodução incorporada. Registro local video-oembed.json.
- Nenhum teste em aparelho físico foi executado.

## Próxima tarefa exata

1. Recuperar o volume local e preservar os arquivos acima. Não repetir aquisições nem descartar as imagens válidas.
2. Persistir o lote fotográfico e o compositor atualizado nesta mesma branch com lease do HEAD remoto.
3. Completar as 37 páginas nas seis larguras, sem repetir casos já concluídos sem necessidade; regenerar capturas afetadas pelo último ajuste localizado de editoria/data.
4. Conferir visualmente todas as composições, corrigir eventuais associações restantes e produzir índice das evidências.
5. Verificar os três embeds reais, concluir o percurso de áudio via Notícias, executar a preservação dos demais 160 artigos e os testes aplicáveis.
6. Atualizar a mesma PR, mantendo descrição fiel às limitações. Sem merge, publicação ou alteração de main/infraestrutura.

## Arquivos de apoio locais

- /tmp/configure_recovery_photos.py: curadoria explícita por capítulo já aplicada localmente.
- /tmp/recovery37-source.json: fonte original detalhada.
- /tmp/recovery-final.log: rodada final interrompida.
- /tmp/recovery-news-audio.log: percurso via Notícias, resultado não recuperado.
- /tmp/recovery-unit-native.log, /tmp/recovery-unit-inventory.log, /tmp/recovery-unit-missing.log.
- /tmp/recovery-component-index.json: árvore remota da implementação persistida.
- Chrome local: /tmp/passport-recovery-browser/chrome-headless-shell-linux64/chrome-headless-shell.
- Dependências Python: /tmp/recovery-deps.


## Retomada de 30/10/2026 — estado posterior

Volume recuperado e curadoria persistida. As 37 páginas/383 capítulos foram revisados; 222 combinações nas seis larguras passaram, além de 111 capturas de detalhes em resolução nativa. Áudio real aprovado em desktop/mobile via Notícias e Lambrini; 32 testes de preservação/editoriais aprovados. Evidências e fotografias em [REVISAO-VISUAL.md](REVISAO-VISUAL.md). Os três embeds foram testados, mas sua reprodução não passou: INXS e Shakira/Dua Lipa exibiram indisponibilidade; Taylor permaneceu em 0:00 no ambiente. Sem merge, publicação ou alteração dos motores. A aprovação visual continua com Mr. Nomad.
