# OTO v1.7 직원관리 설정

직원관리 기능은 Supabase의 관리자 API를 사용하므로 **비밀 키를 브라우저에 넣으면 안 됩니다.**
이 프로젝트는 Netlify Function에서만 비밀 키를 사용하도록 구성되어 있습니다.

## 1. Supabase 비밀 키 확인

Supabase 프로젝트에서:

Project Settings → API Keys

`Secret key` (`sb_secret_...`) 또는 기존 프로젝트의 `service_role` 키를 복사합니다.

절대로 GitHub 파일이나 앱 코드에 붙여넣지 마세요.

## 2. Netlify 환경변수 등록

Netlify 프로젝트에서:

Project configuration → Environment variables → Add a variable

다음 두 개를 추가합니다.

- `SUPABASE_URL`
  - `https://asphxewwlaiskwmxopyt.supabase.co`
- `SUPABASE_SECRET_KEY`
  - Supabase에서 복사한 `sb_secret_...` 또는 `service_role` 키

저장한 뒤 Netlify에서 **Trigger deploy → Deploy site**로 새 배포를 한 번 실행하세요.

## 3. 사용

관리자 계정으로 앱 로그인 → `직원관리`

가능한 작업:
- 직원 추가
- 직원/관리자 권한 변경
- 비밀번호 변경
- 계정 중지/활성화

현재 로그인한 관리자는 자기 권한을 해제하거나 자기 계정을 중지할 수 없습니다.
