import type { CrawlSummary } from './crawl';
import type { InventorySummary } from './inventory';
import type { AnalysisSummary } from './analysis';
import type { EntitySummary } from './entity';
import type { KnowledgeGraphSummary } from './knowledge-graph';
import type { AiVisibilitySummary } from './ai-visibility';
import type { RecommendationSummary } from './recommendation';

export type AuditStatus = 'pending' | 'running' | 'completed';

export interface CreateAuditRequest {
  url: string;
}

export interface DiscoverySummary {
  normalizedUrl: string;
  robotsTxtDetected: boolean;
  sitemapDetected: boolean;
}

export interface CreateAuditResponse {
  id: string;
  status: AuditStatus;
  discovery?: DiscoverySummary;
  crawl?: CrawlSummary;
  inventory?: InventorySummary;
  analysis?: AnalysisSummary;
  entity?: EntitySummary;
  knowledgeGraph?: KnowledgeGraphSummary;
  aiVisibility?: AiVisibilitySummary;
  recommendation?: RecommendationSummary;
}
