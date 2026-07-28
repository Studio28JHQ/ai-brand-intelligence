import { cookies, headers } from 'next/headers';
import {
  createTranslator,
  DEFAULT_LOCALE,
  isSupportedLocale,
  loadMessages,
  MESSAGE_DOMAINS,
  Messages,
  MessageDomain,
  resolveLocale,
  SupportedLocale,
  Translator,
} from '@ai-visibility/i18n';
import { LOCALE_COOKIE } from '../../proxy';

// Server-only (reads `next/headers`, and transitively `node:fs` via `@ai-visibility/i18n`'s
// `loadMessages`). The middleware already resolved and cookied the locale for this request,
// so this just re-reads that resolution rather than repeating it — with the same fallback chain
// as a safety net for the one request that runs before the cookie exists at all.
export async function getLocale(): Promise<SupportedLocale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  if (cookieLocale && isSupportedLocale(cookieLocale)) {
    return cookieLocale;
  }

  const headerList = await headers();
  return resolveLocale({
    userPreference: null,
    acceptLanguageHeader: headerList.get('accept-language'),
  });
}

export async function getTranslations(domain: MessageDomain): Promise<Translator> {
  const locale = await getLocale();
  return createTranslator(locale, domain);
}

export interface ClientI18nPayload {
  locale: SupportedLocale;
  messages: Record<MessageDomain, Messages>;
  englishMessages: Record<MessageDomain, Messages>;
}

// Preloads every domain's messages (for the resolved locale, and English for fallback) so the
// root layout can pass them down as serializable props into `I18nProvider` — Client Components
// can't call `loadMessages` themselves since it touches `node:fs`.
export async function getClientI18nPayload(): Promise<ClientI18nPayload> {
  const locale = await getLocale();
  const messages = {} as Record<MessageDomain, Messages>;
  const englishMessages = {} as Record<MessageDomain, Messages>;

  for (const domain of MESSAGE_DOMAINS) {
    messages[domain] = loadMessages(locale, domain);
    englishMessages[domain] = locale === DEFAULT_LOCALE ? messages[domain] : loadMessages(DEFAULT_LOCALE, domain);
  }

  return { locale, messages, englishMessages };
}
