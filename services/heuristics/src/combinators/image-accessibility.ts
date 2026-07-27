import type { Combinator } from '../combinator';
import { findSignal } from '../signal-lookup';

type CoverageBand = 'good' | 'needs-improvement' | 'poor';

function bandFor(ratio: number): CoverageBand {
  if (ratio >= 0.95) return 'good';
  if (ratio >= 0.7) return 'needs-improvement';
  return 'poor';
}

export const imageAccessibility: Combinator = (signals) => {
  const signal = findSignal(signals, 'image-accessibility');
  if (!signal) {
    return null;
  }

  const totalImages = Number(signal.data.totalImages ?? 0);
  const missingAltCount = Number(signal.data.missingAltCount ?? 0);
  const emptyAltCount = Number(signal.data.emptyAltCount ?? 0);
  const altCoverageRatio = totalImages === 0 ? 1 : (totalImages - missingAltCount) / totalImages;

  return {
    key: 'image-accessibility',
    category: 'content',
    version: '1.0.0',
    contributingSignalKeys: ['image-accessibility'],
    value: {
      totalImages,
      missingAltCount,
      emptyAltCount,
      missingDimensionsCount: Number(signal.data.missingDimensionsCount ?? 0),
      altCoverageRatio,
      band: bandFor(altCoverageRatio),
    },
  };
};
