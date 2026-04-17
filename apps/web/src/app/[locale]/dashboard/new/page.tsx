'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState, type FormEvent, type ReactElement } from 'react';
import { api, ApiError } from '../../../../lib/api';
import { useAuthStore } from '../../../../lib/auth-store';
import { Button, Card, Input, Label } from '../../../../components/ui';
import type { OrganizationType } from '@multicheck/shared';

export default function CreateOrgPage(): ReactElement {
  const t = useTranslations();
  const router = useRouter();
  const token = useAuthStore((s) => s.accessToken);
  const [name, setName] = useState('');
  const [type, setType] = useState<OrganizationType>('company');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setLoading(true);
    try {
      const org = await api.organizations.create(token, {
        name,
        type,
        timezone: 'Asia/Seoul',
        locale: 'ko',
      });
      router.push(`../${org.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-2xl font-bold">{t('org.create')}</h1>
      <Card>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">{t('org.name')}</Label>
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="type">{t('org.type')}</Label>
            <select
              id="type"
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm"
              value={type}
              onChange={(e) => setType(e.target.value as OrganizationType)}
            >
              <option value="company">{t('org.typeCompany')}</option>
              <option value="academy">{t('org.typeAcademy')}</option>
              <option value="school">{t('org.typeSchool')}</option>
            </select>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? '…' : t('org.create')}
          </Button>
        </form>
      </Card>
    </div>
  );
}
