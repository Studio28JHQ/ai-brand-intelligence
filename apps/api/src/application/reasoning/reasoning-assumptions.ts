import type { AssumptionCode, AssumptionFact } from '@ai-visibility/contracts';

// `code` alone is the stable identifier persisted/returned here — the presentation layer resolves
// its localized sentence via the `rules` i18n domain (`assumptions.<code>`), per
// `docs/04_PROJECT/DECISION_LOG.md#cto-111`.
export function buildAssumption(code: AssumptionCode): AssumptionFact {
  return { code };
}
