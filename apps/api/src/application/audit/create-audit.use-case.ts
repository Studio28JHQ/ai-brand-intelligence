import { Inject, Injectable } from '@nestjs/common';
import { emitTelemetryEvent, logger } from '@ai-visibility/shared';
import type {
  AiVisibilityResult,
  AnalysisResult,
  AuditProgressEvent,
  EngineResult,
  KnowledgeGraphResult,
  WorkflowExecutionRecord,
} from '@ai-visibility/contracts';
import { AuditUrl } from '../../domain/audit/audit-url.vo';
import { AUDIT_REPOSITORY, AuditRepository } from '../../domain/audit/audit.repository';
import { Audit } from '../../domain/audit/audit.entity';
import { PROJECT_REPOSITORY, ProjectRepository } from '../../domain/project/project.repository';
import { deriveCanonicalWebsite, deriveProjectName } from '../../domain/project/canonical-website';
import { CLIENT_REPOSITORY, ClientRepository } from '../../domain/client/client.repository';
import { derivePrimaryDomain, deriveClientName } from '../../domain/client/primary-domain';
import { ClientNotFoundError } from '../../domain/client/client.errors';
import { WorkflowExecutionHistoryRepository } from '../../infrastructure/audit/workflow-execution-history.repository';
import { AuditProgressPublisher } from '../../infrastructure/audit/audit-progress-publisher';
import { EnsureActiveCycleUseCase } from '../optimization-cycle/ensure-active-cycle.use-case';
import { generateOptimizationPlan } from '../optimization/generate-optimization-plan';
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
    private readonly progressPublisher: AuditProgressPublisher,
  ) {}

  // Creates the Audit and returns immediately — the Workflow Runtime itself now runs in the
  // background (F10-S04B, see docs/04_PROJECT/DECISION_LOG.md#cto-104) rather than blocking this
  // call, so a client can navigate to the Audit and observe its real, live progress via
  // `GET /audits/:id/events` instead of only ever seeing an already-finished result.
  async execute(rawUrl: string, correlationId: string, clientId?: string, triggeredBy?: string): Promise<Audit> {
    const url = AuditUrl.create(rawUrl);
    const canonicalWebsite = deriveCanonicalWebsite(url.value);

    let project = await this.projectRepository.findByCanonicalWebsite(canonicalWebsite);
    if (!project) {
      const client = clientId
        ? await this.requireClient(clientId)
        : await this.resolveOrCreateDefaultClient(url.value);

      project = await this.projectRepository.create(client.id, deriveProjectName(canonicalWebsite), canonicalWebsite);
    }

    // One Audit at a time actually executing per Project — but a request arriving while another
    // is already in flight is no longer rejected (F10-S04D, see
    // docs/04_PROJECT/DECISION_LOG.md#cto-106): it's persisted immediately as a real 'queued' Audit
    // and automatically started, FIFO, the moment the in-flight one finishes (see
    // `startNextQueuedAudit`). The database-level backstop (CTO-103's partial unique index, which
    // only guards 'pending'/'running' rows) still exists for the narrow race window where two
    // requests both pass this in-memory check before either has persisted its own row.
    const projectAudits = await this.auditRepository.findAll();
    const inFlightAudit = projectAudits.find(
      (existing) => existing.projectId === project!.id && (existing.status === 'pending' || existing.status === 'running'),
    );
    const initialStatus = inFlightAudit ? 'queued' : 'pending';

    const cycle = await this.ensureActiveCycleUseCase.execute(project.id);
    const audit = await this.auditRepository.create(project.id, url.value, cycle.id, triggeredBy ?? null, initialStatus);
    await this.projectRepository.updateLastAudit(project.id, audit.id);

    emitTelemetryEvent({
      name: initialStatus === 'queued' ? 'audit.queued' : 'audit.created',
      category: 'audit',
      severity: 'info',
      correlationId,
      source: 'audit-lifecycle',
      data: { auditId: audit.id, projectId: project.id },
    });
    this.progressPublisher.publish(audit.id, { type: 'audit', status: audit.status, timestamp: new Date().toISOString() });

    if (initialStatus === 'pending') {
      this.runPipeline(audit.id, project.id, cycle.id, url.value, correlationId).catch((error) => {
        logger.error('Unhandled error in background Audit pipeline', {
          auditId: audit.id,
          error: error instanceof Error ? error.stack : String(error),
        });
      });
    }
    // else: genuinely queued — startNextQueuedAudit picks it up once the in-flight Audit finishes.

    return audit;
  }

  // FIFO: the oldest 'queued' Audit for this Project (if any) is dequeued and started the moment
  // the previously in-flight one reaches a terminal state — called from both the success and
  // failure exit paths of `runPipeline` below.
  private async startNextQueuedAudit(projectId: string, correlationId: string): Promise<void> {
    const audits = await this.auditRepository.findAll();
    const nextQueued = audits
      .filter((candidate) => candidate.projectId === projectId && candidate.status === 'queued')
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0];

    if (!nextQueued) {
      return;
    }

    this.runPipeline(nextQueued.id, projectId, nextQueued.cycleId, nextQueued.url, correlationId).catch((error) => {
      logger.error('Unhandled error in background Audit pipeline', {
        auditId: nextQueued.id,
        error: error instanceof Error ? error.stack : String(error),
      });
    });
  }

  private async runPipeline(
    auditId: string,
    projectId: string,
    cycleId: string,
    url: string,
    correlationId: string,
  ): Promise<void> {
    const runningAudit = await this.auditRepository.markRunning(auditId, new Date());
    this.progressPublisher.publish(auditId, {
      type: 'audit',
      status: runningAudit.status,
      timestamp: new Date().toISOString(),
    });

    emitTelemetryEvent({
      name: 'audit.started',
      category: 'audit',
      severity: 'info',
      correlationId,
      source: 'audit-lifecycle',
      data: { auditId },
    });

    const history: WorkflowExecutionRecord[] = [];
    try {
      const outcome = await this.executeAuditUseCase.execute(
        auditId,
        url,
        correlationId,
        (record) => history.push(record),
        (event: AuditProgressEvent) => this.progressPublisher.publish(auditId, event),
      );

      // Optimization Plan generation is real, deterministic work that genuinely runs after every
      // analysis step has produced its Findings — timed and reported here as its own live stage
      // (matching this sprint's required "Optimization" stage) rather than fabricated. It is not a
      // Workflow Step: threading Project/Cycle ids through WorkflowContext for one post-analysis,
      // no-I/O computation would be disproportionate surgery to the shared execution path (the same
      // reasoning F10-S04A applied to rejecting a real Quick Audit execution plan). The Optimization
      // Plan itself is still computed for real, separately, when a client requests it
      // (GET /audits/:id/analysis) — this call's result is intentionally not persisted or reused.
      const analysis = outcome.results.analysis as EngineResult<AnalysisResult>;
      const aiVisibility = outcome.results.aiVisibility as EngineResult<AiVisibilityResult>;
      const knowledgeGraph = outcome.results.knowledgeGraph as EngineResult<KnowledgeGraphResult>;

      const optimizationStartedAt = new Date();
      this.progressPublisher.publish(auditId, {
        type: 'step',
        stepId: 'optimization',
        status: 'running',
        startedAt: optimizationStartedAt.toISOString(),
      });

      generateOptimizationPlan(
        { projectId, auditId, cycleId },
        analysis.output!.findings,
        aiVisibility.output!.assessment,
        knowledgeGraph.output!,
      );

      const optimizationCompletedAt = new Date();
      this.progressPublisher.publish(auditId, {
        type: 'step',
        stepId: 'optimization',
        status: 'completed',
        startedAt: optimizationStartedAt.toISOString(),
        completedAt: optimizationCompletedAt.toISOString(),
        durationMs: optimizationCompletedAt.getTime() - optimizationStartedAt.getTime(),
      });

      await this.workflowExecutionHistoryRepository.saveAll(auditId, history);
      const completedAudit = await this.auditRepository.markCompleted(auditId, new Date());
      this.progressPublisher.publish(auditId, {
        type: 'audit',
        status: completedAudit.status,
        timestamp: new Date().toISOString(),
      });

      emitTelemetryEvent({
        name: 'audit.completed',
        category: 'audit',
        severity: 'info',
        correlationId,
        source: 'audit-lifecycle',
        data: { auditId },
      });

      await this.startNextQueuedAudit(projectId, correlationId);
    } catch (error) {
      await this.workflowExecutionHistoryRepository.saveAll(auditId, history);
      const failedAudit = await this.auditRepository.markFailed(auditId, new Date());
      this.progressPublisher.publish(auditId, {
        type: 'audit',
        status: failedAudit.status,
        timestamp: new Date().toISOString(),
      });

      emitTelemetryEvent({
        name: 'audit.failed',
        category: 'audit',
        severity: 'error',
        correlationId,
        source: 'audit-lifecycle',
        data: { auditId, errorMessage: error instanceof Error ? error.message : String(error) },
      });

      await this.startNextQueuedAudit(projectId, correlationId);
    }
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
