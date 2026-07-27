import Link from 'next/link';
import type { ProjectPage } from '@ai-visibility/contracts';
import { Badge, EmptyState } from '../../../../components/ui';

function scoreLabel(score: number | null): string {
  return score === null ? 'Insufficient Data' : `${score}/100`;
}

export function SitePagesList({
  pages,
  selected,
  onToggleSelect,
}: {
  pages: ProjectPage[];
  selected: ReadonlySet<string>;
  onToggleSelect: (auditId: string) => void;
}) {
  if (pages.length === 0) {
    return <EmptyState title="No Pages match your search/filters" />;
  }

  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th aria-label="Select" />
            <th>URL</th>
            <th>Status</th>
            <th>Overall Score</th>
            <th>SEO Score</th>
            <th>AI Visibility Score</th>
            <th>Priority</th>
            <th>Findings</th>
          </tr>
        </thead>
        <tbody>
          {pages.map((page) => (
            <tr key={page.latestAuditId}>
              <td>
                <input
                  type="checkbox"
                  checked={selected.has(page.latestAuditId)}
                  onChange={() => onToggleSelect(page.latestAuditId)}
                  aria-label={`Select ${page.url}`}
                />
              </td>
              <td>
                <Link href={`/audits/${page.latestAuditId}`} className="text-mono">
                  {page.url}
                </Link>
              </td>
              <td>
                <Badge>{page.status}</Badge>
              </td>
              <td>{scoreLabel(page.overallScore)}</td>
              <td>{scoreLabel(page.seoScore)}</td>
              <td>{scoreLabel(page.aiVisibilityScore)}</td>
              <td>{page.priority ? <Badge>{page.priority}</Badge> : <span className="text-tertiary">None</span>}</td>
              <td>{page.findingsCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
