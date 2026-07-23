-- OTO 재고관리 v2.3.1 입출고 내역 삭제 보강
-- 연결된 상품이 이미 삭제된 기록은 재고 복구 없이 내역만 삭제합니다.
-- Supabase > SQL Editor > New query 에 붙여넣고 Run 하세요.

drop function if exists public.delete_stock_log_safely(uuid);

create or replace function public.delete_stock_log_safely(
  p_log_id uuid
)
returns table (
  product_id uuid,
  stock_delta integer,
  new_quantity integer,
  product_missing boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  requester_role text;
  target_log public.stock_logs%rowtype;
  calculated_delta integer := 0;
  updated_quantity integer := null;
  product_exists boolean := false;
begin
  select role
  into requester_role
  from public.profiles
  where id = auth.uid()
    and active = true;

  if requester_role is distinct from 'admin' then
    raise exception '관리자만 입출고 내역을 삭제할 수 있습니다.';
  end if;

  select *
  into target_log
  from public.stock_logs
  where id = p_log_id
  for update;

  if not found then
    raise exception '삭제할 입출고 내역을 찾을 수 없습니다.';
  end if;

  if target_log.product_id is not null then
    select exists(
      select 1
      from public.products
      where id = target_log.product_id
    )
    into product_exists;
  end if;

  if product_exists then
    calculated_delta :=
      case
        when target_log.movement_type = 'in' then -target_log.quantity
        when target_log.movement_type = 'out' then target_log.quantity
        else 0
      end;

    if calculated_delta = 0 then
      raise exception '지원하지 않는 입출고 유형입니다.';
    end if;

    update public.products
    set quantity = quantity + calculated_delta
    where id = target_log.product_id
      and quantity + calculated_delta >= 0
    returning quantity into updated_quantity;

    if not found then
      raise exception '재고가 부족하여 해당 입고 내역을 삭제할 수 없습니다.';
    end if;
  end if;

  delete from public.stock_logs
  where id = p_log_id;

  return query
  select
    target_log.product_id,
    calculated_delta,
    updated_quantity,
    not product_exists;
end;
$$;

revoke all on function public.delete_stock_log_safely(uuid) from public;
grant execute on function public.delete_stock_log_safely(uuid) to authenticated;

notify pgrst, 'reload schema';
