import { Inject, Injectable } from '@nestjs/common';
import type { CampaignMetadata, ClientMetadata, ProjectMetadata } from '@ai-visibility/contracts';
import { PROJECT_REPOSITORY, ProjectRepository } from '../../domain/project/project.repository';
import { ProjectNotFoundError } from '../../domain/project/project.errors';
import { Project } from '../../domain/project/project.entity';
import { CLIENT_REPOSITORY, ClientRepository } from '../../domain/client/client.repository';
import { ClientNotFoundError } from '../../domain/client/client.errors';
import { Client } from '../../domain/client/client.entity';
import { AUDIT_REPOSITORY, AuditRepository } from '../../domain/audit/audit.repository';
import { Audit } from '../../domain/audit/audit.entity';
import { OptimizationAction } from '../../domain/campaign/optimization-action.entity';
import { Campaign } from '../../domain/campaign/campaign.entity';
import { FindingReadRepository } from '../../infrastructure/comparison/finding-read.repository';
import { AiVisibilityReadRepository } from '../../infrastructure/comparison/ai-visibility-read.repository';
import { KnowledgeGraphReadRepository } from '../../infrastructure/comparison/knowledge-graph-read.repository';
import { CampaignQueryService, CampaignQueryResult } from '../campaign/campaign-query.service';
import { ImpactAssessmentService } from '../impact-assessment/impact-assessment.service';
import { generateOptimizationPlan } from '../optimization/generate-optimization-plan';
import { currentVersion, listOptimizationRules } from '../optimization-knowledge-base/optimization-knowledge-base';
import { AI_CONTEXT_VERSION, AiContext } from './ai-context';

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

function toProjectFact(project: Project): ProjectMetadata {
  return {
    id: project.id,
    clientId: project.clientId,
    name: project.name,
    canonicalWebsite: project.canonicalWebsite,
    createdAt: project.createdAt.toISOString(),
    lastAuditId: project.lastAuditId,
    baselineAuditId: project.baselineAuditId,
    baselineSetAt: project.baselineSetAt ? project.baselineSetAt.toISOString() : null,
  };
}

function toClientFact(client: Client): ClientMetadata {
  return {
    id: client.id,
    name: client.name,
    industry: client.industry,
    primaryDomain: client.primaryDomain,
    status: client.status,
    createdAt: client.createdAt.toISOString(),
  };
}

function toCampaignFact(campaign: Campaign, actions: ReadonlyArray<OptimizationAction>): CampaignMetadata {
  return {
    id: campaign.id,
    projectId: campaign.projectId,
    sourceAuditId: campaign.sourceAuditId,
    status: campaign.status,
    createdAt: campaign.createdAt.toISOString(),
    activatedAt: campaign.activatedAt ? campaign.activatedAt.toISOString() : null,
    completedAt: campaign.completedAt ? campaign.completedAt.toISOString() : null,
    archivedAt: campaign.archivedAt ? campaign.archivedAt.toISOString() : null,
    actions: actions.map((action) => ({
      id: action.id,
      campaignId: action.campaignId,
      projectId: action.projectId,
      auditId: action.auditId,
      title: action.title,
      supportingFindingIds: [...action.supportingFindingIds],
      status: action.status,
      createdAt: action.createdAt.toISOString(),
      startedAt: action.startedAt ? action.startedAt.toISOString() : null,
      completedAt: action.completedAt ? action.completedAt.toISOString() : null,
      verifiedAt: action.verifiedAt ? action.verifiedAt.toISOString() : null,
    })),
  };
}

@Injectable()
export class AiContextBuilderService {
  constructor(
    @Inject(PROJECT_REPOSITORY) private readonly projectRepository: ProjectRepository,
    @Inject(CLIENT_REPOSITORY) private readonly clientRepository: ClientRepository,
    @Inject(AUDIT_REPOSITORY) private readonly auditRepository: AuditRepository,
    private readonly findingReadRepository: FindingReadRepository,
    private readonly aiVisibilityReadRepository: AiVisibilityReadRepository,
    private readonly knowledgeGraphReadRepository: KnowledgeGraphReadRepository,
    private readonly campaignQueryService: CampaignQueryService,
    private readonly impactAssessmentService: ImpactAssessmentService,
  ) {}

  async build(projectId: string): Promise<Readonly<AiContext>> {
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

    const [findings, assessment, knowledgeGraph] = await Promise.all([
      latestCompleted ? this.findingReadRepository.findByAuditId(latestCompleted.id) : Promise.resolve([]),
      latestCompleted ? this.aiVisibilityReadRepository.findByAuditId(latestCompleted.id) : Promise.resolve(null),
      latestCompleted
        ? this.knowledgeGraphReadRepository.findByAuditId(latestCompleted.id)
        : Promise.resolve({ nodes: [], relationships: [] }),
    ]);

    const optimizationPlan =
      assessment && latestCompleted
        ? generateOptimizationPlan({ projectId, auditId: latestCompleted.id }, findings, assessment, knowledgeGraph)
        : [];

    const latestCampaignResult: CampaignQueryResult | null =
      await this.campaignQueryService.getLatestByProjectId(projectId);

    const impactAssessment = latestCampaignResult
      ? await this.impactAssessmentService.assess(latestCampaignResult.campaign.id).catch(() => null)
      : null;

    const optimizationRules = listOptimizationRules()
      .filter((rule) => rule.enabled)
      .map((rule) => currentVersion(rule));

    const context: AiContext = {
      contextVersion: AI_CONTEXT_VERSION,
      generatedAt: new Date().toISOString(),
      project: toProjectFact(project),
      client: toClientFact(client),
      latestAudit: latestCompleted
        ? {
            id: latestCompleted.id,
            url: latestCompleted.url,
            status: latestCompleted.status,
            startedAt: latestCompleted.startedAt ? latestCompleted.startedAt.toISOString() : null,
            completedAt: latestCompleted.completedAt ? latestCompleted.completedAt.toISOString() : null,
            aiVisibilityStatus: assessment?.status ?? null,
          }
        : null,
      baseline: {
        auditId: project.baselineAuditId,
        setAt: project.baselineSetAt ? project.baselineSetAt.toISOString() : null,
      },
      knowledgeGraph,
      findings,
      optimizationPlan,
      optimizationCampaign: latestCampaignResult
        ? toCampaignFact(latestCampaignResult.campaign, latestCampaignResult.actions)
        : null,
      impactAssessment,
      optimizationRules,
    };

    return Object.freeze(context);
  }
}
