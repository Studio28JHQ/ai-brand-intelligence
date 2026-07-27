import type { Combinator } from '../combinator';
import { findSignal } from '../signal-lookup';

export const headingStructureQuality: Combinator = (signals) => {
  const headingHierarchy = findSignal(signals, 'heading-hierarchy');
  if (!headingHierarchy) {
    return null;
  }

  const h1Count = Number(headingHierarchy.data.h1Count ?? 0);
  const emptyHeadingCount = Number(headingHierarchy.data.emptyHeadingCount ?? 0);
  const hierarchySkips = Array.isArray(headingHierarchy.data.hierarchySkips) ? headingHierarchy.data.hierarchySkips : [];

  return {
    key: 'heading-structure-quality',
    category: 'content',
    version: '1.0.0',
    contributingSignalKeys: ['heading-hierarchy'],
    value: {
      h1Count,
      hasSingleH1: h1Count === 1,
      hierarchyValid: hierarchySkips.length === 0,
      emptyHeadingCount,
    },
  };
};
