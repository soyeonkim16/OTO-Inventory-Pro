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
