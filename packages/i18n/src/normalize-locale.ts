import { DEFAULT_LOCALE, SupportedLocale } from './locales';

// Normalizes any BCP-47-ish language tag to one of this platform's three supported locales
// (F10-S05A). Case-insensitive; matches on the base language subtag so every regional variant of
// a supported language resolves correctly, per the ticket's own examples:
//   es-MX, es-CO, es-ES -> es
//   en-US, en-GB -> en
//   pt-BR -> pt-BR
//   pt-PT -> pt-BR (initially — this platform has only one Portuguese variant today)
//   anything else (unsupported languages, empty/malformed tags) -> DEFAULT_LOCALE ('en')
export function normalizeLocale(rawTag: string): SupportedLocale {
  const tag = rawTag.trim().toLowerCase();
  if (tag.length === 0) {
    return DEFAULT_LOCALE;
  }

  // Portuguese has its own rule regardless of region: pt-BR is the only Portuguese variant this
  // platform has, so every Portuguese tag (including pt-PT) maps to it rather than falling
  // through to English the way an unsupported language would.
  if (tag === 'pt' || tag.startsWith('pt-')) {
    return 'pt-BR';
  }

  if (tag === 'en' || tag.startsWith('en-')) {
    return 'en';
  }

  if (tag === 'es' || tag.startsWith('es-')) {
    return 'es';
  }

  return DEFAULT_LOCALE;
}
