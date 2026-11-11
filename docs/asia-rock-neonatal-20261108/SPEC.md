# PASSPORT RADIO | ASIA ROCK™ | CIRURGIA NEONATAL | ESPECIFICAÇÃO DEFINITIVA DO PROPRIETÁRIO

**PR #593: apenas documentação. O proprietário dará a ordem à executora depois. NÃO MERGE. NÃO DEPLOY.**

**ORDEM SOBERANA:** reproduzir fielmente a ordem editorial e operacional editada pelo proprietário. Não reinterpretar exigências, não inventar novas condições de parada, não redesenhar, não ampliar o escopo e não mudar os comportamentos existentes.

## 0. IDENTIDADE PÚBLICA E COZINHA FECHADA — TODOS OS BEBÊS SÃO SAGRADOS

**NOME EXATO E EXCLUSIVO: Asia Rock™.** É proibido revelar ou apresentar como identidade pública o nome da rádio fornecedora, emissora original, plataforma, operador, proprietário da fonte, domínio de origem ou nome externo como alternativa/fallback, **ASSIM COMO OS DEMAIS BEBÊS**. A mesma regra editorial aplica-se às **401 rádios existentes** e ao novo canal.

Nenhum nome de fonte em cartão, embaixo da foto, título, descrição, pesquisa, acessibilidade, créditos, metadados editoriais, interface, mensagens de erro ou reprodução. **O NOME ESCOLHIDO PELO PROPRIETÁRIO É SOBERANO.**

**Endereço direto aprovado:** o endereço EXATO foi entregue à executora na ordem operacional do proprietário. É uso operacional restrito, sem troca de sinal. **Não transcrever o endereço nesta PR, em comentários, especificações ou relatórios**, nem exibir endereço ou nome da fonte na Passport Radio. A executora não precisa adivinhar nem pesquisar outro túnel.

**Instrução expressa do proprietário:** “Não exponha o endereço de origem ao navegador e nem revelar informações. Se o mecanismo atual exigir publicar o endereço em JavaScript, JSON ou requisições diretas do navegador, EXECUTE COM CUIDADO.” Seguir a integração existente, preservando o comportamento dos outros bebês. **A forma de cadastro atual não é motivo, por si só, para nova paralisação da cirurgia**. Não inventar proxy nem alterar arquitetura. A proibição editorial de mostrar a fonte na interface e a necessidade operacional de conexão de áudio não devem ser confundidas. Não prometer invisibilidade técnica de conexão direta; não criar novo bloqueio em decorrência dessa distinção.

**Autorização operacional delimitada:** se necessário para tocar, inserir apenas o novo registro Asia Rock™ no array `stations` de `js/world-radio-player.js`, seguindo o cadastro de outras estações, sem tocar nas existentes ou alterar a lógica do arquivo. Isso não autoriza divulgar o nome da fonte em interfaces, documentação ou PR. Não repetir endereços de terceiros no texto de implementação; o código necessário será avaliado no diff da PR de implementação.

## 1. IDENTIFICAÇÃO E SEQUÊNCIA INALTERÁVEIS

- **Nome público:** `Asia Rock™`, com ™.
- **ID interno:** `passport-asia-rock`, confirmar ausência de conflito.
- **Seção:** `ROCK, METAL & ALTERNATIVAS` (Living Collection™ seção 2).
- **Descrição editorial:** `K-Rock · J-Rock · Rock asiático moderno`.
- **Primeiro cartão:** Asia Rock™.
- **Segundo cartão:** New Wave™.
- **Terceiro cartão:** Rock Brasil 80™.
- **Quarto cartão:** Rock Legends™.
- Manter todos os demais na mesma ordem relativa. Em telas de 2 colunas, os dois primeiros ocupam a primeira linha; em tablets de 3 e desktops de 4, preservar a disposição responsiva da grade.
- **Referência visual ANTES:** captura anexada pelo proprietário na conversa da PR #593. Preservar aparência e ilustração do cabeçalho.

## 2. AUDITORIA E ARQUIVOS-ALVO

- Base `main` da auditoria original: `d070f26a9e40918950e66a1a0abbac936747c336`. Verificar o HEAD real novamente antes de executar.
- Inventário auditado: **401 rádios + 11 seletores = 412 registros**. Após a inclusão: **402 rádios + 11 seletores = 413 registros**, mantidos os anteriores sem alterações.
- `data/passport-radio-inventory.json`: posição, seção, identificação, descrição e arte do novo registro.
- `js/passport-radio-grid.js`: cartão seleciona por família, nome e índice. Usar o comportamento atual, sem reescrever.
- `js/world-radio-player.js`: o array `stations` registra os sinais. Permitido **somente** acrescentar o objeto referente a Asia Rock™ se necessário; não modificar estação, ordem, stream, seleção ou lógica anterior.
- Arquivo de arte previsto: `images/radio/living-collection/passport-asia-rock.webp` (512×512 WebP sRGB). Não alterar fotos já existentes.

## 3. DESIGN EXATO EXTRAÍDO DE `css/passport-radio-grid.css`
**Não criar CSS novo sem necessidade; caso seja estritamente necessário para este bebê específico, é autorizado um ajuste mínimo, com sabedoria e cuidado extremo, sem afetar outros cartões.**

| Propriedade | Valor real |
|---|---|
| Fundo catálogo/cartão | `#FFFFFF` |
| Texto | `#111111` |
| Borda | `1px solid #E5E5E5` |
| Ícone ondas e destaque selecionado | `#C41E3A` |
| Sombra | `0 2px 7px rgba(17,17,17,.035)` |
| Raio cartão | `12px` |
| Altura mínima cartão | `100px` |
| Imagem renderizada | `68px × 68px`, `object-fit:cover`, raio `8px` |
| Nome | `600 14px/1.3 'Instrument Sans',sans-serif` |
| Descrição | `400 11px/1.3 'Source Serif 4',serif`, `rgba(17,17,17,.7)` |
| Cartão base | `padding:14px`, `gap:12px`, colunas `68px minmax(0,1fr) 16px` |
| Kicker coleção | `600 11px/1.3 'Instrument Sans'`, vermelho `#C41E3A` |
| Título cabeçalho Rock | `700 30px/1.15 'Bodoni Moda'` |
| Cabeçalho Rock desktop | `min-height:300px`, `padding:20px`, colunas `minmax(0,1fr) 380px` |
| Ilustração cabeçalho | `width:360px`, `aspect-ratio:1446/1087` |

### Desktop, tablet e mobile: breakpoints VERIFICADOS
- **Desktop >1024px:** Living Collection com **4 colunas**, `gap:16px`; cartão base acima. Cabeçalho Rock usa duas colunas e arte 360px. **A primeira fileira visual em desktop contém quatro cartões**, embora a referência do usuário mostre duas colunas em tela estreita.
- **Tablet / telas ≤1024px e >600px:** Living Collection com **3 colunas**; cartão `padding:12px`, `gap:10px`; cabeçalho Rock `minmax(0,1fr) 300px`, `min-height:250px`; ilustração 260px. **Não forçar duas colunas no tablet.**
- **Mobile ≤600px:** Living Collection com **2 colunas**, `gap:14px`, `align-items:stretch`. Cartão usa colunas internas `minmax(0,1fr) 16px`, `gap:10px`, `padding:12px`; imagem na primeira linha/coluna 1, ondas na primeira linha/coluna 2, textos na segunda linha ocupando ambas as colunas. Cabeçalho Rock: **uma coluna**, `padding:16px 12px`, `gap:16px`; título 23px, ilustração 240px.
- **≤480px:** contêiner geral `padding:0 12px` e `margin-top:12px`. O cartão Living Collection continua com duas colunas.
- **≤359px:** a regra geral da grade comum usa duas colunas; a regra específica Living Collection ≤600px também define duas colunas. Preservar a cascata existente.
- O estado `aria-pressed=true` usa borda vermelha e sombra `0 0 0 1px #C41E3A`; ondas animadas somente quando tocando; respeitar `prefers-reduced-motion`.
- **IMPORTANTE SOBRE POSIÇÃO:** `Asia Rock™` deve ser o **primeiro item da sequência** e `New Wave™` o **segundo**. Eles ficam lado a lado **no mobile de duas colunas**; em desktop (quatro colunas) e tablet (três) aparecem como os dois primeiros cartões da mesma fileira. **Não alterar o grid para forçar o layout mobile no desktop.**



## 4. FOTOGRAFIA REAL — PESQUISAR EM TODA A INTERNET A MELHOR POSSÍVEL

Pesquisar amplamente a melhor **fotografia real conjunta das quatro integrantes de Alice Syndrome**, nítida e com todos os rostos reconhecíveis. **Não usar imagem gerada por IA, colagem, logotipo, foto de outra banda ou imagem com marcas-d'água de terceiros.** Investigar procedência e direito de utilização antes de publicar.

- Arquivo final: **WebP, 512 × 512 px, sRGB**.
- Foto exibida no cartão: **68 × 68 px**, cortada sem deformar e sem excluir integrantes, inclusive em desktop, tablet e celular.
- Mesmo tratamento visual dos irmãos.
- Alice Syndrome integra **a arte editorial do cartão**; o nome da banda **não identifica a fonte do sinal**.
- Registrar a procedência da fotografia sem divulgar a origem do áudio.

## 5. DESIGN E FUNCIONAMENTO INTOCÁVEIS

**401 rádios existentes e 11 seletores INTOCÁVEIS.** Não modificar seus túneis, nomes, IDs, índices, imagens, fluxos ou a ordem relativa. Não mexer nos players, `<audio>`, Bus, interlock, mutex, World Dial ou lógica compartilhada. A única exceção autorizada é **o acréscimo do cadastro do novo bebê**, quando indispensável e sem alterar os registros ou o comportamento existentes.

**REGRA FUNDAMENTAL:** **“Bebê que está tocando, permanece tocando em todas as abas assim como os demais bebês.”** A inclusão deve respeitar o comportamento já existente de reprodução e continuidade entre abas. Não parar o sinal ativo, não criar áudio duplo, não interferir no sistema de alternância.

**CSS:** manter o design; CSS específico só se realmente necessário à inclusão do Asia Rock™, mínimo e sem efeitos colaterais.

## 6. EXECUÇÃO: DETERMINAÇÃO EXPRESSA DO PROPRIETÁRIO

A executora deverá **investigar a forma real de cadastro e entrega do áudio e EXECUTAR COM CUIDADO mesmo quando o mecanismo existente utilizar JavaScript, JSON ou conexão direta**, sem inventar outra arquitetura. **Não revelar nome da fonte na Passport Radio, sob hipótese alguma.**

**Não criar proxy. Não redesenhar a arquitetura. Não deixar o novo cartão sem tocar. Não interromper os demais bebês.** Impedimento real diferente da mera existência do cadastro atual deve ser relatado objetivamente. **Não reintroduzir o bloqueio inventado nas versões antigas desta SPEC.** O proprietário soltará a executora depois de documentada esta ordem; esta PR não é uma PR de implementação.

## 7. TESTES E EVIDÊNCIAS OBRIGATÓRIOS

- Verificar que Asia Rock™ toca pelo endereço EXATO aprovado pelo proprietário e exibe **somente** o nome escolhido.
- Testar iniciar, pausar, trocar estações, continuidade entre abas, ausência de áudio simultâneo e retorno aos 401 bebês existentes.
- Conferir que o inventário resultante tem **402 rádios e 11 seletores**, com 401 originais e 11 seletores preservados.
- Conferir posição, tipografia, cores e foto real em **desktop (>1024px), tablet (601–1024px), mobile (≤600px)** e larguras estreitas 480px e 359px.
- Anexar capturas ANTES/DEPOIS na mesma largura de tela; mostrar primeira e segunda linhas; atestar que o cabeçalho e os demais cartões não mudaram.
- Conferir que **não aparece nome de emissora, fornecedor ou origem**, nem o endereço do túnel **na experiência pública da Passport Radio**.
- Relatar os testes realmente feitos, com resultados e diferenças de arquivos. Não inventar resultados.

## 8. ENTREGA

**Criar PR SEPARADA DE IMPLEMENTAÇÃO**, com identificação da branch, commit, arquivos alterados, fotografia e sua procedência, provas visuais e resultados de teste. Não fazer merge ou deploy. **Não alterar esta PR #593 sem nova ordem.**

**NUNCA REVELAR O NOME DAS FONTES DOS NOSSOS BEBÊS.**

**BEBÊ QUE ENTROU TOCANDO SAI TOCANDO.**

**ZERO CILEIDICES.** 🍼🔒🎸
