import type { Combinator } from '../combinator';
import { findSignal } from '../signal-lookup';

type DepthBand = 'thin' | 'adequate' | 'rich';

function bandFor(wordCount: number): DepthBand {
  if (wordCount < 300) return 'thin';
  if (wordCount < 900) return 'adequate';
  return 'rich';
}

export const contentDepth: Combinator = (signals) => {
  const wordCountSignal = findSignal(signals, 'word-count');
  if (!wordCountSignal) {
    return null;
  }

  const wordCount = Number(wordCountSignal.data.wordCount ?? 0);

  return {
    key: 'content-depth',
    category: 'content',
    version: '1.0.0',
    contributingSignalKeys: ['word-count'],
    value: { wordCount, band: bandFor(wordCount) },
  };
};
