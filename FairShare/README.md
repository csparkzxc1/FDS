# FairShare — 집안일 분담 & 용돈 관리 앱

가족·커플·룸메이트가 집안일을 포인트로 기록하고, 공정하게 분담하거나 아이 용돈으로 환산하는 앱입니다.

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | React Native + Expo SDK 54 |
| 언어 | TypeScript (strict) |
| 라우팅 | Expo Router v4 (파일 기반) |
| 스타일 | NativeWind v4 (Tailwind CSS) |
| 백엔드 | Supabase (Auth, PostgreSQL, Realtime, Storage) |
| 상태관리 | Zustand + React Query v5 |
| 차트 | react-native-svg (DonutChart, SeesawChart 자체 구현) |
| 알림 | expo-notifications (로컬 알림) |
| 오프라인 | Zustand persist + AsyncStorage + NetInfo |

---

## 설치 및 실행

### 사전 조건

- Node.js 18+
- Expo CLI / EAS CLI

### 설치

```bash
cd FairShare
npm install
```

### 환경변수 설정

```bash
cp .env.example .env
```

`.env` 파일에 Supabase 정보를 입력합니다:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

> **개발 모드**: `EXPO_PUBLIC_DEV_SKIP_AUTH=true` 추가 시 Supabase 없이 Mock 데이터로 실행됩니다.

### 데이터베이스 설정

Supabase SQL Editor에서 `supabase/migrations/` 폴더의 SQL 파일을 순서대로 실행합니다.

### 실행

```bash
npx expo start
```

---

## 프로젝트 구조

```
FairShare/
├── app/                        # Expo Router 화면
│   ├── _layout.tsx             # 루트 레이아웃 (QueryClient, ErrorBoundary)
│   ├── index.tsx               # 진입점 (인증 상태에 따라 리다이렉트)
│   ├── (auth)/                 # 인증 화면
│   │   ├── sign-in.tsx         # 이메일 + Apple 로그인
│   │   ├── sign-up.tsx
│   │   ├── reset-password.tsx
│   │   └── complete-profile.tsx
│   ├── (onboarding)/           # 온보딩 화면
│   │   ├── welcome.tsx
│   │   ├── household-choice.tsx
│   │   ├── create-household.tsx
│   │   ├── join-household.tsx
│   │   ├── pending-approval.tsx # Realtime 승인 대기
│   │   └── setup-chores.tsx
│   ├── (tabs)/                 # 메인 탭
│   │   ├── home.tsx            # 빠른 체크 + 아이 게임화 모드
│   │   ├── activity.tsx        # 기록 / 달력
│   │   ├── dashboard.tsx       # DonutChart + SeesawChart
│   │   └── settings.tsx        # 설정 + 알림
│   └── modals/                 # 바텀 시트 모달
│       ├── chore-detail.tsx    # 사진 인증 + 메모
│       ├── add-chore.tsx
│       ├── approval-queue.tsx  # 승인 대기 목록
│       ├── member-approval.tsx # 구성원 승인 + 역할 배정
│       ├── reward-goal.tsx     # 보상 목표 CRUD
│       └── settle-allowance.tsx# 용돈 정산 (이월/리셋)
│
├── components/
│   ├── charts/
│   │   ├── DonutChart.tsx
│   │   └── SeesawChart.tsx
│   └── ui/                     # Button, Card, Input, Avatar, Badge, ErrorBoundary, ...
│
├── hooks/
│   ├── queries/                # React Query 훅
│   │   ├── useChores.ts
│   │   ├── useHousehold.ts
│   │   └── useRewardGoals.ts
│   ├── useSession.ts
│   ├── useHouseholdInit.ts     # 탭 진입 시 구성원·Realtime 초기화
│   └── useOfflineSync.ts       # 오프라인 큐 동기화
│
├── services/                   # 외부 의존성 격리 레이어
│   ├── supabase.ts
│   ├── authService.ts
│   ├── choreService.ts
│   ├── householdService.ts
│   ├── allowanceService.ts
│   ├── rewardGoalService.ts
│   ├── notificationService.ts
│   └── storageService.ts       # 사진 업로드
│
├── stores/                     # Zustand
│   ├── authStore.ts
│   ├── householdStore.ts
│   └── offlineQueue.ts         # AsyncStorage persist
│
├── utils/
│   ├── devMode.ts              # IS_DEV_BYPASS, Mock 픽스처
│   ├── gamification.ts         # 레벨·스트릭 계산
│   ├── date.ts / fairness.ts / image.ts
│
├── supabase/migrations/        # DB 스키마 SQL
├── app.json                    # Expo 앱 설정
└── eas.json                    # EAS Build 프로파일
```

---

## 환경변수

| 변수 | 필수 | 설명 |
|------|------|------|
| `EXPO_PUBLIC_SUPABASE_URL` | ✅ | Supabase 프로젝트 URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon 키 |
| `EXPO_PUBLIC_DEV_SKIP_AUTH` | ❌ | `true` 시 Mock 데이터로 실행 |

> ⚠️ `service_role` 키는 클라이언트에 절대 포함하지 마세요.

---

## EAS 빌드

```bash
npm install -g eas-cli && eas login

# 개발 빌드 (시뮬레이터)
eas build --profile development --platform ios

# 내부 테스트 (실기기)
eas build --profile preview --platform all

# 프로덕션
eas build --profile production --platform all
eas submit --platform ios
eas submit --platform android
```

---

## 앱 스크린 목록

```
인증    : 로그인 / 회원가입 / 비밀번호 재설정 / 프로필 완성
온보딩  : 환영 / 가구 선택 / 가구 생성 / 초대 참여 / 승인 대기 / 집안일 설정
탭      : 홈 / 기록 / 대시보드 / 설정
모달    : 집안일 상세 / 집안일 CRUD / 승인 큐 / 구성원 관리 / 보상 목표 / 용돈 정산
```

---

## 보안 체크리스트

- [x] `.env` `.env.production` `.env*.local` — `.gitignore` 포함
- [x] `IS_DEV_BYPASS = __DEV__ && (!HAS_SUPABASE || DEV_SKIP_AUTH)` 이중 가드
- [x] 모든 Supabase 테이블에 RLS 정책 적용
- [x] 사진 업로드: 1024px 이하 리사이즈 + private 버킷
- [x] 컴포넌트에서 `supabase.from()` 직접 호출 없음 (services 레이어 격리)

---

## 가구 모드

| 모드 | 특징 |
|------|------|
| `couple` | 공정성 지수 + 시소 차트 |
| `family` | 아이 게임화(레벨·스트릭·보상목표) + 용돈 정산 |
| `roommate` | 분담률 대시보드 |

---

## v1.1 로드맵

- 카카오 로그인 (한국 타겟 MAU 향상)
- 홈 화면 위젯 (iOS/Android)
- 반복 집안일 스케줄링
- 서버 사이드 푸시 알림 (Supabase Edge Function + Expo Push)
- 다국어 지원 (English)
