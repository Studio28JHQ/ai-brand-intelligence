import type { Combinator } from '../combinator';
import { findSignal } from '../signal-lookup';

const MAX_RECOMMENDED_URL_LENGTH = 115;

export const technicalFoundation: Combinator = (signals) => {
  const technicalFilesSignal = findSignal(signals, 'technical-files');
  const urlStructureSignal = findSignal(signals, 'url-structure');
  if (!technicalFilesSignal || !urlStructureSignal) {
    return null;
  }

  const urlLength = Number(urlStructureSignal.data.length ?? 0);

  return {
    key: 'technical-foundation',
    category: 'technical',
    version: '1.0.0',
    contributingSignalKeys: ['technical-files', 'url-structure'],
    value: {
      hasRobotsTxt: Boolean(technicalFilesSignal.data.robotsTxtDetected),
      hasSitemap: Boolean(technicalFilesSignal.data.sitemapDetected),
      urlLength,
      urlLengthBand: urlLength > MAX_RECOMMENDED_URL_LENGTH ? 'long' : 'ok',
    },
  };
};
