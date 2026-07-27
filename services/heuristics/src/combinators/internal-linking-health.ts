import type { Combinator } from '../combinator';
import { findSignal } from '../signal-lookup';

type LinkingBand = 'none' | 'low' | 'healthy';

function bandFor(internalLinkCount: number): LinkingBand {
  if (internalLinkCount === 0) return 'none';
  if (internalLinkCount <= 2) return 'low';
  return 'healthy';
}

export const internalLinkingHealth: Combinator = (signals) => {
  const signal = findSignal(signals, 'link-counts');
  if (!signal) {
    return null;
  }

  const internalLinkCount = Number(signal.data.internalLinkCount ?? 0);

  return {
    key: 'internal-linking-health',
    category: 'seo',
    version: '1.0.0',
    contributingSignalKeys: ['link-counts'],
    value: { internalLinkCount, band: bandFor(internalLinkCount) },
  };
};
