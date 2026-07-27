import type { AuditStatus } from './audit';
import type { OptimizationPriority } from './optimization-plan';

// Real, per-Page issue flags for the Site Explorer's issue filters (F10-S03D) — each one read
// directly from that Page's latest Audit's real Finding evidence, never inferred or guessed.
// `brokenLinks` is `null`, not `false`, for every Page today: no Analysis Rule follows outbound
// links to check their status (the Crawler only ever fetches the one audited URL), so there is
// honestly no real data to report — `null` means "not evaluated," distinct from "evaluated, no
// issue" (`false`), the same never-fabricate discipline `F10-S02B`'s scoring already established.
export interface ProjectPageIssueFlags {
  missingTitle: boolean;
  missingH1: boolean;
  thinContent: boolean;
  missingStructuredData: boolean;
  canonicalIssue: boolean;
  brokenLinks: boolean | null;
}

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
  issues: ProjectPageIssueFlags;
}
