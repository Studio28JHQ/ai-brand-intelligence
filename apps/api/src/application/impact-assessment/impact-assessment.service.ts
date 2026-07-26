import { Inject, Injectable } from '@nestjs/common';
import type { CoverageLevel, ImpactAssessment, ImpactSummaryEntry } from '@ai-visibility/contracts';
import { CAMPAIGN_REPOSITORY, CampaignRepository } from '../../domain/campaign/campaign.repository';
import { CampaignNotFoundError } from '../../domain/campaign/campaign.errors';
import {
  OPTIMIZATION_ACTION_REPOSITORY,
  OptimizationActionRepository,
} from '../../domain/campaign/optimization-action.repository';
import { PROJECT_REPOSITORY, ProjectRepository } from '../../domain/project/project.repository';
import { ProjectNotFoundError } from '../../domain/project/project.errors';
import { AUDIT_REPOSITORY, AuditRepository } from '../../domain/audit/audit.repository';
import { Audit } from '../../domain/audit/audit.entity';
import {
  NoVerificationAuditError,
  ProjectBaselineNotSetError,
  VerificationAuditMismatchError,
} from '../../domain/impact-assessment/impact-assessment.errors';
import { AuditComparisonService } from '../comparison/audit-comparison.service';
import { computeScoreTrend } from '../dashboard/dashboard-visibility-trend';

const COVERAGE_RANK: Record<CoverageLevel, number> = { none: 0, partial: 1, covered: 2 };

function latestCompletedAudit(audits: Audit[]): Audit | null {
  return audits.reduce<Audit | null>((latest, audit) => {
    if (!audit.completedAt) {
      return latest;
    }
    if (!latest || audit.completedAt.getTime() > (latest.completedAt as Date).getTime()) {
      return audit;
    }
    return latest;
  }, null);
}

function extractRuleId(supportingFindingId: string, auditId: string): string {
  return supportingFindingId.startsWith(`${auditId}:`) ? supportingFindingId.slice(auditId.length + 1) : supportingFindingId;
}

@Injectable()
export class ImpactAssessmentService {
  constructor(
    @Inject(CAMPAIGN_REPOSITORY) private readonly campaignRepository: CampaignRepository,
    @Inject(PROJECT_REPOSITORY) private readonly projectRepository: ProjectRepository,
    @Inject(AUDIT_REPOSITORY) private readonly auditRepository: AuditRepository,
    @Inject(OPTIMIZATION_ACTION_REPOSITORY) private readonly optimizationActionRepository: OptimizationActionRepository,
    private readonly auditComparisonService: AuditComparisonService,
  ) {}

  async assess(campaignId: string, verificationAuditId?: string): Promise<ImpactAssessment> {
    const campaign = await this.campaignRepository.findById(campaignId);
    if (!campaign) {
      throw new CampaignNotFoundError(campaignId);
    }

    const project = await this.projectRepository.findById(campaign.projectId);
    if (!project) {
      throw new ProjectNotFoundError(campaign.projectId);
    }
    if (!project.baselineAuditId) {
      throw new ProjectBaselineNotSetError(project.id);
    }

    const verificationAudit = await this.resolveVerificationAudit(project.id, verificationAuditId);

    const comparison = await this.auditComparisonService.compare(project.baselineAuditId, verificationAudit.id);
    const actions = await this.optimizationActionRepository.findByCampaignId(campaignId);

    const resolvedRuleIds = new Set(comparison.findings.resolvedFindings.map((entry) => entry.ruleId));
    const verifiedActionCount = actions.filter((action) =>
      action.supportingFindingIds.some((findingId) => resolvedRuleIds.has(extractRuleId(findingId, action.auditId))),
    ).length;

    const trend = computeScoreTrend(comparison.aiVisibility.targetStatus, comparison.aiVisibility.baselineStatus);
    const baselineCoverageRank = COVERAGE_RANK[comparison.aiVisibility.baselineEntityCoverage];
    const verificationCoverageRank = COVERAGE_RANK[comparison.aiVisibility.targetEntityCoverage];

    const improvements: ImpactSummaryEntry[] = [];
    const regressions: ImpactSummaryEntry[] = [];

    for (const entry of comparison.findings.resolvedFindings) {
      improvements.push({
        category: 'findings',
        description: `Resolved '${entry.ruleId}' (${entry.category}) issue from the ${entry.sourceEngine} engine.`,
      });
    }
    for (const entry of comparison.findings.newFindings) {
      regressions.push({
        category: 'findings',
        description: `New '${entry.ruleId}' (${entry.category}) issue introduced by the ${entry.sourceEngine} engine.`,
      });
    }

    if (comparison.aiVisibility.statusChanged) {
      const description = `AI Visibility status changed from '${comparison.aiVisibility.baselineStatus}' to '${comparison.aiVisibility.targetStatus}'.`;
      (trend === 'improved' ? improvements : regressions).push({ category: 'ai-visibility', description });
    }

    if (verificationCoverageRank !== baselineCoverageRank) {
      const description = `Entity coverage changed from '${comparison.aiVisibility.baselineEntityCoverage}' to '${comparison.aiVisibility.targetEntityCoverage}'.`;
      (verificationCoverageRank > baselineCoverageRank ? improvements : regressions).push({
        category: 'entity-coverage',
        description,
      });
    }

    if (verifiedActionCount > 0) {
      improvements.push({
        category: 'campaign-actions',
        description: `${verifiedActionCount} of ${actions.length} campaign actions confirmed resolved by this audit.`,
      });
    }

    return {
      campaignId: campaign.id,
      projectId: project.id,
      cycleId: campaign.cycleId,
      baselineAuditId: project.baselineAuditId,
      verificationAuditId: verificationAudit.id,
      verificationDate: (verificationAudit.completedAt as Date).toISOString(),
      aiVisibilityChange: {
        baselineStatus: comparison.aiVisibility.baselineStatus,
        verificationStatus: comparison.aiVisibility.targetStatus,
        trend,
      },
      entityCoverageChange: {
        baseline: comparison.aiVisibility.baselineEntityCoverage,
        verification: comparison.aiVisibility.targetEntityCoverage,
      },
      findingsResolvedCount: comparison.findings.resolvedFindings.length,
      findingsIntroducedCount: comparison.findings.newFindings.length,
      campaignActionsVerified: { total: actions.length, verified: verifiedActionCount },
      improvements,
      regressions,
      remainingOpportunities: comparison.findings.unchangedFindings.filter((entry) => entry.outcome === 'fail'),
    };
  }

  private async resolveVerificationAudit(projectId: string, verificationAuditId?: string): Promise<Audit> {
    if (verificationAuditId) {
      const audit = await this.auditRepository.findById(verificationAuditId);
      if (!audit || audit.projectId !== projectId) {
        throw new VerificationAuditMismatchError(verificationAuditId, projectId);
      }
      return audit;
    }

    const allAudits = await this.auditRepository.findAll();
    const projectAudits = allAudits.filter((audit) => audit.projectId === projectId && audit.status === 'completed');
    const latest = latestCompletedAudit(projectAudits);
    if (!latest) {
      throw new NoVerificationAuditError(projectId);
    }
    return latest;
  }
}
