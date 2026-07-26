import type { Finding, OptimizationItem } from '@ai-visibility/contracts';
import { resolveOptimizationRule } from '../optimization-knowledge-base/optimization-knowledge-base';
import type { OptimizationRuleVersion } from '../optimization-knowledge-base/optimization-rule';
import {
  computePriority,
  countBlockedItems,
  deriveConfidence,
  deriveDependencyWeight,
  deriveEstimatedEffort,
} from './optimization-prioritization';

export interface OptimizationPlanContext {
  projectId: string;
  auditId: string;
}

function buildOptimizationItem(
  context: OptimizationPlanContext,
  finding: Finding,
  rule: OptimizationRuleVersion,
  allSourceEngines: ReadonlyArray<string>,
): OptimizationItem {
  const supportingFindingIds = [finding.id];
  const estimatedEffort = deriveEstimatedEffort(supportingFindingIds.length);
  const confidence = deriveConfidence();
  const dependencyWeight = deriveDependencyWeight(countBlockedItems(finding.sourceEngine, allSourceEngines));

  return {
    title: `Resolve ${finding.sourceEngine} execution issue`,
    description: rule.resolutionStrategy,
    rationale: rule.businessRationale,
    expectedImpact: rule.expectedImpact,
    estimatedEffort,
    priority: computePriority(rule.expectedImpact, estimatedEffort, confidence, dependencyWeight),
    status: 'open',
    supportingFindingIds,
    projectId: context.projectId,
    auditId: context.auditId,
    optimizationRuleId: rule.ruleId,
    optimizationRuleVersion: rule.version,
  };
}

export function generateOptimizationPlan(
  context: OptimizationPlanContext,
  findings: ReadonlyArray<Finding>,
): OptimizationItem[] {
  const actionableFindings = findings.filter((finding) => finding.severity !== 'none');

  const seenRuleIds = new Set<string>();
  const resolvedFindings: Array<{ finding: Finding; rule: OptimizationRuleVersion }> = [];
  for (const finding of actionableFindings) {
    if (seenRuleIds.has(finding.ruleId)) {
      continue;
    }
    seenRuleIds.add(finding.ruleId);

    const rule = resolveOptimizationRule(finding.ruleId);
    if (!rule) {
      continue;
    }
    resolvedFindings.push({ finding, rule });
  }

  const allSourceEngines = resolvedFindings.map(({ finding }) => finding.sourceEngine);

  return resolvedFindings.map(({ finding, rule }) =>
    buildOptimizationItem(context, finding, rule, allSourceEngines),
  );
}
