-- Controles do Blog Aberto. Efeito imediato, sem GitHub.
-- Nasce fechado. Fechar não apaga acervo nem pendente.
-- O Build NÃO aplicou este arquivo.

create table public.blog_controls (
  id smallint primary key check (id = 1),
  submissions_open boolean not null default false,
  comments_open boolean not null default false,
  attachments_open boolean not null default false,
  interactions_closed boolean not null default true,
  updated_at timestamptz not null default now()
);

insert into public.blog_controls (
  id, submissions_open, comments_open, attachments_open, interactions_closed
) values (
  1, false, false, false, true
);

create table public.blog_control_log (
  id bigint generated always as identity primary key,
  action text not null check (char_length(action) between 1 and 40),
  target_id uuid,
  actor_id uuid,
  detail text check (detail is null or char_length(detail) <= 200),
  created_at timestamptz not null default now()
);

alter table public.blog_controls enable row level security;
alter table public.blog_control_log enable row level security;

revoke all on table public.blog_controls from public, anon, authenticated;
revoke all on table public.blog_control_log from public, anon, authenticated;
grant all on table public.blog_controls to service_role;
grant all on table public.blog_control_log to service_role;
revoke all on sequence public.blog_control_log_id_seq from public, anon, authenticated;
grant usage, select on sequence public.blog_control_log_id_seq to service_role;

-- Sem policy para anon ou authenticated.
-- Leitura pública de pendente não existe. O painel passa pela função, com a chave de serviço só no servidor.
