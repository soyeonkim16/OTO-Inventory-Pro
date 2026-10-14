-- OTO 재고관리: 전체 입출고 기록 삭제 + 재고 초기화
-- 반드시 Supabase SQL Editor에서 아래 전체 스크립트를 한 번에 실행하세요.
-- 실행 전: 이 프로젝트가 운영 프로젝트인지 확인하고, 앱 사용을 잠시 중단하세요.
-- 주의: 구매내역/매출/반품 내역은 stock_logs를 기반으로 계산하므로 삭제 후 사라집니다.
-- receivable_entries(미수금/입금 기록)는 삭제하지 않으므로 내역 간 불일치가 생길 수 있습니다.
-- 고객, 상품, 고객별 단가는 삭제하지 않습니다.
-- '택배비' 카테고리는 앱에서 수량 999999를 사용하는 가상 상품이므로 재고 초기화 대상에서 제외합니다.

BEGIN;

-- 참조하는 다른 테이블이 있다면 임의로 CASCADE 삭제하지 않고 작업을 중단합니다.
DO $$
DECLARE deps text;
BEGIN
  SELECT string_agg(format('%I.%I (%I)',n.nspname,t.relname,c.conname), ', ')
    INTO deps
  FROM pg_constraint c
  JOIN pg_class t ON t.oid=c.conrelid
  JOIN pg_namespace n ON n.oid=t.relnamespace
  WHERE c.contype='f' AND c.confrelid='public.stock_logs'::regclass;
  IF deps IS NOT NULL THEN
    RAISE EXCEPTION '안전을 위해 중단: stock_logs를 참조하는 외래키가 있습니다: %',deps;
  END IF;
END $$;

-- 별도 백업 스키마 생성: 운영 테이블은 백업 후 변경합니다.
CREATE SCHEMA IF NOT EXISTS oto_reset_backup;

-- 이 이름이 이미 존재하면 중단하여 기존 백업을 덮어쓰지 않습니다.
CREATE TABLE oto_reset_backup.stock_logs_before_20261014 AS
SELECT * FROM public.stock_logs;
CREATE TABLE oto_reset_backup.products_before_20261014 AS
SELECT * FROM public.products;
CREATE TABLE oto_reset_backup.customers_before_20261014 AS
SELECT * FROM public.customers;
CREATE TABLE oto_reset_backup.receivable_entries_before_20261014 AS
SELECT * FROM public.receivable_entries;

-- 기록 삭제. TRUNCATE CASCADE를 사용하지 않습니다.
DELETE FROM public.stock_logs;

-- 실물 상품 재고 0개. 택배비는 가상 상품이므로 유지합니다.
UPDATE public.products
SET quantity = 0
WHERE COALESCE(TRIM(category),'') <> '택배비';

-- 결과 검증. 이상이 있으면 트랜잭션 전체를 취소합니다.
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM public.stock_logs) THEN
    RAISE EXCEPTION '입출고 내역이 남아 있어 작업을 취소합니다.';
  END IF;
  IF EXISTS(SELECT 1 FROM public.products
            WHERE COALESCE(TRIM(category),'') <> '택배비'
              AND quantity IS DISTINCT FROM 0) THEN
    RAISE EXCEPTION '실물 상품 재고가 0이 아니어서 작업을 취소합니다.';
  END IF;
END $$;

COMMIT;

-- 실행 후 확인용 (별도로 실행 가능):
-- SELECT count(*) AS remaining_logs FROM public.stock_logs;
-- SELECT count(*) AS nonzero_physical_products FROM public.products
-- WHERE COALESCE(TRIM(category),'') <> '택배비' AND quantity <> 0;
-- SELECT count(*) AS backed_up_logs FROM oto_reset_backup.stock_logs_before_20261014;
