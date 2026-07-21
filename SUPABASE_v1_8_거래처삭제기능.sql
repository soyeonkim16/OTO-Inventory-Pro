-- OTO 재고관리 v1.8 거래처 안전 삭제 기능
-- Supabase > SQL Editor > New query 에 붙여넣고 Run 하세요.
--
-- 관리자만 거래처를 삭제할 수 있습니다.
-- 거래처를 삭제해도 기존 출고 이력은 보존됩니다.

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
    select 1
    from public.customers
    where id = p_customer_id
  ) then
    raise exception '삭제할 거래처를 찾을 수 없습니다.';
  end if;

  -- 기존 출고 기록은 거래처명과 배송정보를 이미 보관하므로
  -- 고객 연결만 끊고 기록 자체는 유지합니다.
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
