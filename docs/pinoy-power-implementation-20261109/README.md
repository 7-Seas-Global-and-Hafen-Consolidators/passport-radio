# Pinoy Power™ — implementação isolada

Especificação lida integralmente: PR #595, incluindo a ordem final e os dois anexos. Precedente: PR #594, já incorporada à `main`. Base efetivamente conferida: `e86a1042fbf24ebe88c16582fd271204500faef3`. Branch: `feat/pinoy-power-neonatal-20261109`. Sem merge, deploy, proxy ou mudança de arquitetura.

## Resultado e preservação

- Nome público exclusivo **Pinoy Power™**; descrição exata **Pinoy · Indie · Rock alternativo filipino**.
- Ordem: **Asia Rock™ → Pinoy Power™ → New Wave™ → Rock Brasil 80™ → Rock Legends™**. Todos os demais mantêm a ordem relativa.
- Cadastro acrescentado no fim do array `stations`, índice **314**, sem deslocar nenhum índice anterior. Inventário inserido imediatamente após Asia Rock™.
- Antes: **402 rádios + 11 seletores = 413 registros**. Depois: **403 rádios + 11 seletores = 414 registros**.
- Comparação completa dos 413 objetos anteriores, incluindo sinais, nomes, índices, rotas, idioma e seletores: idênticos à base fixa. O código depois do array de estações é idêntico, byte a byte. O adaptador de testes também compara os arquivos completos após retirar exclusivamente o novo registro/objeto e reverter a contagem.
- Nenhum CSS, renderer, player, `<audio>`, Bus, interlock, mutex, World Dial, continuidade, listener ou objeto anterior alterado. `js/world-radio-player.js` recebe exclusivamente o objeto de cadastro adicional e a vírgula necessária para anexá-lo.

## Fotografia entregue pelo proprietário

Usado exatamente o retrato de Julie Anne San Jose do [anexo da PR #595](https://github.com/7-Seas-Global-and-Hafen-Consolidators/passport-radio/pull/595#issuecomment-6728544928), também fornecido nesta sessão. O print do outro anexo foi usado como referência de posição.

Original **154 × 154 px**; quadrado inteiro convertido por redimensionamento Lanczos para **WebP 512 × 512 com perfil sRGB**, sem IA, substituição, reconstrução de detalhes faciais, texto, logo ou marca-d'água. A nitidez permanece limitada ao original recebido. Exibição herdada de **68 × 68 px**. Hashes e tratamento em [artwork.json](artwork.json).

## Testes executados

`node --test --test-reporter=tap tests/passport_40_inventory.test.cjs tests/passport_kpop_replacement.test.cjs` — **exit 0: 31 aprovados, zero falhas**. Inclui Living Collection, arte, inventário, seletores, preservação dos transportes e nova comparação integral contra a base de 402 rádios. Apenas três arquivos de testes tiveram expectativas históricas ajustadas; nenhuma comparação anterior foi desativada. [Resumo](tests.json).

`node --check js/world-radio-player.js`, `node --check docs/pinoy-power-implementation-20261109/verify.cjs` e `git diff --check` — aprovados.

[verify.cjs](verify.cjs) e [verification.json](verification.json) registram o teste Chromium com o produto real: posição, identidade acessível, fotografia local, sete larguras, 4/3/2 colunas, estilos dos cartões e cabeçalho comparados com a base, controles e continuidade. O ambiente entrega as famílias/pesos das fontes locais existentes somente nas respostas de rede do teste, sem alteração do produto; as capturas são evidência deste ambiente, não de um dispositivo físico.

Os controles usam **WAV determinístico apenas na resposta de rede do teste**: play, pause, retomada, troca Pinoy Power™ ↔ Asia Rock™ ↔ New Wave™, um único áudio ativo, mesmo documento/elemento durante Blog → voltar e troca de foco para outra aba. Toque em viewport móvel, foco por teclado, hover e zoom de 200% também foram exercitados e registrados. Isso não prova recepção do sinal real. Não foram ouvidas individualmente as 402 fontes externas. A troca de abas não significa transferência de áudio entre documentos independentes.

## Sinal real e pendências

A conexão operacional foi extraída da página indicada pelo proprietário e retornou **HTTP 200, audio/mpeg**. A amostra real contém **425.065 bytes / 17,711 s**, MP3 estéreo, 44.100 Hz. O ffmpeg decodificou **8 s**, média **−14,6 dB**, pico **0 dB**. O limite deliberado de 20 segundos encerrou a captura contínua com curl exit 28; ffprobe e ffmpeg terminaram com exit 0. [Evidência sem endereço](live-audio.json).

**Recepção direta no Chromium não aprovada:** a conexão pelo proxy do ambiente falhou com `ERR_CERT_AUTHORITY_INVALID`. Não foi ignorada a validação de certificado. Manter a PR em rascunho por essa pendência. O áudio decodificado e os controles com mídia simulada são provas distintas. Não há alegação de escuta musical integral ou certificação individual do repertório.

**Transbordamento preexistente da página:** detectado em 480, 390 e 359 px, tanto antes quanto depois. Não foi corrigido por estar fora do escopo. A grade mantém duas colunas e os cartões comparados preservam os estilos; as capturas mostram o trecho da coleção, não certificam toda a página.

## Capturas comparativas

| Largura | Colunas | Antes | Depois |
|---|---:|---|---|
| 1440 | 4 | [Antes](evidence/before-1440.png) | [Depois](evidence/after-1440.png) |
| 1024 | 3 | [Antes](evidence/before-1024.png) | [Depois](evidence/after-1024.png) |
| 768 | 3 | [Antes](evidence/before-768.png) | [Depois](evidence/after-768.png) |
| 600 | 2 | [Antes](evidence/before-600.png) | [Depois](evidence/after-600.png) |
| 480 | 2 | [Antes](evidence/before-480.png) | [Depois](evidence/after-480.png) |
| 390 | 2 | [Antes](evidence/before-390.png) | [Depois](evidence/after-390.png) |
| 359 | 2 | [Antes](evidence/before-359.png) | [Depois](evidence/after-359.png) |

Repetição: `CHROME_PATH=/caminho/chrome-headless-shell node docs/pinoy-power-implementation-20261109/verify.cjs` (Playwright acessível ao Node). O arquivo JSON é a autoridade para resultados individuais; `liveBrowser.pass=false` permanece falha explícita mesmo quando as verificações de cadastro/layout/controles terminam.

## Arquivos

- `data/passport-radio-inventory.json`
- `js/world-radio-player.js` — cadastro adicional somente.
- `images/radio/living-collection/passport-pinoy-power.webp`
- `tests/passport_40_approved_baseline.cjs`
- `tests/passport_40_inventory.test.cjs`
- `tests/passport_kpop_replacement.test.cjs`
- Esta pasta: `README.md`, `verify.cjs`, `verification.json`, `live-audio.json`, `artwork.json`, `tests.json` e as 14 capturas listadas acima.

O endereço técnico aparece exclusivamente nos dois cadastros operacionais. Nome, descrição, acessibilidade, arte e novos textos editoriais não identificam fornecedor, operador ou origem. Nenhuma alteração na PR #595.
