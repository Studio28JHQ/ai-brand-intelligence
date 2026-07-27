import Link from 'next/link';
import type { BriefingItem } from '@ai-visibility/contracts';
import { getCurrentCycle, getDailyBriefing, listClients, listProjects } from '../../actions';
import { Badge, Card, CONFIDENCE_VARIANT, EmptyState, PageHeader } from '../../components/ui';

const PRIORITY_CATEGORIES = new Set<BriefingItem['category']>(['project-attention', 'ai-visibility-regression', 'critical-finding']);
const RECOMMENDATION_CATEGORIES = new Set<BriefingItem['category']>(['high-impact-opportunity']);
const PENDING_ACTION_CATEGORIES = new Set<BriefingItem['category']>(['campaign-awaiting-verification']);
const RECENT_ACTIVITY_CATEGORIES = new Set<BriefingItem['category']>(['recent-improvement']);

const REPORT_READY_STATUSES = new Set(['verification', 'completed']);

function byCategory(items: BriefingItem[], categories: Set<BriefingItem['category']>): BriefingItem[] {
  return items.filter((item) => categories.has(item.category));
}

function BriefingCard({ item }: { item: BriefingItem }) {
  return (
    <Card muted>
      <div className="card__header">
        <div>
          <p className="text-secondary">
            {item.projectName} · {item.clientName}
          </p>
          <h4>{item.title}</h4>
        </div>
        <Badge variant={CONFIDENCE_VARIANT}>{item.confidence}</Badge>
      </div>
      <p>{item.reason}</p>
      <p className="text-secondary">
        <strong>Recommended next action:</strong> {item.recommendedNextAction}
      </p>
      <Link href={`/projects/${item.projectId}/dashboard`} className="btn btn-ghost btn-sm">
        Open Project
      </Link>
    </Card>
  );
}

function BriefingSection({
  title,
  items,
  emptyDescription,
}: {
  title: string;
  items: BriefingItem[];
  emptyDescription: string;
}) {
  return (
    <section className="section">
      <h2 className="section__title">{title}</h2>
      {items.length === 0 && <EmptyState title="Nothing here right now" description={emptyDescription} />}
      {items.length > 0 && (
        <div className="grid-2">
          {items.map((item) => (
            <BriefingCard key={item.id} item={item} />
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
      <PageHeader title="Dashboard" description="What happened, what needs attention, and what to do next." />

      {isEmptyWorkspace && (
        <EmptyState
          title="Welcome to your workspace"
          description="New here? Our guided setup walks you through your agency, your first client, and your first AI Visibility report."
          action={
            <Link href="/onboarding" className="btn btn-primary btn-sm">
              Get Started
            </Link>
          }
        />
      )}

      {!isEmptyWorkspace && (
        <>
          <BriefingSection
            title="Priority Cards"
            items={byCategory(items, PRIORITY_CATEGORIES)}
            emptyDescription={`Nothing needs attention across ${briefing?.projectsSummarized ?? 0} active Project(s).`}
          />
          <BriefingSection
            title="Pending Actions"
            items={byCategory(items, PENDING_ACTION_CATEGORIES)}
            emptyDescription="No Campaigns are waiting on verification."
          />
          <BriefingSection
            title="AI Recommendations"
            items={byCategory(items, RECOMMENDATION_CATEGORIES)}
            emptyDescription="No high-impact opportunities identified right now."
          />
          <BriefingSection
            title="Recent Activity"
            items={byCategory(items, RECENT_ACTIVITY_CATEGORIES)}
            emptyDescription="No recently completed improvements yet."
          />

          <section className="section">
            <h2 className="section__title">Latest Reports</h2>
            {latestReports.length === 0 && (
              <EmptyState
                title="No Reports available yet"
                description="A Report becomes available once a Project's Optimization Cycle reaches verification."
              />
            )}
            {latestReports.length > 0 && (
              <div className="grid-2">
                {latestReports.map(({ project, cycle }) => (
                  <Card key={project.id} muted>
                    <div className="card__header">
                      <h4>{project.name}</h4>
                      <Badge>{cycle!.status}</Badge>
                    </div>
                    <Link href={`/projects/${project.id}/cycles/${cycle!.id}/report`} className="btn btn-secondary btn-sm">
                      View Report
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
