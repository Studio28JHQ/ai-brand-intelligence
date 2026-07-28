import { getCurrentUser } from '../../auth-actions';
import { getLocale, getTranslations } from '../../../lib/i18n/server';
import { Badge, Breadcrumbs, Card, EmptyState, PageHeader } from '../../components/ui';
import { LanguageSettings } from './language-settings';

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const t = await getTranslations('settings');
  const initialLocale = user?.locale ?? (await getLocale());

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

      <Card title="Language & Region" description={t('languageDescription')}>
        <LanguageSettings initialLocale={initialLocale} label={t('language')} />
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
