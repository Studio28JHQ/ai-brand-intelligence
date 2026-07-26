import { Inject, Injectable } from '@nestjs/common';
import { Campaign } from '../../domain/campaign/campaign.entity';
import { CAMPAIGN_REPOSITORY, CampaignRepository } from '../../domain/campaign/campaign.repository';
import { PROJECT_REPOSITORY, ProjectRepository } from '../../domain/project/project.repository';
import { ProjectNotFoundError } from '../../domain/project/project.errors';
import { NoCompletedAuditError } from '../../domain/campaign/campaign.errors';
import { AUDIT_REPOSITORY, AuditRepository } from '../../domain/audit/audit.repository';
import { Audit } from '../../domain/audit/audit.entity';
import { FindingReadRepository } from '../../infrastructure/comparison/finding-read.repository';
import { AiVisibilityReadRepository } from '../../infrastructure/comparison/ai-visibility-read.repository';
import { KnowledgeGraphReadRepository } from '../../infrastructure/comparison/knowledge-graph-read.repository';
import { generateOptimizationPlan } from '../optimization/generate-optimization-plan';

function latestByCreatedAt(audits: Audit[]): Audit | null {
  return audits.reduce<Audit | null>((latest, audit) => {
    if (!latest || audit.createdAt.getTime() > latest.createdAt.getTime()) {
      return audit;
    }
    return latest;
  }, null);
}

@Injectable()
export class CreateCampaignUseCase {
  constructor(
    @Inject(CAMPAIGN_REPOSITORY) private readonly campaignRepository: CampaignRepository,
    @Inject(PROJECT_REPOSITORY) private readonly projectRepository: ProjectRepository,
    @Inject(AUDIT_REPOSITORY) private readonly auditRepository: AuditRepository,
    private readonly findingReadRepository: FindingReadRepository,
    private readonly aiVisibilityReadRepository: AiVisibilityReadRepository,
    private readonly knowledgeGraphReadRepository: KnowledgeGraphReadRepository,
  ) {}

  async execute(projectId: string): Promise<Campaign> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundError(projectId);
    }

    const allAudits = await this.auditRepository.findAll();
    const completedAudits = allAudits.filter((audit) => audit.projectId === projectId && audit.status === 'completed');
    const latestCompleted = latestByCreatedAt(completedAudits);
    if (!latestCompleted) {
      throw new NoCompletedAuditError(projectId);
    }

    const [findings, assessment, knowledgeGraph] = await Promise.all([
      this.findingReadRepository.findByAuditId(latestCompleted.id),
      this.aiVisibilityReadRepository.findByAuditId(latestCompleted.id),
      this.knowledgeGraphReadRepository.findByAuditId(latestCompleted.id),
    ]);

    const items = assessment
      ? generateOptimizationPlan({ projectId, auditId: latestCompleted.id }, findings, assessment, knowledgeGraph)
      : [];

    return this.campaignRepository.create(
      projectId,
      latestCompleted.id,
      items.map((item) => ({ title: item.title, supportingFindingIds: item.supportingFindingIds })),
    );
  }
}
