import type { Combinator } from '../combinator';
import { findSignal } from '../signal-lookup';

function isNoIndex(value: unknown): boolean {
  return typeof value === 'string' && value.toLowerCase().includes('noindex');
}

export const indexability: Combinator = (signals) => {
  const indexabilitySignal = findSignal(signals, 'indexability');
  const canonicalSignal = findSignal(signals, 'canonical');
  if (!indexabilitySignal) {
    return null;
  }

  const httpStatus = Number(indexabilitySignal.data.httpStatus ?? 0);
  const blockers: string[] = [];

  if (httpStatus < 200 || httpStatus >= 300) {
    blockers.push('non-2xx-http-status');
  }
  if (isNoIndex(indexabilitySignal.data.metaRobots)) {
    blockers.push('meta-robots-noindex');
  }
  if (isNoIndex(indexabilitySignal.data.xRobotsTagHeader)) {
    blockers.push('x-robots-tag-noindex');
  }
  if (canonicalSignal && canonicalSignal.data.canonicalUrl && !canonicalSignal.data.isSelfReferencing) {
    blockers.push('canonical-not-self-referencing');
  }

  return {
    key: 'indexability',
    category: 'seo',
    version: '1.0.0',
    contributingSignalKeys: ['indexability', 'canonical'],
    value: { isIndexable: blockers.length === 0, blockers },
  };
};
