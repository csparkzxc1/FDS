# @multicheck/web

Next.js 14 App Router 관리자 대시보드. 한국어/영어 (next-intl), Tailwind CSS.

## 실행

```bash
pnpm dev:web   # http://localhost:3000  →  /ko 또는 /en 리다이렉트
```

## 구조

```
src/app/
└── [locale]/
    ├── layout.tsx    NextIntlClientProvider
    └── page.tsx      랜딩

messages/
├── ko.json
└── en.json

i18n.ts               locale 설정
middleware.ts         locale 라우팅
```

## i18n 규칙

- 모든 사용자 노출 문자열은 `messages/{ko,en}.json`에 키로 등록.
- 하드코딩 금지. `useTranslations()` 또는 `getTranslations()` 사용.
