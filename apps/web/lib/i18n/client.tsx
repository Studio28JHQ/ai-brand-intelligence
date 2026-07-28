'use client';

import { createContext, useContext, useMemo } from 'react';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
  formatPercent,
  formatRelativeTime,
  MessageDomain,
  Messages,
  resolveTranslation,
  SupportedLocale,
  TranslationParams,
  Translator,
} from '@ai-visibility/i18n';

interface I18nContextValue {
  locale: SupportedLocale;
  messages: Record<MessageDomain, Messages>;
  englishMessages: Record<MessageDomain, Messages>;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export interface I18nProviderProps extends I18nContextValue {
  children: React.ReactNode;
}

// Fed by messages the root layout (a Server Component) preloaded via `getClientI18nPayload` and
// passed down as plain, serializable props — this provider itself never touches `node:fs`.
export function I18nProvider({ locale, messages, englishMessages, children }: I18nProviderProps) {
  const value = useMemo(() => ({ locale, messages, englishMessages }), [locale, messages, englishMessages]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

function useI18nContext(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslations/useFormatters must be used within an I18nProvider');
  }
  return context;
}

export function useTranslations(domain: MessageDomain): Translator {
  const { messages, englishMessages } = useI18nContext();

  return useMemo(() => {
    const localeMessages = messages[domain] ?? {};
    const english = englishMessages[domain] ?? {};
    return (key: string, params?: TranslationParams): string =>
      resolveTranslation(localeMessages, english, domain, key, params);
  }, [messages, englishMessages, domain]);
}

export interface Formatters {
  formatDate: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
  formatDateTime: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
  formatRelativeTime: (date: Date | string | number, now?: Date | string | number) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatPercent: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (value: number, currencyCode: string, options?: Intl.NumberFormatOptions) => string;
}

export function useFormatters(): Formatters {
  const { locale } = useI18nContext();

  return useMemo<Formatters>(
    () => ({
      formatDate: (date, options) => formatDate(locale, date, options),
      formatDateTime: (date, options) => formatDateTime(locale, date, options),
      formatRelativeTime: (date, now) => formatRelativeTime(locale, date, now),
      formatNumber: (value, options) => formatNumber(locale, value, options),
      formatPercent: (value, options) => formatPercent(locale, value, options),
      formatCurrency: (value, currencyCode, options) => formatCurrency(locale, value, currencyCode, options),
    }),
    [locale],
  );
}
