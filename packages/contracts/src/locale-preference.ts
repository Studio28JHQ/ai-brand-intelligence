// Contract only (F10-S05A). Duplicated here rather than imported from `@ai-visibility/i18n` to
// avoid a `packages/contracts` -> `packages/i18n` dependency for a single 3-value union.
// No endpoint returns or persists this today — real persistence (a column on the user record and
// the read/write endpoints) lands in the next sprint, F10-S05B.
export type SupportedLocale = 'en' | 'es' | 'pt-BR';

export interface UserLocalePreference {
  userId: string;
  locale: SupportedLocale;
  updatedAt: string;
}
