-- Passport Blog discussion. Apply on the existing Conta Passport Supabase project.
-- Authenticated readers can comment, support and report. Public can read live comments.

create table if not exists public.blog_comments (
  id uuid primary key default gen_random_uuid(),
  story_url text not null,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  display_name text not null default 'Leitor Passport',
  body text not null check (char_length(body) between 2 and 2000),
  parent_id uuid references public.blog_comments(id) on delete cascade,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  support_count integer not null default 0
);

create index if not exists blog_comments_story_idx on public.blog_comments (story_url, created_at);
create index if not exists blog_comments_parent_idx on public.blog_comments (parent_id);

create table if not exists public.blog_comment_supports (
  comment_id uuid not null references public.blog_comments(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);

create table if not exists public.blog_comment_reports (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.blog_comments(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  reason text not null check (char_length(reason) between 3 and 500),
  created_at timestamptz not null default now()
);

alter table public.blog_comments enable row level security;
alter table public.blog_comment_supports enable row level security;
alter table public.blog_comment_reports enable row level security;

drop policy if exists blog_comments_read on public.blog_comments;
create policy blog_comments_read on public.blog_comments
  for select using (deleted_at is null);

drop policy if exists blog_comments_insert on public.blog_comments;
create policy blog_comments_insert on public.blog_comments
  for insert with check (auth.uid() = user_id);

drop policy if exists blog_comments_soft_delete on public.blog_comments;
create policy blog_comments_soft_delete on public.blog_comments
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists blog_supports_read on public.blog_comment_supports;
create policy blog_supports_read on public.blog_comment_supports for select using (true);

drop policy if exists blog_supports_insert on public.blog_comment_supports;
create policy blog_supports_insert on public.blog_comment_supports
  for insert with check (auth.uid() = user_id);

drop policy if exists blog_reports_insert on public.blog_comment_reports;
create policy blog_reports_insert on public.blog_comment_reports
  for insert with check (auth.uid() = user_id);

create or replace function public.blog_comment_after_support()
returns trigger language plpgsql security definer as $$
begin
  update public.blog_comments
    set support_count = (select count(*) from public.blog_comment_supports s where s.comment_id = new.comment_id)
    where id = new.comment_id;
  return new;
end;
$$;

drop trigger if exists blog_comment_support_count on public.blog_comment_supports;
create trigger blog_comment_support_count
  after insert on public.blog_comment_supports
  for each row execute function public.blog_comment_after_support();
