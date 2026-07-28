import type { Finding, OptimizationItem, OptimizationLevel } from '@ai-visibility/contracts';
import type { AiContext } from '../../ai-context/ai-context';
import { sortByPriority } from '../../optimization/optimization-prioritization';
import { resolveEnglishMessage, resolveRuleText } from '../../optimization-knowledge-base/optimization-rule-text';
import type { ConversationIntentType } from '../conversation-session';
import type {
  AiResponseFact,
  AiResponseFindingReference,
  AiResponseOptimizationItemReference,
} from '../ai-response';

export interface AnswerContent {
  interpretation: string;
  facts: AiResponseFact[];
  suggestedActions: string[];
  confidence: OptimizationLevel;
  relatedFindings: AiResponseFindingReference[];
  relatedOptimizationItems: AiResponseOptimizationItemReference[];
}

function toFindingReference(finding: Finding): AiResponseFindingReference {
  return {
    findingId: finding.id,
    ruleId: finding.ruleId,
    category: finding.category,
    sourceEngine: finding.sourceEngine,
    outcome: finding.outcome,
  };
}

function toOptimizationItemReference(item: OptimizationItem): AiResponseOptimizationItemReference {
  return {
    optimizationRuleId: item.optimizationRuleId,
    optimizationRuleVersion: item.optimizationRuleVersion,
    title: resolveRuleText(item.optimizationRuleId).title,
    priority: item.priority,
  };
}

function findSupportingFindings(item: OptimizationItem, findings: ReadonlyArray<Finding>): Finding[] {
  return findings.filter((finding) => item.supportingFindingIds.includes(finding.id));
}

function buildWhyAnswer(context: AiContext): AnswerContent {
  const [topItem] = sortByPriority(context.optimizationPlan);
  if (!topItem) {
    return {
      interpretation: 'No AI Visibility issues are currently flagged for this Project.',
      facts: [],
      suggestedActions: [],
      confidence: 'high',
      relatedFindings: [],
      relatedOptimizationItems: [],
    };
  }

  const topItemText = resolveRuleText(topItem.optimizationRuleId);
  return {
    interpretation: topItemText.rationale,
    facts: topItem.reasoning.evidence.map((entry) => ({ label: entry.field, value: entry.value })),
    suggestedActions: [topItemText.resolutionStrategy],
    confidence: topItem.reasoning.confidence,
    relatedFindings: findSupportingFindings(topItem, context.findings).map(toFindingReference),
    relatedOptimizationItems: [toOptimizationItemReference(topItem)],
  };
}

function buildWhatShouldIDoFirstAnswer(context: AiContext): AnswerContent {
  const [topItem] = sortByPriority(context.optimizationPlan);
  if (!topItem) {
    return {
      interpretation: 'There is nothing to act on right now — no Optimization Items are open.',
      facts: [],
      suggestedActions: [],
      confidence: 'high',
      relatedFindings: [],
      relatedOptimizationItems: [],
    };
  }

  return {
    interpretation: `Start with: ${resolveRuleText(topItem.optimizationRuleId).title}.`,
    facts: [
      { label: 'Priority', value: topItem.priority },
      { label: 'Expected Impact', value: topItem.expectedImpact },
      { label: 'Estimated Effort', value: topItem.estimatedEffort },
    ],
    suggestedActions: [resolveRuleText(topItem.optimizationRuleId).resolutionStrategy],
    confidence: topItem.reasoning.confidence,
    relatedFindings: findSupportingFindings(topItem, context.findings).map(toFindingReference),
    relatedOptimizationItems: [toOptimizationItemReference(topItem)],
  };
}

function buildWhatChangedAnswer(context: AiContext): AnswerContent {
  const impact = context.impactAssessment;
  if (!impact) {
    return {
      interpretation:
        'No Impact Assessment is available yet — create an Optimization Campaign and run a verification Audit to measure change.',
      facts: [],
      suggestedActions: ['Set a Baseline and create a Campaign to start tracking impact.'],
      confidence: 'low',
      relatedFindings: [],
      relatedOptimizationItems: [],
    };
  }

  const remainingRuleIds = new Set(impact.remainingOpportunities.map((entry) => entry.ruleId));
  const relatedFindings = context.findings
    .filter((finding) => remainingRuleIds.has(finding.ruleId))
    .map(toFindingReference);

  return {
    interpretation: `AI Visibility trend: ${impact.aiVisibilityChange.trend}. ${impact.findingsResolvedCount} finding(s) resolved, ${impact.findingsIntroducedCount} introduced since the Baseline.`,
    facts: [...impact.improvements, ...impact.regressions].map((entry) => ({
      label: entry.category,
      value: resolveEnglishMessage(entry.messageKey, entry.parameters),
    })),
    suggestedActions: impact.remainingOpportunities.map((entry) => `Address remaining issue: ${entry.ruleId}`),
    confidence: 'high',
    relatedFindings,
    relatedOptimizationItems: [],
  };
}

function buildWhatIsBlockingVisibilityAnswer(context: AiContext): AnswerContent {
  const actionableFindings = context.findings.filter((finding) => finding.severity !== 'none');
  if (actionableFindings.length === 0) {
    return {
      interpretation: "Nothing is currently blocking this Project's AI Visibility based on the latest Audit.",
      facts: [{ label: 'AI Visibility Status', value: context.latestAudit?.aiVisibilityStatus ?? 'unknown' }],
      suggestedActions: [],
      confidence: 'high',
      relatedFindings: [],
      relatedOptimizationItems: [],
    };
  }

  return {
    interpretation: `${actionableFindings.length} issue(s) are currently blocking full AI Visibility.`,
    facts: actionableFindings.map((finding) => ({ label: finding.sourceEngine, value: `${finding.ruleId}: ${finding.outcome}` })),
    suggestedActions: context.optimizationPlan.map((item) => resolveRuleText(item.optimizationRuleId).resolutionStrategy),
    confidence: 'high',
    relatedFindings: actionableFindings.map(toFindingReference),
    relatedOptimizationItems: context.optimizationPlan.map(toOptimizationItemReference),
  };
}

function buildGeneralAnswer(context: AiContext): AnswerContent {
  return {
    interpretation: `${context.project.name} is currently '${context.latestAudit?.aiVisibilityStatus ?? 'unassessed'}'.`,
    facts: [
      { label: 'Client', value: context.client.name },
      { label: 'Latest Audit', value: context.latestAudit?.id ?? 'none' },
    ],
    suggestedActions: [],
    confidence: 'medium',
    relatedFindings: [],
    relatedOptimizationItems: [],
  };
}

export function buildAnswer(intentType: ConversationIntentType, context: AiContext): AnswerContent {
  if (intentType === 'why') {
    return buildWhyAnswer(context);
  }
  if (intentType === 'what-should-i-do-first') {
    return buildWhatShouldIDoFirstAnswer(context);
  }
  if (intentType === 'what-changed') {
    return buildWhatChangedAnswer(context);
  }
  if (intentType === 'what-is-blocking-visibility') {
    return buildWhatIsBlockingVisibilityAnswer(context);
  }
  return buildGeneralAnswer(context);
}
