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
- passport-audio-continuity.js permanece blob b7112885b62b3531511aba5c9681534513600a54; persist-nav, player, Bus, streams e demais motores não entram no diff.

Capturas: qa/desktop.jpg e qa/mobile.jpg. Scripts de QA são somente testes; nenhuma instrumentação foi instalada no site.

## Separação

Radar, referências privadas, workflow e controle editorial estão somente na branch privada específica. Zero nova matéria nesta reforma; nenhuma automação editorial antiga reativada. Preview e PR serão registrados após persistência desta alteração.
