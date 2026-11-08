# PASSPORT RADIO | ASIA ROCK™ | CIRURGIA NEONATAL — ESPECIFICAÇÃO VINCULANTE
**PR #593: documentação e autorização de escopo, SEM implementação. NÃO MERGE. NÃO DEPLOY.**
**Política prioritária: A COZINHA DA PASSPORT RADIO NÃO É PÚBLICA.**

## 0. SIGILO ABSOLUTO — REGRA DE PUBLICAÇÃO
- O único **nome editorial e público** do bebê é **Asia Rock™**. Não mostrar nome de emissora, plataforma, fornecedor, marca ou origem do áudio em cartões, metadados editoriais, comentários, PRs, descrições, documentação pública, capturas de tela, mensagens de erro, logs expostos ou links de navegação.
- **Não publicar URLs de streams, endpoints de fornecedores, túneis de terceiros ou listas de origens em documentação, PR, comentários, capturas ou código entregue ao navegador.** Não reproduzir nem os URLs já presentes no repositório em novos relatórios. O link aprovado já foi entregue diretamente ao proprietário na conversa privada e deve ser tratado como dado operacional restrito; **não é reproduzido aqui**. Não pedir ao proprietário que publique o link na PR.
- **Distinção essencial:** esconder a URL no cartão ou renomear o fornecedor não oculta a origem de uma conexão de áudio feita diretamente pelo navegador. A estrutura atual contém URLs de origem em código público. Logo, não afirmar que os túneis estão secretos, nem implementar uma falsa proteção cosmética. **A exigência de sigilo real requer solução de entrega de áudio do lado servidor que não exponha o upstream ao navegador.** Essa arquitetura **não está autorizada** nesta cirurgia neonatal; não modificar transportes, proxy, player ou infraestrutura para inventá-la. Se o novo canal exigir exposição do túnel no cliente, **PARAR E RELATAR O BLOQUEIO ANTES DE QUALQUER IMPLEMENTAÇÃO OU PR DE CÓDIGO**.
- Não usar o nome da banda como marca da estação; Alice Syndrome é **homenagem fotográfica editorial**, não a emissora, não a fornecedora de áudio.
- Não acrescentar o endereço aprovado em nenhum arquivo público nem na futura PR. Se for necessário acesso operacional, solicitar um canal privado autorizado pelo proprietário e referenciar apenas um identificador opaco, sem conteúdo sensível.
- Esta regra prevalece sobre as instruções antigas que pediam registrar `stream` literal em `js/world-radio-player.js`. **A autorização anterior de inserir um objeto de dados contendo o stream está SUSPENSA até existir caminho comprovado sem exposição pública.**

## 1. IDENTIDADE E POSIÇÃO IMUTÁVEIS
- **Nome visível:** `Asia Rock™` (exatamente, inclusive ™; não usar nome de terceiros).
- **ID interno proposto:** `passport-asia-rock` (confirmar ausência de colisão).
- **Categoria:** `ROCK, METAL & ALTERNATIVAS`, Living Collection™ seção 2.
- **Descrição visível:** `K-Rock · J-Rock · Rock asiático moderno` (programação mista, não prometer exclusividade coreana).
- **Posição:** 1ª fileira à esquerda: `Asia Rock™`; 1ª fileira à direita: `New Wave™`. Na segunda: `Rock Brasil 80™` e `Rock Legends™`. Todos os demais preservam a ordem relativa.
- **Referência antes:** captura anexada pelo proprietário na aba Conversation da PR #593. Conferir visualmente a imagem e o CSS real; a imagem não autoriza redesenho.

## 2. AUDITORIA DE LEITURA CONCLUÍDA NO REPOSITÓRIO
- Base `main` no momento da auditoria: `d070f26a9e40918950e66a1a0abbac936747c336`; revalidar antes de executar.
- `data/passport-radio-inventory.json`: **401 rádios**, **11 seletores**, **412 registros**. Alvo lógico com +1 rádio: **402 rádios**, 11 seletores, 413 registros, condicionado à nova leitura.
- `js/passport-radio-grid.js`: renderiza por `row.section` e ordem de inventário. O cartão utiliza `living-radio-card`, `living-radio-cover`, `living-radio-name`, `living-radio-description` e `living-radio-waves`. Clique seleciona por família/nome/índice, não injeta o áudio diretamente.
- `js/world-radio-player.js`: contém array `stations` que alimenta a seleção e inclui estações existentes. **É um arquivo de código entregue ao navegador. Não inserir ali URLs privadas para atender a esta tarefa.** Cadastro visual isolado produziria cartão sem reprodução, portanto **não fazer**.
- Arte existente: `/images/radio/living-collection/<id>.webp`; padrão do manifesto `docs/living-collection-rock-pop-20261027/artwork-manifest.json`: WebP quadrado 512×512, sRGB. Não alterar outras imagens.

## 3. DESIGN EXATO EXTRAÍDO DE `css/passport-radio-grid.css`
**Não criar novo CSS. Reutilizar integralmente classes e regras existentes.**

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

## 4. FOTOGRAFIA REAL OBRIGATÓRIA — ALICE SYNDROME
- Fotografia autêntica, conjunta e reconhecível das quatro integrantes: **TAIRA, AWON, SEBEEN, JEONGMIN**. Não usar ilustração, arte de IA, logotipo, capa, colagem, fotografia de outra banda ou marca-d'água.
- Pesquisar amplamente fontes oficiais, materiais de imprensa e publicações editoriais. Verificar identidades, autoria, crédito, licença e autorização para uso. Não remover marcas-d'água; não publicar imagem sem direito de uso.
- Arquivo final seguindo convenção do projeto: **WebP 512×512 sRGB**, crop fiel sem deformação, quatro rostos preservados, nítido no tamanho exibido **68×68**. Conferir também a leitura da imagem em desktop, tablet e mobile (tamanho CSS exibido permanece 68×68).
- Registrar evidência de licença em meio autorizado; não vazar URLs de streams na documentação de fotografia. Se foto não estiver autorizada, relatar bloqueio, não usar placeholder.

## 5. PRESERVAÇÃO NEONATAL E TESTES
**401 bebês e 11 seletores INTOCÁVEIS.** Sem alteração de streams existentes, IDs, índices, metadados, artes, ordem relativa ou funcionalidade. Não tocar em `<audio>`, Bus, interlock, mutex, World Dial, lógica de `radio-*`, transporte, players ou CSS global.
- Comparar inventários e cadastros antes/depois; 401 entradas anteriores e 11 seletores idênticos; apenas +1 entrada nova quando a arquitetura de sigilo estiver autorizada.
- Testar foto, ordem, desktop >1024, tablet 601–1024, mobile ≤600, 480 e 359; acessibilidade e reduced motion; play/pause, alternância, ausência de áudio duplo, e regressão de estações antigas.
- Teste de **não exposição:** confirmar que HTML, JS, JSON, CSS, DevTools/Network, logs públicos, links e PR não revelam origem do novo áudio. Se o navegador se conectar diretamente ao upstream, **sigilo não atendido**.
- Nunca declarar teste realizado se não foi executado. Documentar somente evidências verificadas.

## 6. ORDEM DE TRABALHO / CONDIÇÃO DE RETOMADA
**Esta PR #593 é exclusivamente especificação; nenhuma alteração de aplicação deve ocorrer antes de resolver o bloqueio de sigilo real.** A implementação fica **no ventre**, sem branch/PR de código, até decisão explícita do proprietário sobre arquitetura de entrega de áudio que não exponha a origem ao navegador. Não usar proxy ou servidor por conta própria.

Após a autorização específica, fazer a menor alteração possível em PR separada, com evidências de visual, licença da foto, testes e preservação; **NÃO MERGE / NÃO DEPLOY**.

**BEBÊ QUE ENTROU TOCANDO SAI TOCANDO. ZERO CILEIDICES.**
