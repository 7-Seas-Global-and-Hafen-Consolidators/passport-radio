# Paula Toller — resgate editorial da PR #578

A #578 já estava mesclada (`84d64da81be0b089dc976b9f563931b907f309f5`), portanto não podia ser reaberta. Correção isolada na branch `fix/paula-toller-editorial-resgate-20261028`, sem merge ou publicação.

## Resultado

- Mesma fotografia real da Paula, internalizada em WebP e recortada proporcionalmente em 3:2: rosto, cabelo e microfone preservados, sem faixas laterais. O leitor de Notícias, seu CSS e os outros cartões não foram modificados.
- Uma única manchete, subtítulo e assinatura originais; abertura e capítulos com tipografia institucional. Os 575 parágrafos fragmentados viraram 63 blocos; todas as palavras da narrativa permanecem na mesma ordem. Removida somente a segunda cópia da manchete.
- Seis discos em cartões editoriais de duas colunas no desktop e uma coluna no tablet/celular, com seis capas autênticas e seis incorporações responsivas 16:9, sem autoplay.
- Os cinco IDs de vídeo existentes foram preservados. Genesis tinha apenas uma descrição textual na base salva: incorporado o registro Shepperton 1973 indicado diretamente pelo [Genesis Museum](https://genesismuseum.com/), ID `sr5xcISnkDU`.
- Um único rodapé, produzido pelo módulo universal já existente, sem rodapé paralelo nem injetor legal legado. CSS universal carregado explicitamente nesta matéria. DOM do conteúdo universal conferido igual ao de Notícias.
- Nenhum catálogo, stream, player, mecanismo de continuidade, outra matéria, Home ou arquivo de infraestrutura alterado.

## Testes executados

- `python tests/test_paula_toller_layout.py`: **4/4**. Hash da narrativa integral, seis capítulos, seis vídeos, sete imagens locais, outros cartões idênticos e composição do rodapé.
- Chromium real em **1440, 1024, 768, 390, 375 e 320 px**: seis capítulos, sete imagens carregadas, um H1, um rodapé universal, vídeos 16:9 e zero rolagem horizontal.
- Contexto adicional com emulação mobile/touch em 390 px. Não foi utilizado aparelho físico.
- Conteúdo principal: **31.063 → 12.785 px em 1440 px**; **36.559 → 23.981 px em mobile 390 px**, mantendo corpo de 18 px. Medição da versão anterior com a fotografia original integral e as fontes institucionais.
- Áudio real, sem simulação: seleção voluntária de uma rádio existente e percurso Home → Notícias → Paula Toller → Notícias. Mesmo elemento conectado, tempo e bytes decodificados avançando e exatamente um áudio ativo. Confirmado no desktop e no contexto mobile. Nenhum código de áudio modificado.
- Navegação, rodapé, imagens e hierarquia conferidos visualmente. Nenhum erro JavaScript nos dois percursos registrados.

## Limitação real dos vídeos externos

**Não foi comprovada a reprodução integral dos seis vídeos.** A geometria e os seis endereços incorporados foram verificados; os cinco links aprovados não foram trocados. Em uma execução, Rita Lee, Clube da Esquina e Chico Buarque mostraram “This video is unavailable”; Minas e Pretenders carregaram seus títulos. Na rodada final dirigida, Rita Lee e Clube da Esquina não concluíram o carregamento, Chico e o novo iframe do Genesis mostraram indisponibilidade, enquanto Minas e Pretenders carregaram os títulos. O ambiente depende do acesso externo ao YouTube, portanto isso não prova indisponibilidade em todos os dispositivos ou regiões. Não declarar estes vídeos aprovados para reprodução. Consultar `video-audit.json`.

A correção visual está disponível para revisão; esta limitação permanece registrada, sem substituir unilateralmente as seleções do proprietário.

## Capturas reais

| Área | Desktop | Tablet | Mobile |
|---|---|---|---|
| Cartão de Notícias | [1440](cartao-1440.webp) | — | [390](cartao-390.webp) |
| Início e fotografia | [1440](inicio-1440.webp) | [768](inicio-768.webp) | [390](inicio-390.webp) |
| Seis discos, grade integral | [1440](discos-1440.webp) | [768](discos-768.webp) | [390](discos-390.webp) |
| Encerramento e assinatura | [1440](encerramento-1440.webp) | [768](encerramento-768.webp) | [390](encerramento-390.webp) |
| Rodapé oficial | [1440](rodape-1440.webp) | [768](rodape-768.webp) | [390](rodape-390.webp) |

Seções individuais: [Rita Lee](disco-1-1440.webp) · [Clube da Esquina](disco-2-1440.webp) · [Minas](disco-3-1440.webp) · [Construção](disco-4-1440.webp) · [Genesis](disco-5-1440.webp) · [Pretenders](disco-6-1440.webp).

Relatórios: [desktop](browser-results.json), [mobile](browser-results-mobile.json), [vídeos](video-audit.json), [testes de preservação](unit-tests.txt), [imagens](image-sources.json).

As fontes institucionais existentes foram servidas localmente no teste para capturas determinísticas; as fontes de produção não foram alteradas. Capturas PNG do navegador foram apenas exportadas para WebP, sem reconstrução do layout ou retoque do conteúdo.
