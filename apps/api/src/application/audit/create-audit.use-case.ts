import { Inject, Injectable } from '@nestjs/common';
import type {
  AiVisibilityResult,
  AnalysisResult,
  EngineResult,
  EntityResult,
  KnowledgeGraphResult,
  WorkflowResult,
} from '@ai-visibility/contracts';
import { AuditUrl } from '../../domain/audit/audit-url.vo';
import { AUDIT_REPOSITORY, AuditRepository } from '../../domain/audit/audit.repository';
import { AuditSnapshot } from '../../domain/audit/audit-snapshot';
import { ExecuteAuditUseCase } from './execute-audit.use-case';

@Injectable()
export class CreateAuditUseCase {
  constructor(
    @Inject(AUDIT_REPOSITORY) private readonly auditRepository: AuditRepository,
    private readonly executeAuditUseCase: ExecuteAuditUseCase,
  ) {}

  async execute(rawUrl: string): Promise<AuditSnapshot> {
    const url = AuditUrl.create(rawUrl);
    const audit = await this.auditRepository.create(url.value);

    await this.auditRepository.markRunning(audit.id, new Date());

    let engineResults: WorkflowResult;
    try {
      engineResults = await this.executeAuditUseCase.execute(audit.id, url.value);
    } catch (error) {
      await this.auditRepository.markFailed(audit.id, new Date());
      throw error;
    }

    const completedAudit = await this.auditRepository.markCompleted(audit.id, new Date());

    const analysis = engineResults.analysis as EngineResult<AnalysisResult>;
    const entity = engineResults.entity as EngineResult<EntityResult>;
    const knowledgeGraph = engineResults.knowledgeGraph as EngineResult<KnowledgeGraphResult>;
    const aiVisibility = engineResults.aiVisibility as EngineResult<AiVisibilityResult>;

    return AuditSnapshot.create({
      audit: completedAudit,
      engineResults,
      findings: analysis.output!.findings,
      entities: entity.output!.entities,
      knowledgeGraph: knowledgeGraph.output!,
      aiVisibility: aiVisibility.output!.assessment,
    });
  }
}
