# Fase 1 — escopo fechado em 37 matérias

PR #584, branch docs/editorial-recovery-197-visual-master-20261030.
HEAD inicial: e8af35f740537b57834a3b70caf4b699c0d808b7.
Base main: 985ada373c3576c1ea5d0607cc8ccc1287db3148.

A ordem mais recente limita a execução às 37 páginas de inventory.json. Os documentos anteriores de 197 páginas continuam como referência histórica, sem autorizar a expansão nesta fase.

Quatro referências coloridas conferidas visualmente (Paula, Festa Ploc, quatro modelos e BLACKPINK), pelos anexos originais do proprietário. Não usar o texto ilustrativo das plantas para substituir as narrativas reais.

Causa confirmada: js/passport-editorial-layout.js agrupa capítulos adjacentes indiscriminadamente e escolhe imagens a partir de palavras encontradas no texto. Isso prende narrativas extensas em cartões estreitos e permite associações incorretas. A recuperação será explícita e restrita às 37 páginas, preservando as outras 160 e todos os sistemas de áudio.

Inventário dos arquivos reais e classificação A/B/C/D concluídos. Implementação, verificação fotográfica, três trocas de vídeo, testes e capturas ainda pendentes neste checkpoint. Sem merge e sem publicação.

## Implementação em andamento

Os 37 HTMLs já optam individualmente pelo novo compositor. Os demais 160 continuam usando a implementação anterior, sem receber classes ou novos modelos. O renderer novo compõe os capítulos por índices/títulos explícitos, preserva nós e links e agrupa somente passagens curtas autorizadas. Blocos de prosa longa continuam em 760 px; fotos de seção e painéis de vídeo têm espaços próprios.

383 capítulos reais mapeados nos quatro modelos. As três URLs de vídeo indicadas já foram substituídas no código-fonte e a identificação do INXS foi atualizada para Japão, 1994. As demais URLs/atributos permanecem intactas.

Primeira passagem de navegador em 1440/320: 37 páginas executadas, sem erros JavaScript. Foram encontrados três arquivos de fotos locais que ainda faltavam no checkout (recuperados do próprio Git) e o deslocamento de uma legenda da hero para a posição correta após a fotografia; a comparação de conteúdo passa a conferir essa legenda separadamente da narrativa. Esta passagem não é validação artística final.

Pendentes: terminar o mapeamento fotográfico por capítulo, rever todos os retratos/épocas, três embeds reais, seis larguras completas, capturas e áudio. Não considerar a PR pronta neste checkpoint.


## Retomada de 30/10/2026 — estado posterior

Volume recuperado e curadoria persistida. As 37 páginas/383 capítulos foram revisados; 222 combinações nas seis larguras passaram, além de 111 capturas de detalhes em resolução nativa. Áudio real aprovado em desktop/mobile via Notícias e Lambrini; 32 testes de preservação/editoriais aprovados. Evidências e fotografias em [REVISAO-VISUAL.md](REVISAO-VISUAL.md). Os três embeds foram testados, mas sua reprodução não passou: INXS e Shakira/Dua Lipa exibiram indisponibilidade; Taylor permaneceu em 0:00 no ambiente. Sem merge, publicação ou alteração dos motores. A aprovação visual continua com Mr. Nomad.
