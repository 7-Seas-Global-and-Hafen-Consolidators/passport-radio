# Correção cirúrgica do diretório A–Z

Base main após a PR #538: `e3e2bc49d24e6f224943a7aaa11adcaf9c12860f`.

Somente apresentação: janela compacta de até cinco números vizinhos, extremos, Anterior/Próxima e página atual. Os 110 documentos mantêm links HTML reais. A melhoria JavaScript substitui a paginação estática apenas depois de receber o catálogo; sem catálogo, os links originais continuam disponíveis. Busca e filtros existentes preservados.

Categorias organizadas em três colunas no desktop, duas no tablet e uma no celular. Apenas rótulos exibidos foram corrigidos; destinos, contadores e dados originais não mudaram. A linha A–Z/Blog duplicada e o título redundante foram retirados do painel.

Preservação: funções pictures() e cards() e stylesheet de cartões idênticos byte a byte. Mapas de mídia, nomes, associação artista–foto, créditos, licenças, catálogo de 2.679 registros (2.629 artistas + 50 temas), checkpoints e todos os assets originais inalterados. Rodapé universal, continuidade, motores de rádio e player inalterados.

Validação: 110 documentos comparados com a base; todos os bytes fora das categorias, paginação e versões dos recursos preservados. 16 casos reais no Chromium hospedado: páginas 1, 2, 55 e 110 × 1440/390px × JavaScript ativado/desativado. Um pager visível, página corrente correta, links/controles adjacentes funcionando, categorias legíveis e sem rolagem horizontal. Fotografias e créditos comparados com o mapa original e carregados no modo JavaScript. Sem JavaScript, preservada a apresentação HTML original de nomes/contadores (fotografias continuam sendo uma melhoria JavaScript do projeto; não se criou outro renderer).

Evidências: VALIDATION.json e 16 capturas page-<página>-<largura>-<js|html>.png. Run: https://github.com/7-Seas-Global-and-Hafen-Consolidators/passport-radio/actions/runs/38075942433

O workflow temporário exclusivo de validação foi retirado do diff após salvar os resultados. Nenhum workflow existente foi alterado. Nenhuma aquisição, reprocessamento de imagens, geração editorial ou reprodução de áudio. Sem merge.
