import type { CrawlResult, DiscoveryResult, InventoryResult } from '@ai-visibility/contracts';

export interface ExtractionAnalyzerInput {
  crawlResult: CrawlResult;
  discoveryResult: DiscoveryResult;
  inventoryResult: InventoryResult;
}
