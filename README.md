# BookLog Monorepo

## 1. 프로젝트 개요

BookLog는 웹(Next.js)과 모바일(Expo) 클라이언트가 함께 동작하는 pnpm workspaces 기반 모노레포입니다.  
현재 단계는 실행 가능한 개발 골격과 공통 툴링(ESLint/TypeScript/Vitest) 정리에 집중합니다.  
도메인 비즈니스 로직은 아직 포함하지 않았고, 브릿지 패키지는 타입 계약의 시작점만 제공합니다.  
이 문서는 로컬 개발 환경을 빠르게 재현할 수 있도록 초기 셋업 절차를 정리합니다.

## 2. 아키텍처 다이어그램 (Mermaid)

```mermaid
flowchart LR
  subgraph Apps
    W[apps/web<br/>Next.js App Router]
    M[apps/mobile<br/>Expo]
  end

  subgraph Packages
    B[packages/bridge<br/>TypeScript + Vitest]
  end

  DB[(Neon Postgres)]

  M <-- typed message contract --> B
  W <-- typed message contract --> B
  W --> DB
```

## 3. 디렉터리 트리 (예정 포함)

```text
.
├─ apps
│  ├─ web
│  │  ├─ app
│  │  ├─ public
│  │  └─ ...
│  └─ mobile
│     ├─ App.tsx
│     ├─ app.json
│     └─ ...
├─ packages
│  └─ bridge
│     ├─ src
│     │  └─ index.ts
│     ├─ tsconfig.json
│     └─ vitest.config.ts
├─ docs
│  └─ architecture.md
├─ .env.example
├─ eslint.config.mjs
├─ pnpm-workspace.yaml
└─ tsconfig.base.json
```

## 4. Getting Started

### A. 사전 준비 (Node, pnpm, Xcode, Android Studio)

1. Node.js 20+ (권장: 최신 LTS) 설치
2. pnpm 활성화
   ```bash
   corepack enable
   corepack prepare pnpm@latest --activate
   ```
3. iOS 개발 시 Xcode 설치 (Command Line Tools 포함)
4. Android 개발 시 Android Studio + SDK 설치

### B. Neon Postgres 셋업 (링크, connection string 획득, .env.local 반영)

1. [Neon 콘솔](https://console.neon.tech/)에서 프로젝트 생성
2. 데이터베이스 connection string 발급
3. 루트 `.env.local`의 `DATABASE_URL`에 값 반영

### C. 환경변수 파일 생성 (`cp .env.example .env.local`)

```bash
cp .env.example .env.local
```

### D. 의존성 설치 / 마이그레이션 / 개발 서버 실행 명령

```bash
pnpm install
pnpm db:migrate
pnpm dev:web
pnpm dev:mobile
```

### E. iOS 로컬 빌드 (`pnpm dev:mobile` → `npx expo run:ios`)

```bash
pnpm dev:mobile
npx expo run:ios
```

> 현재 단계에서는 `expo prebuild`를 수행하지 않습니다.

### F. Android 로컬 빌드

```bash
pnpm dev:mobile
npx expo run:android
```

## 5. 환경변수 목록 표 (이름/설명/예시/필수여부)

| 이름 | 설명 | 예시 | 필수 여부 |
| --- | --- | --- | --- |
| `DATABASE_URL` | Neon Postgres 연결 문자열 | `postgresql://user:password@ep-xxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require` | 필수 |
| `SESSION_JWT_SECRET` | 세션 JWT 서명 시크릿 | `openssl rand -base64 32` 결과값 | 필수 |
| `GOOGLE_BOOKS_API_KEY` | Google Books API 키 | `AIzaSy...` | 선택 |
| `NEXT_PUBLIC_APP_URL` | 웹 앱 접근 URL | `http://localhost:3000` | 필수 |

## 6. 개발 스크립트

- `pnpm dev:web`: 웹 앱 개발 서버 실행
- `pnpm dev:mobile`: Expo 개발 서버 실행
- `pnpm lint`: 전체 워크스페이스 lint
- `pnpm typecheck`: 전체 워크스페이스 타입 검사
- `pnpm test`: 전체 워크스페이스 테스트 실행
- `pnpm db:migrate`: 마이그레이션 자리표시자 명령 (Phase 2에서 실제 도구 연결)

## 7. 트러블슈팅 (빈 섹션, TODO)

TODO

## 8. 테스트 실행

```bash
pnpm -r test
```
