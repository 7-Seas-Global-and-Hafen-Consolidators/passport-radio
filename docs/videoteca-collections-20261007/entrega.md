# Videoteca — organização editorial, sem merge

Base main: `00667acc08b959c4858843cfbd0c206dbc9e036c`.
Branch: `feat/videoteca-editorial-collections-20261007`.

7.117 vídeos antes e depois; zero IDs perdidos e zero duplicação física. O catálogo e as duas auditorias permanecem byte a byte intactos. `passport-videos-collections.json` guarda regras editoriais e referências aos IDs destacados, sem copiar vídeos. Coleções podem se sobrepor.

| Coleção | Vídeos |
|---|---:|
| BBC | 4.202 |
| Wacken | 1.508 |
| The Midnight Special | 1.301 |
| Em Alta | 107 |
| Brasil | 16 |
| Acervo Passport | 106 |
| Catálogo completo | 7.117 |

BBC/Wacken/Midnight reutilizam os vínculos persistidos. Brasil e Em Alta usam listas editoriais explícitas de artistas existentes. Em Alta é uma seleção editorial; não foi feita pesquisa externa de ranking. A configuração aceita novos artistas e registros sem reconstruir a página. Todo registro fora dos três conjuntos principais permanece no Acervo Passport e no catálogo completo. As coleções antigas continuam no seletor, com ordens significativas preservadas.

BABYMETAL (`KG_fqkyJ-wo`) e Arch Enemy (`XXbK7ypyB4k`) são os dois primeiros cards do catálogo geral. Os demais vídeos e suas thumbnails não foram substituídos. Cards mantêm imagem, artista, performance e data comprovada, sem metadados de aquisição. Masthead, navegação, footer, grid, cards, fontes e breakpoints existentes foram preservados; estilos novos limitados aos controles das coleções.

QA desktop1440/mobile390: todos os7117 IDs encontrados pelas297 páginas; seis coleções com IDs comparados; busca por artista, ausência de resultados, formato, retorno à primeira página e coleção Marillion em ordem PASS. Sem overflow ou erros JavaScript. Player aparece somente após clique intencional, usa autoplay=0 e mantém apenas um iframe; teste da API controlado. O bloco original do player/interlock é byte-idêntico. Reprodução externa YouTube não foi certificada nem reavaliada; imagens reais existentes carregaram nas capturas.

Nenhum arquivo de rádio, stream, Bus, mutex/interlock, engine, continuidade editorial, Podcast/Broadcast, Home ou workflow alterado. Nenhuma aquisição, substituição ou download de vídeo foi feito.

Evidências: `integrity.json`, `browser-qa.json`, `qa.cjs`, `videos-1440.png`, `videos-390.png`.

Arquivos existentes alterados: `videos.html`, `js/passport-videos.js`, `css/passport-videos.css`.
Arquivos novos: `data/passport-videos-collections.json` e os sete arquivos deste diretório (`CHECKPOINT.json`, `integrity.json`, `browser-qa.json`, `qa.cjs`, `entrega.md`, `videos-1440.png`, `videos-390.png`).
