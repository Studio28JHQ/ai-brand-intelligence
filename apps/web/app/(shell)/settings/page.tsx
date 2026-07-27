import { getCurrentUser } from '../../auth-actions';
import { Badge, Breadcrumbs, Card, EmptyState, PageHeader } from '../../components/ui';

export default async function SettingsPage() {
  const user = await getCurrentUser();

  return (
    <main className="page">
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/workspace' }, { label: 'Settings' }]} />
      <PageHeader title="Settings" description="Your account and workspace settings." />

      <Card title="Account Settings">
        {user && (
          <dl className="dl">
            <dt>Name</dt>
            <dd>
              {user.firstName} {user.lastName}
            </dd>
            <dt>Email</dt>
            <dd>{user.email}</dd>
            <dt>Status</dt>
            <dd>
              <Badge variant={user.status === 'verified' ? 'success' : 'warning'}>{user.status}</Badge>
            </dd>
          </dl>
        )}
      </Card>

      <Card title="Workspace Settings">
        <EmptyState
          title="Not available yet"
          description="Workspace-level settings (agency branding, team members, billing) aren't part of this platform yet."
        />
      </Card>
    </main>
  );
}
