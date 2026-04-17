'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactElement, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '../../../lib/auth-store';
import { Button } from '../../../components/ui';

export default function DashboardLayout({ children }: { children: ReactNode }): ReactElement | null {
  const t = useTranslations();
  const router = useRouter();
  const token = useAuthStore((s) => s.accessToken);
  const clear = useAuthStore((s) => s.clear);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (hydrated && !token) router.replace('../signin');
  }, [hydrated, token, router]);

  if (!hydrated) return null;
  if (!token) return null;

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <a href="./dashboard" className="text-lg font-bold">
            {t('app.title')}
          </a>
          <Button
            variant="ghost"
            onClick={() => {
              clear();
              router.replace('../signin');
            }}
          >
            {t('nav.signOut')}
          </Button>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-6 py-8">{children}</div>
    </div>
  );
}
