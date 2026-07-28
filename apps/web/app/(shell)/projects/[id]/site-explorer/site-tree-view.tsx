'use client';

import Link from 'next/link';
import type { ProjectPage } from '@ai-visibility/contracts';
import { Badge, statusToVariant } from '../../../../components/ui';
import { useTranslations } from '../../../../../lib/i18n/client';
import type { Translator } from '@ai-visibility/i18n';
import type { SiteTreeNode } from './site-tree';
import { countPages } from './site-tree';

function PageRow({
  page,
  selected,
  onToggleSelect,
  t,
  tCommon,
  tFindings,
}: {
  page: ProjectPage;
  selected: boolean;
  onToggleSelect: (auditId: string) => void;
  t: Translator;
  tCommon: Translator;
  tFindings: Translator;
}) {
  return (
    <div className="site-tree__row">
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onToggleSelect(page.latestAuditId)}
        aria-label={t('selectAriaLabel', { url: page.url })}
      />
      <Link href={`/audits/${page.latestAuditId}`} className="text-mono">
        {page.url}
      </Link>
      <Badge variant={statusToVariant(page.status)}>{tCommon(`statusValues.${page.status}`)}</Badge>
      <span className="text-secondary">
        {page.overallScore === null ? tFindings('insufficientData') : `${page.overallScore}/100`}
      </span>
      {page.priority && <Badge variant={statusToVariant(page.priority)}>{tCommon(`statusValues.${page.priority}`)}</Badge>}
    </div>
  );
}

function TreeNode({
  node,
  selected,
  onToggleSelect,
  t,
  tCommon,
  tFindings,
}: {
  node: SiteTreeNode;
  selected: ReadonlySet<string>;
  onToggleSelect: (auditId: string) => void;
  t: Translator;
  tCommon: Translator;
  tFindings: Translator;
}) {
  if (node.type === 'page') {
    return (
      <PageRow
        page={node.page}
        selected={selected.has(node.page.latestAuditId)}
        onToggleSelect={onToggleSelect}
        t={t}
        tCommon={tCommon}
        tFindings={tFindings}
      />
    );
  }

  return (
    <details className="site-tree__folder" open>
      <summary>
        {node.name} <span className="text-tertiary">({countPages(node)})</span>
      </summary>
      <div className="site-tree__children">
        {node.children.map((child) => (
          <TreeNode
            key={child.key}
            node={child}
            selected={selected}
            onToggleSelect={onToggleSelect}
            t={t}
            tCommon={tCommon}
            tFindings={tFindings}
          />
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
  const t = useTranslations('pages');
  const tCommon = useTranslations('common');
  const tFindings = useTranslations('findings');

  return (
    <div className="site-tree">
      <p className="site-tree__site">{siteLabel}</p>
      <div className="site-tree__children">
        {nodes.map((node) => (
          <TreeNode
            key={node.key}
            node={node}
            selected={selected}
            onToggleSelect={onToggleSelect}
            t={t}
            tCommon={tCommon}
            tFindings={tFindings}
          />
        ))}
      </div>
    </div>
  );
}
