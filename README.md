# BookLog Monorepo

- 웹(`apps/web`)과 모바일(`apps/mobile`)을 함께 개발하는 `pnpm workspaces` 기반 모노레포
- 모바일은 네이티브 탭 UX를 제공
- 핵심 서재 기능은 WebView + 웹 앱을 `@booklog/bridge`로 동기화


https://github.com/user-attachments/assets/c4a00292-8687-41cd-8dc0-2ad8efebbbd0

https://github.com/user-attachments/assets/49f68353-fbbf-4cae-976c-1f5c5a7900ab




## 핵심 기능

- [x] 이메일/비밀번호 기반 인증(`signup`, `login`, `logout`)
- [x] 개인 서재 CRUD(추가/조회/상태 변경/삭제)
- [x] 책별 노트 CRUD
- [x] Google Books 기반 검색/ISBN 조회
- [x] 모바일 바코드 스캔(EAN-13 ISBN) 및 수동 검색 전환
- [x] 모바일-웹 인증/테마/폰트 스케일 동기화 브릿지(v1)
- [x] 외부 API 실패 상태별 에러 UX(offline/rateLimit/upstream/notFound)

## 모노레포 구성

```text
.
├─ apps
│  ├─ web        # Next.js App Router + Prisma + Route Handlers
│  └─ mobile     # Expo Dev Client + React Navigation + WebView
├─ packages
│  ├─ bridge         # RN <-> WebView 메시지 스키마/유틸/테스트
│  ├─ design-tokens  # 디자인 토큰
│  └─ icons          # 공용 아이콘
├─ docs
│  ├─ architecture.md
│  └─ error-states.md
└─ ...
```

## Getting Started

### 1) 사전 준비

- Node.js 20+
- Corepack + pnpm
- iOS 개발 시 Xcode + Command Line Tools
- Android 개발 시 Android Studio + SDK

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

### 2) 환경변수 준비

```bash
cp .env.example .env.local
```

필수 키:
- `DATABASE_URL`
- `SESSION_JWT_SECRET`

선택 키:
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `GOOGLE_BOOKS_API_KEY`

### 3) 의존성 설치

```bash
pnpm install
```

### 4) 워크스페이스 패키지 1회 빌드

`@booklog/web`/`@booklog/mobile`이 참조하는 공용 패키지가 `dist`를 사용하므로, 최초 실행 시 한 번 빌드합니다.

```bash
pnpm run build:bridge:force
pnpm run build:design-tokens:force
pnpm run build:icons:force
```

### 5) Prisma 준비(웹)

```bash
pnpm --filter @booklog/web exec prisma generate
pnpm --filter @booklog/web db:migrate
```

### 6) 개발 서버 실행

```bash
pnpm dev:web
pnpm dev:mobile
```

### 7) 모바일 로컬 빌드/실행(Dev Client)

```bash
pnpm --filter @booklog/mobile ios
pnpm --filter @booklog/mobile android
```

## 아키텍처

- 시스템 플로우와 의존성 그래프: [`docs/architecture.md`](docs/architecture.md)

## 브릿지 프로토콜

- 메시지 타입, 시퀀스 다이어그램, 확장 체크리스트: [`packages/bridge/README.md`](packages/bridge/README.md)

## 에러 UX

- 외부 API 오류 상태 정의와 복구 동작: [`docs/error-states.md`](docs/error-states.md)

## 한계와 향후 과제

- EAS 미사용: 현재 로컬 Dev Client 기반이며, 스토어 배포 파이프라인은 별도 작업이 필요합니다.
- Maestro 미사용: E2E 자동화가 없어 주요 시나리오는 수동 회귀 확인으로 운영 중입니다.
- 바코드 인식 범위: 해외 ISBN 중심이며, 국내 도서는 Google Books 커버리지 이슈로 검색 누락이 발생할 수 있습니다.

