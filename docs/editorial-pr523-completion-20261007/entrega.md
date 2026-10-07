# PR #523 — conclusão a partir da fonte persistida

Foram acrescentadas oito matérias: Ella Langley, Noel Gallagher, Soundgarden, Crypta, Racionais MC’s, Björk, BLACKPINK e Lennon/McCartney. Anos 80 Volume 2 e Kurt Cobain foram alinhados integralmente ao Markdown aprovado em `docs/editorial-pr523-source-20261007.md`. Alice Cooper e Nenhum de Nós permanecem byte a byte intactos. Nenhum texto foi reconstruído do chat.

Apenas a correção expressamente autorizada de Soundgarden substitui o bloco de bastidores por **É ASSIM QUE ESSA DROGA CONTINUA VIVA!**. Anos 80 mantém os mesmos 32 IDs na mesma ordem; não contém CLICK, contagem, Girafales ou aula acrescentada. PLOC fica como tarefa separada até existir fonte aprovada persistida; página, fotos e capas existentes preservadas.

| Matéria | URL proposta | IDs YouTube |
|---|---|---|
| Ella Langley | [/editorial/2026/10/07/ella-langley-choosin-texas-country.html](https://www.passportradio.online/editorial/2026/10/07/ella-langley-choosin-texas-country.html) | `7TRZnQn0Ypk` |
| Noel Gallagher | [/editorial/2026/10/07/noel-gallagher-desafetos.html](https://www.passportradio.online/editorial/2026/10/07/noel-gallagher-desafetos.html) | Sem vídeo no texto aprovado |
| Soundgarden | [/editorial/2026/10/07/soundgarden-outshined-power-to-the-people.html](https://www.passportradio.online/editorial/2026/10/07/soundgarden-outshined-power-to-the-people.html) | `C1lyzIpB3Fs` |
| Crypta | [/editorial/2026/10/07/crypta-a-portrait-of-decay.html](https://www.passportradio.online/editorial/2026/10/07/crypta-a-portrait-of-decay.html) | `Pq3GZqsrcBU`, `mPLWPt1c2I0` |
| Racionais MC’s | [/editorial/2026/10/07/racionais-1000-trutas-1000-tretas.html](https://www.passportradio.online/editorial/2026/10/07/racionais-1000-trutas-1000-tretas.html) | `DaCK8snx9ac` |
| Björk | [/editorial/2026/10/07/bjork-biophilia-15-anos.html](https://www.passportradio.online/editorial/2026/10/07/bjork-biophilia-15-anos.html) | `e-j4l_vea9A`, `yHyCSVfYdTg`, `BRmbCe1DenU` |
| BLACKPINK | [/editorial/2026/10/07/blackpink-boombayah-19-bilhao.html](https://www.passportradio.online/editorial/2026/10/07/blackpink-boombayah-19-bilhao.html) | `_HhAzr5DLik` |
| Lennon/McCartney | [/editorial/2026/10/07/paul-mccartney-john-lennon-man-on-the-run.html](https://www.passportradio.online/editorial/2026/10/07/paul-mccartney-john-lennon-man-on-the-run.html) | `QfgVhE1M6ns` |
| Anos 80 Volume 2 | [/anos-80-volume-2-musicas-memoria-brasileira.html](https://www.passportradio.online/anos-80-volume-2-musicas-memoria-brasileira.html) | `HaMEzljVtA4`, `JpbvkcZ5oGc`, `mHLLb7n2xsQ`, `qKbs4yDZpco`, `xuiaL9HD2hw`, `l7bommRIeW4`, `XxoBaEQGMPo`, `b0DL1ZD2qIw`, `Qfn1ZFfPxbU`, `v22YbORzDD0`, `C7Vnf2g6Qpw`, `izE7xZVlF6Y`, `7tuJfud4W6U`, `yZxmmsN2k48`, `skHjKAlTSm4`, `v0a2U_xEiw0`, `vLzj_S0Tzno`, `UlqGA7RCos8`, `JzByVhWju88`, `thGHAHHYwWU`, `fIuXicAzcFo`, `GHXCLnGJLIU`, `0CI5sShJXww`, `ygUuXtg98zA`, `CD8rJlPuX0g`, `W-t0LxHdS_s`, `GUVoVoQ1oRM`, `9FbCT-EEtQk`, `4nIiZlOWqug`, `0CwsvvZWvDE`, `91EjZCt_O1A`, `4WgpGFpi5Oo` |
| Kurt Cobain | [/editorial/2026/10/07/kurt-cobain-lennon-mccartney-beatles.html](https://www.passportradio.online/editorial/2026/10/07/kurt-cobain-lennon-mccartney-beatles.html) | `_24pJQUj7zg`, `rBzA4shGmw8` |

Dez fotos originais acrescentadas sem conversão, corte ou edição. Lennon/McCartney usa as três fotos recebidas; Kurt reutiliza o JPG já persistido. As fotos de Alice, Nenhum, Anos 80 e PLOC não foram recriadas. Hashes SHA-256, nomes dos originais e destinos estão em `article-manifest.json` e foram comparados byte a byte.

## Verificação

- Literalidade dos dez corpos frente à fonte persistida: PASS; somente capa/subtítulo separados do corpo, links sobre palavras já existentes e incorporação dos vídeos nos pontos originais.
- Metadata, autoria Mr. Nomad, uma h1, canonical, imagens originais, preservação dos registros anteriores e 44 IDs exatos: PASS.
- Dez matérias em desktop 1440px e mobile 390px: 20/20 PASS, imagens sem recorte, sem overflow, sem host de rádio duplicado, sem erro de página.
- Geometria 16:9, um header/footer, navegação e ausência de autoplay: 20/20 PASS.
- Notícias e Arquivo: vinte buscas com chamada visível, PASS.
- MPB e Hits já tocando: 62 transições no total, incluindo todas as dez matérias, matéria→matéria e Brian May, PASS. Mesmo documento, runtime, host, elemento áudio e currentSrc; currentTime avança; zero novas requisições de mídia, zero pause/emptied/loadstart/abort/ended e zero chamadas select/init/playPause/pause durante as transições.
- Rádio pausada: trinta transições MPB/Hits/Disco sem reprodução involuntária, PASS.
- Matéria→Home: MPB/Hits/Disco PASS, com a mesma conexão/elemento de áudio.

Os testes usam respostas WAV controladas para os URLs dos engines já existentes. Comprovam sobrevivência real do elemento/transporte à navegação; recepção audível de provedores externos e disponibilidade de playback YouTube não foram certificadas. O mecanismo editorial compartilhado existente foi reutilizado sem alteração.

## Escopo de arquivos

Novos: oito HTMLs editoriais, dez fotos em `images/editorial/2026-10-07-pr523-final/`, checkpoint/manifesto/corpos aprovados/scripts e evidências nesta pasta.
Alterados: `anos-80-volume-2-musicas-memoria-brasileira.html`, HTML existente de Kurt Cobain, `data/editorial-manual-feed.json` e ponte de checkpoint histórico.
Intactos: fonte editorial persistida, Alice, Nenhum, PLOC, capas antigas, feed de prioridade, Home, CSS, player, rádios, streams, Bus, mutex/interlock, engines, workflows e demais sistemas radioativos.

Branch `feat/editorial-alice-nenhum-20261007`. Commit de conteúdo `eacab7f4e5ea4e3543b460c2c8db4b33376197dd`. PR #523 deve permanecer OPEN/DRAFT, sem merge.

## Reproduzir QA

A partir da raiz do repositório:

```sh
node docs/editorial-pr523-completion-20261007/qa.mjs
python docs/editorial-pr523-completion-20261007/literal-qa.py
PLAYWRIGHT_PATH=/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright CHROMIUM_PATH=/tmp/chromium node docs/editorial-pr523-completion-20261007/browser-qa.cjs
PLAYWRIGHT_PATH=/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright CHROMIUM_PATH=/tmp/chromium node docs/editorial-pr523-completion-20261007/geometry-qa.cjs
PLAYWRIGHT_PATH=/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright CHROMIUM_PATH=/tmp/chromium node docs/editorial-pr523-completion-20261007/search-qa.cjs
PLAYWRIGHT_PATH=/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright CHROMIUM_PATH=/tmp/chromium node docs/editorial-pr523-completion-20261007/return-radio-qa.cjs
```
