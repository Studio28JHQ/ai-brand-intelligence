import type {
  AiVisibilityAssessment,
  Finding,
  KnowledgeGraphResult,
  OptimizationItem,
  PatternReference,
} from '@ai-visibility/contracts';
import { resolveOptimizationRule } from '../optimization-knowledge-base/optimization-knowledge-base';
import type { OptimizationRuleVersion } from '../optimization-knowledge-base/optimization-rule';
import { buildReasoningModel } from '../reasoning/build-reasoning-model';
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
  cycleId: string;
}

function buildOptimizationItem(
  context: OptimizationPlanContext,
  finding: Finding,
  rule: OptimizationRuleVersion,
  allSourceEngines: ReadonlyArray<string>,
  assessment: AiVisibilityAssessment,
  knowledgeGraph: KnowledgeGraphResult,
  patternsByRuleId: ReadonlyMap<string, PatternReference>,
): OptimizationItem {
  const supportingFindingIds = [finding.id];
  const estimatedEffort = deriveEstimatedEffort(supportingFindingIds.length);
  const confidence = deriveConfidence();
  const dependencyWeight = deriveDependencyWeight(countBlockedItems(finding.sourceEngine, allSourceEngines));

  return {
    title: rule.title,
    description: rule.resolutionStrategy,
    rationale: rule.businessRationale,
    expectedImpact: rule.expectedImpact,
    estimatedEffort,
    priority: computePriority(rule.expectedImpact, estimatedEffort, confidence, dependencyWeight),
    status: 'open',
    supportingFindingIds,
    projectId: context.projectId,
    auditId: context.auditId,
    cycleId: context.cycleId,
    optimizationRuleId: rule.ruleId,
    optimizationRuleVersion: rule.version,
    reasoning: buildReasoningModel({
      finding,
      rule,
      confidence,
      dependencyWeight,
      assessment,
      knowledgeGraph,
      patternReference: patternsByRuleId.get(rule.ruleId) ?? null,
    }),
  };
}

const NO_PATTERNS: ReadonlyMap<string, PatternReference> = new Map();

export function generateOptimizationPlan(
  context: OptimizationPlanContext,
  findings: ReadonlyArray<Finding>,
  assessment: AiVisibilityAssessment,
  knowledgeGraph: KnowledgeGraphResult,
  patternsByRuleId: ReadonlyMap<string, PatternReference> = NO_PATTERNS,
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
    buildOptimizationItem(context, finding, rule, allSourceEngines, assessment, knowledgeGraph, patternsByRuleId),
  );
}
