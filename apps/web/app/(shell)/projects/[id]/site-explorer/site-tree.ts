import type { ProjectPage } from '@ai-visibility/contracts';

export interface SiteTreeFolder {
  type: 'folder';
  key: string;
  name: string;
  children: SiteTreeNode[];
}

export interface SiteTreePage {
  type: 'page';
  key: string;
  page: ProjectPage;
}

export type SiteTreeNode = SiteTreeFolder | SiteTreePage;

function pathSegments(url: string): string[] {
  try {
    return new URL(url).pathname.split('/').filter((segment) => segment.length > 0);
  } catch {
    return [];
  }
}

interface Entry {
  page: ProjectPage;
  segments: string[];
}

// A real folder tree derived purely from the actual audited URLs' path segments — no fabricated
// hierarchy, no sitemap crawl. A Page with no path segments (the site root) is a leaf directly
// under the Site node; every other Page nests under one folder per path segment it shares with
// its siblings.
function buildNodes(entries: ReadonlyArray<Entry>, prefix: string): SiteTreeNode[] {
  const leaves: SiteTreePage[] = [];
  const groups = new Map<string, Entry[]>();

  for (const entry of entries) {
    if (entry.segments.length === 0) {
      leaves.push({ type: 'page', key: entry.page.latestAuditId, page: entry.page });
      continue;
    }
    const [head, ...rest] = entry.segments;
    const group = groups.get(head) ?? [];
    group.push({ page: entry.page, segments: rest });
    groups.set(head, group);
  }

  const folders: SiteTreeFolder[] = [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, group]) => ({
      type: 'folder' as const,
      key: `${prefix}/${name}`,
      name,
      children: buildNodes(group, `${prefix}/${name}`),
    }));

  const sortedLeaves = [...leaves].sort((a, b) => a.page.url.localeCompare(b.page.url));
  return [...folders, ...sortedLeaves];
}

export function buildSiteTree(pages: ReadonlyArray<ProjectPage>): SiteTreeNode[] {
  const entries = pages.map((page) => ({ page, segments: pathSegments(page.url) }));
  return buildNodes(entries, '');
}

export function countPages(node: SiteTreeNode): number {
  return node.type === 'page' ? 1 : node.children.reduce((total, child) => total + countPages(child), 0);
}
