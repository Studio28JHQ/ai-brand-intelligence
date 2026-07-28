import { Inject, Injectable } from '@nestjs/common';
import type { ExecutiveClientReport, Finding, OptimizationItem } from '@ai-visibility/contracts';
import { OPTIMIZATION_CYCLE_REPOSITORY, OptimizationCycleRepository } from '../../domain/optimization-cycle/optimization-cycle.repository';
import { OptimizationCycleNotFoundError } from '../../domain/optimization-cycle/optimization-cycle.errors';
import { PROJECT_REPOSITORY, ProjectRepository } from '../../domain/project/project.repository';
import { ProjectNotFoundError } from '../../domain/project/project.errors';
import { CLIENT_REPOSITORY, ClientRepository } from '../../domain/client/client.repository';
import { ClientNotFoundError } from '../../domain/client/client.errors';
import { AUDIT_REPOSITORY, AuditRepository } from '../../domain/audit/audit.repository';
import { Audit } from '../../domain/audit/audit.entity';
import { FindingReadRepository } from '../../infrastructure/comparison/finding-read.repository';
import { AiVisibilityReadRepository } from '../../infrastructure/comparison/ai-visibility-read.repository';
import { KnowledgeGraphReadRepository } from '../../infrastructure/comparison/knowledge-graph-read.repository';
import { CampaignQueryService } from '../campaign/campaign-query.service';
import { ImpactAssessmentService } from '../impact-assessment/impact-assessment.service';
import { AuditComparisonService } from '../comparison/audit-comparison.service';
import { generateOptimizationPlan } from '../optimization/generate-optimization-plan';
import {
  buildActionsCompleted,
  buildImprovementsAchieved,
  buildKeyFindings,
  buildRecommendedNextCycleGoals,
  buildRisks,
} from './report-conclusions';

export const EXECUTIVE_CLIENT_REPORT_VERSION = '1.0.0';

function earliestByCreatedAt(audits: ReadonlyArray<Audit>): Audit | null {
  return audits.reduce<Audit | null>((earliest, audit) => {
    if (!earliest || audit.createdAt.getTime() < earliest.createdAt.getTime()) {
      return audit;
    }
    return earliest;
  }, null);
}

function latestByCompletedAt(audits: ReadonlyArray<Audit>): Audit | null {
  return audits.reduce<Audit | null>((latest, audit) => {
    if (!audit.completedAt) {
      return latest;
    }
    if (!latest?.completedAt || audit.completedAt.getTime() > latest.completedAt.getTime()) {
      return audit;
    }
    return latest;
  }, null);
}

@Injectable()
export class ExecutiveClientReportBuilderService {
  constructor(
    @Inject(OPTIMIZATION_CYCLE_REPOSITORY) private readonly optimizationCycleRepository: OptimizationCycleRepository,
    @Inject(PROJECT_REPOSITORY) private readonly projectRepository: ProjectRepository,
    @Inject(CLIENT_REPOSITORY) private readonly clientRepository: ClientRepository,
    @Inject(AUDIT_REPOSITORY) private readonly auditRepository: AuditRepository,
    private readonly findingReadRepository: FindingReadRepository,
    private readonly aiVisibilityReadRepository: AiVisibilityReadRepository,
    private readonly knowledgeGraphReadRepository: KnowledgeGraphReadRepository,
    private readonly campaignQueryService: CampaignQueryService,
    private readonly impactAssessmentService: ImpactAssessmentService,
    private readonly auditComparisonService: AuditComparisonService,
  ) {}

  async build(cycleId: string): Promise<ExecutiveClientReport> {
    const cycle = await this.optimizationCycleRepository.findById(cycleId);
    if (!cycle) {
      throw new OptimizationCycleNotFoundError(cycleId);
    }

    const project = await this.projectRepository.findById(cycle.projectId);
    if (!project) {
      throw new ProjectNotFoundError(cycle.projectId);
    }

    const client = await this.clientRepository.findById(project.clientId);
    if (!client) {
      throw new ClientNotFoundError(project.clientId);
    }

    const allAudits = await this.auditRepository.findAll();
    const cycleAudits = allAudits.filter((audit) => audit.cycleId === cycleId);
    const completedCycleAudits = cycleAudits.filter((audit) => audit.status === 'completed');
    const initialAudit = earliestByCreatedAt(cycleAudits);
    const latestCompleted = latestByCompletedAt(completedCycleAudits);

    const [initialFindings, initialAssessment] = initialAudit
      ? await Promise.all([
          this.findingReadRepository.findByAuditId(initialAudit.id),
          this.aiVisibilityReadRepository.findByAuditId(initialAudit.id),
        ])
      : [[] as Finding[], null];

    const [latestFindings, latestAssessment, latestKnowledgeGraph] = latestCompleted
      ? await Promise.all([
          this.findingReadRepository.findByAuditId(latestCompleted.id),
          this.aiVisibilityReadRepository.findByAuditId(latestCompleted.id),
          this.knowledgeGraphReadRepository.findByAuditId(latestCompleted.id),
        ])
      : [[] as Finding[], null, { nodes: [], relationships: [] }];

    const latestPlan: OptimizationItem[] =
      latestAssessment && latestCompleted
        ? generateOptimizationPlan(
            { projectId: project.id, auditId: latestCompleted.id, cycleId },
            latestFindings,
            latestAssessment,
            latestKnowledgeGraph,
          )
        : [];

    const campaignResult = await this.campaignQueryService.getLatestByProjectId(project.id);
    const cycleCampaign = campaignResult && campaignResult.campaign.cycleId === cycleId ? campaignResult : null;

    const impactAssessment = cycleCampaign
      ? await this.impactAssessmentService.assess(cycleCampaign.campaign.id).catch(() => null)
      : null;

    const comparison =
      project.baselineAuditId && latestCompleted && project.baselineAuditId !== latestCompleted.id
        ? await this.auditComparisonService.compare(project.baselineAuditId, latestCompleted.id).catch(() => null)
        : null;

    const baselineFindings = comparison ? await this.findingReadRepository.findByAuditId(comparison.baselineAuditId) : [];

    let sourcePlan: OptimizationItem[] = [];
    if (cycleCampaign) {
      const [sourceFindings, sourceAssessment, sourceKnowledgeGraph] = await Promise.all([
        this.findingReadRepository.findByAuditId(cycleCampaign.campaign.sourceAuditId),
        this.aiVisibilityReadRepository.findByAuditId(cycleCampaign.campaign.sourceAuditId),
        this.knowledgeGraphReadRepository.findByAuditId(cycleCampaign.campaign.sourceAuditId),
      ]);
      sourcePlan = sourceAssessment
        ? generateOptimizationPlan(
            { projectId: project.id, auditId: cycleCampaign.campaign.sourceAuditId, cycleId },
            sourceFindings,
            sourceAssessment,
            sourceKnowledgeGraph,
          )
        : [];
    }

    const keyFindings = buildKeyFindings(initialFindings);
    const actionsCompleted = cycleCampaign
      ? buildActionsCompleted(cycleCampaign.actions, sourcePlan, initialFindings)
      : [];
    const improvementsAchieved = comparison
      ? buildImprovementsAchieved(comparison.findings.resolvedFindings, baselineFindings)
      : [];
    const risks = impactAssessment
      ? buildRisks(impactAssessment.remainingOpportunities, latestFindings, latestPlan)
      : [];
    const recommendedNextCycleGoals = buildRecommendedNextCycleGoals(latestPlan, latestFindings);

    const evidence = [
      { label: 'cycleGoal', value: cycle.goal },
      { label: 'cycleStatus', value: cycle.status },
      { label: 'auditsInCycle', value: String(cycleAudits.length) },
      { label: 'keyFindings', value: String(keyFindings.length) },
      { label: 'actionsCompleted', value: String(actionsCompleted.length) },
      { label: 'improvementsAchieved', value: String(improvementsAchieved.length) },
      { label: 'risks', value: String(risks.length) },
    ];

    const initialActionableCount = initialFindings.filter((finding) => finding.severity !== 'none').length;

    return {
      reportVersion: EXECUTIVE_CLIENT_REPORT_VERSION,
      generatedAt: new Date().toISOString(),
      cycleId: cycle.id,
      cycleGoal: cycle.goal,
      cycleStatus: cycle.status,
      projectId: project.id,
      projectName: project.name,
      clientId: client.id,
      clientName: client.name,
      initialSituation: initialAudit
        ? {
            auditId: initialAudit.id,
            url: initialAudit.url,
            aiVisibilityStatus: initialAssessment?.status ?? null,
            assessedAt: initialAssessment?.assessedAt ?? null,
            actionableFindingsCount: initialActionableCount,
          }
        : null,
      keyFindings,
      actionsCompleted,
      improvementsAchieved,
      impactAssessmentSummary: impactAssessment,
      aiVisibilityProgress: impactAssessment
        ? {
            baselineStatus: impactAssessment.aiVisibilityChange.baselineStatus,
            verificationStatus: impactAssessment.aiVisibilityChange.verificationStatus,
            trend: impactAssessment.aiVisibilityChange.trend,
            entityCoverageChange: impactAssessment.entityCoverageChange,
          }
        : null,
      evidence,
      risks,
      recommendedNextCycleGoals,
    };
  }
}
