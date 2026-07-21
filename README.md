# OTO Inventory Pro v2.0

## 포함 기능
- 아이디 + 비밀번호 로그인
- 자동 로그인
- 관리자/직원 계정 추가
- 관리자/직원 권한 변경
- 비밀번호 변경
- 계정 중지/활성화
- 직원 계정 삭제
- 상품 등록/수정/삭제
- 거래처 등록/수정/삭제
- 거래처별 날짜별 출고내역
- 모델명 완전 제거
- Pretendard
- 첫 로딩 화면 제거

## Netlify 환경변수
다음 두 개만 필요합니다.

- SUPABASE_URL
- SUPABASE_SECRET_KEY

SUPABASE_ANON_KEY는 직원관리 Netlify Function에 필요하지 않습니다.

## 배포 방식
직원관리 기능은 Netlify Function을 사용하므로 반드시 GitHub 전체 프로젝트 방식으로 배포하세요.
정적 NETLIFY ZIP 수동 배포만 하면 직원관리 서버 함수가 포함되지 않습니다.

GitHub 저장소 최상단에 다음이 보여야 합니다.

- package.json
- src/
- public/
- netlify/
  - functions/
    - admin-users.mjs
- netlify.toml

## 직원관리 서버 확인
배포 후 브라우저에서 아래 주소를 열면 함수 상태를 확인할 수 있습니다.

`https://inventory.otolab.co.kr/api/admin-users`

정상이면 다음과 비슷한 JSON이 표시됩니다.

`{"ok":true,"function":"admin-users","version":"2.0.0","configured":true}`

## Supabase SQL
기존 profiles 테이블이나 정책이 불완전한 경우
`SUPABASE_v2_0_직원관리_보강.sql`을 한 번 실행하세요.

삭제 기능은
`SUPABASE_v1_9_삭제기능_통합.sql`을 실행하면 됩니다.
