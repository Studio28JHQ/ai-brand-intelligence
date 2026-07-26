'use client';

import { useActionState, useEffect, useState } from 'react';
import Link from 'next/link';
import type { AuditComparisonResult, AuditMetadata, ClientMetadata, ProjectMetadata } from '@ai-visibility/contracts';
import {
  compareAudits,
  createAudit,
  createClient,
  CreateAuditState,
  listAudits,
  listClients,
  listProjects,
  setProjectBaseline,
} from './actions';

const initialState: CreateAuditState = {};

export default function Home() {
  const [state, formAction, pending] = useActionState(createAudit, initialState);
  const [audits, setAudits] = useState<AuditMetadata[]>([]);
  const [projects, setProjects] = useState<ProjectMetadata[]>([]);
  const [clients, setClients] = useState<ClientMetadata[]>([]);
  const [compareTargets, setCompareTargets] = useState<Record<string, string>>({});
  const [comparisons, setComparisons] = useState<Record<string, AuditComparisonResult | null>>({});
  const [clientFormError, setClientFormError] = useState<string | undefined>(undefined);

  const refresh = () => {
    listAudits().then(setAudits);
    listProjects().then(setProjects);
    listClients().then(setClients);
  };

  useEffect(refresh, [state.result]);

  const handleSetBaseline = async (projectId: string, auditId: string) => {
    await setProjectBaseline(projectId, auditId);
    refresh();
  };

  const handleCompare = async (projectId: string, baselineAuditId: string) => {
    const targetAuditId = compareTargets[projectId];
    if (!targetAuditId) {
      return;
    }
    const result = await compareAudits(baselineAuditId, targetAuditId);
    setComparisons((prev) => ({ ...prev, [projectId]: result }));
  };

  const handleCreateClient = async (formData: FormData) => {
    const name = formData.get('name');
    const industry = formData.get('industry');
    const primaryDomain = formData.get('primaryDomain');

    if (typeof name !== 'string' || typeof industry !== 'string' || typeof primaryDomain !== 'string') {
      return;
    }

    const { error } = await createClient(name, industry, primaryDomain);
    setClientFormError(error);
    if (!error) {
      refresh();
    }
  };

  return (
    <main>
      <h1>Audit Workspace</h1>

      <form action={formAction}>
        <input type="url" name="url" placeholder="https://example.com" required />
        <select name="clientId" defaultValue="">
          <option value="">Auto-create client from URL</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
        <button type="submit" disabled={pending}>
          Analyze
        </button>
      </form>

      <section>
        <h2>New Client</h2>
        <form action={handleCreateClient}>
          <input type="text" name="name" placeholder="Client name" required />
          <input type="text" name="industry" placeholder="Industry" required />
          <input type="text" name="primaryDomain" placeholder="example.com" required />
          <button type="submit">Create Client</button>
        </form>
        {clientFormError && <p>{clientFormError}</p>}
      </section>

      <section>
        <h2>Clients</h2>
        {clients.map((client) => (
          <div key={client.id}>
            <h3>{client.name}</h3>
            <p>Client ID: {client.id}</p>
            <p>Industry: {client.industry}</p>
            <p>Primary Domain: {client.primaryDomain}</p>
            <p>Status: {client.status}</p>
            <p>Created At: {client.createdAt}</p>

            <h4>Projects</h4>
            {projects
              .filter((project) => project.clientId === client.id)
              .map((project) => (
                <div key={project.id}>
                  <h5>{project.name}</h5>
                  <p>Project ID: {project.id}</p>
                  <p>Canonical Website: {project.canonicalWebsite}</p>
                  <p>Created At: {project.createdAt}</p>
                  <p>Last Audit: {project.lastAuditId ?? 'N/A'}</p>
                  <p>Current Baseline: {project.baselineAuditId ?? 'N/A'}</p>
                  <p>Baseline Set At: {project.baselineSetAt ?? 'N/A'}</p>
                  <p>Baseline Status: {project.baselineAuditId ? 'Set' : 'Not Set'}</p>
                  <p>
                    <Link href={`/projects/${project.id}/dashboard`}>Open Dashboard</Link>
                  </p>
                  <ul>
                    {audits
                      .filter((audit) => audit.projectId === project.id)
                      .map((audit) => (
                        <li key={audit.id}>
                          <p>Audit ID: {audit.id}</p>
                          <p>URL: {audit.url}</p>
                          <p>Status: {audit.status}</p>
                          <p>Started At: {audit.startedAt ?? 'N/A'}</p>
                          <p>Completed At: {audit.completedAt ?? 'N/A'}</p>
                          <p>Latest AI Visibility Status: {audit.aiVisibilityStatus ?? 'N/A'}</p>
                          <p>
                            <Link href={`/audits/${audit.id}`}>Open</Link>
                          </p>
                          {audit.status === 'completed' && (
                            <p>
                              {project.baselineAuditId === audit.id ? (
                                'Current Baseline'
                              ) : (
                                <button type="button" onClick={() => handleSetBaseline(project.id, audit.id)}>
                                  Set as Baseline
                                </button>
                              )}
                            </p>
                          )}
                          {audit.executionHistory.length > 0 && (
                            <>
                              <p>Execution Timeline:</p>
                              <ul>
                                {audit.executionHistory.map((record, index) => (
                                  <li key={`${record.stepId}-${index}`}>
                                    <p>
                                      {record.stepId}: {record.status}
                                      {record.errorMessage ? ` (${record.errorCode}: ${record.errorMessage})` : ''}
                                    </p>
                                  </li>
                                ))}
                              </ul>
                            </>
                          )}
                        </li>
                      ))}
                  </ul>

                  {project.baselineAuditId && (
                    <div>
                      <h6>Compare to Baseline</h6>
                      <p>Baseline Audit: {project.baselineAuditId}</p>
                      <select
                        value={compareTargets[project.id] ?? ''}
                        onChange={(event) =>
                          setCompareTargets((prev) => ({ ...prev, [project.id]: event.target.value }))
                        }
                      >
                        <option value="">Select an audit to compare</option>
                        {audits
                          .filter(
                            (audit) =>
                              audit.projectId === project.id &&
                              audit.status === 'completed' &&
                              audit.id !== project.baselineAuditId,
                          )
                          .map((audit) => (
                            <option key={audit.id} value={audit.id}>
                              {audit.id} ({audit.url})
                            </option>
                          ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleCompare(project.id, project.baselineAuditId as string)}
                      >
                        Compare
                      </button>

                      {comparisons[project.id] && (
                        <div>
                          <p>Baseline Audit: {comparisons[project.id]?.baselineAuditId}</p>
                          <p>Compared Audit: {comparisons[project.id]?.targetAuditId}</p>

                          <h6>Findings</h6>
                          <p>New: {comparisons[project.id]?.findings.newFindings.length}</p>
                          <ul>
                            {comparisons[project.id]?.findings.newFindings.map((entry) => (
                              <li key={`new-${entry.ruleId}`}>{entry.ruleId} ({entry.category})</li>
                            ))}
                          </ul>
                          <p>Resolved: {comparisons[project.id]?.findings.resolvedFindings.length}</p>
                          <ul>
                            {comparisons[project.id]?.findings.resolvedFindings.map((entry) => (
                              <li key={`resolved-${entry.ruleId}`}>{entry.ruleId} ({entry.category})</li>
                            ))}
                          </ul>
                          <p>Unchanged: {comparisons[project.id]?.findings.unchangedFindings.length}</p>

                          <h6>Entities</h6>
                          <p>Added: {comparisons[project.id]?.entities.added.length}</p>
                          <ul>
                            {comparisons[project.id]?.entities.added.map((entry) => (
                              <li key={`added-${entry.type}-${entry.name}`}>{entry.name} ({entry.type})</li>
                            ))}
                          </ul>
                          <p>Removed: {comparisons[project.id]?.entities.removed.length}</p>
                          <ul>
                            {comparisons[project.id]?.entities.removed.map((entry) => (
                              <li key={`removed-${entry.type}-${entry.name}`}>{entry.name} ({entry.type})</li>
                            ))}
                          </ul>
                          <p>Unchanged: {comparisons[project.id]?.entities.unchanged.length}</p>

                          <h6>AI Visibility</h6>
                          <p>
                            Status: {comparisons[project.id]?.aiVisibility.baselineStatus} →{' '}
                            {comparisons[project.id]?.aiVisibility.targetStatus}
                            {comparisons[project.id]?.aiVisibility.statusChanged ? ' (changed)' : ' (unchanged)'}
                          </p>
                          <p>
                            Graph Completeness: {comparisons[project.id]?.aiVisibility.baselineGraphCompleteness} →{' '}
                            {comparisons[project.id]?.aiVisibility.targetGraphCompleteness}
                          </p>
                          <p>
                            Entity Coverage: {comparisons[project.id]?.aiVisibility.baselineEntityCoverage} →{' '}
                            {comparisons[project.id]?.aiVisibility.targetEntityCoverage}
                          </p>
                          <p>
                            Relationship Coverage: {comparisons[project.id]?.aiVisibility.baselineRelationshipCoverage}{' '}
                            → {comparisons[project.id]?.aiVisibility.targetRelationshipCoverage}
                          </p>
                          <p>
                            New Missing Signals:{' '}
                            {comparisons[project.id]?.aiVisibility.newMissingSignals.join(', ') || 'None'}
                          </p>
                          <p>
                            Resolved Missing Signals:{' '}
                            {comparisons[project.id]?.aiVisibility.resolvedMissingSignals.join(', ') || 'None'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
          </div>
        ))}
      </section>

      {state.result && (
        <div>
          <h2>Audit Created</h2>
          <p>Audit ID: {state.result.id}</p>
          <p>Current Status: {state.result.status}</p>
          {state.result.progress && (
            <>
              <h2>Workflow Progress</h2>
              <p>Current Step: {state.result.progress.at(-1)?.stepId ?? 'N/A'}</p>
              <p>Completed Steps: {state.result.progress.filter((step) => step.status === 'success').length}</p>
              <p>
                Remaining Steps:{' '}
                {state.result.progress.length - state.result.progress.filter((step) => step.status === 'success').length}
              </p>
              <p>
                Overall Progress:{' '}
                {Math.round(
                  (state.result.progress.filter((step) => step.status === 'success').length /
                    state.result.progress.length) *
                    100,
                )}
                %
              </p>
              <ul>
                {state.result.progress.map((step) => (
                  <li key={step.stepId}>
                    <p>Step: {step.stepId}</p>
                    <p>Status: {step.status}</p>
                    <p>Started At: {step.startedAt}</p>
                    <p>Completed At: {step.completedAt}</p>
                    <p>Duration: {step.durationMs}ms</p>
                  </li>
                ))}
              </ul>
            </>
          )}
          {state.result.executionHistory && (
            <>
              <h2>Execution Timeline</h2>
              <ul>
                {state.result.executionHistory.map((record, index) => (
                  <li key={`${record.stepId}-${index}`}>
                    <p>Step: {record.stepId}</p>
                    <p>Status: {record.status}</p>
                    <p>Started At: {record.startedAt}</p>
                    <p>Completed At: {record.completedAt}</p>
                    <p>Duration: {record.durationMs}ms</p>
                    {record.errorCode && <p>Error Code: {record.errorCode}</p>}
                    {record.errorMessage && <p>Error Message: {record.errorMessage}</p>}
                  </li>
                ))}
              </ul>
            </>
          )}
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
              <p>Rule Set Version: {state.result.analysis.ruleSetVersion}</p>
              <ul>
                {state.result.analysis.findings.map((finding) => (
                  <li key={finding.id}>
                    <p>Category: {finding.category}</p>
                    <p>Finding ID: {finding.id}</p>
                    <p>Rule: {finding.ruleId}</p>
                    <p>Rule Version: {finding.ruleVersion}</p>
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
          {state.result.optimizationPlan && (
            <>
              <h2>Optimization Plan</h2>
              <ul>
                {state.result.optimizationPlan.items.map((item) => (
                  <li key={item.title + item.supportingFindingIds.join(',')}>
                    <p>Title: {item.title}</p>
                    <p>Description: {item.description}</p>
                    <p>Business Rationale: {item.rationale}</p>
                    <p>Priority: {item.priority}</p>
                    <p>Expected Impact: {item.expectedImpact}</p>
                    <p>Estimated Effort: {item.estimatedEffort}</p>
                    <p>Supporting Findings: {item.supportingFindingIds.join(', ') || 'None'}</p>
                    <p>Status: {item.status}</p>
                    <p>
                      Optimization Rule: {item.optimizationRuleId} (v{item.optimizationRuleVersion})
                    </p>
                    <details>
                      <summary>Reasoning</summary>
                      <p>Confidence: {item.reasoning.confidence}</p>
                      <p>
                        Expected Outcome: {item.reasoning.expectedOutcome.impactLevel} impact on{' '}
                        {item.reasoning.expectedOutcome.targetDimension}
                      </p>
                      <p>
                        Evidence:{' '}
                        {item.reasoning.evidence.map((entry) => `${entry.field}=${entry.value}`).join(', ') || 'None'}
                      </p>
                      <p>
                        Assumptions: {item.reasoning.assumptions.map((assumption) => assumption.code).join(', ')}
                      </p>
                    </details>
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
