## 작업 규칙

- PowerShell 콘솔에서 한글이 깨져 보이더라도 파일 자체가 UTF-8로 정상일 수 있다. 한글 깨짐을 이유로 사용자에게 반복 안내하지 말고, 필요하면 `Get-Content -Encoding UTF8` 또는 실제 파일 내용을 기준으로 확인한다.
- 빌드 테스트는 시간이 오래 걸리므로 사용자가 명시적으로 요청한 경우에만 진행한다. 일반적인 소규모 수정 후에는 빌드를 실행하지 않는다.
- 특정 페이지에서만 사용하는 컴포넌트는 해당 route 또는 feature 하위의 `_components` 폴더에 둔다.
- 여러 페이지에서 재사용할 수 있는 전역 컴포넌트는 `src/components` 하위에 컴포넌트 유형별 폴더를 만들고 배치한다. 예: `src/components/button`, `src/components/form`, `src/components/layout`, `src/components/data-display`.
- `src/api` 하위 service 파일은 백엔드 API 호출만 담당한다. 토큰 저장, 전역 상태 갱신, 라우팅, 알림, 화면 상태 변경 같은 후처리는 service 내부에서 하지 말고 호출부(화면 또는 해당 feature 로직)에서 처리한다.
