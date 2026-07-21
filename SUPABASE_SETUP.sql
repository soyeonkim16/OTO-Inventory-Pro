-- OTO Inventory Pro: 기존 테이블을 보완하고 안전한 입출고 함수를 생성합니다.
alter table public.products add column if not exists size text not null default '없음', add column if not exists color text not null default '없음';
alter table public.stock_logs add column if not exists recipient_name text, add column if not exists destination text, add column if not exists destination_postal_code text, add column if not exists destination_detail text, add column if not exists recipient_phone text, add column if not exists courier text, add column if not exists tracking_number text, add column if not exists order_number text, add column if not exists customer_id uuid, add column if not exists customer_name text;
create table if not exists public.customers(id uuid primary key default gen_random_uuid(),name text not null,recipient_name text,phone text,postal_code text,address text,address_detail text,courier text,memo text,created_at timestamptz not null default now());
alter table public.customers enable row level security;
drop policy if exists "authenticated customers select" on public.customers;create policy "authenticated customers select" on public.customers for select to authenticated using(true);
drop policy if exists "authenticated customers insert" on public.customers;create policy "authenticated customers insert" on public.customers for insert to authenticated with check(true);
drop policy if exists "authenticated customers update" on public.customers;create policy "authenticated customers update" on public.customers for update to authenticated using(true) with check(true);
create or replace function public.process_stock_movement(p_product_id uuid,p_type text,p_quantity integer,p_user_id uuid,p_staff_name text,p_customer_id uuid default null,p_customer_name text default null,p_recipient_name text default null,p_destination text default null,p_destination_postal_code text default null,p_destination_detail text default null,p_recipient_phone text default null,p_courier text default null,p_tracking_number text default null,p_order_number text default null,p_memo text default null) returns uuid language plpgsql security invoker as $$
declare current_qty integer; product_label text; new_log_id uuid;
begin
 if p_type not in ('in','out') then raise exception '잘못된 입출고 구분입니다.'; end if;
 if p_quantity<=0 then raise exception '수량은 1 이상이어야 합니다.'; end if;
 select quantity,name||case when size<>'없음' then ' / '||size else '' end||case when color<>'없음' then ' / '||color else '' end into current_qty,product_label from public.products where id=p_product_id for update;
 if not found then raise exception '상품을 찾을 수 없습니다.'; end if;
 if p_type='out' and current_qty<p_quantity then raise exception '현재 재고보다 많이 출고할 수 없습니다.'; end if;
 update public.products set quantity=current_qty+case when p_type='in' then p_quantity else -p_quantity end,updated_at=now() where id=p_product_id;
 insert into public.stock_logs(product_id,product_name,movement_type,quantity,user_id,staff_name,customer_id,customer_name,recipient_name,destination,destination_postal_code,destination_detail,recipient_phone,courier,tracking_number,order_number,memo) values(p_product_id,product_label,p_type,p_quantity,p_user_id,p_staff_name,p_customer_id,p_customer_name,p_recipient_name,p_destination,p_destination_postal_code,p_destination_detail,p_recipient_phone,p_courier,p_tracking_number,p_order_number,p_memo) returning id into new_log_id;
 return new_log_id;
end;$$;
grant execute on function public.process_stock_movement(uuid,text,integer,uuid,text,uuid,text,text,text,text,text,text,text,text,text,text) to authenticated;
do $$ begin alter publication supabase_realtime add table public.products; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.stock_logs; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.customers; exception when duplicate_object then null; end $$;


-- OTO 재고관리 v1.5 상품 안전 삭제 기능
-- Supabase > SQL Editor > New query 에 붙여넣고 Run 하세요.
--
-- 상품은 products 테이블에서 삭제되지만 기존 입출고 기록은 그대로 남습니다.
-- 관리자(role = admin)만 실행할 수 있습니다.

create or replace function public.delete_product_safely(
  p_product_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  requester_role text;
begin
  select role
  into requester_role
  from public.profiles
  where id = auth.uid()
    and active = true;

  if requester_role is distinct from 'admin' then
    raise exception '관리자만 상품을 삭제할 수 있습니다.';
  end if;

  if not exists (
    select 1
    from public.products
    where id = p_product_id
  ) then
    raise exception '삭제할 상품을 찾을 수 없습니다.';
  end if;

  -- 기존 출고/입고 이력은 product_name과 당시 옵션을 이미 보관하므로
  -- 상품 연결만 끊고 기록 자체는 유지합니다.
  update public.stock_logs
  set product_id = null
  where product_id = p_product_id;

  delete from public.products
  where id = p_product_id;
end;
$$;

revoke all on function public.delete_product_safely(uuid) from public;
grant execute on function public.delete_product_safely(uuid) to authenticated;

notify pgrst, 'reload schema';
