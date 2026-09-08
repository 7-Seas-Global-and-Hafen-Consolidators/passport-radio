# Novelas Tunnel™ — Passport Radio

## Identidade
Sinal musical 24/7 dedicado às músicas publicadas nas trilhas sonoras de novelas brasileiras até o fim dos anos 1990.

Não é um canal de aberturas de novelas. A unidade editorial é a **música presente nos discos/álbuns de trilha sonora**, nacional ou internacional.

## Janela inicial
- 1970–1999
- Nacional + Internacional
- Vol. 1, Vol. 2, especiais e outros discos de trilha comprovados entram quando existirem.

## Regra de programação — SALADA MISTA
A mistura é a identidade. Não agrupar por gênero, país, década ou novela.

O shuffle pode produzir deliberadamente transições radicais: MPB → rock brasileiro → pop internacional → soul → romântica → new wave → samba → dance.

Proteções mínimas:
1. não repetir a mesma faixa;
2. evitar o mesmo artista em sequência curta;
3. evitar a mesma novela em sequência curta;
4. preservar variedade entre nacional e internacional sem criar blocos separados.

## Metadados mínimos
Cada faixa catalogada deve manter:
- `title`
- `artist`
- `novela`
- `year`
- `soundtrack` (`nacional`, `internacional` ou outra edição comprovada)
- `source_reference`

Uma mesma gravação presente em várias novelas deve ser armazenada uma vez e pode manter múltiplas associações editoriais.

## Player
Nome: **Novelas Tunnel™**
Linha: **1970–1999 · SOUNDTRACK MEMORY · 24 HOURS**
Assinatura editorial: **A próxima faixa pode lembrar uma vida inteira.**

O site toca somente áudio. Nenhum vídeo/iframe faz parte do player.

Endpoint em runtime:
```js
window.PASSPORT_NOVELAS_STREAM = "https://<radio-origin>/<mount>.mp3";
```

Enquanto não houver mount configurado, o player deve declarar `STREAM PENDING`, nunca fingir `ON AIR`.

## Fontes de catalogação
O levantamento inicial parte das playlists e faixas de trilhas de novelas fornecidas na pesquisa editorial, cruzadas com discografias/tracklists para identificar novela, ano e edição e remover duplicatas.

## Proteção
O motor é isolado em `/js/novelas-tunnel.js`. Não substituir nem alterar os motores existentes de Live & Rare™, Continuous Signals™, 80s, Soul, MPB, Passport Hits, 50s & 60s, Flash House, Rock Brasil ou Globo de Ouro.
