import Link from 'next/link';
import type { ProjectPage } from '@ai-visibility/contracts';
import { Badge } from '../../../../components/ui';
import type { SiteTreeNode } from './site-tree';
import { countPages } from './site-tree';

function scoreLabel(score: number | null): string {
  return score === null ? 'Insufficient Data' : `${score}/100`;
}

function PageRow({ page, selected, onToggleSelect }: { page: ProjectPage; selected: boolean; onToggleSelect: (auditId: string) => void }) {
  return (
    <div className="site-tree__row">
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onToggleSelect(page.latestAuditId)}
        aria-label={`Select ${page.url}`}
      />
      <Link href={`/audits/${page.latestAuditId}`} className="text-mono">
        {page.url}
      </Link>
      <Badge>{page.status}</Badge>
      <span className="text-secondary">{scoreLabel(page.overallScore)}</span>
      {page.priority && <Badge>{page.priority}</Badge>}
    </div>
  );
}

function TreeNode({
  node,
  selected,
  onToggleSelect,
}: {
  node: SiteTreeNode;
  selected: ReadonlySet<string>;
  onToggleSelect: (auditId: string) => void;
}) {
  if (node.type === 'page') {
    return <PageRow page={node.page} selected={selected.has(node.page.latestAuditId)} onToggleSelect={onToggleSelect} />;
  }

  return (
    <details className="site-tree__folder" open>
      <summary>
        {node.name} <span className="text-tertiary">({countPages(node)})</span>
      </summary>
      <div className="site-tree__children">
        {node.children.map((child) => (
          <TreeNode key={child.key} node={child} selected={selected} onToggleSelect={onToggleSelect} />
        ))}
      </div>
    </details>
  );
}

export function SiteTreeView({
  siteLabel,
  nodes,
  selected,
  onToggleSelect,
}: {
  siteLabel: string;
  nodes: SiteTreeNode[];
  selected: ReadonlySet<string>;
  onToggleSelect: (auditId: string) => void;
}) {
  return (
    <div className="site-tree">
      <p className="site-tree__site">{siteLabel}</p>
      <div className="site-tree__children">
        {nodes.map((node) => (
          <TreeNode key={node.key} node={node} selected={selected} onToggleSelect={onToggleSelect} />
        ))}
      </div>
    </div>
  );
}
