import type { AiVisibilityAssessment, Finding, OptimizationItem, OptimizationLevel } from '@ai-visibility/contracts';
import {
  computePriority,
  countBlockedItems,
  deriveConfidence,
  deriveDependencyWeight,
  deriveEstimatedEffort,
  deriveExpectedImpact,
} from './optimization-prioritization';

export interface OptimizationPlanContext {
  projectId: string;
  auditId: string;
}

function buildOptimizationItem(
  context: OptimizationPlanContext,
  finding: Finding,
  expectedImpact: OptimizationLevel,
  assessmentStatus: AiVisibilityAssessment['status'],
  allSourceEngines: ReadonlyArray<string>,
): OptimizationItem {
  const supportingFindingIds = [finding.id];
  const estimatedEffort = deriveEstimatedEffort(supportingFindingIds.length);
  const confidence = deriveConfidence();
  const dependencyWeight = deriveDependencyWeight(countBlockedItems(finding.sourceEngine, allSourceEngines));

  return {
    title: `Resolve ${finding.sourceEngine} execution issue`,
    description: `Rule '${finding.ruleId}' evaluated to '${finding.outcome}' for the ${finding.sourceEngine} engine (${finding.category}).`,
    rationale: `Addressing this improves AI Visibility signal completeness and moves the assessment away from '${assessmentStatus}'.`,
    expectedImpact,
    estimatedEffort,
    priority: computePriority(expectedImpact, estimatedEffort, confidence, dependencyWeight),
    status: 'open',
    supportingFindingIds,
    projectId: context.projectId,
    auditId: context.auditId,
  };
}

export function generateOptimizationPlan(
  context: OptimizationPlanContext,
  findings: ReadonlyArray<Finding>,
  assessment: AiVisibilityAssessment,
): OptimizationItem[] {
  const expectedImpact = deriveExpectedImpact(assessment.status);
  const actionableFindings = findings.filter((finding) => finding.severity !== 'none');

  const seenRuleIds = new Set<string>();
  const distinctFindings: Finding[] = [];
  for (const finding of actionableFindings) {
    if (seenRuleIds.has(finding.ruleId)) {
      continue;
    }
    seenRuleIds.add(finding.ruleId);
    distinctFindings.push(finding);
  }

  const allSourceEngines = distinctFindings.map((finding) => finding.sourceEngine);

  return distinctFindings.map((finding) =>
    buildOptimizationItem(context, finding, expectedImpact, assessment.status, allSourceEngines),
  );
}
