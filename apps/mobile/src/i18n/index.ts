import { I18n } from 'i18n-js';
import ko from './ko.json';
import en from './en.json';

export const i18n = new I18n({ ko, en });
i18n.defaultLocale = 'ko';
i18n.locale = 'ko';
i18n.enableFallback = true;

export function setLocale(locale: 'ko' | 'en') {
  i18n.locale = locale;
}

export function t(key: string, opts?: Record<string, unknown>) {
  return i18n.t(key, opts);
}
