import { Inject, Injectable } from '@nestjs/common';
import type { ExecutiveDashboard } from '@ai-visibility/contracts';
import { generateOptimizationPlan } from '../optimization/generate-optimization-plan';
import { sortByPriority } from '../optimization/optimization-prioritization';
import { PROJECT_REPOSITORY, ProjectRepository } from '../../domain/project/project.repository';
import { ProjectNotFoundError } from '../../domain/project/project.errors';
import { CLIENT_REPOSITORY, ClientRepository } from '../../domain/client/client.repository';
import { ClientNotFoundError } from '../../domain/client/client.errors';
import { AUDIT_REPOSITORY, AuditRepository } from '../../domain/audit/audit.repository';
import { Audit } from '../../domain/audit/audit.entity';
import { FindingReadRepository } from '../../infrastructure/comparison/finding-read.repository';
import { AiVisibilityReadRepository } from '../../infrastructure/comparison/ai-visibility-read.repository';
import { KnowledgeGraphReadRepository } from '../../infrastructure/comparison/knowledge-graph-read.repository';
import { SignalReadRepository } from '../../infrastructure/comparison/signal-read.repository';
import { HeuristicReadRepository } from '../../infrastructure/comparison/heuristic-read.repository';
import { BaselineHistoryReadRepository } from '../../infrastructure/project/baseline-history-read.repository';
import { CampaignQueryService } from '../campaign/campaign-query.service';
import { computeCampaignProgress } from '../campaign/campaign-progress';
import { ImpactAssessmentService } from '../impact-assessment/impact-assessment.service';
import { OptimizationCycleQueryService } from '../optimization-cycle/optimization-cycle-query.service';
import { computeScores } from '../scoring/compute-scores';
import { computeScoreTrend } from './dashboard-visibility-trend';

const TOP_PRIORITY_ACTIONS_LIMIT = 5;

function latestByTimestamp(audits: Audit[], selectTimestamp: (audit: Audit) => Date | null): Audit | null {
  return audits.reduce<Audit | null>((latest, audit) => {
    const timestamp = selectTimestamp(audit);
    if (!timestamp) {
      return latest;
    }
    const latestTimestamp = latest ? selectTimestamp(latest) : null;
    if (!latestTimestamp || timestamp.getTime() > latestTimestamp.getTime()) {
      return audit;
    }
    return latest;
  }, null);
}

@Injectable()
export class ExecutiveDashboardQueryService {
  constructor(
    @Inject(PROJECT_REPOSITORY) private readonly projectRepository: ProjectRepository,
    @Inject(CLIENT_REPOSITORY) private readonly clientRepository: ClientRepository,
    @Inject(AUDIT_REPOSITORY) private readonly auditRepository: AuditRepository,
    private readonly findingReadRepository: FindingReadRepository,
    private readonly aiVisibilityReadRepository: AiVisibilityReadRepository,
    private readonly knowledgeGraphReadRepository: KnowledgeGraphReadRepository,
    private readonly signalReadRepository: SignalReadRepository,
    private readonly heuristicReadRepository: HeuristicReadRepository,
    private readonly baselineHistoryReadRepository: BaselineHistoryReadRepository,
    private readonly campaignQueryService: CampaignQueryService,
    private readonly impactAssessmentService: ImpactAssessmentService,
    private readonly optimizationCycleQueryService: OptimizationCycleQueryService,
  ) {}

  async getDashboard(projectId: string): Promise<ExecutiveDashboard> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundError(projectId);
    }

    const client = await this.clientRepository.findById(project.clientId);
    if (!client) {
      throw new ClientNotFoundError(project.clientId);
    }

    const allAudits = await this.auditRepository.findAll();
    const projectAudits = allAudits.filter((audit) => audit.projectId === projectId);
    const completedAudits = projectAudits.filter((audit) => audit.status === 'completed');

    const latestCompleted = latestByTimestamp(completedAudits, (audit) => audit.completedAt);
    const lastExecution = latestByTimestamp(projectAudits, (audit) => audit.createdAt);
    const baselineAudit = project.baselineAuditId
      ? (allAudits.find((audit) => audit.id === project.baselineAuditId) ?? null)
      : null;

    const [findings, currentAssessment, baselineAssessment, lastBaselineChange, knowledgeGraph, signals, heuristics] =
      await Promise.all([
        latestCompleted ? this.findingReadRepository.findByAuditId(latestCompleted.id) : Promise.resolve([]),
        latestCompleted ? this.aiVisibilityReadRepository.findByAuditId(latestCompleted.id) : Promise.resolve(null),
        project.baselineAuditId
          ? this.aiVisibilityReadRepository.findByAuditId(project.baselineAuditId)
          : Promise.resolve(null),
        this.baselineHistoryReadRepository.findLatestByProjectId(projectId),
        latestCompleted
          ? this.knowledgeGraphReadRepository.findByAuditId(latestCompleted.id)
          : Promise.resolve({ nodes: [], relationships: [] }),
        latestCompleted ? this.signalReadRepository.findByAuditId(latestCompleted.id) : Promise.resolve([]),
        latestCompleted ? this.heuristicReadRepository.findByAuditId(latestCompleted.id) : Promise.resolve([]),
      ]);

    const currentScore = currentAssessment?.status ?? null;
    const baselineScore = baselineAssessment?.status ?? null;
    const actionableFindings = findings.filter((finding) => finding.severity !== 'none');

    const optimizationItems =
      currentAssessment && latestCompleted
        ? generateOptimizationPlan(
            { projectId: project.id, auditId: latestCompleted.id, cycleId: latestCompleted.cycleId },
            findings,
            currentAssessment,
            knowledgeGraph,
          )
        : [];

    const criticalFindings = optimizationItems.filter((item) => item.expectedImpact === 'high').length;
    const opportunities = optimizationItems.length - criticalFindings;

    const latestCampaign = await this.campaignQueryService.getLatestByProjectId(projectId);
    const campaignImpact = latestCampaign
      ? await this.impactAssessmentService
          .assess(latestCampaign.campaign.id)
          .then((assessment) => ({
            campaignId: assessment.campaignId,
            verificationDate: assessment.verificationDate,
            aiVisibilityTrend: assessment.aiVisibilityChange.trend,
            findingsResolvedCount: assessment.findingsResolvedCount,
            findingsIntroducedCount: assessment.findingsIntroducedCount,
            improvements: assessment.improvements,
            remainingOpportunitiesCount: assessment.remainingOpportunities.length,
          }))
          .catch(() => null)
      : null;

    const currentCycle = await this.optimizationCycleQueryService.getCurrentByProjectId(projectId);

    return {
      project: {
        projectId: project.id,
        projectName: project.name,
        clientId: client.id,
        clientName: client.name,
        primaryDomain: client.primaryDomain,
        canonicalWebsite: project.canonicalWebsite,
        baselineAuditId: project.baselineAuditId,
        baselineAuditUrl: baselineAudit?.url ?? null,
        baselineSetAt: project.baselineSetAt ? project.baselineSetAt.toISOString() : null,
        latestAuditId: project.lastAuditId,
      },
      visibility: {
        currentScore,
        baselineScore,
        scoreTrend: computeScoreTrend(currentScore, baselineScore),
        totalFindings: actionableFindings.length,
        criticalFindings,
        opportunities,
      },
      priorityActions: sortByPriority(optimizationItems).slice(0, TOP_PRIORITY_ACTIONS_LIMIT),
      recentActivity: {
        latestCompletedAuditId: latestCompleted?.id ?? null,
        latestCompletedAuditDate: latestCompleted?.completedAt ? latestCompleted.completedAt.toISOString() : null,
        lastBaselineChangeAuditId: lastBaselineChange?.auditId ?? null,
        lastBaselineChangeAt: lastBaselineChange?.setAt ? lastBaselineChange.setAt.toISOString() : null,
        lastExecutionStatus: lastExecution?.status ?? null,
        lastExecutionAt: lastExecution?.createdAt ? lastExecution.createdAt.toISOString() : null,
      },
      campaign: latestCampaign ? computeCampaignProgress(latestCampaign.campaign, latestCampaign.actions) : null,
      campaignImpact,
      currentCycle: currentCycle
        ? {
            id: currentCycle.id,
            goal: currentCycle.goal,
            status: currentCycle.status,
            currentPhase: currentCycle.currentPhase,
            startDate: currentCycle.startDate ? currentCycle.startDate.toISOString() : null,
            endDate: currentCycle.endDate ? currentCycle.endDate.toISOString() : null,
          }
        : null,
      scores: latestCompleted ? computeScores(findings, heuristics, signals) : null,
    };
  }
}
