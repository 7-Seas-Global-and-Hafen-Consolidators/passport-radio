# VÍDEOS — entrega para revisão, sem merge

Branch: `feat/videos-editorial-20261005`
Base: `9734399e57730fadcdc398a33b04155074db653e` (main com Jogos).

## Implementação

- `/videos.html`, seção principal própria; entrada Vídeos após Jogos, mantendo os itens existentes. O helper compartilhado já existente foi estendido; Jogos recebe somente a carga desse helper.
- Masthead, navegação, footer, largura e famílias tipográficas reutilizam `noticias.html` / `css/passport-noticias-paper.css`. CSS da nova página limita-se à própria superfície e usa #FFFFFF / #111111 / #C41E3A, Bodoni Moda, Instrument Sans e Source Serif 4.
- Catálogo público separado da auditoria: o renderer não busca a auditoria nem imprime créditos de uploader/canal/fonte, descrição técnica ou links de aquisição. Cards contêm preview 16:9 do próprio vídeo, artista/banda, título da performance e data do show quando comprovada. Datas ausentes permanecem ausentes, sem inferência a partir do upload.
- Busca por artista, quatro coleções musicais e filtro por formato; 24 entradas por página, controles anterior/próxima/números e retorno à página 1 após busca/filtro. Um único player criado sob demanda dentro do card acionado; clique em preview/play é o início intencional da reprodução. O player gigante no topo foi removido. `youtube-nocookie`, `autoplay=0`, início em 0:00.
- Fontes/canal → coleção → vídeo permanecem rastreáveis em `data/passport-videos-audit.json`. Esse inventário técnico não é solicitado pelo renderer público; não é um segredo ou controle de acesso.

## Corpus

| Verificação | Resultado |
|---|---:|
| IDs distintos auditados | 110 |
| Vídeos únicos na vitrine | 106 |
| IDs obrigatórios, sem substituição | 50/50 |
| Itens da playlist Marillion auditados em ordem | 55/55 |
| Marillion publicados, preservando ordem relativa | 51 |
| Smashing Pumpkins, ordem original preservada | 5/5 |
| BABYMETAL: performances reais de palco | 2 |
| Uploads marcados como shows completos conforme inventário fornecido | 21 |

A sobreposição `NFi_BMYgaPQ` ocupa um único registro, vinculado a duas coleções; a ordem própria da playlist é mantida por posição interna. `cOqaUtMBB-s` também aparece uma única vez. Nenhum show completo foi fragmentado ou trocado.

A coleção Marillion mantém os itens musicais da playlist, incluindo covers, áudio, entrevista e material promocional musical: a ordem corrigida exclui somente os quatro IDs expressamente determinados. Covers de Fleesh são identificados como Fleesh; Steve Hackett + Steve Rothery não são apresentados como Marillion. Não se atribuem datas de show a áudio de estúdio ou trailers.

| ID mantido somente na auditoria | Motivo |
|---|---|
| `VBnD_s7Jwjs` | Receita de sobremesa; contaminação não musical |
| `tCsloVbH7JI` | Dicas de iPhone; contaminação não musical |
| `6lkvf0bOP90` | Receitas de sopa; contaminação não musical |
| `BBCsr2yedsI` | Indisponível, sem identidade recuperável; nenhum card |

`N8FcJ6f3xJ4` (Chicago) permanece no catálogo obrigatório, mas o provedor informa que não permite embed. Ao selecioná-lo, a página exibe aviso e não cria iframe. Nenhum upload substituto foi usado.

Origem Smashing: Radio 94.7 / KKDO Sacramento / ALT 94.7 / Audacy; os cinco IDs são `TLKHenk8p1M`, `KCrIp3x1e2M`, `ej1z_TxKQQM`, `nkodQuLgONc`, `eDWBFevKSZc`, nessa ordem. Ano 2010 confirmado nas descrições; dia/mês não inferidos de `9.6.10`.

A aquisição restante de BABYMETAL foi encerrada com `zTEYUFgLveY`, do canal oficial BABYMETAL, título Live in Japan e descrição da apresentação em Saitama Super Arena. Não é trailer ou áudio de estúdio. Sua data não foi inferida. O outro item é o ID obrigatório `KG_fqkyJ-wo`, BABYMETAL + Rob Halford, palco em 2016.

David Gilmour usa 2016, confirmado no [site oficial](https://www.davidgilmour.com/music/live-in-pompeii/), sem escolher arbitrariamente um dos dois dias. The Warning usa 22.06.2025, conforme grade oficial Pinkpop 2025; não foi copiado o dia fictício do exemplo de card na ordem.

## Áudio e integridade

Não há novo Bus, mutex, player global ou engine. A página carrega os arquivos existentes `passport-bus.js` e `passport-audio-continuity.js` sem alterá-los. O player local registra um peer no Bus existente. Início intencional chama `PassportContinuity.pause()` e reivindica propriedade no Bus; retomar a rádio revoga esse peer e pausa o vídeo. Um evento tardio de reprodução não recupera propriedade após a rádio retomada. Busca, coleção e paginação não chamam pausa da rádio. Somente o clique intencional em preview/play ou REPRODUZIR usa o interlock.

O teste de transporte usa áudio WAV local **somente como resposta de rede do navegador de QA**, sem mudar os endpoints nem os engines no repositório. O engine original restaurou Power Metal, endpoint `https://streams.radiobob.de/powermetal/mp3-192/`, índice 0 e volume 0,35; o relógio do áudio avançou durante a navegação. Reprodução de vídeo foi simulada nesse teste para provar o interlock. Isso não constitui prova de streaming externo real nem de ausência de intervalo na troca de documentos. O mecanismo existente reconecta ao mudar de documento.

74 caminhos protegidos foram registrados; zero arquivo protegido alterado. Bus, continuidade, bundle do runtime, rádios, streams, World Dial, 66 sinais e workflows permanecem sem alteração. Podcasts/Broadcasts não foram editados. `jogos.html` recebeu apenas o script de navegação compartilhado, sem modificar jogo ou conteúdo.

## QA e evidências

| Teste | Resultado |
|---|---|
| 8 testes Python de integridade do catálogo | PASS |
| Sintaxe dos dois JS editados/criados e `git diff --check` | PASS |
| Desktop 1440 / mobile 390 | PASS |
| Todos os cards, todas as páginas, preview + artista + título + data | PASS |
| Busca, coleções, formato, reset para página 1 | PASS |
| Primeiro/último, anterior/próxima/números, sem nova URL/aba | PASS |
| Marillion: 51 cards em ordem após excluir quatro | PASS |
| 50 IDs obrigatórios e deduplicação | PASS |
| Chicago: embed recusado, aviso sem substituição | PASS |
| Player único, carga sob demanda, autoplay=0 | PASS com API controlada |
| Início de vídeo, retomada de rádio e evento tardio | PASS com engine/Bus originais e transporte controlado |
| Continuidade na entrada/navegação/reload | PASS com áudio nativo e engine original; reconexão existente |
| Menu real Home, Jogos, Notícias, Arquivo, Loja | PASS; listas registradas |
| Branco/preto/vermelho, fontes, overflow | PASS desktop/mobile |
| Exceções JavaScript introduzidas | ZERO no QA de interface/integração |
| Fontes/origens na interface pertencente à Passport | ZERO; inventário técnico não renderizado |
| Reprodução externa real | BLOQUEADA neste ambiente; API expirou nos dois testes |

Resultados da correção atual: [cards audiovisuais e continuidade](videos-evidencias/correction-qa.json), [106 previews verificados](videos-evidencias/preview-check.json), [títulos adquiridos → projeção pública](videos-evidencias/title-projection.json).

Resultados históricos preservados da implementação inicial: [interface](videos-evidencias/qa.json), [continuidade e menus](videos-evidencias/continuity-qa.json), [integridade](videos-evidencias/integrity.json).

Screenshots da própria branch (sem mockup):

| Estado | Desktop | Mobile |
|---|---|---|
| Primeira página | [1440](videos-evidencias/videos-1440.jpg) | [390](videos-evidencias/videos-390.jpg) |
| Intermediária | [1440](videos-evidencias/videos-intermediate-1440.jpg) | [390](videos-evidencias/videos-intermediate-390.jpg) |
| Última página | [1440](videos-evidencias/videos-last-1440.jpg) | [390](videos-evidencias/videos-last-390.jpg) |
| Smashing Pumpkins | [1440](videos-evidencias/videos-smashing-1440.jpg) | [390](videos-evidencias/videos-smashing-390.jpg) |
| Embed recusado | [1440](videos-evidencias/videos-blocked-1440.jpg) | [390](videos-evidencias/videos-blocked-390.jpg) |

## Limitações reais

- A API externa do player não completou o carregamento nos dois ensaios de streaming real no navegador deste ambiente (BABYMETAL e Smashing). Não foi declarado PASS de reprodução externa; requer revisão no navegador de Mr. Nomad. Metadados públicos adquiridos informam disponibilidade/embed, não garantem reprodução para todo país/conta/data.
- O texto e os controles próprios da Passport não mostram crédito de fonte, uploader ou links de aquisição. Nomes de eventos mantidos nos títulos identificam a performance, não o fornecedor. As thumbnails reais podem conter marca incorporada na própria imagem; não foram adulteradas. O conteúdo visual **dentro do iframe externo** é controlado pelo provedor e pode mostrar marca, título original e canal. Não é possível garantir sua ausência alterando somente a interface da Passport, sem adulterar o player externo.
- A publicação Pages existente só publica main; não há preview automático de PR configurado. Nenhum workflow/deploy foi alterado para criar outro serviço. A revisão visual é apoiada pelas dez screenshots; a branch pode ser servida localmente com `python -m http.server 8000`, acessando `/videos.html`.
- Nenhuma disponibilidade futura de streaming, continuidade gapless entre documentos ou aquisição completa de todos os canais foi alegada. O corpus entregue corresponde aos IDs e playlists auditados, mais uma performance oficial de BABYMETAL.

Sem merge; revisão humana pendente.

## Correção cirúrgica — continuação do HEAD 3deecd8

A especificação pública foi corrigida: fonte não é identidade do vídeo. Os 106 títulos foram projetados somente a partir dos títulos/metadados já adquiridos. Local, data ou performance ausentes não foram completados por inferência. Removeram-se créditos de uploader/canal/provedor, chamadas de venda e ruído técnico; preservaram-se nomes de músicas, shows, concertos, eventos e sessões que identificam o conteúdo.

Cada card agora possui preview 16:9, artista, título e data comprovada. Desktop 1440 usa três colunas; mobile 390 usa uma coluna para manter preview e player legíveis. Não existe player gigante ou deslocamento para o topo. Um iframe é criado somente no card acionado; ao trocar de vídeo, o anterior é destruído. Nenhum iframe é criado na carga inicial. Chicago mantém preview e identificação do próprio ID, com aviso de embed recusado no card e sem substituição.

As thumbnails usam o endpoint leve de imagem do mesmo ID já catalogado, `https://img.youtube.com/vi/ID/hqdefault.jpg`. Foram verificados 106 JPEGs reais e decodificáveis. O host i.ytimg.com retornou uma página de indisponibilidade neste ambiente; o endpoint equivalente img.youtube.com funcionou. Nenhum canal, playlist ou metadata de vídeo foi adquirido novamente. O cache de imagens é somente transporte do QA; a aplicação utiliza as URLs das thumbnails, não proxies ou imagens alternativas.

QA desta correção: 1440/390, todas as 106 entradas, título/artista/data/thumbnail, busca, filtros, coleções, paginação, limites, primeira/última, cinco Smashing em ordem, Marillion 51, iframe dentro do card 16:9, troca com somente um player, retomada de rádio revogando vídeo, evento tardio bloqueado, Chicago sem iframe, imagens decodificadas, ausência de overflow e exceção JavaScript. Continuidade passou novamente com engine nativo original e transporte controlado: filtros/paginação mantêm endpoint, volume e relógio; somente play intencional pausa a rádio; retomar rádio pausa o vídeo.

A projeção removendo apenas os novos campos `title` e `thumbnail` tem o mesmo SHA-256 do catálogo do HEAD anterior. A auditoria original permanece byte a byte idêntica. Catálogo, 50 IDs, datas, tipos, ordens, coleções, disponibilidade, 55/51 Marillion, quatro exclusões, cinco Smashing, dois BABYMETAL e Chicago estão integralmente preservados. Navegação, tipografia compartilhada e todos os arquivos radioativos permanecem sem alterações nesta correção.

As dez screenshots foram regeneradas da própria branch. Resultados e screenshots anteriores continuam recuperáveis no HEAD 3deecd8, sem descarte. A limitação histórica de streaming externo continua explícita; testes controlados do player não foram apresentados como reprodução externa real.

Capturas atuais em JPEG, na resolução real 1440/390. A captura móvel longa foi feita por segmentos de rolagem e reunida sem reordenar/cortar conteúdo, evitando o limite de pintura da captura única acima de 8192px. Foi confirmado um único header e footer em cada documento. Os PNGs da primeira entrega foram preservados como evidência histórica.
