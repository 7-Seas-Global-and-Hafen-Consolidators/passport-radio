> **Recuperação persistida; implementação ainda não aplicada à árvore remota.**
>
> O push Git dos dois commits locais falhou por ausência de credencial: `could not read Username for 'https://github.com'`. Esta branch/PR guarda o patch binário integral em `recovery/full-recovery.patch.gz`, juntamente com checkpoint e evidências legíveis. O conteúdo do site nesta árvore remota permanece igual à main; os resultados abaixo certificam o checkout local reconstruível, não um deployment desta PR. A missão de 3.000 perfis está incompleta.
>
> Para recuperar exatamente os arquivos: usar um checkout isolado da base `d2aeeb64185d3c6f40531dbf7f176be5b4d35a4b`, verificar SHA256 `2b7444d0af553eb4b6c72537be87fc548f829f88c348e7805adda66a24d97786`, descomprimir o arquivo e aplicar com `git apply --binary --unidiff-zero`. O pacote inclui todas as capturas e o inventário completo. Não repetir aquisição, inventário ou QA já persistidos. A restauração precisa preservar os arquivos de recuperação ao atualizar esta mesma branch. Nenhum merge autorizado.

# Continuação global do Blog — 08/10/2026

## Estado verificado

A PR #527 foi mergeada antes desta execução. Base atual: `d2aeeb64185d3c6f40531dbf7f176be5b4d35a4b`. Uma única branch de continuação: `feat/blog-global-artists-3000-20261008`. Nenhum merge nesta operação.

## Correção entregue

O leitor compartilhado já mantinha a rádio no documento externo, usando um iframe editorial fixo. Porém o documento externo continuava com a Home visível e 3.097 pixels de altura; capturas completas e a árvore de acessibilidade ainda incluíam a Home atrás do leitor. Agora a apresentação externa sai do fluxo visual/acessível durante a leitura e retorna ao fechar o leitor, mantendo os mesmos nós do transporte. O host de motores não recebe estas regras de apresentação.

Também foi corrigida a classificação dos diretórios `/blog/`, inclusive `/blog/arquivo/`: antes o filtro de compatibilidade aceitava apenas URLs terminadas em `.html`, causando navegação de documento nesses diretórios.

Um único componente `passport-blog-shell.js` aplica cabeçalho, menu principal, busca, navegação editorial e rodapé institucional nas famílias antigas. Reutiliza a continuidade existente e o componente original de pagamentos com os nove assets aprovados. Adiciona leitura calculada do texto real às matérias quando houver prosa identificada. Não altera textos, autores, mídia, canônicos, contadores, paginação ou dados históricos.

26.184 documentos recebem exclusivamente uma linha de carregamento do componente no head. Não foram regenerados. O manifesto registra hashes individuais antes/depois; remover a linha recupera exatamente cada documento original. Os 21.933 registros do catálogo e os 2.767 destinos A–Z permanecem. Não foram criadas páginas vazias.

## QA

- `qa/results.json`: 12 rotas, desktop 1440 e mobile 390, 24 verificações. Cabeçalho principal, menu principal, menu editorial, main e footer únicos; sem overflow; cores #FFFFFF/#111111/#C41E3A e nove imagens originais de pagamento carregadas.
- Rotas: capa, arquivo por diretório, A–Z, artista, paginação de artista, matéria, busca, autores, países, formatos, épocas e temas.
- Três famílias reais da fachada existente: continuous, mpb e disco. Mídia WAV controlada no teste; mesmo documento, host e elemento; estação, source e volume preservados; tempo crescente; um áudio reproduzindo; nenhuma chamada adicional play/pause/load/src ou requisição de mídia nas oito transições por família. Pausado permanece pausado. Disponibilidade e audibilidade dos streams externos reais não certificadas.
- Antes: `qa/before-layout.json` e `qa/before-stacked-home.png`. Depois: seis capturas desktop/mobile e altura do documento externo restrita ao viewport enquanto o leitor está ativo.
- Verificação byte a byte dos 26.184 hooks: PASS. Catálogo, Home, radio.html, bundle do player, Bus e passport-audio-continuity.js possuem blobs Git idênticos à base.
- Sintaxe Python/JS e git diff --check: PASS. `tests/test_editorial_blog_tunnel.py`: PASS; contratos executados sem aquisição ou publicação. Workflows editoriais não alterados ou reativados.

## Perfis — não concluídos

O HTML fornecido do Whiplash contém 9.911 destinos de artistas. O inventário recuperável separa os primeiros 3.000: 798 correspondências exatas normalizadas com coleções existentes, 2.202 candidatos sem correspondência. Isto não é uma entrega de 3.000 perfis.

**Perfis certificados completos: 0/3.000.** Os anexos são índices; não fornecem, para 3.000 artistas, apresentação factual completa, fotografia com autorização de uso demonstrada, vídeo oficial validado ou relações documentadas. A fonte Metal Hammer contém 98 elementos img, sem comprovação de licença para republicação. Nenhuma dessas imagens foi copiada. A consulta pontual à página Accept do Whiplash respondeu HTTP 200, sem ID YouTube encontrado; não fornece a certificação obrigatória de mídia.

A instrução de copiar integralmente textos do Whiplash e remover autores/fontes para atribuí-los a Mr. Nomad não foi executada. Conteúdo original e mídia autorizada são necessários para completar os perfis. Não houve aquisição massiva, alteração de assinatura histórica, texto inventado ou declaração falsa de completude.

Auditoria lexical do catálogo: 16.447 títulos correspondem aos seis padrões repetitivos apontados. Isto sinaliza revisão editorial; não prova sozinho falsidade de cada registro. Nenhuma matéria foi apagada ou substituída.

Próximo perfil pendente: **10.000 Maniacs**, posição 1. Última posição inventariada: 3.000, **Eric Johnson**. Não existe último artista completo nesta etapa. Os hashes das fontes, correspondências e pendências estão persistidos para retomada sem repetir o inventário.

`CHECKPOINT.json` registra a operação como apresentação concluída e perfis pendentes, com `mission_complete: false`. HEAD final, PR e resultados remotos do CI ficam registrados na descrição da PR para evitar commits de documentação que repetiriam o CI.
