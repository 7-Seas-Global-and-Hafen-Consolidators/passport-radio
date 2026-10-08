# PR #527 — correção dos checks (08/10/2026)

Base: 2cc1247c8168f7a952f076a0d8002957ba22321c.

## Causa comprovada antes de executar novos testes

- CI: https://github.com/7-Seas-Global-and-Hafen-Consolidators/passport-radio/actions/runs/37850358298/job/113561451881
- Túnel: https://github.com/7-Seas-Global-and-Hafen-Consolidators/passport-radio/actions/runs/37850358340/job/113561452439
- Ambos falharam com `human cover was removed from blog.html`: o contrato exigia um destaque específico da capa substituída. Não houve falha de compilação.
- O workflow legado tinha gatilho pull_request incluindo blog.html, push na main e permissões contents:write. Isso explica sua presença como check e mantinha caminhos operacionais de publicação.

## Correções cirúrgicas

- tests/test_editorial_blog_tunnel.py: exigir integração da capa curada, destinos reais, imagens locais existentes e metadados editoriais; preservar busca, isolamento e todos os demais contratos.
- .github/workflows/editorial-blog-tunnel.yml: retirar gatilhos automáticos e execução operacional. Resta somente aviso manual inerte, sem checkout, credenciais, aquisição, geração, commit ou publicação; contents:read.
- .github/workflows/build.yml permanece idêntico. O CI obrigatório continua executando os contratos.

## Verificação necessária

- Sintaxe Python e contrato alterado da capa/busca: PASS.
- YAML do legado: PASS; apenas workflow_dispatch, contents:read, um único passo composto exclusivamente por echo.
- Ruleset ativo Protect main, ID 21758780: required_status_checks exige apenas `build`. Nenhuma proteção foi alterada. Endpoint de proteção tradicional respondeu 403 Resource not accessible by integration; ruleset foi consultado com sucesso.
- Não foram repetidos os 17 testes de áudio nem a auditoria A–Z. Nenhum arquivo de acervo, player, continuidade, Bus, mutex, interlock, streams ou Radar foi alterado nesta correção.
- Resultado remoto dos novos checks será registrado na própria PR após execução automática do CI.
