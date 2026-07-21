-- OTO 재고관리 v2.3 입출고 내역 안전 삭제
-- Supabase > SQL Editor > New query 에 붙여넣고 Run 하세요.

create or replace function public.delete_stock_log_safely(
  p_log_id uuid
)
returns table (
  product_id uuid,
  stock_delta integer,
  new_quantity integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  requester_role text;
  target_log public.stock_logs%rowtype;
  calculated_delta integer;
  updated_quantity integer;
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

  if target_log.product_id is null then
    raise exception '연결된 상품이 삭제되어 재고를 복구할 수 없습니다.';
  end if;

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

  delete from public.stock_logs
  where id = p_log_id;

  return query
  select target_log.product_id, calculated_delta, updated_quantity;
end;
$$;

revoke all on function public.delete_stock_log_safely(uuid) from public;
grant execute on function public.delete_stock_log_safely(uuid) to authenticated;

notify pgrst, 'reload schema';
