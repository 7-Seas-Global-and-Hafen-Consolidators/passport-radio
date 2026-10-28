# Passport Radio — Masthead Editorial Universal 2026

Implementação visual sobre `d1d2291c950389b3cfe82dc00676cd6da251f879`, na branch `feat/passport-masthead-editorial-20261028`. Sem merge ou publicação.

## Marca e integração

O SVG local `images/brand/passport-radio-masthead-2026.svg` usa contornos vetoriais das letras da imagem aprovada pelo proprietário: uma linha, vermelho `#C41E3A`, contornos pretos/brancos e extrusão com hachuras diagonais. Fundo transparente, sem bitmap embutido, fonte remota, JavaScript ou dependência comercial. Os traçados são escaláveis e editáveis.

A única alteração em um arquivo de produção existente é um `@import` no início de `css/passport-universal-footer.css`, que o módulo institucional já carrega junto às redes sociais do cabeçalho. O novo `css/passport-masthead.css` aplica a mesma marca aos cabeçalhos reconhecidos, sem criar nós, substituir links ou adicionar um observador. A marca textual original continua no DOM para acessibilidade. A–Z conserva a busca, e os templates antigos conservam seus menus e botões.

Desktop: logotipo amplo com redes à direita. Tablet e celular: marca em uma linha, redes abaixo, navegação existente adaptada com quebras naturais. As nove redes usam os mesmos SVGs locais e destinos. O player universal permanece no seu local original abaixo da navegação da Home; nenhum segundo player foi criado.

Arquivos de produção: **SVG novo, CSS novo e uma linha de importação no CSS compartilhado**. Nenhum JavaScript, HTML, catálogo, stream, artigo, imagem editorial, vídeo, carrinho, pagamento ou arquivo de infraestrutura foi alterado. As regras existentes do rodapé permanecem byte a byte iguais após a importação.

## Verificação executada

- **3/3 contratos novos**: vetor independente, importação isolada e preservação das fontes críticas.
- **29/29 testes existentes** de inventário, Living Collection™ e K-Pop. Nenhuma verificação desativada ou expectativa histórica modificada.
- **68 verificações de layout em 25 páginas**, incluindo Home, Notícias, Paula Toller, Agenda, Arquivo, Bandas, Blog, diretório A–Z e letra A, Vídeos, Clips TV, Loja, Participe, Anuncie, Apoie, Podcast & Broadcast, Promoções e oito variantes de templates anteriores.
- Home, Notícias e Paula em **1440, 1200, 1024, 768, 430, 390, 360 e 320 px**. Outras páginas em 1440 e 390 px.
- Uma única marca vetorial por cabeçalho, sem corte ou colisão com as redes; nove ícones carregados, sem filtro; mesmos destinos e ordem dos links de navegação e redes; busca preservada; DOM do rodapé universal idêntico ao anterior.
- Cinco chamadas repetidas ao módulo compartilhado sem duplicação de marca, redes ou rodapé.
- Busca A–Z preenchida com “Queen”; campo e nome de parâmetro preservados. Menu móvel de template antigo abriu e fechou pelo controle existente.
- **Áudio real, sem mock, no desktop e na emulação mobile/touch**: seleção voluntária de rádio, play/pause, volume em 40%, Home → Notícias → Home. Mesmo elemento conectado, tempo e bytes decodificados avançando e um único áudio ativo. A medição da continuidade começa após a conclusão da pausa/retomada voluntária. Não foi usado aparelho físico nem testada individualmente a reprodução dos 401 sinais.
- Zero erros JavaScript nos percursos registrados. As 401 rádios e os 11 seletores permanecem no inventário original.

## Limitações verificadas

A Home já apresentava largura de documento de 585 px em viewports de 320–430 px, causada por conteúdo editorial fora do cabeçalho. Uma matéria antiga já media 411 px na largura de 390 px. O comparativo com o CSS anterior confirmou os mesmos valores: o novo masthead e sua navegação cabem na tela e não introduziram esse extravasamento. O conteúdo dessas páginas foi preservado, conforme o escopo.

As capturas usam o Chromium real e as fontes institucionais locais existentes como fixture para o Google Fonts. Recursos externos fora do escopo foram bloqueados no ambiente de teste; a captura não comprova disponibilidade de todas as imagens ou vídeos editoriais externos. Nenhum desses recursos foi substituído. A aplicação depende dos seletores CSS modernos `:has()`; não foi validada em navegadores antigos sem esse recurso. Não foram realizadas publicação, alteração de DNS ou infraestrutura.

## Capturas reais

| Página | Desktop 1440 | Tablet 768 | Celular 390 |
|---|---|---|---|
| Home + player existente | [ver](home-1440.webp) | [ver](home-768.webp) | [ver](home-390.webp) |
| Notícias | [ver](noticias-1440.webp) | [ver](noticias-768.webp) | [ver](noticias-390.webp) |
| Paula Toller | [ver](paula-1440.webp) | [ver](paula-768.webp) | [ver](paula-390.webp) |

Também: [Home mobile/touch](home-mobile-touch-390.webp), [Bandas](bandas-1440.webp), [A–Z com busca](az-390.webp), [Loja](loja-390.webp), [template antigo com menu](legacy-menu-390.webp), [reportagem antiga](legacy-story-1440.webp) e [Promoção](promocao-390.webp).

Relatórios: [layout e áudio](browser-results.json), [controles adicionais](additional-controls.json), [testes novos](unit-tests.txt) e [testes existentes](existing-preservation-tests.txt). As capturas PNG foram somente exportadas para WebP; o layout não foi reconstruído nem retocado.
