# Passport Global — operação em andamento

Leia [checkpoint.md](checkpoint.md) para cobertura real e bloqueios. Esta PR não entrega tradução total do portal.

## Arquivos

`js/passport-global/{core,index}.mjs`: runtime independente. `css/passport-global.css`: somente seletor. `data/passport-global/`: configuração, textos comuns e pacote de uma matéria completa. `js/passport-universal-footer.js`: uma inserção para carregar o runtime. `tools/passport-global/translation-provider.mjs`: adaptador oficial privado. `scripts/passport-global-build.mjs`: geração incremental. `tests/passport-global/`: verificações pontuais. `docs/passport-global/`: checkpoint e evidências.

## Build autorizado de traduções

Não faz chamadas no navegador. Recebe JSON `{ "pages": [{ "path": "/pagina-real.html", "texts": ["Texto original completo"] }] }`, extraído de páginas públicas por `PassportGlobal.collect()`, após o conteúdo dinâmico terminar. Todos os corpos e estados aplicáveis precisam estar presentes; não é um rastreador automático de cobertura.

```
node scripts/passport-global-build.mjs snapshots-publicos.json --dry-run
node scripts/passport-global-build.mjs snapshots-publicos.json
```

Build real requer GOOGLE_CLOUD_PROJECT e GOOGLE_CLOUD_ACCESS_TOKEN privado de curta duração. Opcional: GOOGLE_CLOUD_TRANSLATION_REGION (us-central1). Não gravar essas credenciais no repositório. Ao alterar o original, regenerar o snapshot e pacote; os textos novos não recebem uma tradução antiga. Ao revisar traduções existentes, incrementar runtime.json/version para invalidar o cache local.

Não há workflow pago automático. Autenticação e backfill completo pendentes. A ausência de qualquer trecho preserva a página original por inteiro.

## Testes pontuais

```
node --test tests/passport-global/*.test.mjs
```

O teste de provedor usa transporte sintético explicitamente identificado; não comprova autenticação Google real. Evidências de navegador estão em evidence/; não comprovaram streaming real.
