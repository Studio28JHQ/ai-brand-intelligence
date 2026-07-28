import type {
  Finding,
  FindingComparisonEntry,
  OptimizationItem,
  ReportConclusion,
  ReportEvidenceFact,
  ReportFindingReference,
  ReportOptimizationRuleReference,
} from '@ai-visibility/contracts';
import { resolveOptimizationRule } from '../optimization-knowledge-base/optimization-knowledge-base';
import type { OptimizationAction } from '../../domain/campaign/optimization-action.entity';
import { sortByPriority } from '../optimization/optimization-prioritization';

const RECOMMENDED_GOALS_LIMIT = 5;

function toFindingReference(finding: Finding): ReportFindingReference {
  return {
    findingId: finding.id,
    ruleId: finding.ruleId,
    category: finding.category,
    sourceEngine: finding.sourceEngine,
    outcome: finding.outcome,
  };
}

function toRuleReference(ruleId: string): ReportOptimizationRuleReference | null {
  const rule = resolveOptimizationRule(ruleId);
  return rule ? { ruleId: rule.ruleId, ruleVersion: rule.version, category: rule.category } : null;
}

function toEvidenceFromRecord(evidence: Record<string, unknown>): ReportEvidenceFact[] {
  return Object.entries(evidence).map(([label, value]) => ({ label, value: String(value) }));
}

function findFindingByRuleId(findings: ReadonlyArray<Finding>, ruleId: string): Finding | undefined {
  return findings.find((finding) => finding.ruleId === ruleId);
}

function matchItemForAction(
  action: OptimizationAction,
  plan: ReadonlyArray<OptimizationItem>,
): OptimizationItem | undefined {
  return plan.find((item) => item.optimizationRuleId === action.optimizationRuleId);
}

export function buildKeyFindings(findings: ReadonlyArray<Finding>): ReportConclusion[] {
  return findings
    .filter((finding) => finding.severity !== 'none')
    .map((finding) => {
      const ruleReference = toRuleReference(finding.ruleId);
      const rule = resolveOptimizationRule(finding.ruleId);
      return {
        messageKey: rule ? `catalog.${finding.ruleId}.rationale` : 'templates.findingRequiresAttention',
        parameters: rule ? {} : ({ ruleId: finding.ruleId } as Record<string, string | number>),
        evidence: toEvidenceFromRecord(finding.evidence),
        relatedFindings: [toFindingReference(finding)],
        relatedOptimizationRules: ruleReference ? [ruleReference] : [],
        reasoning: null,
        confidence: 'high' as const,
      };
    });
}

export function buildActionsCompleted(
  actions: ReadonlyArray<OptimizationAction>,
  sourcePlan: ReadonlyArray<OptimizationItem>,
  sourceFindings: ReadonlyArray<Finding>,
): ReportConclusion[] {
  return actions
    .filter((action) => action.status === 'completed' || action.status === 'verified')
    .map((action) => {
      const item = matchItemForAction(action, sourcePlan);
      const relatedFindings = sourceFindings
        .filter((finding) => action.supportingFindingIds.includes(finding.id))
        .map(toFindingReference);
      const ruleReference = toRuleReference(action.optimizationRuleId);

      return {
        messageKey: `catalog.${action.optimizationRuleId}.title`,
        parameters: {},
        evidence: item ? item.reasoning.evidence.map((entry) => ({ label: entry.field, value: entry.value })) : [],
        relatedFindings,
        relatedOptimizationRules: ruleReference ? [ruleReference] : [],
        reasoning: item ? item.reasoning : null,
        confidence: item ? item.reasoning.confidence : ('medium' as const),
      };
    });
}

export function buildImprovementsAchieved(
  resolvedEntries: ReadonlyArray<FindingComparisonEntry>,
  baselineFindings: ReadonlyArray<Finding>,
): ReportConclusion[] {
  return resolvedEntries.map((entry) => {
    const finding = findFindingByRuleId(baselineFindings, entry.ruleId);
    const ruleReference = toRuleReference(entry.ruleId);

    return {
      messageKey: 'templates.findingResolved',
      parameters: { ruleId: entry.ruleId, category: entry.category, sourceEngine: entry.sourceEngine },
      evidence: [{ label: 'outcome', value: entry.outcome }],
      relatedFindings: finding ? [toFindingReference(finding)] : [],
      relatedOptimizationRules: ruleReference ? [ruleReference] : [],
      reasoning: null,
      confidence: 'high' as const,
    };
  });
}

export function buildRisks(
  remainingEntries: ReadonlyArray<FindingComparisonEntry>,
  latestFindings: ReadonlyArray<Finding>,
  latestPlan: ReadonlyArray<OptimizationItem>,
): ReportConclusion[] {
  return remainingEntries.map((entry) => {
    const finding = findFindingByRuleId(latestFindings, entry.ruleId);
    const item = latestPlan.find((planItem) => planItem.optimizationRuleId === entry.ruleId);
    const ruleReference = toRuleReference(entry.ruleId);

    return {
      messageKey: 'templates.findingUnresolved',
      parameters: { ruleId: entry.ruleId, category: entry.category, sourceEngine: entry.sourceEngine },
      evidence: [{ label: 'outcome', value: entry.outcome }],
      relatedFindings: finding ? [toFindingReference(finding)] : [],
      relatedOptimizationRules: ruleReference ? [ruleReference] : [],
      reasoning: item ? item.reasoning : null,
      confidence: item ? item.reasoning.confidence : ('medium' as const),
    };
  });
}

export function buildRecommendedNextCycleGoals(
  latestPlan: ReadonlyArray<OptimizationItem>,
  latestFindings: ReadonlyArray<Finding>,
): ReportConclusion[] {
  return sortByPriority(latestPlan)
    .slice(0, RECOMMENDED_GOALS_LIMIT)
    .map((item) => {
      const ruleReference = toRuleReference(item.optimizationRuleId);
      const relatedFindings = latestFindings
        .filter((finding) => item.supportingFindingIds.includes(finding.id))
        .map(toFindingReference);

      return {
        messageKey: `catalog.${item.optimizationRuleId}.title`,
        parameters: {},
        evidence: item.reasoning.evidence.map((entry) => ({ label: entry.field, value: entry.value })),
        relatedFindings,
        relatedOptimizationRules: ruleReference ? [ruleReference] : [],
        reasoning: item.reasoning,
        confidence: item.reasoning.confidence,
      };
    });
}
