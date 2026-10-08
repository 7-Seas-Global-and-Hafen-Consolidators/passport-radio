# Ressurreição do Blog — 08/10/2026

Base pública: b82a93a0b1a723dbe1b9f3b187db71e97c1a58e4.
Branch: feat/blog-ressurreicao-20261008. Nenhum merge.

## Entrega

Somente vitrine: blog.html, estilos escopados em css/passport-blog.css, js/passport-blog-cover.js e data/blog-cover.json. Dez matérias existentes selecionadas do feed editorial manual; seus textos, assinaturas, vídeos, rotas e fotografias aprovadas permanecem intactos. O feed original não foi modificado. Dez fotos locais, usadas nas próprias matérias. Tempos de leitura calculados do texto real (200 palavras/minuto, teto).

Corpus: 21.933 linhas do catálogo real. Blob preservado: 26a29d046ad5b588d10ece29c9d487cc2ccf1a4f. Nenhuma matéria, índice ou assinatura histórica alterada. Todos os links existentes de descoberta foram mantidos.

Header institucional reutilizado de Notícias; footer HTML institucional reutilizado de doe.html; componente existente payment-footer-trust.js e assets originais de PIX, bandeiras e Mercado Pago. Um único footer, destino https://link.mercadopago.com.br/passportradio. Telegram e WhatsApp preservados. Sem Route 66 na vitrine reconstruída.

## QA comprovada

- Chromium 1440×1000 e 390×844: zero exceções JavaScript, zero overflow horizontal; 10/10 fotos e 9/9 assets de pagamento decodificados; um footer; contagem 21.933.
- Busca existente: Queen retorna 213 resultados, 20 cartões na primeira página. 91/91 destinos internos da capa comprovados no Git atual ou fixture local. Algumas páginas históricas não estão no checkout esparso local: sua existência foi conferida na árvore Git, sem regeneração.
- Continuidade com mídia WAV controlada interceptada exclusivamente no teste: seleção pela interface real da Home; Home → Blog → matéria → Blog → Home. Mesmo documento, engine bay e elemento passport-live-audio conectados; currentTime crescente; apenas um elemento reproduzindo; nenhuma nova chamada play/pause/load/src e nenhuma nova requisição de mídia durante as transições. Entrar pausado permanece pausado.
- Este teste certifica a sobrevivência do transporte na navegação, não a disponibilidade/audibilidade do stream externo real. Evidência separada em qa/continuity.json. Nenhuma alteração no mecanismo para obter PASS.
- passport-audio-continuity.js permanece blob b7112885b62b3531511aba5c9681534513600a54; player, Bus, streams e demais motores não entram no diff. O adendum abaixo exigiu somente ampliar a classificação de rotas na navegação compartilhada persist-nav; nenhum método de áudio foi alterado.

Capturas: qa/desktop.jpg e qa/mobile.jpg. Scripts de QA são somente testes; nenhuma instrumentação foi instalada no site.

## Separação

Radar, referências privadas, workflow e controle editorial estão somente na branch privada específica. Zero nova matéria nesta reforma; nenhuma automação editorial antiga reativada. PR OPEN/DRAFT: https://github.com/7-Seas-Global-and-Hafen-Consolidators/passport-radio/pull/527. Commit funcional inicial remoto: a1cd24a9526564fbdcf6d6b24f2fc7eef78eceed.

Preview externo bloqueado: Vercel POST /v13/deployments, HTTP 403 forbidden — “You don't have permission to create a project”. Team team_SawIFIaHur2UWtSQdYaaHfxh; alvo preview, sem produção. Nenhum deployment foi criado. CLI Vercel e credenciais próprias de CLI ausentes; nenhuma repetição ou troca de conta. A revisão visual completa está nas capturas persistidas. Um preview hospedado navegável permanece pendente por essa restrição concreta; não foi apresentado link fictício.


## Adendum A–Z — incorporado na mesma PR #527

Referência fornecida: Texto colado(20261008-214444).txt, 396.916 bytes, SHA256 b60aaf304b374e6003df86d91dc0b1de89c342ba589e6360f6002a31e1b32596. Engenharia observada: diretórios de artistas, integrantes e resenhas de álbuns interligados. Não foram copiados texto, biografias, fotografias ou layout do Classic Rock Artists, RADIO BOB! ou Metal Hammer.

2.767/2.767 links únicos do A–Z apontam para blobs existentes em blog/e/. Os hubs bandas/artistas possuem apenas index.html, sem perfis próprios individuais. A prioridade adequada nesta base é a coleção editorial existente; busca interna é oferecida como caminho adicional. Nenhum destino #, página nova vazia ou rota inventada.

Dados novos: data/blog-artist-navigation.json registra somente sete entidades e quatro vínculos explícitos fornecidos no adendum: Ozzy ↔ Black Sabbath; Bruce ↔ Iron Maiden; David Coverdale ↔ Deep Purple e Whitesnake. Não usa coocorrência para inferir formação. David Coverdale utiliza a coleção legada real /blog/e/da-vidcoverdale.html (7 histórias); o rótulo histórico não foi reescrito. Não foram criadas milhares de páginas.

Novo helper compartilhado passport-artist-navigation.js acrescenta filtro A–Z, retorno ao índice, busca e vínculos de formação às páginas alcançadas pela navegação Blog/A–Z. Em matérias, só consome entidades explícitas já presentes em .blog-entities; não toca em texto, metadados, mídias ou assinatura. O helper vive no documento externo existente e acompanha o reader já usado pelo site. Entradas diretas em coleções históricas não foram regeneradas em massa; o enriquecimento é disponibilizado pela navegação do Blog/A–Z. Links estáticos permanecem funcionais mesmo sem JavaScript.

Correção mínima indispensável: js/passport-persist-nav.js, uma linha em knownEditorial, adiciona namespace /blog/ à mesma classificação de /editorial/ e /historias/. Sem isso, o A–Z era tratado como documento desconhecido e substituía o documento do transporte. Não foi criado mecanismo, iframe de rádio, nova conexão, autoplay ou chamada de áudio. passport-audio-continuity.js permanece byte a byte intacto. CSS do helper só controla os elementos novos/pele do arquivo, em branco/preto/vermelho e as três fontes Passport. blog/arquivo/letras.html recebe apenas os scripts de integração; seus 2.767 links e metadados permanecem intactos.

QA adicional: 17 transições controladas, incluindo Home → Blog → A–Z → Ozzy → matéria → retorno, Ozzy/Black Sabbath, Bruce/Iron Maiden, Coverdale/Deep Purple/Whitesnake e percurso A–Z/artista/matéria/retorno em desktop e mobile. PASS: mesmo elemento e documento, currentTime crescente, um áudio reproduzindo, zero chamadas/conexões adicionais; entrada pausada permanece pausada. Desktop1440 e mobile390: sem overflow, 2.767 entradas intactas, controles branco/preto/vermelho. Capturas e evidências em qa/az-*. Stream externo real permanece não certificado, separadamente do transporte controlado.

Arquivos adicionados pelo adendum: js/passport-artist-navigation.js, css/passport-artist-navigation.css, data/blog-artist-navigation.json e qa/az-*. Alterações de integração: blog.html, blog/arquivo/letras.html e uma linha de js/passport-persist-nav.js. Nenhuma das 21.933 matérias alterada. Radar/PR privada permanece separado e não recebe este adendum.
