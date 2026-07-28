// The three locales this platform supports today (F10-S05A). Adding a fourth means adding a real
// `locales/<tag>/` directory with real translations for every domain below — never a placeholder.
export const SUPPORTED_LOCALES = ['en', 'es', 'pt-BR'] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = 'en';

export function isSupportedLocale(value: string): value is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

// One file per domain, per locale, under packages/i18n/locales/<locale>/<domain>.json — organizing
// by domain (not one giant file) keeps each translator's unit of work small and reviewable.
export const MESSAGE_DOMAINS = [
  'common',
  'navigation',
  'auth',
  'dashboard',
  'projects',
  'audits',
  'pages',
  'findings',
  'optimization',
  'reports',
  'settings',
  'errors',
  'landing',
  'clients',
  'activity',
  'onboarding',
] as const;

export type MessageDomain = (typeof MESSAGE_DOMAINS)[number];
