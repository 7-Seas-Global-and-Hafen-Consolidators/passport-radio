-- Additive media-kit infrastructure. No changes to account/profile tables.
create table if not exists public.passport_media_days (
  day date not null,
  device text not null check (device in ('desktop','mobile','tablet')),
  source text not null check (source in ('direct','search','social','internal','referral')),
  views bigint not null default 0 check (views >= 0),
  primary key (day,device,source)
);
create table if not exists public.passport_media_dedupe (
  token text primary key,
  expires_at timestamptz not null
);
create index if not exists passport_media_dedupe_expiry on public.passport_media_dedupe(expires_at);
create table if not exists public.passport_media_config (
  id boolean primary key default true check (id),
  started_at timestamptz not null default now()
);
insert into public.passport_media_config(id) values(true) on conflict do nothing;
alter table public.passport_media_days enable row level security;
alter table public.passport_media_dedupe enable row level security;
alter table public.passport_media_config enable row level security;
revoke all on public.passport_media_days, public.passport_media_dedupe, public.passport_media_config from anon, authenticated;
grant select, insert, update, delete on public.passport_media_days, public.passport_media_dedupe, public.passport_media_config to service_role;
create or replace function public.passport_media_collect(p_token text, p_device text, p_source text)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare inserted integer;
begin
  if p_device not in ('desktop','mobile','tablet') or p_source not in ('direct','search','social','internal','referral') or length(p_token) <> 64 then
    raise exception 'Invalid measurement';
  end if;
  delete from public.passport_media_dedupe where expires_at < now();
  delete from public.passport_media_days where day < (now() at time zone 'America/Sao_Paulo')::date - 34;
  insert into public.passport_media_dedupe(token, expires_at) values(p_token,now()+ interval '2 minutes') on conflict do nothing;
  get diagnostics inserted = row_count;
  if inserted = 0 then return false; end if;
  insert into public.passport_media_days(day,device,source,views)
  values ((now() at time zone 'America/Sao_Paulo')::date,p_device,p_source,1)
  on conflict(day,device,source) do update set views = public.passport_media_days.views+1;
  return true;
end $$;
create or replace function public.passport_media_report()
returns jsonb language sql stable security invoker set search_path = '' as $$
select jsonb_build_object(
  'source','Passport · coleta própria de pageviews com consentimento',
  'startedAt',(select started_at from public.passport_media_config where id),
  'updatedAt',now(),
  'timezone','America/Sao_Paulo',
  'scope','Visitas autorizadas nas páginas com medição ativa e na ANUNCIE, em produção.',
  'days',coalesce((select jsonb_agg(row_to_json(t) order by t.date) from
    (select day::text as date,sum(views) as views from public.passport_media_days
     where day >= (now() at time zone 'America/Sao_Paulo')::date - 29 group by day) t),'[]'::jsonb),
  'audience',jsonb_build_object(
    'device',coalesce((select jsonb_agg(row_to_json(t)) from
      (select device as label,sum(views) as views from public.passport_media_days
       where day >= (now() at time zone 'America/Sao_Paulo')::date - 29 group by device order by sum(views) desc) t),'[]'::jsonb),
    'source',coalesce((select jsonb_agg(row_to_json(t)) from
      (select source as label,sum(views) as views from public.passport_media_days
       where day >= (now() at time zone 'America/Sao_Paulo')::date - 29 group by source order by sum(views) desc) t),'[]'::jsonb)
  )
) $$;
revoke all on function public.passport_media_collect(text,text,text) from public,anon,authenticated;
revoke all on function public.passport_media_report() from public,anon,authenticated;
grant execute on function public.passport_media_collect(text,text,text),public.passport_media_report() to service_role;
