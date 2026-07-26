'use client';

import { useEffect, useState } from 'react';
import type { CampaignMetadata } from '@ai-visibility/contracts';
import { createCampaign, getLatestCampaign, setActionStatus, setCampaignStatus } from '../../../actions';

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

  return (
    <div>
      <p>
        <button type="button" onClick={handleCreate}>
          Create Campaign from Current Optimization Plan
        </button>
      </p>
      {error && <p>Error: {error}</p>}
      {statusMessage && <p>{statusMessage}</p>}

      {loading && <p>Loading Campaign...</p>}
      {!loading && !campaign && <p>No campaign yet for this project.</p>}

      {campaign && (
        <div>
          <p>Campaign ID: {campaign.id}</p>
          <p>Status: {campaign.status}</p>
          <p>Source Audit: {campaign.sourceAuditId}</p>
          <p>Created At: {campaign.createdAt}</p>
          {NEXT_CAMPAIGN_STATUS[campaign.status] && (
            <button
              type="button"
              onClick={() => handleCampaignStatus(NEXT_CAMPAIGN_STATUS[campaign.status] as 'active' | 'completed' | 'archived')}
            >
              Advance to {NEXT_CAMPAIGN_STATUS[campaign.status]}
            </button>
          )}

          <h3>Optimization Actions</h3>
          {campaign.actions.length === 0 && <p>No actions in this campaign.</p>}
          <ul>
            {campaign.actions.map((action) => (
              <li key={action.id}>
                <p>Title: {action.title}</p>
                <p>Status: {action.status}</p>
                <p>Supporting Findings: {action.supportingFindingIds.join(', ')}</p>
                {NEXT_ACTION_STATUS[action.status] && (
                  <button
                    type="button"
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
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
