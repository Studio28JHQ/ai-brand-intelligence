'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { CycleStatus, OptimizationCycleMetadata } from '@ai-visibility/contracts';
import { getCurrentCycle, transitionCycleStatus } from '../../../../actions';
import { Badge, Banner, ConfirmButton, EmptyState, SkeletonBlock, StageProgress, statusToVariant } from '../../../../components/ui';
import { useTranslations } from '../../../../../lib/i18n/client';

const CYCLE_STAGES: CycleStatus[] = ['planned', 'running', 'verification', 'completed'];

const NEXT_CYCLE_STATUS: Record<CycleStatus, CycleStatus | null> = {
  planned: 'running',
  running: 'verification',
  verification: 'completed',
  completed: null,
};

export function CycleManager({ projectId }: { projectId: string }) {
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');
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
    setStatusMessage(
      success ? t('cycleAdvanced', { status: tCommon(`statusValues.${status}`) }) : t('failedToUpdateCycleStatus'),
    );
    refresh();
  };

  if (loading) {
    return <SkeletonBlock lines={3} />;
  }

  if (!cycle) {
    return <EmptyState title={t('noOptimizationCycleYet')} description={t('cycleCreatedAutomatically')} />;
  }

  const nextStatus = NEXT_CYCLE_STATUS[cycle.status];
  const stageLabels = CYCLE_STAGES.map((stage) => tCommon(`statusValues.${stage}`));
  const currentStageLabel = tCommon(`statusValues.${cycle.status}`);

  return (
    <div className="stack">
      {statusMessage && <Banner variant="success">{statusMessage}</Banner>}
      <StageProgress stages={stageLabels} current={currentStageLabel} />
      <dl className="dl">
        <dt>{t('goal')}</dt>
        <dd>{cycle.goal}</dd>
        <dt>{tCommon('status')}</dt>
        <dd>
          <Badge variant={statusToVariant(cycle.status)}>{currentStageLabel}</Badge>
        </dd>
        <dt>{t('startDate')}</dt>
        <dd>{cycle.startDate ?? t('notStarted')}</dd>
        <dt>{t('endDate')}</dt>
        <dd>{cycle.endDate ?? t('notCompleted')}</dd>
      </dl>
      <div className="cluster">
        {nextStatus &&
          (nextStatus === 'completed' ? (
            <ConfirmButton
              label={t('advanceTo', { status: tCommon(`statusValues.${nextStatus}`) })}
              confirmLabel={t('advanceCycleConfirm', { status: tCommon(`statusValues.${nextStatus}`) })}
              confirmDescription={t('cannotReopenCompletedCycle')}
              variant="primary"
              onConfirm={() => handleTransition(nextStatus)}
            />
          ) : (
            <button type="button" className="btn btn-primary" onClick={() => handleTransition(nextStatus)}>
              {t('advanceTo', { status: tCommon(`statusValues.${nextStatus}`) })}
            </button>
          ))}
        <Link href={`/projects/${projectId}/cycles/${cycle.id}/report`} className="btn btn-ghost">
          {t('viewExecutiveClientReport')}
        </Link>
      </div>
    </div>
  );
}
