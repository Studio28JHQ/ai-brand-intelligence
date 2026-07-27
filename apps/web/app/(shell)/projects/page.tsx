'use client';

import { useActionState, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { ClientMetadata, CreateAuditResponse, ProjectMetadata } from '@ai-visibility/contracts';
import { createAudit, CreateAuditState, listClients, listProjects } from '../../actions';
import { Badge, Banner, Breadcrumbs, Card, EmptyState, PageHeader, SkeletonBlock } from '../../components/ui';

const initialState: CreateAuditState = {};

function AuditResultInspector({ result }: { result: CreateAuditResponse }) {
  return (
    <Card title="Audit Created">
      <div className="cluster">
        <Badge>{result.status}</Badge>
        <span className="text-tertiary text-mono">{result.id}</span>
      </div>

      {result.progress && (
        <div className="section">
          <h3>Workflow Progress</h3>
          <dl className="dl">
            <dt>Overall Progress</dt>
            <dd>
              {Math.round((result.progress.filter((step) => step.status === 'success').length / result.progress.length) * 100)}%
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
                {result.progress.map((step) => (
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

      {result.analysis && (
        <div className="section">
          <h3>Findings</h3>
          {result.analysis.findings.length === 0 && <EmptyState title="No Findings for this Audit" />}
          {result.analysis.findings.length > 0 && (
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
                  {result.analysis.findings.map((finding) => (
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

      {result.optimizationPlan && (
        <div className="section">
          <h3>Optimization Plan</h3>
          {result.optimizationPlan.items.length === 0 && <EmptyState title="No Optimization Items" />}
          {result.optimizationPlan.items.map((item) => (
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
              </dl>
            </Card>
          ))}
        </div>
      )}
    </Card>
  );
}

export default function ProjectsPage() {
  const searchParams = useSearchParams();
  const clientIdFilter = searchParams.get('clientId');

  const [state, formAction, pending] = useActionState(createAudit, initialState);
  const [projects, setProjects] = useState<ProjectMetadata[]>([]);
  const [clients, setClients] = useState<ClientMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    Promise.all([listProjects(), listClients()]).then(([nextProjects, nextClients]) => {
      setProjects(nextProjects);
      setClients(nextClients);
      setLoading(false);
    });
  };

  useEffect(refresh, [state.result]);

  const clientById = new Map(clients.map((client) => [client.id, client]));
  const visibleProjects = clientIdFilter ? projects.filter((project) => project.clientId === clientIdFilter) : projects;
  const filterLabel = clientIdFilter ? clientById.get(clientIdFilter)?.name : undefined;

  return (
    <main className="page">
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/workspace' }, { label: 'Projects' }]} />
      <PageHeader
        title="Projects"
        description={filterLabel ? `Projects for ${filterLabel}.` : "Every Project across your agency's Clients."}
      />

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

      {loading && (
        <Card>
          <SkeletonBlock lines={4} />
        </Card>
      )}

      {!loading && visibleProjects.length === 0 && <EmptyState title="No Projects yet" />}

      {!loading && visibleProjects.length > 0 && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Client</th>
                <th>Website</th>
                <th>Baseline</th>
                <th>
                  <span className="visually-hidden">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleProjects.map((project) => (
                <tr key={project.id}>
                  <td>{project.name}</td>
                  <td>{clientById.get(project.clientId)?.name ?? '—'}</td>
                  <td className="text-mono">{project.canonicalWebsite}</td>
                  <td>
                    {project.baselineAuditId ? (
                      <Badge variant="success">Set</Badge>
                    ) : (
                      <Badge variant="neutral">Not set</Badge>
                    )}
                  </td>
                  <td>
                    <Link href={`/projects/${project.id}/dashboard`} className="btn btn-secondary btn-sm">
                      Open Dashboard
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {state.result && <AuditResultInspector result={state.result} />}
    </main>
  );
}
