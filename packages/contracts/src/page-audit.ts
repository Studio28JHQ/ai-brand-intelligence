import type { AuditStatus } from './audit';
import type { OptimizationPriority } from './optimization-plan';

// A "Page" is a distinct, normalized URL audited within a Project — derived entirely from that
// Project's existing Audits (`AuditRequest.url`), not a new persisted concept. Every Audit today
// audits exactly one URL (see `docs/03_PRODUCT/FUTURE_ROADMAP.md`'s standing "single-page-only"
// note), so a Page is represented by that URL's most recent Audit; running the same URL again
// simply moves the Page forward to the newer Audit rather than creating a second Page.
export interface ProjectPage {
  url: string;
  latestAuditId: string;
  status: AuditStatus;
  overallScore: number | null;
  seoScore: number | null;
  aiVisibilityScore: number | null;
  lastAuditAt: string | null;
  findingsCount: number;
  priority: OptimizationPriority | null;
}
