import type { Combinator } from '../combinator';
import { findSignal } from '../signal-lookup';

type CoverageBand = 'none' | 'partial' | 'full';

export const structuredDataCoverage: Combinator = (signals) => {
  const signal = findSignal(signals, 'structured-data');
  if (!signal) {
    return null;
  }

  const hasJsonLd = Number(signal.data.jsonLdBlockCount ?? 0) > 0;
  const jsonLdValid = Number(signal.data.jsonLdValidCount ?? 0) > 0;
  const hasOpenGraph = Boolean(signal.data.hasOpenGraph);
  const hasTwitterCard = Boolean(signal.data.hasTwitterCard);
  const presentCount = [hasJsonLd, hasOpenGraph, hasTwitterCard].filter(Boolean).length;

  const coverageBand: CoverageBand = presentCount === 0 ? 'none' : presentCount === 3 ? 'full' : 'partial';

  return {
    key: 'structured-data-coverage',
    category: 'seo',
    version: '1.0.0',
    contributingSignalKeys: ['structured-data'],
    value: { hasJsonLd, jsonLdValid, hasOpenGraph, hasTwitterCard, coverageBand },
  };
};
