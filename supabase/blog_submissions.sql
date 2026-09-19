-- Witness → collaborator → author. Apply on the existing Conta Passport project.
-- Authenticated users submit stories. They can read only their own rows.
-- Editors apply status changes with the dashboard (service role), never from the browser.

create table if not exists public.blog_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  display_name text not null default 'Colaborador Passport',
  title text not null check (char_length(title) between 8 and 160),
  deck text check (deck is null or char_length(deck) <= 280),
  body text not null check (char_length(body) between 40 and 20000),
  entity text,
  country text,
  period text,
  format text,
  sources text,
  media_urls text,
  notes text,
  status text not null default 'recebida' check (status in (
    'recebida','em_analise','ajustes','aprovada','publicada','nao_publicada'
  )),
  editor_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_submissions_user_idx on public.blog_submissions (user_id, created_at desc);
create index if not exists blog_submissions_status_idx on public.blog_submissions (status, created_at desc);

alter table public.blog_submissions enable row level security;

drop policy if exists blog_submissions_select_own on public.blog_submissions;
create policy blog_submissions_select_own on public.blog_submissions
  for select using (auth.uid() = user_id);

drop policy if exists blog_submissions_insert_own on public.blog_submissions;
create policy blog_submissions_insert_own on public.blog_submissions
  for insert with check (auth.uid() = user_id);

drop policy if exists blog_submissions_update_own_draft on public.blog_submissions;
create policy blog_submissions_update_own_draft on public.blog_submissions
  for update using (auth.uid() = user_id and status in ('recebida','ajustes'))
  with check (auth.uid() = user_id and status in ('recebida','ajustes'));

create or replace function public.blog_submissions_touch()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  if tg_op = 'UPDATE' and auth.uid() = new.user_id then
    if new.status not in ('recebida','ajustes') then
      new.status = old.status;
    end if;
    new.editor_note = old.editor_note;
  end if;
  return new;
end;
$$;

drop trigger if exists blog_submissions_touch on public.blog_submissions;
create trigger blog_submissions_touch
  before update on public.blog_submissions
  for each row execute function public.blog_submissions_touch();
