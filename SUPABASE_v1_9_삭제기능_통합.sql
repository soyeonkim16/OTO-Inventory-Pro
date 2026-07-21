-- OTO 재고관리 v1.9 삭제 기능 통합 SQL
-- Supabase > SQL Editor > New query > 전체 붙여넣기 > Run
--
-- 포함 기능
-- 1) 상품 안전 삭제
-- 2) 거래처 안전 삭제
-- 기존 입출고·출고 이력은 보존됩니다.

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
    select 1 from public.products where id = p_product_id
  ) then
    raise exception '삭제할 상품을 찾을 수 없습니다.';
  end if;

  update public.stock_logs
  set product_id = null
  where product_id = p_product_id;

  delete from public.products
  where id = p_product_id;
end;
$$;

revoke all on function public.delete_product_safely(uuid) from public;
grant execute on function public.delete_product_safely(uuid) to authenticated;


create or replace function public.delete_customer_safely(
  p_customer_id uuid
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
    raise exception '관리자만 거래처를 삭제할 수 있습니다.';
  end if;

  if not exists (
    select 1 from public.customers where id = p_customer_id
  ) then
    raise exception '삭제할 거래처를 찾을 수 없습니다.';
  end if;

  update public.stock_logs
  set customer_id = null
  where customer_id = p_customer_id;

  delete from public.customers
  where id = p_customer_id;
end;
$$;

revoke all on function public.delete_customer_safely(uuid) from public;
grant execute on function public.delete_customer_safely(uuid) to authenticated;

notify pgrst, 'reload schema';
