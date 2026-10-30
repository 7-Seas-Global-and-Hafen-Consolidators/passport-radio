# CHECKPOINT DE RETOMADA — FASE 2 TOTAL

PR: #583. Branch: feat/fase2-editorial-rollout-all-articles-20261030.
Base main: 4139873dc89454c17116534691651f125fdf6e90.
Primeiro commit remoto: 478431766e55993f73b17ce2d4327bf39ebf1f7b.

Interrupção determinada pelo proprietário para salvar créditos. NÃO MERGEAR. NÃO PUBLICAR.

## Trabalho produzido e preservado neste checkpoint
- 197 matérias identificadas: 166 em editorial/ e 31 reportagens públicas na raiz/historias.
- Integração do CSS/JS editorial compartilhado e configurações de apresentação nas 197 páginas.
- Tipografia local: Bodoni Moda, Source Serif 4 e Instrument Sans.
- Imagens locais adquiridas, procedência, inventário das matérias e biblioteca de apresentação.
- 40 referências de imagens localizadas/reparadas, registradas em image-changes.json. Vídeos e URLs de incorporação preservados.
- Ajustes do gerador editorial futuro em tools/editorial_engine.py.
- Testes escritos em tests/test_editorial_rollout.py e tests/editorial_rollout_browser.cjs.
- 69 testes observados aprovados: 5 novos de integridade/gerador, 4 de preservação do piloto, 57 Node e 3 do editorial automático.

## Resultado de navegador efetivamente recuperado
- 152 matérias registradas; 0 matérias com problemas no arquivo recuperado.
- Larguras do cenário: 1440, 1024, 768, 390, 360 e 320 px.
- O relatório completo está em browser-layouts.json. Não tratar este checkpoint como aprovação visual final.

## Próximas tarefas pendentes — NÃO RECOMEÇAR
1. Conferir o resumo de browser-layouts.json e resolver somente os problemas restantes, se houver.
2. Conferir a integração ao leitor que navega no mesmo documento. js/passport-persist-nav.js copia main/estilos, mas carrega apenas alguns auxiliares: o novo script e os dados de apresentação ainda precisam ser comprovados nesse percurso. Nenhum arquivo de navegação/áudio foi alterado. Avaliar carregar os dados junto ao conteúdo e usar um ponto de apresentação existente; não reescrever a navegação.
3. Gerar capturas reais de desktop/tablet/mobile e antes/depois. Estas evidências finais ainda NÃO foram produzidas nesta operação.
4. Executar teste real de continuidade de áudio desta expansão. O teste do piloto anterior não substitui esse teste; ainda NÃO foi executado neste rollout.
5. Conferir o resultado visual integral, salvar os ajustes finais na MESMA PR #583 e retirar o rascunho somente após completar a validação.

## Recursos já adquiridos — NÃO PESQUISAR NOVAMENTE
- images/editorial/fase2-20261030/: fotografias adquiridas/localizadas.
- acquired-images.json: imagens obtidas e origem.
- localized-images.json: fotografias externas preservadas em arquivos locais, incluindo fotos históricas pequenas.
- image-changes.json: trocas/localizações exatas de src; texto, legendas e embeds preservados.
- image-provenance.json: acervo reutilizado e procedência.
- articles.json: as 197 matérias e suas configurações/fotos.
- data/editorial-presentation-images.json: biblioteca local para geração futura.

Uma fotografia indisponível do BMTH foi substituída por uma apresentação real de 2025, sem alterar a legenda de contexto. Não foram modificados players, catálogo, sinais, bus, mutex, interlock, infraestrutura, Home, Notícias ou loja.

Arquivos temporários de /tmp foram perdidos na indisponibilidade do ambiente; os recursos do projeto e os relatórios aqui presentes são o checkpoint real. Não afirmar que a operação está concluída nem que todos os vídeos foram reproduzidos integralmente.

## Pacote completo salvo nesta PR

O arquivo `checkpoint-20261030.bundle` contém o commit integral de trabalho `9d810f3406d9b08782563705671331200195f0ac`, com **288 arquivos alterados** (código, todas as páginas adaptadas, fotos, inventários, origem das imagens e relatórios recuperados).

O bundle foi verificado localmente por `git bundle verify` e seu blob remoto foi conferido pelo hash `b6e8a9cd0fa26521b3f5e658d08a52508be5e016`. Tamanho: 10.057.208 bytes.

O terminal não possui credencial para push. Por isso o checkpoint integral está guardado como bundle na mesma PR; os 288 arquivos ainda precisam ser materializados no diff da branch na retomada.

Para retomar num checkout da mesma branch, sem refazer aquisições:

```bash
git fetch origin feat/fase2-editorial-rollout-all-articles-20261030
git bundle verify docs/fase2-editorial-rollout-20261030/checkpoint-20261030.bundle
git fetch docs/fase2-editorial-rollout-20261030/checkpoint-20261030.bundle HEAD:resgate-fase2-20261030
```

O commit recuperado tem como pai `478431766e55993f73b17ce2d4327bf39ebf1f7b`. Preservar esta documentação/pacote ao continuar a branch remota. Não fazer reset destrutivo nem iniciar nova PR. Conferir o estado remoto antes de integrar o commit recuperado.
