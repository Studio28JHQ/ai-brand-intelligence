import type { BriefingItem, BriefingItemCategory } from '@ai-visibility/contracts';
import type { AiContext } from '../ai-context/ai-context';
import { resolveEnglishMessage, resolveRuleText } from '../optimization-knowledge-base/optimization-rule-text';

function makeItem(
  context: AiContext,
  category: BriefingItemCategory,
  idSuffix: string,
  fields: Omit<BriefingItem, 'id' | 'category' | 'projectId' | 'projectName' | 'clientId' | 'clientName'>,
): BriefingItem {
  return {
    id: `${context.project.id}:${category}:${idSuffix}`,
    category,
    projectId: context.project.id,
    projectName: context.project.name,
    clientId: context.client.id,
    clientName: context.client.name,
    ...fields,
  };
}

function buildCriticalFindingItems(context: AiContext): BriefingItem[] {
  return context.findings
    .filter((finding) => finding.severity !== 'none')
    .map((finding) =>
      makeItem(context, 'critical-finding', finding.id, {
        title: `Critical finding: ${finding.ruleId}`,
        reason: `The ${finding.sourceEngine} engine reported a '${finding.severity}' severity outcome for rule '${finding.ruleId}'.`,
        businessImpact: `This unresolved issue in the '${finding.category}' category limits ${context.project.name}'s AI Visibility.`,
        evidence: [
          { label: 'Rule', value: finding.ruleId },
          { label: 'Source Engine', value: finding.sourceEngine },
          { label: 'Outcome', value: finding.outcome },
        ],
        recommendedNextAction: 'Review this finding and address it via the Optimization Plan.',
        confidence: 'high',
      }),
    );
}

function buildCampaignAwaitingVerificationItems(context: AiContext): BriefingItem[] {
  const campaign = context.optimizationCampaign;
  if (!campaign || campaign.status !== 'completed') {
    return [];
  }

  return [
    makeItem(context, 'campaign-awaiting-verification', campaign.id, {
      title: `Campaign awaiting verification: ${campaign.id}`,
      reason: `All actions in Optimization Campaign '${campaign.id}' are complete but the campaign has not yet been archived.`,
      businessImpact: 'Impact of the completed optimization work has not yet been confirmed against a new Audit.',
      evidence: [
        { label: 'Campaign Status', value: campaign.status },
        { label: 'Total Actions', value: String(campaign.actions.length) },
        {
          label: 'Verified Actions',
          value: String(campaign.actions.filter((action) => action.status === 'verified').length),
        },
      ],
      recommendedNextAction: 'Run a verification Audit and archive the Campaign once impact is confirmed.',
      confidence: 'high',
    }),
  ];
}

function buildAiVisibilityRegressionItems(context: AiContext): BriefingItem[] {
  const impact = context.impactAssessment;
  if (!impact || impact.regressions.length === 0) {
    return [];
  }

  return impact.regressions.map((regression, index) =>
    makeItem(context, 'ai-visibility-regression', `${index}`, {
      title: `AI Visibility regression: ${regression.category}`,
      reason: resolveEnglishMessage(regression.messageKey, regression.parameters),
      businessImpact: `${context.project.name}'s AI Visibility has regressed since the Baseline in the '${regression.category}' category.`,
      evidence: [
        { label: 'Trend', value: impact.aiVisibilityChange.trend },
        { label: 'Baseline Status', value: impact.aiVisibilityChange.baselineStatus },
        { label: 'Verification Status', value: impact.aiVisibilityChange.verificationStatus },
      ],
      recommendedNextAction: 'Investigate the regression and add a corrective Optimization Item.',
      confidence: 'high',
    }),
  );
}

function buildHighImpactOpportunityItems(context: AiContext): BriefingItem[] {
  return context.optimizationPlan
    .filter((item) => item.priority === 'high')
    .map((item) => {
      const text = resolveRuleText(item.optimizationRuleId);
      return makeItem(context, 'high-impact-opportunity', item.optimizationRuleId, {
        title: text.title,
        reason: text.rationale,
        businessImpact: `Expected ${item.expectedImpact} impact for ${item.estimatedEffort} estimated effort.`,
        evidence: item.reasoning.evidence.map((entry) => ({ label: entry.field, value: entry.value })),
        recommendedNextAction: text.resolutionStrategy,
        confidence: item.reasoning.confidence,
      });
    });
}

function buildRecentImprovementItems(context: AiContext): BriefingItem[] {
  const impact = context.impactAssessment;
  if (!impact || impact.improvements.length === 0) {
    return [];
  }

  return impact.improvements.map((improvement, index) =>
    makeItem(context, 'recent-improvement', `${index}`, {
      title: `Improvement: ${improvement.category}`,
      reason: resolveEnglishMessage(improvement.messageKey, improvement.parameters),
      businessImpact: `${context.project.name}'s AI Visibility has improved in the '${improvement.category}' category since the Baseline.`,
      evidence: [{ label: 'Verification Date', value: impact.verificationDate }],
      recommendedNextAction: 'No action needed — improvement confirmed.',
      confidence: 'high',
    }),
  );
}

function buildProjectAttentionItem(context: AiContext): BriefingItem[] {
  const criticalFindingCount = context.findings.filter((finding) => finding.severity !== 'none').length;
  const regressionCount = context.impactAssessment?.regressions.length ?? 0;
  const isNotReady = context.latestAudit?.aiVisibilityStatus === 'not-ready';

  if (criticalFindingCount === 0 && regressionCount === 0 && !isNotReady) {
    return [];
  }

  const reasons: string[] = [];
  if (isNotReady) {
    reasons.push("its AI Visibility status is 'not-ready'");
  }
  if (criticalFindingCount > 0) {
    reasons.push(`it has ${criticalFindingCount} unresolved critical finding(s)`);
  }
  if (regressionCount > 0) {
    reasons.push(`it has ${regressionCount} AI Visibility regression(s) since the Baseline`);
  }

  return [
    makeItem(context, 'project-attention', context.latestAudit?.id ?? 'no-audit', {
      title: `${context.project.name} requires immediate attention`,
      reason: `This Project requires attention because ${reasons.join(' and ')}.`,
      businessImpact: 'Unaddressed issues on this Project are actively limiting AI Visibility for this Client.',
      evidence: [
        { label: 'AI Visibility Status', value: context.latestAudit?.aiVisibilityStatus ?? 'unknown' },
        { label: 'Critical Findings', value: String(criticalFindingCount) },
        { label: 'Regressions Since Baseline', value: String(regressionCount) },
      ],
      recommendedNextAction: 'Open the Project Dashboard and review the Optimization Plan.',
      confidence: 'high',
    }),
  ];
}

export function buildBriefingItemsForProject(context: AiContext): BriefingItem[] {
  return [
    ...buildProjectAttentionItem(context),
    ...buildAiVisibilityRegressionItems(context),
    ...buildCriticalFindingItems(context),
    ...buildCampaignAwaitingVerificationItems(context),
    ...buildHighImpactOpportunityItems(context),
    ...buildRecentImprovementItems(context),
  ];
}
