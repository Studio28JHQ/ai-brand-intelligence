import { DEFAULT_LOCALE, MessageDomain, SupportedLocale } from './locales';
import { loadMessages, Messages, MessageValue } from './messages';

export type TranslationParams = Record<string, string | number>;
export type Translator = (key: string, params?: TranslationParams) => string;

function getByPath(messages: Messages, path: string[]): MessageValue | Messages | undefined {
  let current: MessageValue | Messages | undefined = messages;
  for (const segment of path) {
    if (typeof current !== 'object' || current === null) {
      return undefined;
    }
    current = (current as Messages)[segment];
  }
  return current;
}

function interpolate(template: string, params?: TranslationParams): string {
  if (!params) {
    return template;
  }
  return template.replace(/\{(\w+)\}/g, (match, name: string) => (name in params ? String(params[name]) : match));
}

function isPluralValue(value: unknown): value is { one: string; other: string } {
  return typeof value === 'object' && value !== null && 'one' in value && 'other' in value;
}

// A message is either a plain string, or a minimal `{ one, other }` pair for the simple
// singular/plural rules English, Spanish, and Portuguese all share (no complex plural categories
// needed) — selected via a numeric `count` param.
function resolveValue(value: MessageValue | Messages | undefined, params?: TranslationParams): string | undefined {
  if (typeof value === 'string') {
    return interpolate(value, params);
  }
  if (isPluralValue(value)) {
    const count = typeof params?.count === 'number' ? params.count : undefined;
    const form = count !== undefined && Math.abs(count) === 1 ? value.one : value.other;
    return interpolate(form, params);
  }
  return undefined;
}

// The safe, three-tier lookup at the heart of this system: requested locale -> English -> a final,
// environment-aware safety net. Never throws. In production, a key missing from *both* the
// requested locale and English logs an error and returns an empty string rather than ever
// rendering a raw key to an end user (F10-S05A's own explicit requirement); in development it
// returns a visible `[[missing: ...]]` marker instead, so gaps are obvious before they ever reach
// production.
//
// Deliberately pure — takes already-loaded message objects rather than loading them itself — so it
// runs identically wherever it's called: server-side (fed by `loadMessages`) or in the browser
// (fed by messages the server preloaded and passed down as serializable props).
export function resolveTranslation(
  localeMessages: Messages,
  englishMessages: Messages,
  domain: MessageDomain,
  key: string,
  params?: TranslationParams,
): string {
  const path = key.split('.');

  const localized = resolveValue(getByPath(localeMessages, path), params);
  if (localized !== undefined) {
    return localized;
  }

  const english = resolveValue(getByPath(englishMessages, path), params);
  if (english !== undefined) {
    return english;
  }

  const fullKey = `${domain}.${key}`;
  if (process.env.NODE_ENV === 'production') {
    console.error(`[i18n] Missing translation (even in English fallback): ${fullKey}`);
    return '';
  }
  return `[[missing: ${fullKey}]]`;
}

// Convenience wrapper: builds a `t(key, params?)` scoped to one domain in one locale via
// `loadMessages`. Prefer `resolveTranslation` directly wherever messages have already been loaded
// through some other path (e.g. the client hook, fed by preloaded props).
export function createTranslator(locale: SupportedLocale, domain: MessageDomain): Translator {
  const localeMessages = loadMessages(locale, domain);
  const englishMessages = locale === DEFAULT_LOCALE ? localeMessages : loadMessages(DEFAULT_LOCALE, domain);

  return (key: string, params?: TranslationParams): string =>
    resolveTranslation(localeMessages, englishMessages, domain, key, params);
}
