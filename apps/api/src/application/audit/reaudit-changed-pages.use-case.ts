import { createHash } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { performCrawl } from '@ai-visibility/crawler-engine';
import type { ReauditChangedPageEntry, ReauditChangedPagesResult } from '@ai-visibility/contracts';
import { ProjectPagesQueryService } from '../page-audit/project-pages-query.service';
import { CrawlResultReadRepository } from '../../infrastructure/comparison/crawl-result-read.repository';
import { CreateAuditUseCase } from './create-audit.use-case';

const REAUDIT_CHANGED_PAGES_SOURCE = 'reaudit-changed-pages';

function hashHtml(html: string): string {
  return createHash('sha256').update(html).digest('hex');
}

// "Reaudit Changed Pages Only" (F10-S04D, see docs/04_PROJECT/DECISION_LOG.md#cto-106) — a real
// content-diff, not a blanket "re-run everything." Firing several CreateAuditUseCase.execute()
// calls concurrently for the same Project is exactly the scenario the queue (same file) exists
// for: the first genuinely runs, the rest are persisted as 'queued' and start automatically, FIFO,
// as each finishes.
@Injectable()
export class ReauditChangedPagesUseCase {
  constructor(
    private readonly projectPagesQueryService: ProjectPagesQueryService,
    private readonly crawlResultReadRepository: CrawlResultReadRepository,
    private readonly createAuditUseCase: CreateAuditUseCase,
  ) {}

  async execute(projectId: string, correlationId: string): Promise<ReauditChangedPagesResult> {
    const pages = await this.projectPagesQueryService.listByProjectId(projectId);

    let unchangedCount = 0;
    let skippedCount = 0;
    const changedPages: ReauditChangedPageEntry[] = [];

    await Promise.all(
      pages.map(async (page) => {
        const storedHtml = await this.crawlResultReadRepository.findHtmlByAuditId(page.latestAuditId);
        if (storedHtml === null) {
          // No prior successful crawl to compare against (the last Audit never got a Crawl Result)
          // — honestly can't claim "unchanged," so it genuinely needs a real Audit.
          const audit = await this.createAuditUseCase.execute(page.url, correlationId, undefined, REAUDIT_CHANGED_PAGES_SOURCE);
          changedPages.push({ url: page.url, auditId: audit.id });
          return;
        }

        const fresh = await performCrawl(page.url);
        if (!fresh.success) {
          // Couldn't reach the page right now — neither "changed" nor "unchanged" can be honestly
          // determined, so skip it rather than guess or queue an Audit that would just fail the
          // same way.
          skippedCount += 1;
          return;
        }

        if (hashHtml(fresh.html) === hashHtml(storedHtml)) {
          unchangedCount += 1;
          return;
        }

        const audit = await this.createAuditUseCase.execute(page.url, correlationId, undefined, REAUDIT_CHANGED_PAGES_SOURCE);
        changedPages.push({ url: page.url, auditId: audit.id });
      }),
    );

    return { checkedCount: pages.length, changedPages, unchangedCount, skippedCount };
  }
}
