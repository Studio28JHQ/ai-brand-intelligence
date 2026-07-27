import type { Combinator } from '../combinator';
import { findSignal } from '../signal-lookup';

type Risk = 'low' | 'medium' | 'high';

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export const performanceEstimate: Combinator = (signals) => {
  const htmlSizeSignal = findSignal(signals, 'html-size');
  const domSizeSignal = findSignal(signals, 'dom-size');
  const scriptPayloadSignal = findSignal(signals, 'script-payload');
  const stylePayloadSignal = findSignal(signals, 'style-payload');
  if (!htmlSizeSignal || !domSizeSignal || !scriptPayloadSignal || !stylePayloadSignal) {
    return null;
  }

  const htmlSizeBytes = Number(htmlSizeSignal.data.htmlSizeBytes ?? 0);
  const domElementCount = Number(domSizeSignal.data.domElementCount ?? 0);
  const blockingScriptCount = Number(scriptPayloadSignal.data.blockingScriptCount ?? 0);
  const externalStylesheetCount = Number(stylePayloadSignal.data.externalStylesheetCount ?? 0);
  const inlineScriptBytes = Number(scriptPayloadSignal.data.inlineScriptBytes ?? 0);

  let score = 100;
  score -= htmlSizeBytes > 300_000 ? 20 : htmlSizeBytes > 100_000 ? 10 : 0;
  score -= domElementCount > 1500 ? 20 : domElementCount > 800 ? 10 : 0;
  score -= Math.min(30, blockingScriptCount * 5);
  score -= externalStylesheetCount > 5 ? 5 : 0;
  const estimatedPerformanceScore = clampScore(score);

  const imageAccessibilitySignal = findSignal(signals, 'image-accessibility');
  const missingDimensionsCount = Number(imageAccessibilitySignal?.data.missingDimensionsCount ?? 0);

  const lcpRisk: Risk = htmlSizeBytes > 300_000 || blockingScriptCount >= 3 ? 'high' : htmlSizeBytes > 100_000 || blockingScriptCount >= 1 ? 'medium' : 'low';
  const clsRisk: Risk = missingDimensionsCount >= 5 ? 'high' : missingDimensionsCount >= 1 ? 'medium' : 'low';
  const inpRisk: Risk = blockingScriptCount >= 3 || inlineScriptBytes > 50_000 ? 'high' : blockingScriptCount >= 1 || inlineScriptBytes > 10_000 ? 'medium' : 'low';

  return {
    key: 'performance-estimate',
    category: 'performance',
    version: '1.0.0',
    contributingSignalKeys: ['html-size', 'dom-size', 'script-payload', 'style-payload', 'image-accessibility'],
    value: {
      estimatedPerformanceScore,
      coreWebVitalsEstimate: {
        lcp: { risk: lcpRisk, basis: 'estimated' },
        cls: { risk: clsRisk, basis: 'estimated' },
        inp: { risk: inpRisk, basis: 'estimated' },
      },
    },
  };
};
