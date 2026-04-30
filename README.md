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

## 6. Vercel 배포 설정 (`apps/web`)

아래 값으로 Vercel 프로젝트를 수동 연결합니다.

- Build Command: `cd ../.. && pnpm run build:web:vercel`
- Install Command: `pnpm install --frozen-lockfile`
- Output Directory: `apps/web/.next`
- Root Directory: 비워두기
- Node Version: `20`

## 7. Vercel 환경변수 체크리스트

- [ ] `DATABASE_URL`
- [ ] `SESSION_JWT_SECRET`
- [ ] `NEXT_PUBLIC_APP_URL`
- [ ] `UPSTASH_REDIS_REST_URL` (선택)
- [ ] `UPSTASH_REDIS_REST_TOKEN` (선택)

## 8. 배포 URL

- 웹 배포 URL: [https://booklog-web.vercel.app](https://booklog-web.vercel.app)
- 모바일 기본 API URL(`apps/mobile/app.json`의 `expo.extra.apiBaseUrl`)도 위 URL을 기본값으로 사용합니다. (`EXPO_PUBLIC_API_BASE_URL`이 있으면 우선)

## 9. 보안 점검 체크리스트 (수동)

- [ ] `git ls-files | grep -E '^\\.env'` 결과가 비어 있음
- [ ] `rg "NEXT_PUBLIC_" apps/web/src` 결과에 시크릿 키워드(`SECRET`, `TOKEN`, `DATABASE_URL`, `SESSION_JWT_SECRET`)가 없음
- [ ] `rg "SESSION_JWT_SECRET|DATABASE_URL" apps/mobile` 결과가 비어 있음
- [ ] 배포 URL 응답의 `bl_session` 쿠키에 `Secure` 플래그가 포함됨
- [ ] 가입/로그인 후 세션 유지 및 로그아웃 시 쿠키 삭제가 정상 동작함

## 10. 개발 스크립트

- `pnpm dev:web`: 웹 앱 개발 서버 실행
- `pnpm dev:mobile`: Expo 개발 서버 실행
- `pnpm lint`: 전체 워크스페이스 lint
- `pnpm typecheck`: 전체 워크스페이스 타입 검사
- `pnpm test`: 전체 워크스페이스 테스트 실행
- `pnpm db:migrate`: 마이그레이션 자리표시자 명령 (Phase 2에서 실제 도구 연결)

## 11. 트러블슈팅

### 시뮬레이터에서 localhost 접근이 안 될 때

- 로컬 머신 IP(예: `http://192.168.0.10:3000`)를 `EXPO_PUBLIC_API_BASE_URL`로 설정해 앱을 다시 실행합니다.

### prebuild 이후 `pod install` 실패할 때

- Xcode 라이선스를 먼저 승인합니다.
  ```bash
  sudo xcodebuild -license
  ```

### 쿠키가 WebView에 반영되지 않을 때

- 세션 쿠키 `Domain`이 현재 배포 도메인과 일치하는지 확인합니다.
- 시뮬레이터/에뮬레이터에서 HTTP를 사용하는 경우, `Secure` 쿠키는 저장되지 않습니다.

### iOS 시뮬레이터에서 폰트 스케일이 반영되지 않을 때

1. iOS Simulator에서 `Settings` 앱을 엽니다.
2. `Accessibility` → `Display & Text Size` → `Larger Text`로 이동합니다.
3. `Larger Accessibility Sizes`를 켠 뒤 슬라이더로 텍스트 크기를 조정합니다.
4. BookLog 앱으로 돌아와 `Settings` 화면의 폰트 스케일 값이 변경되었는지 확인합니다.

## 12. 테스트 실행

```bash
pnpm -r test
```

## 13. 문서

- [외부 API 에러 상태](docs/error-states.md)
