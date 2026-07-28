import { SupportedLocale } from './locales';

// Centralized, locale-aware formatting (F10-S05A's own requirement: no component should call
// `Intl.*Format` — or hand-roll date/number formatting — directly). Every one of en/es/pt-BR is a
// real, well-supported `Intl` locale, so no formatting logic is hand-rolled here at all — these
// six functions just fix the entry points and sensible defaults.

export function formatDate(
  locale: SupportedLocale,
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
): string {
  return new Intl.DateTimeFormat(locale, options).format(new Date(date));
}

export function formatDateTime(
  locale: SupportedLocale,
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' },
): string {
  return new Intl.DateTimeFormat(locale, options).format(new Date(date));
}

const RELATIVE_TIME_STEPS: ReadonlyArray<{ unit: Intl.RelativeTimeFormatUnit; ms: number }> = [
  { unit: 'year', ms: 365 * 24 * 60 * 60 * 1000 },
  { unit: 'month', ms: 30 * 24 * 60 * 60 * 1000 },
  { unit: 'week', ms: 7 * 24 * 60 * 60 * 1000 },
  { unit: 'day', ms: 24 * 60 * 60 * 1000 },
  { unit: 'hour', ms: 60 * 60 * 1000 },
  { unit: 'minute', ms: 60 * 1000 },
  { unit: 'second', ms: 1000 },
];

export function formatRelativeTime(
  locale: SupportedLocale,
  date: Date | string | number,
  now: Date | string | number = new Date(),
): string {
  const diffMs = new Date(date).getTime() - new Date(now).getTime();
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  for (const { unit, ms } of RELATIVE_TIME_STEPS) {
    if (Math.abs(diffMs) >= ms) {
      return formatter.format(Math.round(diffMs / ms), unit);
    }
  }
  return formatter.format(0, 'second');
}

export function formatNumber(locale: SupportedLocale, value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

// `value` is a plain ratio (0.42 -> "42%"), matching `Intl`'s own `style: 'percent'` convention —
// a caller already holding a 0-100 score divides by 100 first, never multiplies here.
export function formatPercent(locale: SupportedLocale, value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0, ...options }).format(value);
}

export function formatCurrency(
  locale: SupportedLocale,
  value: number,
  currencyCode: string,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: currencyCode, ...options }).format(value);
}
