# Distribuição editorial nos canais oficiais

As execuções 41474755524, 41133497766 e 41126990926 do Passport Telegram Auto Post terminaram com sucesso e repetiram “Initialized Telegram state without publishing historical URLs: 22999”. O script saia antes de verificar os segredos. A etapa de persistência usava git diff em um arquivo novo e não rastreado, que esse comando ignora. A base auditada não tem data/telegram-sent.json. Os registros consultados não demonstram envio nem validam token, chat ID ou permissão de postagem. O seletor antigo aceitava somente /blog/ e incluía páginas de navegação.

O fluxo proposto lê os sitemaps do site já publicado e reconhece matérias datadas de Notícias e Blog, obras do Blog e URLs presentes nos feeds editoriais. Usa a URL canônica como chave. A conclusão bem-sucedida de Passport Pages dispara a leitura, com recuperação periódica e lotes de até dez. O estado fica numa branch separada. Cada tentativa grava intenção antes do POST e registra o message_id depois. Uma resposta ambígua suspende a fila para reconciliação humana, pois a API não oferece uma chave de idempotência para sendMessage. Isso evita repetir automaticamente uma postagem que pode ter sido aceita.

## Ativação posterior

1. Compare o histórico real do destino Telegram com o inventário de URLs publicadas. Confirme a conta do bot, o destino apontado pelo chat ID e a permissão de postar. Não copie tokens para logs ou para o repositório.
2. Crie a branch telegram-delivery-state com telegram-sent.json na raiz. Use o formato {"baseline":["https://passportradio.online/blog/w/exemplo.html"],"deliveries":{}}. A baseline deve conter apenas URLs históricas explicitamente dispensadas ou já distribuídas, nunca um espelho cego do sitemap atual. Registre entregas conhecidas em deliveries com status sent e messageId numérico. Deixe fora da baseline as matérias que ainda precisam ser recuperadas.
3. Depois de autorização de publicação, configure PASSPORT_TELEGRAM_ENABLED=true e execute a rotina na main. Garanta permissão de escrita do GitHub Actions na branch do estado. Para um pending, confira o canal. Registre sent e o ID se a mensagem existir. Remova a intenção somente se confirmar que não houve entrega.

## WhatsApp

Canal oficial no site: https://whatsapp.com/channel/0029Vb8OD91BfxoBCBG36F0k. A URL é um convite público, e os botões de compartilhamento entregam o link ao visitante. Nenhum deles posta em nome do administrador.

O repositório tem um produtor de fila (tools/whatsapp_channel_outbox.py) e uma ponte local Baileys (tools/whatsapp_channel_bridge.mjs). Ela exige sessão WhatsApp pareada, JID do canal com sufixo @newsletter e conta com permissão no canal. O produtor consome catálogo e delta do Blog. A fila esperada não existe na base auditada e nenhum workflow ativo chama o produtor ou a ponte. O antigo Blog Tunnel está aposentado. Assim, não há circuito automático ativo comprovado para o canal. A sessão local e a compatibilidade real da ponte com postagem no canal não foram verificadas. A publicação manual no canal pela conta administradora é o caminho operacional disponível enquanto essas condições não forem verificadas. A automação de migração de links só atualiza URLs no site.

Telegram oficial referenciado pelo site: https://t.me/+FKto2N185cs4OGU0. A associação entre esse convite e o segredo do bot permanece pendente de conferência pelo administrador.

## Testes

node --test tests/telegram-distribution.test.mjs cobre Notícias e Blog, deduplicação, histórico dispensado, retomada em lotes, falha de persistência e resultado ambíguo. Todos os envios no teste são simulados.

## Verificação operacional da PR #591

O canal informado pelo proprietário é @passportradioofficial. O verificador usa esse nome público como chat ID padrão, aceita a configuração TELEGRAM_CHAT_ID quando presente e confirma a identidade do bot, do canal e a permissão can_post_messages antes de qualquer envio. Não imprime credenciais nem respostas brutas da API. O job verify da PR executa apenas testes, leitura pública e as consultas getMe, getChat e getChatMember. O job telegram fica excluído de eventos de PR.

Na execução 42229631156, os quatro testes passaram e a checagem parou com TELEGRAM_BOT_TOKEN ausente no ambiente do job. Essa evidência não distingue um segredo de ambiente, de organização, de outro repositório ou indisponível para o evento. O token não chegou a ser consultado na API. A branch telegram-delivery-state foi preparada com histórico vazio e bloqueia qualquer envio até a conciliação. A página pública t.me/s/passportradioofficial ficou indisponível no ambiente local. Uma página parcial ou sem mensagens verificáveis não estabelece que o canal esteja vazio.

## Operação da ponte WhatsApp existente

- Resolva o identificador real com newsletterMetadata('invite', código do link oficial) na sessão Baileys da conta administradora. Confira o nome retornado e o JID @newsletter. O código do convite não é o JID. A operação newsletterMetadata existe no código upstream em https://github.com/WhiskeySockets/Baileys/blob/master/src/Socket/newsletter.ts.
- A ponte atual exige PASSPORT_WA_CHANNEL_JID até no modo --pair e o modo de pareamento segue para o laço de envio depois de conectar. Para validar apenas a sessão, use um diretório local isolado, com a fila ausente ou comprovadamente vazia, e mantenha .passport-wa-auth/ fora do Git. Pareie no WhatsApp da conta administradora. Confirme a abertura da sessão e a contagem zero antes de alimentar a fila.
- Gere a fila com python tools/whatsapp_channel_outbox.py queue-changed --catalog CATÁLOGO.jsonl --delta DELTA.json --outbox data/whatsapp-channel-outbox.json. O delta deve conter somente slugs e revisões explicitamente autorizados. Confira título, URL, texto e IDs antes de iniciar a ponte. Preserve data/whatsapp-channel-local-state.json, execute uma instância por vez e concilie o canal se a sessão cair durante o envio. O ID atual é slug@revision, portanto uma revisão nova pode republicar a mesma URL.
- Com autorização de postagem, execute PASSPORT_WA_CHANNEL_JID='JID_VERIFICADO' node tools/whatsapp_channel_bridge.mjs e compare a entrada publicada no próprio canal com o estado local. A leitura do código e o teste do produtor validam o encadeamento local. Pareamento, permissão da conta e entrega real continuam dependentes da sessão administradora e não foram executados nesta auditoria.
