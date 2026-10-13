-- Additive adapter for the existing, empty passport_store_orders table. No catalog/public-site migration.
create table if not exists public.passport_store_accounts(id uuid primary key default gen_random_uuid(),email text not null unique,name text not null,password_hash text not null,password_salt text not null,created_at timestamptz not null default now());
create table if not exists public.passport_store_sessions(token_hash text primary key,account_id uuid not null references public.passport_store_accounts(id),expires_at timestamptz not null);
create table if not exists public.passport_store_shipping_profiles(product_id text primary key,supplier_id text not null,origin_zip text not null check(origin_zip ~ '^[0-9]{8}$' and origin_zip <> '00000000'),weight numeric not null check(weight>0),height numeric not null check(height>0),width numeric not null check(width>0),length numeric not null check(length>0),units_per_package integer not null default 1 check(units_per_package>0),declared_value boolean not null default false,verified_at timestamptz not null);
create table if not exists public.passport_store_quotes(id uuid primary key,account_id uuid not null references public.passport_store_accounts(id),fingerprint text not null,destination text not null,expires_at timestamptz not null,payload jsonb not null);
create table if not exists public.passport_store_rate_limits(key_hash text primary key,bucket timestamptz not null,hits integer not null);
alter table public.passport_store_orders add column if not exists account_id uuid references public.passport_store_accounts(id);
alter table public.passport_store_orders add column if not exists request_hash text;
alter table public.passport_store_orders add column if not exists subtotal_cents bigint;
alter table public.passport_store_orders add column if not exists discount_cents bigint;
alter table public.passport_store_orders add column if not exists payment_updated timestamptz;
alter table public.passport_store_orders add column if not exists actual_payment_method text;
alter table public.passport_store_orders add column if not exists actual_payment_type text;
alter table public.passport_store_orders add column if not exists invoice jsonb;
create unique index if not exists passport_store_orders_number_unique on public.passport_store_orders(order_number);
create unique index if not exists passport_store_orders_key_unique on public.passport_store_orders(idempotency_key);
create index if not exists passport_store_orders_owner on public.passport_store_orders(account_id,created_at desc);
create sequence if not exists public.passport_store_order_sequence start with 10;
do $$ declare n bigint; begin select coalesce(max(substring(order_number from '^PASS([0-9]+)$')::bigint),9) into n from public.passport_store_orders; if n>=10 then perform setval('public.passport_store_order_sequence',greatest(n,(select last_value from public.passport_store_order_sequence)),true); end if; end $$;
alter table public.passport_store_accounts enable row level security;
alter table public.passport_store_sessions enable row level security;
alter table public.passport_store_shipping_profiles enable row level security;
alter table public.passport_store_quotes enable row level security;
alter table public.passport_store_rate_limits enable row level security;
alter table public.passport_store_orders enable row level security;
revoke all on public.passport_store_accounts,public.passport_store_sessions,public.passport_store_shipping_profiles,public.passport_store_quotes,public.passport_store_rate_limits,public.passport_store_orders from anon,authenticated;
grant select,insert,update,delete on public.passport_store_accounts,public.passport_store_sessions,public.passport_store_shipping_profiles,public.passport_store_quotes,public.passport_store_rate_limits,public.passport_store_orders to service_role;
revoke all on sequence public.passport_store_order_sequence from public,anon,authenticated;
grant usage,select on sequence public.passport_store_order_sequence to service_role;
create or replace function public.passport_store_reserve(p_account uuid,p_key text,p_hash text,p_data jsonb) returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare o public.passport_store_orders; n text; seqtext text; begin
 perform pg_advisory_xact_lock(hashtextextended(p_key,0));
 select * into o from public.passport_store_orders where idempotency_key=p_key for update;
 if found then
  if o.account_id<>p_account or o.request_hash<>p_hash then raise exception 'CHECKOUT_CHANGED'; end if;
  if o.checkout_url is not null then return jsonb_build_object('claimed',false,'order',to_jsonb(o)); end if;
  if o.status='PAYMENT_SETUP_FAILED' or (o.status='PAYMENT_CREATING' and o.updated_at<now()-interval '60 seconds') then update public.passport_store_orders set status='PAYMENT_CREATING',updated_at=now() where id=o.id returning * into o; return jsonb_build_object('claimed',true,'order',to_jsonb(o)); end if;
  return jsonb_build_object('claimed',false,'order',to_jsonb(o));
 end if;
 seqtext:=nextval('public.passport_store_order_sequence')::text; n:='PASS'||lpad(seqtext,greatest(3,length(seqtext)),'0');
 insert into public.passport_store_orders(order_number,account_id,idempotency_key,request_hash,status,customer,address,items,shipping,total_cents,subtotal_cents,discount_cents,payment_method)
 values(n,p_account,p_key,p_hash,'PAYMENT_CREATING',p_data->'customer',p_data->'address',p_data->'items',p_data->'shipping',(p_data->>'total_cents')::bigint,(p_data->>'subtotal_cents')::bigint,(p_data->>'discount_cents')::bigint,p_data->>'payment_method') returning * into o;
 return jsonb_build_object('claimed',true,'order',to_jsonb(o)); end $$;
create or replace function public.passport_store_record_payment(p_order uuid,p_amount bigint,p_status text,p_id text,p_method text,p_type text,p_updated timestamptz) returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare o public.passport_store_orders; begin select * into o from public.passport_store_orders where id=p_order for update;
 if not found or o.total_cents<>p_amount then raise exception 'PAYMENT_MISMATCH'; end if;
 if p_status not in ('APPROVED','PENDING_PAYMENT','REJECTED','CANCELLED','REFUNDED') then raise exception 'INVALID_PAYMENT_STATUS'; end if;
 if o.payment_updated is not null and p_updated<o.payment_updated then return to_jsonb(o); end if;
 update public.passport_store_orders set status=p_status,payment_id=p_id,actual_payment_method=p_method,actual_payment_type=p_type,payment_updated=p_updated,updated_at=now() where id=p_order returning * into o;
 return to_jsonb(o); end $$;
create or replace function public.passport_store_rate_limit(p_key text) returns boolean language plpgsql security invoker set search_path=public,pg_temp as $$
declare n integer;begin insert into public.passport_store_rate_limits(key_hash,bucket,hits) values(p_key,date_trunc('minute',now()),1) on conflict(key_hash) do update set hits=case when passport_store_rate_limits.bucket=excluded.bucket then passport_store_rate_limits.hits+1 else 1 end,bucket=excluded.bucket returning hits into n;return n<=30;end $$;
revoke all on function public.passport_store_reserve(uuid,text,text,jsonb),public.passport_store_record_payment(uuid,bigint,text,text,text,text,timestamptz),public.passport_store_rate_limit(text) from public,anon,authenticated;
grant execute on function public.passport_store_reserve(uuid,text,text,jsonb),public.passport_store_record_payment(uuid,bigint,text,text,text,text,timestamptz),public.passport_store_rate_limit(text) to service_role;
