-- Additive upgrade only: keep existing submissions, Auth users, RLS and grants.
begin;
alter table public.blog_submissions add column if not exists user_id uuid references auth.users(id);
alter table public.blog_submissions add column if not exists participation_type text not null default 'materia' check (participation_type in ('materia','banda','programa'));
alter table public.blog_submissions add column if not exists reference_links jsonb not null default '[]'::jsonb check (jsonb_typeof(reference_links)='array' and jsonb_array_length(reference_links)<=2);
alter table public.blog_submissions add column if not exists official_links jsonb not null default '[]'::jsonb check (jsonb_typeof(official_links)='array' and jsonb_array_length(official_links)<=2);
alter table public.blog_submissions add column if not exists rejection_reason text;
alter table public.blog_submissions add column if not exists notification_status text not null default 'pending' check (notification_status in ('pending','sent','failed'));
comment on column public.blog_submissions.user_id is 'Validated Supabase Auth identity; nullable only for preserved historical rows.';
create or replace function public.participe_member_guard() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.user_id is null or not exists(select 1 from auth.users where id=new.user_id and email_confirmed_at is not null and not is_anonymous) then
    raise exception 'confirmed account required';
  end if;
  return new;
end;
$$;
create trigger participe_member_guard before insert on public.blog_submissions for each row execute function public.participe_member_guard();
revoke all on function public.participe_member_guard() from public,anon,authenticated;
-- Outbox is durable and private. Pending is NOT an email delivery receipt.
create table public.participe_notification_outbox (
  submission_id uuid primary key references public.blog_submissions(id),
  recipient text not null default 'passportradio.online@gmail.com' check (recipient='passportradio.online@gmail.com'),
  participation_type text not null,
  title text not null,
  submitted_at timestamptz not null,
  admin_url text not null default 'https://passportradio.online/privado/blog-aberto.html',
  status text not null default 'pending' check (status in ('pending','sent','failed')),
  created_at timestamptz not null default now()
);
alter table public.participe_notification_outbox enable row level security;
revoke all on public.participe_notification_outbox from public,anon,authenticated;
grant all on public.participe_notification_outbox to service_role;
create or replace function public.participe_queue_notification() returns trigger language plpgsql set search_path=public as $$
begin
 insert into public.participe_notification_outbox(submission_id,participation_type,title,submitted_at) values(new.id,new.participation_type,new.title,new.created_at);
 return new;
end;
$$;
create trigger participe_queue_notification after insert on public.blog_submissions for each row execute function public.participe_queue_notification();
revoke all on function public.participe_queue_notification() from public,anon,authenticated;
commit;
