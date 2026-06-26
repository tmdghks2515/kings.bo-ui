## 작업 규칙

- PowerShell 콘솔에서 한글이 깨져 보이더라도 파일 자체가 UTF-8로 정상일 수 있다. 표시 깨짐만으로 사용자에게 반복 안내하지 말고, 필요하면 `Get-Content -Encoding UTF8` 또는 실제 파일 내용을 기준으로 확인한다.
- 빌드/컴파일 테스트는 시간이 오래 걸릴 수 있으므로 사용자가 명시적으로 요청한 경우나, 라우트/공통 컴포넌트/빌드 설정처럼 컴파일 위험이 있는 변경 후에 실행한다.
- 특정 페이지에서만 사용하는 컴포넌트는 해당 route 또는 feature 하위의 `_components` 폴더에 둔다.
- 대메뉴의 하위 화면(예: 생성, 상세, 수정)은 목록 화면과 구분되도록 상단에 `BackButton`이 있는 route layout을 둔다. 같은 대메뉴 안의 하위 화면이 여러 개면 `(detail)/layout.jsx` 같은 route group layout으로 묶어 URL은 유지하면서 공통 뒤로가기 헤더를 적용한다.
- 같은 feature 안에서 생성/상세/수정 화면 등 2개 이상 페이지가 동일하거나 거의 동일한 UI 블록을 쓰면, 먼저 해당 route 하위 `_components` 폴더에 공통 컴포넌트로 분리한다. 예: `products/_components/ProductOptionEditor.jsx`, `categories/(detail)/_components/ChildCategoryEditor.jsx`.
- 여러 페이지에서 재사용할 수 있는 전역 컴포넌트는 `src/components` 하위에 컴포넌트 유형별 폴더를 만들고 배치한다. 예: `src/components/button`, `src/components/form`, `src/components/layout`, `src/components/data-display`, `src/components/dialog`.
- 공통 컴포넌트는 화면별 API 호출이나 라우팅을 직접 알지 않도록 하고, `initialRows`, `disabled`, `onRowsChange` 같은 props로 상태를 주고받는다. payload 변환과 mutation 호출은 각 페이지가 담당한다.
- `src/api` 하위 service 파일은 백엔드 API 호출만 담당한다. 토큰 저장, 전역 상태 갱신, 라우팅, 알림, 화면 상태 변경 같은 후처리는 service 내부에서 하지 말고 호출부, 화면 또는 해당 feature 로직에서 처리한다.
