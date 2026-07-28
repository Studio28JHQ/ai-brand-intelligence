import { getCurrentUser } from '../../auth-actions';
import { getLocale, getTranslations } from '../../../lib/i18n/server';
import { Badge, Breadcrumbs, Card, EmptyState, PageHeader } from '../../components/ui';
import { LanguageSettings } from './language-settings';

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const t = await getTranslations('settings');
  const tNav = await getTranslations('navigation');
  const tCommon = await getTranslations('common');
  const initialLocale = user?.locale ?? (await getLocale());

  return (
    <main className="page">
      <Breadcrumbs items={[{ label: tNav('dashboard'), href: '/workspace' }, { label: tNav('settings') }]} />
      <PageHeader title={t('title')} description={t('description')} />

      <Card title={t('accountSettings')}>
        {user && (
          <dl className="dl">
            <dt>{t('nameLabel')}</dt>
            <dd>
              {user.firstName} {user.lastName}
            </dd>
            <dt>{t('emailLabel')}</dt>
            <dd>{user.email}</dd>
            <dt>{tCommon('status')}</dt>
            <dd>
              <Badge variant={user.status === 'verified' ? 'success' : 'warning'}>
                {tCommon(`statusValues.${user.status}`)}
              </Badge>
            </dd>
          </dl>
        )}
      </Card>

      <Card title={t('languageRegionTitle')} description={t('languageDescription')}>
        <LanguageSettings initialLocale={initialLocale} label={t('language')} />
      </Card>

      <Card title={t('workspaceSettings')}>
        <EmptyState title={t('workspaceNotAvailableTitle')} description={t('workspaceNotAvailableDescription')} />
      </Card>
    </main>
  );
}
