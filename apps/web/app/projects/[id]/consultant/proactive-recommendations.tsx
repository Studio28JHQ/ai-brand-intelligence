'use client';

import { useEffect, useMemo, useState } from 'react';
import type { BriefingItem, BriefingModel } from '@ai-visibility/contracts';
import { getDailyBriefing } from '../../../actions';
import { Badge, Banner, Card, CONFIDENCE_VARIANT, EmptyState, SkeletonBlock } from '../../../components/ui';
import { buildExecutiveSummary, groupRecommendationsBySection, RECOMMENDATION_SECTION_LABELS } from '../../../lib/recommendation-groups';

function dismissedStorageKey(projectId: string): string {
  return `dismissed-recommendations:${projectId}`;
}

function loadDismissedIds(projectId: string): Set<string> {
  if (typeof window === 'undefined') {
    return new Set();
  }
  try {
    const raw = window.localStorage.getItem(dismissedStorageKey(projectId));
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveDismissedIds(projectId: string, ids: Set<string>): void {
  try {
    window.localStorage.setItem(dismissedStorageKey(projectId), JSON.stringify([...ids]));
  } catch {
    // private browsing / storage unavailable — dismissal just won't survive a reload
  }
}

export function ProactiveRecommendations({ projectId }: { projectId: string }) {
  const [briefing, setBriefing] = useState<BriefingModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setDismissedIds(loadDismissedIds(projectId));
    getDailyBriefing().then((result) => {
      setBriefing(result);
      setLoading(false);
    });
  }, [projectId]);

  const projectItems = useMemo(
    () => (briefing ? briefing.items.filter((item) => item.projectId === projectId) : []),
    [briefing, projectId],
  );

  const visibleItems = useMemo(
    () => projectItems.filter((item) => !dismissedIds.has(item.id)),
    [projectItems, dismissedIds],
  );

  const handleDismiss = (item: BriefingItem) => {
    const next = new Set(dismissedIds);
    next.add(item.id);
    setDismissedIds(next);
    saveDismissedIds(projectId, next);
  };

  if (loading) {
    return (
      <Card title="Proactive Recommendations">
        <SkeletonBlock lines={3} />
      </Card>
    );
  }

  if (!briefing) {
    return (
      <Card title="Proactive Recommendations">
        <Banner variant="error">Unable to load recommendations right now. Is the API reachable?</Banner>
      </Card>
    );
  }

  const projectName = projectItems[0]?.projectName ?? 'This Project';

  if (visibleItems.length === 0) {
    return (
      <Card title="Proactive Recommendations">
        <EmptyState
          title={projectItems.length === 0 ? 'Nothing needs your attention' : 'All caught up'}
          description={
            projectItems.length === 0
              ? 'No open recommendations for this Project right now.'
              : 'Every recommendation for this Project has been dismissed.'
          }
        />
      </Card>
    );
  }

  return (
    <Card title="Proactive Recommendations" description={buildExecutiveSummary(visibleItems, projectName)}>
      <div className="stack">
        {groupRecommendationsBySection(visibleItems).map((group) => (
          <div key={group.section} className="section">
            <h4>{RECOMMENDATION_SECTION_LABELS[group.section]}</h4>
            <div className="stack">
              {group.items.map((item) => (
                <Card key={item.id} muted>
                  <div className="card__header">
                    <h4>{item.title}</h4>
                    <div className="cluster">
                      <Badge variant={CONFIDENCE_VARIANT}>{item.confidence}</Badge>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleDismiss(item)}>
                        Dismiss
                      </button>
                    </div>
                  </div>
                  <p className="text-secondary">
                    <strong>Why:</strong> {item.reason}
                  </p>
                  <p className="text-secondary">
                    <strong>Expected impact:</strong> {item.businessImpact}
                  </p>
                  <p className="text-secondary">
                    <strong>Recommended action:</strong> {item.recommendedNextAction}
                  </p>
                  <details>
                    <summary>Evidence</summary>
                    <ul className="stack-sm">
                      {item.evidence.map((fact, index) => (
                        <li key={index} className="text-secondary">
                          {fact.label}: {fact.value}
                        </li>
                      ))}
                    </ul>
                  </details>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
