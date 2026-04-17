'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState, type FormEvent, type ReactElement } from 'react';
import { api, ApiError } from '../../../../lib/api';
import { useAuthStore } from '../../../../lib/auth-store';
import { Button, Card, Input, Label } from '../../../../components/ui';

export default function OrgDetailPage(): ReactElement {
  const t = useTranslations();
  const params = useParams<{ orgId: string }>();
  const orgId = params.orgId;
  const token = useAuthStore((s) => s.accessToken);
  const qc = useQueryClient();

  const orgQ = useQuery({
    queryKey: ['org', orgId],
    queryFn: () => api.organizations.get(token!, orgId),
    enabled: !!token,
  });
  const locationsQ = useQuery({
    queryKey: ['org', orgId, 'locations'],
    queryFn: () => api.organizations.listLocations(token!, orgId),
    enabled: !!token,
  });
  const attendancesQ = useQuery({
    queryKey: ['org', orgId, 'attendances'],
    queryFn: () => api.attendances.list(token!, orgId, { limit: 20 }),
    enabled: !!token,
  });

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const inviteMut = useMutation({
    mutationFn: (email: string) =>
      api.organizations.invite(token!, orgId, { email, role: 'member' }),
    onSuccess: (data) => {
      setInviteToken(data.token);
      setInviteEmail('');
    },
  });

  const [locName, setLocName] = useState('');
  const [locLat, setLocLat] = useState('37.5665');
  const [locLng, setLocLng] = useState('126.978');
  const [locRadius, setLocRadius] = useState('150');
  const locMut = useMutation({
    mutationFn: () =>
      api.organizations.createLocation(token!, orgId, {
        name: locName,
        lat: Number(locLat),
        lng: Number(locLng),
        radiusMeters: Number(locRadius),
      }),
    onSuccess: () => {
      setLocName('');
      qc.invalidateQueries({ queryKey: ['org', orgId, 'locations'] });
    },
  });

  function onInvite(e: FormEvent) {
    e.preventDefault();
    inviteMut.mutate(inviteEmail);
  }
  function onCreateLocation(e: FormEvent) {
    e.preventDefault();
    locMut.mutate();
  }

  return (
    <div className="space-y-8">
      <div>
        <a href=".." className="text-xs text-neutral-500 hover:underline">
          ← {t('nav.dashboard')}
        </a>
        <h1 className="mt-2 text-2xl font-bold">{orgQ.data?.name ?? '…'}</h1>
        <p className="text-sm text-neutral-500">{orgQ.data?.type}</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t('nav.locations')}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {locationsQ.data?.map((loc) => (
            <Card key={loc.id}>
              <div className="font-semibold">{loc.name}</div>
              <div className="mt-1 text-xs text-neutral-500">
                {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)} · {loc.radiusMeters}m
              </div>
            </Card>
          ))}
        </div>
        <Card>
          <form onSubmit={onCreateLocation} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="sm:col-span-2">
              <Label>{t('location.name')}</Label>
              <Input required value={locName} onChange={(e) => setLocName(e.target.value)} />
            </div>
            <div>
              <Label>lat</Label>
              <Input value={locLat} onChange={(e) => setLocLat(e.target.value)} />
            </div>
            <div>
              <Label>lng</Label>
              <Input value={locLng} onChange={(e) => setLocLng(e.target.value)} />
            </div>
            <div>
              <Label>{t('location.radius')}</Label>
              <Input value={locRadius} onChange={(e) => setLocRadius(e.target.value)} />
            </div>
            <div className="sm:col-span-4">
              <Button type="submit" disabled={locMut.isPending}>
                {t('location.add')}
              </Button>
            </div>
          </form>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t('nav.members')}</h2>
        <Card>
          <form onSubmit={onInvite} className="flex items-end gap-3">
            <div className="flex-1">
              <Label>{t('invite.email')}</Label>
              <Input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={inviteMut.isPending}>
              {t('invite.send')}
            </Button>
          </form>
          {inviteToken && (
            <div className="mt-3 rounded-lg bg-neutral-100 p-3 text-xs">
              <div className="mb-1 font-semibold">{t('invite.shareLink')}</div>
              <code className="break-all">/api/organizations/invites/accept/{inviteToken}</code>
            </div>
          )}
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t('nav.attendance')}</h2>
        <Card>
          {attendancesQ.data && attendancesQ.data.length === 0 && (
            <p className="text-sm text-neutral-600">{t('attendance.empty')}</p>
          )}
          <ul className="divide-y divide-neutral-100">
            {attendancesQ.data?.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-2 text-sm">
                <span>{new Date(a.checkInAt).toLocaleString()}</span>
                <span className="text-xs text-neutral-500">
                  {a.method} · {a.status}
                  {a.workMinutes !== null ? ` · ${a.workMinutes}m` : ''}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {orgQ.error && (
        <p className="text-sm text-red-600">
          {orgQ.error instanceof ApiError ? orgQ.error.message : String(orgQ.error)}
        </p>
      )}
    </div>
  );
}
