import { Inject, Injectable } from '@nestjs/common';
import type {
  AiVisibilityResult,
  AnalysisResult,
  EngineResult,
  EntityResult,
  KnowledgeGraphResult,
  WorkflowExecutionRecord,
  WorkflowProgress,
  WorkflowResult,
} from '@ai-visibility/contracts';
import { AuditUrl } from '../../domain/audit/audit-url.vo';
import { AUDIT_REPOSITORY, AuditRepository } from '../../domain/audit/audit.repository';
import { AuditSnapshot } from '../../domain/audit/audit-snapshot';
import { WorkflowExecutionHistoryRepository } from '../../infrastructure/audit/workflow-execution-history.repository';
import { ExecuteAuditUseCase } from './execute-audit.use-case';

@Injectable()
export class CreateAuditUseCase {
  constructor(
    @Inject(AUDIT_REPOSITORY) private readonly auditRepository: AuditRepository,
    private readonly executeAuditUseCase: ExecuteAuditUseCase,
    private readonly workflowExecutionHistoryRepository: WorkflowExecutionHistoryRepository,
  ) {}

  async execute(rawUrl: string): Promise<AuditSnapshot> {
    const url = AuditUrl.create(rawUrl);
    const audit = await this.auditRepository.create(url.value);

    await this.auditRepository.markRunning(audit.id, new Date());

    const history: WorkflowExecutionRecord[] = [];
    let engineResults: WorkflowResult;
    let progress: WorkflowProgress[];
    try {
      const outcome = await this.executeAuditUseCase.execute(audit.id, url.value, (record) => history.push(record));
      engineResults = outcome.results;
      progress = outcome.progress;
    } catch (error) {
      await this.workflowExecutionHistoryRepository.saveAll(audit.id, history);
      await this.auditRepository.markFailed(audit.id, new Date());
      throw error;
    }

    await this.workflowExecutionHistoryRepository.saveAll(audit.id, history);

    const completedAudit = await this.auditRepository.markCompleted(audit.id, new Date());

    const analysis = engineResults.analysis as EngineResult<AnalysisResult>;
    const entity = engineResults.entity as EngineResult<EntityResult>;
    const knowledgeGraph = engineResults.knowledgeGraph as EngineResult<KnowledgeGraphResult>;
    const aiVisibility = engineResults.aiVisibility as EngineResult<AiVisibilityResult>;

    return AuditSnapshot.create({
      audit: completedAudit,
      engineResults,
      progress,
      history,
      findings: analysis.output!.findings,
      ruleSetVersion: analysis.output!.ruleSetVersion,
      entities: entity.output!.entities,
      knowledgeGraph: knowledgeGraph.output!,
      aiVisibility: aiVisibility.output!.assessment,
    });
  }
}
