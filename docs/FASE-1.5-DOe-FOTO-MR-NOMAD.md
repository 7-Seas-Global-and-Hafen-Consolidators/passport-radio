# PASSPORT RADIO® | FASE 1.5/2 | FOTO OFICIAL DE MR. NOMAD

**Ordem do proprietário:** integrar SOMENTE a fotografia oficial já fornecida, na página **Apoie** (`/doe.html`). A fotografia não deve ser gerada, editada, recriada, recortada, comprimida nem substituída.

## Arquivo oficial

- Fonte no computador do proprietário: `/home/passportradio/Desktop/ORIGINALS-SITE-PRONTO/assets/mr-nomad.jpg`.
- Arquivo anexado pelo proprietário à conversa da Cileide: `mr-nomad.jpg`.
- Destino no repositório: `assets/mr-nomad.jpg`.
- JPEG original: 1280 × 720, SHA-256 `e8d3a0dcd13b180e8aa9330a37078a7df253d2cab08923d49cacd0c7bc244d11`.
- Não usar cópia inferida, outra fotografia nem placeholder. Conferir hash após copiar.

## Local EXATO da troca

Menu superior **Apoie** → `https://passportradio.online/doe.html` → seção `01 / A PASSPORT` / **QUEM ESTÁ POR TRÁS DISSO?**.

Em `doe.html`, há um único `<figure>` dentro de `section.apoio-person` com a fotografia atual:
`/images/apoio/mr-nomad.png` (1312 × 1199).

Substituir APENAS o `src`, as dimensões declaradas, o `alt` e o enquadramento necessário para mostrar a nova fotografia inteira. Utilizar `assets/mr-nomad.jpg` no local indicado. Manter legenda `Mr. Nomad · Passport Radio` e todos os outros textos exatamente como estão.

Estilo solicitado de exibição da nova foto: `width:100%; max-width:760px; height:auto; border-radius:14px; display:block; margin:0 auto 24px auto;`. Caso o CSS existente da seção imponha recorte, corrigir SOMENTE a regra que afeta esta foto; usar `object-fit:contain`, jamais `cover` que esconda a guitarra Schecter Wayne Hussey Corsair-12 ou a marca `passportradio.online`.

Atualizar `og:image` e `twitter:image` para apontarem para a nova foto oficial somente se ainda referirem a imagem antiga e forem metadados desta mesma página.

## Restrições absolutas

Não modificar `radio.html`, players, streams, ON AIR, AzuraCast, World Dial, bus, interlock, mutex, áudio, vídeos, chat, links financeiros, PIX, meios de pagamento, rodapé global, navegação, fontes, cores ou outras páginas. Não incluir assets das bandas nesta PR. **Não fazer merge.**

## Evidência solicitada à Work

1. Confirmar branch e HEAD antes da alteração; confirmar o arquivo de origem e seu hash.
2. Copiar a imagem binária oficial para `assets/mr-nomad.jpg`.
3. Editar somente o necessário em `doe.html` e, se indispensável, a regra CSS local que recorta a imagem.
4. Testar desktop e mobile, imagem inteira e sem corte, links de Apoie e ausência de regressões.
5. Exibir arquivos alterados, diff, hash da foto, screenshot e resultado dos testes. Deixar a PR aberta para aprovação do proprietário.

**Estado desta PR na abertura:** contém apenas esta especificação. A inclusão do JPEG e a troca da foto devem ser executadas pela Work antes de declarar a implementação concluída.
