-- Comentário anônimo do Blog Aberto. Nasce pendente.
-- Não altera public.blog_comments (discussão antiga em blog_discussion.sql).
-- Tabela deste arquivo: public.blog_aberto_comments.
-- O Build NÃO aplicou este arquivo.
-- Sem policy de leitura pública. Pendente não sai.

create table public.blog_aberto_comments (
  id uuid primary key default gen_random_uuid(),
  story_url text not null check (story_url ~ '^/[A-Za-z0-9/_.-]+$' and position('..' in story_url) = 0),
  pseudonym text not null check (char_length(pseudonym) between 2 and 40),
  email text not null check (position('@' in email) > 1 and char_length(email) <= 120),
  body text not null check (char_length(body) between 2 and 2000),
  status text not null default 'pendente_revisao' check (status in ('pendente_revisao', 'aprovado', 'rejeitado')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

comment on column public.blog_aberto_comments.email is 'Privado. Não sai antes nem depois da aprovação.';

create index blog_aberto_comments_story_idx on public.blog_aberto_comments (story_url, status, created_at);

alter table public.blog_aberto_comments enable row level security;

revoke all on table public.blog_aberto_comments from public, anon, authenticated;
grant all on table public.blog_aberto_comments to service_role;

create or replace function public.blog_aberto_comments_visitor_guard()
returns trigger
language plpgsql
as $$
declare
  role text := coalesce(current_setting('request.jwt.claim.role', true), '');
begin
  if role = '' then
    begin
      role := coalesce(current_setting('request.jwt.claims', true)::json->>'role', '');
    exception when others then
      role := '';
    end;
  end if;
  if role in ('anon', 'authenticated') then
    raise exception 'visitante não grava';
  end if;
  if tg_op = 'INSERT' and new.status is distinct from 'pendente_revisao' then
    raise exception 'status de insert recusado';
  end if;
  return new;
end;
$$;

drop trigger if exists blog_aberto_comments_visitor_guard on public.blog_aberto_comments;
create trigger blog_aberto_comments_visitor_guard
  before insert or update on public.blog_aberto_comments
  for each row execute function public.blog_aberto_comments_visitor_guard();

revoke all on function public.blog_aberto_comments_visitor_guard() from public, anon, authenticated;
