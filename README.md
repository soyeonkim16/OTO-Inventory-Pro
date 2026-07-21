# OTO 재고관리 v1.9

## 이번 버전에서 확실히 반영된 내용
- 재고 목록에서 모델명 열 완전 제거
- 상품 등록·수정 화면에서 모델명 입력란 완전 제거
- 상품 검색에서 모델명 제외
- 관리자 전용 거래처 삭제 버튼 추가
- 거래처 삭제 전 거래처명 재입력
- 거래처 삭제 후에도 기존 출고 이력 보존
- 기존 상품 삭제 기능 유지
- 직원관리, 아이디 로그인, 자동 로그인, Pretendard 유지

## Supabase SQL
삭제 기능은 `SUPABASE_v1_9_삭제기능_통합.sql` 파일 하나만 실행하면 됩니다.

Supabase:
SQL Editor → New query → 전체 붙여넣기 → Run

성공 메시지:
`Success. No rows returned`

## GitHub 업로드
ZIP 파일을 풀고, 폴더 자체가 아니라 안의 파일과 폴더를 GitHub 저장소 최상단에 업로드하세요.

GitHub 첫 화면에 아래 항목이 보여야 합니다.
- package.json
- package-lock.json
- src
- public
- netlify
- netlify.toml
- vite.config.js
- index.html

## Netlify
GitHub 저장소가 연결되어 있다면 Commit 후 자동 배포됩니다.
