'use client';

import { useEffect, useState } from 'react';
import type { CampaignMetadata } from '@ai-visibility/contracts';
import { createCampaign, getLatestCampaign, setActionStatus, setCampaignStatus } from '../../../../actions';
import { Badge, Banner, Card, ConfirmButton, EmptyState, SkeletonBlock, StageProgress } from '../../../../components/ui';

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
    setStatusMessage(createError ? undefined : 'Campaign created.');
    if (!createError) {
      refresh();
    }
  };

  const handleCampaignStatus = async (status: 'active' | 'completed' | 'archived') => {
    if (!campaign) {
      return;
    }
    const success = await setCampaignStatus(campaign.id, status);
    setStatusMessage(success ? `Campaign advanced to '${status}'.` : 'Failed to update campaign status.');
    refresh();
  };

  const handleActionStatus = async (actionId: string, status: 'in-progress' | 'completed' | 'verified') => {
    if (!campaign) {
      return;
    }
    const success = await setActionStatus(campaign.id, actionId, status);
    setStatusMessage(success ? `Action advanced to '${status}'.` : 'Failed to update action status.');
    refresh();
  };

  return (
    <div className="stack">
      <Card>
        <div className="cluster">
          <button type="button" className="btn btn-primary" onClick={handleCreate}>
            Create Campaign from Current Optimization Plan
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
          <EmptyState
            title="No Campaign yet for this Project"
            description="Create one above from your current Optimization Plan to start tracking work."
          />
        </Card>
      )}

      {campaign && (
        <Card>
          <div className="card__header">
            <div>
              <h3>Campaign {campaign.id.slice(0, 8)}</h3>
              <p className="text-secondary">Source Audit: {campaign.sourceAuditId.slice(0, 8)} · Created {campaign.createdAt}</p>
            </div>
            <Badge>{campaign.status}</Badge>
          </div>
          <StageProgress stages={CAMPAIGN_STAGES} current={campaign.status} />
          {NEXT_CAMPAIGN_STATUS[campaign.status] && (
            <div>
              {NEXT_CAMPAIGN_STATUS[campaign.status] === 'archived' ? (
                <ConfirmButton
                  label="Advance to archived"
                  confirmLabel="Advance this Campaign to 'archived'?"
                  confirmDescription="Archived Campaigns cannot be reopened."
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
                  Advance to {NEXT_CAMPAIGN_STATUS[campaign.status]}
                </button>
              )}
            </div>
          )}

          <div className="section">
            <h3>Optimization Actions</h3>
            {campaign.actions.length === 0 && <EmptyState title="No Actions in this Campaign" />}
            {campaign.actions.length > 0 && (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Status</th>
                      <th>Supporting Findings</th>
                      <th>
                        <span className="visually-hidden">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaign.actions.map((action) => (
                      <tr key={action.id}>
                        <td>{action.title}</td>
                        <td>
                          <Badge>{action.status}</Badge>
                        </td>
                        <td className="text-secondary">{action.supportingFindingIds.join(', ') || 'None'}</td>
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
                              Advance to {NEXT_ACTION_STATUS[action.status]}
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
