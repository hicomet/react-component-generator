# src/AGENTS.md

## Module Context

Vite + React 19 프론트엔드. `/api/generate`로 프롬프트를 보내 받은 코드를 `react-live`로 렌더링한다.

## Tech Stack & Constraints

- 미리보기는 `react-live`의 `LiveProvider noInline` 모드 (`src/components/LivePreview.tsx:14`). 생성 코드는 `import` 없이 전역 React를 쓰고 `render(...)`로 끝나야 한다.
- 서버 호출은 상대 경로 `/api/...`만 사용한다 (Vite 프록시 전제, `src/hooks/useComponentGenerator.ts:23`). 서버 주소를 하드코딩하지 않는다.

## Implementation Patterns

- 서버 통신과 상태는 `src/hooks/useComponentGenerator.ts`에 모으고, 컴포넌트는 표시와 입력만 담당한다.
- 공용 타입은 `src/types/index.ts`에 둔다 (`Provider`는 서버 `Provider` 타입과 값이 같아야 한다).
- 컴포넌트 파일은 `src/components/<PascalCase>.tsx`, 테스트는 같은 폴더의 `<Name>.test.tsx`.

## Testing Strategy

- `bunx vitest run src/` 로 프론트엔드 테스트만 실행. 환경은 jsdom, 공통 설정은 `src/test/setup.ts`.
- Testing Library와 `user-event`를 사용한다 (`src/components/PromptInput.test.tsx` 참조).

## Local Golden Rules

- Do: `Provider` 값을 추가하면 `src/types/index.ts`와 서버 `Provider`(`server/index.ts:57`)를 함께 수정한다.
- Don't: 사용자가 입력한 API 키를 `localStorage`, 쿠키, URL에 저장하지 않는다. 키는 `src/App.tsx:14`의 state에서 요청 본문으로만 전달한다.
- Don't: 서버 응답의 `code`를 클라이언트에서 다시 가공하지 않는다. 정규화는 서버 `generator.ts`가 담당한다.
- Test Boundary: 현재 `PromptInput`만 테스트가 있다. `useComponentGenerator`와 `App` 수정 시 테스트 부재를 보고하거나 테스트를 추가한다.
