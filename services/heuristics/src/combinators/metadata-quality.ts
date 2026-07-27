import type { Combinator } from '../combinator';
import { findSignal } from '../signal-lookup';

type LengthBand = 'missing' | 'too-short' | 'ok' | 'too-long';

function bandTitle(exists: boolean, length: number): LengthBand {
  if (!exists) return 'missing';
  if (length < 30) return 'too-short';
  if (length > 60) return 'too-long';
  return 'ok';
}

function bandDescription(exists: boolean, length: number): LengthBand {
  if (!exists) return 'missing';
  if (length < 70) return 'too-short';
  if (length > 160) return 'too-long';
  return 'ok';
}

export const metadataQuality: Combinator = (signals) => {
  const title = findSignal(signals, 'title');
  const description = findSignal(signals, 'meta-description');
  if (!title || !description) {
    return null;
  }

  const titleExists = Boolean(title.data.exists);
  const titleLength = Number(title.data.length ?? 0);
  const descriptionExists = Boolean(description.data.exists);
  const descriptionLength = Number(description.data.length ?? 0);

  return {
    key: 'metadata-quality',
    category: 'metadata',
    version: '1.0.0',
    contributingSignalKeys: ['title', 'meta-description'],
    value: {
      titleBand: bandTitle(titleExists, titleLength),
      titleLength,
      descriptionBand: bandDescription(descriptionExists, descriptionLength),
      descriptionLength,
    },
  };
};
