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
import { CLIENT_REPOSITORY, ClientRepository } from '../../domain/client/client.repository';
import { derivePrimaryDomain, deriveClientName } from '../../domain/client/primary-domain';
import { ClientNotFoundError } from '../../domain/client/client.errors';
import { WorkflowExecutionHistoryRepository } from '../../infrastructure/audit/workflow-execution-history.repository';
import { EnsureActiveCycleUseCase } from '../optimization-cycle/ensure-active-cycle.use-case';
import { ExecuteAuditUseCase } from './execute-audit.use-case';

@Injectable()
export class CreateAuditUseCase {
  constructor(
    @Inject(AUDIT_REPOSITORY) private readonly auditRepository: AuditRepository,
    @Inject(PROJECT_REPOSITORY) private readonly projectRepository: ProjectRepository,
    @Inject(CLIENT_REPOSITORY) private readonly clientRepository: ClientRepository,
    private readonly executeAuditUseCase: ExecuteAuditUseCase,
    private readonly workflowExecutionHistoryRepository: WorkflowExecutionHistoryRepository,
    private readonly ensureActiveCycleUseCase: EnsureActiveCycleUseCase,
  ) {}

  async execute(rawUrl: string, correlationId: string, clientId?: string): Promise<AuditSnapshot> {
    const url = AuditUrl.create(rawUrl);
    const canonicalWebsite = deriveCanonicalWebsite(url.value);

    let project = await this.projectRepository.findByCanonicalWebsite(canonicalWebsite);
    if (!project) {
      const client = clientId
        ? await this.requireClient(clientId)
        : await this.resolveOrCreateDefaultClient(url.value);

      project = await this.projectRepository.create(client.id, deriveProjectName(canonicalWebsite), canonicalWebsite);
    }

    const cycle = await this.ensureActiveCycleUseCase.execute(project.id);
    const audit = await this.auditRepository.create(project.id, url.value, cycle.id);
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

  private async requireClient(clientId: string) {
    const client = await this.clientRepository.findById(clientId);
    if (!client) {
      throw new ClientNotFoundError(clientId);
    }
    return client;
  }

  private async resolveOrCreateDefaultClient(url: string) {
    const primaryDomain = derivePrimaryDomain(url);
    const existing = await this.clientRepository.findByPrimaryDomain(primaryDomain);
    if (existing) {
      return existing;
    }
    return this.clientRepository.create(deriveClientName(primaryDomain), 'unknown', primaryDomain);
  }
}
