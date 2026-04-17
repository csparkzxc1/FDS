import type {
  AuthTokens,
  CreateOrganizationInput,
  InviteMemberInput,
  LocationInput,
  SignInInput,
  SignUpInput,
} from '@multicheck/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type RequestInput = {
  path: string;
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string | null;
  query?: Record<string, string | number | undefined>;
};

async function request<T>({ path, method = 'GET', body, token, query }: RequestInput): Promise<T> {
  const url = new URL(`/api${path}`, API_URL);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  if (!res.ok) {
    let payload: unknown;
    try {
      payload = await res.json();
    } catch {
      payload = await res.text().catch(() => null);
    }
    const msg =
      (payload && typeof payload === 'object' && 'message' in payload
        ? String((payload as { message?: unknown }).message)
        : null) ?? `Request failed (${res.status})`;
    throw new ApiError(res.status, msg, payload);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  health: () => request<{ status: string; timestamp: string }>({ path: '/health' }),

  auth: {
    signUp: (body: SignUpInput) => request<AuthTokens>({ path: '/auth/signup', method: 'POST', body }),
    signIn: (body: SignInInput) => request<AuthTokens>({ path: '/auth/signin', method: 'POST', body }),
    refresh: (refreshToken: string) =>
      request<AuthTokens>({ path: '/auth/refresh', method: 'POST', body: { refreshToken } }),
  },

  organizations: {
    list: (token: string) =>
      request<OrganizationDto[]>({ path: '/organizations', token }),
    create: (token: string, body: CreateOrganizationInput) =>
      request<OrganizationDto>({ path: '/organizations', method: 'POST', token, body }),
    get: (token: string, orgId: string) =>
      request<OrganizationDto>({ path: `/organizations/${orgId}`, token }),
    invite: (token: string, orgId: string, body: InviteMemberInput) =>
      request<{ id: string; token: string; expiresAt: string }>({
        path: `/organizations/${orgId}/invites`,
        method: 'POST',
        token,
        body,
      }),
    listLocations: (token: string, orgId: string) =>
      request<LocationDto[]>({ path: `/organizations/${orgId}/locations`, token }),
    createLocation: (token: string, orgId: string, body: LocationInput) =>
      request<LocationDto>({
        path: `/organizations/${orgId}/locations`,
        method: 'POST',
        token,
        body,
      }),
  },

  attendances: {
    list: (token: string, orgId: string, opts: { from?: string; to?: string; limit?: number } = {}) =>
      request<AttendanceDto[]>({
        path: `/organizations/${orgId}/attendances`,
        token,
        query: opts,
      }),
  },
};

export interface OrganizationDto {
  id: string;
  name: string;
  type: 'company' | 'academy' | 'school';
  plan: string;
  timezone: string;
  locale: string;
  createdAt: string;
}

export interface LocationDto {
  id: string;
  organizationId: string;
  name: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  wifiSsid?: string | null;
}

export interface AttendanceDto {
  id: string;
  organizationId: string;
  userId: string;
  checkInAt: string;
  checkOutAt: string | null;
  method: string;
  status: 'open' | 'closed' | 'missed' | 'voided';
  workMinutes: number | null;
  memo: string | null;
}
