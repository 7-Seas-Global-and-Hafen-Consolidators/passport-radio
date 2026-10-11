# Passport Clips TV™ — departamento exclusivo

Base: `68694fa7e8b59d0aa502523ff7a75d0472a35c1d` (main após merge da PR #543).
Branch: `feat/passport-clips-tv-hub-20261011`. Rota: `/clips-tv.html`. Sem merge.

## Intervenção

- Reutiliza `js/passport-clips-tv.js`, o video nativo, a versão existente hls.js 1.7.0 e o peer do Passport Bus. A extensão necessária é selecionar 11 canais no mesmo video, cancelar cargas atrasadas, liberar HLS anterior e limitar carregamento/reconexão. Nenhum motor de rádio alterado.
- Origem original mantida exatamente e apresentada primeiro. URLs técnicas aprovadas e identificadores internos em `data/passport-clips-channels.json`; origens não viram nomes, logos, mensagens ou links na interface. URLs técnicas são públicas e visíveis nas requisições do navegador; não existe promessa de segredo do transporte.
- Cabeçalho segue o shell oficial de `videos.html`; `js/passport-games-navigation.js` acrescenta CLIPS TV aos menus principais existentes, entre Jogos e Vídeos. Não substitui menus ou estilos.
- Home recebe somente a troca do destino da chamada existente. HTML, inventário 151 rádios/11 projetos, editorial, Bus, runtime e motores mantidos.
- Videoteca recebe somente a retirada das duas inclusões de apresentação de TV. Motor, catálogo e dados de vídeos intocados.
- Rodapé é o componente canônico `passport-universal-footer.js`, com os mesmos assets de pagamentos, links, proporções e apoio. Sem checkout novo.

## Canais

1. Passport Clips TV™ (original)
2. 80s Flashback
3. 90s Throwback
4. Rock On (não exclusivo de metal)
5. Just Chill
6. Siempre Latino
7. Hits
8. Nuevo Latino
9. Classic Country
10. Celebrates
11. Hits UK

Gothic TV, Unplugged TV e candidatos reprovados não incluídos. Nenhuma aquisição paralela, mídia baixada ou alternativa inventada.

## Verificação

`before.json` guarda os hashes das superfícies protegidas. Testes focados verificam preservação byte a byte e os únicos deltas permitidos em Home/videoteca. O workflow próprio registra reprodução real por canal (frames avançando, dimensões, áudio decodificado quando o navegador expõe o contador), pausa/retomada, falhas, interlock, navegação, responsividade 320/360/375/390/414/480/768/1280 e rodapé. HTTP 200 sozinho não conta como reprodução. Canais aprovados pelo proprietário permanecem catalogados quando o ambiente hospedado não os reproduz; bloqueios são registrados, sem simular sucesso.

Limites antigos de continuidade entre carregamentos completos são preservados. A saída da TV libera seus recursos; a volta não inicia TV automaticamente. Apenas as rotas já suportadas pelo mecanismo de áudio possuem continuidade real sem reinício.

Resultados finais, PR e preview serão persistidos no CHECKPOINT.json após o ensaio hospedado.

O ensaio antigo Passport 40 foi ajustado exclusivamente ao novo endereço da TV (videoteca continua em Vídeos). Nesta branch ele cede ao workflow focado para evitar repetir auditorias já aprovadas; nas demais branches conserva sua validação completa.
