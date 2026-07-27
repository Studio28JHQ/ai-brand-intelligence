import type { Combinator } from '../combinator';
import { findSignal } from '../signal-lookup';

export const securityPosture: Combinator = (signals) => {
  const httpsSignal = findSignal(signals, 'https');
  const mixedContentSignal = findSignal(signals, 'mixed-content');
  if (!httpsSignal || !mixedContentSignal) {
    return null;
  }

  const isHttps = Boolean(httpsSignal.data.isHttps);
  const mixedContentUrls = Array.isArray(mixedContentSignal.data.urls) ? mixedContentSignal.data.urls : [];

  return {
    key: 'security-posture',
    category: 'technical',
    version: '1.0.0',
    contributingSignalKeys: ['https', 'mixed-content'],
    value: {
      isSecure: isHttps && mixedContentUrls.length === 0,
      isHttps,
      mixedContentCount: mixedContentUrls.length,
    },
  };
};
