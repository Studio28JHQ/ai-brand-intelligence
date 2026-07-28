import type { Metadata } from 'next';
import Link from 'next/link';
import { loadConfig } from '@ai-visibility/config';
import { Badge, Card } from './components/ui';
import { getTranslations } from '../lib/i18n/server';
import type { Translator } from '@ai-visibility/i18n';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('landing');
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    openGraph: {
      title: t('brand'),
      description: t('metaDescription'),
      type: 'website',
    },
  };
}

function buildValuePillars(t: Translator) {
  return [
    { title: t('pillars.measurable.title'), description: t('pillars.measurable.description') },
    { title: t('pillars.explainable.title'), description: t('pillars.explainable.description') },
    { title: t('pillars.actionable.title'), description: t('pillars.actionable.description') },
  ];
}

function buildWorkflowSteps(t: Translator) {
  return [
    { title: t('workflowSteps.audit.title'), description: t('workflowSteps.audit.description') },
    { title: t('workflowSteps.analyze.title'), description: t('workflowSteps.analyze.description') },
    { title: t('workflowSteps.optimize.title'), description: t('workflowSteps.optimize.description') },
    { title: t('workflowSteps.verify.title'), description: t('workflowSteps.verify.description') },
    { title: t('workflowSteps.measureImpact.title'), description: t('workflowSteps.measureImpact.description') },
    {
      title: t('workflowSteps.continuousImprovement.title'),
      description: t('workflowSteps.continuousImprovement.description'),
    },
  ];
}

function buildCapabilities(t: Translator) {
  return [
    { title: t('capabilities.audits.title'), description: t('capabilities.audits.description') },
    { title: t('capabilities.consultant.title'), description: t('capabilities.consultant.description') },
    { title: t('capabilities.campaigns.title'), description: t('capabilities.campaigns.description') },
    { title: t('capabilities.reports.title'), description: t('capabilities.reports.description') },
    { title: t('capabilities.verification.title'), description: t('capabilities.verification.description') },
    { title: t('capabilities.impact.title'), description: t('capabilities.impact.description') },
  ];
}

export default async function LandingPage() {
  const config = loadConfig();
  const t = await getTranslations('landing');

  const valuePillars = buildValuePillars(t);
  const workflowSteps = buildWorkflowSteps(t);
  const capabilities = buildCapabilities(t);

  return (
    <>
      <main className="marketing">
        <section className="hero" id="hero">
          <div className="hero__content">
            <h1>{t('hero.title')}</h1>
            <p className="hero__subheadline">{t('hero.subheadline')}</p>
            <div className="cluster">
              <Link href="/onboarding" className="btn btn-primary">
                {t('startFreeAudit')}
              </Link>
              <Link href="/login" className="btn btn-secondary">
                {t('nav.signIn')}
              </Link>
            </div>
          </div>
        </section>

        <section className="marketing-section" id="product">
          <h2>{t('product.title')}</h2>
          <p className="marketing-section__intro">{t('product.intro')}</p>
          <div className="grid-3">
            {valuePillars.map((pillar) => (
              <Card key={pillar.title} muted>
                <h3>{pillar.title}</h3>
                <p className="text-secondary">{pillar.description}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="marketing-section" id="how-it-works">
          <h2>{t('howItWorks.title')}</h2>
          <p className="marketing-section__intro">{t('howItWorks.intro')}</p>
          <ol className="workflow">
            {workflowSteps.map((step, index) => (
              <li key={step.title} className="workflow__step">
                <span className="workflow__number" aria-hidden="true">
                  {index + 1}
                </span>
                <div>
                  <h3>{step.title}</h3>
                  <p className="text-secondary">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="marketing-section" id="platform">
          <h2>{t('platform.title')}</h2>
          <p className="marketing-section__intro">{t('platform.intro')}</p>
          <div className="grid-3">
            {capabilities.map((capability) => (
              <Card key={capability.title} muted>
                <h3>{capability.title}</h3>
                <p className="text-secondary">{capability.description}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="marketing-section" id="about">
          <h2>{t('about.title')}</h2>
          <div className="marketing-prose">
            <p>{t('about.paragraph1')}</p>
            <p>{t('about.paragraph2')}</p>
          </div>
        </section>

        <section className="marketing-section" id="dashboard-preview">
          <h2>{t('dashboardPreview.title')}</h2>
          <p className="marketing-section__intro">{t('dashboardPreview.intro')}</p>
          <Card>
            <div className="card__header">
              <div>
                <h3>example.com</h3>
                <p className="text-secondary">Acme Digital · {t('dashboardPreview.illustrativeProject')}</p>
              </div>
              <Badge variant="success">{t('dashboardPreview.ready')}</Badge>
            </div>
            <div className="grid-3">
              <div className="preview-stat">
                <p className="text-tertiary">{t('dashboardPreview.baseline')}</p>
                <Badge variant="success">{t('dashboardPreview.set')}</Badge>
              </div>
              <div className="preview-stat">
                <p className="text-tertiary">{t('dashboardPreview.optimizationCycle')}</p>
                <Badge variant="primary">{t('dashboardPreview.verification')}</Badge>
              </div>
              <div className="preview-stat">
                <p className="text-tertiary">{t('dashboardPreview.campaign')}</p>
                <Badge variant="primary">{t('dashboardPreview.active')}</Badge>
              </div>
            </div>
          </Card>
        </section>

        <section className="marketing-final-cta">
          <h2>{t('finalCta.title')}</h2>
          <div className="cluster" style={{ justifyContent: 'center' }}>
            <Link href="/onboarding" className="btn btn-primary">
              {t('startFreeAudit')}
            </Link>
            <Link href="/login" className="btn btn-secondary">
              {t('nav.signIn')}
            </Link>
          </div>
        </section>
      </main>

      <footer className="marketing-footer">
        <div className="marketing-footer__links">
          <a href="#product">{t('footer.product')}</a>
          <a href={`${config.API_URL}/docs`} target="_blank" rel="noopener noreferrer">
            {t('footer.documentation')}
          </a>
          <span className="marketing-footer__inert" title={t('footer.notYetAvailable')}>
            {t('footer.privacy')}
          </span>
          <span className="marketing-footer__inert" title={t('footer.notYetAvailable')}>
            {t('footer.terms')}
          </span>
          <span className="marketing-footer__inert" title={t('footer.notYetAvailable')}>
            {t('footer.contact')}
          </span>
        </div>
        <p className="text-tertiary">{t('footer.copyright', { year: new Date().getFullYear() })}</p>
      </footer>
    </>
  );
}
