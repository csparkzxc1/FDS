# MultiCheck

회사·학원·학교 통합 근태/출결 관리 SaaS. 조직 타입(`company` / `academy` / `school`)에 따라 근태·출결 로직이 자동으로 전환되는 멀티테넌트 앱.

> MVP 타겟: **회사(Company)**. 학원/학교 모듈은 Phase 3~4에서 추가.

## 📦 모노레포 구조

```
apps/
├── api/        NestJS + Prisma (PostgreSQL) 백엔드
├── web/        Next.js 14 App Router 관리자 대시보드 (ko/en)
└── mobile/     Expo (React Native) 직원용 모바일 앱 (ko/en)

packages/
└── shared/     Zod 스키마 + 공유 TypeScript 타입
```

## 🚀 빠른 시작

### 요구사항

- Node.js 20+
- pnpm 9+
- Docker (Postgres + Redis)

### 설치 & 실행

```bash
# 1. 의존성 설치
pnpm install

# 2. 환경변수 복사
cp .env.example .env

# 3. 인프라 기동 (Postgres + Redis)
pnpm docker:up

# 4. DB 마이그레이션 + 클라이언트 생성
pnpm db:migrate

# 5. 개발 서버 실행
pnpm dev:api      # http://localhost:3001
pnpm dev:web      # http://localhost:3000
pnpm dev:mobile   # Expo DevTools
```

## 🧱 기술 스택

| 레이어 | 기술 |
|--------|------|
| Backend | Node 20, NestJS, Prisma, PostgreSQL 15, Redis, BullMQ |
| Web | Next.js 14 (App Router), Tailwind CSS, shadcn/ui, next-intl |
| Mobile | Expo, React Native, i18n-js, React Query |
| 공유 | TypeScript, Zod |
| 인프라 | Docker Compose (local), GitHub Actions CI |

## 🗺 로드맵

- **Phase 0** — 모노레포 셋업, Prisma 스키마, 기본 인증 ← *현재*
- **Phase 1** — 회사 MVP (GPS/QR 체크인, 스케줄, 대시보드)
- **Phase 2** — 휴가/결재, 감사 로그
- **Phase 3** — 학원 모듈 (수강생 출결, 학부모 알림)
- **Phase 4** — 학교 모듈 (교직원 복무, 학생 출결)
- **Phase 5** — AI 이상탐지, 얼굴인식, 급여 연동

## 📏 개발 규칙

- 타입 안정성: 모든 API는 Zod로 검증, 타입은 `packages/shared` 공유.
- i18n: 한국어/영어 키 분리 — 하드코딩 금지.
- 보안: 비밀번호 bcrypt, 얼굴 임베딩만 저장(원본 미저장 옵션), 민감정보 로그 금지.
- 커밋: Conventional Commits (`feat:`, `fix:`, `chore:` 등).

---

<details>
<summary>이전 리포 콘텐츠 (프론트엔드 개발 SCHOOL 2기)</summary>

![open-img](ASSETS/open-img.png)

3개월의 프론트엔드 개발 SCHOOL 과정 수료생 프로젝트 자료. ASSETS 폴더 참고.

</details>
