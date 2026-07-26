'use client';

import { useEffect, useState } from 'react';
import type { BriefingItem, BriefingModel } from '@ai-visibility/contracts';
import { getDailyBriefing } from './actions';
import { Badge, Banner, Card, CONFIDENCE_VARIANT, EmptyState, SkeletonBlock } from './components/ui';

const CATEGORY_LABELS: Record<BriefingItem['category'], string> = {
  'project-attention': 'Projects Requiring Attention',
  'ai-visibility-regression': 'AI Visibility Regressions',
  'critical-finding': 'Critical Findings',
  'campaign-awaiting-verification': 'Campaigns Awaiting Verification',
  'high-impact-opportunity': 'High-Impact Opportunities',
  'recent-improvement': 'Recently Completed Improvements',
};

export function DailyBriefing() {
  const [briefing, setBriefing] = useState<BriefingModel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDailyBriefing().then((result) => {
      setBriefing(result);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <Card title="AI Daily Briefing">
        <SkeletonBlock lines={2} />
      </Card>
    );
  }

  if (!briefing) {
    return (
      <Card title="AI Daily Briefing">
        <Banner variant="error">Unable to load the briefing right now. Is the API reachable?</Banner>
      </Card>
    );
  }

  if (briefing.items.length === 0) {
    return (
      <Card title="AI Daily Briefing">
        <EmptyState
          title="Nothing needs your attention"
          description={`Across ${briefing.projectsSummarized} active Project(s).`}
        />
      </Card>
    );
  }

  return (
    <Card title="AI Daily Briefing">
      <p className="text-tertiary">
        Generated at {briefing.generatedAt} across {briefing.projectsSummarized} active Project(s).
      </p>
      <div className="stack">
        {briefing.items.map((item) => (
          <Card key={item.id} muted>
            <div className="card__header">
              <div>
                <p className="text-secondary">
                  {CATEGORY_LABELS[item.category]} · {item.projectName} ({item.clientName})
                </p>
                <h4>{item.title}</h4>
              </div>
              <Badge variant={CONFIDENCE_VARIANT}>{item.confidence}</Badge>
            </div>
            <p>{item.reason}</p>
            <p className="text-secondary">
              <strong>Business impact:</strong> {item.businessImpact}
            </p>
            <p className="text-secondary">
              <strong>Recommended next action:</strong> {item.recommendedNextAction}
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
    </Card>
  );
}
