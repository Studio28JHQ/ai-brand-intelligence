'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { ClientMetadata, ProjectMetadata } from '@ai-visibility/contracts';
import { createClient, listClients, listProjects } from '../../actions';
import { Badge, Banner, Breadcrumbs, Card, EmptyState, PageHeader, SkeletonBlock } from '../../components/ui';

export default function ClientsPage() {
  const searchParams = useSearchParams();
  const query = (searchParams.get('q') ?? '').trim().toLowerCase();

  const [clients, setClients] = useState<ClientMetadata[]>([]);
  const [projects, setProjects] = useState<ProjectMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState<string | undefined>(undefined);
  const [createdMessage, setCreatedMessage] = useState<string | undefined>(undefined);

  const refresh = () => {
    Promise.all([listClients(), listProjects()]).then(([nextClients, nextProjects]) => {
      setClients(nextClients);
      setProjects(nextProjects);
      setLoading(false);
    });
  };

  useEffect(refresh, []);

  const handleCreateClient = async (formData: FormData) => {
    const name = formData.get('name');
    const industry = formData.get('industry');
    const primaryDomain = formData.get('primaryDomain');
    if (typeof name !== 'string' || typeof industry !== 'string' || typeof primaryDomain !== 'string') {
      return;
    }

    const { error } = await createClient(name, industry, primaryDomain);
    setFormError(error);
    setCreatedMessage(error ? undefined : `Client "${name}" created.`);
    if (!error) {
      refresh();
    }
  };

  const visibleClients = query ? clients.filter((client) => client.name.toLowerCase().includes(query)) : clients;

  return (
    <main className="page">
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/workspace' }, { label: 'Clients' }]} />
      <PageHeader title="Clients" description="Every agency Client audited on this platform." />

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
        {formError && <Banner variant="error">{formError}</Banner>}
        {createdMessage && <Banner variant="success">{createdMessage}</Banner>}
      </Card>

      {loading && (
        <Card>
          <SkeletonBlock lines={4} />
        </Card>
      )}

      {!loading && visibleClients.length === 0 && (
        <EmptyState title={query ? `No Clients match "${query}"` : 'No Clients yet'} />
      )}

      {!loading && visibleClients.length > 0 && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Industry</th>
                <th>Primary Domain</th>
                <th>Status</th>
                <th>Projects</th>
              </tr>
            </thead>
            <tbody>
              {visibleClients.map((client) => {
                const projectCount = projects.filter((project) => project.clientId === client.id).length;
                return (
                  <tr key={client.id}>
                    <td>{client.name}</td>
                    <td>{client.industry}</td>
                    <td className="text-mono">{client.primaryDomain}</td>
                    <td>
                      <Badge>{client.status}</Badge>
                    </td>
                    <td>
                      <Link href={`/projects?clientId=${client.id}`}>
                        {projectCount} Project{projectCount === 1 ? '' : 's'}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
