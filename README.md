<div align="center">

# 🌌 Cosmic Wordle

**우주 테마의 풀스택 Wordle 게임**

[![Kotlin](https://img.shields.io/badge/Kotlin-2.0-7F52FF?style=for-the-badge&logo=kotlin&logoColor=white)](https://kotlinlang.org)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/Docker_Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docs.docker.com/compose)

*단 하나의 명령어로 전체 스택을 실행하는 컨테이너 기반 Wordle 게임*

</div>

---

## 📋 목차

- [프로젝트 소개](#-프로젝트-소개)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [아키텍처](#-아키텍처)
- [프로젝트 구조](#-프로젝트-구조)
- [빠른 시작](#-빠른-시작)
- [환경 분리 전략](#-환경-분리-전략)
- [API 명세](#-api-명세)
- [인증 플로우](#-인증-플로우)
- [환경변수 가이드](#-환경변수-가이드)
- [개발 가이드](#-개발-가이드)

---

## 🚀 프로젝트 소개

**Cosmic Wordle**은 뉴욕타임즈의 Wordle 게임을 우주(Cosmic) 테마로 재해석한 풀스택 웹 애플리케이션입니다.

### 핵심 설계 원칙

| 원칙 | 구현 방식 |
|------|-----------|
| **Zero Local Setup** | 모든 실행 환경을 Docker Compose로 캡슐화, 로컬에 Java·Node.js 불필요 |
| **Guest-First UX** | 비로그인 상태에서도 완전한 게임 플레이 가능 (localStorage 기반) |
| **Auth-Optional Sync** | 로그인 시 게임 결과가 백엔드와 자동 동기화 (fire-and-forget) |
| **Dual JWT Architecture** | OAuth2 RSA JWT + HMAC-SHA256 JWT를 분리된 Security Filter Chain으로 공존 |

---

## ✨ 주요 기능

### 게임 플레이
- 🎮 **5글자 Wordle 게임** — 하루 1단어, 최대 6번의 시도
- ⌨️ **물리 키보드 + 화면 키보드** 동시 지원
- 🎨 **Cosmic 테마 애니메이션** — 타일 플립, 흔들기, 별 배경, 유성 효과
- 📊 **게임 통계** — 승률, 연속 성공 횟수, 추측 횟수 분포 차트

### 인증 & 계정
- 🔐 **JWT 기반 회원가입 / 로그인** — 가입 즉시 토큰 발급으로 원클릭 인증
- 👤 **게스트 플레이** — 로그인 없이 완전한 게임 (localStorage에 통계 저장)
- 🔄 **통계 동기화** — 로그인 후 게임 결과가 서버에 자동 저장

### 인프라
- 🐳 **단일 명령 실행** — `docker compose --env-file .env.dev up --build`
- 🏥 **헬스체크** — Spring Actuator + Next.js healthcheck 연동
- 🗄️ **Flyway 마이그레이션** — DB 스키마 버전 관리 자동화

---

## 🛠 기술 스택

### Backend
| 분류 | 기술 |
|------|------|
| Language | Kotlin 2.0 |
| Framework | Spring Boot 3.3 |
| Security | Spring Security · OAuth2 Authorization Server · JWT (HMAC-SHA256 / RSA) |
| ORM | Spring Data JPA + Hibernate |
| Database | PostgreSQL 15 (AWS RDS) |
| Migration | Flyway |
| Build | Gradle 8.5 + Kotlin DSL |
| Runtime | Eclipse Temurin JDK 21 |

### Frontend
| 분류 | 기술 |
|------|------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 (Custom Cosmic Theme) |
| State | useReducer + useCallback + startTransition |
| Data Fetching | SWR + Fetch API |
| Runtime | Node.js 20 Alpine (Standalone output) |

### DevOps
| 분류 | 기술 |
|------|------|
| Containerization | Docker + Docker Compose |
| Multi-stage Build | Backend(JDK 21) · Frontend(Node 20 Alpine) |
| Orchestration | Docker Compose with --env-file |

---

## 🏗 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                      Docker Compose                          │
│                                                             │
│  ┌──────────────────────┐    ┌─────────────────────────┐   │
│  │   Frontend (Next.js) │    │  Backend (Spring Boot)  │   │
│  │   Port: 3000         │───▶│  Port: 8080             │   │
│  │                      │    │                         │   │
│  │  • App Router        │    │  Security Filter Chains │   │
│  │  • useReducer        │    │  ┌─────────────────┐    │   │
│  │  • useAuth (JWT)     │    │  │ @Order(1) OAuth2│    │   │
│  │  • Cosmic Animations │    │  │ @Order(2) HMAC  │    │   │
│  │  • localStorage      │    │  │   JWT /api/**   │    │   │
│  └──────────────────────┘    │  │ @Order(3) RSA   │    │   │
│                              │  │   /stats/**     │    │   │
│                              │  │ @Order(4) Form  │    │   │
│                              │  └─────────────────┘    │   │
│                              │                         │   │
│                              │  Modules                │   │
│                              │  • auth (JWT signup/login)  │
│                              │  • game (CRUD + eval)   │   │
│                              │  • word (dictionary)    │   │
│                              │  • stats (player stats) │   │
│                              └────────────┬────────────┘   │
│                                           │                 │
│                              ┌────────────▼────────────┐   │
│                              │   PostgreSQL (AWS RDS)   │   │
│                              │   Flyway Migrations V1-5 │   │
│                              └─────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 보안 레이어 구조

```
Request → /api/** 경로
    └─ @Order(2) ApiSecurityFilterChain
           └─ HMAC-SHA256 JwtDecoder (@Qualifier)
                  └─ /api/auth/signup, /api/auth/login  → permitAll
                     /api/games/**, /api/stats           → authenticated
                     /api/words POST/DELETE               → ADMIN only

Request → /stats/** 경로
    └─ @Order(3) ResourceServerSecurityFilterChain
           └─ RSA JwtDecoder (OAuth2 Authorization Server 발급 토큰)
```

---

## 📁 프로젝트 구조

```
wordle-backend/
├── backend/                          # Spring Boot (Kotlin)
│   ├── src/main/kotlin/com/example/wordle/
│   │   ├── auth/
│   │   │   ├── controller/           # ApiAuthController (signup/login)
│   │   │   ├── domain/               # User 엔티티
│   │   │   ├── dto/                  # LoginRequest/Response, SignupRequest/Response
│   │   │   └── service/              # AuthService (BCrypt + JWT 발급)
│   │   ├── game/
│   │   │   ├── controller/           # GameController (/api/games/**)
│   │   │   ├── domain/               # Game, GameGuess, GameStatus, LetterResult
│   │   │   ├── repository/           # GameRepository, GameGuessRepository
│   │   │   └── service/
│   │   │       ├── GameService.kt    # 게임 CRUD, 오늘의 단어 로직
│   │   │       └── WordEvaluator.kt  # 2-pass 정답 평가 알고리즘
│   │   ├── security/
│   │   │   ├── CorsConfig.kt         # 환경변수 기반 CORS 설정
│   │   │   ├── JwtConfig.kt          # HMAC/RSA JWT Bean 분리 (@Qualifier)
│   │   │   ├── JwtSecurityConfig.kt  # 4개 Security Filter Chain (@Order)
│   │   │   └── JwtTokenProvider.kt   # 토큰 생성 유틸
│   │   ├── stats/
│   │   │   ├── controller/
│   │   │   │   ├── ApiStatsController.kt  # GET/POST /api/stats (HMAC JWT)
│   │   │   │   └── StatsController.kt     # /stats/** (RSA JWT, legacy)
│   │   │   ├── domain/               # PlayerStats, GuessDist
│   │   │   └── service/              # StatsService
│   │   └── word/
│   │       ├── controller/           # WordController (/api/words)
│   │       ├── domain/               # Word 엔티티
│   │       └── service/              # WordService (오늘의 단어 결정)
│   ├── src/main/resources/
│   │   ├── db/migration/
│   │   │   ├── V001__auth_tables.sql         # users, oauth2 테이블
│   │   │   ├── V002__create_player_stats.sql # player_stats, guess_dist
│   │   │   ├── V003__create_words_table.sql  # words 테이블
│   │   │   ├── V004__create_games_tables.sql # games, game_guesses
│   │   │   └── V005__seed_words.sql          # ~550개 단어 시드
│   │   ├── application-dev.yml
│   │   ├── application-prod.yml
│   │   └── application-test.yml
│   └── Dockerfile                    # Multi-stage: gradle:8.5 → temurin:21-jdk
│
├── frontend/                         # Next.js 14 (TypeScript)
│   └── src/
│       ├── app/
│       │   ├── layout.tsx            # Root layout (메타데이터, 폰트)
│       │   └── page.tsx              # 게임 메인 페이지 (useAuth 통합)
│       ├── components/
│       │   ├── AuthModal.tsx         # 로그인/회원가입 모달 (Cosmic 테마)
│       │   ├── GameBoard.tsx         # 6×5 타일 그리드
│       │   ├── Header.tsx            # 제목 + 통계/도움말/인증 버튼
│       │   ├── HelpModal.tsx         # 게임 규칙 모달
│       │   ├── Keyboard.tsx          # QWERTY 화면 키보드
│       │   ├── StarBackground.tsx    # 시드 기반 별 배경 (SSR 안전)
│       │   ├── StatsModal.tsx        # 통계 및 분포 차트 모달
│       │   ├── Tile.tsx              # 단일 타일 (플립 애니메이션)
│       │   └── Toast.tsx             # 알림 메시지
│       ├── hooks/
│       │   ├── useAuth.ts            # JWT 토큰 관리 (localStorage)
│       │   └── useWordle.ts          # 게임 상태 (useReducer + 백엔드 동기화)
│       ├── lib/
│       │   ├── api.ts                # API 클라이언트 (signup/login/stats)
│       │   ├── gameLogic.ts          # 2-pass 평가 알고리즘
│       │   └── words.ts              # 단어 목록 + 오늘의 단어 결정
│       └── types/index.ts            # LetterState, GameState, GameStats 타입
│
├── docker-compose.yml                # 전체 스택 오케스트레이션
├── .env.dev.template                 # 개발 환경변수 템플릿
├── .env.prod.template
└── .env.test.template
```

---

## ⚡ 빠른 시작

### 사전 요구사항

- **Docker Desktop** (또는 Docker Engine + Docker Compose v2)
- PostgreSQL DB 접속 정보 (AWS RDS 또는 로컬 PostgreSQL)

### 1. 저장소 클론

```bash
git clone https://github.com/your-username/wordle-backend.git
cd wordle-backend
```

### 2. 환경변수 설정

각 환경에 맞는 템플릿을 복사하고 실제 값을 입력합니다.

```bash
# 개발 환경
cp .env.dev.template .env.dev

# 프로덕션 환경
cp .env.prod.template .env.prod

# 테스트 환경
cp .env.test.template .env.test
```

필수 입력 항목 (dev 기준):

```bash
# ① DB 연결 정보
AWS_DEV_DB_URL=jdbc:postgresql://<host>:5432/<database>
AWS_DEV_DB_USERNAME=<username>
AWS_DEV_DB_PASSWORD=<password>

# ② JWT 시크릿 (32자 이상 랜덤 문자열 권장)
#    openssl rand -hex 32
JWT_SECRET=your-very-secret-key-at-least-32-characters-long

# ③ 프론트엔드 → 백엔드 API 주소
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### 3. 환경별 실행

```bash
# 🔧 개발 환경 (SQL 로그 활성화, actuator 전체 노출)
docker compose --env-file .env.dev up --build

# 🚀 프로덕션 환경 (로그 최소화, actuator 보안 강화)
docker compose --env-file .env.prod up --build -d

# 🧪 테스트 환경
docker compose --env-file .env.test up --build
```

| 서비스 | 주소 |
|--------|------|
| 🎮 Frontend | http://localhost:3000 |
| 🔧 Backend API | http://localhost:8080 |
| 🏥 Health Check | http://localhost:8080/actuator/health |

### 4. 중지

```bash
docker compose down
```

---

## 🌍 환경 분리 전략

단일 `docker-compose.yml` + `--env-file` 플래그 조합으로 dev / test / prod 세 환경을 완전히 분리합니다.

### 환경 선택 흐름

```
docker compose --env-file .env.{dev|test|prod} up
       │
       ├─▶  SPRING_PROFILES_ACTIVE={dev|test|prod}
       │           │
       │           ├─▶ application-dev.yml   (개발: SQL 로그, DEBUG)
       │           ├─▶ application-test.yml  (테스트: create-drop, DEBUG)
       │           └─▶ application-prod.yml  (운영: validate, WARN, 로그파일)
       │
       ├─▶  AWS_{DEV|TEST|PROD}_DB_{URL|USERNAME|PASSWORD}
       │           └─▶ 각 Spring 프로파일이 자신의 환경 변수만 읽음
       │
       ├─▶  JWT_SECRET / CORS_ALLOWED_ORIGINS / LOGGING_LEVEL_ROOT
       │           └─▶ docker-compose.yml 의 environment 섹션을 통해 컨테이너 주입
       │
       └─▶  NEXT_PUBLIC_API_URL
                   └─▶ Next.js 빌드 시 환경변수로 번들링 (브라우저용)
```

### 환경별 핵심 차이점

| 항목 | dev | test | prod |
|------|-----|------|------|
| **Spring Profile** | `dev` | `test` | `prod` |
| **DB** | AWS RDS Dev | AWS RDS Test | AWS RDS Prod |
| **DDL** | `validate` | `create-drop` | `validate` |
| **SQL 로그** | ✅ ON | ✅ ON | ❌ OFF |
| **show-details** | `always` | `always` | `never` |
| **HikariCP pool** | 최대 10 | 최대 5 | 최대 20 |
| **Actuator 노출** | health+info+beans+metrics+env | health+info+beans+metrics | health+info+metrics |
| **CORS** | `localhost:3000,3001` | `localhost:3000,3001` | 실제 도메인 |
| **로그 출력** | 콘솔 (DEBUG) | 콘솔 (DEBUG) | 파일 `/var/log/wordle/` (WARN) |
| **JWT 만료** | 24h (설정 가능) | 24h (설정 가능) | 24h (설정 가능) |
| **Flyway baseline** | `true` | — | `false` |

### 보안 강화 포인트 (prod)

```yaml
# application-prod.yml
management:
  endpoint:
    health:
      show-details: never     # ← 내부 DB 정보 노출 차단

jpa:
  show-sql: false              # ← SQL 쿼리 로그 완전 비활성화
  open-in-view: false          # ← N+1 방지 + 불필요한 커넥션 점유 차단

logging:
  level:
    root: WARN                 # ← INFO/DEBUG 로그 차단, 이슈만 기록
  file:
    name: /var/log/wordle/application.log  # ← 파일 영속 로깅
```

### `.env` 파일 보안 관리

```
# .gitignore (이미 적용됨)
.env          # ✅ 추적 안 됨
.env.dev      # ✅ 추적 안 됨
.env.prod     # ✅ 추적 안 됨
.env.test     # ✅ 추적 안 됨

# 저장소에 포함되는 것
.env.dev.template    # ✅ 키 목록 + 안내 주석 (실제 값 없음)
.env.prod.template   # ✅ 키 목록 + 안내 주석
.env.test.template   # ✅ 키 목록 + 안내 주석
```

> **JWT 시크릿 생성 권장 방법**
> ```bash
> # 32바이트 랜덤 16진수 문자열 생성
> openssl rand -hex 32
> ```

---

## 📡 API 명세

### 인증 (Public)

| Method | Endpoint | 설명 |
|--------|----------|------|
| `POST` | `/api/auth/signup` | 회원가입 + JWT 토큰 즉시 발급 |
| `POST` | `/api/auth/login` | 로그인 + JWT 토큰 발급 |

**회원가입 요청/응답**
```json
// POST /api/auth/signup
{
  "username": "cosmo",
  "email": "cosmo@example.com",
  "password": "Secure@1234"
}

// 200 OK
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "cosmo",
  "email": "cosmo@example.com",
  "accessToken": "eyJhbGci...",
  "tokenType": "Bearer",
  "expiresIn": 86400
}
```

**로그인 요청/응답**
```json
// POST /api/auth/login
{
  "username": "cosmo",
  "password": "Secure@1234"
}

// 200 OK
{
  "accessToken": "eyJhbGci...",
  "tokenType": "Bearer",
  "userId": "550e8400-...",
  "username": "cosmo",
  "role": "USER",
  "expiresIn": 86400
}
```

### 게임 (인증 필요 — `Authorization: Bearer <token>`)

| Method | Endpoint | 설명 |
|--------|----------|------|
| `GET` | `/api/games/today` | 오늘의 게임 조회/시작 |
| `GET` | `/api/games/{id}` | 특정 게임 조회 |
| `GET` | `/api/games` | 게임 히스토리 |
| `POST` | `/api/games/{id}/guesses` | 단어 추측 제출 |

**추측 제출 요청/응답**
```json
// POST /api/games/{id}/guesses
{ "word": "CRANE" }

// 201 Created
{
  "guessNumber": 1,
  "word": "CRANE",
  "result": ["CORRECT", "ABSENT", "PRESENT", "ABSENT", "CORRECT"],
  "gameStatus": "PLAYING"
}
```

### 통계 (인증 필요)

| Method | Endpoint | 설명 |
|--------|----------|------|
| `GET` | `/api/stats` | 내 통계 조회 |
| `POST` | `/api/stats` | 게임 결과 저장 (프론트엔드 동기화용) |

**통계 응답**
```json
// GET /api/stats
{
  "gamesPlayed": 42,
  "gamesWon": 35,
  "currentStreak": 5,
  "maxStreak": 12,
  "guessDistribution": [2, 8, 12, 9, 3, 1]  // 1~6번 시도별 승리 횟수
}
```

### 단어 관리

| Method | Endpoint | 권한 | 설명 |
|--------|----------|------|------|
| `GET` | `/api/words` | USER | 단어 목록 조회 |
| `POST` | `/api/words` | ADMIN | 단어 추가 |
| `DELETE` | `/api/words/{id}` | ADMIN | 단어 삭제 |

---

## 🔐 인증 플로우

```
[회원가입 / 로그인]
  ┌────────────┐   POST /api/auth/signup   ┌──────────────────┐
  │  Frontend  │ ─────────────────────────▶│  ApiAuthController│
  │            │◀─────────────────────────  │  AuthService      │
  │            │  { accessToken, username } │  BCrypt + HMAC JWT│
  └────────────┘                            └──────────────────┘

[인증된 API 호출]
  ┌────────────┐   Authorization: Bearer <token>   ┌─────────────────┐
  │  Frontend  │ ─────────────────────────────────▶│ @Order(2) Chain │
  │ useAuth.ts │                                    │ HmacJwtDecoder  │
  │ (localStorage)│◀─────────────────────────────   │ @AuthPrincipal  │
  └────────────┘   200 OK + game/stats data         │ Jwt → UUID      │
                                                    └─────────────────┘

[게스트 플레이]
  ┌────────────┐
  │  Frontend  │  API 호출 없음 — localStorage만 사용
  │ useWordle  │  게임 상태: localStorage['cosmic-wordle-state']
  │            │  통계:      localStorage['cosmic-wordle-stats']
  └────────────┘
```

### Dual JWT 구조

```
┌─────────────────────────────────────┐
│  JwtConfig.kt                       │
│                                     │
│  @Bean @Qualifier("hmacJwtEncoder") │  ← /api/** 용
│  fun hmacJwtEncoder(): JwtEncoder   │    HMAC-SHA256 (대칭키)
│                                     │    JWT_SECRET 환경변수
│  @Bean @Qualifier("hmacJwtDecoder") │
│  fun hmacJwtDecoder(): JwtDecoder   │
│                                     │
│  (별도) OAuth2 Authorization Server │  ← /stats/** 용
│  RSA 키쌍 JwtEncoder/Decoder        │    keystore.p12
└─────────────────────────────────────┘
```

---

## 🎨 프론트엔드 특징

### Cosmic 색상 팔레트

| 변수명 | HEX | 용도 |
|--------|-----|------|
| `cosmic-dark` | `#141A26` | 배경 |
| `cosmic-blue` | `#42708C` | 정답 위치 타일, 버튼 |
| `cosmic-gold` | `#F2BF91` | 정확한 글자(위치 맞음) |
| `cosmic-red` | `#733C3C` | 오류, 에러 상태 |
| `cosmic-white` | `#E8F1F5` | 텍스트 |
| `cosmic-gray` | `#9BADB8` | 보조 텍스트, 미사용 키 |

### 핵심 애니메이션

| 애니메이션 | 트리거 | 설명 |
|-----------|--------|------|
| `tileFlip` | 단어 제출 | 타일이 뒤집히며 색상 변경 (3D rotateX) |
| `tileBounce` | 글자 입력 | 타일 튀어오르기 |
| `tileShake` | 유효하지 않은 단어 | 행 흔들기 |
| `twinkle` | 항상 | 별 배경 깜박임 |
| `shootingStar` | 항상 | 유성 이동 |
| `slide-up` | 모달 열기 | 모달 슬라이드인 |

### 상태 관리 구조

```typescript
// useReducer 기반 게임 상태
type Action =
  | { type: 'INIT_GAME'; payload: { targetWord: string } }
  | { type: 'ADD_LETTER'; payload: { letter: string } }
  | { type: 'REMOVE_LETTER' }
  | { type: 'SUBMIT_GUESS' }
  | { type: 'REVEAL_TILE'; payload: { row: number; col: number; state: LetterState } }
  | { type: 'SET_SHAKING'; payload: { row: number } }
  | { type: 'SET_MESSAGE'; payload: { message: string } }
  // ...

// 타일 공개: 300ms 간격 스태거드 애니메이션
states.forEach((tileState, i) => {
  setTimeout(() => {
    dispatch({ type: 'REVEAL_TILE', payload: { row, col: i, state: tileState } });
  }, 300 * (i + 1));  // 300ms, 600ms, 900ms, 1200ms, 1500ms
});
```

---

## 🗄️ 데이터베이스 스키마

### Flyway 마이그레이션 히스토리

| 버전 | 파일 | 내용 |
|------|------|------|
| V001 | `auth_tables.sql` | `users`, OAuth2 관련 테이블 |
| V002 | `create_player_stats.sql` | `player_stats`, `guess_dist` 테이블 |
| V003 | `create_words_table.sql` | `words` 테이블 (is_answer 구분) |
| V004 | `create_games_tables.sql` | `games`, `game_guesses` + UNIQUE(user_id, game_date) |
| V005 | `seed_words.sql` | 정답 단어 ~350개 + 유효 단어 ~200개 시드 |

### 핵심 테이블 관계

```sql
users (id UUID PK)
  └─▶ player_stats (user_id FK, games_played, games_won, streaks, ...)
  └─▶ games        (user_id FK, game_date, status, target_word)
        └─▶ game_guesses (game_id FK, guess_number, word, result[])

UNIQUE CONSTRAINT: games(user_id, game_date)  -- 하루 1게임 보장
```

---

## ⚙️ 환경변수 가이드

전체 환경변수는 각 `.env.*.template` 파일을 참조하세요.

### DB 연결 변수 (환경별 구분)

| 환경 | 변수명 | Spring 프로파일 |
|------|--------|----------------|
| dev | `AWS_DEV_DB_URL` / `AWS_DEV_DB_USERNAME` / `AWS_DEV_DB_PASSWORD` | `application-dev.yml` |
| test | `AWS_TEST_DB_URL` / `AWS_TEST_DB_USERNAME` / `AWS_TEST_DB_PASSWORD` | `application-test.yml` |
| prod | `AWS_PROD_DB_URL` / `AWS_PROD_DB_USERNAME` / `AWS_PROD_DB_PASSWORD` | `application-prod.yml` |

### 공통 필수 변수 (세 환경 모두)

| 변수명 | 설명 | dev 예시 | prod 예시 |
|--------|------|----------|-----------|
| `SPRING_PROFILES_ACTIVE` | Spring 프로파일 선택 | `dev` | `prod` |
| `JWT_SECRET` | HMAC-SHA256 시크릿 (32자+) | `dev-secret-key...` | `openssl rand -hex 32` |
| `JWT_EXPIRATION_MS` | JWT 만료시간 (ms) | `86400000` | `86400000` |
| `CORS_ALLOWED_ORIGINS` | CORS 허용 출처 | `http://localhost:3000` | `https://your-domain.com` |
| `LOGGING_LEVEL_ROOT` | 루트 로그 레벨 | `INFO` | `WARN` |
| `NEXT_PUBLIC_API_URL` | 프론트 → 백엔드 URL | `http://localhost:8080` | `https://your-domain.com` |

### 선택 변수

| 변수명 | 기본값 | 설명 |
|--------|--------|------|
| `SERVER_PORT` | `8080` | 백엔드 포트 |
| `FRONTEND_PORT` | `3000` | 프론트엔드 포트 |
| `JWT_KEYSTORE_PASSWORD` | `changeit` | RSA 키스토어 비밀번호 |
| `AWS_REGION` | `ap-northeast-2` | AWS 리전 |

---

## 🔧 개발 가이드

### 컨테이너 내부 개발 (Spring Boot DevTools)

```bash
# 컨테이너 실행 후 내부 접속
docker compose --env-file .env.dev up -d
docker compose exec backend bash

# 컨테이너 내부에서 Gradle 실행
cd /workspace
./gradlew bootRun --args='--spring.profiles.active=dev'
```

### DB 직접 접속

```bash
# 컨테이너 내부의 psql로 AWS RDS 접속
docker compose exec backend bash
psql -h <RDS_ENDPOINT> -U <USERNAME> -d <DATABASE>
```

### 환경별 실행

```bash
# 🔧 개발 환경 (포그라운드, 로그 실시간 확인)
docker compose --env-file .env.dev up --build

# 🧪 테스트 환경
docker compose --env-file .env.test up --build

# 🚀 프로덕션 환경 (백그라운드 데몬)
docker compose --env-file .env.prod up --build -d
```

### 로그 확인

```bash
# 전체 서비스 로그
docker compose logs -f

# 백엔드만
docker compose logs -f backend

# 프론트엔드만
docker compose logs -f frontend

# 프로덕션 파일 로그 (컨테이너 내부)
docker compose exec backend tail -f /var/log/wordle/application.log
```

---

## 🧪 테스트

```bash
# 컨테이너 내부에서 테스트 실행
docker compose exec backend ./gradlew test

# 헬스체크
curl http://localhost:8080/actuator/health
# → {"status":"UP"}

# API 동작 확인
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"Test@1234"}'
```

---

<div align="center">

Made with ☕ and 🌌 by [Your Name]

</div>
