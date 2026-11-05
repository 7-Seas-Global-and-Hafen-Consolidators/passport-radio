# Validação real da PR #589 — 05/11/2026

Código validado: `5d9d3a53058918fb66e778e56f19efaf551302bf`, branch `feat/blog-comments-google-20261104`.

## Método e limites

Chromium com sessões novas, sem login Google. Páginas públicas reais, recebendo exclusivamente quatro recursos da PR por interceptação local: shell do Blog, compositor editorial, comentários e CSS dos comentários. HTML público, fotografias, Google Apps Script e stream reais. Nenhum áudio simulado. Isso permite validar a PR sem publicar o Blog.

Desktop: 1440 px. Celular: emulação Chromium de 390 px com toque; não houve aparelho físico. A revisão visual inspecionou os formulários vazios, preenchidos e confirmados. Sem transbordamento; branco, preto #111111, botão #C41E3A e tipografia aprovada preservados.

| Largura | Vazio | Preenchido | Recebido |
|---|---|---|---|
| 1440 | [captura](1440-empty.png) | [captura](1440-filled.png) | [captura](1440-received.png) |
| 390 | [captura](390-empty.png) | [captura](390-filled.png) | [captura](390-received.png) |

## Envio, moderação e duplicações

Dois comentários técnicos identificados como “Não publicar”, um por largura. Recebimento anônimo confirmado na tela, uma linha PENDENTE e uma notificação Gmail por ID. Conferência direta na planilha privada e no Gmail após todas as repetições; informações privadas e outros comentários não foram copiados para esta evidência.

O clique duplo gerou apenas um envio. Uma repetição explícita posterior com o mesmo ID foi reconhecida pelo Google sem gerar outra linha ou outro e-mail. A repetição da tentativa inicial também manteve os mesmos IDs.

[Contagens finais e estados](moderation-results.json) · [Resultados completos](browser-results.json)

## Continuidade musical

Percurso real: Home → Blog → matéria Kurt Cobain/Beatles → envio → Home, com Hits tocando. Nas duas larguras: mesmo elemento de áudio, documento e fonte; uma reprodução ativa; volume 0,8 constante; tempo e bytes decodificados avançaram em todos os pontos.

| Largura | Tempo na Home inicial | Tempo no retorno | Reproduções ativas |
|---|---:|---:|---:|
| 1440 | 1,012 s | 64,529 s | 1 |
| 390 | 1,016 s | 59,966 s | 1 |

## Ocorrência observada

Na primeira tentativa desktop, o comentário foi registrado e o aviso chegou ao Gmail, mas a confirmação na tela expirou. A causa da demora não foi determinada. A captura [da expiração](1440-failure.png) e o [registro inicial](initial-attempt.json) foram preservados. A execução completa foi repetida por largura com os mesmos IDs e o mesmo código: ambas confirmaram recebimento e continuidade. O teste não prova ausência de futuras demoras do Google; a expiração inicial continua sendo uma ocorrência real, embora sem perda ou duplicação do comentário.

## Escopo e CI

Esta rodada acrescenta apenas evidências e `integrations/blog-comments/validate-real.cjs`; nenhum arquivo de produção foi alterado. Os hashes dos quatro recursos usados estão no relatório. Main, layout, players, streams, túneis, bus, mutex e interlock permaneceram intactos. Sem merge, deploy ou publicação dos comentários.

CI do código validado: [Passport CI — sucesso](https://github.com/7-Seas-Global-and-Hafen-Consolidators/passport-radio/actions/runs/41955775191) e [Materialize official Passport channels — sucesso](https://github.com/7-Seas-Global-and-Hafen-Consolidators/passport-radio/actions/runs/41955775269).

O teste de aceitação escreve comentários reais e exige autorização do proprietário para novas execuções. Requer Playwright, Chromium em COMMENTS_CHROME e CODEX_PRIMARY_RUNTIME_NODE_MODULES. COMMENTS_ONLY_WIDTH seleciona a largura; COMMENTS_RETRY_ID reaproveita um ID para testar repetição sem novo comentário lógico.
