'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState, type FormEvent, type ReactElement } from 'react';
import { api, ApiError } from '../../../lib/api';
import { useAuthStore } from '../../../lib/auth-store';
import { Button, Card, Input, Label } from '../../../components/ui';

export default function SignInPage(): ReactElement {
  const t = useTranslations();
  const router = useRouter();
  const setTokens = useAuthStore((s) => s.setTokens);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const tokens = await api.auth.signIn({ email, password });
      setTokens(tokens);
      router.push('../dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <h1 className="mb-6 text-2xl font-bold">{t('auth.signIn')}</h1>
      <Card>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">{t('auth.email')}</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="password">{t('auth.password')}</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? '…' : t('auth.signIn')}
          </Button>
        </form>
      </Card>
      <p className="mt-4 text-sm text-neutral-600">
        <a href="./signup" className="underline">
          {t('auth.signUp')}
        </a>
      </p>
    </main>
  );
}
