# Passport Radio — imagem dos controles de reprodução

Base `main`: `365eeb6251fafc14a34f70c60c2f21227ae0fcc2` (PR #586 já mergeada pelo proprietário). Branch: `fix/media-session-official-logo-20261102`.

## Rastreio

- `images/passport-radio-definitive.jpg` é o escudo antigo Route 66. A referência ativa encontrada nas páginas individuais das rádios estava em `js/passport-signal-habitat.js`, na imagem de identificação do cabeçalho.
- Na Home original, com Hits tocando de verdade, `navigator.mediaSession.metadata` era `null`, não havia ícone declarado no documento e nenhuma solicitação da imagem Route 66 foi observada. A Home publicada tinha o mesmo HTML; `/favicon.ico` respondeu 404.
- O ícone antigo de `app/manifest.webmanifest` é um monograma “PR”, não o escudo Route 66, e esse manifesto não estava carregado na Home. Nenhuma mudança nesse aplicativo ou em seu funcionamento.
- A seleção feita pelo sistema no celular relatado não foi observada diretamente: não há aparelho físico conectado. Não foi afirmada a reprodução do defeito na tela bloqueada nem identificada uma entrada específica de cache do aparelho.

[Dados da investigação](before-investigation.json).

## Correção restrita à identidade

A imagem antiga do cabeçalho das rádios individuais aponta agora para a marca atual, mantendo 36 × 36 px. Um arquivo exclusivo de identidade fornece ao navegador a arte oficial para os controles de reprodução e ícones com endereços novos, sem reutilizar a URL antiga em cache.

As duas imagens PNG, de 192 e 512 px, foram rasterizadas diretamente de `images/brand/passport-radio-masthead-2026.svg`: o desenho oficial não foi recriado. `tools/build_media_artwork.cjs` reproduz a conversão. [Imagem oficial fornecida ao navegador](../../images/brand/passport-radio-media-512-20261102.png).

O código altera somente `MediaMetadata.artwork` e ícones. Mantém título, artista e álbum quando já existem. Não instala ações Play/Pause, não altera o estado de reprodução e não toca em elementos de áudio, fontes, volume, streams, bus, mutex ou interlock. Os dois arquivos de apresentação existentes recebem apenas o carregamento dessa identidade; no habitat, também muda uma URL de imagem.

Nenhum HTML, CSS, bundle da Home, catálogo de rádio ou motor foi alterado. A imagem histórica continua no acervo para não quebrar páginas fora deste trabalho; ela não é mais a referência de identificação das rádios individuais nem a arte fornecida por esta correção aos controles de reprodução.

## Provas

- **5/5 testes unitários:** imagem oficial; preservação de texto e objeto de metadados; troca posterior de arte antiga; carregamento duplicado; navegador sem suporte; proteção de quadros incorporados.
- **11/11 verificações de navegador:** instalação sem alterar o corpo da Home e sem autoplay, em 390 e 1440 px; arquivos PNG reais carregados e decodificados com dimensões e hashes corretos; Hits, MPB e Soul com áudio real nas duas larguras; Home → Notícias → Home mantendo o mesmo áudio, fonte, volume, tempo avançando e uma reprodução ativa; logo do habitat trocado com dimensões idênticas.
- Abrir outra aba manteve os streams tocando, mas o navegador sem interface informou `visibilityState: visible`. Esse ensaio **não foi classificado como tela bloqueada nem como suspensão real do celular**.
- **Teste físico de tela bloqueada: PENDENTE.** Este ambiente não oferece celular físico nem acesso à tela de bloqueio do sistema. Nenhuma captura foi apresentada como prova desse teste.
- `git diff --check` e verificação de sintaxe dos três arquivos de produção aprovados.
- [24 arquivos protegidos comparados byte a byte com a base](scope-preservation.json): Home, bundle, CSS, logo original, navegação, continuidade e motores permanecem iguais.

[Resultado do navegador](browser-results.json) · [Testes unitários](unit-results.txt).

## Capturas reais do navegador

Estas capturas mostram as páginas, **não a tela de bloqueio do celular**. Imagens de conteúdo alheias ao teste e documentos de provedores incorporados foram bloqueados igualmente antes/depois; as marcas testadas foram carregadas normalmente.

| Superfície | Antes | Depois | Rádio tocando |
|---|---|---|---|
| Home 390 px | [antes](home-390-before.webp) | [depois](home-390-after.webp) | [tocando](home-390-playing.webp) |
| Home 1440 px | [antes](home-1440-before.webp) | [depois](home-1440-after.webp) | [tocando](home-1440-playing.webp) |
| Rádio individual 390 px | [Route 66 antigo](radio-house-before.webp) | [logo oficial](radio-house-after.webp) | — |

## Reproduzir

Com Playwright, Sharp e Chrome disponíveis:

```sh
node --test tests/media_artwork.test.cjs
ARTWORK_CHROME=/caminho/do/chrome node tests/media_artwork_browser.cjs
```

`CODEX_PRIMARY_RUNTIME_NODE_MODULES` pode apontar para as dependências instaladas no ambiente. O teste usa streams reais, sem substituir respostas de áudio por arquivos de teste. A PR fica em rascunho enquanto faltar a validação física solicitada. Sem merge e sem publicação.
