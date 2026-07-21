-- OTO Inventory Pro v2.0.2 상품 등록 호환성 보강
-- 앱은 신규 상품 저장 시 내부 SKU를 자동 생성합니다.
-- 아래 SQL은 sku 컬럼의 NOT NULL 제약도 해제해 추가 안정성을 확보합니다.

alter table public.products
alter column sku drop not null;

notify pgrst, 'reload schema';
