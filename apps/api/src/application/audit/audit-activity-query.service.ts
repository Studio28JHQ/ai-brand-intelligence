import { Inject, Injectable } from '@nestjs/common';
import type { ActiveOperationEntry } from '@ai-visibility/contracts';
import { AUDIT_REPOSITORY, AuditRepository } from '../../domain/audit/audit.repository';
import { Audit } from '../../domain/audit/audit.entity';
import { PROJECT_REPOSITORY, ProjectRepository } from '../../domain/project/project.repository';
import { AuditProgressPublisher, isTerminalAuditStatus } from '../../infrastructure/audit/audit-progress-publisher';
import { computeQueueInfo } from './audit-queue-info';

// How long a finished operation stays visible after completing — long enough to observe a real
// running -> completed transition (the sprint's own "verify real-time updates" criterion), short
// enough that the Activity Center stays focused on what's actually current.
const RECENTLY_FINISHED_WINDOW_MS = 2 * 60 * 1000;

// 11 real Workflow steps + the synthetic 'optimization' stage (F10-S04B) — the denominator for a
// live Progress percentage.
const TRACKABLE_STEP_COUNT = 12;

const STEP_LABELS: Record<string, string> = {
  discovery: 'Discovery',
  crawl: 'Crawling',
  inventory: 'Inventory',
  extraction: 'Extraction',
  heuristics: 'Heuristics',
  analysis: 'Analysis',
  entity: 'Entity Detection',
  knowledgeGraph: 'Knowledge Graph',
  aiVisibility: 'AI Visibility',
  aiVisibilityHeuristics: 'AI Visibility Heuristics',
  aiVisibilityAnalysis: 'AI Visibility Analysis',
  optimization: 'Optimization',
};

// Backs the Activity Center (F10-S04E, see docs/04_PROJECT/DECISION_LOG.md#cto-107). Only 'audit'
// operations are real today — Optimization/Import/Export/AI Analysis are all synchronous
// request/response calls in this codebase with no "in progress" state to honestly report.
@Injectable()
export class AuditActivityQueryService {
  constructor(
    @Inject(AUDIT_REPOSITORY) private readonly auditRepository: AuditRepository,
    @Inject(PROJECT_REPOSITORY) private readonly projectRepository: ProjectRepository,
    private readonly progressPublisher: AuditProgressPublisher,
  ) {}

  async list(): Promise<ActiveOperationEntry[]> {
    const [audits, projects] = await Promise.all([this.auditRepository.findAll(), this.projectRepository.findAll()]);
    const projectById = new Map(projects.map((project) => [project.id, project]));

    const now = Date.now();
    const relevant = audits.filter((audit) => {
      if (!isTerminalAuditStatus(audit.status)) {
        return true;
      }
      const finishedAt = audit.completedAt ?? audit.failedAt ?? audit.cancelledAt;
      return finishedAt !== null && now - finishedAt.getTime() <= RECENTLY_FINISHED_WINDOW_MS;
    });

    return relevant.map((audit) => this.toEntry(audit, audits, projectById.get(audit.projectId)?.name ?? 'Unknown Project'));
  }

  private toEntry(audit: Audit, allAudits: Audit[], projectName: string): ActiveOperationEntry {
    const finishedAt = audit.completedAt ?? audit.failedAt ?? audit.cancelledAt;
    const { currentStepLabel, progressPercent } = this.computeCurrentStepAndProgress(audit);

    return {
      id: audit.id,
      operationType: 'audit',
      projectId: audit.projectId,
      projectName,
      subject: audit.url,
      status: audit.status,
      currentStepLabel,
      progressPercent,
      createdAt: audit.createdAt.toISOString(),
      startedAt: audit.startedAt ? audit.startedAt.toISOString() : null,
      finishedAt: finishedAt ? finishedAt.toISOString() : null,
      ...computeQueueInfo(audit, allAudits),
      canCancel: audit.status === 'queued' || audit.status === 'pending',
      canRetry: audit.status === 'failed' || audit.status === 'cancelled',
    };
  }

  private computeCurrentStepAndProgress(audit: Audit): { currentStepLabel: string | null; progressPercent: number | null } {
    if (audit.status === 'completed') return { currentStepLabel: 'Completed', progressPercent: 100 };
    if (audit.status === 'failed') return { currentStepLabel: 'Failed', progressPercent: null };
    if (audit.status === 'cancelled') return { currentStepLabel: 'Cancelled', progressPercent: null };
    if (audit.status === 'queued') return { currentStepLabel: 'Queued', progressPercent: 0 };
    if (audit.status === 'pending') return { currentStepLabel: 'Starting…', progressPercent: 0 };

    // 'running' — read the real, live in-process snapshot (the exact same one GET
    // /audits/:id/events replays on connect) rather than inferring a step from stale DB state.
    const snapshot = this.progressPublisher.getSnapshot(audit.id);
    const completedCount = snapshot.steps.filter((step) => step.status === 'completed').length;
    const runningStep = snapshot.steps.find((step) => step.status === 'running');
    const failedStep = snapshot.steps.find((step) => step.status === 'failed');

    const currentStepLabel = failedStep
      ? `${STEP_LABELS[failedStep.stepId] ?? failedStep.stepId} (failed)`
      : runningStep
        ? (STEP_LABELS[runningStep.stepId] ?? runningStep.stepId)
        : 'Starting…';

    return { currentStepLabel, progressPercent: Math.round((completedCount / TRACKABLE_STEP_COUNT) * 100) };
  }
}
