import Link from 'next/link';
import { getLatestCampaign, listProjects } from '../../actions';
import { Badge, Breadcrumbs, Card, EmptyState, PageHeader, statusToVariant } from '../../components/ui';
import { getTranslations } from '../../../lib/i18n/server';

export default async function OptimizationPage() {
  const projects = await listProjects();
  const campaigns = await Promise.all(
    projects.map(async (project) => ({ project, campaign: await getLatestCampaign(project.id) })),
  );
  const withCampaigns = campaigns.filter((entry) => entry.campaign !== null);
  const t = await getTranslations('optimization');
  const tNav = await getTranslations('navigation');
  const tCommon = await getTranslations('common');

  return (
    <main className="page">
      <Breadcrumbs items={[{ label: tNav('dashboard'), href: '/workspace' }, { label: tNav('optimization') }]} />
      <PageHeader title={tNav('optimization')} description={t('pageDescription')} />

      {withCampaigns.length === 0 && (
        <EmptyState title={t('noCampaignsYet')} description={t('noCampaignsDescription')} />
      )}

      {withCampaigns.map(({ project, campaign }) => (
        <Card key={project.id}>
          <div className="card__header">
            <div>
              <h3>{project.name}</h3>
              <p className="text-secondary">{project.canonicalWebsite}</p>
            </div>
            <Badge variant={statusToVariant(campaign!.status)}>{tCommon(`statusValues.${campaign!.status}`)}</Badge>
          </div>
          <dl className="dl">
            <dt>{tCommon('actions')}</dt>
            <dd>
              {t('verifiedOfTotal', {
                verified: campaign!.actions.filter((action) => action.status === 'verified').length,
                total: campaign!.actions.length,
              })}
            </dd>
          </dl>
          <Link href={`/projects/${project.id}/campaign`} className="btn btn-secondary btn-sm">
            {t('openCampaign')}
          </Link>
        </Card>
      ))}
    </main>
  );
}
