# PASSPORT RADIO | SPEC EDITORIAL VINCULANTE — SEPULTURA / ANDREAS KISSER / GIULIA
**Data:** 9 nov 2026 · **Autor editorial:** Mr. Nomad · **Status:** PR documental preparatória, aguardando implementação em PR separada e aprovação humana. **NÃO MERGE. NÃO DEPLOY.**

## 0. DECISÃO FECHADA DO PROPRIETÁRIO
- Produzir matéria especial **“Eu sou Sepultura. Sempre fui.” Andreas Kisser, o coração apertado de uma filha e a despedida de uma banda que fez o Brasil ser ouvido pelo mundo**.
- **O texto integral aprovado na conversa de 09/11/2026 é IMUTÁVEL.** Não condensar, reescrever, sanitizar, reorganizar, acrescentar ou remover trechos sem ordem de Mr. Nomad. A cópia editorial de referência está entregue pelo proprietário na conversa; quando transcrita para HTML deve ser cotejada linha por linha. Não gerar outro artigo. O arquivo MANUSCRITO.md nesta PR é a transcrição de trabalho do texto aprovado; qualquer divergência versus a versão aprovada em chat deve ser corrigida em favor desta última.
- Respeito, calor humano, orgulho, emoção e conversa direta. Honra não é funeral. Na experiência pública aceitos “droga”, “merda”, “desgraça” e derivados, sem “porra” ou palavrões pesados internos da oficina. Sem linguagem de professor de música. Sem pesquisa não autorizada e sem histórias ou citações inventadas.
- **Nunca alterar layout institucional, marca, tipografia, identidade, cards existentes, áudio, transmissões, players, 11 seletores, motores, bus, interlock, mutex, World Dial ou infraestrutura compartilhada.**
- Não publicar nada, não gerar merge, não fazer deploy. Esta PR apenas entrega pacote editorial / ordem.

## 1. ESTADO REAL INSPECIONADO ANTES DA ORDEM
Base observada em `main`: `cbd86d0b7393cdfed8974564facf43ec2dd85875` (merge PR #596, conforme GitHub). A página `noticias.html` possui `#news-grid` alimentado por `js/passport-news.js` que combina `/data/editorial-feed.json` e `/data/editorial-manual-feed.json`; cada card usa `title`, `deck`, `url`, `category`, `published_at`, `image.src/alt/approved`. O exemplo `editorial/2026/10/28/paula-toller-cinco-discos-influencias-musicais.html` é referência obrigatória de conteúdo e layout. CSS de vitrine: `css/passport-noticias-paper.css`. CSS editorial: `css/passport-editorial-layout.css` e CSS localizado da Paula. Não alterar esses arquivos globais sem necessidade demonstrada.

## 2. ROTA E CARTÃO DE NOTÍCIAS
- Na implementação, inserir **somente um item** no feed manual já existente (sem sobrescrever os anteriores), com URL proposta `/editorial/2026/11/09/andreas-kisser-giulia-sepultura-despedida.html`. É rota **proposta**, não afirmação de existência.
- Clique no card em `/noticias.html` => página editorial individual no caminho acima, com `← Voltar a Notícias`.
- **Título integral** conforme seção 0, deck curto e envolvente, categoria `HEAVY METAL · ESPECIAL`, byline “Mr. Nomad · 9 de novembro de 2026”, fotografia definida pelo proprietário.
- Deck aprovado para vitrine: “Giulia Kisser cresceu entre camarins, caixas de som e uma família construída ao redor do Sepultura. Agora, a despedida da banda traz de volta lembranças da infância, a saudade da mãe e uma história que vai muito além do heavy metal.”
- Sem duplicar item, não alterar ordenação global, paginação, busca, cards antigos ou rotas existentes; conferir dedupe e cronologia do feed.

## 3. REFERÊNCIA VISUAL OBRIGATÓRIA, NÃO PROPOSTA DE REDESENHO
O proprietário anexou 10 screenshots de referência em 09/11/2026, da matéria **Paula Toller** do site Passport Radio. Eles estabelecem a tipografia, masthead oficial PassportRadio com inspiração Rolling Stone, filete duplo preto, menu, categoria vermelha, H1 serifado enorme, subtítulo cinza, byline, foto principal larga, crédito, texto em coluna central estreita, drop cap vermelha, índice clicável, seções com separadores vermelhos, fotografia à esquerda e texto à direita quando cabível, vídeo embutido em moldura branca com filete vermelho, fecho editorial e rodapé institucional com pagamentos/redes.
- Identidade: branco `#FFFFFF`, preto `#111111`, vermelho editorial `#C41E3A` no layout de artigo; **no CSS atual da listagem** `--news-red:#d0021b` (usar cores atuais de cada habitat; não unificar à força).
- Fontes reais já presentes: `Bodoni Moda` (títulos), `Source Serif 4` (leitura), `Instrument Sans` (metadados), e aliases do CSS editorial `Passport Editorial Display/Text/Sans`. **Não carregar fontes novas, não copiar marca da Rolling Stone, não substituir logo original.**
- Desktop na lista: `news-grid` de 3 colunas, gap atual 34px/28px, imagem 3:2, categoria e H2; tablet <=900px: 2 colunas; mobile <=560px: 1 coluna, conforme **CSS observado**.
- Artigo desktop: `max-width:1240px` no container, hero title 56px, deck 22px, leitura 20px/1.7 e coluna focada; tablet 768–1199: H1 42px, deck 20px, leitura 19px; celular <=767: H1 34px, deck 18px, leitura 18px; <=374: H1 32px, leitura 17.5px. **Reaproveitar CSS existente, não criar uma nova estética.**
- Aparelhos para evidência: desktop 1440×900, 1280×800; tablet 1024×768, 768×1024; mobile 390×844, 375×812, 320×640. Conferir imagens sem corte indesejado, sem rolagem horizontal, texto legível, sumário navegável, tocadores 16:9, metadados, créditos e links, logo, menus, footer e preservação dos outros artigos.

## 4. QUATRO FOTOS ORIGINAIS, EXATAMENTE ESTAS, NENHUMA SUBSTITUIÇÃO
Anexos enviados na conversa; **não constam ainda em binário nesta PR**. O proprietário se dispôs a anexá-los ao comentário da PR. NÃO usar imagens de busca, placeholder público, IA, crop sem autorização ou foto de outra pessoa.
1. **HERO e card:** Andreas sorrindo com Giulia BEBÊ — arquivo do usuário `image(20261109-122107).png`, 1000×580. Alt: “Andreas Kisser sorrindo ao lado da filha Giulia ainda bebê”. Deve abrir a história com o vínculo pai-filha.
2. **Guitarrista ao vivo:** `image(20261109-124926).png`, 2048×1365. Inserir na seção Andreas Kisser, depois da construção do contexto, com crédito a identificar.
3. **QUATRO da formação clássica:** `image(20261109-125227).png`, 1200×675. Usar na seção “Quatro homens, uma fotografia”, com alt mencionando Max Cavalera, Igor Cavalera, Paulo Jr. e Andreas Kisser (conferir identificação antes de legenda nominativa).
4. **Foto de grupo familiar/bastidor:** `image(20261109-125453).png`, 768×512. Usar na parte de memória e família com alt descritivo, sem inventar parentescos ou identidades individuais.
- Fotos como conteúdo editorial com `<figure>`, `<img>`, `<figcaption>`, `loading` apropriado. Hero `fetchpriority=high`, interiores lazy. Crédito fotográfico **não presumir**; manter pendência visível na revisão até o proprietário fornecer informação.
- Os 10 prints `image(20261109-132839).png`, `132902`, `132943`, `133018`, `133048`, `133116`, `133144`, `133208`, `133257`, `133342` são **referência visual** e não conteúdo a publicar dentro da matéria. Se anexados à PR, não substituem a página real.
- A executora deve obter os **binários exatos** dos anexos da PR do proprietário; se não existirem na PR, declarar bloqueio de asset, NÃO inventar alternativa.

## 5. DOIS VÍDEOS FIXOS ESCOLHIDOS PELO PROPRIETÁRIO
- Capítulo **Barcelona, 1991. AGORA VAMOS MOSTRAR QUEM ERA O MONSTRO AO VIVO!** — “Dead Embryonic Cells” formação clássica. Link exato fornecido: `https://youtu.be/vtHbE2XOY2Q` ID `vtHbE2XOY2Q`.
- Capítulo **Inglaterra, 1994. “WE ARE SEPULTURA FROM BRAZIL!”** — “Territory”, Monsters of Rock. Link exato fornecido: `https://www.youtube.com/watch?v=oBkPwnwuXkg` ID `oBkPwnwuXkg`.
- Em implementação utilizar o padrão já existente de embed YouTube 16:9, com título acessível, sem autoplay e sem tocar no motor radiofônico. Preservar os dois vídeos em seus capítulos, nessa ordem. Testar reprodução/noembed com transparência; não substituir por vídeo qualquer.

## 6. COMPOSIÇÃO EDITORIAL E SEO
A matéria tem abertura com a foto de Andreas e a pequena Giulia; índice em 12 itens; seções narrativas sobre infância, Patricia, Andreas, quatro músicos, dois shows, despedida e homenagem; convite aos fãs para compartilharem registros; política **EDITORIAL GRATUITO**; Blog aberto; seção lúdica SEO pizza; encerramento “Primeiro a história. Depois a música.” **Nenhuma seção omitida.**
SEO técnico coerente com o padrão existente: `<title>`, meta description, canonical da URL proposta, OG/Twitter, `Article` JSON-LD com autor Mr. Nomad, data correta, imagens reais e hero; título/alt coerentes; **não inventar palavras-chave de fatos não presentes**. Parte “Olá, Google. Tem pizza para você 🍕” **mantida no corpo** como opção editorial autoral, não removida por preferência da executora.
CTA para `/blog.html` e `/blog/envie-sua-historia.html`, e canal editorial para artistas já existente no site `/divulgar-bandas.html`, sem inventar formulários novos. Não cobra um centavo para matéria editorial; anúncios são separados.

## 7. RISCO ZERO AO PRODUTO
**PROIBIDO** alterar: `radio-*`, `<audio>`, reprodução, stream, fontes/túneis/operações públicas, motores especializados, buffer, bus, mutex, interlock, World Dial, 11 seletores, funcionalidades de pagamento ou rodapé comum. **BEBÊ QUE ENTROU TOCANDO SAI TOCANDO EM TODAS AS PÁGINAS.**
Não mexer em PR #595 ou qualquer PR alheia; nova PR de implementação separada quando autorizada, com diff mínimo. Sem merge, sem deploy.

## 8. CRITÉRIOS DE ACEITE DA IMPLEMENTAÇÃO FUTURA
- Comparar HEAD e base; listar arquivos alterados e motivos.
- Card com foto original, título, deck, data no feed manual; clique abre rota `/editorial/2026/11/09/...`; botão volta.
- Transcrição do corpo **integral e literal** da redação aprovada, incluindo 12 seções, palavras liberadas, SEO e chamada gratuita e Blog.
- 4 fotografias exatas, crédito e textos alternativos; 2 vídeos exatos com embeds.
- Cabeçalho, logo, fonts, cores, filetes, sumário, coluna central, imagens lado a lado, vídeos, footer conforme a matéria Paula Toller.
- Testes desktop/tablet/mobile com prints antes/depois, URLs, status de carregamento, links, SEO/JSON-LD e não regressão.
- PR separada de implementação com evidências; **não merge e não deploy** sem ordem expressa.

## 9. NOTA SOBRE ESTA PR
PR **SOMENTE DOCUMENTAL**. Não há artigo publicado, card inserido nem fotos incorporadas ao repositório nesta etapa. As mídias binárias não puderam ser enviadas pelo conector usado; proprietário pode anexá-las ao comentário da PR. Nenhuma validação visual de browser/CI/deploy da futura implementação deve ser alegada como realizada.
