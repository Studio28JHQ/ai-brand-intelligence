import { DEFAULT_LOCALE, SupportedLocale } from './locales';
import { normalizeLocale } from './normalize-locale';

interface AcceptLanguageEntry {
  tag: string;
  quality: number;
}

// Parses a raw `Accept-Language` header into tags ordered by quality (`q=`) descending, highest
// preference first — the browser's own priority order, not just the first tag listed.
export function parseAcceptLanguage(header: string | null | undefined): string[] {
  if (!header) {
    return [];
  }

  const entries: AcceptLanguageEntry[] = header
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .map((part) => {
      const [tag, ...params] = part.split(';').map((segment) => segment.trim());
      const qualityParam = params.find((param) => param.startsWith('q='));
      const parsedQuality = qualityParam ? Number.parseFloat(qualityParam.slice(2)) : 1;
      return { tag, quality: Number.isFinite(parsedQuality) ? parsedQuality : 1 };
    })
    .filter((entry) => entry.tag.length > 0 && entry.tag !== '*');

  entries.sort((a, b) => b.quality - a.quality);
  return entries.map((entry) => entry.tag);
}

// Picks the highest-preference tag that maps to a genuinely supported language — a lower-priority
// supported language beats a higher-priority unsupported one (e.g. `fr-FR,es;q=0.5` resolves to
// `es`, not `en`), matching what a user who listed multiple acceptable languages actually wants.
// Only falls back to DEFAULT_LOCALE when nothing in the header is supported at all.
export function detectBrowserLocale(acceptLanguageHeader: string | null | undefined): SupportedLocale {
  const tags = parseAcceptLanguage(acceptLanguageHeader);

  for (const tag of tags) {
    const base = tag.trim().toLowerCase().split('-')[0];
    if (base === 'en' || base === 'es' || base === 'pt') {
      return normalizeLocale(tag);
    }
  }

  return DEFAULT_LOCALE;
}

export interface ResolveLocaleInput {
  // Step 1: the authenticated user's saved preference (real persistence, `F10-S05B` — a nullable
  // `locale` column on `User`, exposed via `UserMetadata.locale`). `null` until the user has
  // explicitly set one, in which case this step is skipped in favor of browser detection.
  userPreference?: string | null;
  // Step 2: the request's raw `Accept-Language` header.
  acceptLanguageHeader?: string | null;
}

// The three-step resolution order this platform commits to (F10-S05A, see
// docs/04_PROJECT/DECISION_LOG.md#cto-108): saved user preference, then browser language, then
// English. Every step normalizes through the same `normalizeLocale`/`detectBrowserLocale` rules,
// so a malformed or unsupported value at any step safely degrades to the next one rather than
// throwing.
export function resolveLocale({ userPreference, acceptLanguageHeader }: ResolveLocaleInput): SupportedLocale {
  if (userPreference) {
    return normalizeLocale(userPreference);
  }
  return detectBrowserLocale(acceptLanguageHeader);
}
