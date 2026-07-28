'use client';

import { useEffect, useState } from 'react';
import type { CampaignMetadata } from '@ai-visibility/contracts';
import { createCampaign, getLatestCampaign, setActionStatus, setCampaignStatus } from '../../../../actions';
import { Badge, Banner, Card, ConfirmButton, EmptyState, SkeletonBlock, StageProgress, statusToVariant } from '../../../../components/ui';
import { useTranslations } from '../../../../../lib/i18n/client';

const CAMPAIGN_STAGES = ['draft', 'active', 'completed', 'archived'];

const NEXT_CAMPAIGN_STATUS: Record<string, 'active' | 'completed' | 'archived' | null> = {
  draft: 'active',
  active: 'completed',
  completed: 'archived',
  archived: null,
};

const NEXT_ACTION_STATUS: Record<string, 'in-progress' | 'completed' | 'verified' | null> = {
  pending: 'in-progress',
  'in-progress': 'completed',
  completed: 'verified',
  verified: null,
};

export function CampaignManager({ projectId }: { projectId: string }) {
  const t = useTranslations('optimization');
  const tCommon = useTranslations('common');
  const [campaign, setCampaign] = useState<CampaignMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [statusMessage, setStatusMessage] = useState<string | undefined>(undefined);

  const refresh = () => {
    getLatestCampaign(projectId).then((result) => {
      setCampaign(result);
      setLoading(false);
    });
  };

  useEffect(refresh, [projectId]);

  const handleCreate = async () => {
    const { error: createError } = await createCampaign(projectId);
    setError(createError);
    setStatusMessage(createError ? undefined : t('campaignCreated'));
    if (!createError) {
      refresh();
    }
  };

  const handleCampaignStatus = async (status: 'active' | 'completed' | 'archived') => {
    if (!campaign) {
      return;
    }
    const success = await setCampaignStatus(campaign.id, status);
    setStatusMessage(
      success
        ? t('campaignAdvanced', { status: tCommon(`statusValues.${status}`) })
        : t('failedToUpdateCampaignStatus'),
    );
    refresh();
  };

  const handleActionStatus = async (actionId: string, status: 'in-progress' | 'completed' | 'verified') => {
    if (!campaign) {
      return;
    }
    const success = await setActionStatus(campaign.id, actionId, status);
    setStatusMessage(
      success ? t('actionAdvanced', { status: tCommon(`statusValues.${status}`) }) : t('failedToUpdateActionStatus'),
    );
    refresh();
  };

  return (
    <div className="stack">
      <Card>
        <div className="cluster">
          <button type="button" className="btn btn-primary" onClick={handleCreate}>
            {t('createCampaignFromPlan')}
          </button>
        </div>
        {error && <Banner variant="error">{error}</Banner>}
        {statusMessage && <Banner variant="success">{statusMessage}</Banner>}
      </Card>

      {loading && (
        <Card>
          <SkeletonBlock lines={3} />
        </Card>
      )}
      {!loading && !campaign && (
        <Card>
          <EmptyState title={t('noCampaignYetForProject')} description={t('createOneAboveDescription')} />
        </Card>
      )}

      {campaign && (
        <Card>
          <div className="card__header">
            <div>
              <h3>{t('campaignIdLabel', { id: campaign.id.slice(0, 8) })}</h3>
              <p className="text-secondary">
                {t('sourceAuditCreated', { auditId: campaign.sourceAuditId.slice(0, 8), date: campaign.createdAt })}
              </p>
            </div>
            <Badge variant={statusToVariant(campaign.status)}>{tCommon(`statusValues.${campaign.status}`)}</Badge>
          </div>
          <StageProgress
            stages={CAMPAIGN_STAGES.map((stage) => tCommon(`statusValues.${stage}`))}
            current={tCommon(`statusValues.${campaign.status}`)}
          />
          {NEXT_CAMPAIGN_STATUS[campaign.status] && (
            <div>
              {NEXT_CAMPAIGN_STATUS[campaign.status] === 'archived' ? (
                <ConfirmButton
                  label={t('advanceToArchived')}
                  confirmLabel={t('advanceCampaignConfirm')}
                  confirmDescription={t('archivedCannotReopen')}
                  variant="primary"
                  onConfirm={() => handleCampaignStatus('archived')}
                />
              ) : (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() =>
                    handleCampaignStatus(NEXT_CAMPAIGN_STATUS[campaign.status] as 'active' | 'completed')
                  }
                >
                  {t('advanceTo', { status: tCommon(`statusValues.${NEXT_CAMPAIGN_STATUS[campaign.status]}`) })}
                </button>
              )}
            </div>
          )}

          <div className="section">
            <h3>{t('optimizationActionsTitle')}</h3>
            {campaign.actions.length === 0 && <EmptyState title={t('noActionsInCampaign')} />}
            {campaign.actions.length > 0 && (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>{t('titleColumn')}</th>
                      <th>{tCommon('status')}</th>
                      <th>{t('supportingFindingsColumn')}</th>
                      <th>
                        <span className="visually-hidden">{tCommon('actions')}</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaign.actions.map((action) => (
                      <tr key={action.id}>
                        <td>{action.title}</td>
                        <td>
                          <Badge variant={statusToVariant(action.status)}>{tCommon(`statusValues.${action.status}`)}</Badge>
                        </td>
                        <td className="text-secondary">{action.supportingFindingIds.join(', ') || t('none')}</td>
                        <td>
                          {NEXT_ACTION_STATUS[action.status] && (
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              onClick={() =>
                                handleActionStatus(
                                  action.id,
                                  NEXT_ACTION_STATUS[action.status] as 'in-progress' | 'completed' | 'verified',
                                )
                              }
                            >
                              {t('advanceTo', { status: tCommon(`statusValues.${NEXT_ACTION_STATUS[action.status]}`) })}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
