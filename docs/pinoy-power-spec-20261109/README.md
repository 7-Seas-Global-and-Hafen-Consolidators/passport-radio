# Pinoy Power™ — SPEC neonatal | Passport Radio

**Decisão do proprietário:** novo bebê **Pinoy Power™**, imediatamente depois de **Asia Rock™**, na seção **ROCK, METAL & ALTERNATIVAS**. Esta PR é **exclusivamente a especificação da execução**: não cadastra estação, não altera player, inventário, estilos nem publica o bebê.

## 0. Precedente e limites

- Reproduzir o padrão de implementação documentado na **PR #594 (Asia Rock™)** e sua SPEC precedente **#593**, inspecionando o estado REAL de `main` e o HEAD atual antes de qualquer alteração.
- A PR #594 alterou um cadastro em `js/world-radio-player.js`, um registro em `data/passport-radio-inventory.json`, a arte local e acrescentou relatório, evidências, testes. **Não copiar literalmente índices, URLs, hashes, contagens ou pressupostos históricos.**
- **NÃO MERGE. NÃO DEPLOY. NÃO PUBLICAR.** A execução será em **outra PR isolada**, após esta especificação.
- Escopo: um novo bebê, um registro correspondente, uma foto local, documentação e testes estritamente necessários. **Nenhum reparo adjacente**.
- Não abrir player alternativo, não criar proxy, não redesenhar arquitetura.

## 1. Identidade pública EXATA

| Campo | Valor aprovado |
|---|---|
| Nome | **Pinoy Power™** |
| Subdescrição (texto exato do proprietário) | **Pinoy · Indie · Rock alternativo filipino** |
| Imagem | **Fotografia da Julie Anne San Jose ANEXADA PELO PROPRIETÁRIO nesta conversa**, não procurar substituta e não gerar retrato |
| Posição | **Depois de Asia Rock™ e antes de New Wave™** |
| Seção | **ROCK, METAL & ALTERNATIVAS** |
| Identificador proposto | `passport-pinoy-power` (validar unicidade no estado real antes de usar) |
| Fonte editorial pública aprovada pelo proprietário | Página de reprodução fornecida por ele; referência operacional, **não** nome da rádio |
| Idioma do cadastro | Herdar as convenções da seção e da PR #594; preservar subdescrição aprovada |

Não usar o nome da rádio de origem, nome do operador, provedor, host nem plataforma como `name`, `source`, `terms`, `origin`, `alt`, `title`, rótulo acessível, fallback, legenda, status, texto em tela ou identidade editorial. O nome público exclusivo é **Pinoy Power™**.

**Distinção técnica obrigatória:** esconder a identidade do provedor da *interface* não equivale a esconder a URL de uma requisição feita pelo navegador. **Não prometer invisibilidade de rede**. Não modificar a arquitetura para tentar ocultar requisições. Se houver impedimento incontornável com a regra de confidencialidade, documentá-lo objetivamente e PARAR, sem improvisar.

## 2. Fonte, reprodução e privacidade operacional

- O proprietário aprovou **a página de escuta**, e confirmou empiricamente que o áudio tocou. **Não foi entregue um URL direto de áudio verificado**. A página de rádio **NÃO deve ser cadastrada como se fosse o stream**.
- A executora deve **observar e validar** qual integração permite a reprodução pelo motor JÁ EXISTENTE. Nada de substituir por iframe, redirecionamento ou player externo sem autorização específica.
- Se o stream efetivo for obtido, usar exclusivamente na propriedade operacional exigida pela estrutura atual. Não duplicá-lo em documentos editoriais, testes publicados, imagens, captions, descrições, atributos de interface, logs adicionados ou relatórios.
- Se houver redirecionamento, CORS, certificado, bloqueio regional, playlist ou codec incompatível, **reportar como falha**, sem solução paralela, sem afirmar que passou.
- **Não introduzir `origin` nem metadados do fornecedor na camada pública**. Verificar todos os consumidores de `source`/mensagens de status, inclusive player dedicado, inventário exposto e acessibilidade. Preservar o padrão atual de Passport Radio.
- Segurança factual: qualquer URL entregue diretamente ao navegador pode ser visível nas ferramentas de desenvolvedor; o requisito de não revelar a fonte se aplica à **experiência editorial e aos novos textos públicos**, sem promessa tecnicamente impossível.

## 3. Ordem e inventário

Estado histórico APÓS #594, conforme relatório dessa PR: **402 rádios + 11 seletores = 413 registros**. Alvo esperado após um cadastro novo sobre esse mesmo estado: **403 rádios + 11 seletores = 414 registros**. **Recontar efetivamente antes/depois no HEAD atual; não usar a projeção histórica como prova.**

Ordem visual exigida:
1. Asia Rock™;
2. **Pinoy Power™**;
3. New Wave™;
4. Rock Brasil 80™;
5. Rock Legends™;
6. todos os seguintes, com a ordem relativa original.

- O inserto no inventário fica logo após Asia Rock™ e antes de New Wave™.
- Em `stations` do player, respeitar o mecanismo de ordenação/grupo efetivamente usado; #594 adicionou ao fim do array, logo **não reordenar outros objetos só por conta do visual**.
- Provar que todas as entradas anteriores permanecem idênticas em ID, nome, stream, origem operacional, route, grupo, ordenação relativa e semântica. Evitar tocar nos 11 seletores.
- Não adicionar uma segunda ficha para o mesmo bebê.

## 4. Foto aprovada pela direção

**Foto exata:** retrato de Julie Anne San Jose enviado pelo proprietário no chat, com blazer preto, camisa branca, fundo claro. **O binário ainda precisa ser disponibilizado à executora por anexo à PR ou via artefato de trabalho**. Esta SPEC não simula que a foto já existe no GitHub.

- Nenhuma busca por imagem alternativa, geração por IA, composição, logotipo, marca-d’água, assinatura de emissora ou texto sobreposto.
- Converter a fotografia fornecida para **WebP 512 × 512, sRGB**, sem esticar, sem alterar a fisionomia; recorte conservador, com rosto inteiro e parte superior do busto, sem cortar cabelo/queixo. Verificar se o arquivo fornecido tem resolução suficiente; se não, **não inventar pixels faciais**.
- Caminho sugerido (checar padrão existente): `images/radio/living-collection/passport-pinoy-power.webp`.
- Área exibida: **68 × 68 px** se este for o padrão real da grade no HEAD. Herança de `object-fit`, borda, raio, sombra e alinhamento; sem CSS especial para o bebê.
- Validar sem logo/marca-d’água de terceiros e que o recurso local carrega corretamente nos três formatos de tela.
- Texto alternativo editorial coerente com o cartão, sem atribuir identidade da rádio à pessoa da foto.

## 5. Layout e comportamento visual: SEM REDESENHO

- Preservar **o CSS existente** e a tipografia real da coleção. **Não impor valores inventados** de fontes, cores, grid, padding ou breakpoint.
- O screenshot aprovado mostra quatro cartões por fileira no desktop, com **Asia Rock™** na primeira posição. Inserir **Pinoy Power™** como o segundo, deslocando New Wave™ e os seguintes em fluxo normal; não criar ordenação especial apenas para desktop.
- Verificar layout e foco/hover/ativo em: **1440, 1024, 768, 600, 480, 390 e 359 px** (ou anotar impossibilidade de uma largura). Checar também toque em mobile e zoom.
- Garantir texto legível, sem corte ou overlap; card clicável, miniatura proporcional, indicador intacto, título e subtítulo exatos, contraste e foco visível.
- Preservar 4/3/2 colunas **quando e onde o CSS existente as utiliza**; nunca alterar breakpoints para acomodar a entrada.
- Não alterar cabeçalho, bateria decorativa, layout dos irmãos, animações ou estilo global.

## 6. ÁUDIO RADIOATIVO: PROIBIDO MEXER

Intocáveis sem autorização explícita: **player, `<audio>`, motores de reprodução, bus, mutex, interlock, sinais, tunnels, World Dial, runtime de continuidade, cross-page/aba, listeners, controles, navegação, radio-*** e todo código adjacente de infraestrutura.

**BEBÊ QUE ENTROU TOCANDO SAI TOCANDO EM TODAS AS PÁGINAS.**

O novo cadastro deve apenas se integrar ao mecanismo preexistente. A continuidade de reprodução, incluindo navegação persistente entre páginas e alternância de abas, é invariável. Não fazer um segundo áudio tocar simultaneamente. Não resetar reprodução em mudança de rota se o mecanismo atual a preserva.

## 7. Protocolo cirúrgico de implementação em PR SEPARADA

1. Ler HEAD/branch/main reais, mudanças e estado atual da PR #594. Confirmar que não existem alterações concorrentes.
2. Identificar o cadastro/ordenação e o renderer responsável pelo card, bem como o destino de artwork. Registrar estado e contagens.
3. Receber a foto original anexada (não substituir) e preparar WebP local sem watermark/logos.
4. Localizar um fluxo de áudio *real* utilizável, sem confundir página HTML com stream. Verificar resposta, formato, execução, idioma/repertório e compatibilidade sem alterar o engine; se não houver, **bloquear implementação e informar**.
5. Acrescentar **somente** cadastro do novo bebê e uma entrada no inventário no local lógico correto; preservar arrays/objetos anteriores.
6. Garantir exibição correta do nome e descrição e ausência de marcas/fonte de terceiros na camada editorial.
7. Testar e capturar evidências antes/depois, seguindo o modelo de #594. Não utilizar áudios simulados como prova de recepção real.
8. Criar a PR de implementação com diff mínimo, checklist verificado, resultados de testes, provas de contagem/ordem, limitações verdadeiras, capturas e evidência de reprodução real se obtida.
9. **PARAR SEM MERGE/DEPLOY**, aguardando autorização explícita.

## 8. Matriz de testes exigida

| Cenário | Evidência |
|---|---|
| Identidade | `Pinoy Power™` exato, descrição exata, nenhum nome do fornecedor na interface, acessibilidade ou fallback |
| Foto | arquivo real recebido, WebP 512² sRGB, recorte limpo, renderização 68² se padrão vigente |
| Posição | Asia Rock™ → Pinoy Power™ → New Wave™; todos os seguintes na mesma ordem relativa |
| Inventário | delta **+1 rádio** / **+0 seletor**, zero alterações semânticas nos anteriores |
| Reprodução | Play, pause, retomar, troca com Asia Rock™ e New Wave™, sem áudio duplo |
| Continuidade | navegação para outra página e retorno, alternância entre abas e manutenção do bebê tocando conforme comportamento existente |
| Layout | capturas 1440/1024/768/600/480/390/359 e comparação antes/depois |
| Regressão | testes existentes da Living Collection e inventário, com resultados explícitos |
| Sinal real | captura/decodificação ou escuta efetiva, condições do teste, sem chamar mock de sinal real |
| Escopo | nenhum player/bus/interlock/mutex/selector/CSS global alterado; nenhuma marca d'água ou logo |

## 9. Entregáveis da PR de implementação (não desta PR de SPEC)

- Cadastro efetivo integrado ao mecanismo existente.
- Um registro de inventário.
- Fotografia local aprovada.
- Testes mínimos diretamente afetados.
- `docs/pinoy-power-implementation-20261109/README.md` com prova objetiva dos testes e limitações.
- Evidências comparativas de layout (capturas) e reprodução.
- Link para PR e inventário final verificado, SEM MERGE e SEM DEPLOY.

**Escopo fechado. Nada de Cileidice.**
