'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { AuditMetadata, AuditProgressEvent, AuditStageStatus, AuditStatus, AuditStepProgressEvent } from '@ai-visibility/contracts';
import { Badge, Card } from '../../../components/ui';
import { getAudit } from '../../../actions';

interface Stage {
  key: string;
  label: string;
  stepIds: string[];
}

// Real technical step ids, in the Workflow Runtime's actual execution order (see
// apps/api/src/domain/audit/full-audit.type.ts). AI Visibility rolls up 3 real steps into one
// user-facing stage — an honest aggregation (its status/duration always reflect all 3 real
// signals), not a fabricated one. Optimization has no WorkflowContext capability of its own (see
// docs/04_PROJECT/DECISION_LOG.md#cto-104) but is timed and published for real by CreateAuditUseCase.
const STAGES: Stage[] = [
  { key: 'discovery', label: 'Discovery', stepIds: ['discovery'] },
  { key: 'crawl', label: 'Crawling', stepIds: ['crawl'] },
  { key: 'inventory', label: 'Inventory', stepIds: ['inventory'] },
  { key: 'extraction', label: 'Extraction', stepIds: ['extraction'] },
  { key: 'heuristics', label: 'Heuristics', stepIds: ['heuristics'] },
  { key: 'analysis', label: 'Analysis', stepIds: ['analysis'] },
  { key: 'entity', label: 'Entity Detection', stepIds: ['entity'] },
  { key: 'knowledgeGraph', label: 'Knowledge Graph', stepIds: ['knowledgeGraph'] },
  { key: 'aiVisibility', label: 'AI Visibility', stepIds: ['aiVisibility', 'aiVisibilityHeuristics', 'aiVisibilityAnalysis'] },
  { key: 'optimization', label: 'Optimization', stepIds: ['optimization'] },
];

const QUEUE_POLL_INTERVAL_MS = 5000;

function isTerminal(status: AuditStatus): boolean {
  return status === 'completed' || status === 'failed' || status === 'cancelled';
}

function deriveStageStatus(stepIds: string[], steps: Map<string, AuditStepProgressEvent>): AuditStageStatus {
  const events = stepIds.map((id) => steps.get(id));
  if (events.every((event) => !event)) {
    return 'waiting';
  }
  if (events.some((event) => event?.status === 'failed')) {
    return 'failed';
  }
  if (events.every((event) => event?.status === 'completed')) {
    return 'completed';
  }
  return 'running';
}

function stageDurationMs(stepIds: string[], steps: Map<string, AuditStepProgressEvent>): number | null {
  const durations = stepIds.map((id) => steps.get(id)?.durationMs);
  if (durations.some((value) => typeof value !== 'number')) {
    return null;
  }
  return (durations as number[]).reduce((sum, value) => sum + value, 0);
}

function formatDuration(ms: number): string {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

function formatEstimatedStart(iso: string): string {
  const deltaMs = new Date(iso).getTime() - Date.now();
  if (deltaMs <= 0) return 'any moment now';
  return `~${formatDuration(deltaMs)} from now`;
}

function initialStepsFromHistory(audit: AuditMetadata): Map<string, AuditStepProgressEvent> {
  const steps = new Map<string, AuditStepProgressEvent>();
  for (const record of audit.executionHistory) {
    steps.set(record.stepId, {
      type: 'step',
      stepId: record.stepId,
      status: record.status === 'success' ? 'completed' : 'failed',
      startedAt: record.startedAt,
      completedAt: record.completedAt,
      durationMs: record.durationMs,
      errorCode: record.errorCode,
      errorMessage: record.errorMessage,
    });
  }
  return steps;
}

export function ExecutionTimeline({ audit }: { audit: AuditMetadata }) {
  const [auditStatus, setAuditStatus] = useState<AuditStatus>(audit.status);
  const [steps, setSteps] = useState<Map<string, AuditStepProgressEvent>>(() => initialStepsFromHistory(audit));
  const [now, setNow] = useState(() => Date.now());
  const [queueInfo, setQueueInfo] = useState({ queuePosition: audit.queuePosition, estimatedStartAt: audit.estimatedStartAt });

  useEffect(() => {
    if (isTerminal(audit.status)) {
      return;
    }

    const source = new EventSource(`/api/audits/${audit.id}/events`);

    source.onmessage = (message) => {
      const event = JSON.parse(message.data) as AuditProgressEvent;
      if (event.type === 'audit') {
        setAuditStatus(event.status);
        if (isTerminal(event.status)) {
          source.close();
        }
        return;
      }
      setSteps((current) => {
        const next = new Map(current);
        next.set(event.stepId, event);
        return next;
      });
    };

    return () => source.close();
    // audit.status is only read once, at mount, to decide whether to open the connection at all —
    // deliberately excluded from deps so a live-updating status doesn't tear down the subscription.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audit.id]);

  useEffect(() => {
    if (isTerminal(auditStatus)) {
      return;
    }
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [auditStatus]);

  // Queue Position/Estimated Start (F10-S04D, see docs/04_PROJECT/DECISION_LOG.md#cto-106) aren't
  // part of the SSE event payload — they can shift as other Audits ahead in this Project's queue
  // finish, so this polls the real current value rather than freezing it at page load. Stops the
  // moment this Audit itself is dequeued (SSE already handles that transition).
  useEffect(() => {
    if (auditStatus !== 'queued') {
      return;
    }
    const interval = setInterval(async () => {
      const fresh = await getAudit(audit.id);
      if (fresh) {
        setQueueInfo({ queuePosition: fresh.queuePosition, estimatedStartAt: fresh.estimatedStartAt });
      }
    }, QUEUE_POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [audit.id, auditStatus]);

  const stageStatuses = useMemo(
    () =>
      STAGES.map((stage) => {
        const status = deriveStageStatus(stage.stepIds, steps);
        // Optimization is real, timed work (see CreateAuditUseCase) but, unlike the 11 real
        // Workflow steps, its transition isn't persisted — only ever visible to a client connected
        // live. A client that connects after the Audit finished (the common case: Audit History,
        // any later page load) would otherwise see it stuck at "Waiting" forever despite it having
        // genuinely run — reaching audit.status 'completed' is only possible if it already
        // succeeded, so that's a real, not fabricated, fallback signal for this one stage.
        const resolvedStatus: AuditStageStatus =
          stage.key === 'optimization' && status === 'waiting' && auditStatus === 'completed' ? 'completed' : status;
        return { stage, status: resolvedStatus, durationMs: stageDurationMs(stage.stepIds, steps) };
      }),
    [steps, auditStatus],
  );

  // 'queued' reads the same as 'pending' here — neither has started the real pipeline yet, so the
  // "Queued" bookend stage is still genuinely in progress, not complete.
  const queuedStatus: AuditStageStatus = auditStatus === 'pending' || auditStatus === 'queued' ? 'running' : 'completed';
  const completedStageStatus: AuditStageStatus =
    auditStatus === 'completed' ? 'completed' : auditStatus === 'failed' || auditStatus === 'cancelled' ? 'failed' : 'waiting';

  const failedStage = stageStatuses.find(({ status }) => status === 'failed');
  const runningStage = stageStatuses.find(({ status }) => status === 'running');
  const completedCount = stageStatuses.filter(({ status }) => status === 'completed').length;

  const currentStepLabel = failedStage
    ? `${failedStage.stage.label} (failed)`
    : runningStage
      ? runningStage.stage.label
      : auditStatus === 'queued'
        ? 'Queued — waiting for another Audit to finish'
        : auditStatus === 'pending'
          ? 'Queued'
          : auditStatus === 'failed'
            ? 'Audit failed'
            : auditStatus === 'cancelled'
              ? 'Audit cancelled'
              : 'Completed';

  const elapsedMs = audit.startedAt ? Math.max(0, now - new Date(audit.startedAt).getTime()) : 0;

  const completedDurations = stageStatuses
    .filter(({ status, durationMs }) => status === 'completed' && durationMs !== null)
    .map(({ durationMs }) => durationMs as number);
  const averageStageDurationMs =
    completedDurations.length > 0 ? completedDurations.reduce((sum, value) => sum + value, 0) / completedDurations.length : null;
  const remainingStageCount = stageStatuses.filter(({ status }) => status === 'waiting' || status === 'running').length;
  const estimatedRemainingMs =
    averageStageDurationMs !== null && !isTerminal(auditStatus) ? averageStageDurationMs * remainingStageCount : null;

  return (
    <Card title="Live Audit Execution">
      {auditStatus === 'queued' && (
        <dl className="dl">
          <dt>Status</dt>
          <dd>
            <Badge variant="warning">Already Running</Badge> — another Audit for this Project is in progress
          </dd>
          <dt>Queue Position</dt>
          <dd>{queueInfo.queuePosition !== null ? `${queueInfo.queuePosition} in line` : '—'}</dd>
          <dt>Estimated Start</dt>
          <dd>{queueInfo.estimatedStartAt ? formatEstimatedStart(queueInfo.estimatedStartAt) : 'Calculating…'}</dd>
        </dl>
      )}

      <dl className="dl">
        <dt>Current Step</dt>
        <dd>{currentStepLabel}</dd>
        <dt>Progress</dt>
        <dd>
          {completedCount} / {STAGES.length} stages
          {failedStage ? '' : ` (${Math.round((completedCount / STAGES.length) * 100)}%)`}
        </dd>
        <dt>Elapsed Time</dt>
        <dd>{formatDuration(elapsedMs)}</dd>
        <dt>Est. Remaining Time</dt>
        <dd>{isTerminal(auditStatus) ? '—' : estimatedRemainingMs !== null ? `~${formatDuration(estimatedRemainingMs)}` : 'Calculating…'}</dd>
      </dl>

      {auditStatus === 'completed' && audit.previousAuditId && (
        <p>
          <Link
            className="btn btn-secondary btn-sm"
            href={`/projects/${audit.projectId}/compare?url=${encodeURIComponent(audit.url)}&baselineAuditId=${audit.previousAuditId}&targetAuditId=${audit.id}`}
          >
            Compare With Previous
          </Link>
        </p>
      )}

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Stage</th>
              <th>Status</th>
              <th>Duration</th>
              <th>Error</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Queued</td>
              <td>
                <Badge>{queuedStatus}</Badge>
              </td>
              <td>—</td>
              <td>—</td>
            </tr>
            {stageStatuses.map(({ stage, status, durationMs }) => {
              const failingStep = stage.stepIds.map((id) => steps.get(id)).find((event) => event?.status === 'failed');
              return (
                <tr key={stage.key}>
                  <td>{stage.label}</td>
                  <td>
                    <Badge>{status}</Badge>
                  </td>
                  <td>{durationMs !== null ? formatDuration(durationMs) : '—'}</td>
                  <td>{failingStep?.errorMessage ? `${failingStep.errorCode}: ${failingStep.errorMessage}` : '—'}</td>
                </tr>
              );
            })}
            <tr>
              <td>Completed</td>
              <td>
                <Badge>{completedStageStatus}</Badge>
              </td>
              <td>{audit.startedAt && audit.completedAt ? formatDuration(new Date(audit.completedAt).getTime() - new Date(audit.startedAt).getTime()) : '—'}</td>
              <td>—</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
}
