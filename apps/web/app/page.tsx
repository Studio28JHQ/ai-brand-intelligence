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
import { DailyBriefing } from './daily-briefing';
import { Badge, Banner, Card, EmptyState, PageHeader, SkeletonBlock } from './components/ui';

const initialState: CreateAuditState = {};

function shortId(id: string): string {
  return id.slice(0, 8);
}

export default function Home() {
  const [state, formAction, pending] = useActionState(createAudit, initialState);
  const [audits, setAudits] = useState<AuditMetadata[]>([]);
  const [projects, setProjects] = useState<ProjectMetadata[]>([]);
  const [clients, setClients] = useState<ClientMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [compareTargets, setCompareTargets] = useState<Record<string, string>>({});
  const [comparisons, setComparisons] = useState<Record<string, AuditComparisonResult | null>>({});
  const [clientFormError, setClientFormError] = useState<string | undefined>(undefined);
  const [clientCreatedMessage, setClientCreatedMessage] = useState<string | undefined>(undefined);
  const [baselineMessage, setBaselineMessage] = useState<string | undefined>(undefined);

  const refresh = () => {
    Promise.all([listAudits(), listProjects(), listClients()]).then(([nextAudits, nextProjects, nextClients]) => {
      setAudits(nextAudits);
      setProjects(nextProjects);
      setClients(nextClients);
      setLoading(false);
    });
  };

  useEffect(refresh, [state.result]);

  const handleSetBaseline = async (projectId: string, auditId: string) => {
    const success = await setProjectBaseline(projectId, auditId);
    setBaselineMessage(success ? `Baseline set to Audit ${shortId(auditId)}.` : 'Failed to set baseline.');
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
    setClientCreatedMessage(error ? undefined : `Client "${name}" created.`);
    if (!error) {
      refresh();
    }
  };

  return (
    <main className="page">
      <PageHeader
        title="Audit Workspace"
        description="Audit your Clients' websites, track Optimization progress, and review AI Visibility outcomes."
      />

      <DailyBriefing />

      {loading && (
        <Card title="Clients">
          <SkeletonBlock lines={4} />
        </Card>
      )}

      {!loading && clients.length === 0 && projects.length === 0 && (
        <EmptyState
          title="Welcome to your workspace"
          description="Paste a URL below and click Analyze to run your first Audit — a Client and Project are created for you automatically. Or create a Client explicitly first if you want to group multiple Projects under one customer."
        />
      )}

      <Card title="Run a New Audit">
        <form action={formAction} className="form-row">
          <div className="field" style={{ flex: '1 1 260px' }}>
            <label htmlFor="audit-url">Website URL</label>
            <input className="input" id="audit-url" type="url" name="url" placeholder="https://example.com" required />
          </div>
          <div className="field" style={{ flex: '1 1 200px' }}>
            <label htmlFor="audit-client">Client</label>
            <select className="select" id="audit-client" name="clientId" defaultValue="">
              <option value="">Auto-create client from URL</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary" type="submit" disabled={pending}>
            {pending ? 'Analyzing…' : 'Analyze'}
          </button>
        </form>
        {state.error && <Banner variant="error">{state.error}</Banner>}
      </Card>

      <Card title="Add a Client">
        <form action={handleCreateClient} className="form-row">
          <div className="field" style={{ flex: '1 1 180px' }}>
            <label htmlFor="client-name">Client name</label>
            <input className="input" id="client-name" type="text" name="name" placeholder="Acme Digital" required />
          </div>
          <div className="field" style={{ flex: '1 1 140px' }}>
            <label htmlFor="client-industry">Industry</label>
            <input className="input" id="client-industry" type="text" name="industry" placeholder="Retail" required />
          </div>
          <div className="field" style={{ flex: '1 1 180px' }}>
            <label htmlFor="client-domain">Primary domain</label>
            <input className="input" id="client-domain" type="text" name="primaryDomain" placeholder="example.com" required />
          </div>
          <button className="btn btn-secondary" type="submit">
            Create Client
          </button>
        </form>
        {clientFormError && <Banner variant="error">{clientFormError}</Banner>}
        {clientCreatedMessage && <Banner variant="success">{clientCreatedMessage}</Banner>}
      </Card>

      <section className="section">
        <h2 className="section__title">Clients</h2>
        {baselineMessage && <Banner variant="success">{baselineMessage}</Banner>}
        {!loading && clients.length === 0 && <EmptyState title="No Clients yet" />}

        {clients.map((client) => {
          const clientProjects = projects.filter((project) => project.clientId === client.id);
          return (
            <Card key={client.id}>
              <div className="card__header">
                <div>
                  <h3>{client.name}</h3>
                  <p className="text-secondary">
                    {client.industry} · {client.primaryDomain}
                  </p>
                </div>
                <Badge>{client.status}</Badge>
              </div>

              <div className="stack">
                <h4>Projects</h4>
                {clientProjects.length === 0 && <EmptyState title="No Projects for this Client yet" />}

                {clientProjects.map((project) => {
                  const projectAudits = audits.filter((audit) => audit.projectId === project.id);
                  const comparableAudits = projectAudits.filter(
                    (audit) => audit.status === 'completed' && audit.id !== project.baselineAuditId,
                  );
                  const comparison = comparisons[project.id];

                  return (
                    <Card key={project.id} muted>
                      <div className="card__header">
                        <div>
                          <h4>{project.name}</h4>
                          <p className="text-secondary">{project.canonicalWebsite}</p>
                        </div>
                        <Link href={`/projects/${project.id}/dashboard`} className="btn btn-secondary btn-sm">
                          Open Dashboard
                        </Link>
                      </div>

                      <dl className="dl">
                        <dt>Baseline</dt>
                        <dd>
                          {project.baselineAuditId ? (
                            <Badge variant="success">Set</Badge>
                          ) : (
                            <Badge variant="neutral">Not set</Badge>
                          )}
                          {project.baselineSetAt && <span className="text-tertiary"> · {project.baselineSetAt}</span>}
                        </dd>
                      </dl>

                      <div className="section">
                        <h5>Audits</h5>
                        {projectAudits.length === 0 && <EmptyState title="No Audits yet" />}
                        {projectAudits.length > 0 && (
                          <div className="table-wrapper">
                            <table className="table">
                              <thead>
                                <tr>
                                  <th>Audit</th>
                                  <th>Status</th>
                                  <th>AI Visibility</th>
                                  <th>Completed</th>
                                  <th>
                                    <span className="visually-hidden">Actions</span>
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {projectAudits.map((audit) => (
                                  <tr key={audit.id}>
                                    <td>
                                      <Link href={`/audits/${audit.id}`}>{shortId(audit.id)}</Link>
                                      <div className="text-tertiary text-mono">{audit.url}</div>
                                      {audit.executionHistory.length > 0 && (
                                        <details>
                                          <summary className="text-secondary">Execution Timeline</summary>
                                          <ul className="stack-sm">
                                            {audit.executionHistory.map((record, index) => (
                                              <li key={`${record.stepId}-${index}`} className="text-secondary">
                                                {record.stepId}: {record.status}
                                                {record.errorMessage ? ` (${record.errorCode}: ${record.errorMessage})` : ''}
                                              </li>
                                            ))}
                                          </ul>
                                        </details>
                                      )}
                                    </td>
                                    <td>
                                      <Badge>{audit.status}</Badge>
                                    </td>
                                    <td>{audit.aiVisibilityStatus ? <Badge>{audit.aiVisibilityStatus}</Badge> : '—'}</td>
                                    <td>{audit.completedAt ?? '—'}</td>
                                    <td>
                                      {audit.status === 'completed' &&
                                        (project.baselineAuditId === audit.id ? (
                                          <Badge variant="primary">Current Baseline</Badge>
                                        ) : (
                                          <button
                                            type="button"
                                            className="btn btn-ghost btn-sm"
                                            onClick={() => handleSetBaseline(project.id, audit.id)}
                                          >
                                            Set as Baseline
                                          </button>
                                        ))}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                      {project.baselineAuditId && (
                        <div className="section">
                          <h5>Compare to Baseline</h5>
                          <div className="form-row">
                            <div className="field" style={{ flex: '1 1 260px' }}>
                              <label htmlFor={`compare-${project.id}`}>Compare against</label>
                              <select
                                className="select"
                                id={`compare-${project.id}`}
                                value={compareTargets[project.id] ?? ''}
                                onChange={(event) =>
                                  setCompareTargets((prev) => ({ ...prev, [project.id]: event.target.value }))
                                }
                              >
                                <option value="">Select an Audit to compare</option>
                                {comparableAudits.map((audit) => (
                                  <option key={audit.id} value={audit.id}>
                                    {shortId(audit.id)} ({audit.url})
                                  </option>
                                ))}
                              </select>
                            </div>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              disabled={!compareTargets[project.id]}
                              onClick={() => handleCompare(project.id, project.baselineAuditId as string)}
                            >
                              Compare
                            </button>
                          </div>

                          {comparison && (
                            <div className="grid-2">
                              <Card muted title="Findings">
                                <dl className="dl">
                                  <dt>New</dt>
                                  <dd>{comparison.findings.newFindings.length}</dd>
                                  <dt>Resolved</dt>
                                  <dd>{comparison.findings.resolvedFindings.length}</dd>
                                  <dt>Unchanged</dt>
                                  <dd>{comparison.findings.unchangedFindings.length}</dd>
                                </dl>
                              </Card>
                              <Card muted title="Entities">
                                <dl className="dl">
                                  <dt>Added</dt>
                                  <dd>{comparison.entities.added.length}</dd>
                                  <dt>Removed</dt>
                                  <dd>{comparison.entities.removed.length}</dd>
                                  <dt>Unchanged</dt>
                                  <dd>{comparison.entities.unchanged.length}</dd>
                                </dl>
                              </Card>
                              <Card muted title="AI Visibility">
                                <dl className="dl">
                                  <dt>Status</dt>
                                  <dd>
                                    <Badge>{comparison.aiVisibility.baselineStatus}</Badge> →{' '}
                                    <Badge>{comparison.aiVisibility.targetStatus}</Badge>
                                  </dd>
                                  <dt>Graph Completeness</dt>
                                  <dd>
                                    {comparison.aiVisibility.baselineGraphCompleteness} →{' '}
                                    {comparison.aiVisibility.targetGraphCompleteness}
                                  </dd>
                                  <dt>Entity Coverage</dt>
                                  <dd>
                                    {comparison.aiVisibility.baselineEntityCoverage} →{' '}
                                    {comparison.aiVisibility.targetEntityCoverage}
                                  </dd>
                                  <dt>Relationship Coverage</dt>
                                  <dd>
                                    {comparison.aiVisibility.baselineRelationshipCoverage} →{' '}
                                    {comparison.aiVisibility.targetRelationshipCoverage}
                                  </dd>
                                </dl>
                              </Card>
                              <Card muted title="Missing Signals">
                                <dl className="dl">
                                  <dt>New</dt>
                                  <dd>{comparison.aiVisibility.newMissingSignals.join(', ') || 'None'}</dd>
                                  <dt>Resolved</dt>
                                  <dd>{comparison.aiVisibility.resolvedMissingSignals.join(', ') || 'None'}</dd>
                                </dl>
                              </Card>
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </section>

      {state.result && (
        <Card title="Audit Created">
          <div className="cluster">
            <Badge>{state.result.status}</Badge>
            <span className="text-tertiary text-mono">{state.result.id}</span>
          </div>

          {state.result.progress && (
            <div className="section">
              <h3>Workflow Progress</h3>
              <dl className="dl">
                <dt>Overall Progress</dt>
                <dd>
                  {Math.round(
                    (state.result.progress.filter((step) => step.status === 'success').length /
                      state.result.progress.length) *
                      100,
                  )}
                  %
                </dd>
              </dl>
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Step</th>
                      <th>Status</th>
                      <th>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.result.progress.map((step) => (
                      <tr key={step.stepId}>
                        <td>{step.stepId}</td>
                        <td>
                          <Badge>{step.status}</Badge>
                        </td>
                        <td>{step.durationMs}ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {state.result.discovery && (
            <div className="section">
              <h3>Discovery</h3>
              <dl className="dl">
                <dt>Normalized URL</dt>
                <dd>{state.result.discovery.normalizedUrl}</dd>
                <dt>robots.txt detected</dt>
                <dd>{state.result.discovery.robotsTxtDetected ? 'Yes' : 'No'}</dd>
                <dt>sitemap.xml detected</dt>
                <dd>{state.result.discovery.sitemapDetected ? 'Yes' : 'No'}</dd>
              </dl>
            </div>
          )}

          {state.result.crawl && (
            <div className="section">
              <h3>Crawl</h3>
              <dl className="dl">
                <dt>HTTP Status</dt>
                <dd>{state.result.crawl.httpStatus}</dd>
                <dt>Final URL</dt>
                <dd>{state.result.crawl.finalUrl}</dd>
                <dt>HTML Size</dt>
                <dd>{state.result.crawl.htmlSizeBytes} bytes</dd>
                <dt>Success</dt>
                <dd>{state.result.crawl.success ? 'Yes' : 'No'}</dd>
              </dl>
            </div>
          )}

          {state.result.inventory && (
            <div className="section">
              <h3>Page Inventory</h3>
              <dl className="dl">
                <dt>Title</dt>
                <dd>{state.result.inventory.title ?? 'N/A'}</dd>
                <dt>Canonical URL</dt>
                <dd>{state.result.inventory.canonicalUrl ?? 'N/A'}</dd>
                <dt>Language</dt>
                <dd>{state.result.inventory.language ?? 'N/A'}</dd>
                <dt>H1 Count</dt>
                <dd>{state.result.inventory.h1Count}</dd>
                <dt>Internal / External Links</dt>
                <dd>
                  {state.result.inventory.internalLinkCount} / {state.result.inventory.externalLinkCount}
                </dd>
              </dl>
            </div>
          )}

          {state.result.entity && (
            <div className="section">
              <h3>Entities</h3>
              {state.result.entity.entities.length === 0 && <EmptyState title="No Entities detected" />}
              {state.result.entity.entities.length > 0 && (
                <div className="table-wrapper">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Source Location</th>
                        <th>Confidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.result.entity.entities.map((item) => (
                        <tr key={`${item.type}:${item.name}`}>
                          <td>{item.name}</td>
                          <td>{item.type}</td>
                          <td>{item.sourceLocation}</td>
                          <td>{item.confidence}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {state.result.knowledgeGraph && (
            <div className="section">
              <h3>Knowledge Graph</h3>
              <dl className="dl">
                <dt>Total Entities</dt>
                <dd>{state.result.knowledgeGraph.totalEntities}</dd>
                <dt>Total Relationships</dt>
                <dd>{state.result.knowledgeGraph.totalRelationships}</dd>
                <dt>Entity Types</dt>
                <dd>{state.result.knowledgeGraph.entityTypes.join(', ') || 'None'}</dd>
                <dt>Relationship Types</dt>
                <dd>{state.result.knowledgeGraph.relationshipTypes.join(', ') || 'None'}</dd>
              </dl>
            </div>
          )}

          {state.result.executionHistory && (
            <div className="section">
              <h3>Execution Timeline</h3>
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Step</th>
                      <th>Status</th>
                      <th>Duration</th>
                      <th>Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.result.executionHistory.map((record, index) => (
                      <tr key={`${record.stepId}-${index}`}>
                        <td>{record.stepId}</td>
                        <td>
                          <Badge>{record.status}</Badge>
                        </td>
                        <td>{record.durationMs}ms</td>
                        <td>{record.errorMessage ? `${record.errorCode}: ${record.errorMessage}` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {state.result.aiVisibility && (
            <div className="section">
              <h3>AI Visibility</h3>
              <dl className="dl">
                <dt>Status</dt>
                <dd>
                  <Badge>{state.result.aiVisibility.status}</Badge>
                </dd>
                <dt>Graph Completeness</dt>
                <dd>{state.result.aiVisibility.graphCompleteness}</dd>
                <dt>Entity Coverage</dt>
                <dd>{state.result.aiVisibility.entityCoverage}</dd>
              </dl>
            </div>
          )}

          {state.result.analysis && (
            <div className="section">
              <h3>Findings</h3>
              {state.result.analysis.findings.length === 0 && <EmptyState title="No Findings for this Audit" />}
              {state.result.analysis.findings.length > 0 && (
                <div className="table-wrapper">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Rule</th>
                        <th>Category</th>
                        <th>Outcome</th>
                        <th>Severity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.result.analysis.findings.map((finding) => (
                        <tr key={finding.id}>
                          <td>{finding.ruleId}</td>
                          <td>{finding.category}</td>
                          <td>
                            <Badge>{finding.outcome}</Badge>
                          </td>
                          <td>
                            <Badge>{finding.severity}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {state.result.optimizationPlan && (
            <div className="section">
              <h3>Optimization Plan</h3>
              {state.result.optimizationPlan.items.length === 0 && <EmptyState title="No Optimization Items" />}
              {state.result.optimizationPlan.items.map((item) => (
                <Card key={item.title + item.supportingFindingIds.join(',')} muted>
                  <div className="card__header">
                    <h4>{item.title}</h4>
                    <Badge>{item.priority}</Badge>
                  </div>
                  <p>{item.description}</p>
                  <p className="text-secondary">{item.rationale}</p>
                  <dl className="dl">
                    <dt>Expected Impact</dt>
                    <dd>{item.expectedImpact}</dd>
                    <dt>Estimated Effort</dt>
                    <dd>{item.estimatedEffort}</dd>
                    <dt>Optimization Rule</dt>
                    <dd>
                      {item.optimizationRuleId} (v{item.optimizationRuleVersion})
                    </dd>
                  </dl>
                  <details>
                    <summary>Reasoning</summary>
                    <dl className="dl">
                      <dt>Confidence</dt>
                      <dd>{item.reasoning.confidence}</dd>
                      <dt>Expected Outcome</dt>
                      <dd>
                        {item.reasoning.expectedOutcome.impactLevel} impact on{' '}
                        {item.reasoning.expectedOutcome.targetDimension}
                      </dd>
                      <dt>Evidence</dt>
                      <dd>
                        {item.reasoning.evidence.map((entry) => `${entry.field}=${entry.value}`).join(', ') || 'None'}
                      </dd>
                    </dl>
                  </details>
                </Card>
              ))}
            </div>
          )}
        </Card>
      )}
    </main>
  );
}
