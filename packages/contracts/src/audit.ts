import type { CrawlSummary } from './crawl';
import type { InventorySummary } from './inventory';
import type { AnalysisSummary } from './analysis';
import type { EntitySummary } from './entity';
import type { KnowledgeGraphSummary } from './knowledge-graph';
import type { AiVisibilitySummary } from './ai-visibility';
import type { OptimizationPlan } from './optimization-plan';
import type { WorkflowProgress } from './workflow-progress';
import type { WorkflowExecutionRecord } from './workflow-execution-history';
import type { Scores } from './scores';

// 'queued' means another Audit was already in flight for the Project when this one was requested
// (F10-S04D, see docs/04_PROJECT/DECISION_LOG.md#cto-106) — it will start automatically, FIFO,
// once that one finishes; it is not yet running and has no execution history of its own.
export type AuditStatus = 'queued' | 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

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
  optimizationPlan?: OptimizationPlan;
  scores?: Scores;
  progress?: WorkflowProgress[];
  executionHistory?: WorkflowExecutionRecord[];
}
