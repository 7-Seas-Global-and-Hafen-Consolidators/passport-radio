# Distribuição no canal WhatsApp da Passport Radio

A ponte existente ganhou pareamento isolado, resolução do destino pelo convite oficial e confirmação do servidor por mensagem. O lote usa os 37 links na ordem do Telegram. A rotina automática só pode iniciar após os 37 recibos e seleciona Notícias e Blog das fontes publicadas a partir do marco inicial.

## Operação

1. No diretório da ponte, instalar as versões indicadas no cabeçalho e executar `node tools/whatsapp_channel_bridge.mjs --pair`. Escanear o QR gerado em `.passport-wa-auth/pairing.png` com a conta administradora. Manter esse diretório privado e persistente.
2. Executar com `--verify` para resolver o canal pelo convite oficial e confirmar o papel administrativo. Conferir o histórico do canal antes do lote, importar somente recibos comprovados por URL e confirmar a conciliação gravando `reconciledInvite` com o código do convite no histórico local. Um recibo contém status sent, messageId, serverId e link. Nunca marcar URLs como enviadas sem evidência.
3. Executar com `--authorized-37`. A ponte grava uma intenção antes de cada mensagem e registra o identificador do post quando recebe confirmação. Se houver uma intenção sem recibo, conferir o canal antes de tentar novamente.
4. Com todos os recibos, manter `--watch` sob supervisão em um host persistente, com uma instância por vez e reinício em falha. O marco inicial fica separado das entregas. As fontes são consultadas a cada cinco minutos.

## Evidência desta etapa

O socket da ponte abriu o fluxo de pareamento e gerou QR real. Sem pareamento concluído, o destino, o papel administrativo e os recibos reais continuam pendentes. Dois testes simulados passaram, cobrindo gravação em ordem, reexecução sem duplicação e bloqueio após confirmação ambígua. Nenhum token, QR ou arquivo de sessão faz parte da PR.

## Diagnóstico de acesso

A solicitação de código pelo número foi rejeitada com bad-request quando a ponte aguardou a resposta do servidor. Os arquivos de sessão locais permaneceram com registered=false. A existência do arquivo ou de um identificador de conta não confirma autenticação. A ponte agora interrompe envio e verificação antes da conexão se a sessão não estiver registrada, fecha o socket e remove o QR temporário ao encerrar. A aba autenticada no Edge do proprietário não está entre as superfícies disponíveis. Nenhum pareamento adicional foi tentado nesta revisão. Os testes de entrega são simulados, e a causa interna da rejeição do WhatsApp não foi identificada.
