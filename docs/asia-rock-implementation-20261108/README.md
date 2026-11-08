# Asia Rock™ — implementação isolada

Base conferida: `main` / `d070f26a9e40918950e66a1a0abbac936747c336`. Especificação: PR #593; conexão técnica e acréscimo de cadastro expressamente autorizados pelo proprietário. Nenhum merge ou deploy.

## Alteração

- Um objeto acrescentado **ao fim** de `stations`, em `js/world-radio-player.js`, no índice 313. Todos os objetos anteriores e toda a lógica após o array permanecem idênticos.
- Um registro acrescentado a `data/passport-radio-inventory.json`, imediatamente antes de New Wave™. Contagem: **402 rádios + 11 seletores = 413 registros**. Os 412 registros anteriores, inclusive índices, nomes e sinais, permanecem idênticos e na mesma ordem relativa.
- Nova arte local: `images/radio/living-collection/passport-asia-rock.webp`.
- Nenhuma alteração em CSS, grade, pacote compilado, áudio, Bus, continuidade, seleção ou controles. Os campos públicos do novo cadastro usam somente Asia Rock™, Passport Radio e a descrição editorial aprovada. Não há nome externo como alternativa, origem ou fallback.

Os hashes históricos e metadados de adições anteriores do inventário foram preservados. O teste compara os arquivos atuais diretamente contra a base, sem usar esses hashes como prova.

## Fotografia

Fotografia promocional real publicada na entrevista direta [HallyuTones, 06/09/2026](https://hallyutones.com/2026/09/06/interview-alice-syndrome-a-deep-dive-into-their-sound/). A legenda identifica, da esquerda para a direita, **Awon, Taira, Sebeen e Jeongmin**. Comparadas também as fotografias de grupo em KProfiles e kpopping.

[Arquivo original da fotografia](https://hallyutones.com/wp-content/uploads/2026/09/eb8ba8ecb2b42-1.jpg): 3000 × 2400 px, metadados de câmera Canon EOS R5. SHA-256 original: `c6b007b1ce40bf0d5a6a18cfda150a445c36deb32ddffb10fcb481e4a258e3e8`.

Tratamento: recorte fotográfico `(100,480)-(2900,2400)`, incluindo os quatro rostos e excluindo o cabeçalho gráfico, redimensionamento proporcional e margens brancas para quadrado. Sem colagem, reconstrução, IA, deformação ou retoque das pessoas. Resultado: **512 × 512 WebP com perfil sRGB**; nenhum logo ou marca-d'água no arquivo final. Exibição herdada: 68 × 68 px.

## Verificação executada

`verification.json` registra o teste automatizado em Chromium: comparação integral dos registros, índices e lógica; cinco larguras; imagem; estilos dos cartões e cabeçalho preservados; nome acessível; play, pause, retomar, troca New Wave™ → Asia Rock™, um único áudio ativo, manutenção do mesmo documento/áudio ao navegar Blog → voltar, e continuidade ao alternar foco para outra aba vazia.

O teste de controles usa WAV determinístico **somente na resposta de rede do ambiente de teste**. Isso não certifica o sinal remoto nem testa que todas as 401 fontes externas estão disponíveis. A preservação das 401 rádios é comprovada por igualdade dos cadastros e da lógica, não por 401 escutas individuais. A continuidade testada entre abas é a troca de foco, sem iniciar uma segunda estação em outra aba.

`live-audio.json`: amostra real do endereço aprovado, 277107 bytes / 17,32 s; MP3 128 kb/s, 44100 Hz, estéreo. O ffmpeg decodificou 8 s; volume médio -9,5 dB e pico 0 dB. O endereço é usado exclusivamente nos cadastros operacionais, não reproduzido neste relatório.

**Limite do teste direto no Chromium local:** as requisições externas falharam com `ERR_CERT_AUTHORITY_INVALID` no certificado do proxy do ambiente. Não foi ignorada a validação de certificado nem alterado qualquer sistema do produto. Portanto a escuta contínua direta no navegador não é declarada aprovada. A captura real e a decodificação externa passaram. Para as capturas de layout, as fontes das mesmas famílias e pesos já presentes em `fonts/passport-footer/` são entregues ao navegador apenas pelo teste, sem alterar o produto.

## Capturas comparativas

Mesma base, mesma largura, mesmo cabeçalho; primeiras duas fileiras. A implementação respeita 4/3/2 colunas, sem forçar duas colunas no desktop.

| Largura | Antes | Depois |
|---|---|---|
| 1440 px | [Antes](evidence/before-1440.png) | [Depois](evidence/after-1440.png) |
| 768 px | [Antes](evidence/before-768.png) | [Depois](evidence/after-768.png) |
| 480 px | [Antes](evidence/before-480.png) | [Depois](evidence/after-480.png) |
| 390 px | [Antes](evidence/before-390.png) | [Depois](evidence/after-390.png) |
| 359 px | [Antes](evidence/before-359.png) | [Depois](evidence/after-359.png) |

Repetição: `CHROME_PATH=/caminho/chromium PLAYWRIGHT_MODULE=/caminho/playwright node docs/asia-rock-implementation-20261108/verify.cjs`.
