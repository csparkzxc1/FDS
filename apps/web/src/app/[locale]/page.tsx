import type { ReactElement } from 'react';
import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

export default function LandingPage({
  params: { locale },
}: {
  params: { locale: string };
}): ReactElement {
  setRequestLocale(locale);
  const t = useTranslations();
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-start justify-center px-6 py-16">
      <span className="mb-4 rounded-full bg-neutral-900 px-3 py-1 text-xs font-semibold text-white">
        {t('app.title')}
      </span>
      <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
        {t('landing.heading')}
      </h1>
      <p className="mb-8 text-lg text-neutral-600">{t('landing.subheading')}</p>
      <a
        href="/ko/signin"
        className="rounded-lg bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-700"
      >
        {t('landing.cta')}
      </a>
    </main>
  );
}
