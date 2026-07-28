'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { AuditMetadata, AuditProgressEvent, AuditStageStatus, AuditStatus, AuditStepProgressEvent } from '@ai-visibility/contracts';
import { Badge, Card, statusToVariant } from '../../../components/ui';
import { getAudit } from '../../../actions';
import { useTranslations } from '../../../../lib/i18n/client';
import type { Translator } from '@ai-visibility/i18n';

interface Stage {
  key: string;
  labelKey: string;
  stepIds: string[];
}

// Real technical step ids, in the Workflow Runtime's actual execution order (see
// apps/api/src/domain/audit/full-audit.type.ts). AI Visibility rolls up 3 real steps into one
// user-facing stage — an honest aggregation (its status/duration always reflect all 3 real
// signals), not a fabricated one. Optimization has no WorkflowContext capability of its own (see
// docs/04_PROJECT/DECISION_LOG.md#cto-104) but is timed and published for real by CreateAuditUseCase.
const STAGES: Stage[] = [
  { key: 'discovery', labelKey: 'stageDiscovery', stepIds: ['discovery'] },
  { key: 'crawl', labelKey: 'stageCrawling', stepIds: ['crawl'] },
  { key: 'inventory', labelKey: 'stageInventory', stepIds: ['inventory'] },
  { key: 'extraction', labelKey: 'stageExtraction', stepIds: ['extraction'] },
  { key: 'heuristics', labelKey: 'stageHeuristics', stepIds: ['heuristics'] },
  { key: 'analysis', labelKey: 'stageAnalysis', stepIds: ['analysis'] },
  { key: 'entity', labelKey: 'stageEntityDetection', stepIds: ['entity'] },
  { key: 'knowledgeGraph', labelKey: 'stageKnowledgeGraph', stepIds: ['knowledgeGraph'] },
  { key: 'aiVisibility', labelKey: 'stageAiVisibility', stepIds: ['aiVisibility', 'aiVisibilityHeuristics', 'aiVisibilityAnalysis'] },
  { key: 'optimization', labelKey: 'stageOptimization', stepIds: ['optimization'] },
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

function formatEstimatedStart(iso: string, t: Translator): string {
  const deltaMs = new Date(iso).getTime() - Date.now();
  if (deltaMs <= 0) return t('anyMomentNow');
  return `~${formatDuration(deltaMs)}`;
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
  const t = useTranslations('audits');
  const tCommon = useTranslations('common');
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
    ? `${t(failedStage.stage.labelKey)} (${tCommon('statusValues.failed')})`
    : runningStage
      ? t(runningStage.stage.labelKey)
      : auditStatus === 'queued'
        ? t('queuedWaitingMessage')
        : auditStatus === 'pending'
          ? t('currentStepQueued')
          : auditStatus === 'failed'
            ? t('auditFailedStep')
            : auditStatus === 'cancelled'
              ? t('auditCancelledStep')
              : tCommon('statusValues.completed');

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
    <Card title={t('liveExecution')}>
      {auditStatus === 'queued' && (
        <dl className="dl">
          <dt>{tCommon('status')}</dt>
          <dd>
            <Badge variant="warning">{t('alreadyRunning')}</Badge> — {t('anotherAuditInProgress')}
          </dd>
          <dt>{t('queuePosition')}</dt>
          <dd>{queueInfo.queuePosition !== null ? t('inLine', { position: queueInfo.queuePosition }) : '—'}</dd>
          <dt>{t('estimatedStart')}</dt>
          <dd>{queueInfo.estimatedStartAt ? formatEstimatedStart(queueInfo.estimatedStartAt, t) : t('calculating')}</dd>
        </dl>
      )}

      <dl className="dl">
        <dt>{t('currentStep')}</dt>
        <dd>{currentStepLabel}</dd>
        <dt>{t('progress')}</dt>
        <dd>
          {t('stagesProgress', { completed: completedCount, total: STAGES.length })}
          {failedStage ? '' : ` (${Math.round((completedCount / STAGES.length) * 100)}%)`}
        </dd>
        <dt>{t('elapsedTime')}</dt>
        <dd>{formatDuration(elapsedMs)}</dd>
        <dt>{t('estRemainingTime')}</dt>
        <dd>{isTerminal(auditStatus) ? '—' : estimatedRemainingMs !== null ? `~${formatDuration(estimatedRemainingMs)}` : t('calculating')}</dd>
      </dl>

      {auditStatus === 'completed' && audit.previousAuditId && (
        <p>
          <Link
            className="btn btn-secondary btn-sm"
            href={`/projects/${audit.projectId}/compare?url=${encodeURIComponent(audit.url)}&baselineAuditId=${audit.previousAuditId}&targetAuditId=${audit.id}`}
          >
            {t('compareWithPrevious')}
          </Link>
        </p>
      )}

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>{t('stageColumn')}</th>
              <th>{tCommon('status')}</th>
              <th>{t('duration')}</th>
              <th>{t('errorColumn')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{t('queuedRow')}</td>
              <td>
                <Badge variant={statusToVariant(queuedStatus)}>{tCommon(`statusValues.${queuedStatus}`)}</Badge>
              </td>
              <td>—</td>
              <td>—</td>
            </tr>
            {stageStatuses.map(({ stage, status, durationMs }) => {
              const failingStep = stage.stepIds.map((id) => steps.get(id)).find((event) => event?.status === 'failed');
              return (
                <tr key={stage.key}>
                  <td>{t(stage.labelKey)}</td>
                  <td>
                    <Badge variant={statusToVariant(status)}>{tCommon(`statusValues.${status}`)}</Badge>
                  </td>
                  <td>{durationMs !== null ? formatDuration(durationMs) : '—'}</td>
                  <td>{failingStep?.errorMessage ? `${failingStep.errorCode}: ${failingStep.errorMessage}` : '—'}</td>
                </tr>
              );
            })}
            <tr>
              <td>{tCommon('statusValues.completed')}</td>
              <td>
                <Badge variant={statusToVariant(completedStageStatus)}>{tCommon(`statusValues.${completedStageStatus}`)}</Badge>
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
