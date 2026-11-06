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
