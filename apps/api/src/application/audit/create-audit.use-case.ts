import { Inject, Injectable } from '@nestjs/common';
import { emitTelemetryEvent } from '@ai-visibility/shared';
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
import { PROJECT_REPOSITORY, ProjectRepository } from '../../domain/project/project.repository';
import { deriveCanonicalWebsite, deriveProjectName } from '../../domain/project/canonical-website';
import { WorkflowExecutionHistoryRepository } from '../../infrastructure/audit/workflow-execution-history.repository';
import { ExecuteAuditUseCase } from './execute-audit.use-case';

@Injectable()
export class CreateAuditUseCase {
  constructor(
    @Inject(AUDIT_REPOSITORY) private readonly auditRepository: AuditRepository,
    @Inject(PROJECT_REPOSITORY) private readonly projectRepository: ProjectRepository,
    private readonly executeAuditUseCase: ExecuteAuditUseCase,
    private readonly workflowExecutionHistoryRepository: WorkflowExecutionHistoryRepository,
  ) {}

  async execute(rawUrl: string, correlationId: string): Promise<AuditSnapshot> {
    const url = AuditUrl.create(rawUrl);
    const canonicalWebsite = deriveCanonicalWebsite(url.value);

    const project =
      (await this.projectRepository.findByCanonicalWebsite(canonicalWebsite)) ??
      (await this.projectRepository.create(deriveProjectName(canonicalWebsite), canonicalWebsite));

    const audit = await this.auditRepository.create(project.id, url.value);
    await this.projectRepository.updateLastAudit(project.id, audit.id);

    emitTelemetryEvent({
      name: 'audit.created',
      category: 'audit',
      severity: 'info',
      correlationId,
      source: 'audit-lifecycle',
      data: { auditId: audit.id, projectId: project.id },
    });

    await this.auditRepository.markRunning(audit.id, new Date());

    emitTelemetryEvent({
      name: 'audit.started',
      category: 'audit',
      severity: 'info',
      correlationId,
      source: 'audit-lifecycle',
      data: { auditId: audit.id },
    });

    const history: WorkflowExecutionRecord[] = [];
    let engineResults: WorkflowResult;
    let progress: WorkflowProgress[];
    try {
      const outcome = await this.executeAuditUseCase.execute(audit.id, url.value, correlationId, (record) =>
        history.push(record),
      );
      engineResults = outcome.results;
      progress = outcome.progress;
    } catch (error) {
      await this.workflowExecutionHistoryRepository.saveAll(audit.id, history);
      await this.auditRepository.markFailed(audit.id, new Date());

      emitTelemetryEvent({
        name: 'audit.failed',
        category: 'audit',
        severity: 'error',
        correlationId,
        source: 'audit-lifecycle',
        data: { auditId: audit.id, errorMessage: error instanceof Error ? error.message : String(error) },
      });

      throw error;
    }

    await this.workflowExecutionHistoryRepository.saveAll(audit.id, history);

    const completedAudit = await this.auditRepository.markCompleted(audit.id, new Date());

    emitTelemetryEvent({
      name: 'audit.completed',
      category: 'audit',
      severity: 'info',
      correlationId,
      source: 'audit-lifecycle',
      data: { auditId: audit.id },
    });

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
