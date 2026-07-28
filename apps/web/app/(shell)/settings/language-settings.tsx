'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { SupportedLocale } from '@ai-visibility/contracts';
import { updateLocalePreference } from '../../auth-actions';
import { Banner } from '../../components/ui';

// Each language's own name for itself, not translated per active UI locale — a language picker
// conventionally shows its options in their own native form regardless of the current locale.
const LOCALE_OPTIONS: ReadonlyArray<{ value: SupportedLocale; label: string }> = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'pt-BR', label: 'Português (Brasil)' },
];

export function LanguageSettings({ initialLocale, label }: { initialLocale: SupportedLocale; label: string }) {
  const router = useRouter();
  const [locale, setLocale] = useState(initialLocale);
  const [error, setError] = useState<string | undefined>(undefined);
  const [pending, startTransition] = useTransition();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const next = event.target.value as SupportedLocale;
    const previous = locale;
    setLocale(next);
    setError(undefined);

    startTransition(async () => {
      const result = await updateLocalePreference(next);
      if (result.error) {
        setError(result.error);
        setLocale(previous);
        return;
      }
      // The Server Action already synced the `NEXT_LOCALE` cookie; `refresh()` re-runs every
      // Server Component on this route (including the root layout's `I18nProvider` payload) so the
      // change is visible immediately, without a full page reload.
      router.refresh();
    });
  };

  return (
    <div className="field">
      <label htmlFor="language">{label}</label>
      <select id="language" className="input" value={locale} onChange={handleChange} disabled={pending}>
        {LOCALE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <Banner variant="error">{error}</Banner>}
    </div>
  );
}
