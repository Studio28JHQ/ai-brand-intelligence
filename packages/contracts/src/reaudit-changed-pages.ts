// "Reaudit Changed Pages Only" (F10-S04D, see docs/04_PROJECT/DECISION_LOG.md#cto-106): for each
// of a Project's known Pages, a fresh fetch of its current HTML is hash-compared against the
// stored CrawlResult from its most recent Audit — a real content-change signal, never a guess.
// Only genuinely changed pages get a new (possibly queued) Audit.
export interface ReauditChangedPageEntry {
  url: string;
  auditId: string;
}

export interface ReauditChangedPagesResult {
  checkedCount: number;
  changedPages: ReauditChangedPageEntry[];
  unchangedCount: number;
  // Couldn't fetch the page's current content right now (site unreachable) — neither "changed" nor
  // "unchanged" could be honestly determined, so no Audit was queued for it either.
  skippedCount: number;
}
