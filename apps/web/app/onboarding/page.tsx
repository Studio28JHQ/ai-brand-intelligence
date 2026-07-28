import { OnboardingWizard } from './onboarding-wizard';
import { Breadcrumbs, PageHeader } from '../components/ui';
import { getTranslations } from '../../lib/i18n/server';

export default async function OnboardingPage() {
  const t = await getTranslations('onboarding');
  const tNav = await getTranslations('navigation');

  return (
    <main className="page">
      <Breadcrumbs items={[{ label: tNav('dashboard'), href: '/workspace' }, { label: t('title') }]} />

      <PageHeader title={t('title')} description={t('description')} />

      <OnboardingWizard />
    </main>
  );
}
