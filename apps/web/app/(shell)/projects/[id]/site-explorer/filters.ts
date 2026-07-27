import type { ProjectPage } from '@ai-visibility/contracts';

export type ScoreBucket = 'all' | 'high' | 'medium' | 'low' | 'insufficient';

// Every issue filter here reads a real flag ProjectPagesQueryService derived from real Finding
// evidence (packages/contracts/src/page-audit.ts). Broken Links is deliberately excluded — no
// Analysis Rule follows outbound links today, so `issues.brokenLinks` is always `null`, and a
// filter over a value that's always "not evaluated" would just be a permanently-empty no-op.
export const ISSUE_FILTER_KEYS = ['missingTitle', 'missingH1', 'thinContent', 'missingStructuredData', 'canonicalIssue'] as const;
export type IssueFilterKey = (typeof ISSUE_FILTER_KEYS)[number];

export const ISSUE_FILTER_LABELS: Record<IssueFilterKey, string> = {
  missingTitle: 'Missing Title',
  missingH1: 'Missing H1',
  thinContent: 'Thin Content',
  missingStructuredData: 'Structured Data',
  canonicalIssue: 'Canonical Issues',
};

export interface SiteExplorerFilters {
  query: string;
  status: string;
  priority: string;
  scoreBucket: ScoreBucket;
  issues: ReadonlySet<IssueFilterKey>;
}

export const DEFAULT_FILTERS: SiteExplorerFilters = {
  query: '',
  status: 'all',
  priority: 'all',
  scoreBucket: 'all',
  issues: new Set(),
};

function scoreInBucket(score: number | null, bucket: ScoreBucket): boolean {
  if (bucket === 'all') return true;
  if (bucket === 'insufficient') return score === null;
  if (score === null) return false;
  if (bucket === 'high') return score >= 80;
  if (bucket === 'medium') return score >= 50 && score < 80;
  return score < 50;
}

export function pageMatchesFilters(page: ProjectPage, filters: SiteExplorerFilters): boolean {
  if (filters.query.trim().length > 0 && !page.url.toLowerCase().includes(filters.query.trim().toLowerCase())) {
    return false;
  }
  if (filters.status !== 'all' && page.status !== filters.status) {
    return false;
  }
  if (filters.priority !== 'all' && (page.priority ?? 'none') !== filters.priority) {
    return false;
  }
  if (!scoreInBucket(page.overallScore, filters.scoreBucket)) {
    return false;
  }
  if (filters.issues.size > 0) {
    const matchesAny = [...filters.issues].some((key) => page.issues[key] === true);
    if (!matchesAny) {
      return false;
    }
  }
  return true;
}
