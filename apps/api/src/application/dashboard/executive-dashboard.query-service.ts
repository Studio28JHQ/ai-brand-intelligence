import { Inject, Injectable } from '@nestjs/common';
import type { ExecutiveDashboard, RecommendationPriority } from '@ai-visibility/contracts';
import { generateRecommendations } from '../../presentation/audit/recommendation.service';
import { PROJECT_REPOSITORY, ProjectRepository } from '../../domain/project/project.repository';
import { ProjectNotFoundError } from '../../domain/project/project.errors';
import { CLIENT_REPOSITORY, ClientRepository } from '../../domain/client/client.repository';
import { ClientNotFoundError } from '../../domain/client/client.errors';
import { AUDIT_REPOSITORY, AuditRepository } from '../../domain/audit/audit.repository';
import { Audit } from '../../domain/audit/audit.entity';
import { FindingReadRepository } from '../../infrastructure/comparison/finding-read.repository';
import { AiVisibilityReadRepository } from '../../infrastructure/comparison/ai-visibility-read.repository';
import { BaselineHistoryReadRepository } from '../../infrastructure/project/baseline-history-read.repository';
import { computeScoreTrend } from './dashboard-visibility-trend';
import { buildPriorityActions } from './dashboard-priority-action';

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

function derivePriority(assessmentStatus: 'ready' | 'needs-improvement' | 'not-ready'): RecommendationPriority {
  if (assessmentStatus === 'not-ready') {
    return 'high';
  }
  if (assessmentStatus === 'needs-improvement') {
    return 'medium';
  }
  return 'low';
}

@Injectable()
export class ExecutiveDashboardQueryService {
  constructor(
    @Inject(PROJECT_REPOSITORY) private readonly projectRepository: ProjectRepository,
    @Inject(CLIENT_REPOSITORY) private readonly clientRepository: ClientRepository,
    @Inject(AUDIT_REPOSITORY) private readonly auditRepository: AuditRepository,
    private readonly findingReadRepository: FindingReadRepository,
    private readonly aiVisibilityReadRepository: AiVisibilityReadRepository,
    private readonly baselineHistoryReadRepository: BaselineHistoryReadRepository,
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

    const [findings, currentAssessment, baselineAssessment, lastBaselineChange] = await Promise.all([
      latestCompleted ? this.findingReadRepository.findByAuditId(latestCompleted.id) : Promise.resolve([]),
      latestCompleted ? this.aiVisibilityReadRepository.findByAuditId(latestCompleted.id) : Promise.resolve(null),
      project.baselineAuditId
        ? this.aiVisibilityReadRepository.findByAuditId(project.baselineAuditId)
        : Promise.resolve(null),
      this.baselineHistoryReadRepository.findLatestByProjectId(projectId),
    ]);

    const currentScore = currentAssessment?.status ?? null;
    const baselineScore = baselineAssessment?.status ?? null;
    const actionableFindings = findings.filter((finding) => finding.severity !== 'none');
    const isCritical = currentAssessment ? derivePriority(currentAssessment.status) === 'high' : false;
    const criticalFindings = isCritical ? actionableFindings.length : 0;
    const opportunities = actionableFindings.length - criticalFindings;

    const recommendations = currentAssessment ? generateRecommendations(findings, currentAssessment) : [];

    return {
      project: {
        projectId: project.id,
        projectName: project.name,
        clientId: client.id,
        clientName: client.name,
        primaryDomain: client.primaryDomain,
        canonicalWebsite: project.canonicalWebsite,
        baselineAuditId: project.baselineAuditId,
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
      priorityActions: buildPriorityActions(recommendations),
      recentActivity: {
        latestCompletedAuditId: latestCompleted?.id ?? null,
        latestCompletedAuditDate: latestCompleted?.completedAt ? latestCompleted.completedAt.toISOString() : null,
        lastBaselineChangeAuditId: lastBaselineChange?.auditId ?? null,
        lastBaselineChangeAt: lastBaselineChange?.setAt ? lastBaselineChange.setAt.toISOString() : null,
        lastExecutionStatus: lastExecution?.status ?? null,
        lastExecutionAt: lastExecution?.createdAt ? lastExecution.createdAt.toISOString() : null,
      },
    };
  }
}
