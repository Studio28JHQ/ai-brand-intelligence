import { OnboardingWizard } from './onboarding-wizard';
import { Breadcrumbs, PageHeader } from '../components/ui';

export default function OnboardingPage() {
  return (
    <main className="page">
      <Breadcrumbs items={[{ label: 'Workspace', href: '/workspace' }, { label: 'Get Started' }]} />

      <PageHeader title="Get Started" description="Set up your agency and run your first AI Visibility Audit." />

      <OnboardingWizard />
    </main>
  );
}
