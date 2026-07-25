import type { Finding, FindingComparison, FindingComparisonEntry } from '@ai-visibility/contracts';

function toEntry(finding: Finding): FindingComparisonEntry {
  return {
    ruleId: finding.ruleId,
    ruleVersion: finding.ruleVersion,
    category: finding.category,
    sourceEngine: finding.sourceEngine,
    outcome: finding.outcome,
  };
}

export function compareFindings(baseline: Finding[], target: Finding[]): FindingComparison {
  const baselineByRule = new Map(baseline.map((finding) => [finding.ruleId, finding]));
  const targetByRule = new Map(target.map((finding) => [finding.ruleId, finding]));

  const newFindings: FindingComparisonEntry[] = [];
  const unchangedFindings: FindingComparisonEntry[] = [];

  for (const [ruleId, targetFinding] of targetByRule) {
    const baselineFinding = baselineByRule.get(ruleId);
    if (targetFinding.outcome === 'fail' && (!baselineFinding || baselineFinding.outcome !== 'fail')) {
      newFindings.push(toEntry(targetFinding));
    } else if (baselineFinding && baselineFinding.outcome === targetFinding.outcome) {
      unchangedFindings.push(toEntry(targetFinding));
    }
  }

  const resolvedFindings: FindingComparisonEntry[] = [];
  for (const [ruleId, baselineFinding] of baselineByRule) {
    const targetFinding = targetByRule.get(ruleId);
    if (baselineFinding.outcome === 'fail' && (!targetFinding || targetFinding.outcome !== 'fail')) {
      resolvedFindings.push(toEntry(baselineFinding));
    }
  }

  return { newFindings, resolvedFindings, unchangedFindings };
}
