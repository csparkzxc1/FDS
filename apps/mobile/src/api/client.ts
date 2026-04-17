import type {
  AuthTokens,
  CheckInInput,
  CheckOutInput,
  SignInInput,
} from '@multicheck/shared';

declare const process: { env: { EXPO_PUBLIC_API_URL?: string } };

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  opts: { method?: string; body?: unknown; token?: string | null } = {},
): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`, {
    method: opts.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
    },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const j = (await res.json()) as { message?: string };
      if (j?.message) msg = j.message;
    } catch {
      // ignore
    }
    throw new ApiError(res.status, msg);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export interface OrganizationSummary {
  id: string;
  name: string;
  type: 'company' | 'academy' | 'school';
}

export interface AttendanceRecord {
  id: string;
  checkInAt: string;
  checkOutAt: string | null;
  status: 'open' | 'closed' | 'missed' | 'voided';
  method: string;
  workMinutes: number | null;
}

export const api = {
  signIn: (body: SignInInput) =>
    request<AuthTokens>('/auth/signin', { method: 'POST', body }),
  organizations: (token: string) =>
    request<OrganizationSummary[]>('/organizations', { token }),
  checkIn: (token: string, orgId: string, body: CheckInInput) =>
    request<AttendanceRecord>(`/organizations/${orgId}/attendances/check-in`, {
      method: 'POST',
      token,
      body,
    }),
  checkOut: (token: string, orgId: string, body: CheckOutInput) =>
    request<AttendanceRecord>(`/organizations/${orgId}/attendances/check-out`, {
      method: 'POST',
      token,
      body,
    }),
  attendances: (token: string, orgId: string) =>
    request<AttendanceRecord[]>(`/organizations/${orgId}/attendances?limit=20`, { token }),
};
