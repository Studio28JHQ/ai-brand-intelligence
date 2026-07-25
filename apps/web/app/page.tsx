'use client';

import { useActionState, useEffect, useState } from 'react';
import type { AuditMetadata } from '@ai-visibility/contracts';
import { createAudit, CreateAuditState, listAudits } from './actions';

const initialState: CreateAuditState = {};

export default function Home() {
  const [state, formAction, pending] = useActionState(createAudit, initialState);
  const [audits, setAudits] = useState<AuditMetadata[]>([]);

  useEffect(() => {
    listAudits().then(setAudits);
  }, [state.result]);

  return (
    <main>
      <form action={formAction}>
        <input type="url" name="url" placeholder="https://example.com" required />
        <button type="submit" disabled={pending}>
          Analyze
        </button>
      </form>

      <section>
        <h2>Audits</h2>
        <ul>
          {audits.map((audit) => (
            <li key={audit.id}>
              <p>Audit ID: {audit.id}</p>
              <p>URL: {audit.url}</p>
              <p>Status: {audit.status}</p>
              <p>Started At: {audit.startedAt ?? 'N/A'}</p>
              <p>Completed At: {audit.completedAt ?? 'N/A'}</p>
            </li>
          ))}
        </ul>
      </section>

      {state.result && (
        <div>
          <h1>Audit Created</h1>
          <p>Audit ID: {state.result.id}</p>
          <p>Current Status: {state.result.status}</p>
          {state.result.discovery && (
            <>
              <p>Normalized URL: {state.result.discovery.normalizedUrl}</p>
              <p>robots.txt detected: {state.result.discovery.robotsTxtDetected ? 'Yes' : 'No'}</p>
              <p>sitemap.xml detected: {state.result.discovery.sitemapDetected ? 'Yes' : 'No'}</p>
            </>
          )}
          {state.result.crawl && (
            <>
              <p>HTTP Status: {state.result.crawl.httpStatus}</p>
              <p>Final URL: {state.result.crawl.finalUrl}</p>
              <p>HTML Size: {state.result.crawl.htmlSizeBytes} bytes</p>
              <p>Crawl Success: {state.result.crawl.success ? 'Yes' : 'No'}</p>
            </>
          )}
          {state.result.inventory && (
            <>
              <p>Page Title: {state.result.inventory.title ?? 'N/A'}</p>
              <p>Canonical URL: {state.result.inventory.canonicalUrl ?? 'N/A'}</p>
              <p>Language: {state.result.inventory.language ?? 'N/A'}</p>
              <p>H1 Count: {state.result.inventory.h1Count}</p>
              <p>Internal Links: {state.result.inventory.internalLinkCount}</p>
              <p>External Links: {state.result.inventory.externalLinkCount}</p>
            </>
          )}
          {state.result.analysis && (
            <>
              <h2>Findings</h2>
              <ul>
                {state.result.analysis.findings.map((finding) => (
                  <li key={finding.id}>
                    <p>Category: {finding.category}</p>
                    <p>Finding ID: {finding.id}</p>
                    <p>Rule: {finding.ruleId}</p>
                    <p>Source Engine: {finding.sourceEngine}</p>
                    <p>Outcome: {finding.outcome}</p>
                    <p>Severity: {finding.severity}</p>
                  </li>
                ))}
              </ul>
            </>
          )}
          {state.result.entity && (
            <>
              <h2>Entities</h2>
              <ul>
                {state.result.entity.entities.map((item) => (
                  <li key={`${item.type}:${item.name}`}>
                    <p>Entity Name: {item.name}</p>
                    <p>Entity Type: {item.type}</p>
                    <p>Source Location: {item.sourceLocation}</p>
                    <p>Confidence: {item.confidence}</p>
                  </li>
                ))}
              </ul>
            </>
          )}
          {state.result.knowledgeGraph && (
            <>
              <h2>Knowledge Graph</h2>
              <p>Total Entities: {state.result.knowledgeGraph.totalEntities}</p>
              <p>Total Relationships: {state.result.knowledgeGraph.totalRelationships}</p>
              <p>Entity Types: {state.result.knowledgeGraph.entityTypes.join(', ') || 'None'}</p>
              <p>Relationship Types: {state.result.knowledgeGraph.relationshipTypes.join(', ') || 'None'}</p>
            </>
          )}
          {state.result.aiVisibility && (
            <>
              <h2>AI Visibility</h2>
              <p>Overall Status: {state.result.aiVisibility.status}</p>
              <p>Graph Completeness: {state.result.aiVisibility.graphCompleteness}</p>
              <p>Entity Coverage: {state.result.aiVisibility.entityCoverage}</p>
              <p>Relationship Coverage: {state.result.aiVisibility.relationshipCoverage}</p>
              <p>Assessed At: {state.result.aiVisibility.assessedAt}</p>
            </>
          )}
          {state.result.recommendation && (
            <>
              <h2>Recommendations</h2>
              <ul>
                {state.result.recommendation.recommendations.map((item) => (
                  <li key={item.title + item.relatedFindingIds.join(',')}>
                    <p>Title: {item.title}</p>
                    <p>Rationale: {item.rationale}</p>
                    <p>Priority: {item.priority}</p>
                    <p>Related Findings: {item.relatedFindingIds.join(', ') || 'None'}</p>
                    <p>Status: {item.status}</p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {state.error && <p>{state.error}</p>}
    </main>
  );
}
