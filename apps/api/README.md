# @multicheck/api

NestJS + Prisma 백엔드. Postgres 15, Redis(차후), BullMQ(차후 Phase) 사용.

## 실행

```bash
# 루트에서
pnpm docker:up           # Postgres/Redis 기동
pnpm db:migrate          # 최초 마이그레이션
pnpm --filter @multicheck/api db:seed   # 시드 데이터
pnpm dev:api             # http://localhost:3001
```

## 주요 엔드포인트 (Phase 0)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/health` | 헬스체크 |
| POST | `/api/auth/signup` | 회원가입 |
| POST | `/api/auth/signin` | 로그인 (JWT 발급) |
| POST | `/api/auth/refresh` | 리프레시 토큰 교환 |
| GET | `/api/organizations` | 내 조직 목록 |
| POST | `/api/organizations` | 조직 생성 (생성자 = org_owner) |
| POST | `/api/organizations/:orgId/invites` | 초대 토큰 발급 |
| POST | `/api/organizations/invites/accept/:token` | 초대 수락 |
| GET/POST | `/api/organizations/:orgId/locations` | 체크인 거점(지오펜스) |
| POST | `/api/organizations/:orgId/attendances/check-in` | 체크인 (GPS/QR/수동) |
| POST | `/api/organizations/:orgId/attendances/check-out` | 체크아웃 |
| GET | `/api/organizations/:orgId/attendances` | 근태 기록 조회 |

## 구조

```
src/
├── main.ts                      Nest 부트스트랩
├── app.module.ts
├── health.controller.ts
├── prisma/                      PrismaService (Global)
├── common/                      Zod 파이프, CurrentUser 데코레이터
├── auth/                        JWT + 리프레시 토큰
├── organizations/               조직·멤버·초대·거점
└── attendances/                 체크인/체크아웃 + 지오펜스 검증
```

## 테스트

```bash
pnpm --filter @multicheck/api test
```

지오펜스 유틸은 단위테스트로 커버 (`src/attendances/geofence.util.spec.ts`).

## 멀티테넌시 원칙

- 모든 tenant 스코프 쿼리는 `organizationId` 조건을 반드시 포함.
- `Membership` 존재 여부로 접근 제어 (`assertMember` / `assertRole`).
- Phase 1에서 Postgres Row-Level Security로 이중 방어 적용 예정.
