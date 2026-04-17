# @multicheck/shared

Backend/Web/Mobile 간에 공유되는 **Zod 스키마** 및 **TypeScript 타입** 정의.

## 사용

```ts
import { CheckInSchema, OrganizationType, type CheckInInput } from '@multicheck/shared';

const input: CheckInInput = CheckInSchema.parse(body);
```

## 규칙

- 여기 정의된 모든 Zod 스키마는 API 요청/응답 검증에 사용됩니다.
- 하드코딩된 enum 대신 `OrganizationType`, `UserRole`, `CheckInMethod` 상수를 사용하세요.
- 브레이킹 체인지가 발생하면 consumer(`api`, `web`, `mobile`)도 함께 업데이트해야 합니다.
