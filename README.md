# OTO Inventory Pro v4.0

Supabase 기반 재고관리 웹앱입니다. GitHub 저장소에 그대로 업로드한 뒤 Netlify와 연결할 수 있습니다.

## v4.0 주요 기능

- 상품별 도매가/소매가 등록 및 수정
- 거래처별 기본 단가 구분(도매/소매)
- 거래처 출고 이력을 기반으로 거래명세표 작성, 저장, 인쇄/PDF 출력
- 모바일 상품 목록 카드화 및 상품 수정 모달 최적화
- 실시간 재고/입출고/거래처 동기화
- 관리자 직원 계정 관리(Netlify Function)

## 실행

```bash
npm install
npm run dev
```

## 빌드

```bash
npm run build
```

Netlify 빌드 명령은 `npm run build`, 배포 폴더는 `dist`입니다.

## 환경 변수

직원 관리 기능을 사용할 경우 Netlify에 아래 환경 변수를 설정합니다.

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Supabase SQL은 이미 적용된 환경을 전제로 하며, 프로젝트에 포함된 SQL 파일은 백업 및 참고용입니다.
