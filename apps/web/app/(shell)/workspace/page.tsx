import Link from 'next/link';
import type { BriefingItem } from '@ai-visibility/contracts';
import { getCurrentCycle, getDailyBriefing, listClients, listProjects } from '../../actions';
import { Badge, Card, CONFIDENCE_VARIANT, EmptyState, PageHeader, statusToVariant } from '../../components/ui';
import { getTranslations } from '../../../lib/i18n/server';
import type { Translator } from '@ai-visibility/i18n';

const PRIORITY_CATEGORIES = new Set<BriefingItem['category']>(['project-attention', 'ai-visibility-regression', 'critical-finding']);
const RECOMMENDATION_CATEGORIES = new Set<BriefingItem['category']>(['high-impact-opportunity']);
const PENDING_ACTION_CATEGORIES = new Set<BriefingItem['category']>(['campaign-awaiting-verification']);
const RECENT_ACTIVITY_CATEGORIES = new Set<BriefingItem['category']>(['recent-improvement']);

const REPORT_READY_STATUSES = new Set(['verification', 'completed']);

function byCategory(items: BriefingItem[], categories: Set<BriefingItem['category']>): BriefingItem[] {
  return items.filter((item) => categories.has(item.category));
}

function BriefingCard({ item, t, tCommon }: { item: BriefingItem; t: Translator; tCommon: Translator }) {
  return (
    <Card muted>
      <div className="card__header">
        <div>
          <p className="text-secondary">
            {item.projectName} · {item.clientName}
          </p>
          <h4>{item.title}</h4>
        </div>
        <Badge variant={CONFIDENCE_VARIANT}>{tCommon(`statusValues.${item.confidence}`)}</Badge>
      </div>
      <p>{item.reason}</p>
      <p className="text-secondary">
        <strong>{t('recommendedNextAction')}</strong> {item.recommendedNextAction}
      </p>
      <Link href={`/projects/${item.projectId}/dashboard`} className="btn btn-ghost btn-sm">
        {t('openProject')}
      </Link>
    </Card>
  );
}

function BriefingSection({
  title,
  items,
  emptyDescription,
  t,
  tCommon,
}: {
  title: string;
  items: BriefingItem[];
  emptyDescription: string;
  t: Translator;
  tCommon: Translator;
}) {
  return (
    <section className="section">
      <h2 className="section__title">{title}</h2>
      {items.length === 0 && <EmptyState title={t('nothingHereRightNow')} description={emptyDescription} />}
      {items.length > 0 && (
        <div className="grid-2">
          {items.map((item) => (
            <BriefingCard key={item.id} item={item} t={t} tCommon={tCommon} />
          ))}
        </div>
      )}
    </section>
  );
}

/**
 * The Dashboard is the platform's hub screen — it answers "what happened, what needs attention,
 * what should I do next" from the already-computed AI Daily Briefing (`F7-S04`), grouped into named
 * sections instead of one flat list, with no large audit tables (`F9-S03`; the prior all-in-one
 * Client/Project/Audit management UI moved to `/clients`, `/projects`, `/audits`).
 */
export default async function DashboardPage() {
  const t = await getTranslations('dashboard');
  const tCommon = await getTranslations('common');
  const [briefing, projects, clients] = await Promise.all([getDailyBriefing(), listProjects(), listClients()]);
  const items = briefing?.items ?? [];
  const isEmptyWorkspace = projects.length === 0 && clients.length === 0;

  const cycles = await Promise.all(
    projects.map(async (project) => ({ project, cycle: await getCurrentCycle(project.id) })),
  );
  const latestReports = cycles
    .filter((entry) => entry.cycle !== null && REPORT_READY_STATUSES.has(entry.cycle.status))
    .slice(0, 3);

  return (
    <main className="page">
      <PageHeader title={t('workspaceTitle')} description={t('workspaceDescription')} />

      {isEmptyWorkspace && (
        <EmptyState
          title={t('welcomeTitle')}
          description={t('welcomeDescription')}
          action={
            <Link href="/onboarding" className="btn btn-primary btn-sm">
              {t('getStarted')}
            </Link>
          }
        />
      )}

      {!isEmptyWorkspace && (
        <>
          <BriefingSection
            title={t('priorityCards')}
            items={byCategory(items, PRIORITY_CATEGORIES)}
            emptyDescription={t('nothingNeedsAttention', { count: briefing?.projectsSummarized ?? 0 })}
            t={t}
            tCommon={tCommon}
          />
          <BriefingSection
            title={t('pendingActions')}
            items={byCategory(items, PENDING_ACTION_CATEGORIES)}
            emptyDescription={t('noCampaignsAwaitingVerification')}
            t={t}
            tCommon={tCommon}
          />
          <BriefingSection
            title={t('aiRecommendations')}
            items={byCategory(items, RECOMMENDATION_CATEGORIES)}
            emptyDescription={t('noHighImpactOpportunities')}
            t={t}
            tCommon={tCommon}
          />
          <BriefingSection
            title={t('recentActivity')}
            items={byCategory(items, RECENT_ACTIVITY_CATEGORIES)}
            emptyDescription={t('noRecentImprovements')}
            t={t}
            tCommon={tCommon}
          />

          <section className="section">
            <h2 className="section__title">{t('latestReports')}</h2>
            {latestReports.length === 0 && (
              <EmptyState title={t('noReportsYet')} description={t('noReportsDescription')} />
            )}
            {latestReports.length > 0 && (
              <div className="grid-2">
                {latestReports.map(({ project, cycle }) => (
                  <Card key={project.id} muted>
                    <div className="card__header">
                      <h4>{project.name}</h4>
                      <Badge variant={statusToVariant(cycle!.status)}>{tCommon(`statusValues.${cycle!.status}`)}</Badge>
                    </div>
                    <Link href={`/projects/${project.id}/cycles/${cycle!.id}/report`} className="btn btn-secondary btn-sm">
                      {t('viewReport')}
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
