'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { CycleStatus, OptimizationCycleMetadata } from '@ai-visibility/contracts';
import { getCurrentCycle, transitionCycleStatus } from '../../../actions';

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
    return <p>Loading current cycle...</p>;
  }

  if (!cycle) {
    return <p>No optimization cycle yet — one is created automatically on the next Audit.</p>;
  }

  const nextStatus = NEXT_CYCLE_STATUS[cycle.status];

  return (
    <div>
      {statusMessage && <p>{statusMessage}</p>}
      <p>Cycle ID: {cycle.id}</p>
      <p>Goal: {cycle.goal}</p>
      <p>Status: {cycle.status}</p>
      <p>Current Phase: {cycle.currentPhase}</p>
      <p>Start Date: {cycle.startDate ?? 'Not started'}</p>
      <p>End Date: {cycle.endDate ?? 'Not completed'}</p>
      {nextStatus && (
        <button type="button" onClick={() => handleTransition(nextStatus)}>
          Advance to {nextStatus}
        </button>
      )}
      <p>
        <Link href={`/projects/${projectId}/cycles/${cycle.id}/report`}>View Executive Client Report</Link>
      </p>
    </div>
  );
}
