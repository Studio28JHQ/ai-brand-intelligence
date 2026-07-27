import type { Combinator } from '../combinator';
import { findSignal } from '../signal-lookup';

export const aiVisibilityReadiness: Combinator = (signals) => {
  const signal = findSignal(signals, 'visibility-assessment');
  if (!signal) {
    return null;
  }

  return {
    key: 'ai-visibility-readiness',
    category: 'ai-visibility',
    version: '1.0.0',
    contributingSignalKeys: ['visibility-assessment'],
    value: {
      status: signal.data.status,
      graphCompleteness: signal.data.graphCompleteness,
      entityCoverage: signal.data.entityCoverage,
      relationshipCoverage: signal.data.relationshipCoverage,
    },
  };
};
