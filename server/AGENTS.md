# server/AGENTS.md

## Module Context

Bun으로 실행되는 AI 프록시 서버. `/api/config`, `/api/generate` 두 엔드포인트를 제공하고 Vite가 `/api`를 3002 포트로 프록시한다 (`vite.config.ts:8-14`).

## Tech Stack & Constraints

- 런타임은 Bun (`Bun.serve`, `process.env`). 외부 HTTP 클라이언트 라이브러리 없이 전역 `fetch`만 사용한다.
- 모델 ID는 `server/index.ts`에 하드코딩되어 있다 (`GOOGLE_MODELS` 상단 상수, Anthropic은 `callAnthropic` 내부). 모델 변경 시 해당 위치만 수정한다.

## Implementation Patterns

- 순수 로직은 별도 파일로 두고 같은 이름의 `*.test.ts`를 옆에 둔다 (`generator.ts`/`generator.test.ts`, `fallback.ts`/`fallback.test.ts`).
- 새 프로바이더는 `Provider` 타입(`server/index.ts:57`)과 `ENV_KEYS`(`server/index.ts:59`)에 추가하고, `callXxx` 함수와 핸들러 분기를 함께 추가한다.
- 모든 응답에 `CORS_HEADERS`를 포함한다. 새 응답 경로(성공, 에러 포함)에서 누락하면 브라우저에서 CORS 에러로 보인다.

## Testing Strategy

- `bunx vitest run server/` 로 서버 테스트만 실행.
- 테스트는 `generator.ts`와 `fallback.ts`처럼 import 시 부수효과가 없는 모듈에만 작성한다. `index.ts`는 import하면 서버가 뜨므로 직접 테스트하지 않는다.

## Local Golden Rules

- Do: 프로바이더 호출 실패는 `Error('<Provider> API error: <status>')` 형태를 유지한다. 상태 코드가 메시지에 있어야 503/429 분기가 동작한다 (`server/index.ts:194,201`).
- Do: 폴백 대상 모델은 우선순위 순으로 배열에 둔다 (`server/index.ts:4-5`). `withModelFallback`은 모두 실패하면 마지막 에러만 던진다 (`server/fallback.ts:19`).
- Don't: 키가 포함된 Google URL(`server/index.ts:99`)이나 요청 본문의 `apiKey`를 `console.log`로 출력하지 않는다.
- Don't: `/api/config` 응답에 환경 변수 값을 넣지 않는다. boolean만 허용 (`server/index.ts:150-153`).
- Don't: `SYSTEM_PROMPT`(`server/index.ts:7-49`)의 "import 금지", "TypeScript 문법 금지", "render 호출" 규칙을 완화하지 않는다. 미리보기는 `react-live` 전역 스코프에서 JS로 실행된다.
