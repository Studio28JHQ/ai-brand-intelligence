'use client';

import { useEffect, useState } from 'react';
import type { BriefingItem, BriefingModel } from '@ai-visibility/contracts';
import { getDailyBriefing } from './actions';

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
      <section>
        <h2>AI Daily Briefing</h2>
        <p>Generating briefing...</p>
      </section>
    );
  }

  if (!briefing) {
    return (
      <section>
        <h2>AI Daily Briefing</h2>
        <p>Unable to load the briefing right now. Is the API reachable?</p>
      </section>
    );
  }

  if (briefing.items.length === 0) {
    return (
      <section>
        <h2>AI Daily Briefing</h2>
        <p>Nothing needs your attention right now across {briefing.projectsSummarized} active Project(s).</p>
      </section>
    );
  }

  return (
    <section>
      <h2>AI Daily Briefing</h2>
      <p>
        Generated at {briefing.generatedAt} across {briefing.projectsSummarized} active Project(s).
      </p>
      <ul>
        {briefing.items.map((item) => (
          <li key={item.id} style={{ border: '1px solid #ccc', padding: '0.75rem', marginBottom: '0.5rem' }}>
            <p>
              <strong>{CATEGORY_LABELS[item.category]}</strong> — {item.projectName} ({item.clientName})
            </p>
            <p>
              <strong>{item.title}</strong>
            </p>
            <p>Reason: {item.reason}</p>
            <p>Business Impact: {item.businessImpact}</p>
            <p>Recommended Next Action: {item.recommendedNextAction}</p>
            <p>Confidence: {item.confidence}</p>
            <details>
              <summary>Evidence</summary>
              <ul>
                {item.evidence.map((fact, index) => (
                  <li key={index}>
                    {fact.label}: {fact.value}
                  </li>
                ))}
              </ul>
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}
