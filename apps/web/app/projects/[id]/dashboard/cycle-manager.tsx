'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { CycleStatus, OptimizationCycleMetadata } from '@ai-visibility/contracts';
import { getCurrentCycle, transitionCycleStatus } from '../../../actions';
import { Badge, Banner, ConfirmButton, EmptyState, SkeletonBlock } from '../../../components/ui';

const NEXT_CYCLE_STATUS: Record<CycleStatus, CycleStatus | null> = {
  planned: 'running',
  running: 'verification',
  verification: 'completed',
  completed: null,
};

export function CycleManager({ projectId }: { projectId: string }) {
  const [cycle, setCycle] = useState<OptimizationCycleMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | undefined>(undefined);

  const refresh = () => {
    getCurrentCycle(projectId).then((result) => {
      setCycle(result);
      setLoading(false);
    });
  };

  useEffect(refresh, [projectId]);

  const handleTransition = async (status: CycleStatus) => {
    if (!cycle) {
      return;
    }
    const success = await transitionCycleStatus(cycle.id, status);
    setStatusMessage(success ? `Cycle advanced to '${status}'.` : 'Failed to update cycle status.');
    refresh();
  };

  if (loading) {
    return <SkeletonBlock lines={3} />;
  }

  if (!cycle) {
    return <EmptyState title="No Optimization Cycle yet" description="One is created automatically on the next Audit." />;
  }

  const nextStatus = NEXT_CYCLE_STATUS[cycle.status];

  return (
    <div className="stack">
      {statusMessage && <Banner variant="success">{statusMessage}</Banner>}
      <dl className="dl">
        <dt>Goal</dt>
        <dd>{cycle.goal}</dd>
        <dt>Status</dt>
        <dd>
          <Badge>{cycle.status}</Badge>
        </dd>
        <dt>Start Date</dt>
        <dd>{cycle.startDate ?? 'Not started'}</dd>
        <dt>End Date</dt>
        <dd>{cycle.endDate ?? 'Not completed'}</dd>
      </dl>
      <div className="cluster">
        {nextStatus &&
          (nextStatus === 'completed' ? (
            <ConfirmButton
              label={`Advance to ${nextStatus}`}
              confirmLabel={`Advance this Cycle to '${nextStatus}'?`}
              confirmDescription="A completed Cycle cannot be reopened."
              onConfirm={() => handleTransition(nextStatus)}
            />
          ) : (
            <button type="button" className="btn btn-secondary" onClick={() => handleTransition(nextStatus)}>
              Advance to {nextStatus}
            </button>
          ))}
        <Link href={`/projects/${projectId}/cycles/${cycle.id}/report`} className="btn btn-ghost">
          View Executive Client Report
        </Link>
      </div>
    </div>
  );
}
