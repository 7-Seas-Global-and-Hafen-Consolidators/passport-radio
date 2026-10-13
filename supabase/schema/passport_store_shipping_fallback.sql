-- Qwen fallback, adapted to the existing boolean declared_value contract.
-- Examples remain TEST ONLY: NULL verification, never payable as commercial freight.
alter table public.passport_store_shipping_profiles add column if not exists test_only boolean not null default false;
alter table public.passport_store_shipping_profiles alter column verified_at drop not null;
alter table public.passport_store_quotes alter column account_id drop not null;
insert into public.passport_store_shipping_profiles
(product_id,supplier_id,origin_zip,weight,height,width,length,units_per_package,declared_value,verified_at,test_only)
values ('DEFAULT','PASSPORT_RADIO','01000000',0.5,20,20,10,1,true,null,true),
('4751170','SUPPLIER_01','01310100',0.2,2,20,30,1,true,null,true),
('5734678','SUPPLIER_01','01310100',0.2,2,20,30,1,true,null,true)
on conflict (product_id) do nothing;
-- Never overwrite existing supplier profiles. Replace examples only with verified data.
