# @multicheck/mobile

Expo (React Native) 모바일 앱. iOS/Android 공용. i18n-js (ko/en).

## 실행

```bash
pnpm dev:mobile
# 또는
pnpm --filter @multicheck/mobile ios
pnpm --filter @multicheck/mobile android
```

## 구조

```
App.tsx                 루트 컴포넌트 (Phase 0 스켈레톤)
src/i18n/
├── index.ts            i18n-js 초기화
├── ko.json
└── en.json
app.json                Expo 설정 (iOS/Android, 위치 권한)
```

## Phase 1 예정

- expo-location 기반 GPS 체크인 화면
- 오프라인 큐 (AsyncStorage) → 복구 시 서버 동기화
- QR 체크인 (`expo-barcode-scanner`)
- 로그인/회원가입 플로우
