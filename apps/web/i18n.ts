import { getRequestConfig } from 'next-intl/server';

export const locales = ['ko', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'ko';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = locales.includes(requested as Locale) ? (requested as Locale) : defaultLocale;
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
