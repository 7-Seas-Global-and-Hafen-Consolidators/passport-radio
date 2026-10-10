-- Private durable notification worker; no change to submissions or moderation.
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;
alter table public.participe_notification_outbox
 add column if not exists provider_id text,
 add column if not exists first_attempt_at timestamptz,
 add column if not exists attempts integer not null default 0,
 add column if not exists next_attempt_at timestamptz not null default now(),
 add column if not exists lease_until timestamptz,
 add column if not exists claim_token uuid,
 add column if not exists last_error text,
 add column if not exists delivered_at timestamptz;
do $$begin
 if not exists(select 1 from vault.secrets where name='participe_worker_token') then
  perform vault.create_secret(encode(extensions.gen_random_bytes(32),'hex'),'participe_worker_token');
 end if;
end$$;
create or replace function public.participe_worker_authorized(worker_token text) returns boolean
language sql security definer set search_path='' as $$
 select exists(select 1 from vault.decrypted_secrets where name='participe_worker_token' and decrypted_secret=worker_token);
$$;
create or replace function public.participe_claim_notifications() returns jsonb
language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
 with ready as (select submission_id from public.participe_notification_outbox
 where status='pending' and next_attempt_at<=now() and (lease_until is null or lease_until<now())
 order by created_at limit 5 for update skip locked), claimed as (
 update public.participe_notification_outbox o set claim_token=extensions.gen_random_uuid(),lease_until=now()+interval '2 minutes',
 first_attempt_at=coalesce(first_attempt_at,now()),attempts=attempts+1 from ready r where o.submission_id=r.submission_id returning o.*)
 select coalesce(jsonb_agg(to_jsonb(c)||jsonb_build_object('pseudonym',b.pseudonym)),'[]'::jsonb) into result
 from claimed c join public.blog_submissions b on b.id=c.submission_id;
 return result;
end$$;
create or replace function public.participe_finish_notification(item_id uuid, token uuid, email_id text, outcome text, error_code text) returns boolean
language plpgsql security definer set search_path='' as $$
declare changed integer;
begin
 if outcome not in ('pending','sent','failed') then raise exception 'invalid outcome'; end if;
 update public.participe_notification_outbox set provider_id=coalesce(provider_id,email_id),status=outcome,
 delivered_at=case when outcome='sent' then now() else delivered_at end,
 last_error=left(error_code,120),next_attempt_at=now()+least(interval '1 hour',interval '1 minute'*power(2,least(attempts,6))),lease_until=null,claim_token=null
 where submission_id=item_id and claim_token=token and status='pending';
 get diagnostics changed=row_count;
 if changed=1 then update public.blog_submissions set notification_status=outcome where id=item_id; end if;
 return changed=1;
end$$;
revoke all on function public.participe_worker_authorized(text),public.participe_claim_notifications(),public.participe_finish_notification(uuid,uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.participe_worker_authorized(text),public.participe_claim_notifications(),public.participe_finish_notification(uuid,uuid,text,text,text) to service_role;
select cron.schedule('participe-notifications','* * * * *',$cron$
 select net.http_post(url:='https://kmrnnudmujezriomimwn.supabase.co/functions/v1/participe-notifications',
 headers:=jsonb_build_object('Content-Type','application/json','X-Worker-Token',(select decrypted_secret from vault.decrypted_secrets where name='participe_worker_token')),
 body:='{}'::jsonb,timeout_milliseconds:=60000);
$cron$);
