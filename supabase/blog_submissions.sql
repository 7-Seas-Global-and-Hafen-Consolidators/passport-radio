-- Blog Aberto. Visitante sem conta. O navegador não insere.
-- O Build NÃO aplicou este arquivo. Quem aplica é o owner do projeto
-- https://kmrnnudmujezriomimwn.supabase.co
-- Não rode a versão antiga, a da conta, por cima desta.
-- Se a tabela já existir com user_id, pare. Não apague daqui.

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'blog_submissions'
      and column_name = 'user_id'
  ) then
    raise exception 'blog_submissions ainda está no modelo com conta';
  end if;
end $$;

create table public.blog_submissions (
  id uuid primary key default gen_random_uuid(),
  pseudonym text not null check (char_length(pseudonym) between 2 and 40),
  email text not null check (position('@' in email) > 1 and char_length(email) <= 120),
  title text not null check (char_length(title) between 8 and 160),
  category text not null check (category in ('historias', 'discos', 'cultura', 'shows', 'entrevistas')),
  body text not null check (char_length(body) between 40 and 8000),
  rules_accepted boolean not null check (rules_accepted),
  status text not null default 'recebida' check (status in (
    'recebida',
    'pendente_revisao',
    'aprovada_aguardando',
    'publicando',
    'publicada_verificada',
    'rejeitada',
    'falha_publicacao'
  )),
  attachment_path text,
  approved_at timestamptz,
  published_url text,
  github_branch text,
  github_pr integer,
  publish_attempt integer not null default 0,
  failure_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.blog_submissions.email is 'Privado. Não sai em API pública, feed, sitemap, busca ou preview.';
comment on column public.blog_submissions.attachment_path is 'Caminho no bucket privado blog-aberto-private. Não é URL pública.';

create index blog_submissions_status_idx on public.blog_submissions (status, created_at desc);

create table public.blog_rate_limits (
  id bigint generated always as identity primary key,
  origin_hash text not null check (char_length(origin_hash) between 16 and 128),
  kind text not null check (kind in ('submit', 'comment')),
  created_at timestamptz not null default now()
);

create index blog_rate_limits_origin_idx on public.blog_rate_limits (origin_hash, kind, created_at desc);

alter table public.blog_submissions enable row level security;
alter table public.blog_rate_limits enable row level security;

revoke all on table public.blog_submissions from public, anon, authenticated;
revoke all on table public.blog_rate_limits from public, anon, authenticated;
grant all on table public.blog_submissions to service_role;
grant all on table public.blog_rate_limits to service_role;
revoke all on sequence public.blog_rate_limits_id_seq from public, anon, authenticated;
grant usage, select on sequence public.blog_rate_limits_id_seq to service_role;

create or replace function public.blog_submissions_visitor_guard()
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
  if tg_op = 'INSERT' then
    if new.status is distinct from 'recebida'
       or new.published_url is not null
       or new.approved_at is not null
       or new.github_pr is not null then
      raise exception 'status de insert recusado';
    end if;
  end if;
  if tg_op = 'UPDATE' and new.status = 'publicada_verificada' then
    if coalesce(new.published_url, '') !~ '^https://passportradio\.online/blog/aberto/p/' then
      raise exception 'publicada sem url no ar';
    end if;
  end if;
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists blog_submissions_visitor_guard on public.blog_submissions;
create trigger blog_submissions_visitor_guard
  before insert or update on public.blog_submissions
  for each row execute function public.blog_submissions_visitor_guard();

revoke all on function public.blog_submissions_visitor_guard() from public, anon, authenticated;

insert into storage.buckets (id, name, public)
values ('blog-aberto-private', 'blog-aberto-private', false)
on conflict (id) do update set public = false;
