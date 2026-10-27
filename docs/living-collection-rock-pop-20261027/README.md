# Living Collection™ · Fase 3 · Rock e Pop

Base: `14daec637ff970bd0b505276cc944be8d189bedc`, com as PRs #574 e #575 mergeadas. Branch própria: `feat/living-collection-rock-pop-20261027`.

## Inventário preservado

O inventário real contém **46 rádios Rock e 123 Pop: 169 cartões**. A ordem recebida usa como referência 47/115/162; a implementação conserva integralmente a quantidade e os registros encontrados na base, sem criar, excluir ou transferir rádios. O catálogo global permanece com **401 rádios e 11 seletores de programas**. Nomes, IDs, ordem, categorias, configurações e dados de reprodução permanecem idênticos à base.

## Implementação

As duas seções existentes reutilizam os mesmos cartões Living Collection™, o mesmo acionamento nativo, o campo de busca e os atalhos existentes. Grade com 4 colunas no desktop, 3 no tablet e 2 no celular; miniaturas de 68 × 68 px, cartões brancos, bordas discretas, nomes completos e ondas vermelhas. Nenhuma categoria foi duplicada ou recolhida. Os títulos originais foram preservados, com Bodoni Moda e identificação Living Collection™ em Instrument Sans.

As **169 fotografias reais e diferentes** estão em arquivos locais WebP de 512 × 512, com perfil sRGB. A seleção inclui artistas das vertentes existentes e representação brasileira, como Legião Urbana, Ratos de Porão, Rita Lee, Angra e Sepultura. As estações identificadas por artistas receberam fotografias dos respectivos artistas. Não foram criadas pessoas fictícias para representar músicos. O [manifesto](artwork-manifest.json) associa IDs, nomes, artistas representados, caminhos, dimensões e hashes; não contém endereços de reprodução.

- **Rock:** bateria monumental fotográfica preparada a partir da referência anexada. Dois grandes bumbos frontais, múltiplos tons, pratos, ferragens e camadas de pulsação localizada e alternada. A estrutura permanece estável.
- **Pop:** Sharp GF-777 vermelho e preto preparado fielmente a partir da referência anexada. Dois decks com quatro carretéis fotográficos giratórios, REC aceso e escala FM/ponteiro estáveis. Alto-falantes, gabinete, alça e antenas permanecem estáveis e inteiros.
- Os equipamentos são decorativos, não geram sons nem possuem controles funcionais. As animações pausam fora da tela e respeitam movimento reduzido.
- Nenhuma biblioteca adicional foi instalada no produto. World Dial™, suas 42 capas, o globo, Dance, suas 51 capas, a esfera e as evidências anteriores permanecem intactos.

Arquivos de produção: `js/passport-radio-grid.js`, `css/passport-radio-grid.css`, `js/passport-living-performance.js` e 171 recursos WebP novos — 169 fotografias e dois equipamentos. As demais alterações são testes e evidências desta fase. Nenhum motor, dado de rádio, navegação, rodapé, conteúdo de outras páginas ou infraestrutura foi alterado. Nenhum endereço de transmissão foi copiado para os componentes, manifestos, capturas ou relatórios novos.

## Testes executados

- **24/24 testes unitários aprovados**, sem falhas ou skips: `node --test tests/passport_40_inventory.test.cjs tests/passport_kpop_replacement.test.cjs`.
- Após o acabamento das fotografias, **2/2 verificações direcionadas de imagens aprovadas**: correspondência dos 169 IDs, arquivos únicos e válidos, perfil sRGB, 512 × 512 e transparência dos equipamentos.
- **14 verificações de seção:** as duas alas em 1920, 1440, 1024, 768, 430, 390 e 360 px. Todas as fotografias carregadas, nomes completos, cartões visíveis, sem sobreposição ou rolagem horizontal. Acionamento e associação de todos os 169 cartões conferidos contra o inventário real.
- **Reprodução real em desktop:** Alternative Heritage™ e Pop 80s. **Emulação móvel com toque:** Classic Rock Select™ e Pop 80s. Áudio decodificado e em avanço, sem mute; play/pause, volume 0,4, troca entre rádios e Home → Notícias → Home com um único áudio ativo e o mesmo elemento conectado durante a navegação.
- **Animações:** duas camadas de pulsação alternada; quatro carretéis com mudanças de rotação; REC presente; imagens-base estáveis; pausa fora da área visível e movimento reduzido. Áudio continuou avançando durante a captura das animações. Globo World Dial™ e esfera Dance voltaram a renderizar normalmente.
- **Regressão:** inventário, motores, Bus/mutex, continuidade, assinatura do acionamento, busca, ordem das categorias, arquivos e recursos aprovados das fases anteriores preservados. O teste histórico da apresentação foi atualizado para reconhecer a extensão autorizada às seções 2 e 3; nenhum workflow ou guard foi desativado.

O navegador utilizado foi Chromium real, com emulação de viewport/toque para os testes móveis; não foi utilizado aparelho físico. O ambiente de teste é isolado, sem sessão do proprietário, com publicidade e telemetria bloqueadas. As mesmas fontes institucionais existentes no repositório foram carregadas localmente para as capturas, evitando dependência da resposta externa de fontes. O áudio não foi simulado.

### Ocorrências registradas

A reprodução da estação denominada **Classic Rock** não foi confirmada dentro de 20 segundos nas tentativas de desktop e móvel. **Alternative Heritage™** foi confirmada em desktop, mas não dentro do prazo na tentativa móvel. As amostras móveis confirmadas foram **Classic Rock Select™** e **Pop 80s**. Esses resultados constam nos relatórios; nenhuma transmissão foi alterada para fazer o teste passar. A validação foi por amostras, não uma auditoria individual das 401 transmissões.

## Evidências reais

| Ala | Desktop completo | Tablet completo | Mobile completo | Cabeçalho | Movimento |
|---|---|---|---|---|---|
| Rock | [1440 px](evidence/rock-1440.webp) | [768 px](evidence/rock-768.webp) | [390 px](evidence/rock-390.webp) | [Bateria e título](evidence/rock-header-1920.webp) | [Sequência real](evidence/rock-motion-real.gif) |
| Pop | [1440 px](evidence/pop-1440.webp) | [768 px](evidence/pop-768.webp) | [390 px](evidence/pop-390.webp) | [Sharp e título](evidence/pop-header-1920.webp) | [Sequência real](evidence/pop-motion-real.gif) |

[Prancha das 46 capas Rock](evidence/rock-contact-sheet.webp) · [Prancha das 123 capas Pop](evidence/pop-contact-sheet.webp).

Há também capturas de cabeçalho em 360, 430 e 1024 px. As capturas são imagens do navegador real, exportadas em WebP; as sequências GIF usam quadros capturados no navegador, com os intervalos efetivamente medidos, sem recriar conceitualmente a interface.

[Resultados consolidados](evidence/verification.json) · [Desktop](evidence/results-desktop.json) · [Móvel](evidence/results-mobile.json) · [Logs unitários](evidence/unit-tests.txt) · [Validação final das imagens](evidence/artwork-validation.txt).

Runner reproduzível: `node tests/passport_40_living_rock_pop_browser.cjs` e `node tests/passport_40_living_rock_pop_browser.cjs --mobile`, com Playwright e Chromium instalados fora da aplicação. Endereços internos não são incluídos nos resultados publicados.

**Sem merge, sem publicação e sem alteração direta da main ou da infraestrutura.**
