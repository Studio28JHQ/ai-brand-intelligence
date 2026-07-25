import type {
  AnalysisResult,
  CrawlResult,
  EntityResult,
  InventoryResult,
  KnowledgeGraphResult,
} from '@ai-visibility/contracts';
import { Audit } from '../../domain/audit/audit.entity';
import { DiscoveryResult } from '../../domain/audit/discovery-result';

export interface CreateAuditResult {
  audit: Audit;
  discovery: DiscoveryResult;
  crawl: CrawlResult;
  inventory: InventoryResult;
  analysis: AnalysisResult;
  entity: EntityResult;
  knowledgeGraph: KnowledgeGraphResult;
}
