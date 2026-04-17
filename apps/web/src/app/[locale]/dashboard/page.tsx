'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import type { ReactElement } from 'react';
import { api } from '../../../lib/api';
import { useAuthStore } from '../../../lib/auth-store';
import { Button, Card } from '../../../components/ui';

export default function DashboardPage(): ReactElement {
  const t = useTranslations();
  const token = useAuthStore((s) => s.accessToken);
  const { data, isLoading, error } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => api.organizations.list(token!),
    enabled: !!token,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('nav.dashboard')}</h1>
        <a href="./dashboard/new">
          <Button>{t('org.create')}</Button>
        </a>
      </div>

      {isLoading && <p className="text-sm text-neutral-600">Loading…</p>}
      {error && <p className="text-sm text-red-600">{String(error)}</p>}

      {data && data.length === 0 && (
        <Card>
          <p className="text-sm text-neutral-600">{t('org.empty')}</p>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {data?.map((org) => (
          <a key={org.id} href={`./dashboard/${org.id}`} className="block">
            <Card className="transition hover:border-neutral-400">
              <div className="mb-2 text-xs uppercase tracking-wide text-neutral-500">
                {org.type}
              </div>
              <div className="text-lg font-semibold">{org.name}</div>
              <div className="mt-1 text-xs text-neutral-500">{org.plan}</div>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}
