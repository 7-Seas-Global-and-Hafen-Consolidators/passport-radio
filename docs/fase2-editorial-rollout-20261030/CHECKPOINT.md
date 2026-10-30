# Fase 2 editorial — implementação retomada e concluída para avaliação

PR #583 · branch `feat/fase2-editorial-rollout-all-articles-20261030`.
Base main: `4139873dc89454c17116534691651f125fdf6e90`.
O checkpoint integral foi materializado no commit `1be2011738632d2346d0bbfda0ad70b0e38bbe58`; o bundle permanece como cópia histórica de segurança. Não é mais necessário recuperar o trabalho do bundle.

## Implementação

197 páginas públicas de matérias (166 editorial/ e 31 raiz/historias, incluindo espelhos), mais o gerador das futuras matérias. CSS/JS compartilhados de apresentação: Bodoni Moda, Source Serif 4 e Instrument Sans locais; leitura centralizada, capítulos pareados, fotografias, multimídia proporcional e encerramento organizado. O inventário completo está em articles-adapted.md e articles.json.

Texto original, títulos, sequência narrativa, links e atributos dos 361 embeds YouTube preservados pelo teste de comparação de fonte. Imagens existentes aproveitadas; imagens adquiridas/localizadas e sua procedência estão em acquired-images.json, localized-images.json e image-provenance.json. image-changes.json registra 44 referências de src localizadas/reparadas, incluindo quatro anúncios antigos cujo PNG não existe no repositório, agora com o masthead oficial local. Uma foto indisponível do BMTH foi substituída por fotografia real de apresentação de 2025. Fotografias históricas pequenas não foram artificialmente ampliadas.

A única mudança no leitor existente é o registro do auxiliar de apresentação na lista de auxiliares. Os dados inertes de cada artigo viajam em template com o próprio main. Nenhuma lógica de áudio/roteamento foi reescrita. Os testes históricos normalizam exclusivamente essa entrada e continuam comparando os demais bytes; o teste novo também exige que essa seja a única alteração no leitor.

## Testes executados

- 5 testes de inventário, preservação integral, imagens, gerador e arquivos protegidos: aprovados.
- 4 testes de preservação do piloto: aprovados.
- 57 testes Node de inventário, coleções, preservação de sistemas, seleção e cópia editorial: aprovados.
- 3 testes do editorial automático: aprovados.
- Navegador Chromium real: 197 páginas × 6 larguras (1440, 1024, 768, 390, 360, 320 px), zero páginas com problemas no relatório final. Testes conferem imagens, títulos, cards, rodapé único e ausência de transbordamento. Rechecagens focadas somente nos defeitos corrigidos. Relatório: browser-layouts.json.
- Áudio real, clique voluntário, desktop e mobile emulado: Home → Notícias → Lambrini → Notícias; mesmo elemento conectado, tempo e bytes decodificados avançando, um áudio ativo. Pausar/retomar e volume pelos controles existentes aprovados. Relatório: audio-results.json. Sem mock de áudio.
- Capturas reais em 1440, 768 e 390 px de sete famílias: Lambrini, Paula, acervo, dossiê dinâmico, Top 10, artigo automático e reportagem legada. Abertura, capítulos e página completa, mais rodapé e antes/depois de acervo/dossiê. Arquivos WebP nesta pasta e índice captures.json. Capturas completas muito altas foram reduzidas proporcionalmente a 16.000 px; recortes internos preservam legibilidade.
- node --check e git diff --check executados.

## Limites comprováveis

A auditoria exaustiva de layout bloqueia mídia externa e usa os arquivos reais de fontes locais. Os 361 embeds foram preservados e sua apresentação responsiva verificada; não foram reproduzidos integralmente 361 vídeos. Não houve teste em aparelho físico: mobile usa emulação Chromium com toque. A continuidade foi comprovada no percurso descrito, não em todas as combinações de páginas/estações. A revisão visual usa amostras das famílias; não equivale a revisão humana integral de 197 reportagens. Fotografias históricas de baixa resolução foram preservadas quando não havia substituto factual adequado.

Catálogo das 401 rádios, streams, player, Bus, mutex, interlock, Home editorial, Notícias, masthead e rodapé compartilhados e infraestrutura preservados. Nenhum merge e nenhuma publicação executados.
