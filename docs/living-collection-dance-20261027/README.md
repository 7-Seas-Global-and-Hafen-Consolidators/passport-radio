# Living Collection™ · Etapa 2 · Dance

Base: `2a737231ad368f5c56026ad19817d977e52f7c09`, já com a PR #574 mergeada.

Apenas a apresentação da categoria **DANCE, FLASH HOUSE & DISCOTECAS** foi reformada. Os 51 registros reais são renderizados diretamente pelo inventário existente, na mesma ordem, usando o mesmo botão, handler e player universal. O inventário continua com 401 rádios e 11 seletores de programas. A busca localiza sem ocultar canais.

O cabeçalho apresenta os três textos aprovados e uma esfera de espelhos modelada em 3D, com reflexão de iluminação de estúdio, movimento uniforme de 360°/40 s, suspensão de renderização fora da tela e respeito a movimento reduzido. Não gira uma fotografia plana e não acessa sistemas de áudio. Os cartões e seus breakpoints são os mesmos do World Dial™; as novas regras de cabeçalho são restritas a `.living-dance`. Em telas estreitas, o cabeçalho cresce quando o texto exige mais espaço.

As 51 capas locais são diferentes: WebP 512 × 512, perfil sRGB, qualidade 85–86, todas abaixo de 100.000 bytes, 2.686.022 bytes no total. Há 49 composições editoriais originais e duas fotografias autênticas de apresentações dos artistas identificados. As composições originais não são apresentadas como fotografias de artistas reais. O manifesto registra ID, nome, caminho, tema, qualidade, dimensões e hashes. Distância mínima entre os hashes visuais: 18/64.

- [Prancha numerada das 51 capas](evidence/artwork-contact-sheet.webp)
- [Desktop](evidence/preview-desktop.png) · [Celular](evidence/preview-mobile.png)
- [Categoria inteira — desktop](evidence/dance-1440.png) · [Categoria inteira — celular](evidence/dance-390.png)
- [Antes — desktop](evidence/before-desktop.png) · [Antes — celular](evidence/before-mobile.png)
- [Rotação real, ciclo completo](evidence/disco-rotation-real.gif) · [Sequência de quadros](evidence/disco-00.png)
- [Comparação antes/depois](evidence/before-after.webp)
- [Manifesto](artwork-manifest.json) · [Resultados consolidados](evidence/verification.json)

## Verificações

`node --test tests/passport_40_inventory.test.cjs tests/passport_kpop_replacement.test.cjs`: **18/18 aprovados**, sem skips. O hash de proteção da apresentação foi atualizado para o novo arquivo; as verificações dos motores continuam exatas. Nenhum workflow ou guard foi desativado.

O runner `tests/passport_40_living_dance_browser.cjs` utiliza a Home real, arquivos locais e transmissões existentes, sem simulação de áudio. O navegador é isolado, sem sessão do proprietário, com publicidade, telemetria e demais requisições externas bloqueadas; somente os hosts das rádios efetivamente testadas e das fontes institucionais são permitidos. A captura inicial sem esse isolamento foi bloqueada pela revisão automática; as evidências finais são produzidas com isolamento.

**Navegador aprovado:** 1440, 1024, 768, 390, 375 e 320 px; colunas 4/3/2; 51 nomes integrais, imagens válidas e nenhum cartão oculto, sobreposto ou cortado; sem rolagem horizontal. Instrument Sans, Bodoni Moda e Source Serif 4 carregadas. O cabeçalho cresce para 156,8 px em 320 px, preservando a leitura.

**Reprodução real:** Nightclub Frequencies™ selecionada pelo cartão inteiro em desktop e emulação móvel. Play/pause, volume 0,4, Home → Notícias → Home e seleção posterior de outra rádio passaram. Um único áudio ativo, mesmo elemento conectado durante a navegação e nenhum erro de página. No desktop, o áudio avançou de 1,008 para 41,661 s durante o ciclo da esfera, com bytes decodificados de 21.316 para 671.661. Rotação medida: 364.63° em 40.516 s; período configurado de 40 s. Pausa fora da tela e movimento reduzido aprovados. Globo World Dial™ voltou a renderizar ao entrar na tela. Não foi usado aparelho físico; os testes móveis foram executados em Chromium com emulação de viewport/toque.

[Logs unitários](evidence/unit-tests.txt) · [Desktop](evidence/results-desktop.json) · [Mobile](evidence/results-mobile.json).

As evidências da PR #574 e as 42 capas World Dial™ permanecem intactas, assim como globo, inventário, streams, motores, continuidade, Home editorial, notícias, navegação, rodapé e infraestrutura.

Sem merge e sem publicação.
