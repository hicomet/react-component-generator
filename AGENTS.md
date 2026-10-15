# AGENTS.md

## Operational Commands

- 패키지 매니저는 bun 고정. npm/yarn/pnpm 사용 금지 (`bun.lock` 사용, `package.json:7-8`의 서버 스크립트가 `bun` 실행에 의존).
- 설치: `bun install`
- 개발 서버(API 3002 + Vite 5173 동시): `bun run dev`
- API 서버만: `bun run server`
- 테스트: `bun run test` (vitest, `src/**`와 `server/**` 모두 대상). 단일 파일: `bunx vitest run server/generator.test.ts`
- 린트: `bun run lint`
- 빌드 검증: `bun run build` (`tsc -b` 후 `vite build`)
- 변경 완료 전 `bun run test`, `bun run lint`, `bun run build`를 모두 통과시킨다.

## Golden Rules

### Immutable

- API 키 값을 코드, 로그, 응답, 커밋에 남기지 않는다. 서버는 키 존재 여부(boolean)만 클라이언트에 노출한다 (`server/index.ts:147-153`). 키 값을 `/api/config` 등 응답에 추가하지 않는다.
- `.env`는 읽거나 출력하거나 커밋하지 않는다 (`.gitignore` 대상).
- Google 호출은 키가 URL 쿼리에 들어간다 (`server/index.ts:99`). 요청 URL과 fetch 에러 객체를 로그·응답에 그대로 출력하지 않는다. 현재 에러 메시지는 상태 코드만 담는다 (`server/index.ts:112`).
- 클라이언트가 입력한 키는 React state에만 둔다 (`src/App.tsx:14`). `localStorage` 등 영속 저장소에 넣지 않는다.

### Do

- AI 응답 후처리는 `server/generator.ts`의 순수 함수에 추가하고 테스트를 함께 작성한다.
- Anthropic과 Google 경로를 수정할 때 두 경로의 동작 차이를 확인한다 (Asymmetry 참조).
- 포트 3002를 바꾸면 `server/index.ts:139`와 `vite.config.ts:11`를 함께 바꾼다.

### Don't

- `server/index.ts`에서 부수효과 없는 로직을 직접 늘리지 않는다. 이 파일은 import 시점에 `Bun.serve`를 실행하므로 (`server/index.ts:138`) 테스트에서 import할 수 없다. 테스트가 필요한 로직은 별도 모듈로 분리한다.
- `server/` 테스트에서 `Bun` 전역이나 `process.env` 의존 모듈을 import하지 않는다. vitest는 `jsdom` 환경에서 서버 테스트도 실행한다 (`vite.config.ts:15-20`).
- 에러 응답 문구에서 상태 코드 숫자(503, 429)를 제거하지 않는다. 서버가 `message.includes('503')`로 분기한다 (`server/index.ts:194-206`).

### Asymmetry

- Google 경로만 모델 폴백(`GOOGLE_MODELS`, `server/index.ts:5,135`)과 `MAX_TOKENS` 잘림 검사(`server/index.ts:123`)가 있다. Anthropic 경로는 단일 모델에 두 처리가 없다 (`server/index.ts:68-96`). 한쪽 경로의 장애 대응을 고칠 때 다른 쪽에 필요한지 판단해 보고한다.

### Double Defense

- 코드 펜스: 시스템 프롬프트가 펜스 금지를 지시하고 (`server/index.ts:16`), 후처리가 `stripCodeFences`로 한 번 더 제거한다 (`server/generator.ts:6`). 둘 중 하나만 제거하지 않는다.
- render 호출: 프롬프트가 `render(<Name />)`을 요구하고 (`server/index.ts:12`), `ensureRenderCall`이 누락 시 주입한다 (`server/generator.ts:15`). 미리보기는 `noInline` 모드라 `render` 호출이 없으면 아무것도 그리지 않는다 (`src/components/LivePreview.tsx:14`).

### Test Boundary

- 테스트 있음: `server/generator.ts`, `server/fallback.ts`, `src/components/PromptInput.tsx`.
- 테스트 없음: `server/index.ts`(HTTP 핸들러, 프로바이더 호출), `src/App.tsx`, `src/hooks/useComponentGenerator.ts`, `LivePreview`, `CodeView`, `ComponentCard`. 이 영역을 수정할 때는 테스트 가능한 단위로 분리해 테스트를 추가하거나, 테스트 부재를 보고에 명시한다.

## Project Context

- AI로 React 컴포넌트를 생성하고 실시간 미리보기와 코드를 제공하는 도구.
- Stack: React 19, TypeScript, Vite, Bun(API 프록시), react-live, vitest, Testing Library, ESLint.

## Standards & References

- 프로젝트 소개, 실행 방법, 기능은 `README.md` 참조.
- 커밋 메시지: 한국어 `type: 요약` (feat, fix, refactor, chore). 요약은 한 줄, 마침표 없음. push는 요청 시에만.
- 크리덴셜 의심 파일은 스테이징하지 않는다.
- Maintenance Policy: 이 문서의 규칙과 코드가 어긋나면 작업 중 발견 즉시 AGENTS.md 수정을 제안한다.

## Context Map

- **[API 서버 수정 (Bun, 프로바이더 호출, 응답 후처리)](./server/AGENTS.md)** — `server/` 작업 시.
- **[UI 및 미리보기 수정 (React, react-live)](./src/AGENTS.md)** — `src/` 작업 시.
