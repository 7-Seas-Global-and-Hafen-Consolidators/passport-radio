# Contrato de dados do painel

`profiles`: usa `display_name`.

`favorites`: consulta linhas do usuário e renderiza, por ordem de preferência, `item_name`, `title`, `name`, `item_id`.

`votes`: consulta linhas do usuário e renderiza, por ordem de preferência, `signal`, `item_name`, `title`, `choice`, `vote`; inclui `round` quando existir.

Isso evita quebrar o painel por assumir o esquema proposto externamente antes de confirmar cada coluna.
